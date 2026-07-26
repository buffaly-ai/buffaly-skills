// Content script — injected into pages for DOM operations.
// WXT auto-registers this as a content script.
// The background uses chrome.scripting.executeScript for most operations,
// so this content script is primarily for the element map and
// can be extended for recording (phase 2).

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  main() {
    // Mark that content script is loaded
    (window as any).__browserAgentCloneLoaded = true;

    // Listen for direct messages (if needed for recording phase)
    chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
      if (request.type === 'content_script_ping') {
        sendResponse({ ok: true, url: window.location.href });
        return false;
      }
      return false;
    });
  },
});