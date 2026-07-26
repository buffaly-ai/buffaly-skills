# Buffaly Browser Workspace Design

## 1. Purpose
Redesign the ExtensionBrowser side panel from a developer command console into a trustworthy Buffaly browser-agent workspace. The design borrows proven interaction patterns from Claude for Chrome—persistent conversation, page awareness, visible autonomy state, takeover, activity history, and safety confirmations—without copying Anthropic branding or coupling Buffaly to Claude-specific services.

## 2. Current State
`entrypoints/sidepanel/App.tsx` renders a header, a dominant debugger attach button, four quick tools, a local message transcript, tool log, and a text input. The text input is not an agent: it recognizes six hard-coded commands. `background.ts` exposes a central typed router; DOM tools use `chrome.scripting`, while privileged input/screenshot/console operations require side-panel consent before `chrome.debugger` attachment. `lib/bridge.js` lets Buffaly call that router through the extension service worker.

## 3. Current Call Chain
```text
Side-panel button or local command
  -> chrome.runtime.sendMessage({ type: "tool_call", tool, args })
  -> background.ts authorization + tool-router.ts
  -> chrome.scripting / chrome.tabs / chrome.debugger
  -> ToolResult
  -> side-panel transcript + tool log

Buffaly typed action
  -> local bridge POST /tool
  -> CDP Runtime.evaluate(self.__callTool)
  -> same tool router and ToolResult
```

## 4. Problems
- The free-text box visually promises AI conversation but is only a command parser.
- Debugger terminology is implementation detail and makes the safest default state look broken.
- Active page context, access scope, and what Buffaly is doing are not prominent.
- Tool results are undifferentiated text blocks; activity and conversation compete for space.
- Empty state teaches syntax rather than user outcomes.
- There is no contract for embedding or connecting a Buffaly session.
- Branding is generic despite the extension being a Buffaly product.

## 5. Target State
The side panel is a hybrid workspace:
1. A native extension shell always owns Buffaly branding, current-page context, browser-control consent, pause/takeover, quick page actions, and auditable activity.
2. A Buffaly workspace occupies the primary content area. Initially it provides honest local browser commands and useful native actions. A later authenticated host contract can render a full Buffaly session in a sandboxed iframe.
3. The iframe never receives direct `chrome.*` or service-worker tool access. Agent work continues through Buffaly's typed ExtensionBrowser actions and the existing bridge.

The first implementation batch ships the native shell, page card, safer terminology, workspace/activity views, outcome-oriented empty state, and responsive visual system. It does not invent a Buffaly host URL or authentication protocol.

## 6. Target Call Chains
```text
Native quick action
  -> callTool()
  -> existing background typed router
  -> ToolResult + native activity stream

Embedded Buffaly session
  -> configured HTTP(S) Buffaly origin + explicit session key
  -> Buffaly session invokes typed ExtensionBrowser action
  -> local bridge -> existing background typed router
  -> result returns to Buffaly session

Iframe postMessage (future)
  -> navigation/context-only events with exact origin validation
  -> never raw tool execution or debugger-consent grants
```

## 7. File-by-File Change Plan
- `entrypoints/sidepanel/App.tsx`: restructure into branded header, page-context card, control banner, Work/Activity views, outcome actions, transcript, and explicitly labeled quick-command fallback. Preserve existing tool routing and debugger consent mechanics.
- `entrypoints/sidepanel/style.css`: replace generic gray/blue styling with Buffaly cream/ink/coral visual tokens, high-density responsive layout, accessible focus/disabled states, and motion-reduction support.
- `wxt.config.ts`: later add `storage` only when a real host-configuration contract is implemented; no speculative permissions in this batch.
- `entrypoints/sidepanel/App.tsx`: validates and persists one `BuffalyEmbedSettings` record, constructs the fixed Next-shell URL, and owns connect/disconnect lifecycle. No iframe-to-extension tool message channel exists.
- `README.md` and `PRIVACY.md` (future embed batch): document configured host, authentication, iframe data flow, and retention boundaries before enabling it.

## 8. Representative Contract
Implemented extension configuration:
```ts
interface BuffalyEmbedSettings {
  Origin: string;
  SessionKey: string;
}
```
Allowed iframe messages should be a closed union such as `embed_ready`, `session_changed`, and `request_takeover`. Tool names, selectors, arbitrary URLs, debugger consent, and raw page content must not be accepted from `postMessage`.

## 9. State Model
- `controlState`: `ready | controlling`; derived from debugger attachment.
- `activeTab`: URL/title; refreshed on mount and Chrome tab activation/update.
- `workspaceView`: `work | activity`; panel-local.
- `messages`: local native action feedback; panel-lifetime only.
- `toolLog`: service-worker audit entries; authoritative for current extension worker lifecycle.
- Future `buffalyConnection`: `unconfigured | connecting | connected | error`; host configuration in `chrome.storage.local`, credentials owned by the Buffaly origin.

## 10. UI / UX
- Header: canonical Buffaly product mark, packaged as valid 16, 48, and 128 pixel PNG assets and resolved through `chrome.runtime.getURL`, plus the “Buffaly” wordmark, browser-workspace subtitle, and compact live state.
- Page card: hostname, title/URL, refresh, and clear access wording.
- Control banner: “Enable browser control” rather than “attach debugger,” with an explanation that page reading remains lower privilege. Active state offers “Pause control.”
- Work: logo-led welcome, suggested outcomes (summarize/read, inspect interactive elements, screenshot), and concise result cards.
- Activity: chronological typed tool log with success/error/running states.
- Composer: explicitly “Quick browser command,” not an AI chat promise. The future Buffaly embed replaces this area with the actual session composer.
- Loading/error/empty states remain usable at narrow Chrome side-panel widths.

## 11. Acceptance Criteria
- Buffaly icon and name are immediately visible without consuming excessive vertical space.
- Current page hostname and URL are visible and refresh when active tabs change.
- Users can read page text and inspect DOM without enabling debugger control.
- Screenshot remains disabled until explicit user control consent.
- Enable/pause controls preserve the existing consent grant/revoke behavior.
- Work and Activity content are separate and keyboard accessible.
- The UI never labels the local parser as general AI chat.
- Existing bridge and tool-router contracts are unchanged.
- `npm run release:check` passes.

## 12. Validation
1. `npm ci` and `npm run release:check`.
2. Load `.output/chrome-mv3` in the dedicated Google Chrome profile.
3. Confirm side panel at minimum and expanded widths; inspect focus, scroll, empty, action-result, activity, controlling, and error states.
4. Verify page text and DOM tools before debugger attachment.
5. Verify screenshot disabled before consent and works after the side-panel control action.
6. Verify external bridge health reports `mode: extension` and representative typed actions still pass.

## 13. Risks / Non-Goals
- Prompt-injection defense, scheduled work, workflow recording, tab groups, notifications, and file uploads require separate product/security designs.
- Embedding the full Buffaly application may be blocked by its framing/authentication headers. The host must deliberately expose an embed endpoint; the extension must not weaken web security headers.
- Do not request Anthropic's broad permission set until a Buffaly feature requires each permission.
- Do not expose debugger consent to an iframe or remote caller.

## 14. Implementation Notes
Keep the typed router authoritative. Implement presentation independently of tool semantics. Add embed support only after inspecting the real Buffaly session creation/authentication API and defining exact origin/CSP behavior. Validate and commit each coherent batch; publish a new package version only after Chrome extension-mode validation.
