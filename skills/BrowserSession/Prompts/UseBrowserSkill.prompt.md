# Use Browser Skill

Use this prompt skill when the user asks to use, control, inspect, or automate a web browser.

## Browser capability stack

- `UseBrowserSkill` is the prompt/routing entry point.
- `BrowserSessionSkill` is the deterministic browser primitive surface backed by `Buffaly.Agent.Tools.Browser.BrowserTools`.
- `BrowserSkill` / `ToRunBrowserModuleTask` is the broad LLM browser-module task runner for exploratory browsing.
- Domain skills such as `TebraWebSkill` should own business workflows and call `BrowserSessionSkill` primitives internally.

## Routing rules

1. Use `BrowserSessionSkill` for deterministic selectors, DOM inspection, JavaScript evaluation, screenshots, console diagnostics, and repeatable form interaction.
2. Use one well-scoped `ToRunBrowserScript` call for compact multi-step DOM logic instead of many small calls when that is clearer and verifiable.
3. Do not use PowerShell, command-line Playwright, or temporary JavaScript files when `ToRunBrowserScript` can run code inside the browser session.
4. Use `ToRunBrowserModuleTask` only when the task is broad exploratory browsing where an LLM runner should decide the page steps.
5. Use a domain skill for known workflows such as Tebra note insertion; do not encode Tebra-specific logic in generic browser tools.
6. Every mutation must be followed by deterministic verification using URL, selector text/value, DOM state, console diagnostics, or screenshot evidence.
7. Screenshots are audit evidence, not the sole source of truth.

## Secret handling

Use `ToGetUserSecret` to obtain a `StringRef` secret handle. Pass that value directly to `ToFillBrowserSelectorWithSecret`. Do not materialize, print, log, serialize, or place passwords into command-line arguments or script text.

Correct pattern:

```text
passwordRef = ToGetUserSecret(secretKey)
ToFillBrowserSelectorWithSecret(subAgentId, "input[type=password]", passwordRef, 15000)
```

The secret materializes only at the typed `StringRef` action boundary and the browser action returns redacted metadata.
