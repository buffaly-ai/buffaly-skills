# Use Browser Skill

Use this prompt skill when the user asks to use, control, inspect, or automate a web browser.

## Browser capability stack

- `UseBrowserSkill` is the prompt/routing entry point.
- `BrowserSkill` is the canonical deterministic browser primitive surface backed by `Buffaly.Agent.Tools.Browser.BrowserTools` and the C# CDP backend by default.
- `BrowserSessionSkill` is a compatibility alias for `BrowserSkill`.
- `BrowserWorkbenchSkill` is the disabled web-module harness compatibility identity. It is not the normal browser path.
- `PlaywrightBrowserSkill` is available only for explicit Playwright or isolated-context requests.
- Domain skills such as `TebraWebSkill` should own business workflows and call `BrowserSessionSkill` primitives internally.

## Playwright-native automation

Use `ToOpenPlaywrightBrowserSession` before `ToRunPlaywrightScript` when the user explicitly requests Playwright. It runs through Buffaly's native C# Playwright runtime, not command-line Playwright.

Use normal Playwright-style idioms inside `ToRunPlaywrightScript`, for example:

```javascript
await page.goto(args.url);
const title = await page.title();
const text = await page.locator("body").textContent();
await page.screenshot({ path: artifacts.path("page.png"), fullPage: true });
return { title, url: page.url(), text };
```

Use `ToRunBrowserScript` only when you specifically need JavaScript evaluated inside the page, equivalent to Playwright `page.evaluate(...)`. Do not create temporary Playwright projects, use Node/npx, PowerShell, or Playwright CLI for normal browser automation.

## Routing rules

1. Use `BrowserSkill` for unqualified browser automation. The default backend is C# CDP.
2. For ordinary public research, Google/Bing browsing, a registered persistent/default browser, existing-login continuity, or an unavailable managed CDP endpoint, call `ToOpenManagedCdpBrowserSession(browserKey, url)` first. Pass an empty browser key to resolve the installation default instead of guessing a port, profile, executable, or key. It owns approved launcher invocation and bounded endpoint recovery; this managed recovery does not require Tier 2 approval.
3. Reuse the configured managed browser and open a new agent-owned tab when separate sessions need isolation. Do not create a disposable profile merely to isolate research.
4. Never substitute `ToLaunchCdpChrome`, `ToCheckCdpChrome`, or raw port-based `ToOpenCdpBrowserSession` for a registered managed browser. Those CdpBrowser actions are explicit low-level diagnostics for caller-selected ports/profiles and may require approval; they are not normal startup or recovery routes.
5. Use `PlaywrightBrowserSkill`, `ToOpenPlaywrightBrowserSession`, and `ToRunPlaywrightScript` only when the user explicitly asks for Playwright, UI/e2e testing, or clean-profile reproduction. An ordinary research request is not an isolated-browser request.
6. Managed-CDP errors are terminal for browser selection unless the caller explicitly authorizes a fallback policy. Do not silently open Playwright. When an approved search/API provider can satisfy the research, use it and record the managed-browser blocker.
7. If Google, Bing, or another site presents a CAPTCHA or automation block, do not evade it, cycle browsers/search engines, or repeat the automated search. Stop browser retries and use an approved API/search provider when available.
8. Use `ToRunBrowserScript` for page JavaScript; it runs against the selected Browser Skill session.
9. Do not provide, infer, probe, or depend on Browser web-module URLs, internal ports, `BaseUrl`, `WorkerFeature.InternalBaseUrl`, or JsonWs routes for normal browser automation. Direct BrowserSession tools call `BrowserTools` in process.
10. Do not revive or route normal requests to the removed autonomous Browser Workbench runner.
11. Use a domain skill for known workflows such as Tebra note insertion; do not encode Tebra-specific logic in generic browser tools.
12. Every mutation must be followed by deterministic verification using URL, selector text/value, DOM state, console diagnostics, or screenshot evidence.
13. Screenshots are audit evidence, not the sole source of truth.

## Owned-tab lifecycle

- Reuse your session's working tab for successive URLs. Concurrent agent sessions attach to the same configured persistent Chrome profile but must use separate agent-owned tabs; do not navigate or close another session's or the user's tabs.
- An attached managed client may own at most four live tabs (one working tab plus three temporary tabs). At the limit, reuse or explicitly close an owned tab; never create another profile or evict somebody else's tab. Manually closed owned tabs no longer count.
- When bounded browsing work finishes, call `ToCloseBrowserSession` unless an explicit ongoing workflow needs the attachment. Closing the attachment closes only its owned tabs, not Chrome or the saved login profile. Closing the final owned tab does not create a replacement. Cleanup is explicit; there is no automatic idle timer or crash cleanup.
- If the user closes your tab or Chrome, the next deliberate managed open recovers through the configured launcher and the same profile. Never invent a registration key from the session ID. Inspect fresh page state after recovery; stale selectors may require deliberate navigation. Never replay a possibly completed submission, purchase, click, or paste.
- A busy session rejects close/navigation/recovery without disturbing its in-flight action. Finish the action before deliberately retrying close; this is not permission to repeat a site search after an automation block.

## Selection receipts

Browser open/navigation results must be treated as selection evidence. Preserve and report the returned backend, non-secret profile/browser key and subAgentId, created-versus-reused state, and fallback fields. A `playwright::...` identity proves an explicit Playwright backend; a `browser::managed-...` identity proves the registered managed CDP route.

## Secret handling

Use `ToGetUserSecret` to obtain a `StringRef` secret handle. Pass that value directly to `ToFillBrowserSelectorWithSecret`; the BrowserSession wrapper explicitly materializes the `StringRef` before invoking the redacted C# browser helper. Do not manually materialize, print, log, serialize, or place passwords into command-line arguments or script text.

Correct pattern:

```text
passwordRef = ToGetUserSecret(secretKey)
ToFillBrowserSelectorWithSecret(subAgentId, "input[type=password]", passwordRef, 15000)
```

The secret materializes only inside the typed BrowserSession secret-fill wrapper and the browser action returns redacted metadata.
