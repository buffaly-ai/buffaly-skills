import { handleToolCall, grantDebuggerConsent, revokeDebuggerConsent } from '../lib/tool-router';
import { detachDebugger, isAttached } from '../lib/debugger-session';
import { getLogEntries, getLogVersion } from '../lib/tool-log';
import { InstallationChannel, loadConnection } from '../lib/buffaly-connection';

let installationChannel: InstallationChannel | null = null;

async function startInstallationChannel(): Promise<void> {
  const connection = await loadConnection();
  if (!connection) return;
  installationChannel?.stop();
  installationChannel = new InstallationChannel(connection, handleToolCall);
  await installationChannel.start();
}

// Export the CDP bridge hook at module evaluation time. WXT's lifecycle
// callback can run after Chrome exposes the MV3 worker DevTools target, while
// Buffaly must be able to observe this hook as soon as worker startup resumes.
(self as any).__callTool = (tool: string, args: Record<string, unknown> = {}) =>
  handleToolCall(tool, args);

export default defineBackground(() => {
	void startInstallationChannel();
  // ─── Side Panel: Enable open-on-toolbar-click ───
  // CRITICAL: The manifest side_panel.default_path alone does NOT make the
  // toolbar icon open the side panel. This call is required.
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((err) => console.error('Failed to set side panel behavior:', err));

  // ─── Message Handler: Tool Calls from Side Panel ───

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'tool_call') {
      if (sender.id !== chrome.runtime.id || sender.tab !== undefined) {
        sendResponse({ ok: false, error: 'Unauthorized: tool calls can only originate from the extension side panel' });
        return false;
      }
      handleToolCall(request.tool, request.args)
        .then((result: unknown) => sendResponse(result))
        .catch((err: Error) => sendResponse({ ok: false, error: err.message }));
      return true; // async response
    }

    if (request.type === 'buffaly_connection_changed') {
      if (sender.id !== chrome.runtime.id || sender.tab !== undefined) {
        sendResponse({ ok: false, error: 'Unauthorized: connection changes can only originate from an extension page' });
        return false;
      }
      startInstallationChannel()
        .then(() => sendResponse({ ok: true }))
        .catch((err: Error) => sendResponse({ ok: false, error: err.message }));
      return true;
    }

    // ─── Debugger Consent: Only extension pages (side panel) can grant consent ───
    // Validates sender is from this extension's own pages (not content scripts or
    // other extensions). Content scripts have sender.tab set; extension pages don't.
    // Note: Buffaly connects via CDP Runtime.evaluate, which bypasses the message
    // system entirely — Buffaly is an authorized caller at the CDP trust boundary.
    if (request.type === 'grant_debugger_consent') {
      if (sender.id !== chrome.runtime.id || sender.tab !== undefined) {
        sendResponse({ ok: false, error: 'Unauthorized: debugger consent can only be granted from the extension side panel' });
        return false;
      }
      grantDebuggerConsent();
      sendResponse({ ok: true });
      return false;
    }

    if (request.type === 'revoke_debugger_consent') {
      if (sender.id !== chrome.runtime.id || sender.tab !== undefined) {
        sendResponse({ ok: false, error: 'Unauthorized: debugger consent can only be revoked from the extension side panel' });
        return false;
      }
      revokeDebuggerConsent();
      sendResponse({ ok: true });
      return false;
    }

    if (request.type === 'get_tool_log') {
      if (sender.id !== chrome.runtime.id || sender.tab !== undefined) {
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
