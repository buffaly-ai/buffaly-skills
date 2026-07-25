# Use CDP Browser Skill

Use this prompt skill when the user asks to use, control, inspect, or automate a web browser via CDP (Chrome DevTools Protocol).

## CDP Browser capability stack

- `UseCdpBrowserSkill` is the prompt/routing entry point for CDP-based browser automation.
- `CdpBrowserSkill` is the deterministic browser primitive surface backed by `chrome-remote-interface` and the user's real Chrome.
- Connects to a running Chrome instance with `--remote-debugging-port=9222 --user-data-dir=<debug-profile>`.
- Creates a new dedicated tab (does not touch user's existing tabs).
- Uses trusted CDP input events (`isTrusted=true`) for all Tier 1 interactions.

## When to use CdpBrowser vs BrowserSessionSkill

### Use CdpBrowser when:
- The site has anti-bot detection (Cloudflare, reCAPTCHA, etc.)
- The user needs their real logins/cookies
- The user wants to see the browser window
- Playwright driver is broken or missing
- The site requires real browser extensions
- The site checks `navigator.webdriver`
- The site requires trusted input events (React apps that ignore synthetic events)

### Use BrowserSessionSkill (Playwright) when:
- Headless operation is preferred
- No need for real session/cookies
- Site does not block Playwright
- Playwright driver is working

## Tier usage rules

1. Default to Tier 1 actions for all browser interaction. Tier 1 actions are always available and use trusted CDP events.
2. Before using any Tier 2 action, ask the user for explicit approval, then call `ToApproveCdpAdvancedActions`.
3. Use `ToRunCdpScript` (Tier 2) only when Tier 1 actions cannot express the needed operation.
4. Use `ToRunCdpMutationScript` (Tier 2) only when DOM modification via JS is required.
5. Use `ToRunCdpAutomation` (Tier 2) only for complex multi-step CDP workflows.
6. Browser fingerprint modification actions (`ToSetCdpUserAgent`, `ToSetCdpDeviceMetrics`, etc.) are for debugging your own sites only.
7. If a Tier 2 action returns "Error: Tier 2 actions require approval", ask the user for approval and call `ToApproveCdpAdvancedActions`.

## Chrome setup

Before using CdpBrowser, Chrome must be running with remote debugging enabled:

`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome --remote-debugging-port=9222 --user-data-dir=~/.buffaly/chrome-debug-profile --no-first-run --no-default-browser-check`

Or use `ToLaunchCdpChrome` (Tier 2, requires approval) to launch Chrome automatically.

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
- Synthetic JS click/type when trusted CDP events are available (Tier 1)
- Tier 2 actions without explicit user approval
