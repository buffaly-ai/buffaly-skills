# Use CDP Browser Skill

Use this prompt skill only when the user explicitly asks to use, control, inspect, or automate a web browser via CDP (Chrome DevTools Protocol), real Chrome via CDP, existing-login preservation, or trusted CDP input.

## CDP Browser capability stack

- `UseCdpBrowserSkill` is the prompt/routing entry point for CDP-based browser automation.
- `CdpBrowserSkill` is the deterministic browser primitive surface backed by `chrome-remote-interface` and the user's real Chrome.
- Generic browser requests route to `UseBrowserSkill` / Browser Skill instead of CdpBrowser. CdpBrowser remains an explicit CDP/real-Chrome alternative until the C# CDP default-browser migration is complete.
- Connects to an already-running caller-selected Chrome CDP endpoint. It does not own registered managed-browser recovery.
- Creates a new dedicated tab (does not touch user's existing tabs).
- Uses trusted CDP input events (`isTrusted=true`) for all Tier 1 interactions.

## When to use CdpBrowser vs Browser Skill

Use `UseBrowserSkill` for unqualified browser requests. Use CdpBrowser only when the request or evidence explicitly points to CDP/Chrome DevTools Protocol, real Chrome, existing login/cookies, browser extensions, anti-bot detection, or trusted CDP input.

If the intended browser is registered as a persistent/default or existing-login managed browser, route to `UseBrowserSkill` and `ToOpenManagedCdpBrowserSession` even when CDP is involved. That action owns approved launcher recovery and does not require Tier 2 approval. CdpBrowser's raw port/profile lifecycle actions are only for explicit unmanaged diagnostics.

### Use CdpBrowser when:
- The site has anti-bot detection (Cloudflare, reCAPTCHA, etc.)
- The user needs their real logins/cookies
- The user wants to see the browser window
- Playwright driver is broken or missing
- The site requires real browser extensions
- The site checks `navigator.webdriver`
- The site requires trusted input events (React apps that ignore synthetic events)

### Use Browser Skill when:
- The user asks generically to use/control/automate a browser
- BrowserSession-compatible selector, DOM, screenshot, console, and JavaScript primitives are enough
- There is no explicit CDP/real-Chrome requirement

### Use Playwright only when:
- The user explicitly asks for Playwright
- An isolated Playwright browser or Playwright-style automation is required
- An evidence-driven fallback selects Playwright

## Tier usage rules

1. Default to Tier 1 actions for all browser interaction. Tier 1 actions are always available and use trusted CDP events.
2. Before using any Tier 2 action, ask the user for explicit approval, then call `ToApproveCdpAdvancedActions`.
3. Use `ToRunCdpScript` (Tier 2) only when Tier 1 actions cannot express the needed operation.
4. Use `ToRunCdpMutationScript` (Tier 2) only when DOM modification via JS is required.
5. Use `ToRunCdpAutomation` (Tier 2) only for complex multi-step CDP workflows.
6. Browser fingerprint modification actions (`ToSetCdpUserAgent`, `ToSetCdpDeviceMetrics`, etc.) are for debugging your own sites only.
7. If a Tier 2 action returns "Error: Tier 2 actions require approval", ask the user for approval and call `ToApproveCdpAdvancedActions`.

## Chrome setup

Before using raw CdpBrowser actions against an unmanaged custom endpoint, Chrome must already be running with remote debugging enabled:

`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome --remote-debugging-port=9222 --user-data-dir=~/.buffaly/chrome-debug-profile --no-first-run --no-default-browser-check`

Use `ToLaunchCdpChrome` only when the user explicitly requests a caller-selected custom port/profile diagnostic and approves Tier 2. Never use it to recover a registered persistent/default browser; call `ToOpenManagedCdpBrowserSession` instead.

## Session lifecycle

1. `ToOpenCdpBrowserSession(port=9222, url="https://example.com")` -- connects to Chrome, creates a new tab
2. Use Tier 1 actions for navigation, clicking, typing, screenshots, text extraction
3. Use Tier 2 actions (with approval) for JS execution, cookies, file upload, tab management, fingerprint modification
4. `ToCloseCdpBrowserSession(cdpSessionId)` -- closes the agent-owned tab, resets overrides, cleans up

## Secret handling

Use `ToGetUserSecret` to obtain a `StringRef` secret handle. Pass that value directly to `ToFillCdpSelectorWithSecret` or `ToFillCdpPasswordWithSecret`. The secret materializes only at the CDP input boundary and is never logged or returned.

## Override management

- Fingerprint overrides (user agent, device metrics, geolocation, etc.) persist across navigations within the same tab.
- `ToResetCdpOverrides` clears all active overrides and returns an audit summary.
- `ToCloseCdpBrowserSession` automatically calls `ToResetCdpOverrides` before closing the tab.
- Always reset overrides after debugging to prevent state leakage.

## Never use:
- Browser web-module URLs, internal ports, JsonWs routes for normal browser automation
- `ToLaunchCdpChrome`, `ToCheckCdpChrome`, or raw `ToOpenCdpBrowserSession` as substitutes for registered managed-browser startup or recovery
- Synthetic JS click/type when trusted CDP events are available (Tier 1)
- Tier 2 actions without explicit user approval
