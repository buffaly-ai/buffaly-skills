# BrowserSession index.pts

## Purpose

Defines `BrowserSessionSkill`, deterministic browser action wrappers, and includes the `UseBrowserSkill` prompt action.

## History

- Added BrowserSessionSkill with thin wrappers over `BrowserTools` for session, selector, script, screenshot, and console operations.
- Added `ToFillBrowserSelectorWithSecret` using a `StringRef` parameter and `BrowserSessionTools.FillBrowserSelectorWithSecret` for redacted password fill.
