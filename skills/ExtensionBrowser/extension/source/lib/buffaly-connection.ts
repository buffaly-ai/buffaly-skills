import type { ToolResult } from './types';

export const CONNECTION_STORAGE_KEY = 'BuffalyExtensionConnection';
export const CONVERSATIONS_STORAGE_KEY = 'BuffalyExtensionConversations';
export const TOOL_SCHEMA_VERSION = 1;

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
}

export interface ConversationBootstrap extends ConversationBinding {
  Origin: string;
  NavigationToken: string;
}

export const ACTIVE_CONVERSATION_STORAGE_KEY = 'BuffalyActiveConversationBinding';

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

function requiredOrigin(value: string): string {
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

export async function authorizeInstallation(originInput: string): Promise<ExtensionConnection> {
  const Origin = requiredOrigin(originInput);
  const stored = await chrome.storage.local.get(CONNECTION_STORAGE_KEY);
  const existing = stored[CONNECTION_STORAGE_KEY] as ExtensionConnection | undefined;
  const InstallationId = existing?.InstallationId || crypto.randomUUID();
  const redirectUri = chrome.identity.getRedirectURL();
  const state = crypto.randomUUID();
  const authorizeUrl = new URL('/api/browser-extension/installations/authorize', Origin);
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
  const exchange = await readJson<{ InstallationRegistrationId: string; InstallationCredential: string }>(await fetch(new URL('/api/browser-extension/installations/exchange', Origin), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ InstallationRegistrationId, AuthorizationCode }),
  }));
  const connection = { Origin, InstallationId, InstallationRegistrationId: exchange.InstallationRegistrationId, InstallationCredential: exchange.InstallationCredential };
  await chrome.storage.local.set({ [CONNECTION_STORAGE_KEY]: connection });
  return connection;
}

export async function loadConnection(): Promise<ExtensionConnection | null> {
  const stored = await chrome.storage.local.get(CONNECTION_STORAGE_KEY);
  return (stored[CONNECTION_STORAGE_KEY] as ExtensionConnection | undefined) || null;
}

export async function createConversation(connection: ExtensionConnection, mode: 'ReuseCurrent' | 'CreateNew', slotId: string, displayName: string): Promise<ConversationBootstrap> {
  const binding = await readJson<{ SessionBindingId: string; SessionKey: string }>(await fetch(new URL('/api/browser-extension/session-bindings', connection.Origin), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ InstallationRegistrationId: connection.InstallationRegistrationId, InstallationCredential: connection.InstallationCredential, ConversationSlotId: slotId, Mode: mode, DisplayName: displayName }),
  }));
  const navigation = await issueNavigationToken(connection, binding.SessionBindingId);
  return { Origin: connection.Origin, ConversationSlotId: slotId, SessionBindingId: binding.SessionBindingId, DisplayName: displayName, NavigationToken: navigation.NavigationToken };
}

export async function issueNavigationToken(connection: ExtensionConnection, sessionBindingId: string): Promise<{ NavigationToken: string }> {
  return readJson<{ NavigationToken: string }>(await fetch(new URL('/api/browser-extension/navigation-tokens', connection.Origin), {
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
  private stopped = false;

  constructor(private readonly connection: ExtensionConnection, private readonly invoke: (tool: string, args: Record<string, unknown>) => Promise<ToolResult>) {}

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
    this.socket?.close();
    this.socket = null;
  }

  private async connect(): Promise<void> {
    const channelUrl = new URL('/api/browser-extension/channel', this.connection.Origin);
    channelUrl.protocol = channelUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(channelUrl);
    this.socket = socket;
    socket.addEventListener('open', () => socket.send(JSON.stringify({ Type: 'extension_handshake', SchemaVersion: 1, InstallationRegistrationId: this.connection.InstallationRegistrationId, InstallationCredential: this.connection.InstallationCredential })));
    socket.addEventListener('message', (event) => void this.handleMessage(socket, event.data));
    socket.addEventListener('close', () => {
      if (this.socket === socket) this.socket = null;
      if (!this.stopped && !this.reconnectTimer) this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null;
        void this.start();
      }, 2000);
    });
    socket.addEventListener('error', () => socket.close());
  }

  private async handleMessage(socket: WebSocket, raw: unknown): Promise<void> {
    if (typeof raw !== 'string') throw new Error('Buffaly channel requires text messages.');
    const invocation = JSON.parse(raw) as ToolInvocation;
    if (invocation.Type !== 'tool_invocation' || invocation.SchemaVersion !== 1) throw new Error('Buffaly tool invocation contract is invalid.');
    let args: Record<string, unknown>;
    try { args = JSON.parse(invocation.ArgumentsJson) as Record<string, unknown>; }
    catch { throw new Error('Buffaly tool invocation arguments are invalid JSON.'); }
    const result = await this.invoke(invocation.Tool, args);
    if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(toCompletion(invocation, result)));
  }
}
