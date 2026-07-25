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
2. Use `PlaywrightBrowserSkill`, `ToOpenPlaywrightBrowserSession`, and `ToRunPlaywrightScript` only when the user explicitly asks for Playwright or an isolated browser context.
3. Use `ToRunBrowserScript` for page JavaScript; it runs against the selected Browser Skill session.
4. Do not provide, infer, probe, or depend on Browser web-module URLs, internal ports, `BaseUrl`, `WorkerFeature.InternalBaseUrl`, or JsonWs routes for normal browser automation. Direct BrowserSession tools call `BrowserTools` in process.
5. Do not revive or route normal requests to the removed autonomous Browser Workbench runner.
6. Use a domain skill for known workflows such as Tebra note insertion; do not encode Tebra-specific logic in generic browser tools.
7. Every mutation must be followed by deterministic verification using URL, selector text/value, DOM state, console diagnostics, or screenshot evidence.
8. Screenshots are audit evidence, not the sole source of truth.

## Secret handling

Use `ToGetUserSecret` to obtain a `StringRef` secret handle. Pass that value directly to `ToFillBrowserSelectorWithSecret`; ProtoScript materializes it at the typed `string` C# boundary expected by the redacted browser helper. Do not manually materialize, print, log, serialize, or place passwords into command-line arguments or script text.

Correct pattern:

```text
passwordRef = ToGetUserSecret(secretKey)
ToFillBrowserSelectorWithSecret(subAgentId, "input[type=password]", passwordRef, 15000)
```

The secret materializes only at the typed action boundary and the browser action returns redacted metadata.
