# BrowserSession index.pts

## Purpose

Defines canonical `BrowserSkill : SkillEntity` default-browser identity while preserving the `BrowserSessionSkill` compatibility alias, deterministic browser action wrappers, explicit Playwright routing, and the `UseBrowserSkill` prompt action.

## History

- Added BrowserSessionSkill with thin wrappers over `BrowserTools` for session, selector, script, screenshot, and console operations.
- Added `ToFillBrowserSelectorWithSecret` using the C# `string` boundary expected by `BrowserSessionTools.FillBrowserSelectorWithSecret`; callers can pass a `StringRef` handle directly and ProtoScript materializes it at the typed boundary for redacted password fill.
- Added deterministic browser discovery phrases for page navigation, page inspection, and page screenshots so normal browser requests route to BrowserSession primitives instead of the autonomous Browser Workbench runner.
- Made `BrowserSessionSkill` the compatibility prototype for the canonical public Browser Skill/default browser identity, with generic browser phrases routed to `UseBrowserSkill` and explicit Playwright phrases routed to `PlaywrightBrowserSkill` / `UsePlaywrightBrowserSkill`.
- Promoted the standalone package to define canonical `BrowserSkill : SkillEntity`; `BrowserSessionSkill` now inherits from `BrowserSkill` as a compatibility alias. The embedded Browser web-module workbench skill was renamed separately to avoid the `BrowserSkill` prototype collision.
- Routed `ToOpenPlaywrightBrowserSession` through the dedicated C# Playwright factory so explicit Playwright requests never inherit the generic CDP backend.

## 2026-06-27
- Added ToRunPlaywrightScript so agents can run Playwright-style browser automation natively through BrowserSessionSkill.
