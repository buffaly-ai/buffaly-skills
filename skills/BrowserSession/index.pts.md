# BrowserSession index.pts

## Purpose

Defines canonical `BrowserSkill`, the `BrowserSessionSkill` compatibility alias, explicit `PlaywrightBrowserSkill`, deterministic browser action wrappers, and their prompt actions.

## History

- Added `ToPasteFocusedBrowserText(subAgentId, expectedFocusedSelector, text)` as a direct host-bound `BrowserTools.BrowserPasteFocusedTextTool` delegate, matching browser source contract `ed012573`. Unlike text insertion, this uses the runtime paste route; wrapper dispatch does not establish application-specific formula or multi-cell success. Publish BrowserSession and Browser together only after the corrected runtime passes live Sheets verification; offline source compilation is not deployed-wrapper proof.
- Added `ToInsertFocusedBrowserText(subAgentId, expectedFocusedSelector, text)` and `ToPressFocusedBrowserKey(subAgentId, expectedFocusedSelector, key)` as direct BrowserTools host-bound delegates. They require the Browser module runtime exposing `BrowserInsertFocusedTextTool` / `BrowserPressFocusedKeyTool` (browser source contract commit `2da69bb57bd3a47fdc4a1c36c926d1691b42c33f`). Neither action uses the legacy CDP helper registry, changes focus, or performs DOM mutation. Text insertion is not clipboard paste or guaranteed multi-cell TSV; focus-check/dispatch is not atomic. Install the corresponding Browser WebModule runtime before activating these actions and verify worker assembly identity rather than adding duplicate project-lib DLLs.
- Added BrowserSessionSkill with thin wrappers over `BrowserTools` for session, selector, script, screenshot, and console operations.
- Added `ToFillBrowserSelectorWithSecret` using the C# `string` boundary expected by `BrowserSessionTools.FillBrowserSelectorWithSecret`; callers can pass a `StringRef` handle directly and ProtoScript materializes it at the typed boundary for redacted password fill.
- Changed `ToFillBrowserSelectorWithSecret` and `ToFillBrowserPasswordWithSecret` to declare `secretValue` as `StringRef` and added an explicit wrapper materialization helper before calling the imported C# `string` methods. Directly passing `StringRef` to the imported C# methods failed BrowserSession lazy compilation with a parameter mismatch, while primitive public `string` parameters preserve opaque handles and trigger the fail-closed guard.
- Routed `ToFillBrowserPasswordWithSecret` through `BrowserSessionTools.FillBrowserPasswordWithSecret` so the dedicated password helper and default selector policy are exercised.
- Added deterministic browser discovery phrases for page navigation, page inspection, and page screenshots so normal browser requests route to BrowserSession primitives instead of the autonomous Browser Workbench runner.
- Made `BrowserSkill` the canonical generic identity backed by C# CDP and separated explicit Playwright session creation through `PlaywrightBrowserSubAgentOpenTool`.
- Added `ToOpenManagedCdpBrowserSession(browserKey, url)` as the generic managed-browser route. It delegates atomically to the C# coordinator, uses the configured default when `browserKey` is an empty string, and accepts no caller-controlled launcher, profile, executable, or port. The public parameter order intentionally matches the C# bridge and design contract.
- Added explicit research/search routing phrases and model-visible descriptions: ordinary public research and Google/Bing use the configured managed persistent CDP browser; Playwright remains explicit test-only. Managed CDP failures do not silently fall back, and browser results expose backend/profile/session/reuse/fallback receipts.
- Made managed recovery authoritative for registered persistent/default and existing-login browser intent. Added explicit recovery phrases and routing guidance so unavailable managed endpoints use their pre-approved launcher without Tier 2 approval; raw `ToLaunchCdpChrome` and port-based CdpBrowser actions remain explicit diagnostics only.

## 2026-06-27
- Added ToRunPlaywrightScript so agents can run Playwright-style browser automation natively through BrowserSessionSkill.

## 2026-09-06
- Changed `ToCaptureBrowserScreenshot.Execute(...)` to return `Prototype` so the C# `IStructuredToolResult` remains boxed across ProtoScript instead of being coerced to a string.
- Design Decision: BrowserSession should preserve screenshot image content parts while leaving the metadata text/path contract owned by BrowserTools.
