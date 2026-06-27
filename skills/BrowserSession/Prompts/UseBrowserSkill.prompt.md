# Use Browser Skill

Use this prompt skill when the user asks to use, control, inspect, or automate a web browser.

## Browser capability stack

- `UseBrowserSkill` is the prompt/routing entry point.
- `BrowserSessionSkill` is the deterministic browser primitive surface backed by `Buffaly.Agent.Tools.Browser.BrowserTools` and Microsoft Playwright by default.
- `BrowserSkill` / Browser Workbench is an autonomous developer/test harness that launches a nested LLM runner. It is not the normal browser path.
- Domain skills such as `TebraWebSkill` should own business workflows and call `BrowserSessionSkill` primitives internally.

## Playwright-native automation

For complex browser automation, prefer `ToRunPlaywrightScript`. It runs a Playwright-style automation script against the active browser session through Buffaly's native C# Playwright runtime. It is not page JavaScript and it does not run command-line Playwright.

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

1. Use `BrowserSessionSkill` for normal browser automation, including selectors, DOM inspection, JavaScript evaluation, screenshots, console diagnostics, repeatable form interaction, and step-by-step browsing.
2. Use one well-scoped `ToRunPlaywrightScript` call for compact multi-step Playwright-style browser automation instead of many small calls when that is clearer and verifiable.
3. Use `ToRunBrowserScript` for compact DOM/page JavaScript only; prefer `ToRunPlaywrightScript` when the operation is navigation, locator interaction, screenshots, waits, or other Playwright-style automation.
4. Do not provide, infer, probe, or depend on Browser web-module URLs, internal ports, `BaseUrl`, `WorkerFeature.InternalBaseUrl`, or JsonWs routes for normal browser automation. Direct BrowserSession tools call `BrowserTools` in process.
5. Use the autonomous Browser Workbench runner only when the user explicitly asks for the Browser Workbench, a nested browser agent, autonomous browser harness validation, or a self-running browser task.
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
