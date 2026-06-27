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

## Stop forwarding model overrides (2026-06-16)
- Kept the `model` parameter in `ToRunBrowserModuleTask.Execute(...)` for backward compatibility with older callers, but stopped copying it into `StartBrowserRunRequest.Model`.
- Design Decision: the Browser web module owns model selection so stale prompts, UI fields, or old sessions cannot force obsolete model names such as `gpt-4o`.

## Demote autonomous workbench routing (2026-06-26)
- Replaced broad semantic phrases (`to run a browser task`, `to use the browser module`) with explicit autonomous workbench phrases.
- Updated the action description to identify `ToRunBrowserModuleTask` as a developer/test harness action that launches an inner LLM runner.
- Design Decision: normal browser automation should route through `UseBrowserSkill` and BrowserSession primitives without Browser web-module URLs, endpoints, or nested LLM control loops.
