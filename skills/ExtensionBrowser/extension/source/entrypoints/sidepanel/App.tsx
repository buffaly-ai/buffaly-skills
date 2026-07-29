import { useState, useEffect, useCallback, useRef } from 'react';
import type { ToolResult, ToolLogEntry } from '../../lib/types';
import { handleToolCall } from '../../lib/tool-router';
import { boundToolResultStorageKey, type BoundToolInvocationIdentity } from '../../lib/buffaly-connection';

async function callTool(tool: string, args: Record<string, unknown> = {}): Promise<ToolResult> {
  return new Promise((resolve) => chrome.runtime.sendMessage({ type: 'tool_call', tool, args }, resolve));
}

interface ActiveTab { tabId: number; url: string; title: string }
interface ConversationBootstrap { Origin: string; ConversationSlotId: string; SessionBindingId: string; DisplayName: string; PromptPolicyRevision: number; NavigationToken: string }
interface WorkerResponse<T> { ok: boolean; data?: T; error?: string }
type ServerState = 'Ready' | 'SignInRequired' | 'Unavailable' | 'WebModuleMissing';
interface ServerSummary { ServerId: string; Name: string; Origin: string; Authorized: boolean; Active: boolean; LastConnectedUtc: string }
interface ServersStatus { Servers: ServerSummary[]; ActiveServer: { ServerId: string; Name: string; Origin: string } | null; State: ServerState; Version: string }
interface MicrophoneDiagnostic { origin: string; policyAllowsMicrophone: boolean | null; permissionState: string; result: string; name?: string; message?: string }
type PanelMode = 'chat' | 'agent';
const panelModeStorageKey = 'BuffalyPanelMode';
const defaultOrigin = 'http://127.0.0.1:5016';

function conversationUrl(bootstrap: ConversationBootstrap): string {
  const url = new URL('/web-modules/ExtensionBrowser/conversation', bootstrap.Origin);
  url.searchParams.set('presentation', 'sidepanel');
  url.searchParams.set('navigationToken', bootstrap.NavigationToken);
  return url.toString();
}

export default function App() {
  const conversationFrame = useRef<HTMLIFrameElement | null>(null);
  const logo48Url = chrome.runtime.getURL('icon/48.png');
  const logo128Url = chrome.runtime.getURL('icon/128.png');
  const [toolLog, setToolLog] = useState<ToolLogEntry[]>([]);
  const [debuggerAttached, setDebuggerAttached] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>('chat');
  const [busy, setBusy] = useState('');
  const [connected, setConnected] = useState(false);
  const [conversation, setConversation] = useState<ConversationBootstrap | null>(null);
  const [serversStatus, setServersStatus] = useState<ServersStatus>({ Servers: [], ActiveServer: null, State: 'Unavailable', Version: '' });
  const [showAddServer, setShowAddServer] = useState(false);
  const [showServerSettings, setShowServerSettings] = useState(false);
  const [serverName, setServerName] = useState('Local Buffaly');
  const [origin, setOrigin] = useState(defaultOrigin);
  const [microphoneError, setMicrophoneError] = useState<{ name: string; message: string } | null>(null);
  const [microphoneDiagnostic, setMicrophoneDiagnostic] = useState<MicrophoneDiagnostic | null>(null);
  const [error, setError] = useState('');

  const refreshServers = useCallback(async (): Promise<ServersStatus> => {
    const response = await chrome.runtime.sendMessage({ type: 'get_buffaly_servers' }) as WorkerResponse<ServersStatus> | undefined;
    if (!response?.ok || !response.data) throw new Error(response?.error || 'Saved Buffaly servers could not be read.');
    setServersStatus(response.data);
    setConnected(response.data.State === 'Ready');
    if (response.data.ActiveServer) setOrigin(response.data.ActiveServer.Origin);
    return response.data;
  }, []);

  const refreshStatus = useCallback(async () => {
    const result = await callTool('get_status');
    if (!result.ok) return;
    const data = result.data as { debuggerAttached: boolean; activeTab: ActiveTab | null };
    setDebuggerAttached(data.debuggerAttached); setActiveTab(data.activeTab);
  }, []);

  useEffect(() => {
    Promise.all([
      refreshServers(),
      chrome.runtime.sendMessage({ type: 'get_buffaly_conversation_bootstrap' }),
      chrome.storage.local.get([panelModeStorageKey]),
    ]).then(([, bootstrap, stored]) => {
      if (bootstrap.ok && bootstrap.data) setConversation(bootstrap.data as ConversationBootstrap);
      if (stored[panelModeStorageKey] === 'agent' || stored[panelModeStorageKey] === 'chat') setPanelMode(stored[panelModeStorageKey] as PanelMode);
    }).catch((reason) => setError(reason instanceof Error ? reason.message : String(reason)));
  }, [refreshServers]);

  useEffect(() => {
    refreshStatus();
    let boundToolPort: chrome.runtime.Port | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
    let disposed = false;
    const connectBoundToolPort = () => {
      if (disposed || boundToolPort) return;
      const port = chrome.runtime.connect({ name: 'bound-tool-executor' });
      boundToolPort = port;
      heartbeatTimer = setInterval(() => port.postMessage({ type: 'bound_tool_executor_heartbeat' }), 20_000);
      port.onMessage.addListener((msg: { type: string; requestId: string; tool?: string; args?: Record<string, unknown>; identity?: BoundToolInvocationIdentity }) => {
        if (msg.type !== 'execute_bound_tool' || !msg.tool || !msg.identity) return;
        handleToolCall(msg.tool, msg.args || {})
          .then(async (result) => {
            await chrome.storage.local.set({ [boundToolResultStorageKey(msg.identity!)]: { CreatedAtUtc: new Date().toISOString(), Result: result } });
            port.postMessage({ type: 'bound_tool_result', requestId: msg.requestId, result });
          })
          .catch((reason: Error) => port.postMessage({ type: 'bound_tool_result', requestId: msg.requestId, error: reason.message }));
      });
      port.onDisconnect.addListener(() => {
        if (boundToolPort === port) boundToolPort = null;
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        heartbeatTimer = null;
        if (!disposed && !reconnectTimer) reconnectTimer = setTimeout(() => { reconnectTimer = null; connectBoundToolPort(); }, 250);
      });
    };
    connectBoundToolPort();
    const runtimeListener = (msg: { type: string; entries?: ToolLogEntry[] }) => {
      if (msg.type === 'tool_log_update' && msg.entries) setToolLog(msg.entries);
    };
    const tabListener = () => refreshStatus();
    chrome.runtime.onMessage.addListener(runtimeListener); chrome.tabs.onActivated.addListener(tabListener); chrome.tabs.onUpdated.addListener(tabListener);
    return () => { disposed = true; if (reconnectTimer) clearTimeout(reconnectTimer); if (heartbeatTimer) clearInterval(heartbeatTimer); boundToolPort?.disconnect(); chrome.runtime.onMessage.removeListener(runtimeListener); chrome.tabs.onActivated.removeListener(tabListener); chrome.tabs.onUpdated.removeListener(tabListener); };
  }, [refreshStatus]);

  useEffect(() => {
    const respondWithCurrentPage = (event: MessageEvent) => {
      if (!conversation || event.source !== conversationFrame.current?.contentWindow || event.origin !== new URL(conversation.Origin).origin) return;
      const request = event.data as ({ type?: string; requestId?: string } & Partial<MicrophoneDiagnostic>) | null;
      if (request?.type === 'extension_browser_microphone_diagnostic') {
        const diagnostic = {
          origin: String(request.origin || event.origin),
          policyAllowsMicrophone: typeof request.policyAllowsMicrophone === 'boolean' ? request.policyAllowsMicrophone : null,
          permissionState: String(request.permissionState || 'unknown'),
          result: String(request.result || 'unknown'),
          name: request.name ? String(request.name) : undefined,
          message: request.message ? String(request.message) : undefined
        };
        setMicrophoneDiagnostic(diagnostic);
        if (diagnostic.result === 'rejected') setMicrophoneError({ name: diagnostic.name || 'MicrophoneError', message: diagnostic.message || 'Chrome rejected microphone capture.' });
        return;
      }
      if (!request || request.type !== 'extension_browser_current_page_request' || !request.requestId) return;
      handleToolCall('get_active_tab', {}).then((result) => {
        if (!result.ok) throw new Error(result.error || 'Chrome did not return the active page.');
        const page = result.data as ActiveTab;
        event.source?.postMessage({ type: 'extension_browser_current_page_response', requestId: request.requestId, page: { Url: page.url, Title: page.title, TabId: page.tabId, CapturedUtc: new Date().toISOString() } }, { targetOrigin: event.origin });
      }).catch((reason) => {
        event.source?.postMessage({ type: 'extension_browser_current_page_response', requestId: request.requestId, error: reason instanceof Error ? reason.message : String(reason) }, { targetOrigin: event.origin });
      });
    };
    window.addEventListener('message', respondWithCurrentPage);
    return () => window.removeEventListener('message', respondWithCurrentPage);
  }, [conversation]);

  const saveNewServer = useCallback(async () => {
    setBusy('save-server'); setError('');
    try {
      const response = await chrome.runtime.sendMessage({ type: 'save_buffaly_server', serverId: showServerSettings ? serversStatus.ActiveServer?.ServerId : '', name: serverName, origin }) as WorkerResponse<{ Server: ServerSummary }> | undefined;
      if (!response?.ok || !response.data) throw new Error(response?.error || 'The Buffaly server could not be saved.');
       const saved = response.data.Server;
       setServersStatus((current) => ({ ...current, Servers: current.Servers.filter((server) => server.ServerId !== saved.ServerId && server.Origin !== saved.Origin).map((server) => ({ ...server, Active: false })).concat(saved), ActiveServer: { ServerId: saved.ServerId, Name: saved.Name, Origin: saved.Origin }, State: 'Unavailable', Version: '' }));
       setOrigin(saved.Origin); setConnected(false); setConversation(null); setShowAddServer(false); setShowServerSettings(false);
       void refreshServers().catch((reason) => setError(reason instanceof Error ? reason.message : String(reason)));
    } catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); }
    finally { setBusy(''); }
  }, [origin, refreshServers, serverName, serversStatus.ActiveServer?.ServerId, showServerSettings]);

  const selectServer = useCallback(async (serverId: string) => {
    setBusy('select-server'); setError(''); setConversation(null);
    try {
      const selected = await chrome.runtime.sendMessage({ type: 'select_buffaly_server', serverId }) as WorkerResponse<unknown> | undefined;
      if (!selected?.ok) throw new Error(selected?.error || 'The Buffaly server could not be selected.');
      const status = await refreshServers();
      if (status.State === 'Ready') {
        const bootstrap = await chrome.runtime.sendMessage({ type: 'get_buffaly_conversation_bootstrap' }) as WorkerResponse<ConversationBootstrap> | undefined;
        if (bootstrap?.ok && bootstrap.data) setConversation(bootstrap.data);
      }
    } catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); }
    finally { setBusy(''); }
  }, [refreshServers]);

  const openServerSettings = useCallback(() => {
    if (!serversStatus.ActiveServer) return;
    setServerName(serversStatus.ActiveServer.Name); setOrigin(serversStatus.ActiveServer.Origin); setShowAddServer(false); setShowServerSettings(true); setError('');
  }, [serversStatus.ActiveServer]);

  const removeActiveServer = useCallback(async () => {
    const server = serversStatus.ActiveServer;
    if (!server || !window.confirm(`Remove ${server.Name} from this Chrome installation?`)) return;
    setBusy('remove-server'); setError('');
    try {
      const response = await chrome.runtime.sendMessage({ type: 'remove_buffaly_server', serverId: server.ServerId }) as WorkerResponse<unknown> | undefined;
      if (!response?.ok) throw new Error(response?.error || 'The Buffaly server could not be removed.');
      setShowServerSettings(false); setConversation(null); await refreshServers();
    } catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); }
    finally { setBusy(''); }
  }, [refreshServers, serversStatus.ActiveServer]);

  const connect = useCallback(async () => {
    setBusy('connect'); setError('');
    try {
      const authorization = await chrome.runtime.sendMessage({ type: 'authorize_buffaly_installation', origin, name: serversStatus.ActiveServer?.Name || serverName }) as WorkerResponse<{ Origin: string }> | undefined;
      if (!authorization) throw new Error('The ExtensionBrowser service worker did not answer. Reload the extension and reopen the side panel.');
      if (!authorization.ok || !authorization.data) throw new Error(authorization.error || 'Buffaly authorization failed.');
      await refreshServers();
      const created = await chrome.runtime.sendMessage({ type: 'create_buffaly_conversation', displayName: 'Chrome conversation' }) as WorkerResponse<ConversationBootstrap> | undefined;
      if (!created?.ok || !created.data) throw new Error(created?.error || 'The bound conversation could not be created.');
      setConversation(created.data as ConversationBootstrap);
    } catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); }
    finally { setBusy(''); }
  }, [origin, refreshServers, serverName, serversStatus.ActiveServer?.Name]);

  const newConversation = useCallback(async () => {
    if (!connected) return;
    setBusy('new'); setError('');
    try {
      const created = await chrome.runtime.sendMessage({ type: 'create_buffaly_conversation', displayName: 'Chrome conversation' });
      if (!created.ok) throw new Error(created.error);
      setConversation(created.data as ConversationBootstrap);
    } catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); }
    finally { setBusy(''); }
  }, [connected]);

  const selectPanelMode = useCallback((mode: PanelMode) => {
    setPanelMode(mode);
    void chrome.storage.local.set({ [panelModeStorageKey]: mode });
  }, []);

  const openConversationTab = useCallback(async () => {
    setBusy('popout'); setError('');
    try {
      const opened = await chrome.runtime.sendMessage({ type: 'open_buffaly_conversation_tab' }) as WorkerResponse<{ Opened: boolean }> | undefined;
      if (!opened?.ok) throw new Error(opened?.error || 'The conversation could not be opened in a tab.');
    } catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); }
    finally { setBusy(''); }
  }, []);

  const enableControl = useCallback(async () => { setBusy('control'); chrome.runtime.sendMessage({ type: 'grant_debugger_consent' }); await callTool('attach_debugger'); setBusy(''); await refreshStatus(); }, [refreshStatus]);
  const pauseControl = useCallback(async () => { setBusy('control'); await callTool('detach_debugger'); chrome.runtime.sendMessage({ type: 'revoke_debugger_consent' }); setBusy(''); await refreshStatus(); }, [refreshStatus]);

  const stateLabel = serversStatus.State === 'Ready' ? 'Ready' : serversStatus.State === 'SignInRequired' ? 'Sign-in required' : serversStatus.State === 'WebModuleMissing' ? 'ExtensionBrowser not installed' : 'Unavailable';
  return <main className={`app mode-${panelMode}`}>
    <header className="topbar"><div className="brand"><img src={logo48Url} alt="" /><div><strong>{serversStatus.ActiveServer?.Name || 'Buffaly'}</strong><span>{serversStatus.ActiveServer?.Origin || 'Choose a server'}</span></div></div><span className={`live-state ${serversStatus.State === 'Ready' ? 'active' : ''}`} title={stateLabel}><i /><b>{stateLabel}</b></span></header>
    <section className="server-bar" aria-label="Buffaly server"><select aria-label="Saved Buffaly server" value={serversStatus.ActiveServer?.ServerId || ''} onChange={(event) => void selectServer(event.target.value)} disabled={!!busy}><option value="" disabled>Choose a Buffaly server</option>{serversStatus.Servers.map((server) => <option key={server.ServerId} value={server.ServerId}>{server.Name}</option>)}</select><button onClick={() => setShowAddServer((visible) => !visible)} aria-expanded={showAddServer}>Add</button>{serversStatus.ActiveServer && <><button onClick={openServerSettings} aria-label="Manage selected server" title="Server settings">⚙</button><button onClick={() => void refreshServers()} aria-label="Check selected server">↻</button></>}</section>
    {showAddServer && <section className="add-server"><label>Name<input value={serverName} onChange={(event) => setServerName(event.target.value)} /></label><label>Origin<input value={origin} onChange={(event) => setOrigin(event.target.value)} placeholder="https://buffaly.example.com" /></label><button onClick={saveNewServer} disabled={!!busy || !serverName.trim() || !origin.trim()}>Save server</button></section>}
    {showServerSettings && serversStatus.ActiveServer && <div className="modal-backdrop"><section className="settings-modal" role="dialog" aria-modal="true" aria-label="Buffaly server settings"><img src={logo48Url} alt="" /><h2>Server settings</h2><p>View or update this Chrome installation's saved Buffaly server. Authorization and conversations remain isolated per origin.</p><label>Name<input value={serverName} onChange={(event) => setServerName(event.target.value)} /></label><label>Origin<input value={origin} onChange={(event) => setOrigin(event.target.value)} /></label><div className="server-details"><span>State <b>{stateLabel}</b></span><span>WebModule <b>{serversStatus.Version || 'Not detected'}</b></span><span>Authorized <b>{serversStatus.Servers.find((server) => server.ServerId === serversStatus.ActiveServer?.ServerId)?.Authorized ? 'Yes' : 'No'}</b></span></div>{error && <div className="settings-error">{error}</div>}<div className="modal-actions"><button className="disconnect" onClick={removeActiveServer} disabled={!!busy}>Remove</button><span /><button className="secondary" onClick={() => setShowServerSettings(false)}>Cancel</button><button className="primary" onClick={saveNewServer} disabled={!!busy || !serverName.trim() || !origin.trim()}>Save changes</button></div></section></div>}
    <nav className="primary-tabs" aria-label="Side panel views"><button className={panelMode === 'chat' ? 'selected' : ''} onClick={() => selectPanelMode('chat')} aria-current={panelMode === 'chat' ? 'page' : undefined}>Chat</button><button className={panelMode === 'agent' ? 'selected' : ''} onClick={() => selectPanelMode('agent')} aria-current={panelMode === 'agent' ? 'page' : undefined}>Agent <span>{toolLog.length}</span></button>{panelMode === 'chat' && conversation && <><button className="new-conversation" onClick={newConversation} disabled={!!busy}>New</button><button className="popout-conversation" onClick={openConversationTab} disabled={!!busy} aria-label="Open conversation in a full tab" title="Open in full tab">↗</button></>}</nav>
    <section className={`workspace ${conversation ? 'embedded' : ''}`} hidden={panelMode !== 'chat'} inert={panelMode !== 'chat' ? true : undefined}>{connected && conversation ? <div className="embed-shell">{microphoneError && <div className="microphone-help"><strong>Microphone access failed for this Buffaly server.</strong><span>{microphoneError.name}: {microphoneError.message}</span>{microphoneDiagnostic && <span>Origin: {microphoneDiagnostic.origin}; policy: {String(microphoneDiagnostic.policyAllowsMicrophone)}; permission: {microphoneDiagnostic.permissionState}; result: {microphoneDiagnostic.result}</span>}<button className="dismiss" onClick={() => setMicrophoneError(null)}>Dismiss</button></div>}<iframe ref={conversationFrame} title="Buffaly session" src={conversationUrl(conversation)} allow="clipboard-read; clipboard-write; microphone" /></div> : <div className="welcome"><img src={logo128Url} alt="Buffaly" /><p className="eyebrow">BUFFALY + THIS PAGE</p><h1>{serversStatus.ActiveServer ? serversStatus.ActiveServer.Name : 'Add a Buffaly server'}</h1><p>{serversStatus.State === 'Ready' ? 'This Chrome is authorized. Start a bound conversation for the current page.' : serversStatus.State === 'SignInRequired' ? 'This server is reachable. Sign in once to authorize this Chrome installation.' : serversStatus.State === 'WebModuleMissing' ? 'This Buffaly server does not have the ExtensionBrowser WebModule installed.' : 'Choose or add a reachable Buffaly server. Remote and Tailscale servers must use HTTPS.'}</p>{error && <div className="settings-error">{error}</div>}{serversStatus.State === 'SignInRequired' && <button className="connect-button" onClick={connect} disabled={!!busy}>Sign in and authorize this Chrome <span>{busy ? 'Connecting…' : 'Open sign-in'}</span></button>}{serversStatus.State === 'Ready' && <button className="connect-button" onClick={newConversation} disabled={!!busy}>New conversation <span>Bound to Chrome</span></button>}</div>}</section>
    <section className="agent-panel" hidden={panelMode !== 'agent'} inert={panelMode !== 'agent' ? true : undefined}><section className="page-card" aria-label="Current page"><div className="page-icon">↗</div><div className="page-copy"><span>Working on</span><strong>{activeTab?.title || 'Current page'}</strong><small>{activeTab?.url || 'Open a web page to begin'}</small></div><button className="icon-button" onClick={refreshStatus} aria-label="Refresh page context">↻</button></section><section className={`control-card ${debuggerAttached ? 'enabled' : ''}`}><div><strong>{debuggerAttached ? 'Buffaly can act on this tab' : 'Page access is ready'}</strong><p>{debuggerAttached ? 'Trusted clicks and typing are enabled.' : 'Enable control when this conversation needs to click or type.'}</p></div><button onClick={debuggerAttached ? pauseControl : enableControl} disabled={busy === 'control'}>{debuggerAttached ? 'Pause' : 'Enable'}</button></section><div className="activity-heading"><div><span>Browser activity</span><small>Actions from this conversation</small></div><b>{toolLog.length}</b></div><div className="activity-panel">{toolLog.length === 0 ? <div className="activity-empty"><b>✓</b><h2>No browser activity yet</h2><p>Actions from this bound conversation will appear here.</p></div> : toolLog.slice().reverse().map((entry) => <article key={entry.id} className={`activity-row ${entry.status}`}><i>{entry.status === 'success' ? '✓' : entry.status === 'error' ? '!' : '·'}</i><div><strong>{entry.tool.replaceAll('_', ' ')}</strong><small>{new Date(entry.timestamp).toLocaleTimeString()} · {entry.status}</small></div></article>)}</div></section>
  </main>;
}
