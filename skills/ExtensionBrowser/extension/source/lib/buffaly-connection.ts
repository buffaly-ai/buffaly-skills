import { boundToolResultStorageKey, type BoundToolInvocationIdentity, type ExtensionBrowserInstanceRecord, type ToolResult } from './types';

export const CONNECTION_STORAGE_KEY = 'BuffalyExtensionConnection';
export const CONVERSATIONS_STORAGE_KEY = 'BuffalyExtensionConversations';
export const TOOL_SCHEMA_VERSION = 1;

export interface ExtensionConnection {
  Origin: string;
  InstallationId: string;
  InstallationRegistrationId: string;
  InstallationCredential: string;
}

export interface ConversationBase {
  InstallationRegistrationId: string;
  BrowserContextId: string;
  DisplayName: string;
  PromptPolicyRevision: number;
}

export interface DurableConversation extends ConversationBase {
  Kind?: 'durable';
  SessionKey: string;
  DateCreatedUtc?: string;
  UpdatedUtc?: string;
  LastFinalMessageUtc?: string;
  MessageCount?: number;
  IsRunning?: boolean;
}

export interface LegacyConversationBinding extends ConversationBase {
  Kind?: 'legacy';
  ConversationSlotId: string;
  SessionBindingId: string;
}

export type SavedConversation = DurableConversation | LegacyConversationBinding;
export type ConversationBinding = SavedConversation;
export type ConversationBootstrap = (DurableConversation | LegacyConversationBinding) & { Origin: string };
export interface LegacyConversationMigrationResult { SessionKey: string; InstallationRegistrationId: string; DisplayName: string; PromptPolicyRevision: number }
export interface ExtensionBrowserConversationSummary extends LegacyConversationMigrationResult { DateCreatedUtc: string; UpdatedUtc: string; LastFinalMessageUtc: string; MessageCount: number; IsRunning: boolean }

export function isLegacyConversation(binding: ConversationBinding | null | undefined): binding is LegacyConversationBinding {
  return Boolean(binding && 'SessionBindingId' in binding && typeof binding.SessionBindingId === 'string' && binding.SessionBindingId.length > 0);
}

export function isDurableConversation(binding: ConversationBinding | null | undefined): binding is DurableConversation {
  return Boolean(binding && 'SessionKey' in binding && typeof binding.SessionKey === 'string' && binding.SessionKey.length > 0);
}

export function conversationSessionKey(binding: ConversationBinding | null | undefined): string {
  return isDurableConversation(binding) ? binding.SessionKey : '';
}

export function conversationStorageIdentity(binding: ConversationBinding | null | undefined): string {
  if (!binding) return '';
  return isDurableConversation(binding) ? binding.SessionKey : (isLegacyConversation(binding) ? binding.SessionBindingId : '');
}

export function conversationSelectionId(binding: ConversationBinding | null | undefined): string {
  if (!binding) return '';
  return isDurableConversation(binding) ? `session:${binding.SessionKey}` : (isLegacyConversation(binding) ? `legacy:${binding.SessionBindingId}` : '');
}

export function conversationFromBootstrap(bootstrap: ConversationBootstrap): ConversationBinding {
  if (isLegacyConversation(bootstrap)) {
    return { Kind: 'legacy', ConversationSlotId: bootstrap.ConversationSlotId, SessionBindingId: bootstrap.SessionBindingId, InstallationRegistrationId: bootstrap.InstallationRegistrationId, BrowserContextId: bootstrap.BrowserContextId, DisplayName: bootstrap.DisplayName, PromptPolicyRevision: bootstrap.PromptPolicyRevision };
  }
  return { Kind: 'durable', SessionKey: bootstrap.SessionKey, InstallationRegistrationId: bootstrap.InstallationRegistrationId, BrowserContextId: bootstrap.BrowserContextId, DisplayName: bootstrap.DisplayName, PromptPolicyRevision: bootstrap.PromptPolicyRevision };
}

export const ACTIVE_CONVERSATION_STORAGE_KEY = 'BuffalyActiveConversationBinding';
const PENDING_COMPLETION_STORAGE_PREFIX = 'BuffalyPendingCompletion:';
const PENDING_INVOCATION_STORAGE_PREFIX = 'BuffalyPendingInvocation:';
const PENDING_COMPLETION_LIFETIME_MS = 45_000;

interface ToolInvocation {
  Type: 'tool_invocation';
  SchemaVersion: 1;
  SessionBindingId: string;
  RoutingMode?: string;
  RoutingKey?: string;
  BrowserContextId: string;
  InvocationId: string;
  Tool: string;
  ArgumentsJson: string;
}

interface ToolCompletion {
  Type: 'tool_completion';
  SchemaVersion: 1;
  SessionBindingId: string;
  RoutingMode?: string;
  RoutingKey?: string;
  InvocationId: string;
  Result: { Ok: boolean; DataJson: string; Error: string; Code: string };
}

interface ToolCompletionAcknowledgement {
  Type: 'tool_completion_ack';
  SchemaVersion: 1;
  SessionBindingId: string;
  RoutingMode?: string;
  RoutingKey?: string;
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

export interface BrowserContextSnapshot {
  BrowserContextId: string;
  WindowId: number;
  PanelInstanceId: string;
  State: 'Ready';
  ObservedUtc: string;
}

interface PendingBoundToolResult {
  CreatedAtUtc: string;
  Result: ToolResult;
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


export async function listBrowserInstances(connection: ExtensionConnection): Promise<ExtensionBrowserInstanceRecord[]> {
  return readJson<ExtensionBrowserInstanceRecord[]>(await fetch(new URL('/web-modules/ExtensionBrowser/api/instances', connection.Origin), { cache: 'no-store' }));
}

export async function listDurableConversations(connection: ExtensionConnection): Promise<DurableConversation[]> {
  const conversations = await readJson<ExtensionBrowserConversationSummary[]>(await fetch(new URL('/web-modules/ExtensionBrowser/api/conversations/list', connection.Origin), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ InstallationRegistrationId: connection.InstallationRegistrationId, InstallationCredential: connection.InstallationCredential }),
  }));
  return conversations.map((item) => ({ Kind: 'durable', SessionKey: item.SessionKey, InstallationRegistrationId: item.InstallationRegistrationId, BrowserContextId: '', DisplayName: item.DisplayName, PromptPolicyRevision: item.PromptPolicyRevision, DateCreatedUtc: item.DateCreatedUtc, UpdatedUtc: item.UpdatedUtc, LastFinalMessageUtc: item.LastFinalMessageUtc, MessageCount: item.MessageCount, IsRunning: item.IsRunning }));
}

export async function migrateLegacyConversation(connection: ExtensionConnection, SessionBindingId: string): Promise<DurableConversation> {
  const migrated = await readJson<LegacyConversationMigrationResult>(await fetch(new URL('/web-modules/ExtensionBrowser/api/migrations/session-binding', connection.Origin), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ InstallationRegistrationId: connection.InstallationRegistrationId, InstallationCredential: connection.InstallationCredential, SessionBindingId }),
  }));
  if (!migrated.SessionKey) throw new Error('Legacy migration did not return an authoritative SessionKey.');
  return { Kind: 'durable', SessionKey: migrated.SessionKey, InstallationRegistrationId: migrated.InstallationRegistrationId, BrowserContextId: '', DisplayName: migrated.DisplayName, PromptPolicyRevision: migrated.PromptPolicyRevision };
}

export async function createDurableConversation(connection: ExtensionConnection, browserContextId: string, displayName: string): Promise<ConversationBootstrap> {
  const created = await readJson<{ SessionKey: string; DisplayName: string; PromptPolicyRevision: number }>(await fetch(new URL('/web-modules/ExtensionBrowser/api/conversations/create', connection.Origin), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ InstallationRegistrationId: connection.InstallationRegistrationId, InstallationCredential: connection.InstallationCredential, BrowserContextId: browserContextId, DisplayName: displayName }),
  }));
  return { Kind: 'durable', Origin: connection.Origin, SessionKey: created.SessionKey, InstallationRegistrationId: connection.InstallationRegistrationId, BrowserContextId: browserContextId, DisplayName: created.DisplayName, PromptPolicyRevision: created.PromptPolicyRevision };
}

export async function openDurableConversation(connection: ExtensionConnection, sessionKey: string, browserContextId: string): Promise<ConversationBootstrap> {
  const opened = await readJson<{ SessionKey: string; DisplayName: string; PromptPolicyRevision: number }>(await fetch(new URL('/web-modules/ExtensionBrowser/api/conversations/open', connection.Origin), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ InstallationRegistrationId: connection.InstallationRegistrationId, InstallationCredential: connection.InstallationCredential, SessionKey: sessionKey, BrowserContextId: browserContextId }),
  }));
  return { Kind: 'durable', Origin: connection.Origin, SessionKey: opened.SessionKey, InstallationRegistrationId: connection.InstallationRegistrationId, BrowserContextId: browserContextId, DisplayName: opened.DisplayName, PromptPolicyRevision: opened.PromptPolicyRevision };
}

export function toCompletion(invocation: ToolInvocation, result: ToolResult): ToolCompletion {
  return {
    Type: 'tool_completion', SchemaVersion: 1, SessionBindingId: invocation.SessionBindingId, RoutingMode: invocation.RoutingMode, RoutingKey: invocation.RoutingKey, InvocationId: invocation.InvocationId,
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
  private reconnectDelayMs = 2_000;
  private static readonly MAX_RECONNECT_DELAY_MS = 60_000;

  constructor(private readonly connection: ExtensionConnection, private readonly invoke: (tool: string, args: Record<string, unknown>, identity: BoundToolInvocationIdentity) => Promise<ToolResult>, private readonly onConnected: () => void = () => {}) {}

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

  publishBrowserContexts(contexts: BrowserContextSnapshot[]): void {
    if (this.socket?.readyState !== WebSocket.OPEN) return;
    this.socket.send(JSON.stringify({ Type: 'browser_context_snapshot', SchemaVersion: 1, Contexts: contexts }));
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
        this.reconnectDelayMs = 2_000;
        socket.send(JSON.stringify({ Type: 'extension_handshake', SchemaVersion: 1, InstallationRegistrationId: this.connection.InstallationRegistrationId, InstallationCredential: this.connection.InstallationCredential }));
        queueMicrotask(this.onConnected);
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
    const delayMs = this.reconnectDelayMs;
    this.reconnectDelayMs = Math.min(this.reconnectDelayMs * 2, InstallationChannel.MAX_RECONNECT_DELAY_MS);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.start().catch(() => this.scheduleReconnect());
    }, delayMs);
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
        PENDING_COMPLETION_STORAGE_PREFIX + (frame.RoutingKey || frame.SessionBindingId) + ':' + frame.InvocationId,
        PENDING_INVOCATION_STORAGE_PREFIX + (frame.RoutingKey || frame.SessionBindingId) + ':' + frame.InvocationId,
      ]);
      return;
    }
    const invocation = frame;
    if (invocation.Type !== 'tool_invocation' || invocation.SchemaVersion !== 1) throw new Error('Buffaly tool invocation contract is invalid.');
    let args: Record<string, unknown>;
    try { args = JSON.parse(invocation.ArgumentsJson) as Record<string, unknown>; }
    catch { throw new Error('Buffaly tool invocation arguments are invalid JSON.'); }
    const invocationStorageKey = PENDING_INVOCATION_STORAGE_PREFIX + (invocation.RoutingKey || invocation.SessionBindingId) + ':' + invocation.InvocationId;
    const completionStorageKey = PENDING_COMPLETION_STORAGE_PREFIX + (invocation.RoutingKey || invocation.SessionBindingId) + ':' + invocation.InvocationId;
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
    const identity = { SessionBindingId: invocation.SessionBindingId, RoutingKey: invocation.RoutingKey, BrowserContextId: invocation.BrowserContextId, InvocationId: invocation.InvocationId };
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
    const storageKey = PENDING_COMPLETION_STORAGE_PREFIX + (invocation.RoutingKey || invocation.SessionBindingId) + ':' + invocation.InvocationId;
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
      const identity = { SessionBindingId: item.Invocation.SessionBindingId, RoutingKey: item.Invocation.RoutingKey, BrowserContextId: item.Invocation.BrowserContextId, InvocationId: item.Invocation.InvocationId };
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
