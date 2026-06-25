# BrowserSession Skill

Deterministic browser session skill backed by `Buffaly.Agent.Tools.Browser.BrowserTools`.

This skill exposes browser subagent/session primitives, selector operations, inline JavaScript execution, screenshots, console diagnostics, and secret-aware selector fill for login forms.

`UseBrowserSkill` is the prompt/routing entry point for agents. Executable actions in `index.pts` are thin wrappers over browser C# methods.
