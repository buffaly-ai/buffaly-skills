# Browser Skill / BrowserSession Compatibility Skill

Canonical default Browser Skill deterministic browser surface backed by `Buffaly.Agent.Tools.Browser.BrowserTools`.

The package directory and compatibility prototype remain `BrowserSession`, but its public routing identity is Browser Skill / default browser. Generic browser requests should route here.

This skill exposes browser subagent/session primitives, selector operations, inline JavaScript execution, screenshots, console diagnostics, and secret-aware selector fill for login forms.

Explicit Playwright routing is available through `PlaywrightBrowserSkill`, `UsePlaywrightBrowserSkill`, `ToOpenPlaywrightBrowserSession`, and `ToRunPlaywrightScript`. Do not treat `BrowserSessionSkill` as a Playwright synonym.

`UseBrowserSkill` is the prompt/routing entry point for generic/default browser requests. Executable actions in `index.pts` are thin wrappers over browser C# methods.
