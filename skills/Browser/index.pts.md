# Browser Skill ProtoScript Change History

## Remove external web-module URL override (2026-05-21)
- Updated `BrowserWebModuleService` to resolve its base URL through `JsonWsHelper.ResolveWorkerInternalBaseUrl()` instead of accepting per-call URL overrides.
- Switched the service call to the Browser JsonWs route (`api/buffaly.browser.webharness/browser-workbench-json-ws-service` / `start-run`) so the skill uses the installed module contract consistently.
- Removed `webModuleBaseUrl` from `ToRunBrowserModuleTask.Execute(...)` to prevent callers from accidentally routing browser tasks to the wrong host or stale install.

## Initialize from OpenAIFeature (2026-05-30)
- BrowserWebModuleService.Initialize now reads LLMs.GetResponsesApiKeyOrEmpty and calls the Browser JsonWs initialize route before tool calls use the module.

## Clean import formatting (2026-05-30)
- Replaced accidental literal `` `r`n `` text between BasicUtilities imports with a real newline; behavior is unchanged.

## Use typed maxSteps parameter (2026-05-31)
- Changed `ToRunBrowserModuleTask.Execute(...)` to accept `int maxSteps` and pass it directly to `StartBrowserRunRequest.MaxSteps` instead of parsing a string in ProtoScript.
- Design Decision: keep ProtoScript as a thin wrapper over the C# contract; integer parsing belongs at the environment/C# binding boundary, not inside the `.pts` wrapper.
