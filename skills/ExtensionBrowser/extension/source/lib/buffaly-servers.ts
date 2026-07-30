import { conversationSelectionId, conversationSessionKey, isDurableConversation, isLegacyConversation, type ConversationBinding, type ExtensionConnection } from './buffaly-connection';

export const SERVERS_STORAGE_KEY = 'BuffalyServers';
export const ACTIVE_SERVER_STORAGE_KEY = 'BuffalyActiveServerId';
const LEGACY_CONNECTION_STORAGE_KEY = 'BuffalyExtensionConnection';
const LEGACY_CONVERSATION_STORAGE_KEY = 'BuffalyActiveConversationBinding';

export type ServerState = 'Ready' | 'SignInRequired' | 'Unavailable' | 'WebModuleMissing';

export interface SavedBuffalyServer {
  ServerId: string;
  Name: string;
  Origin: string;
  Connection: ExtensionConnection | null;
  ActiveConversation: ConversationBinding | null;
  ActiveSessionKey?: string;
  ConversationsBySessionKey?: Record<string, ConversationBinding>;
  ConversationsByBrowserContext?: Record<string, ConversationBinding>;
  ConversationsByBindingId?: Record<string, ConversationBinding>;
  BuffalyInstanceRoutingMigrationVersion?: number;
  LastConnectedUtc: string;
}

export function conversationForContext(server: SavedBuffalyServer, browserContextId: string): ConversationBinding | null {
  return server.ConversationsByBrowserContext?.[browserContextId] || (server.ActiveConversation?.BrowserContextId === browserContextId ? server.ActiveConversation : null);
}

export function conversationsForServer(server: SavedBuffalyServer): ConversationBinding[] {
  const byId = new Map<string, ConversationBinding>();
  const add = (binding: ConversationBinding | null | undefined) => { const key = conversationSelectionId(binding); if (binding && key) byId.set(key, binding); };
  add(server.ActiveConversation);
  Object.values(server.ConversationsBySessionKey || {}).forEach(add);
  Object.values(server.ConversationsByBrowserContext || {}).forEach(add);
  Object.values(server.ConversationsByBindingId || {}).forEach(add);
  return Array.from(byId.values()).sort((left, right) => (left.DisplayName || '').localeCompare(right.DisplayName || '') || conversationSelectionId(left).localeCompare(conversationSelectionId(right)));
}

export async function updateActiveServerConversation(browserContextId: string, binding: ConversationBinding): Promise<SavedBuffalyServer> {
  const server = await getActiveServer();
  if (!server) throw new Error('Select a Buffaly server first.');
  const selectionId = conversationSelectionId(binding);
  if (!selectionId) throw new Error('The selected Buffaly conversation does not have a durable session key or legacy binding id.');
  const sessionKey = conversationSessionKey(binding);
  const conversationsBySessionKey = { ...(server.ConversationsBySessionKey || {}) };
  if (sessionKey) conversationsBySessionKey[sessionKey] = binding;
  const conversationsByBindingId = { ...(server.ConversationsByBindingId || {}) };
  if (isLegacyConversation(binding)) conversationsByBindingId[binding.SessionBindingId] = binding;
  return updateActiveServer({ ActiveConversation: binding, ActiveSessionKey: sessionKey, ConversationsBySessionKey: conversationsBySessionKey, ConversationsByBrowserContext: { ...(server.ConversationsByBrowserContext || {}), [browserContextId]: binding }, ConversationsByBindingId: conversationsByBindingId });
}

export async function activateConversation(conversationSelectionId: string, browserContextId: string): Promise<ConversationBinding> {
  const server = await getActiveServer();
  if (!server) throw new Error('Select a Buffaly server first.');
  const matches = (candidate: ConversationBinding | null | undefined) => Boolean(candidate && ((isDurableConversation(candidate) && candidate.SessionKey === conversationSelectionId) || (isLegacyConversation(candidate) && candidate.SessionBindingId === conversationSelectionId)));
  const binding = server.ConversationsBySessionKey?.[conversationSelectionId] || server.ConversationsByBindingId?.[conversationSelectionId] || (matches(server.ActiveConversation) ? server.ActiveConversation : null) || Object.values(server.ConversationsByBrowserContext || {}).find(matches) || null;
  if (!binding) throw new Error('The selected Buffaly conversation was not found in this Chrome installation.');
  return { ...binding, BrowserContextId: binding.BrowserContextId || browserContextId };
}

export interface SavedBuffalyServerSummary {
  ServerId: string;
  Name: string;
  Origin: string;
  Authorized: boolean;
  Active: boolean;
  LastConnectedUtc: string;
  ActiveConversationSessionBindingId: string;
  ActiveSessionKey: string;
  Conversations: ConversationBinding[];
}

export function canonicalServerOrigin(value: string): string {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.pathname !== '/' || url.search || url.hash) throw new Error('Buffaly server must be an http or https origin without a path or query.');
  return url.origin;
}

export async function loadServers(): Promise<{ servers: SavedBuffalyServer[]; activeServerId: string }> {
  const stored = await chrome.storage.local.get([SERVERS_STORAGE_KEY, ACTIVE_SERVER_STORAGE_KEY, 'BuffalyExtensionConnection', 'BuffalyActiveConversationBinding']);
  let servers = (stored[SERVERS_STORAGE_KEY] as SavedBuffalyServer[] | undefined) || [];
  let activeServerId = (stored[ACTIVE_SERVER_STORAGE_KEY] as string | undefined) || '';
  const legacy = stored.BuffalyExtensionConnection as ExtensionConnection | undefined;
  if (servers.length === 0 && legacy) {
    const server: SavedBuffalyServer = { ServerId: crypto.randomUUID(), Name: 'Buffaly', Origin: legacy.Origin, Connection: legacy, ActiveConversation: (stored.BuffalyActiveConversationBinding as ConversationBinding | undefined) || null, ActiveSessionKey: conversationSessionKey(stored.BuffalyActiveConversationBinding as ConversationBinding | undefined), LastConnectedUtc: '' };
    servers = [server]; activeServerId = server.ServerId;
    await chrome.storage.local.set({ [SERVERS_STORAGE_KEY]: servers, [ACTIVE_SERVER_STORAGE_KEY]: activeServerId });
  }
  if (!activeServerId && servers.length) activeServerId = servers[0].ServerId;
  return { servers, activeServerId };
}

export async function saveServer(server: SavedBuffalyServer, makeActive = true): Promise<void> {
  const state = await loadServers();
  const servers = state.servers.filter((item) => item.ServerId !== server.ServerId && item.Origin !== server.Origin).concat(server);
  await chrome.storage.local.set({
    [SERVERS_STORAGE_KEY]: servers,
    ...(makeActive ? {
      [ACTIVE_SERVER_STORAGE_KEY]: server.ServerId,
      [LEGACY_CONNECTION_STORAGE_KEY]: server.Connection,
      [LEGACY_CONVERSATION_STORAGE_KEY]: server.ActiveConversation,
    } : {}),
  });
}

export async function removeServer(serverId: string): Promise<SavedBuffalyServer | null> {
  const state = await loadServers();
  const servers = state.servers.filter((server) => server.ServerId !== serverId);
  if (servers.length === state.servers.length) throw new Error('The Buffaly server to remove was not found.');
  const active = state.activeServerId === serverId ? (servers[0] || null) : (servers.find((server) => server.ServerId === state.activeServerId) || null);
  await chrome.storage.local.set({
    [SERVERS_STORAGE_KEY]: servers,
    [ACTIVE_SERVER_STORAGE_KEY]: active?.ServerId || '',
    [LEGACY_CONNECTION_STORAGE_KEY]: active?.Connection || null,
    [LEGACY_CONVERSATION_STORAGE_KEY]: active?.ActiveConversation || null,
  });
  return active;
}

export async function activateServer(serverId: string): Promise<SavedBuffalyServer> {
  const state = await loadServers();
  const server = state.servers.find((item) => item.ServerId === serverId);
  if (!server) throw new Error('The selected Buffaly server was not found.');
  await chrome.storage.local.set({
    [ACTIVE_SERVER_STORAGE_KEY]: server.ServerId,
    [LEGACY_CONNECTION_STORAGE_KEY]: server.Connection,
    [LEGACY_CONVERSATION_STORAGE_KEY]: server.ActiveConversation,
  });
  return server;
}

export async function getActiveServer(): Promise<SavedBuffalyServer | null> {
  const state = await loadServers();
  return state.servers.find((server) => server.ServerId === state.activeServerId) || null;
}

export async function updateActiveServer(update: Partial<SavedBuffalyServer>): Promise<SavedBuffalyServer> {
  const server = await getActiveServer();
  if (!server) throw new Error('Select a Buffaly server first.');
  const updated = { ...server, ...update };
  await saveServer(updated, true);
  return updated;
}

export function summarizeServers(servers: SavedBuffalyServer[], activeServerId: string): SavedBuffalyServerSummary[] {
  return servers.map((server) => ({ ServerId: server.ServerId, Name: server.Name, Origin: server.Origin, Authorized: Boolean(server.Connection), Active: server.ServerId === activeServerId, LastConnectedUtc: server.LastConnectedUtc, ActiveConversationSessionBindingId: isLegacyConversation(server.ActiveConversation) ? server.ActiveConversation.SessionBindingId : '', ActiveSessionKey: server.ActiveSessionKey || conversationSessionKey(server.ActiveConversation), Conversations: conversationsForServer(server) }));
}
