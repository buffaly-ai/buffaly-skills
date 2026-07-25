# Browser Skill

Canonical default Browser Skill backed by `Buffaly.Agent.Tools.Browser.BrowserTools` and its C# CDP backend. `BrowserSessionSkill` remains a compatibility alias.

This skill exposes browser subagent/session primitives, selector operations, inline JavaScript execution, screenshots, console diagnostics, and secret-aware selector fill for login forms.

`UseBrowserSkill` is the generic routing entry point. `PlaywrightBrowserSkill` and `ToOpenPlaywrightBrowserSession` remain explicitly available without changing the generic CDP default.
