const fs = require("fs");
const cmdFile = process.argv[2];
if (!cmdFile) { console.log(JSON.stringify({ ok: false, error: "No command file" })); process.exit(1); }
const cmd = JSON.parse(fs.readFileSync(cmdFile, "utf-8"));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Restart-Safe Rediscovery ───
// The service worker can suspend at any time. Each tool call is a fresh
// connect → discover → evaluate cycle. No cached WebSocket URL.

async function discoverTarget(port, maxRetries = 5) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const resp = await fetch(`http://127.0.0.1:${port}/json/list`);
      const targets = await resp.json();
      const swTarget = targets.find(t => t.type === "service_worker" && t.url.includes("background.js"));
      if (swTarget) return swTarget;
    } catch (e) {
      // fetch failed — Chrome may not be running or port wrong
    }
    if (attempt < maxRetries - 1) await sleep(1000);
  }
  return null;
}

async function connectAndCall(wsUrl, tool, args, maxToolRetries = 3) {
  const ws = new WebSocket(wsUrl);
  let msgId = 1;
  const pending = new Map();

  ws.addEventListener("message", (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(JSON.stringify(msg.error)));
      else resolve(msg.result);
    }
  });

  function send(method, params) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  // Wait for WebSocket open (5s timeout)
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve);
    setTimeout(() => reject(new Error("WebSocket open timeout")), 5000);
  });

  await send("Runtime.enable", {});

  // Verify __callTool exists, retry if SW just restarted
  for (let attempt = 0; attempt < maxToolRetries; attempt++) {
    const check = await send("Runtime.evaluate", {
      expression: `typeof self.__callTool`,
      returnByValue: true,
    });
    if (check.result && check.result.value === "function") break;
    if (attempt < maxToolRetries - 1) {
      await sleep(500); // SW just restarted, defineBackground() is re-running
    } else {
      ws.close();
      throw new Error("__callTool not exposed (service worker may have failed to initialize)");
    }
  }

  const result = await send("Runtime.evaluate", {
    expression: `(async () => {
      try {
        const r = await self.__callTool(${JSON.stringify(tool)}, ${JSON.stringify(args || {})});
        return JSON.stringify(r);
      } catch (e) { return JSON.stringify({ ok: false, error: e.message }); }
    })()`,
    awaitPromise: true,
    returnByValue: true,
  });

  ws.close();
  return result.result.value;
}

async function main() {
  // Step 1: Discover the service worker target (fresh each call)
  const swTarget = await discoverTarget(cmd.port, 5);
  if (!swTarget) {
    console.log(JSON.stringify({ ok: false, error: "Extension service worker not found on port " + cmd.port + " (is Chrome running with --remote-debugging-port and the extension loaded?)" }));
    process.exit(1);
  }

  // Step 2: Connect and call the tool (with retry for SW restart race)
  try {
    const result = await connectAndCall(swTarget.webSocketDebuggerUrl, cmd.tool, cmd.args, 3);
    console.log(result);
    process.exit(0);
  } catch (e) {
    // Step 3: If connection failed, rediscover and retry once
    const swTarget2 = await discoverTarget(cmd.port, 3);
    if (!swTarget2 || swTarget2.webSocketDebuggerUrl === swTarget.webSocketDebuggerUrl) {
      console.log(JSON.stringify({ ok: false, error: e.message }));
      process.exit(1);
    }
    // SW restarted with a new WebSocket URL — retry
    try {
      const result = await connectAndCall(swTarget2.webSocketDebuggerUrl, cmd.tool, cmd.args, 3);
      console.log(result);
      process.exit(0);
    } catch (e2) {
      console.log(JSON.stringify({ ok: false, error: e2.message }));
      process.exit(1);
    }
  }
}
main().catch(e => { console.log(JSON.stringify({ ok: false, error: e.message })); process.exit(1); });
