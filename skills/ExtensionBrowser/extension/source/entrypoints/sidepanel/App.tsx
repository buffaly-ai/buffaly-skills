import { useState, useEffect, useCallback, useRef } from 'react';
import type { ToolResult, ToolLogEntry } from '../../lib/types';

// ─── Tool Call Helper ───

async function callTool(tool: string, args: Record<string, unknown> = {}): Promise<ToolResult> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'tool_call', tool, args }, (response: ToolResult) => {
      resolve(response);
    });
  });
}

// ─── Message Types ───

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  toolName?: string;
  toolResult?: ToolResult;
  timestamp: number;
}

// ─── App Component ───

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [toolLog, setToolLog] = useState<ToolLogEntry[]>([]);
  const [debuggerAttached, setDebuggerAttached] = useState(false);
  const [status, setStatus] = useState<'idle' | 'controlling'>('idle');
  const [activeTabUrl, setActiveTabUrl] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Listen for tool log updates
  useEffect(() => {
    const listener = (msg: { type: string; entries?: ToolLogEntry[] }) => {
      if (msg.type === 'tool_log_update' && msg.entries) {
        setToolLog(msg.entries);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check status on mount
  useEffect(() => {
    refreshStatus();
  }, []);

  const refreshStatus = useCallback(async () => {
    const result = await callTool('get_status');
    if (result.ok) {
      const data = result.data as { debuggerAttached: boolean; activeTab: { url: string } | null };
      setDebuggerAttached(data.debuggerAttached);
      setStatus(data.debuggerAttached ? 'controlling' : 'idle');
      setActiveTabUrl(data.activeTab?.url ?? '');
    }
  }, []);

  // ─── Debugger Controls ───

  const handleAttachDebugger = useCallback(async () => {
    // Step 1: Grant consent (user gesture — button click proves intent)
    chrome.runtime.sendMessage({ type: 'grant_debugger_consent' });
    // Step 2: Now call attach_debugger (which checks consent)
    const result = await callTool('attach_debugger');
    if (result.ok) {
      setDebuggerAttached(true);
      setStatus('controlling');
      addMessage('assistant', 'Debugger attached. Browser control is now active.');
    } else {
      addMessage('assistant', `Failed to attach debugger: ${result.error}`);
    }
  }, []);

  const handleDetachDebugger = useCallback(async () => {
    const result = await callTool('detach_debugger');
    if (result.ok) {
      setDebuggerAttached(false);
      setStatus('idle');
      addMessage('assistant', 'Debugger detached. Browser control stopped.');
      // Revoke consent so re-attaching requires another button click
      chrome.runtime.sendMessage({ type: 'revoke_debugger_consent' });
    }
  }, []);

  // ─── Quick Tool Buttons ───

  const handleGetPageText = useCallback(async () => {
    addMessage('user', 'Get page text');
    const result = await callTool('get_page_text');
    if (result.ok) {
      const data = result.data as { text: string };
      addMessage('tool', data.text.slice(0, 500) + (data.text.length > 500 ? '...' : ''), 'get_page_text', result);
    } else {
      addMessage('assistant', `Error: ${result.error}`);
    }
  }, []);

  const handleScreenshot = useCallback(async () => {
    addMessage('user', 'Take screenshot');
    const result = await callTool('screenshot');
    if (result.ok) {
      const data = result.data as { dataUrl: string };
      addMessage('tool', 'Screenshot captured', 'screenshot', result);
      // Could display the screenshot in the chat
    } else {
      addMessage('assistant', `Error: ${result.error}`);
    }
  }, []);

  const handleGetDomSnapshot = useCallback(async () => {
    addMessage('user', 'Get DOM snapshot');
    const result = await callTool('get_dom_snapshot');
    if (result.ok) {
      const data = result.data as { elements: unknown[]; truncated: boolean };
      addMessage('tool', `Found ${data.elements.length} interactive elements${data.truncated ? ' (truncated)' : ''}`, 'get_dom_snapshot', result);
    } else {
      addMessage('assistant', `Error: ${result.error}`);
    }
  }, []);

  // ─── Message Handling ───

  const addMessage = useCallback((role: ChatMessage['role'], content: string, toolName?: string, toolResult?: ToolResult) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        role,
        content,
        toolName,
        toolResult,
        timestamp: Date.now(),
      },
    ]);
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setInput('');
    addMessage('user', userText);

    // Simple command parsing (MVP — no LLM in panel)
    const lower = userText.toLowerCase();

    if (lower.startsWith('navigate ')) {
      const url = userText.slice(9).trim();
      const result = await callTool('navigate', { url });
      addMessage('tool', result.ok ? `Navigated to ${url}` : `Error: ${result.error}`, 'navigate', result);
    } else if (lower === 'screenshot') {
      await handleScreenshot();
    } else if (lower === 'page text' || lower === 'get text') {
      await handleGetPageText();
    } else if (lower === 'dom snapshot' || lower === 'snapshot') {
      await handleGetDomSnapshot();
    } else if (lower === 'list tabs') {
      const result = await callTool('list_tabs');
      if (result.ok) {
        const tabs = result.data as { tabId: number; url: string; title: string; active: boolean }[];
        addMessage('tool', tabs.map((t) => `[${t.tabId}] ${t.title} — ${t.url}`).join('\n'), 'list_tabs', result);
      }
    } else if (lower === 'status') {
      await refreshStatus();
      addMessage('assistant', `Status: ${status} | Debugger: ${debuggerAttached ? 'attached' : 'detached'} | Tab: ${activeTabUrl}`);
    } else {
      addMessage('assistant', `Unknown command: "${userText}". Try: navigate <url>, screenshot, page text, dom snapshot, list tabs, status`);
    }
  }, [input, addMessage, handleScreenshot, handleGetPageText, handleGetDomSnapshot, refreshStatus, status, debuggerAttached, activeTabUrl]);

  // ─── Render ───

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <h1>Browser Agent</h1>
        <div className={`status-badge ${status}`}>
          {status === 'controlling' ? '● Controlling browser' : '○ Idle'}
        </div>
      </div>

      {/* Debugger Controls */}
      <div className="debugger-controls">
        {!debuggerAttached ? (
          <button className="btn-attach" onClick={handleAttachDebugger}>
            Attach debugger
          </button>
        ) : (
          <button className="btn-detach" onClick={handleDetachDebugger}>
            Stop (detach)
          </button>
        )}
      </div>

      {/* Quick Tool Buttons */}
      <div className="quick-tools">
        <button onClick={handleGetPageText} title="Get page text">📄 Text</button>
        <button onClick={handleScreenshot} title="Screenshot" disabled={!debuggerAttached}>📸 Screenshot</button>
        <button onClick={handleGetDomSnapshot} title="DOM snapshot">🔍 DOM</button>
        <button onClick={refreshStatus} title="Refresh status">🔄 Status</button>
      </div>

      {/* Messages */}
      <div className="messages">
        {messages.length === 0 && (
          <div className="empty-state">
            <p>Send a command or use the quick tools above.</p>
            <p className="hint">Try: "navigate https://example.com" or "screenshot"</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`message message-${msg.role}`}>
            <div className="message-role">{msg.role}</div>
            <div className="message-content">
              {msg.toolName && <span className="tool-name">{msg.toolName}</span>}
              <pre>{msg.content}</pre>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Tool Log */}
      {toolLog.length > 0 && (
        <details className="tool-log">
          <summary>Tool Log ({toolLog.length})</summary>
          <div className="tool-log-entries">
            {toolLog.slice(-20).reverse().map((entry) => (
              <div key={entry.id} className={`log-entry log-${entry.status}`}>
                <span className="log-time">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                <span className="log-tool">{entry.tool}</span>
                <span className="log-status">{entry.status}</span>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Input */}
      <div className="input-bar">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
          placeholder="Enter command..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}