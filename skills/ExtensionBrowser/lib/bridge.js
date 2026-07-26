"use strict";
const http = require("http");

// --- Config ---
const BRIDGE_PORT = parseInt(process.argv[3] || "8765", 10);
const CDP_PORT = parseInt(process.argv[2] || "9233", 10);

// --- State ---
let cdpWs = null;
let swWsUrl = null;
let cdpMsgId = 1;
const cdpPending = new Map();
let connected = false;
let connecting = false;
let reconnectTimer = null;
let mode = "none"; // "extension" | "cdp_direct"
let browserWs = null;
let browserWsUrl = null;
let activeTabSessionId = null;
let activeTabTargetId = null;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// --- CDP Connection Management ---

async function discoverSwTarget(port) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const resp = await fetch(`http://127.0.0.1:${port}/json/list`);
      const targets = await resp.json();
      const sw = targets.find(t => t.type === "service_worker" && t.url.includes("background.js"));
      if (!sw) {
        // WXT may name the SW file service_worker.js instead of background.js
        const swAlt = targets.find(t => t.type === "service_worker" && t.url.includes("service_worker.js"));
        if (swAlt) return swAlt;
      }
      if (sw) return sw;
      // Fallback: any service_worker target associated with an extension
      const swAny = targets.find(t => t.type === "service_worker" && t.url.startsWith("chrome-extension://"));
      if (swAny) return swAny;
    } catch (e) { /* Chrome not ready */ }
    if (attempt < 4) await sleep(1000);
  }
  // Last resort: use browser-level CDP Target.getTargets to find suspended SW
  // and attach to wake it up, then retry /json/list
  try {
    const browserOk = await connectToBrowser();
    if (browserOk) {
      const result = await browserSend("Target.getTargets", {});
      const allTargets = result.targetInfos || result.targets || [];
      const swTarget = allTargets.find(t => t.type === "service_worker" && t.url.startsWith("chrome-extension://"));
      if (swTarget) {
        console.log(`[bridge] Found suspended SW via Target.getTargets: ${swTarget.url}`);
        // Attach to wake it up
        await browserSend("Target.attachToTarget", { targetId: swTarget.targetId, flatten: true });
        // Wait for SW to initialize
        await sleep(2000);
        // Retry /json/list to get the WebSocket URL
        for (let retry = 0; retry < 5; retry++) {
          try {
            const resp = await fetch(`http://127.0.0.1:${port}/json/list`);
            const targets = await resp.json();
            const sw = targets.find(t => t.type === "service_worker" && t.url.startsWith("chrome-extension://"));
            if (sw) return sw;
          } catch (e) {}
          if (retry < 4) await sleep(1000);
        }
      }
    }
  } catch (e) {
    console.log("[bridge] Browser-level SW discovery failed:", e.message);
  }
  return null;
}

// --- Browser-Level CDP (for CDP direct mode) ---

async function discoverBrowserWsUrl(port) {
  try {
    const resp = await fetch(`http://127.0.0.1:${port}/json/version`);
    const version = await resp.json();
    return version.webSocketDebuggerUrl;
  } catch (e) { return null; }
}

async function connectToBrowser() {
  if (browserWs) return true;
  const url = await discoverBrowserWsUrl(CDP_PORT);
  if (!url) return false;
  browserWsUrl = url;
  browserWs = new WebSocket(url);
  await new Promise((resolve, reject) => {
    browserWs.addEventListener("open", resolve);
    browserWs.addEventListener("error", reject);
    setTimeout(() => reject(new Error("Browser WS open timeout")), 5000);
  });
  browserWs.addEventListener("message", (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && cdpPending.has(msg.id)) {
      const { resolve, reject } = cdpPending.get(msg.id);
      cdpPending.delete(msg.id);
      if (msg.error) reject(new Error(JSON.stringify(msg.error)));
      else resolve(msg.result);
    }
  });
  browserWs.addEventListener("close", () => {
    console.log("[bridge] Browser WS closed");
    browserWs = null;
    browserWsUrl = null;
    activeTabSessionId = null;
    activeTabTargetId = null;
    if (mode === "cdp_direct") {
      connected = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(() => { connecting = false; connectToSw(); }, 2000);
    }
  });
  console.log(`[bridge] Connected to browser CDP: ${url}`);
  return true;
}

function browserSend(method, params, sessionId) {
  return new Promise((resolve, reject) => {
    const id = cdpMsgId++;
    cdpPending.set(id, { resolve, reject });
    const msg = { id, method, params: params || {} };
    if (sessionId) msg.sessionId = sessionId;
    browserWs.send(JSON.stringify(msg));
    // Timeout: reject after 10s if no response (handles stale browser CDP connection)
    setTimeout(() => {
      if (cdpPending.has(id)) {
        cdpPending.delete(id);
        reject(new Error("Browser CDP response timeout: " + method));
      }
    }, 10000);
  });
}

async function findActiveTab() {
  const result = await browserSend("Target.getTargets", {});
  const targets = result.targetInfos || result.targets || [];
  // Find a page target that is not an extension or internal page
  const page = targets.find(t => t.type === "page" && !t.url.startsWith("chrome://") && !t.url.startsWith("chrome-extension://") && !t.url.startsWith("http://extension/") && t.attached === false);
  if (!page) {
    // Fallback: any page target
    const anyPage = targets.find(t => t.type === "page" && !t.url.startsWith("chrome://") && !t.url.startsWith("chrome-extension://"));
    return anyPage || null;
  }
  return page;
}

async function ensureTabSession() {
  if (activeTabSessionId && activeTabTargetId) {
    // Verify session is still valid
    try {
      await Promise.race([
        browserSend("Runtime.evaluate", { expression: "1+1", returnByValue: true }, activeTabSessionId),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Session verify timeout")), 3000))
      ]);
      return activeTabSessionId;
    } catch (e) {
      activeTabSessionId = null;
      activeTabTargetId = null;
    }
  }
  const tab = await findActiveTab();
  if (!tab) throw new Error("No page tab found");
  const attachResult = await browserSend("Target.attachToTarget", { targetId: tab.targetId, flatten: true });
  activeTabSessionId = attachResult.sessionId;
  activeTabTargetId = tab.targetId;
  await browserSend("Runtime.enable", {}, activeTabSessionId);
  await browserSend("Page.enable", {}, activeTabSessionId);
  console.log(`[bridge] Attached to tab: ${tab.url} (sessionId=${activeTabSessionId})`);
  return activeTabSessionId;
}

// --- CDP Direct Tool Implementations ---

async function cdpDirectTool(tool, args) {
  const sid = await ensureTabSession();

  switch (tool) {
    case "get_active_tab": {
      const tab = await findActiveTab();
      if (!tab) return { ok: false, error: "No active tab" };
      const urlResult = await browserSend("Runtime.evaluate", { expression: "window.location.href", returnByValue: true }, sid);
      const titleResult = await browserSend("Runtime.evaluate", { expression: "document.title", returnByValue: true }, sid);
      return { ok: true, data: { tabId: activeTabTargetId, url: urlResult.result.value, title: titleResult.result.value } };
    }

    case "get_page_text": {
      const result = await browserSend("Runtime.evaluate", {
        expression: "document.body ? document.body.innerText.substring(0, 10000) : ''",
        returnByValue: true
      }, sid);
      return { ok: true, data: { text: result.result.value, tabId: activeTabTargetId } };
    }

    case "navigate": {
      const url = args.url;
      if (!url) return { ok: false, error: "Missing url" };
      if (url.startsWith("chrome://") || url.startsWith("chrome-extension://"))
        return { ok: false, error: "Blocked URL scheme", code: "BLOCKED_URL" };
      await browserSend("Page.navigate", { url }, sid);
      // Wait for load
      await sleep(2000);
      const urlResult = await browserSend("Runtime.evaluate", { expression: "window.location.href", returnByValue: true }, sid);
      const titleResult = await browserSend("Runtime.evaluate", { expression: "document.title", returnByValue: true }, sid);
      return { ok: true, data: { ok: true, finalUrl: urlResult.result.value, title: titleResult.result.value, tabId: activeTabTargetId } };
    }

    case "click": {
      const selector = args.selector;
      if (!selector) return { ok: false, error: "Missing selector" };
      const result = await browserSend("Runtime.evaluate", {
        expression: `(function() {
          const el = document.querySelector(${JSON.stringify(selector)});
          if (!el) return JSON.stringify({ ok: false, error: "Element not found: " + ${JSON.stringify(selector)} });
          el.click();
          return JSON.stringify({ ok: true, data: { clicked: true, selector: ${JSON.stringify(selector)} } });
        })()`,
        returnByValue: true
      }, sid);
      return JSON.parse(result.result.value);
    }

    case "type_text": {
      const selector = args.selector;
      const text = args.text;
      if (!selector || text === undefined) return { ok: false, error: "Missing selector or text" };
      const result = await browserSend("Runtime.evaluate", {
        expression: `(function() {
          const el = document.querySelector(${JSON.stringify(selector)});
          if (!el) return JSON.stringify({ ok: false, error: "Element not found: " + ${JSON.stringify(selector)} });
          el.focus();
          el.value = ${JSON.stringify(text)};
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
          return JSON.stringify({ ok: true, data: { typed: true, selector: ${JSON.stringify(selector)}, length: ${JSON.stringify(text)}.length } });
        })()`,
        returnByValue: true
      }, sid);
      return JSON.parse(result.result.value);
    }

    case "screenshot": {
      const result = await browserSend("Page.captureScreenshot", { format: "png" }, sid);
      return { ok: true, data: { dataUrl: "data:image/png;base64," + result.data, width: 0, height: 0 } };
    }

    case "list_tabs": {
      const result = await browserSend("Target.getTargets", {});
      const targets = result.targetInfos || result.targets || [];
      const tabs = targets.filter(t => t.type === "page").map(t => ({ tabId: t.targetId, url: t.url, title: t.title || "", active: t.attached }));
      return { ok: true, data: tabs };
    }

    case "get_dom_snapshot": {
      const result = await browserSend("Runtime.evaluate", {
        expression: `(function() {
          const interactive = ['a', 'button', 'input', 'select', 'textarea', '[role]', '[tabindex]'];
          const seen = new Set();
          const elements = [];
          for (const sel of interactive) {
            for (const el of document.querySelectorAll(sel)) {
              if (seen.has(el)) continue;
              seen.add(el);
              const rect = el.getBoundingClientRect();
              if (rect.width === 0 && rect.height === 0) continue;
              elements.push({
                tag: el.tagName.toLowerCase(),
                role: el.getAttribute('role') || '',
                name: el.getAttribute('name') || '',
                id: el.id || '',
                text: (el.innerText || el.value || '').substring(0, 100),
                selector: el.id ? '#' + el.id : el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : ''),
                bounds: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
                visible: rect.width > 0 && rect.height > 0
              });
            }
          }
          return JSON.stringify({ elements, title: document.title, url: window.location.href, truncated: elements.length > 200 });
        })()`,
        returnByValue: true
      }, sid);
      return { ok: true, data: JSON.parse(result.result.value) };
    }

    case "scroll": {
      const direction = args.direction || "down";
      const script = direction === "up" ? "window.scrollBy(0, -500)" : direction === "down" ? "window.scrollBy(0, 500)" : "window.scrollBy(0, " + (args.y || 500) + ")";
      await browserSend("Runtime.evaluate", { expression: script, returnByValue: true }, sid);
      return { ok: true, data: { scrolled: true, direction } };
    }

    case "get_status": {
      return { ok: true, data: { mode, debuggerAttached: false, activeTab: activeTabTargetId, swUrl: swWsUrl, browserWs: browserWsUrl } };
    }

    case "find_elements": {
      const query = args.query;
      if (!query) return { ok: false, error: "Missing query" };
      const result = await browserSend("Runtime.evaluate", {
        expression: `(function() {
          const els = document.querySelectorAll(${JSON.stringify(query)});
          const results = [];
          for (const el of els) {
            const rect = el.getBoundingClientRect();
            results.push({
              tag: el.tagName.toLowerCase(),
              text: (el.innerText || '').substring(0, 100),
              selector: el.id ? '#' + el.id : el.tagName.toLowerCase(),
              bounds: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
              visible: rect.width > 0 && rect.height > 0
            });
          }
          return JSON.stringify(results);
        })()`,
        returnByValue: true
      }, sid);
      return { ok: true, data: JSON.parse(result.result.value) };
    }

    case "open_tab": {
      const url = args.url || "about:blank";
      const result = await browserSend("Target.createTarget", { url });
      return { ok: true, data: { tabId: result.targetId, url, title: "" } };
    }

    case "close_tab": {
      const tabId = args.tabId;
      if (!tabId) return { ok: false, error: "Missing tabId" };
      await browserSend("Target.closeTarget", { targetId: tabId });
      return { ok: true, data: { ok: true } };
    }

    case "press_key": {
      const key = args.key || "Enter";
      const result = await browserSend("Runtime.evaluate", {
        expression: `(function() {
          var key = ${JSON.stringify(key)};
          var event = new KeyboardEvent('keydown', { key: key, bubbles: true });
          (document.activeElement || document).dispatchEvent(event);
          var event2 = new KeyboardEvent('keyup', { key: key, bubbles: true });
          (document.activeElement || document).dispatchEvent(event2);
          return JSON.stringify({ ok: true, data: { pressed: true, key: key } });
        })()`,
        returnByValue: true
      }, sid);
      return JSON.parse(result.result.value);
    }

    case "wait": {
      const ms = args.ms || 1000;
      await sleep(ms);
      return { ok: true, data: { waited: ms } };
    }

    default:
      return { ok: false, error: "Unknown tool: " + tool, code: "UNKNOWN_TOOL" };
  }
}

async function connectToSw(allowDirectFallback = true) {
  if (connecting || connected) return true;
  connecting = true;

  // Try extension mode first
  try {
    const swTarget = await discoverSwTarget(CDP_PORT);
    if (!swTarget) {
      if (!allowDirectFallback) {
        connected = false;
        mode = "none";
        swWsUrl = null;
        connecting = false;
        return false;
      }
      console.log(`[bridge] No SW target found on port ${CDP_PORT}, falling back to CDP direct mode`);
      // Fall back to CDP direct mode
      const browserOk = await connectToBrowser();
      if (browserOk) {
        mode = "cdp_direct";
        connected = true;
        connecting = false;
        console.log("[bridge] Operating in CDP direct mode");
        return true;
      }
      connecting = false;
      return false;
    }

    swWsUrl = swTarget.webSocketDebuggerUrl;
    cdpWs = new WebSocket(swWsUrl);

    await new Promise((resolve, reject) => {
      cdpWs.addEventListener("open", resolve);
      cdpWs.addEventListener("error", reject);
      setTimeout(() => reject(new Error("CDP WebSocket open timeout")), 5000);
    });

    cdpWs.addEventListener("message", (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && cdpPending.has(msg.id)) {
        const { resolve, reject } = cdpPending.get(msg.id);
        cdpPending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    });

    cdpWs.addEventListener("close", () => {
      console.log("[bridge] CDP WebSocket closed (SW suspended or restarted)");
      connected = false;
      cdpWs = null;
      swWsUrl = null;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(() => { connecting = false; connectToSw(false); }, 2000);
    });

    cdpWs.addEventListener("error", (err) => {
      console.error("[bridge] CDP WebSocket error:", err.message);
    });

    await cdpSend("Runtime.enable", {});

    // Verify __callTool exists (retry for SW restart race)
    for (let attempt = 0; attempt < 10; attempt++) {
      const check = await cdpSend("Runtime.evaluate", {
        expression: "typeof self.__callTool",
        returnByValue: true,
      });
      if (check.result && check.result.value === "function") break;
      if (attempt < 9) await sleep(1000);
      else {
        if (!allowDirectFallback) {
          connected = false;
          mode = "none";
          cdpWs.close();
          cdpWs = null;
          swWsUrl = null;
          connecting = false;
          return false;
        }
        console.log("[bridge] __callTool not exposed on SW, falling back to CDP direct mode");
        // Fall back to CDP direct mode
        cdpWs.close();
        cdpWs = null;
        const browserOk = await connectToBrowser();
        if (browserOk) {
          mode = "cdp_direct";
          connected = true;
          connecting = false;
          console.log("[bridge] Operating in CDP direct mode");
          return true;
        }
        connecting = false;
        return false;
      }
    }

    connected = true;
    mode = "extension";
    connecting = false;
    console.log(`[bridge] Connected to SW (extension mode): ${swWsUrl}`);
    return true;
  } catch (e) {
    if (!allowDirectFallback) {
      console.log("[bridge] Extension mode reconnect failed:", e.message);
      connected = false;
      mode = "none";
      cdpWs = null;
      swWsUrl = null;
      connecting = false;
      return false;
    }
    console.log("[bridge] Extension mode connect failed:", e.message, "— trying CDP direct mode");
    // Try CDP direct mode as fallback
    cdpWs = null;
    swWsUrl = null;
    const browserOk = await connectToBrowser();
    if (browserOk) {
      mode = "cdp_direct";
      connected = true;
      connecting = false;
      console.log("[bridge] Operating in CDP direct mode (fallback)");
      return true;
    }
    connected = false;
    connecting = false;
    return false;
  }
}

function cdpSend(method, params) {
  return new Promise((resolve, reject) => {
    if (!cdpWs || cdpWs.readyState !== WebSocket.OPEN) {
      connected = false;
      reject(new Error("Extension service worker connection is not open"));
      return;
    }
    const id = cdpMsgId++;
    cdpPending.set(id, { resolve, reject });
    cdpWs.send(JSON.stringify({ id, method, params: params || {} }));
    // Leave enough of the HTTP client's 30-second deadline for bounded rediscovery.
    setTimeout(() => {
      if (cdpPending.has(id)) {
        cdpPending.delete(id);
        reject(new Error("CDP response timeout: " + method));
      }
    }, 5000);
  });
}

async function callExtensionTool(tool, args) {
  if (!connected) {
    const ok = await connectToSw();
    if (!ok) return { ok: false, error: "Cannot connect to extension service worker or browser CDP", code: "NO_SW_CONNECTION" };
  }

  // CDP direct mode: execute tools via browser-level CDP
  if (mode === "cdp_direct") {
    try {
      return await cdpDirectTool(tool, args);
    } catch (e) {
      // Connection lost — reconnect and retry
      console.log("[bridge] CDP direct tool failed, reconnecting:", e.message);
      connected = false;
      browserWs = null;
      activeTabSessionId = null;
      activeTabTargetId = null;
      const ok = await connectToSw();
      if (ok && mode === "cdp_direct") {
        return await cdpDirectTool(tool, args);
      }
      return { ok: false, error: e.message, code: "RETRY_FAILED" };
    }
  }

  // Extension mode: call __callTool on the SW
  try {
    const result = await cdpSend("Runtime.evaluate", {
      expression: `(async () => {
        try {
          if (typeof self.__callTool !== "function") return JSON.stringify({ ok: false, error: "__callTool not exposed" });
          const r = await self.__callTool(${JSON.stringify(tool)}, ${JSON.stringify(args || {})});
          return JSON.stringify(r);
        } catch (e) { return JSON.stringify({ ok: false, error: e.message }); }
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });
    return JSON.parse(result.result.value);
  } catch (e) {
    // CDP connection lost — mark disconnected and retry once
    connected = false;
    cdpWs = null;
    swWsUrl = null;
    mode = "none";
    connecting = false;
    console.log("[bridge] Tool call failed, reconnecting:", e.message);
    const ok = await connectToSw(false);
    if (ok) {
      if (mode === "cdp_direct") {
        return await cdpDirectTool(tool, args);
      }
      const result = await cdpSend("Runtime.evaluate", {
        expression: `(async () => {
          try {
            const r = await self.__callTool(${JSON.stringify(tool)}, ${JSON.stringify(args || {})});
            return JSON.stringify(r);
          } catch (e) { return JSON.stringify({ ok: false, error: e.message }); }
        })()`,
        awaitPromise: true,
        returnByValue: true,
      });
      return JSON.parse(result.result.value);
    }
    return {
      ok: false,
      error: "Extension service worker stopped and could not be rediscovered within the recovery window.",
      code: "SW_UNAVAILABLE",
    };
  }
}

// --- HTTP Bridge Server ---

const server = http.createServer(async (req, res) => {
  // Health check
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, connected, mode, cdpPort: CDP_PORT, swUrl: swWsUrl, browserWs: browserWsUrl }));
    return;
  }

  // Tool call
  if (req.method === "POST" && req.url === "/tool") {
    let body = "";
    req.on("data", (chunk) => body += chunk);
    req.on("end", async () => {
      try {
        const { tool, args } = JSON.parse(body);
        const result = await callExtensionTool(tool, args || {});
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ ok: false, error: "Unknown endpoint" }));
});

server.listen(BRIDGE_PORT, "127.0.0.1", () => {
  console.log(`[bridge] HTTP server listening on http://127.0.0.1:${BRIDGE_PORT}`);
  console.log(`[bridge] Targeting Chrome CDP on port ${CDP_PORT}`);
  console.log(`[bridge] Endpoints: GET /health, POST /tool {tool, args}`);
  connectToSw();
});
process.on("unhandledRejection", (reason) => {
  console.error("[bridge] Unhandled rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[bridge] Uncaught exception:", err.message);
});

// --- Graceful Shutdown ---
function shutdown() {
  console.log("[bridge] Shutting down...");
  if (cdpWs) cdpWs.close();
  if (browserWs) browserWs.close();
  server.close();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
