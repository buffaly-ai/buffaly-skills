# index.pts.md Change History


## Initialize from OpenAIFeature (2026-05-30)
- ComputerUseWebModuleService.Initialize now reads LLMs.GetResponsesApiKeyOrEmpty and calls the ComputerUse JsonWs initialize route before tool calls use the module.

## Use typed maxSteps parameter (2026-05-31)
- Changed `ToRunComputerUseTask.Execute(...)` to accept `int maxSteps` and pass it directly to `StartComputerUseRunRequest.MaxSteps` instead of parsing a string in ProtoScript.
- Design Decision: keep ProtoScript as a thin wrapper over the C# contract; integer parsing belongs at the environment/C# binding boundary, not inside the `.pts` wrapper.
