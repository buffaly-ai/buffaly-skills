# Browser Workbench Skill ProtoScript Change History

## Rename web-module identity to avoid BrowserSkill collision (2026-07-25)
- Renamed the embedded web-module skill identity from `BrowserSkill` / `BrowserSkillAction` to `BrowserWorkbenchSkill` / `BrowserWorkbenchSkillAction`.
- This package continues to represent the disabled Browser Workbench/web-module runner compatibility surface.
- The standalone `skills/BrowserSession` package owns the canonical default-browser semantic identity.

## Remove autonomous workbench action (2026-07-18)
- Removed `ToRunBrowserModuleTask` from the source-controlled Browser skill package.
- `BrowserWebModuleService.Initialize()` no longer requires or forwards an OpenAI key; it calls the disabled workbench compatibility initializer with an empty value.
- Removed imports for `OpenAIFeature`, `JsonObject`, `JsonValue`, and `StartBrowserRunRequest` because the Browser skill no longer starts nested LLM runs.
- Design Decision: normal browser automation must route through BrowserSessionSkill primitives and `ToRunPlaywrightScript` in the main agent loop, not through a separate Browser Workbench model loop, web-module endpoint, or direct OpenAI API caller.
