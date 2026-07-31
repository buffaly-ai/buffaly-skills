import type { DebuggerSession } from './types';

// ─── Debugger Session Management ───
// Manages chrome.debugger attach/detach lifecycle per tab.
// Patterns adapted from Buffaly's cdp_helper.js (chrome-remote-interface → chrome.debugger API).

const sessions = new Map<number, DebuggerSession>();

export async function attachDebugger(tabId: number): Promise<void> {
  if (sessions.has(tabId) && sessions.get(tabId)!.attached) {
    return; // already attached
  }

  await chrome.debugger.attach({ tabId }, '1.3');

  // Enable required CDP domains (same as cdp_helper.js openSession)
  await chrome.debugger.sendCommand({ tabId }, 'Page.enable');
  await chrome.debugger.sendCommand({ tabId }, 'Runtime.enable');
  await chrome.debugger.sendCommand({ tabId }, 'DOM.enable');
  // Input domain is always available — no enable needed (same as cdp_helper.js)

  sessions.set(tabId, {
    tabId,
    attached: true,
    attachedAt: Date.now(),
    enabledDomains: ['Page', 'Runtime', 'DOM', 'Input'],
  });
  // Start console event capture for this tab
  startConsoleListener(tabId);
}

export async function detachDebugger(tabId: number): Promise<void> {
  if (!sessions.has(tabId)) return;
  // Stop console event capture
  stopConsoleListener(tabId);
  try {
    await chrome.debugger.detach({ tabId });
  } catch (e) {
    // Tab may already be closed or debugger detached
  }
  sessions.delete(tabId);
}

export function isAttached(tabId: number): boolean {
  return sessions.has(tabId) && sessions.get(tabId)!.attached;
}

export function getAttachedTabId(): number | null {
  for (const [tabId, session] of sessions) {
    if (session.attached) return tabId;
  }
  return null;
}

export function getSession(tabId: number): DebuggerSession | null {
  return sessions.get(tabId) ?? null;
}

// ─── CDP Command Wrapper ───

export async function cdpSend(
  tabId: number,
  method: string,
  params?: Record<string, unknown>
): Promise<unknown> {
  if (!isAttached(tabId)) {
    throw new Error(`Debugger not attached to tab ${tabId}`);
  }
  return chrome.debugger.sendCommand({ tabId }, method, params ?? {});
}

// ─── Wait for Selector (adapted from cdp_helper.js waitForSelector) ───

export async function waitForSelector(
  tabId: number,
  selector: string,
  timeoutMs = 15000
): Promise<{ x: number; y: number; width: number; height: number } | null> {
  const start = Date.now();
  const expression = `(function() {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height, visible: r.width > 0 && r.height > 0 };
  })()`;

  while (Date.now() - start < timeoutMs) {
    const result = await cdpSend(tabId, 'Runtime.evaluate', {
      expression,
      returnByValue: true,
    }) as { result?: { value?: { x: number; y: number; width: number; height: number; visible: boolean } | null } };

    if (result?.result?.value && result.result.value.visible) {
      return result.result.value;
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  return null;
}

// ─── Click via CDP (adapted from cdp_helper.js handlers.click) ───

export async function clickViaDebugger(
  tabId: number,
  selector: string,
  timeoutMs = 15000
): Promise<{ clicked: boolean; selector: string; x: number; y: number }> {
  const box = await waitForSelector(tabId, selector, timeoutMs);
  if (!box) throw new Error(`Element not found: ${selector}`);

  const x = Math.round(box.x + box.width / 2);
  const y = Math.round(box.y + box.height / 2);

  // Dispatch trusted mouse events (identical pattern to cdp_helper.js)
  await cdpSend(tabId, 'Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
  await cdpSend(tabId, 'Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await cdpSend(tabId, 'Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });

  return { clicked: true, selector, x, y };
}

// ─── Click at coordinates via CDP ───

export async function clickAtCoords(
  tabId: number,
  x: number,
  y: number
): Promise<{ clicked: boolean; x: number; y: number }> {
  await cdpSend(tabId, 'Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
  await cdpSend(tabId, 'Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await cdpSend(tabId, 'Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
  return { clicked: true, x, y };
}

// ─── Type via CDP (adapted from cdp_helper.js handlers.type) ───

export async function typeViaDebugger(
  tabId: number,
  selector: string,
  text: string,
  clearFirst = true,
  timeoutMs = 15000
): Promise<{ typed: boolean; selector: string; length: number }> {
  const box = await waitForSelector(tabId, selector, timeoutMs);
  if (!box) throw new Error(`Element not found: ${selector}`);

  const x = Math.round(box.x + box.width / 2);
  const y = Math.round(box.y + box.height / 2);

  // Click to focus (same as cdp_helper.js)
  await cdpSend(tabId, 'Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
  await cdpSend(tabId, 'Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await cdpSend(tabId, 'Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });

  // Clear if requested (same as cdp_helper.js)
  if (clearFirst) {
    await cdpSend(tabId, 'Input.dispatchKeyEvent', { type: 'keyDown', key: 'a', modifiers: 2 }); // Ctrl+A
    await cdpSend(tabId, 'Input.dispatchKeyEvent', { type: 'keyDown', key: 'Backspace' });
    await cdpSend(tabId, 'Input.dispatchKeyEvent', { type: 'keyUp', key: 'Backspace' });
  }

  // Type text using trusted input (same as cdp_helper.js)
  await cdpSend(tabId, 'Input.insertText', { text });

  return { typed: true, selector, length: text.length };
}

// ─── Press Key via CDP (adapted from cdp_helper.js handlers.pressKey) ───

export async function pressKeyViaDebugger(
  tabId: number,
  key: string,
  modifiers = 0
): Promise<{ pressed: boolean; key: string }> {
  await cdpSend(tabId, 'Input.dispatchKeyEvent', { type: 'keyDown', key, modifiers });
  await cdpSend(tabId, 'Input.dispatchKeyEvent', { type: 'keyUp', key, modifiers });
  return { pressed: true, key };
}

// ─── Scroll via CDP (adapted from cdp_helper.js handlers.scroll) ───

export async function scrollViaDebugger(
  tabId: number,
  x = 0,
  y = 0
): Promise<{ scrolled: boolean; x: number; y: number }> {
  await cdpSend(tabId, 'Runtime.evaluate', {
    expression: `window.scrollBy(${x}, ${y})`,
  });

  const result = await cdpSend(tabId, 'Runtime.evaluate', {
    expression: 'JSON.stringify({ x: window.scrollX, y: window.scrollY })',
    returnByValue: true,
  }) as { result?: { value?: string } };

  let scrollX = 0;
  let scrollY = 0;
  try {
    const pos = JSON.parse(result?.result?.value ?? '{}');
    scrollX = pos.x ?? 0;
    scrollY = pos.y ?? 0;
  } catch {
    // ignore
  }

  return { scrolled: true, x: scrollX, y: scrollY };
}

// ─── Navigate via CDP (adapted from cdp_helper.js handlers.navigate) ───

export async function navigateViaDebugger(
  tabId: number,
  url: string
): Promise<{ url: string; title: string; status: string }> {
  // Listen for load event
  const loadPromise = new Promise<void>((resolve) => {
    const timeout = setTimeout(resolve, 15000);
    const handler = (source: chrome.debugger.Debuggee, method: string) => {
      if (source.tabId === tabId && method === 'Page.loadEventFired') {
        clearTimeout(timeout);
        chrome.debugger.onEvent.removeListener(handler);
        resolve();
      }
    };
    chrome.debugger.onEvent.addListener(handler);
  });

  await cdpSend(tabId, 'Page.navigate', { url });
  await loadPromise;

  const titleResult = await cdpSend(tabId, 'Runtime.evaluate', {
    expression: 'document.title',
    returnByValue: true,
  }) as { result?: { value?: string } };

  const urlResult = await cdpSend(tabId, 'Runtime.evaluate', {
    expression: 'window.location.href',
    returnByValue: true,
  }) as { result?: { value?: string } };

  return {
    url: urlResult?.result?.value ?? url,
    title: titleResult?.result?.value ?? '',
    status: 'loaded',
  };
}

// ─── Get Page Text via CDP ───

export async function getPageTextViaDebugger(
  tabId: number,
  maxLength = 10000
): Promise<string> {
  const result = await cdpSend(tabId, 'Runtime.evaluate', {
    expression: `(document.body.innerText || '').slice(0, ${maxLength})`,
    returnByValue: true,
  }) as { result?: { value?: string } };

  return result?.result?.value ?? '';
}

// ─── Find Elements via CDP ───

export async function findElementsViaDebugger(
  tabId: number,
  query: string,
  maxResults = 50
): Promise<unknown[]> {
  const expression = `(function() {
    const els = document.querySelectorAll(${JSON.stringify(query)});
    const results = [];
    for (const el of els) {
      if (results.length >= ${maxResults}) break;
      const rect = el.getBoundingClientRect();
      results.push({
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || '').trim().slice(0, 200),
        selector: '',
        bounds: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        visible: rect.width > 0 && rect.height > 0
      });
    }
    return results;
  })()`;

  const result = await cdpSend(tabId, 'Runtime.evaluate', {
    expression,
    returnByValue: true,
  }) as { result?: { value?: unknown[] } };

 return result?.result?.value ?? [];
}

// Tab close cleanup is handled in background.ts via defineBackground()
// to avoid module-level chrome API access during WXT's import phase.

// ─── Hover via CDP (adapted from cdp_helper.js handlers.hover) ───

export async function hoverViaDebugger(
  tabId: number,
  selector: string,
  timeoutMs = 15000
): Promise<{ hovered: boolean; selector: string; x: number; y: number }> {
  const box = await waitForSelector(tabId, selector, timeoutMs);
  if (!box) throw new Error(`Element not found: ${selector}`);

  const x = Math.round(box.x + box.width / 2);
  const y = Math.round(box.y + box.height / 2);

  // Dispatch mouseMoved (same as cdp_helper.js hover)
  await cdpSend(tabId, 'Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });

  return { hovered: true, selector, x, y };
}

// ─── Console Event Capture ───
// Listens to Runtime.consoleAPICalled events per tab. Events are buffered
// and can be read via getConsoleEvents. Buffer is capped at 500 events.

const consoleBuffers = new Map<number, Array<{ type: string; text: string; url?: string; line?: number; timestamp: number }>>();
const MAX_CONSOLE_EVENTS = 500;
const activeListeners = new Map<number, (source: chrome.debugger.Debuggee, method: string, params: unknown) => void>();

export function startConsoleListener(tabId: number): void {
  if (consoleBuffers.has(tabId)) return; // already listening

  consoleBuffers.set(tabId, []);

  const handler = (source: chrome.debugger.Debuggee, method: string, params: unknown) => {
    if (source.tabId !== tabId || method !== 'Runtime.consoleAPICalled') return;

    const p = params as { type: string; args: Array<{ value?: string; description?: string }>; stackTrace?: { callFrames: Array<{ url?: string; lineNumber?: number }> } };
    const text = (p.args || []).map(a => a.value ?? a.description ?? '').join(' ');
    const frame = p.stackTrace?.callFrames?.[0];

    const buffer = consoleBuffers.get(tabId);
    if (buffer) {
      buffer.push({
        type: p.type,
        text,
        url: frame?.url,
        line: frame?.lineNumber,
        timestamp: Date.now(),
      });
      // Cap buffer size
      if (buffer.length > MAX_CONSOLE_EVENTS) {
        buffer.splice(0, buffer.length - MAX_CONSOLE_EVENTS);
      }
    }
  };

  activeListeners.set(tabId, handler);
  chrome.debugger.onEvent.addListener(handler);
}

export function stopConsoleListener(tabId: number): void {
  const handler = activeListeners.get(tabId);
  if (handler) {
    chrome.debugger.onEvent.removeListener(handler);
    activeListeners.delete(tabId);
  }
  consoleBuffers.delete(tabId);
}

export function getConsoleEvents(tabId: number, maxCount = 50): Array<{ type: string; text: string; url?: string; line?: number; timestamp: number }> {
  const buffer = consoleBuffers.get(tabId) ?? [];
  return buffer.slice(-maxCount);
}

export function clearConsoleEvents(tabId: number): void {
  if (consoleBuffers.has(tabId)) {
    consoleBuffers.set(tabId, []);
  }
}
