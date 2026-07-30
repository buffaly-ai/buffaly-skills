// ─── Tool Result ───

export type ToolResult =
  | { ok: true; data: unknown }
  | { ok: false; error: string; code?: string };

// ─── Tool Request (side panel → background) ───

export interface ToolRequest {
  type: 'tool_call';
  tool: string;
  args: Record<string, unknown>;
}

// ─── Tool Log Entry (background → side panel) ───

export interface ToolLogEntry {
  id: string;
  timestamp: number;
  tool: string;
  args: Record<string, unknown>;
  result: ToolResult | null;
  status: 'pending' | 'success' | 'error';
}

// ─── Debugger Session State ───

export interface DebuggerSession {
  tabId: number;
  attached: boolean;
  attachedAt: number;
  enabledDomains: string[];
}

// ─── Extension Status ───

export interface ExtensionStatus {
  debuggerAttached: boolean;
  debuggerTabId: number | null;
  activeTab: { tabId: number; url: string; title: string } | null;
  lastError: string | null;
}

// ─── DOM Snapshot Types ───

export interface InteractiveElement {
  id: string;
  tag: string;
  role: string;
  name: string;
  text: string;
  selector: string;
  bounds: { x: number; y: number; width: number; height: number };
  visible: boolean;
}

export interface DomSnapshot {
  url: string;
  title: string;
  elements: InteractiveElement[];
  truncated: boolean;
}

// ─── Tab Info ───

export interface TabInfo {
  tabId: number;
  url: string;
  title: string;
  active: boolean;
}

// ─── Tool Names (union for type safety) ───

export type ToolName =
  | 'get_active_tab'
  | 'get_page_text'
  | 'get_dom_snapshot'
  | 'screenshot'
  | 'find_elements'
  | 'navigate'
  | 'click'
  | 'type_text'
  | 'press_key'
  | 'scroll'
  | 'wait'
  | 'list_tabs'
  | 'open_tab'
  | 'close_tab'
  | 'switch_tab'
  | 'attach_debugger'
  | 'detach_debugger'
  | 'get_status'
  | 'go_back'
  | 'go_forward'
  | 'hover'
  | 'select_option'
  | 'get_attribute'
  | 'check_exists'
  | 'get_viewport'
  | 'console_events';

// ─── Tool Argument Interfaces ───

export interface GetPageTextArgs {
  tabId?: number;
  maxLength?: number;
}

export interface GetDomSnapshotArgs {
  tabId?: number;
  maxNodes?: number;
}

export interface ScreenshotArgs {
  tabId?: number;
  fullPage?: boolean;
}

export interface FindElementsArgs {
  query: string;
  tabId?: number;
  maxResults?: number;
}

export interface NavigateArgs {
  url: string;
  tabId?: number;
}

export interface ClickArgs {
  selector?: string;
  x?: number;
  y?: number;
  elementId?: string;
  tabId?: number;
  useDebugger?: boolean;
}

export interface TypeTextArgs {
  selector?: string;
  elementId?: string;
  text: string;
  clear?: boolean;
  tabId?: number;
  useDebugger?: boolean;
}

export interface PressKeyArgs {
  key: string;
  modifiers?: number;
  tabId?: number;
}

export interface ScrollArgs {
  direction?: 'up' | 'down' | 'left' | 'right';
  y?: number;
  x?: number;
  selector?: string;
  tabId?: number;
}

export interface WaitArgs {
  ms?: number;
  selector?: string;
  timeout?: number;
  tabId?: number;
}

export interface OpenTabArgs {
  url: string;
}

export interface CloseTabArgs {
  tabId: number;
}

export interface SwitchTabArgs {
  tabId: number;
}

// ─── Gap-Fill Tool Argument Interfaces ───

export interface GoBackArgs {
  tabId?: number;
}

export interface GoForwardArgs {
  tabId?: number;
}

export interface HoverArgs {
  selector: string;
  tabId?: number;
}

export interface SelectOptionArgs {
  selector: string;
  value: string;
  tabId?: number;
}

export interface GetAttributeArgs {
  selector: string;
  attributeName: string;
  tabId?: number;
}

export interface CheckExistsArgs {
  selector: string;
  tabId?: number;
}

export interface GetViewportArgs {
  tabId?: number;
}

export interface ConsoleEventsArgs {
  tabId?: number;
  maxCount?: number;
  clearAfterRead?: boolean;
}

export interface ConsoleEvent {
  type: string;       // log, warning, error, info, debug
  text: string;
  url?: string;
  line?: number;
  timestamp: number;
}

export interface ConsoleEventsResult {
  events: ConsoleEvent[];
  count: number;
}
