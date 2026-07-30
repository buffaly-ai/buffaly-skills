import { handleToolCall, grantDebuggerConsent, revokeDebuggerConsent } from '../lib/tool-router';
import { detachDebugger, isAttached } from '../lib/debugger-session';
import { getLogEntries, getLogVersion } from '../lib/tool-log';
import { ACTIVE_CONVERSATION_STORAGE_KEY, InstallationChannel, PROMPT_POLICY_REVISION, authorizeInstallation, createConversation, issueNavigationToken, loadBoundToolResult, loadConnection, type ConversationBinding } from '../lib/buffaly-connection';
import { activateServer, canonicalServerOrigin, conversationForContext, getActiveServer, loadServers, removeServer, saveServer, summarizeServers, updateActiveServer, updateActiveServerConversation, type SavedBuffalyServer, type ServerState } from '../lib/buffaly-servers';
import type { BoundToolInvocationIdentity } from '../lib/types';

let installationChannel: InstallationChannel | null = null;
interface PanelRegistration { port: chrome.runtime.Port; panelInstanceId: string; browserContextId: string; windowId: number }
const boundToolPanels = new Map<string, PanelRegistration>();
const pendingBoundTools = new Map<string, { browserContextId: string; resolve: (result: Awaited<ReturnType<typeof handleToolCall>>) => void; reject: (error: Error) => void }>();

function publishBrowserContexts(): void {
  const observedUtc = new Date().toISOString();
  installationChannel?.publishBrowserContexts([...boundToolPanels.values()].map((panel) => ({ BrowserContextId: panel.browserContextId, WindowId: panel.windowId, PanelInstanceId: panel.panelInstanceId, State: 'Ready', ObservedUtc: observedUtc })));
}

async function invokeBoundTool(tool: string, args: Record<string, unknown>, identity: BoundToolInvocationIdentity): Promise<Awaited<ReturnType<typeof handleToolCall>>> {
  const panel = boundToolPanels.get(identity.BrowserContextId);
  if (!panel) throw new Error(`BOUND_BROWSER_CONTEXT_OFFLINE: ${identity.BrowserContextId}`);
  const requestId = crypto.randomUUID();
  const portResult = new Promise<Awaited<ReturnType<typeof handleToolCall>>>((resolve, reject) => {
    pendingBoundTools.set(requestId, { browserContextId: identity.BrowserContextId, resolve, reject });
    panel.port.postMessage({ type: 'execute_bound_tool', requestId, tool, args, identity, windowId: panel.windowId });
  });
  const durableResult = (async () => {
    for (let attempt = 0; attempt < 80; attempt++) {
      const result = await loadBoundToolResult(identity);
      if (result) return result;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error('The ExtensionBrowser side panel did not persist a bound tool result.');
  })();
  const liveOrDurableResult = portResult.catch(() => durableResult);
  return Promise.race([liveOrDurableResult, durableResult]).finally(() => pendingBoundTools.delete(requestId));
}

async function startInstallationChannel(): Promise<void> {
	const connection = (await getActiveServer())?.Connection || null;
  installationChannel?.stop();
	installationChannel = null;
	if (!connection) return;
  installationChannel = new InstallationChannel(connection, invokeBoundTool, publishBrowserContexts);
	await installationChannel.start();
}

async function inspectServer(origin: string, connection: SavedBuffalyServer['Connection']): Promise<{ State: ServerState; Version: string }> {
	try {
		const response = await fetch(new URL('/web-modules/ExtensionBrowser/health', origin), { cache: 'no-store' });
		if (response.status === 404) return { State: 'WebModuleMissing', Version: '' };
		if (!response.ok) return { State: 'Unavailable', Version: '' };
		const health = await response.json() as { Version?: string };
		if (!connection) return { State: 'SignInRequired', Version: health.Version || '' };
		const status = await fetch(new URL('/web-modules/ExtensionBrowser/api/installations/status', origin), {
			method: 'POST', headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ InstallationRegistrationId: connection.InstallationRegistrationId, InstallationCredential: connection.InstallationCredential }),
		});
		if (!status.ok) return { State: 'SignInRequired', Version: health.Version || '' };
		const installation = await status.json() as { ChannelConnected?: boolean };
		return { State: installation.ChannelConnected ? 'Ready' : 'Unavailable', Version: health.Version || '' };
	} catch {
		return { State: 'Unavailable', Version: '' };
	}
}

function isTrustedExtensionPage(sender: chrome.runtime.MessageSender): boolean {
	if (sender.id !== chrome.runtime.id || !sender.url) return false;
	const trustedOrigin = new URL(chrome.runtime.getURL('/')).origin;
	return new URL(sender.url).origin === trustedOrigin;
}

// Export the CDP bridge hook at module evaluation time. WXT's lifecycle
// callback can run after Chrome exposes the MV3 worker DevTools target, while
// Buffaly must be able to observe this hook as soon as worker startup resumes.
(self as any).__callTool = (tool: string, args: Record<string, unknown> = {}) =>
  handleToolCall(tool, args);

export default defineBackground(() => {
	void startInstallationChannel().catch((error) => console.error('Failed to start Buffaly installation channel:', error));
  // ─── Side Panel: Enable open-on-toolbar-click ───
  // CRITICAL: The manifest side_panel.default_path alone does NOT make the
  // toolbar icon open the side panel. This call is required.
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((err) => console.error('Failed to set side panel behavior:', err));

  chrome.runtime.onConnect.addListener((port) => {
    if (port.name !== 'bound-tool-executor' || !port.sender || !isTrustedExtensionPage(port.sender)) return;
    let registration: PanelRegistration | null = null;
    port.onMessage.addListener((message: { type: string; schemaVersion?: number; panelInstanceId?: string; browserContextId?: string; windowId?: number; requestId?: string; result?: Awaited<ReturnType<typeof handleToolCall>>; error?: string }) => {
      if (message.type === 'register_panel') {
        if (message.schemaVersion !== 1 || !message.panelInstanceId || !message.browserContextId || !Number.isInteger(message.windowId)) { port.disconnect(); return; }
        const existing = boundToolPanels.get(message.browserContextId);
        if (existing && existing.port !== port) existing.port.disconnect();
        registration = { port, panelInstanceId: message.panelInstanceId, browserContextId: message.browserContextId, windowId: message.windowId! };
        boundToolPanels.set(registration.browserContextId, registration);
        publishBrowserContexts();
        return;
      }
      if (message.type === 'bound_tool_executor_heartbeat') return;
      if (message.type !== 'bound_tool_result' || !message.requestId) return;
      const pending = pendingBoundTools.get(message.requestId);
      if (!pending || pending.browserContextId !== registration?.browserContextId) return;
      pendingBoundTools.delete(message.requestId);
      if (message.result) pending.resolve(message.result);
      else pending.reject(new Error(message.error || 'The side panel did not return a tool result.'));
    });
    port.onDisconnect.addListener(() => {
      if (registration && boundToolPanels.get(registration.browserContextId)?.port === port) { boundToolPanels.delete(registration.browserContextId); publishBrowserContexts(); }
      for (const [requestId, pending] of pendingBoundTools) {
        if (pending.browserContextId !== registration?.browserContextId) continue;
        pending.reject(new Error('The bound browser context disconnected during tool execution.'));
        pendingBoundTools.delete(requestId);
      }
    });
  });

  // ─── Message Handler: Tool Calls from Side Panel ───

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'tool_call') {
      if (!isTrustedExtensionPage(sender)) {
        sendResponse({ ok: false, error: 'Unauthorized: tool calls can only originate from the extension side panel' });
        return false;
      }
      handleToolCall(request.tool, request.args)
        .then((result: unknown) => sendResponse(result))
        .catch((err: Error) => sendResponse({ ok: false, error: err.message }));
      return true; // async response
    }

    if (request.type === 'buffaly_connection_changed') {
      if (!isTrustedExtensionPage(sender)) {
        sendResponse({ ok: false, error: 'Unauthorized: connection changes can only originate from an extension page' });
        return false;
      }
      startInstallationChannel()
        .then(() => sendResponse({ ok: true }))
        .catch((err: Error) => sendResponse({ ok: false, error: err.message }));
      return true;
    }

    if (request.type === 'authorize_buffaly_installation') {
      if (!isTrustedExtensionPage(sender)) {
        sendResponse({ ok: false, error: 'Unauthorized: installation authorization can only originate from an extension page' });
        return false;
      }
		getActiveServer().then((server) => authorizeInstallation(request.origin, server?.Origin === new URL(request.origin).origin ? server.Connection : null))
		  .then(async (connection) => {
			const current = await getActiveServer();
			const matchingCurrent = current?.Origin === connection.Origin ? current : null;
			await saveServer({ ServerId: matchingCurrent?.ServerId || crypto.randomUUID(), Name: request.name || matchingCurrent?.Name || new URL(connection.Origin).hostname, Origin: connection.Origin, Connection: connection, ActiveConversation: matchingCurrent?.ActiveConversation || null, LastConnectedUtc: new Date().toISOString() }, true);
			await chrome.storage.local.set({ BuffalyExtensionConnection: connection });
			await startInstallationChannel();
          sendResponse({ ok: true, data: { Origin: connection.Origin } });
        })
        .catch((err: Error) => sendResponse({ ok: false, error: err.message }));
      return true;
    }

    if (request.type === 'get_buffaly_connection_status') {
      if (!isTrustedExtensionPage(sender)) {
        sendResponse({ ok: false, error: 'Unauthorized: connection status can only be read from an extension page' });
        return false;
      }
      loadConnection()
        .then((connection) => sendResponse({ ok: true, data: connection ? { Connected: true, Origin: connection.Origin } : { Connected: false, Origin: '' } }))
        .catch((err: Error) => sendResponse({ ok: false, error: err.message }));
      return true;
    }

	  if (request.type === 'get_buffaly_servers') {
		if (!isTrustedExtensionPage(sender)) { sendResponse({ ok: false, error: 'Unauthorized: servers can only be read from an extension page' }); return false; }
		loadServers().then(async (state) => {
			const active = state.servers.find((server) => server.ServerId === state.activeServerId) || null;
			const status = active ? await inspectServer(active.Origin, active.Connection) : { State: 'Unavailable' as ServerState, Version: '' };
			sendResponse({ ok: true, data: { Servers: summarizeServers(state.servers, state.activeServerId), ActiveServer: active ? { ServerId: active.ServerId, Name: active.Name, Origin: active.Origin } : null, ...status } });
		}).catch((err: Error) => sendResponse({ ok: false, error: err.message }));
		return true;
	  }

	  if (request.type === 'save_buffaly_server') {
		if (!isTrustedExtensionPage(sender)) { sendResponse({ ok: false, error: 'Unauthorized: servers can only be saved from an extension page' }); return false; }
		Promise.resolve().then(async () => {
			const origin = canonicalServerOrigin(String(request.origin || '').trim());
			const state = await loadServers();
			const existing = state.servers.find((server) => server.ServerId === request.serverId) || state.servers.find((server) => server.Origin === origin);
			const sameOrigin = existing?.Origin === origin;
			const saved = { ServerId: existing?.ServerId || crypto.randomUUID(), Name: String(request.name || new URL(origin).hostname).trim(), Origin: origin, Connection: sameOrigin ? existing?.Connection || null : null, ActiveConversation: sameOrigin ? existing?.ActiveConversation || null : null, LastConnectedUtc: sameOrigin ? existing?.LastConnectedUtc || '' : '' };
			await saveServer(saved, true);
			sendResponse({ ok: true, data: { Server: { ServerId: saved.ServerId, Name: saved.Name, Origin: saved.Origin, Authorized: Boolean(saved.Connection), Active: true, LastConnectedUtc: saved.LastConnectedUtc } } });
			void startInstallationChannel().catch((error) => console.error('Failed to restart Buffaly installation channel after saving the server:', error));
		}).catch((err: Error) => sendResponse({ ok: false, error: err.message }));
		return true;
	  }

	  if (request.type === 'select_buffaly_server') {
		if (!isTrustedExtensionPage(sender)) { sendResponse({ ok: false, error: 'Unauthorized: servers can only be selected from an extension page' }); return false; }
		activateServer(request.serverId).then(async () => {
			await startInstallationChannel(); sendResponse({ ok: true });
		}).catch((err: Error) => sendResponse({ ok: false, error: err.message }));
		return true;
	  }

	  if (request.type === 'remove_buffaly_server') {
		if (!isTrustedExtensionPage(sender)) { sendResponse({ ok: false, error: 'Unauthorized: servers can only be removed from an extension page' }); return false; }
		removeServer(String(request.serverId || '')).then(async () => {
			await startInstallationChannel(); sendResponse({ ok: true });
		}).catch((err: Error) => sendResponse({ ok: false, error: err.message }));
		return true;
	  }

	  if (request.type === 'get_buffaly_conversation_bootstrap') {
      if (!isTrustedExtensionPage(sender)) {
        sendResponse({ ok: false, error: 'Unauthorized: conversation bootstrap can only be read from an extension page' });
        return false;
      }
      Promise.all([loadConnection(), getActiveServer()])
        .then(async ([connection, server]) => {
          const browserContextId = String(request.browserContextId || '');
          let binding = server ? conversationForContext(server, browserContextId) || undefined : undefined;
          if (!connection || !binding) return null;
          if (binding.InstallationRegistrationId !== connection.InstallationRegistrationId || (binding.PromptPolicyRevision || 0) < PROMPT_POLICY_REVISION) {
            const replacement = await createConversation(connection, 'CreateNew', crypto.randomUUID(), browserContextId, binding.DisplayName || 'Chrome conversation');
            binding = { ConversationSlotId: replacement.ConversationSlotId, SessionBindingId: replacement.SessionBindingId, InstallationRegistrationId: connection.InstallationRegistrationId, BrowserContextId: browserContextId, DisplayName: replacement.DisplayName, PromptPolicyRevision: replacement.PromptPolicyRevision };
            await chrome.storage.local.set({ [ACTIVE_CONVERSATION_STORAGE_KEY]: binding });
            await updateActiveServerConversation(browserContextId, binding);
          }
          const navigation = await issueNavigationToken(connection, binding.SessionBindingId);
          return { Origin: connection.Origin, ...binding, NavigationToken: navigation.NavigationToken };
        })
        .then((bootstrap) => sendResponse({ ok: true, data: bootstrap }))
        .catch((err: Error) => sendResponse({ ok: false, error: err.message }));
      return true;
    }

    if (request.type === 'open_buffaly_conversation_tab') {
      if (!isTrustedExtensionPage(sender)) {
        sendResponse({ ok: false, error: 'Unauthorized: conversation pop-out can only originate from an extension page' });
        return false;
      }
      Promise.all([loadConnection(), getActiveServer()])
        .then(async ([connection, server]) => {
          const binding = server ? conversationForContext(server, String(request.browserContextId || '')) || undefined : undefined;
          if (!connection || !binding) throw new Error('No active Buffaly conversation is available.');
          const navigation = await issueNavigationToken(connection, binding.SessionBindingId);
          const url = new URL('/web-modules/ExtensionBrowser/conversation', connection.Origin);
          url.searchParams.set('presentation', 'standard');
          url.searchParams.set('navigationToken', navigation.NavigationToken);
          await chrome.tabs.create({ url: url.toString(), active: true });
          return { Opened: true };
        })
        .then((data) => sendResponse({ ok: true, data }))
        .catch((err: Error) => sendResponse({ ok: false, error: err.message }));
      return true;
    }

    if (request.type === 'create_buffaly_conversation') {
      if (!isTrustedExtensionPage(sender)) {
        sendResponse({ ok: false, error: 'Unauthorized: conversations can only be created from an extension page' });
        return false;
      }
      loadConnection()
        .then((connection) => {
          if (!connection) throw new Error('Buffaly installation is not authorized.');
          return createConversation(connection, 'CreateNew', crypto.randomUUID(), String(request.browserContextId || ''), request.displayName || 'Chrome conversation');
        })
		  .then(async (bootstrap) => {
			const connection = await loadConnection();
			if (!connection) throw new Error('Buffaly installation is not authorized.');
			const binding: ConversationBinding = { ConversationSlotId: bootstrap.ConversationSlotId, SessionBindingId: bootstrap.SessionBindingId, InstallationRegistrationId: connection.InstallationRegistrationId, BrowserContextId: bootstrap.BrowserContextId, DisplayName: bootstrap.DisplayName, PromptPolicyRevision: bootstrap.PromptPolicyRevision };
			await chrome.storage.local.set({ [ACTIVE_CONVERSATION_STORAGE_KEY]: binding });
			await updateActiveServerConversation(binding.BrowserContextId, binding);
			sendResponse({ ok: true, data: bootstrap });
        })
        .catch((err: Error) => sendResponse({ ok: false, error: err.message }));
      return true;
    }

    // ─── Debugger Consent: Only extension pages (side panel) can grant consent ───
    // Validates sender is from this extension's exact origin. Chrome side panels
    // can carry sender.tab, so tab association is not an authorization boundary.
    // Note: Buffaly connects via CDP Runtime.evaluate, which bypasses the message
    // system entirely — Buffaly is an authorized caller at the CDP trust boundary.
    if (request.type === 'grant_debugger_consent') {
      if (!isTrustedExtensionPage(sender)) {
        sendResponse({ ok: false, error: 'Unauthorized: debugger consent can only be granted from the extension side panel' });
        return false;
      }
      grantDebuggerConsent();
      sendResponse({ ok: true });
      return false;
    }

    if (request.type === 'revoke_debugger_consent') {
      if (!isTrustedExtensionPage(sender)) {
        sendResponse({ ok: false, error: 'Unauthorized: debugger consent can only be revoked from the extension side panel' });
        return false;
      }
      revokeDebuggerConsent();
      sendResponse({ ok: true });
      return false;
    }

    if (request.type === 'get_tool_log') {
      if (!isTrustedExtensionPage(sender)) {
        sendResponse({ ok: false, error: 'Unauthorized: tool logs can only be read from the extension side panel' });
        return false;
      }
      sendResponse({
        type: 'tool_log_update',
        entries: getLogEntries(),
        version: getLogVersion(),
      });
      return false;
    }

    return false;
  });

  // ─── Tab Close: Auto-detach debugger ───

  chrome.tabs.onRemoved.addListener((tabId) => {
    if (isAttached(tabId)) {
      detachDebugger(tabId).catch(() => {});
    }
  });

  // ─── Debugger Detach Event: Clean up session state ───

  chrome.debugger.onDetach.addListener((source: chrome.debugger.Debuggee, _reason: string) => {
    if (source.tabId) {
      detachDebugger(source.tabId).catch(() => {});
    }
  });

  // ─── Service Worker Install ───

  chrome.runtime.onInstalled.addListener(() => {
    console.log('Buffaly Browser Agent installed');
  });
});
