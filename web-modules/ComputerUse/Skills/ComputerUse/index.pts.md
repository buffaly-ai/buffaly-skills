# index.pts.md Change History

## Add run-control actions (2026-06-01)
- Kept `ToRunComputerUseTask` as a non-blocking start action and clarified its description.
- Added `ToGetComputerUseRunStatus` so agents can check progress through `ComputerUseWorkbenchServiceHost.GetRun(...)` without PowerShell/file polling.
- Added `ToStopComputerUseRun` so agents can interrupt a run through `ComputerUseWorkbenchServiceHost.StopRun(...)`.
- Added `ToRunComputerUseTaskAndWait` so agents can start and wait through the typed runtime with timeout, poll interval, and optional stop-on-timeout controls.

## Initialize from OpenAIFeature (2026-05-30)
- ComputerUseWebModuleService.Initialize now reads LLMs.GetResponsesApiKeyOrEmpty and calls the ComputerUse JsonWs initialize route before tool calls use the module.

## Use typed maxSteps parameter (2026-05-31)
- Changed `ToRunComputerUseTask.Execute(...)` to accept `int maxSteps` and pass it directly to `StartComputerUseRunRequest.MaxSteps` instead of parsing a string in ProtoScript.
- Design Decision: keep ProtoScript as a thin wrapper over the C# contract; integer parsing belongs at the environment/C# binding boundary, not inside the `.pts` wrapper.
