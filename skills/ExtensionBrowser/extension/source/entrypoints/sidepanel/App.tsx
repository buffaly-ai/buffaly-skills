import { useState, useEffect, useCallback } from 'react';
import type { ToolResult, ToolLogEntry } from '../../lib/types';
import { authorizeInstallation, createConversation, loadConnection, redeemNavigation, type ConversationBinding, type ExtensionConnection } from '../../lib/buffaly-connection';

async function callTool(tool: string, args: Record<string, unknown> = {}): Promise<ToolResult> {
  return new Promise((resolve) => chrome.runtime.sendMessage({ type: 'tool_call', tool, args }, resolve));
}

interface ActiveTab { tabId: number; url: string; title: string }
type View = 'work' | 'activity';
const originStorageKey = 'BuffalyOrigin';
const activeConversationStorageKey = 'BuffalyActiveConversation';
const defaultOrigin = 'http://127.0.0.1:5016';

function conversationUrl(connection: ExtensionConnection, binding: ConversationBinding): string {
  const url = new URL('/buffaly-agent-next.html', connection.Origin);
  url.searchParams.set('hideSessionChrome', 'true');
  url.searchParams.set('presentation', 'sidepanel');
  url.searchParams.set('sessionKey', binding.SessionKey);
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
  const [connection, setConnection] = useState<ExtensionConnection | null>(null);
  const [conversation, setConversation] = useState<ConversationBinding | null>(null);
  const [origin, setOrigin] = useState(defaultOrigin);
  const [error, setError] = useState('');

  const refreshStatus = useCallback(async () => {
    const result = await callTool('get_status');
    if (!result.ok) return;
    const data = result.data as { debuggerAttached: boolean; activeTab: ActiveTab | null };
    setDebuggerAttached(data.debuggerAttached);
    setActiveTab(data.activeTab);
  }, []);

  useEffect(() => {
    Promise.all([loadConnection(), chrome.storage.local.get([originStorageKey, activeConversationStorageKey])]).then(([savedConnection, stored]) => {
      if (savedConnection) setConnection(savedConnection);
      if (stored[originStorageKey]) setOrigin(stored[originStorageKey] as string);
      if (stored[activeConversationStorageKey]) setConversation(stored[activeConversationStorageKey] as ConversationBinding);
    }).catch((reason) => setError(reason instanceof Error ? reason.message : String(reason)));
  }, []);

  useEffect(() => {
    refreshStatus();
    const runtimeListener = (msg: { type: string; entries?: ToolLogEntry[] }) => {
      if (msg.type === 'tool_log_update' && msg.entries) setToolLog(msg.entries);
    };
    const tabListener = () => refreshStatus();
    chrome.runtime.onMessage.addListener(runtimeListener);
    chrome.tabs.onActivated.addListener(tabListener);
    chrome.tabs.onUpdated.addListener(tabListener);
    return () => {
      chrome.runtime.onMessage.removeListener(runtimeListener);
      chrome.tabs.onActivated.removeListener(tabListener);
      chrome.tabs.onUpdated.removeListener(tabListener);
    };
  }, [refreshStatus]);

  const connect = useCallback(async () => {
    setBusy('connect'); setError('');
    try {
      const value = await authorizeInstallation(origin);
      await chrome.storage.local.set({ [originStorageKey]: value.Origin });
      await chrome.runtime.sendMessage({ type: 'buffaly_connection_changed' });
      setConnection(value);
      const slotId = crypto.randomUUID();
      const created = await createConversation(value, 'CreateNew', slotId, 'Chrome conversation');
      await redeemNavigation(value, created.NavigationToken);
      const binding = { ConversationSlotId: created.ConversationSlotId, SessionBindingId: created.SessionBindingId, SessionKey: created.SessionKey, DisplayName: created.DisplayName };
      await chrome.storage.local.set({ [activeConversationStorageKey]: binding });
      setConversation(binding);
    } catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); }
    finally { setBusy(''); }
  }, [origin]);

  const newConversation = useCallback(async () => {
    if (!connection) return;
    setBusy('new'); setError('');
    try {
      const created = await createConversation(connection, 'CreateNew', crypto.randomUUID(), 'Chrome conversation');
      await redeemNavigation(connection, created.NavigationToken);
      const binding = { ConversationSlotId: created.ConversationSlotId, SessionBindingId: created.SessionBindingId, SessionKey: created.SessionKey, DisplayName: created.DisplayName };
      await chrome.storage.local.set({ [activeConversationStorageKey]: binding });
      setConversation(binding);
    } catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); }
    finally { setBusy(''); }
  }, [connection]);

  const enableControl = useCallback(async () => {
    setBusy('control');
    chrome.runtime.sendMessage({ type: 'grant_debugger_consent' });
    await callTool('attach_debugger');
    setBusy(''); await refreshStatus();
  }, [refreshStatus]);

  const pauseControl = useCallback(async () => {
    setBusy('control'); await callTool('detach_debugger');
    chrome.runtime.sendMessage({ type: 'revoke_debugger_consent' });
    setBusy(''); await refreshStatus();
  }, [refreshStatus]);

  return <main className="app">
    <header className="topbar">
      <div className="brand"><img src={logo48Url} alt="" /><div><strong>Buffaly</strong><span>{conversation ? 'Connected conversation' : 'Browser workspace'}</span></div></div>
      <span className={`live-state ${connection ? 'active' : ''}`}><i />{connection ? 'Connected' : 'Setup'}</span>
    </header>
    <section className="page-card" aria-label="Current page">
      <div className="page-icon">↗</div><div className="page-copy"><span>Working on</span><strong>{activeTab?.title || 'Current page'}</strong><small>{activeTab?.url || 'Open a web page to begin'}</small></div>
      <button className="icon-button" onClick={refreshStatus} aria-label="Refresh page context">↻</button>
    </section>
    <section className={`control-card ${debuggerAttached ? 'enabled' : ''}`}>
      <div><strong>{debuggerAttached ? 'Buffaly can act on this tab' : 'Page access is ready'}</strong><p>{debuggerAttached ? 'Trusted clicks and typing are enabled.' : 'Enable control when this conversation needs to click or type.'}</p></div>
      <button onClick={debuggerAttached ? pauseControl : enableControl} disabled={busy === 'control'}>{debuggerAttached ? 'Pause' : 'Enable'}</button>
    </section>
    <nav className="tabs" aria-label="Workspace views"><button className={view === 'work' ? 'selected' : ''} onClick={() => setView('work')}>Chat</button><button className={view === 'activity' ? 'selected' : ''} onClick={() => setView('activity')}>Activity <span>{toolLog.length}</span></button>{conversation && <button className="new-conversation" onClick={newConversation} disabled={!!busy}>New</button>}</nav>
    {view === 'work' ? <section className={`workspace ${conversation ? 'embedded' : ''}`}>
      {connection && conversation ? <div className="embed-shell"><iframe title="Buffaly session" src={conversationUrl(connection, conversation)} allow="clipboard-read; clipboard-write; microphone" /></div> : <div className="welcome">
        <img src={logo128Url} alt="Buffaly" /><p className="eyebrow">BUFFALY + THIS PAGE</p><h1>Chat with this page</h1><p>Connect once. Buffaly will create a conversation that is automatically bound to this Chrome installation.</p>
        <label className="origin-field">Buffaly origin<input value={origin} onChange={(event) => setOrigin(event.target.value)} /></label>
        {error && <div className="settings-error">{error}</div>}
        <button className="connect-button" onClick={connect} disabled={!!busy}>Authorize Buffaly <span>{busy ? 'Connecting…' : 'Open sign-in'}</span></button>
      </div>}
    </section> : <section className="activity-panel">{toolLog.length === 0 ? <div className="activity-empty"><b>✓</b><h2>No browser activity yet</h2><p>Actions from this bound conversation will appear here.</p></div> : toolLog.slice().reverse().map((entry) => <article key={entry.id} className={`activity-row ${entry.status}`}><i>{entry.status === 'success' ? '✓' : entry.status === 'error' ? '!' : '·'}</i><div><strong>{entry.tool.replaceAll('_', ' ')}</strong><small>{new Date(entry.timestamp).toLocaleTimeString()} · {entry.status}</small></div></article>)}</section>}
  </main>;
}
