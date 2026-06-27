# BrowserSession index.pts

## Purpose

Defines `BrowserSessionSkill`, deterministic browser action wrappers, and includes the `UseBrowserSkill` prompt action.

## History

- Added BrowserSessionSkill with thin wrappers over `BrowserTools` for session, selector, script, screenshot, and console operations.
- Added `ToFillBrowserSelectorWithSecret` using the C# `string` boundary expected by `BrowserSessionTools.FillBrowserSelectorWithSecret`; callers can pass a `StringRef` handle directly and ProtoScript materializes it at the typed boundary for redacted password fill.
- Added deterministic browser discovery phrases for page navigation, page inspection, and page screenshots so normal browser requests route to BrowserSession primitives instead of the autonomous Browser Workbench runner.
