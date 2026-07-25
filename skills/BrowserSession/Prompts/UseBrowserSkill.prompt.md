# Use Browser Skill

Use this prompt skill when the user asks to use, control, inspect, or automate a web browser.

## Browser capability stack

- `UseBrowserSkill` is the canonical default browser prompt/routing entry point.
- `BrowserSessionSkill` remains the compatibility prototype name for the same deterministic primitive surface. Treat it as the Browser Skill/default browser surface, not as a Playwright synonym.
- `BrowserSkill` / default browser is the normal path for unqualified browser requests: open a browser session, navigate, click/type selectors, inspect DOM, capture screenshots, and read console diagnostics.
- `UsePlaywrightBrowserSkill` and Playwright-specific actions are explicit alternatives for requests that name Playwright or require isolated Playwright-style automation.
- Domain skills such as `TebraWebSkill` should own business workflows and call Browser Skill primitives internally.

## Playwright-native automation

Use `ToRunPlaywrightScript` only when the user explicitly asks for Playwright or when an evidence-based plan selects Playwright as the engine. It runs a Playwright-style automation script against the active browser session through Buffaly's native C# Playwright runtime. It is not page JavaScript and it does not run command-line Playwright.

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

1. Use a domain skill first for known workflows such as Tebra note insertion; do not encode domain-specific logic in generic browser tools.
2. Use `UsePlaywrightBrowserSkill` only for explicit Playwright wording, isolated Playwright browser requests, or evidence-driven Playwright fallback.
3. Use `UseCdpBrowserSkill` only for explicit CDP/Chrome DevTools Protocol wording, real-Chrome/existing-login requirements, trusted CDP input requirements, or evidence-driven CDP fallback.
4. Route unqualified browser wording to `UseBrowserSkill` / Browser Skill / BrowserSession-compatible primitives.
5. Use `ToRunBrowserScript` for compact DOM/page JavaScript only; prefer explicit Playwright routing before `ToRunPlaywrightScript` when the operation is Playwright-style automation.
6. Do not provide, infer, probe, or depend on Browser web-module URLs, internal ports, `BaseUrl`, `WorkerFeature.InternalBaseUrl`, or JsonWs routes for normal browser automation. Direct Browser Skill tools call `BrowserTools` in process.
7. Use the autonomous Browser Workbench runner only when the user explicitly asks for the Browser Workbench, a nested browser agent, autonomous browser harness validation, or a self-running browser task.
8. Every mutation must be followed by deterministic verification using URL, selector text/value, DOM state, console diagnostics, or screenshot evidence.
9. Screenshots are audit evidence, not the sole source of truth.

## Secret handling

Use `ToGetUserSecret` to obtain a `StringRef` secret handle. Pass that value directly to `ToFillBrowserSelectorWithSecret`; ProtoScript materializes it at the typed `string` C# boundary expected by the redacted browser helper. Do not manually materialize, print, log, serialize, or place passwords into command-line arguments or script text.

Correct pattern:

```text
passwordRef = ToGetUserSecret(secretKey)
ToFillBrowserSelectorWithSecret(subAgentId, "input[type=password]", passwordRef, 15000)
```

The secret materializes only at the typed action boundary and the browser action returns redacted metadata.
