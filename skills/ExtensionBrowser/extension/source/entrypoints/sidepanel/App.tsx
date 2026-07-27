import { useState, useEffect, useCallback } from 'react';
import type { ToolResult, ToolLogEntry } from '../../lib/types';
import { handleToolCall } from '../../lib/tool-router';

async function callTool(tool: string, args: Record<string, unknown> = {}): Promise<ToolResult> {
  return new Promise((resolve) => chrome.runtime.sendMessage({ type: 'tool_call', tool, args }, resolve));
}

interface ActiveTab { tabId: number; url: string; title: string }
interface ConversationBootstrap { Origin: string; ConversationSlotId: string; SessionBindingId: string; DisplayName: string; NavigationToken: string }
interface WorkerResponse<T> { ok: boolean; data?: T; error?: string }
type View = 'work' | 'activity';
const originStorageKey = 'BuffalyOrigin';
const defaultOrigin = 'http://127.0.0.1:5016';

function conversationUrl(bootstrap: ConversationBootstrap): string {
  const url = new URL('/web-modules/ExtensionBrowser/conversation', bootstrap.Origin);
  url.searchParams.set('presentation', 'sidepanel');
  url.searchParams.set('navigationToken', bootstrap.NavigationToken);
  return url.toString();
}

export default function App() {
  const logo48Url = chrome.runtime.getURL('icon/48.png');
  const logo128Url = chrome.runtime.getURL('icon/128.png');
  const [toolLog, setToolLog] = useState<ToolLogEntry[]>([]);
  const [debuggerAttached, setDebuggerAttached] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab | null>(null);
  const [view, setView] = useState<View>('work');
  const [busy, setBusy] = useState('');
  const [connected, setConnected] = useState(false);
  const [conversation, setConversation] = useState<ConversationBootstrap | null>(null);
  const [origin, setOrigin] = useState(defaultOrigin);
  const [error, setError] = useState('');

  const refreshStatus = useCallback(async () => {
    const result = await callTool('get_status');
    if (!result.ok) return;
    const data = result.data as { debuggerAttached: boolean; activeTab: ActiveTab | null };
    setDebuggerAttached(data.debuggerAttached); setActiveTab(data.activeTab);
  }, []);

  useEffect(() => {
    Promise.all([
      chrome.runtime.sendMessage({ type: 'get_buffaly_connection_status' }),
      chrome.runtime.sendMessage({ type: 'get_buffaly_conversation_bootstrap' }),
      chrome.storage.local.get(originStorageKey),
    ]).then(([status, bootstrap, stored]) => {
      if (status.ok) setConnected(Boolean(status.data.Connected));
      if (bootstrap.ok && bootstrap.data) setConversation(bootstrap.data as ConversationBootstrap);
      if (stored[originStorageKey]) setOrigin(stored[originStorageKey] as string);
    }).catch((reason) => setError(reason instanceof Error ? reason.message : String(reason)));
  }, []);

  useEffect(() => {
    refreshStatus();
    const boundToolPort = chrome.runtime.connect({ name: 'bound-tool-executor' });
    boundToolPort.onMessage.addListener((msg: { type: string; requestId: string; tool?: string; args?: Record<string, unknown> }) => {
      if (msg.type !== 'execute_bound_tool' || !msg.tool) return;
      handleToolCall(msg.tool, msg.args || {})
        .then((result) => boundToolPort.postMessage({ type: 'bound_tool_result', requestId: msg.requestId, result }))
        .catch((reason: Error) => boundToolPort.postMessage({ type: 'bound_tool_result', requestId: msg.requestId, error: reason.message }));
    });
    const runtimeListener = (msg: { type: string; entries?: ToolLogEntry[] }) => {
      if (msg.type === 'tool_log_update' && msg.entries) setToolLog(msg.entries);
    };
    const tabListener = () => refreshStatus();
    chrome.runtime.onMessage.addListener(runtimeListener); chrome.tabs.onActivated.addListener(tabListener); chrome.tabs.onUpdated.addListener(tabListener);
    return () => { boundToolPort.disconnect(); chrome.runtime.onMessage.removeListener(runtimeListener); chrome.tabs.onActivated.removeListener(tabListener); chrome.tabs.onUpdated.removeListener(tabListener); };
  }, [refreshStatus]);

  const connect = useCallback(async () => {
    setBusy('connect'); setError('');
    try {
      const authorization = await chrome.runtime.sendMessage({ type: 'authorize_buffaly_installation', origin }) as WorkerResponse<{ Origin: string }> | undefined;
      if (!authorization) throw new Error('The ExtensionBrowser service worker did not answer. Reload the extension and reopen the side panel.');
      if (!authorization.ok || !authorization.data) throw new Error(authorization.error || 'Buffaly authorization failed.');
      await chrome.storage.local.set({ [originStorageKey]: authorization.data.Origin });
      setConnected(true);
      const created = await chrome.runtime.sendMessage({ type: 'create_buffaly_conversation', displayName: 'Chrome conversation' }) as WorkerResponse<ConversationBootstrap> | undefined;
      if (!created?.ok || !created.data) throw new Error(created?.error || 'The bound conversation could not be created.');
      setConversation(created.data as ConversationBootstrap);
    } catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); }
    finally { setBusy(''); }
  }, [origin]);

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

  const enableControl = useCallback(async () => { setBusy('control'); chrome.runtime.sendMessage({ type: 'grant_debugger_consent' }); await callTool('attach_debugger'); setBusy(''); await refreshStatus(); }, [refreshStatus]);
  const pauseControl = useCallback(async () => { setBusy('control'); await callTool('detach_debugger'); chrome.runtime.sendMessage({ type: 'revoke_debugger_consent' }); setBusy(''); await refreshStatus(); }, [refreshStatus]);

  return <main className="app">
    <header className="topbar"><div className="brand"><img src={logo48Url} alt="" /><div><strong>Buffaly</strong><span>{conversation ? 'Connected conversation' : 'Browser workspace'}</span></div></div><span className={`live-state ${connected ? 'active' : ''}`}><i />{connected ? 'Connected' : 'Setup'}</span></header>
    <section className="page-card" aria-label="Current page"><div className="page-icon">↗</div><div className="page-copy"><span>Working on</span><strong>{activeTab?.title || 'Current page'}</strong><small>{activeTab?.url || 'Open a web page to begin'}</small></div><button className="icon-button" onClick={refreshStatus} aria-label="Refresh page context">↻</button></section>
    <section className={`control-card ${debuggerAttached ? 'enabled' : ''}`}><div><strong>{debuggerAttached ? 'Buffaly can act on this tab' : 'Page access is ready'}</strong><p>{debuggerAttached ? 'Trusted clicks and typing are enabled.' : 'Enable control when this conversation needs to click or type.'}</p></div><button onClick={debuggerAttached ? pauseControl : enableControl} disabled={busy === 'control'}>{debuggerAttached ? 'Pause' : 'Enable'}</button></section>
    <nav className="tabs" aria-label="Workspace views"><button className={view === 'work' ? 'selected' : ''} onClick={() => setView('work')}>Chat</button><button className={view === 'activity' ? 'selected' : ''} onClick={() => setView('activity')}>Activity <span>{toolLog.length}</span></button>{conversation && <button className="new-conversation" onClick={newConversation} disabled={!!busy}>New</button>}</nav>
    {view === 'work' ? <section className={`workspace ${conversation ? 'embedded' : ''}`}>{connected && conversation ? <div className="embed-shell"><iframe title="Buffaly session" src={conversationUrl(conversation)} allow="clipboard-read; clipboard-write; microphone" /></div> : <div className="welcome"><img src={logo128Url} alt="Buffaly" /><p className="eyebrow">BUFFALY + THIS PAGE</p><h1>Chat with this page</h1><p>Connect once. Buffaly will create a conversation automatically bound to this Chrome installation.</p><label className="origin-field">Buffaly origin<input value={origin} onChange={(event) => setOrigin(event.target.value)} /></label>{error && <div className="settings-error">{error}</div>}<button className="connect-button" onClick={connect} disabled={!!busy}>Authorize Buffaly <span>{busy ? 'Connecting…' : 'Open sign-in'}</span></button></div>}</section> : <section className="activity-panel">{toolLog.length === 0 ? <div className="activity-empty"><b>✓</b><h2>No browser activity yet</h2><p>Actions from this bound conversation will appear here.</p></div> : toolLog.slice().reverse().map((entry) => <article key={entry.id} className={`activity-row ${entry.status}`}><i>{entry.status === 'success' ? '✓' : entry.status === 'error' ? '!' : '·'}</i><div><strong>{entry.tool.replaceAll('_', ' ')}</strong><small>{new Date(entry.timestamp).toLocaleTimeString()} · {entry.status}</small></div></article>)}</section>}
  </main>;
}
