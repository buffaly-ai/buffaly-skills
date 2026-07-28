import type { ConversationBinding, ExtensionConnection } from './buffaly-connection';

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
  LastConnectedUtc: string;
}

export interface SavedBuffalyServerSummary {
  ServerId: string;
  Name: string;
  Origin: string;
  Authorized: boolean;
  Active: boolean;
  LastConnectedUtc: string;
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
    const server: SavedBuffalyServer = { ServerId: crypto.randomUUID(), Name: 'Buffaly', Origin: legacy.Origin, Connection: legacy, ActiveConversation: (stored.BuffalyActiveConversationBinding as ConversationBinding | undefined) || null, LastConnectedUtc: '' };
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
  return servers.map(({ ServerId, Name, Origin, Connection, LastConnectedUtc }) => ({ ServerId, Name, Origin, Authorized: Boolean(Connection), Active: ServerId === activeServerId, LastConnectedUtc }));
}
