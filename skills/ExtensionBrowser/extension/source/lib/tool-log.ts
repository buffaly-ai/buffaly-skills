import type { ToolLogEntry, ToolResult } from './types';

// ─── In-memory tool log (broadcast to side panel) ───

const MAX_LOG_ENTRIES = 200;
const logEntries: ToolLogEntry[] = [];
let logVersion = 0;

export function addLogEntry(tool: string, args: Record<string, unknown>): string {
  const id = `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const entry: ToolLogEntry = {
    id,
    timestamp: Date.now(),
    tool,
    args,
    result: null,
    status: 'pending',
  };
  logEntries.push(entry);
  if (logEntries.length > MAX_LOG_ENTRIES) {
    logEntries.shift();
  }
  logVersion++;
  broadcastLog();
  return id;
}

export function updateLogEntry(id: string, result: ToolResult): void {
  const entry = logEntries.find((e) => e.id === id);
  if (entry) {
    entry.result = result;
    entry.status = result.ok ? 'success' : 'error';
    logVersion++;
    broadcastLog();
  }
}

export function getLogEntries(): ToolLogEntry[] {
  return [...logEntries];
}

export function getLogVersion(): number {
  return logVersion;
}

function broadcastLog(): void {
  // Broadcast to all extension pages (side panel)
  chrome.runtime.sendMessage({
    type: 'tool_log_update',
    entries: getLogEntries(),
    version: logVersion,
  }).catch(() => {
    // Side panel may not be open — ignore errors
  });
}