import type { ToolResult } from './types';

export const CONNECTION_STORAGE_KEY = 'BuffalyExtensionConnection';
export const CONVERSATIONS_STORAGE_KEY = 'BuffalyExtensionConversations';
export const TOOL_SCHEMA_VERSION = 1;
export const PROMPT_POLICY_REVISION = 1;

export interface ExtensionConnection {
  Origin: string;
  InstallationId: string;
  InstallationRegistrationId: string;
  InstallationCredential: string;
}

export interface ConversationBinding {
  ConversationSlotId: string;
  SessionBindingId: string;
  DisplayName: string;
  PromptPolicyRevision: number;
}

export interface ConversationBootstrap extends ConversationBinding {
  Origin: string;
  NavigationToken: string;
}

export const ACTIVE_CONVERSATION_STORAGE_KEY = 'BuffalyActiveConversationBinding';
const PENDING_COMPLETION_STORAGE_PREFIX = 'BuffalyPendingCompletion:';
const PENDING_INVOCATION_STORAGE_PREFIX = 'BuffalyPendingInvocation:';
export const BOUND_TOOL_RESULT_STORAGE_PREFIX = 'BuffalyBoundToolResult:';
const PENDING_COMPLETION_LIFETIME_MS = 45_000;

interface ToolInvocation {
  Type: 'tool_invocation';
  SchemaVersion: 1;
  SessionBindingId: string;
  InvocationId: string;
  Tool: string;
  ArgumentsJson: string;
}

interface ToolCompletion {
  Type: 'tool_completion';
  SchemaVersion: 1;
  SessionBindingId: string;
  InvocationId: string;
  Result: { Ok: boolean; DataJson: string; Error: string; Code: string };
}

interface ToolCompletionAcknowledgement {
  Type: 'tool_completion_ack';
  SchemaVersion: 1;
  SessionBindingId: string;
  InvocationId: string;
  Matched: boolean;
}

interface PendingToolCompletion {
  CreatedAtUtc: string;
  Completion: ToolCompletion;
}

interface PendingToolInvocation {
  CreatedAtUtc: string;
  Invocation: ToolInvocation;
}

export interface BoundToolInvocationIdentity {
  SessionBindingId: string;
  InvocationId: string;
}

interface PendingBoundToolResult {
  CreatedAtUtc: string;
  Result: ToolResult;
}

export function boundToolResultStorageKey(identity: BoundToolInvocationIdentity): string {
  return BOUND_TOOL_RESULT_STORAGE_PREFIX + identity.SessionBindingId + ':' + identity.InvocationId;
}

export async function loadBoundToolResult(identity: BoundToolInvocationIdentity): Promise<ToolResult | null> {
  const key = boundToolResultStorageKey(identity);
  const stored = (await chrome.storage.local.get(key))[key] as PendingBoundToolResult | undefined;
  return stored?.Result ?? null;
}

interface NavigateArguments {
  url: string;
  tabId?: number;
}

function canonicalNavigationUrl(value: string): string | null {
  try {
    const url = new URL(value);
    url.hash = '';
    if ((url.protocol === 'http:' && url.port === '80') || (url.protocol === 'https:' && url.port === '443')) url.port = '';
    if (!url.pathname) url.pathname = '/';
    return url.toString();
  } catch {
    return null;
  }
}

export function requiredOrigin(value: string): string {
  const origin = new URL(value);
  if (!['http:', 'https:'].includes(origin.protocol) || origin.pathname !== '/' || origin.search || origin.hash) {
    throw new Error('Buffaly origin must be an http or https origin without a path or query.');
  }
  return origin.origin;
}

async function readJson<T>(response: Response): Promise<T> {
  const value = await response.json();
  if (!response.ok) throw new Error(value.Message || `Buffaly request failed (${response.status}).`);
  return value as T;
}

export async function authorizeInstallation(originInput: string, existingConnection?: ExtensionConnection | null): Promise<ExtensionConnection> {
	const Origin = requiredOrigin(originInput);
	const InstallationId = existingConnection?.InstallationId || crypto.randomUUID();
  const redirectUri = chrome.identity.getRedirectURL();
  const state = crypto.randomUUID();
  const authorizeUrl = new URL('/web-modules/ExtensionBrowser/api/installations/authorize', Origin);
  authorizeUrl.searchParams.set('InstallationId', InstallationId);
  authorizeUrl.searchParams.set('ChromeExtensionId', chrome.runtime.id);
  authorizeUrl.searchParams.set('RedirectUri', redirectUri);
  authorizeUrl.searchParams.set('State', state);
  authorizeUrl.searchParams.set('ExtensionVersion', chrome.runtime.getManifest().version);
  authorizeUrl.searchParams.set('ToolSchemaVersion', String(TOOL_SCHEMA_VERSION));
  const callback = await chrome.identity.launchWebAuthFlow({ url: authorizeUrl.toString(), interactive: true });
  if (!callback) throw new Error('Buffaly authorization did not return to the extension.');
  const callbackUrl = new URL(callback);
  if (callbackUrl.origin + callbackUrl.pathname !== redirectUri || callbackUrl.searchParams.get('State') !== state) {
    throw new Error('Buffaly authorization callback identity or state did not match.');
  }
  const InstallationRegistrationId = callbackUrl.searchParams.get('InstallationRegistrationId') || '';
  const AuthorizationCode = callbackUrl.searchParams.get('AuthorizationCode') || '';
  const exchange = await readJson<{ InstallationRegistrationId: string; InstallationCredential: string }>(await fetch(new URL('/web-modules/ExtensionBrowser/api/installations/exchange', Origin), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ InstallationRegistrationId, AuthorizationCode }),
  }));
	const connection = { Origin, InstallationId, InstallationRegistrationId: exchange.InstallationRegistrationId, InstallationCredential: exchange.InstallationCredential };
	return connection;
}

export async function loadConnection(): Promise<ExtensionConnection | null> {
  const stored = await chrome.storage.local.get(CONNECTION_STORAGE_KEY);
  return (stored[CONNECTION_STORAGE_KEY] as ExtensionConnection | undefined) || null;
}

export async function createConversation(connection: ExtensionConnection, mode: 'ReuseCurrent' | 'CreateNew', slotId: string, displayName: string): Promise<ConversationBootstrap> {
  const binding = await readJson<{ SessionBindingId: string; SessionKey: string; PromptPolicyRevision: number }>(await fetch(new URL('/web-modules/ExtensionBrowser/api/session-bindings', connection.Origin), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ InstallationRegistrationId: connection.InstallationRegistrationId, InstallationCredential: connection.InstallationCredential, ConversationSlotId: slotId, Mode: mode, DisplayName: displayName }),
  }));
  const navigation = await issueNavigationToken(connection, binding.SessionBindingId);
  return { Origin: connection.Origin, ConversationSlotId: slotId, SessionBindingId: binding.SessionBindingId, DisplayName: displayName, PromptPolicyRevision: binding.PromptPolicyRevision, NavigationToken: navigation.NavigationToken };
}

export async function issueNavigationToken(connection: ExtensionConnection, sessionBindingId: string): Promise<{ NavigationToken: string }> {
  return readJson<{ NavigationToken: string }>(await fetch(new URL('/web-modules/ExtensionBrowser/api/navigation-tokens', connection.Origin), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ InstallationRegistrationId: connection.InstallationRegistrationId, InstallationCredential: connection.InstallationCredential, SessionBindingId: sessionBindingId }),
  }));
}

export function toCompletion(invocation: ToolInvocation, result: ToolResult): ToolCompletion {
  return {
    Type: 'tool_completion', SchemaVersion: 1, SessionBindingId: invocation.SessionBindingId, InvocationId: invocation.InvocationId,
    Result: result.ok
      ? { Ok: true, DataJson: JSON.stringify(result.data ?? null), Error: '', Code: '' }
      : { Ok: false, DataJson: 'null', Error: result.error, Code: result.code || '' },
  };
}

export class InstallationChannel {
  private socket: WebSocket | null = null;
  private connecting: Promise<void> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private flushingCompletions: Promise<void> | null = null;
  private resumingInvocations: Promise<void> | null = null;
  private stopped = false;

  constructor(private readonly connection: ExtensionConnection, private readonly invoke: (tool: string, args: Record<string, unknown>, identity: BoundToolInvocationIdentity) => Promise<ToolResult>) {}

  start(): Promise<void> {
    if (this.socket?.readyState === WebSocket.OPEN) return Promise.resolve();
    if (this.connecting) return this.connecting;
    this.stopped = false;
    this.connecting = this.connect().finally(() => { this.connecting = null; });
    return this.connecting;
  }

  stop(): void {
    this.stopped = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.stopHeartbeat();
    this.socket?.close();
    this.socket = null;
  }

  private async connect(): Promise<void> {
    const channelUrl = new URL('/web-modules/ExtensionBrowser/api/channel', this.connection.Origin);
    channelUrl.protocol = channelUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(channelUrl);
    this.socket = socket;
    socket.addEventListener('close', () => this.handleClose(socket));
    socket.addEventListener('message', (event) => void this.handleMessage(socket, event.data));
    await new Promise<void>((resolve, reject) => {
      socket.addEventListener('open', () => {
        socket.send(JSON.stringify({ Type: 'extension_handshake', SchemaVersion: 1, InstallationRegistrationId: this.connection.InstallationRegistrationId, InstallationCredential: this.connection.InstallationCredential }));
        this.startHeartbeat(socket);
        void this.resumePendingInvocations();
        resolve();
      }, { once: true });
      socket.addEventListener('error', () => {
        reject(new Error('Buffaly channel connection failed.'));
        socket.close();
      }, { once: true });
    });
    socket.addEventListener('error', () => socket.close());
  }

  private handleClose(socket: WebSocket): void {
    this.stopHeartbeat();
    if (this.socket === socket) this.socket = null;
    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    if (this.stopped || this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.start().catch(() => this.scheduleReconnect());
    }, 2000);
  }

  private startHeartbeat(socket: WebSocket): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.socket === socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ Type: 'channel_heartbeat', SchemaVersion: 1 }));
      }
    }, 20_000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;
  }

  private async handleMessage(socket: WebSocket, raw: unknown): Promise<void> {
    if (typeof raw !== 'string') throw new Error('Buffaly channel requires text messages.');
    const frame = JSON.parse(raw) as ToolInvocation | ToolCompletionAcknowledgement;
    if (frame.Type === 'tool_completion_ack') {
      if (frame.SchemaVersion !== 1 || !frame.Matched) throw new Error('Buffaly completion acknowledgement is invalid.');
      await chrome.storage.local.remove([
        PENDING_COMPLETION_STORAGE_PREFIX + frame.SessionBindingId + ':' + frame.InvocationId,
        PENDING_INVOCATION_STORAGE_PREFIX + frame.SessionBindingId + ':' + frame.InvocationId,
      ]);
      return;
    }
    const invocation = frame;
    if (invocation.Type !== 'tool_invocation' || invocation.SchemaVersion !== 1) throw new Error('Buffaly tool invocation contract is invalid.');
    let args: Record<string, unknown>;
    try { args = JSON.parse(invocation.ArgumentsJson) as Record<string, unknown>; }
    catch { throw new Error('Buffaly tool invocation arguments are invalid JSON.'); }
    const invocationStorageKey = PENDING_INVOCATION_STORAGE_PREFIX + invocation.SessionBindingId + ':' + invocation.InvocationId;
    const completionStorageKey = PENDING_COMPLETION_STORAGE_PREFIX + invocation.SessionBindingId + ':' + invocation.InvocationId;
    const existing = await chrome.storage.local.get([invocationStorageKey, completionStorageKey]);
    const existingCompletion = existing[completionStorageKey] as PendingToolCompletion | undefined;
    if (existingCompletion) {
      await this.deliverCompletion({ StorageKey: completionStorageKey, Completion: existingCompletion.Completion });
      return;
    }
    if (existing[invocationStorageKey]) {
      await this.resumePendingInvocations();
      return;
    }
    if (invocation.Tool === 'navigate' || invocation.Tool === 'get_active_tab') {
      await chrome.storage.local.set({ [invocationStorageKey]: { CreatedAtUtc: new Date().toISOString(), Invocation: invocation } satisfies PendingToolInvocation });
    }
    const identity = { SessionBindingId: invocation.SessionBindingId, InvocationId: invocation.InvocationId };
    const result = await this.invoke(invocation.Tool, args, identity);
    const pendingCompletion = await this.persistCompletion(invocation, result);
    await chrome.storage.local.remove(boundToolResultStorageKey(identity));
    await chrome.storage.local.remove(invocationStorageKey);
    if (this.socket === socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(pendingCompletion.Completion));
      setTimeout(() => { void this.flushPendingCompletions(); }, 1000);
    } else {
      await this.deliverCompletion(pendingCompletion);
    }
  }

  private async persistCompletion(invocation: ToolInvocation, result: ToolResult): Promise<{ StorageKey: string; Completion: ToolCompletion }> {
    const completion = toCompletion(invocation, result);
    const storageKey = PENDING_COMPLETION_STORAGE_PREFIX + invocation.SessionBindingId + ':' + invocation.InvocationId;
    await chrome.storage.local.set({ [storageKey]: { CreatedAtUtc: new Date().toISOString(), Completion: completion } satisfies PendingToolCompletion });
    return { StorageKey: storageKey, Completion: completion };
  }

  private async deliverCompletion(pending: { StorageKey: string; Completion: ToolCompletion }): Promise<void> {
    const endpoint = new URL('/web-modules/ExtensionBrowser/api/channel/completions', this.connection.Origin);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        InstallationRegistrationId: this.connection.InstallationRegistrationId,
        InstallationCredential: this.connection.InstallationCredential,
        Completion: pending.Completion,
      }),
    });
    if (!response.ok) throw new Error(`Buffaly completion delivery failed (${response.status}).`);
    const result = await response.json() as { Matched: boolean };
    if (!result.Matched) throw new Error('Buffaly completion did not match its pending invocation.');
    await chrome.storage.local.remove(pending.StorageKey);
  }

  private resumePendingInvocations(): Promise<void> {
    if (this.resumingInvocations) return this.resumingInvocations;
    this.resumingInvocations = this.resumePendingInvocationsCore().finally(() => { this.resumingInvocations = null; });
    return this.resumingInvocations;
  }

  private async resumePendingInvocationsCore(): Promise<void> {
    const stored = await chrome.storage.local.get(null);
    const pending = Object.entries(stored).filter(([key]) => key.startsWith(PENDING_INVOCATION_STORAGE_PREFIX)) as [string, PendingToolInvocation][];
    for (const [key, item] of pending) {
      if (Date.now() - Date.parse(item.CreatedAtUtc) >= PENDING_COMPLETION_LIFETIME_MS) {
        await chrome.storage.local.remove(key);
        continue;
      }
      let args: Record<string, unknown>;
      try { args = JSON.parse(item.Invocation.ArgumentsJson) as Record<string, unknown>; }
      catch { await chrome.storage.local.remove(key); continue; }
      const identity = { SessionBindingId: item.Invocation.SessionBindingId, InvocationId: item.Invocation.InvocationId };
      const resultKey = boundToolResultStorageKey(identity);
      const storedResult = await loadBoundToolResult(identity);
      const result = storedResult ?? (item.Invocation.Tool === 'navigate'
        ? await this.resumeNavigation(args as unknown as NavigateArguments)
        : await this.invoke(item.Invocation.Tool, args, identity));
      await this.persistCompletion(item.Invocation, result);
      await chrome.storage.local.remove(resultKey);
      await chrome.storage.local.remove(key);
    }
    await this.flushPendingCompletions();
  }

  private async resumeNavigation(args: NavigateArguments): Promise<ToolResult> {
    if (!args || typeof args.url !== 'string' || !args.url) {
      return { ok: false, error: 'A valid navigation URL is required.' };
    }
    const tab = args.tabId === undefined
      ? (await chrome.tabs.query({ active: true, lastFocusedWindow: true }))[0]
      : await chrome.tabs.get(args.tabId);
    const requestedUrl = canonicalNavigationUrl(args.url);
    const currentUrl = tab?.url ? canonicalNavigationUrl(tab.url) : null;
    if (tab?.id !== undefined && requestedUrl !== null && currentUrl === requestedUrl) {
      return { ok: true, data: { ok: true, requestedUrl: args.url, tabId: tab.id } };
    }
    return { ok: false, error: 'Navigation was interrupted before its completion was recorded; the browser action was not repeated.', code: 'NavigationCompletionInterrupted' };
  }

  private flushPendingCompletions(): Promise<void> {
    if (this.flushingCompletions) return this.flushingCompletions;
    this.flushingCompletions = this.flushPendingCompletionsCore().finally(() => { this.flushingCompletions = null; });
    return this.flushingCompletions;
  }

  private async flushPendingCompletionsCore(): Promise<void> {
    for (let attempt = 0; attempt < 10; attempt++) {
      const stored = await chrome.storage.local.get(null);
      const pending = Object.entries(stored).filter(([key]) => key.startsWith(PENDING_COMPLETION_STORAGE_PREFIX)) as [string, PendingToolCompletion][];
      if (pending.length === 0) return;
      for (const [key, item] of pending) {
        if (Date.now() - Date.parse(item.CreatedAtUtc) >= PENDING_COMPLETION_LIFETIME_MS) {
          await chrome.storage.local.remove(key);
          continue;
        }
        try {
          await this.deliverCompletion({ StorageKey: key, Completion: item.Completion });
        } catch {
          // Navigation can replace the worker before delivery. The persisted
          // completion is flushed by this or the replacement worker startup.
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}
