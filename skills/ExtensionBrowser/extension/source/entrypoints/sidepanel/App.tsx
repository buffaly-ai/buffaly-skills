import { useState, useEffect, useCallback, useRef } from 'react';
import type { ToolResult, ToolLogEntry } from '../../lib/types';

async function callTool(tool: string, args: Record<string, unknown> = {}): Promise<ToolResult> {
  return new Promise((resolve) => chrome.runtime.sendMessage({ type: 'tool_call', tool, args }, resolve));
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  toolName?: string;
  timestamp: number;
}

interface ActiveTab { tabId: number; url: string; title: string }
type View = 'work' | 'activity';
interface BuffalyEmbedSettings { Origin: string; SessionKey: string }
const defaultEmbedSettings: BuffalyEmbedSettings = { Origin: 'http://127.0.0.1:5016', SessionKey: 'Chrome Extension' };
const embedSettingsKey = 'BuffalyEmbedSettings';

function getEmbedUrl(settings: BuffalyEmbedSettings): string {
  const origin = new URL(settings.Origin);
  if (origin.protocol !== 'http:' && origin.protocol !== 'https:') throw new Error('Buffaly origin must use http or https.');
  if (origin.pathname !== '/' || origin.search || origin.hash) throw new Error('Enter the Buffaly origin only, without a path or query.');
  const url = new URL('/buffaly-agent-next.html', origin);
  url.searchParams.set('hideSessionChrome', 'true');
  url.searchParams.set('sessionKey', settings.SessionKey.trim());
  return url.toString();
}

const hostname = (url: string) => { try { return new URL(url).hostname || 'Current page'; } catch { return 'Current page'; } };

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [toolLog, setToolLog] = useState<ToolLogEntry[]>([]);
  const [debuggerAttached, setDebuggerAttached] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab | null>(null);
  const [view, setView] = useState<View>('work');
  const [busy, setBusy] = useState<string | null>(null);
  const [embedSettings, setEmbedSettings] = useState<BuffalyEmbedSettings>(defaultEmbedSettings);
  const [embedDraft, setEmbedDraft] = useState<BuffalyEmbedSettings>(defaultEmbedSettings);
  const [embedConnected, setEmbedConnected] = useState(false);
  const [embedError, setEmbedError] = useState('');
  const [showEmbedSettings, setShowEmbedSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const addMessage = useCallback((role: ChatMessage['role'], content: string, toolName?: string) => {
    setMessages((items) => [...items, { id: crypto.randomUUID(), role, content, toolName, timestamp: Date.now() }]);
  }, []);

  const refreshStatus = useCallback(async () => {
    const result = await callTool('get_status');
    if (!result.ok) return;
    const data = result.data as { debuggerAttached: boolean; activeTab: ActiveTab | null };
    setDebuggerAttached(data.debuggerAttached);
    setActiveTab(data.activeTab);
  }, []);

  useEffect(() => {
    chrome.storage.local.get(embedSettingsKey).then((stored) => {
      const settings = stored[embedSettingsKey] as BuffalyEmbedSettings | undefined;
      if (!settings) return;
      getEmbedUrl(settings);
      if (!settings.SessionKey.trim()) throw new Error('Stored Buffaly session key is empty.');
      setEmbedSettings(settings);
      setEmbedDraft(settings);
      setEmbedConnected(true);
    }).catch((error) => setEmbedError(error instanceof Error ? error.message : String(error)));
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

  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  const runAction = useCallback(async (tool: string, label: string, args: Record<string, unknown> = {}) => {
    setBusy(tool);
    const result = await callTool(tool, args);
    if (!result.ok) addMessage('assistant', result.error || `${label} failed.`);
    else if (tool === 'get_page_text') {
      const text = (result.data as { text: string }).text;
      addMessage('tool', text.slice(0, 900) + (text.length > 900 ? '…' : ''), label);
    } else if (tool === 'get_dom_snapshot') {
      const data = result.data as { elements: unknown[]; truncated: boolean };
      addMessage('tool', `${data.elements.length} interactive elements found${data.truncated ? ' (showing the first results)' : ''}.`, label);
    } else if (tool === 'screenshot') addMessage('tool', 'Screenshot captured and ready for Buffaly.', label);
    else addMessage('tool', `${label} completed.`, label);
    setBusy(null);
    await refreshStatus();
  }, [addMessage, refreshStatus]);

  const enableControl = useCallback(async () => {
    setBusy('control');
    chrome.runtime.sendMessage({ type: 'grant_debugger_consent' });
    const result = await callTool('attach_debugger');
    if (result.ok) addMessage('assistant', 'Browser control enabled. Buffaly can now use screenshots and trusted input on this tab.');
    else addMessage('assistant', `Could not enable browser control: ${result.error}`);
    setBusy(null);
    await refreshStatus();
  }, [addMessage, refreshStatus]);

  const pauseControl = useCallback(async () => {
    setBusy('control');
    const result = await callTool('detach_debugger');
    if (result.ok) {
      chrome.runtime.sendMessage({ type: 'revoke_debugger_consent' });
      addMessage('assistant', 'Browser control paused. Page-reading tools remain available.');
    }
    setBusy(null);
    await refreshStatus();
  }, [addMessage, refreshStatus]);

  const connectEmbed = useCallback(async () => {
    try {
      getEmbedUrl(embedDraft);
      if (!embedDraft.SessionKey.trim()) throw new Error('Session key is required.');
      await chrome.storage.local.set({ [embedSettingsKey]: embedDraft });
      setEmbedSettings(embedDraft);
      setEmbedError('');
      setEmbedConnected(true);
      setShowEmbedSettings(false);
    } catch (error) {
      setEmbedError(error instanceof Error ? error.message : String(error));
    }
  }, [embedDraft]);

  const disconnectEmbed = useCallback(async () => {
    await chrome.storage.local.remove(embedSettingsKey);
    setEmbedConnected(false);
    setShowEmbedSettings(false);
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    addMessage('user', text);
    const lower = text.toLowerCase();
    if (lower.startsWith('navigate ')) await runAction('navigate', 'Navigate', { url: text.slice(9).trim() });
    else if (['page text', 'get text', 'read page'].includes(lower)) await runAction('get_page_text', 'Page text');
    else if (['dom', 'dom snapshot', 'inspect page'].includes(lower)) await runAction('get_dom_snapshot', 'Page elements');
    else if (lower === 'screenshot') await runAction('screenshot', 'Screenshot');
    else addMessage('assistant', 'This field runs quick browser commands, not a Buffaly conversation yet. Try “read page”, “inspect page”, “screenshot”, or “navigate https://…”.');
  }, [input, addMessage, runAction]);

  return <main className="app">
    <header className="topbar">
      <div className="brand"><img src="/icon/48.png" alt="" /><div><strong>Buffaly</strong><span>Browser workspace</span></div></div>
      <span className={`live-state ${debuggerAttached ? 'active' : ''}`}><i />{debuggerAttached ? 'In control' : 'Ready'}</span>
    </header>

    <section className="page-card" aria-label="Current page">
      <div className="page-icon">↗</div>
      <div className="page-copy"><span>Working on</span><strong>{activeTab?.title || hostname(activeTab?.url || '')}</strong><small>{activeTab?.url || 'Open a web page to begin'}</small></div>
      <button className="icon-button" onClick={refreshStatus} aria-label="Refresh page context">↻</button>
    </section>

    <section className={`control-card ${debuggerAttached ? 'enabled' : ''}`}>
      <div><strong>{debuggerAttached ? 'Buffaly can act on this tab' : 'Page access is ready'}</strong><p>{debuggerAttached ? 'Screenshots and trusted clicks are enabled. You can pause at any time.' : 'Reading and inspection work now. Enable control only when Buffaly needs to click or type.'}</p></div>
      <button onClick={debuggerAttached ? pauseControl : enableControl} disabled={busy === 'control'}>{debuggerAttached ? 'Pause' : 'Enable control'}</button>
    </section>

    <nav className="tabs" aria-label="Workspace views">
      <button className={view === 'work' ? 'selected' : ''} onClick={() => setView('work')}>Work</button>
      <button className={view === 'activity' ? 'selected' : ''} onClick={() => setView('activity')}>Activity <span>{toolLog.length}</span></button>
    </nav>

    {view === 'work' ? <>
      <section className={`workspace ${embedConnected ? 'embedded' : ''}`}>
        {embedConnected ? <div className="embed-shell">
          <div className="embed-toolbar"><span><i />Connected to Buffaly</span><button onClick={() => setShowEmbedSettings(true)}>Settings</button></div>
          <iframe title="Buffaly session" src={getEmbedUrl(embedSettings)} allow="clipboard-read; clipboard-write; microphone" />
        </div> : messages.length === 0 ? <div className="welcome">
          <img src="/icon/128.png" alt="Buffaly" />
          <p className="eyebrow">BUFFALY + THIS PAGE</p>
          <h1>What should we work on?</h1>
          <p>Use a page action now. A connected Buffaly session will bring full conversation, planning, and reusable workflows into this space.</p>
          <div className="suggestions">
            <button onClick={() => runAction('get_page_text', 'Read page')}><b>≡</b><span><strong>Read this page</strong><small>Extract the useful text</small></span></button>
            <button onClick={() => runAction('get_dom_snapshot', 'Inspect page')}><b>⌁</b><span><strong>Inspect actions</strong><small>Find buttons, fields, and links</small></span></button>
            <button onClick={() => runAction('screenshot', 'Screenshot')} disabled={!debuggerAttached}><b>▣</b><span><strong>Capture screen</strong><small>{debuggerAttached ? 'Take a visual snapshot' : 'Enable control first'}</small></span></button>
          </div>
          <button className="connect-button" onClick={() => setShowEmbedSettings(true)}>Connect Buffaly session <span>Configure</span></button>
        </div> : <div className="messages">{messages.map((msg) => <article key={msg.id} className={`message ${msg.role}`}><div><span>{msg.role === 'user' ? 'You' : msg.role === 'tool' ? msg.toolName : 'Buffaly'}</span><time>{new Date(msg.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</time></div><p>{msg.content}</p></article>)}<div ref={messagesEndRef} /></div>}
      </section>
      {!embedConnected && <footer className="composer"><div><input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && handleSend()} placeholder="Quick browser command…" aria-label="Quick browser command" /><button onClick={handleSend} disabled={!input.trim() || !!busy}>↑</button></div><small>Local commands only · Buffaly conversation connection is not configured</small></footer>}
    </> : <section className="activity-panel">{toolLog.length === 0 ? <div className="activity-empty"><b>✓</b><h2>No browser activity yet</h2><p>Actions Buffaly takes will appear here with their result.</p></div> : toolLog.slice().reverse().map((entry) => <article key={entry.id} className={`activity-row ${entry.status}`}><i>{entry.status === 'success' ? '✓' : entry.status === 'error' ? '!' : '·'}</i><div><strong>{entry.tool.replaceAll('_', ' ')}</strong><small>{new Date(entry.timestamp).toLocaleTimeString()} · {entry.status}</small></div></article>)}</section>}

    {showEmbedSettings && <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowEmbedSettings(false)}><section className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="embed-title" onMouseDown={(event) => event.stopPropagation()}>
      <img src="/icon/48.png" alt="" />
      <h2 id="embed-title">Connect a Buffaly session</h2>
      <p>Embed the real Buffaly timeline and composer. Browser permissions remain controlled by this extension shell.</p>
      <label>Buffaly origin<input value={embedDraft.Origin} onChange={(event) => setEmbedDraft({ ...embedDraft, Origin: event.target.value })} placeholder="http://127.0.0.1:5016" /></label>
      <label>Session key<input value={embedDraft.SessionKey} onChange={(event) => setEmbedDraft({ ...embedDraft, SessionKey: event.target.value })} placeholder="Chrome Extension" /></label>
      {embedError && <div className="settings-error">{embedError}</div>}
      <div className="modal-actions">{embedConnected && <button className="disconnect" onClick={disconnectEmbed}>Disconnect</button>}<span /><button className="secondary" onClick={() => setShowEmbedSettings(false)}>Cancel</button><button className="primary" onClick={connectEmbed}>Connect</button></div>
    </section></div>}
  </main>;
}

