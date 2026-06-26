# Add A Deterministic Scheduled Task

Use this prompt skill when the user asks to add, create, configure, validate, or operationalize a scheduled Buffaly process that performs deterministic work without submitting an LLM prompt, consuming model tokens, or depending on provider completion.

## Goal

Guide the user through creating an `IntervalSystemProcess` that uses `Buffaly.Agent.ScheduledProcesses.ProtoScriptScheduledProcessHandler` to run one configured ProtoScript method and optionally append a compact lifecycle message to a session timeline.

This is the approved pattern for scheduled maintenance, cleanup, indexing, reporting, or bookkeeping work that can be expressed deterministically in ProtoScript/C# and does not need model reasoning.

## Core model

- The process row uses `Action = "IntervalSystemProcess"`.
- The handler is `Buffaly.Agent.ScheduledProcesses.ProtoScriptScheduledProcessHandler` from `Buffaly.Agent.ScheduledProcesses.dll`.
- The handler calls `BuffalyAgentService.RunProtoScriptMethod(sessionKey, prototypeName, methodName, argsJson)`.
- The handler does **not** call `EvaluateWithInput`.
- The handler does **not** send a user prompt to an agent.
- The handler does **not** invoke an LLM or use model tokens.
- The deterministic method result is capped into `LastResultPreview` and can be written as a lifecycle timeline row when `AppendLifecycleMessage = true`.

## Existing reference implementation

Use these source files as the reference pattern:

- `Buffaly.Agent.ScheduledProcesses/ProtoScriptScheduledProcessHandler.cs`
- `buffaly.agent.tests/OpsAgent/ScheduledProcessHandlerTests.cs`
  - `ProtoScriptScheduledProcessHandler_RunsConfiguredMethodAndAppendsLifecycle`
  - `ProtoScriptScheduledProcessHandler_CapsResultPreview`
  - `ProtoScriptScheduledProcessHandler_MissingPrototypeFailsFast`

Existing matt-local example process:

- ProcessName: `Deterministic Disk Cleanup`
- HandlerAssembly: `Buffaly.Agent.ScheduledProcesses.dll`
- HandlerType: `Buffaly.Agent.ScheduledProcesses.ProtoScriptScheduledProcessHandler`
- Action: `IntervalSystemProcess`
- SessionKey: `Scheduled-DiskCleanup`

## Required design decisions

Before creating the process, identify:

1. The deterministic operation to run.
2. The ProtoScript prototype and method that performs the operation.
3. The session key used for runtime method execution and optional lifecycle messages.
4. The JSON arguments passed to the method.
5. The interval in minutes.
6. Whether a lifecycle message should be appended.
7. The maximum result-preview characters to persist/display.

Do not use this pattern when the work requires model judgment, free-form diagnosis, or generated prose. Use prompt-driven scheduled tasks for that instead.

## RunData shape

Use this JSON shape in `RunDataJson`:

```json
{
  "SessionKey": "Scheduled-DiskCleanup",
  "PrototypeName": "ToCleanUpDiskSpaceDeterministically",
  "MethodName": "Execute",
  "ArgsJson": "{\"forceDelete\":true}",
  "AppendLifecycleMessage": true,
  "LifecycleName": "ScheduledProtoScript",
  "MaxResultCharacters": 4000,
  "RunCount": 0,
  "LastDecision": "",
  "LastResultPreview": ""
}
```

Field meanings:

- `SessionKey`: session used by `RunProtoScriptMethod` and lifecycle-message writes.
- `PrototypeName`: ProtoScript action/prototype containing the deterministic method.
- `MethodName`: method to invoke, usually `Execute`.
- `ArgsJson`: JSON string passed to `RunProtoScriptMethod`; use `{}` when no args are needed.
- `AppendLifecycleMessage`: true to write a deterministic timeline lifecycle row.
- `LifecycleName`: timeline event name, for example `DiskCleanup` or `ScheduledProtoScript`.
- `MaxResultCharacters`: cap for persisted/displayed result preview.
- `RunCount`, `LastRunUtc`, `LastDecision`, `LastResultLength`, `LastResultPreview`, and `LastError` are handler-owned state.

## Step-by-step workflow

1. Confirm the work is deterministic.
   - It must not require an LLM response.
   - It must be expressible as a bounded ProtoScript method.
   - It should return a compact deterministic string result.

2. Find or create the deterministic ProtoScript method.
   - Prefer an existing skill/action method.
   - Keep the method idempotent or safely repeatable.
   - Keep output compact and structured enough to be useful in `LastResultPreview`.

3. Choose the session key.
   - Use a stable scheduled-session key such as `Scheduled-DiskCleanup`.
   - If lifecycle messages are enabled, the session must exist before the handler appends the message.

4. Build `RunDataJson`.
   - Use the exact PascalCase fields above.
   - Put method arguments inside the `ArgsJson` string.
   - Set a conservative `MaxResultCharacters` cap.

5. Create or update the recurring process with `ToAddRecurringProcess`.

Example:

```text
ToAddRecurringProcess(
  processName: "Deterministic Disk Cleanup",
  handlerAssembly: "Buffaly.Agent.ScheduledProcesses.dll",
  handlerType: "Buffaly.Agent.ScheduledProcesses.ProtoScriptScheduledProcessHandler",
  runEveryMinutes: 60,
  runDataJson: "{...}"
)
```

6. Inspect the row.
   - Use `ToListRecurringProcesses()` for the compact list.
   - Use `ToGetBuffalyProcessDetails(processID)` for full `RunData`.

7. Validate configuration.
   - Use `ToValidateBuffalyProcessConfiguration(processID)`.
   - Confirm `Action = IntervalSystemProcess`.
   - Confirm handler coordinates match `ProtoScriptScheduledProcessHandler`.
   - Confirm `RunEvery` is positive.
   - Confirm required RunData fields are present.

8. Validate execution behavior.
   - Use an approved interval-process runner/admin path for one-shot execution.
   - Do **not** use `ToTriggerScheduledTaskNow`; that is only for `ExternalScheduledTask` rows.
   - Evidence should include `LastDecision = "ProtoScriptMethodCompleted"`, updated `RunCount`, `LastRunUtc`, and bounded `LastResultPreview`.
   - If lifecycle messages are enabled, verify the target session timeline has the lifecycle event.

## Expected success evidence

A successful deterministic run should show:

- Process row completed with `IsRunning = false` and `IsTimedOut = false`.
- `RunData.LastDecision = "ProtoScriptMethodCompleted"`.
- `RunData.LastResultLength` is set.
- `RunData.LastResultPreview` is capped to `MaxResultCharacters`.
- No `EvaluateWithInput` call was made.
- No LLM/provider error can be produced by the scheduled handler itself.

## Common mistakes

- Using `ToTriggerScheduledTaskNow` for an interval process.
  - That tool only triggers `ExternalScheduledTask` rows.
- Putting prompt instructions in `RunData`.
  - Deterministic scheduled tasks should run a method, not a prompt.
- Returning huge method output.
  - Keep output bounded; the handler caps previews but the deterministic method should also be concise.
- Assuming lifecycle messages create sessions.
  - The target session must already exist when `AppendLifecycleMessage = true`.
- Using this pattern for work that requires diagnosis or natural-language reasoning.
  - That belongs in a prompt-driven scheduled task or a handler that explicitly calls an agent.

## Response style

When using this prompt skill for a user:

- Start by explaining that this pattern runs ProtoScript directly and avoids LLM/token usage.
- Show the exact `RunDataJson` tailored to their task.
- Show the exact `ToAddRecurringProcess` arguments.
- Include the validation commands/tools and expected evidence.
- Warn explicitly not to use the external scheduled-task trigger for interval rows.
- If implementation is requested, keep changes small, validate, and commit source changes.