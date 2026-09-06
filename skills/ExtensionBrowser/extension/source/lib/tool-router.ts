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
  scrollViaDebugger, navigateViaDebugger,
  getPageTextViaDebugger, waitForSelector, hoverViaDebugger,
  getConsoleEvents, clearConsoleEvents,
} from './debugger-session';
import { addLogEntry, updateLogEntry } from './tool-log';
import { injectedDomOperation, type InjectedDomOperationName, type InjectedDomOperationRequest, type InjectedDomOperationResult } from './injected-dom-ops';

// ─── Helper: get active tab ───

async function getActiveTab(windowId?: number): Promise<{ tabId: number; url: string; title: string }> {
  const [tab] = await chrome.tabs.query(windowId === undefined ? { active: true, currentWindow: true } : { active: true, windowId });
  if (!tab) throw new Error('No active tab found');
  return { tabId: tab.id!, url: tab.url ?? '', title: tab.title ?? '' };
}

// ─── Helper: resolve tabId (use provided or active) ───

async function resolveTabId(tabId?: number, windowId?: number): Promise<number> {
  if (tabId) return tabId;
  const active = await getActiveTab(windowId);
  return active.tabId;
}

function boundWindowId(args: Record<string, unknown>): number | undefined {
  return typeof args.__boundWindowId === 'number' && Number.isInteger(args.__boundWindowId) ? args.__boundWindowId : undefined;
}

async function bindWindowToArguments(tool: string, args: Record<string, unknown>): Promise<Record<string, unknown>> {
  const windowId = boundWindowId(args);
  if (windowId === undefined || tool === 'get_active_tab' || tool === 'list_tabs' || tool === 'open_tab' || tool === 'get_status') return args;
  if (typeof args.tabId === 'number') {
    const tab = await chrome.tabs.get(args.tabId);
    if (tab.windowId !== windowId) throw new Error(`BOUND_TAB_CONTEXT_MISMATCH: tab ${args.tabId} does not belong to window ${windowId}`);
    return args;
  }
  const active = await getActiveTab(windowId);
  return { ...args, tabId: active.tabId };
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

async function executeInjectedDomOperation(tabId: number, operation: InjectedDomOperationName, args: Record<string, unknown>): Promise<ToolResult> {
  const target = { tabId } as chrome.scripting.InjectionTarget & { frameIds?: number[]; documentIds?: string[] };
  const requestedFrameId = typeof args.frameId === 'number' && Number.isInteger(args.frameId) ? args.frameId : undefined;
  const requestedDocumentId = typeof args.documentId === 'string' && args.documentId.length > 0 ? args.documentId : undefined;
  let preflightDocumentToken: string | undefined;
  // Chrome rejects targets that specify both documentIds and frameIds. When callers provide both,
  // first prove the document belongs to the requested frame without mutation, then mutate by the
  // already-verified documentId with the document token pinned. A mismatch returns before this call.
  if (requestedDocumentId && requestedFrameId !== undefined) {
    const preflight = await executeInjectedDomScopePreflight(tabId, requestedDocumentId, requestedFrameId, typeof args.documentToken === 'string' ? args.documentToken : undefined);
    if (!preflight.ok) return preflight;
    preflightDocumentToken = isRecord(preflight.data) && typeof preflight.data.documentToken === 'string' ? preflight.data.documentToken : undefined;
    target.documentIds = [requestedDocumentId];
  } else if (requestedDocumentId) target.documentIds = [requestedDocumentId];
  else if (requestedFrameId !== undefined) target.frameIds = [requestedFrameId];

  const expectedDocumentToken = typeof args.documentToken === 'string' ? args.documentToken : preflightDocumentToken;
  const request: InjectedDomOperationRequest = { operation, args, expectedDocumentToken };
  const results = await chrome.scripting.executeScript({
    target,
    world: 'ISOLATED',
    func: injectedDomOperation,
    args: [request],
  });
  if (!results || results.length === 0) return { ok: false, error: 'Script execution returned no results', code: 'NO_SCRIPT_RESULT' };
  if (results.length > 1 && target.frameIds === undefined && target.documentIds === undefined) {
    return { ok: false, error: 'Injected DOM operation matched multiple frames. Provide frameId or documentId.', code: 'MULTIPLE_FRAMES' };
  }

  const scriptResult = results[0];
  if (requestedFrameId !== undefined && scriptResult.frameId !== requestedFrameId) {
    return { ok: false, error: `Injected frameId ${scriptResult.frameId} did not match requested frameId ${requestedFrameId}.`, code: 'FRAME_SCOPE_MISMATCH' };
  }
  if (requestedDocumentId && scriptResult.documentId !== requestedDocumentId) {
    return { ok: false, error: `Injected documentId ${scriptResult.documentId ?? ''} did not match requested documentId ${requestedDocumentId}.`, code: 'DOCUMENT_SCOPE_MISMATCH' };
  }

  const result = scriptResult.result as InjectedDomOperationResult | undefined;
  if (!result) return { ok: false, error: 'Injected DOM operation returned no result; the injected function likely threw or could not be serialized in Chrome.', code: 'NO_SCRIPT_RESULT' };
  const scope = { tabId, frameId: scriptResult.frameId, documentId: scriptResult.documentId, documentToken: result.documentToken };
  if (!result.ok) return { ok: false, error: result.error, code: result.code };
  return { ok: true, data: { ...(isRecord(result.data) ? result.data : { value: result.data }), ...scope } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function executeInjectedDomScopePreflight(tabId: number, documentId: string, frameId: number, expectedDocumentToken?: string): Promise<ToolResult> {
  const request: InjectedDomOperationRequest = { operation: 'get_scope', args: {}, expectedDocumentToken };
  const results = await chrome.scripting.executeScript({
    target: { tabId, documentIds: [documentId] } as chrome.scripting.InjectionTarget & { documentIds: string[] },
    world: 'ISOLATED',
    func: injectedDomOperation,
    args: [request],
  });
  if (!results || results.length === 0) return { ok: false, error: 'Scope preflight returned no results.', code: 'NO_SCRIPT_RESULT' };
  if (results.length > 1) return { ok: false, error: 'Scope preflight matched multiple documents.', code: 'MULTIPLE_FRAMES' };
  const scriptResult = results[0];
  if (scriptResult.frameId !== frameId) {
    return { ok: false, error: `Preflight documentId ${documentId} belongs to frameId ${scriptResult.frameId}, not requested frameId ${frameId}.`, code: 'FRAME_SCOPE_MISMATCH' };
  }
  if (scriptResult.documentId !== documentId) {
    return { ok: false, error: `Preflight documentId ${scriptResult.documentId ?? ''} did not match requested documentId ${documentId}.`, code: 'DOCUMENT_SCOPE_MISMATCH' };
  }
  const result = scriptResult.result as InjectedDomOperationResult | undefined;
  if (!result) return { ok: false, error: 'Scope preflight injected function returned no result.', code: 'NO_SCRIPT_RESULT' };
  if (!result.ok) return { ok: false, error: result.error, code: result.code };
  return { ok: true, data: { tabId, frameId: scriptResult.frameId, documentId: scriptResult.documentId, documentToken: result.documentToken } };
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

async function handleGetActiveTab(args: Record<string, unknown>): Promise<ToolResult> {
  const tab = await getActiveTab(boundWindowId(args));
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

  return executeInjectedDomOperation(tabId, 'get_dom_snapshot', { ...args, maxNodes });
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

  return executeInjectedDomOperation(tabId, 'find_elements', { ...args, query, maxResults });
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

  // Safety: check for payment forms
  if (args.selector && looksLikePaymentForm(args.selector)) {
    return { ok: false, error: 'Payment form detected. Confirmation required for payment-related clicks.', code: 'PAYMENT_CONFIRMATION_REQUIRED' };
  }

  if (args.selector || args.elementId) {
    return executeInjectedDomOperation(tabId, 'click', args as unknown as Record<string, unknown>);
  }

  if (args.x !== undefined && args.y !== undefined) {
    return { ok: false, error: 'Coordinate click requires explicit debugger path; fixed DOM click does not auto-fallback to debugger.', code: 'DEBUGGER_CLICK_UNSUPPORTED' };
  }

  return { ok: false, error: 'Click requires selector or elementId.', code: 'TARGET_REQUIRED' };
}

async function handleTypeText(args: TypeTextArgs): Promise<ToolResult> {
  const tabId = await resolveTabId(args.tabId);
  const clear = args.clear ?? true;

  if (!args.selector && !args.elementId) {
    return { ok: false, error: 'type_text requires selector or elementId', code: 'TARGET_REQUIRED' };
  }
  if (args.text === undefined) {
    return { ok: false, error: 'type_text requires text', code: 'TEXT_REQUIRED' };
  }
  return executeInjectedDomOperation(tabId, 'type_text', { ...args, clear });
}

async function handlePressKey(args: PressKeyArgs): Promise<ToolResult> {
  const tabId = await resolveTabId(args.tabId);
  return executeInjectedDomOperation(tabId, 'press_key', args as unknown as Record<string, unknown>);
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

async function handleListTabs(args: Record<string, unknown>): Promise<ToolResult> {
  const windowId = boundWindowId(args);
  const tabs = await chrome.tabs.query(windowId === undefined ? {} : { windowId });
  const tabInfos = tabs.map((t) => ({
    tabId: t.id!,
    url: t.url ?? '',
    title: t.title ?? '',
    active: t.active ?? false,
  }));
  return { ok: true, data: tabInfos };
}

async function handleOpenTab(args: OpenTabArgs & { __boundWindowId?: number }): Promise<ToolResult> {
  const urlCheck = validateUrl(args.url);
  if (!urlCheck.ok) return { ok: false, error: urlCheck.error! };

  const tab = await chrome.tabs.create({ url: args.url, windowId: args.__boundWindowId });
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

async function handleGetStatus(args: Record<string, unknown>): Promise<ToolResult> {
  const activeTab = await getActiveTab(boundWindowId(args)).catch(() => null);
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
  return executeInjectedDomOperation(tabId, 'hover', args as unknown as Record<string, unknown>);
}

async function handleSelectOption(args: SelectOptionArgs): Promise<ToolResult> {
  const tabId = await resolveTabId(args.tabId);
  return executeInjectedDomOperation(tabId, 'select_option', args as unknown as Record<string, unknown>);
}

async function handleGetAttribute(args: GetAttributeArgs): Promise<ToolResult> {
  const tabId = await resolveTabId(args.tabId);
  return executeInjectedDomOperation(tabId, 'get_attribute', args as unknown as Record<string, unknown>);
}

async function handleCheckExists(args: CheckExistsArgs): Promise<ToolResult> {
  const tabId = await resolveTabId(args.tabId);
  return executeInjectedDomOperation(tabId, 'check_exists', args as unknown as Record<string, unknown>);
}

async function handleGetViewport(args: GetViewportArgs): Promise<ToolResult> {
  const tabId = await resolveTabId(args.tabId);
  return executeInjectedDomOperation(tabId, 'get_viewport', args as unknown as Record<string, unknown>);
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
  args = await bindWindowToArguments(tool, args);
  const logId = addLogEntry(tool, args);

  try {
    let result: ToolResult;

    switch (tool as ToolName) {
      case 'get_active_tab':
        result = await handleGetActiveTab(args);
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
        result = await handleListTabs(args);
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
        result = await handleGetStatus(args);
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
