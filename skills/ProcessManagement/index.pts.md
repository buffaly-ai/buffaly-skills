# index.pts Change History

## Initial ProcessManagement Skill (2026-06-06)
- Added ProcessManagement skill actions for listing scheduled tasks, listing recurring processes, listing all Processes rows, inspecting details, adding scheduled tasks, adding recurring processes, enabling/disabling rows, triggering scheduled tasks, and validating process configuration.
- Design Decision: keep how-to guidance in ProtoScript skill actions/wiki-facing tools rather than C# management-service helper methods.

## Route ProcessManagement Through Agent-Web JsonWs (2026-06-07)
- Updated the shared ProcessManagement wrapper helpers to call `JsonWsHelper.CallAgentWebJsonWsSecure(...)` instead of `CallInternalJsonWsSecure(...)`.
- Design Decision: ProcessManagement routes are exposed by the installed Sessions web module through agent-web, so the skill must target the agent-web module route surface rather than a worker-local JsonWs base that can 404 in active tool runtime.

## Use Direct Processes Service Calls For Management Tools (2026-06-07)
- Replaced JsonWs calls for list, inspect, add, enable, disable, and validate actions with direct `Buffaly.Sessions.Processes` static method calls.
- Kept `ToTriggerScheduledTaskNow` route-backed because trigger execution currently depends on the Sessions.Web/module runtime assigning `Processes.TriggerScheduledProcessHandler`.
- Design Decision: normal process-management operations are in-process DB/service calls and should not depend on `WorkerFeature.InternalBaseUrl` or an HTTP route surface; only runtime trigger dispatch remains web-host owned until the trigger runner is refactored into a shared in-process service.

## Direct Trigger Dispatch From ProtoScript (2026-06-07)
- Replaced the remaining `ToTriggerScheduledTaskNow` JsonWs call with a direct `TriggerScheduledProcessContract` call to `Processes.TriggerScheduledProcess(...)`.
- Removed the route-wrapper helpers because every ProcessManagement tool now uses the shared `Buffaly.Sessions.Processes` service surface directly.
- Design Decision: ProcessManagement tools run inside a configured OpsAgent/runtime process that can call the same Sessions service facade directly; routing through JsonWs added an unnecessary HTTP dependency and caused 404 failures when the web-module route surface differed from the active tool runtime.

## Inline Direct Result Serialization (2026-06-07)
- Removed the generic `object` serialization helper after staging ProtoScript compile reported `Unknown type: object`.
- Inlined the existing OpsAgent pattern `JsonUtil.ToFriendlyJSON(new JsonValue(...)).ToString()` at each direct service call return.
- Design Decision: ProcessManagement should stay thin and direct, but ProtoScript glue must use supported concrete call shapes rather than C#-style `object` helper signatures.

## Clarify Compact List Tool Output (2026-06-13)
- Updated ProcessManagement list action descriptions to state that scheduled task, recurring process, and all-process list tools return compact summary rows without raw RunData.
- Design Decision: list tools should be safe for quick selection and follow-up operations; details remain available through ToGetBuffalyProcessDetails.

## Add Deterministic Scheduled Task How-To Prompt (2026-06-16)
- Added `ToAddDeterministicScheduledTask` as a ProcessManagement prompt action for creating `ProtoScriptScheduledProcessHandler` interval processes that run deterministic ProtoScript methods without submitting LLM prompts or using model tokens.
- Design Decision: keep this as reusable ProcessManagement guidance beside the scheduled-task and recurring-process how-to prompts, because the pattern is process-row configuration plus deterministic ProtoScript method selection rather than a new runtime tool.

