import type { ToolResult, ToolName } from './types';
import type {
  GetPageTextArgs, GetDomSnapshotArgs, ScreenshotArgs, FindElementsArgs,
  NavigateArgs, ClickArgs, TypeTextArgs, PressKeyArgs, ScrollArgs, WaitArgs,
  OpenTabArgs, CloseTabArgs, SwitchTabArgs,
  GoBackArgs, GoForwardArgs, HoverArgs, SelectOptionArgs,
  GetAttributeArgs, CheckExistsArgs, GetViewportArgs, ConsoleEventsArgs,
} from './types';
import { validateUrl, looksLikePaymentForm } from './safety';
import {
  attachDebugger, detachDebugger, isAttached, getAttachedTabId,
  clickViaDebugger, clickAtCoords, typeViaDebugger, pressKeyViaDebugger,
  scrollViaDebugger, navigateViaDebugger,
  getPageTextViaDebugger, waitForSelector, hoverViaDebugger,
  getConsoleEvents, clearConsoleEvents,
} from './debugger-session';
import { addLogEntry, updateLogEntry } from './tool-log';

// ─── Helper: get active tab ───

async function getActiveTab(): Promise<{ tabId: number; url: string; title: string }> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) throw new Error('No active tab found');
  return { tabId: tab.id!, url: tab.url ?? '', title: tab.title ?? '' };
}

// ─── Helper: resolve tabId (use provided or active) ───

async function resolveTabId(tabId?: number): Promise<number> {
  if (tabId) return tabId;
  const active = await getActiveTab();
  return active.tabId;
}

// ─── Helper: execute function in tab via chrome.scripting ───

async function executeInTab<T>(tabId: number, func: () => T): Promise<T> {
  const results = await chrome.scripting.executeScript({
    target: { tabId },
    func,
  });
  if (!results || results.length === 0) {
    throw new Error('Script execution returned no results');
  }
  return results[0].result as T;
}

async function executeInTabWithArgs<T, A>(
  tabId: number,
  func: (arg: A) => T,
  args: A
): Promise<T> {
  const results = await chrome.scripting.executeScript({
    target: { tabId },
    func,
    args: [args],
  });
  if (!results || results.length === 0) {
    throw new Error('Script execution returned no results');
  }
  return results[0].result as T;
}

// ─── Multi-arg variant for functions needing multiple injected args ───

async function executeInTabMultiArgs<T, A extends unknown[]>(
  tabId: number,
  func: (...args: A) => T,
  args: A
): Promise<T> {
  const results = await chrome.scripting.executeScript({
    target: { tabId },
    func,
    args,
  });
  if (!results || results.length === 0) {
    throw new Error('Script execution returned no results');
  }
  return results[0].result as T;
}

// ─── Debugger Consent Enforcement ───
// The background service worker must track whether the user has explicitly
// granted consent to attach the debugger. This prevents any generic tool_call
// caller (including an external agent bridge) from requesting debugger attachment
// without a proven user gesture from the side panel.

let debuggerConsentGranted = false;
let debuggerConsentExpiresAt = 0;
const CONSENT_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

export function grantDebuggerConsent(): void {
  debuggerConsentGranted = true;
  debuggerConsentExpiresAt = Date.now() + CONSENT_TTL_MS;
}

export function revokeDebuggerConsent(): void {
  debuggerConsentGranted = false;
  debuggerConsentExpiresAt = 0;
}

export function isDebuggerConsentValid(): boolean {
  if (!debuggerConsentGranted) return false;
  if (Date.now() > debuggerConsentExpiresAt) {
    debuggerConsentGranted = false;
    return false;
  }
  return true;
}

// ─── Tool Handlers ───

async function handleGetActiveTab(): Promise<ToolResult> {
  const tab = await getActiveTab();
  return { ok: true, data: tab };
}

async function handleGetPageText(args: GetPageTextArgs): Promise<ToolResult> {
  const tabId = await resolveTabId(args.tabId);
  const maxLength = args.maxLength ?? 10000;

  // Try content script first (no debugger needed)
  try {
    const text = await executeInTabWithArgs(tabId, (ml: number) => {
      return (document.body?.innerText || '').slice(0, ml);
    }, maxLength);
    return { ok: true, data: { text, tabId } };
  } catch (reason) {
    // Fallback to debugger if content script fails
    if (isAttached(tabId)) {
      const text = await getPageTextViaDebugger(tabId, maxLength);
      return { ok: true, data: { text, tabId } };
    }
    const detail = reason instanceof Error ? reason.message : String(reason);
    throw new Error(`Cannot read page text through Chrome scripting for tab ${tabId}: ${detail}`);
  }
}

async function handleGetDomSnapshot(args: GetDomSnapshotArgs): Promise<ToolResult> {
  const tabId = await resolveTabId(args.tabId);
  const maxNodes = args.maxNodes ?? 200;

  const snapshot = await executeInTabWithArgs(tabId, (mn: number) => {
    const interactiveSelectors =
      'a, button, input, select, textarea, [role="button"], [role="link"], [role="checkbox"], [role="tab"], [tabindex], [onclick]';
    const elements = document.querySelectorAll(interactiveSelectors);
    const results: any[] = [];

    function genSelector(el: Element): string {
      if (el.id) return '#' + el.id;
      const tag = el.tagName.toLowerCase();
      const classes = Array.from(el.classList).map((c: string) => '.' + c).join('');
      if (classes) return tag + classes;
      const parent = el.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter((c) => c.tagName === el.tagName);
        const index = siblings.indexOf(el) + 1;
        return genSelector(parent) + ' > ' + tag + ':nth-of-type(' + index + ')';
      }
      return tag;
    }

    for (const el of elements) {
      if (results.length >= mn) break;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;
      results.push({
        id: 'el_' + results.length,
        tag: el.tagName.toLowerCase(),
        role: el.getAttribute('role') || '',
        name: el.getAttribute('aria-label') || '',
        text: (el.textContent || '').trim().slice(0, 100),
        selector: genSelector(el),
        bounds: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        visible: rect.width > 0 && rect.height > 0,
      });
    }
    return {
      url: window.location.href,
      title: document.title,
      elements: results,
      truncated: elements.length > mn,
    };
  }, maxNodes);

  return { ok: true, data: snapshot };
}

async function handleScreenshot(args: ScreenshotArgs): Promise<ToolResult> {
  const tabId = await resolveTabId(args.tabId);
  const fullPage = args.fullPage ?? false;

  if (fullPage) {
    return {
      ok: false,
      error: 'Bound screenshot captures the visible Chrome viewport only. Use Buffaly\'s standard screenshot capability for a full-page capture.',
      code: 'FULL_PAGE_SCREENSHOT_UNSUPPORTED',
    };
  }

  const tab = await chrome.tabs.get(tabId);
  if (!tab.active || tab.windowId === undefined) {
    return {
      ok: false,
      error: `Tab ${tabId} is not the visible tab in its Chrome window. Switch to it before taking a bound screenshot.`,
      code: 'TAB_NOT_VISIBLE',
    };
  }

  const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
  const viewport = await executeInTab(tabId, () => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));

  return {
    ok: true,
    data: { dataUrl, width: viewport.width, height: viewport.height, tabId },
  };
}

async function handleFindElements(args: FindElementsArgs): Promise<ToolResult> {
  const tabId = await resolveTabId(args.tabId);
  const query = args.query;
  const maxResults = args.maxResults ?? 50;

  const elements = await executeInTabMultiArgs(tabId, (q: string, mr: number) => {
    const els = document.querySelectorAll(q);
    const results: any[] = [];
    function genSelector(el: Element): string {
      if (el.id) return '#' + el.id;
      const tag = el.tagName.toLowerCase();
      const classes = Array.from(el.classList).map((c: string) => '.' + c).join('');
      if (classes) return tag + classes;
      return tag;
    }
    for (const el of els) {
      if (results.length >= mr) break;
      const rect = el.getBoundingClientRect();
      results.push({
        id: 'el_' + results.length,
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || '').trim().slice(0, 200),
        selector: genSelector(el),
        bounds: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        visible: rect.width > 0 && rect.height > 0,
      });
    }
    return results;
  }, [query, maxResults]);

  return { ok: true, data: { elements, query, tabId } };
}

async function handleNavigate(args: NavigateArgs): Promise<ToolResult> {
  const urlCheck = validateUrl(args.url);
  if (!urlCheck.ok) return { ok: false, error: urlCheck.error! };

  const tabId = await resolveTabId(args.tabId);

  await chrome.tabs.update(tabId, { url: args.url });

  // A tab navigation can recycle the MV3 channel. Acknowledge Chrome accepting
  // the update immediately; callers use get_active_tab separately after load
  // when they need the final URL and title.
  return { ok: true, data: { ok: true, requestedUrl: args.url, tabId } };
}

async function handleClick(args: ClickArgs): Promise<ToolResult> {
  const tabId = await resolveTabId(args.tabId);
  const useDebugger = args.useDebugger ?? false;

  // Safety: check for payment forms
  if (args.selector && looksLikePaymentForm(args.selector)) {
    return { ok: false, error: 'Payment form detected. Confirmation required for payment-related clicks.', code: 'PAYMENT_CONFIRMATION_REQUIRED' };
  }

  // If debugger is attached and useDebugger is true (or no selector but coords provided)
  if ((useDebugger || (args.x !== undefined && args.y !== undefined)) && isAttached(tabId)) {
    if (args.selector) {
      const result = await clickViaDebugger(tabId, args.selector);
      return { ok: true, data: result };
    } else if (args.x !== undefined && args.y !== undefined) {
      const result = await clickAtCoords(tabId, args.x, args.y);
      return { ok: true, data: result };
    }
  }

  // Content-script path (no debugger)
  if (args.selector) {
    const clicked = await executeInTabWithArgs(tabId, (sel: string) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      el.scrollIntoView({ block: 'center' });
      (el as HTMLElement).click();
      return true;
    }, args.selector);
    return { ok: true, data: { clicked, selector: args.selector } };
  }

  return { ok: false, error: 'Click requires either selector or x,y coordinates' };
}

async function handleTypeText(args: TypeTextArgs): Promise<ToolResult> {
  const tabId = await resolveTabId(args.tabId);
  const useDebugger = args.useDebugger ?? false;
  const clear = args.clear ?? true;

  if (!args.selector && !args.elementId) {
    return { ok: false, error: 'type_text requires selector or elementId' };
  }
  if (!args.text) {
    return { ok: false, error: 'type_text requires text' };
  }

  const selector = args.selector ?? `[data-agent-id="${args.elementId}"]`;

  // Debugger path (trusted input)
  if (useDebugger && isAttached(tabId)) {
    const result = await typeViaDebugger(tabId, selector, args.text, clear);
    return { ok: true, data: result };
  }

  // Content-script path
  const typed = await executeInTabWithArgs(tabId, (params: { sel: string; txt: string; clr: boolean }) => {
    const el = document.querySelector(params.sel) as HTMLInputElement | HTMLTextAreaElement | null;
    if (!el) return false;
    el.focus();
    if (params.clr) el.value = '';
    // Try execCommand first (preserves undo history, works for React controlled inputs)
    // Fallback to direct value assignment if execCommand fails (common in chrome.scripting context)
    if (!document.execCommand('insertText', false, params.txt)) {
      el.value = params.txt;
    }
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }, { sel: selector, txt: args.text, clr: clear });

  return { ok: true, data: { typed, selector, length: args.text.length } };
}

async function handlePressKey(args: PressKeyArgs): Promise<ToolResult> {
  const tabId = await resolveTabId(args.tabId);

  if (isAttached(tabId)) {
    const result = await pressKeyViaDebugger(tabId, args.key, args.modifiers ?? 0);
    return { ok: true, data: result };
  }

  // Content-script fallback: dispatch keyboard event
  await executeInTabWithArgs(tabId, (key: string) => {
    const ev = new KeyboardEvent('keydown', { key, bubbles: true });
    document.dispatchEvent(ev);
    const ev2 = new KeyboardEvent('keyup', { key, bubbles: true });
    document.dispatchEvent(ev2);
    return true;
  }, args.key);

  return { ok: true, data: { pressed: true, key: args.key } };
}

async function handleScroll(args: ScrollArgs): Promise<ToolResult> {
  const tabId = await resolveTabId(args.tabId);

  let scrollX = 0;
  let scrollY = 0;

  if (args.direction) {
    switch (args.direction) {
      case 'down': scrollY = 300; break;
      case 'up': scrollY = -300; break;
      case 'right': scrollX = 300; break;
      case 'left': scrollX = -300; break;
    }
  } else {
    scrollX = args.x ?? 0;
    scrollY = args.y ?? 0;
  }

  if (isAttached(tabId)) {
    const result = await scrollViaDebugger(tabId, scrollX, scrollY);
    return { ok: true, data: result };
  }

  // Content-script path
  const result = await executeInTabWithArgs(tabId, (params: { x: number; y: number }) => {
    window.scrollBy(params.x, params.y);
    return { x: window.scrollX, y: window.scrollY };
  }, { x: scrollX, y: scrollY });

  return { ok: true, data: { scrolled: true, ...result } };
}

async function handleWait(args: WaitArgs): Promise<ToolResult> {
  const tabId = await resolveTabId(args.tabId);

  if (args.ms) {
    await new Promise((r) => setTimeout(r, args.ms));
    return { ok: true, data: { waited: args.ms } };
  }

  if (args.selector) {
    const timeout = args.timeout ?? 15000;

    if (isAttached(tabId)) {
      const found = await waitForSelector(tabId, args.selector, timeout);
      if (found) {
        return { ok: true, data: { found: true, selector: args.selector } };
      }
      return { ok: false, error: `Selector not found within ${timeout}ms: ${args.selector}` };
    }

    // Content-script polling
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const found = await executeInTabWithArgs(tabId, (sel: string) => {
        const el = document.querySelector(sel);
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }, args.selector);
      if (found) {
        return { ok: true, data: { found: true, selector: args.selector } };
      }
      await new Promise((r) => setTimeout(r, 200));
    }
    return { ok: false, error: `Selector not found within ${timeout}ms: ${args.selector}` };
  }

  return { ok: false, error: 'wait requires either ms or selector' };
}

async function handleListTabs(): Promise<ToolResult> {
  const tabs = await chrome.tabs.query({});
  const tabInfos = tabs.map((t) => ({
    tabId: t.id!,
    url: t.url ?? '',
    title: t.title ?? '',
    active: t.active ?? false,
  }));
  return { ok: true, data: tabInfos };
}

async function handleOpenTab(args: OpenTabArgs): Promise<ToolResult> {
  const urlCheck = validateUrl(args.url);
  if (!urlCheck.ok) return { ok: false, error: urlCheck.error! };

  const tab = await chrome.tabs.create({ url: args.url });
  return { ok: true, data: { tabId: tab.id!, url: tab.url ?? args.url, title: tab.title ?? '' } };
}

async function handleCloseTab(args: CloseTabArgs): Promise<ToolResult> {
  // Detach debugger if attached to this tab
  if (isAttached(args.tabId)) {
    await detachDebugger(args.tabId);
  }
  await chrome.tabs.remove(args.tabId);
  return { ok: true, data: { ok: true, tabId: args.tabId } };
}

async function handleSwitchTab(args: SwitchTabArgs): Promise<ToolResult> {
  await chrome.tabs.update(args.tabId, { active: true });
  const tab = await chrome.tabs.get(args.tabId);
  // `active: true` selects a tab inside its own window but does not focus that
  // window. Bound follow-up tools resolve the current Chrome window, so focus
  // the selected tab's window before returning to preserve deterministic
  // switch -> read/click behavior when the side-panel UI is popped out.
  await chrome.windows.update(tab.windowId, { focused: true });
  return { ok: true, data: { ok: true, tabId: args.tabId, url: tab.url ?? '', title: tab.title ?? '' } };
}

async function handleAttachDebugger(args: { tabId?: number }): Promise<ToolResult> {
  // Enforce consent: debugger attach requires explicit user gesture from side panel.
  // The generic tool_call router cannot bypass this check.
  if (!isDebuggerConsentValid()) {
    return {
      ok: false,
      error: 'Debugger consent not granted. The user must click "Attach debugger" in the side panel first.',
      code: 'CONSENT_REQUIRED',
    };
  }
  const tabId = await resolveTabId(args.tabId);
  await attachDebugger(tabId);
  return { ok: true, data: { attached: true, tabId } };
}

async function handleDetachDebugger(args: { tabId?: number }): Promise<ToolResult> {
  const tabId = await resolveTabId(args.tabId);
  await detachDebugger(tabId);
  revokeDebuggerConsent();
  return { ok: true, data: { detached: true, tabId } };
}

async function handleGetStatus(): Promise<ToolResult> {
  const activeTab = await getActiveTab().catch(() => null);
  const attachedTabId = getAttachedTabId();
  return {
    ok: true,
    data: {
      debuggerAttached: attachedTabId !== null,
      debuggerTabId: attachedTabId,
      activeTab,
      lastError: null,
    },
  };
}

// ─── Gap-Fill Tool Handlers ───

async function handleGoBack(args: GoBackArgs): Promise<ToolResult> {
  const tabId = await resolveTabId(args.tabId);
  await chrome.tabs.goBack(tabId);
  // Wait briefly for navigation to start
  await new Promise((r) => setTimeout(r, 500));
  const tab = await chrome.tabs.get(tabId);
  return { ok: true, data: { ok: true, url: tab.url ?? '', title: tab.title ?? '', tabId } };
}

async function handleGoForward(args: GoForwardArgs): Promise<ToolResult> {
  const tabId = await resolveTabId(args.tabId);
  await chrome.tabs.goForward(tabId);
  await new Promise((r) => setTimeout(r, 500));
  const tab = await chrome.tabs.get(tabId);
  return { ok: true, data: { ok: true, url: tab.url ?? '', title: tab.title ?? '', tabId } };
}

async function handleHover(args: HoverArgs): Promise<ToolResult> {
  const tabId = await resolveTabId(args.tabId);

  if (isAttached(tabId)) {
    const result = await hoverViaDebugger(tabId, args.selector);
    return { ok: true, data: result };
  }

  // Content-script fallback: dispatch mouseover/mousemove events
  const hovered = await executeInTabWithArgs(tabId, (sel: string) => {
    const el = document.querySelector(sel);
    if (!el) return false;
    el.scrollIntoView({ block: 'center' });
    el.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true }));
    el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true }));
    return true;
  }, args.selector);
  return { ok: true, data: { hovered, selector: args.selector } };
}

async function handleSelectOption(args: SelectOptionArgs): Promise<ToolResult> {
  const tabId = await resolveTabId(args.tabId);

  const selected = await executeInTabMultiArgs(tabId, (sel: string, val: string) => {
    const el = document.querySelector(sel) as HTMLSelectElement | null;
    if (!el) return false;
    el.value = val;
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  }, [args.selector, args.value]);
  return { ok: true, data: { selected, selector: args.selector, value: args.value } };
}

async function handleGetAttribute(args: GetAttributeArgs): Promise<ToolResult> {
  const tabId = await resolveTabId(args.tabId);

  const value = await executeInTabMultiArgs(tabId, (sel: string, attr: string) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    return el.getAttribute(attr);
  }, [args.selector, args.attributeName]);
  return { ok: true, data: { value, selector: args.selector, attribute: args.attributeName } };
}

async function handleCheckExists(args: CheckExistsArgs): Promise<ToolResult> {
  const tabId = await resolveTabId(args.tabId);

  const count = await executeInTabWithArgs(tabId, (sel: string) => {
    return document.querySelectorAll(sel).length;
  }, args.selector);
  return { ok: true, data: { exists: count > 0, count, selector: args.selector } };
}

async function handleGetViewport(args: GetViewportArgs): Promise<ToolResult> {
  const tabId = await resolveTabId(args.tabId);

  const viewport = await executeInTab(tabId, () => {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      devicePixelRatio: window.devicePixelRatio,
    };
  });
  return { ok: true, data: viewport };
}

async function handleConsoleEvents(args: ConsoleEventsArgs): Promise<ToolResult> {
  const tabId = await resolveTabId(args.tabId);
  const maxCount = args.maxCount ?? 50;
  const clearAfterRead = args.clearAfterRead ?? false;

  if (!isAttached(tabId)) {
    return { ok: false, error: 'Debugger not attached. Call attach_debugger first to capture console events.', code: 'DEBUGGER_NOT_ATTACHED' };
  }

  const events = getConsoleEvents(tabId, maxCount);
  if (clearAfterRead) {
    clearConsoleEvents(tabId);
  }
  return { ok: true, data: { events, count: events.length } };
}

// ─── Main Tool Router ───

export async function handleToolCall(tool: string, args: Record<string, unknown>): Promise<ToolResult> {
  const logId = addLogEntry(tool, args);

  try {
    let result: ToolResult;

    switch (tool as ToolName) {
      case 'get_active_tab':
        result = await handleGetActiveTab();
        break;
      case 'get_page_text':
        result = await handleGetPageText(args as unknown as GetPageTextArgs);
        break;
      case 'get_dom_snapshot':
        result = await handleGetDomSnapshot(args as unknown as GetDomSnapshotArgs);
        break;
      case 'screenshot':
        result = await handleScreenshot(args as unknown as ScreenshotArgs);
        break;
      case 'find_elements':
        result = await handleFindElements(args as unknown as FindElementsArgs);
        break;
      case 'navigate':
        result = await handleNavigate(args as unknown as NavigateArgs);
        break;
      case 'click':
        result = await handleClick(args as unknown as ClickArgs);
        break;
      case 'type_text':
        result = await handleTypeText(args as unknown as TypeTextArgs);
        break;
      case 'press_key':
        result = await handlePressKey(args as unknown as PressKeyArgs);
        break;
      case 'scroll':
        result = await handleScroll(args as unknown as ScrollArgs);
        break;
      case 'wait':
        result = await handleWait(args as unknown as WaitArgs);
        break;
      case 'list_tabs':
        result = await handleListTabs();
        break;
      case 'open_tab':
        result = await handleOpenTab(args as unknown as OpenTabArgs);
        break;
      case 'close_tab':
        result = await handleCloseTab(args as unknown as CloseTabArgs);
        break;
      case 'switch_tab':
        result = await handleSwitchTab(args as unknown as SwitchTabArgs);
        break;
      case 'attach_debugger':
        result = await handleAttachDebugger(args);
        break;
      case 'detach_debugger':
        result = await handleDetachDebugger(args);
        break;
     case 'get_status':
       result = await handleGetStatus();
       break;
      case 'go_back':
        result = await handleGoBack(args as unknown as GoBackArgs);
        break;
      case 'go_forward':
        result = await handleGoForward(args as unknown as GoForwardArgs);
        break;
      case 'hover':
        result = await handleHover(args as unknown as HoverArgs);
        break;
      case 'select_option':
        result = await handleSelectOption(args as unknown as SelectOptionArgs);
        break;
      case 'get_attribute':
        result = await handleGetAttribute(args as unknown as GetAttributeArgs);
        break;
      case 'check_exists':
        result = await handleCheckExists(args as unknown as CheckExistsArgs);
        break;
      case 'get_viewport':
        result = await handleGetViewport(args as unknown as GetViewportArgs);
        break;
      case 'console_events':
        result = await handleConsoleEvents(args as unknown as ConsoleEventsArgs);
        break;
     default:
       result = { ok: false, error: `Unknown tool: ${tool}`, code: 'UNKNOWN_TOOL' };
    }

    updateLogEntry(logId, result);
    return result;
  } catch (err) {
    const result: ToolResult = {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      code: 'EXCEPTION',
    };
    updateLogEntry(logId, result);
    return result;
  }
}
