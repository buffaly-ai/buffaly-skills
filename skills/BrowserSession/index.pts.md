# BrowserSession index.pts

## Purpose

Defines canonical `BrowserSkill`, the `BrowserSessionSkill` compatibility alias, explicit `PlaywrightBrowserSkill`, deterministic browser action wrappers, and their prompt actions.

## History

- Added BrowserSessionSkill with thin wrappers over `BrowserTools` for session, selector, script, screenshot, and console operations.
- Added `ToFillBrowserSelectorWithSecret` using the C# `string` boundary expected by `BrowserSessionTools.FillBrowserSelectorWithSecret`; callers can pass a `StringRef` handle directly and ProtoScript materializes it at the typed boundary for redacted password fill.
- Added deterministic browser discovery phrases for page navigation, page inspection, and page screenshots so normal browser requests route to BrowserSession primitives instead of the autonomous Browser Workbench runner.
- Made `BrowserSkill` the canonical generic identity backed by C# CDP and separated explicit Playwright session creation through `PlaywrightBrowserSubAgentOpenTool`.
- Added `ToOpenManagedCdpBrowserSession(browserKey, url)` as the generic managed-browser route. It delegates atomically to the C# coordinator, uses the configured default when `browserKey` is an empty string, and accepts no caller-controlled launcher, profile, executable, or port. The public parameter order intentionally matches the C# bridge and design contract.

## 2026-06-27
- Added ToRunPlaywrightScript so agents can run Playwright-style browser automation natively through BrowserSessionSkill.
