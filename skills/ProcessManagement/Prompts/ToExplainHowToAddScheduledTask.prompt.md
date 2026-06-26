# Explain How To Add A Scheduled Task

Use this prompt skill when the user asks how to add, configure, validate, or operationalize an externally triggered Buffaly scheduled task.

## Goal

Guide the user through creating an `ExternalScheduledTask` `dbo.Processes` row that is triggered by an external clock or caller, but executes through Buffaly's scheduled-process route and trusted `IScheduledProcessHandler` resolution.

## Key model

- `Action` is the broad execution category: `ExternalScheduledTask`.
- `RunEvery` must be `NULL`; external scheduled tasks are not picked up by the interval loop.
- The concrete behavior is selected by top-level `RunData.HandlerAssembly` and `RunData.HandlerType`.
- Prompt-driven tasks normally use:
  - `HandlerAssembly = Buffaly.Agent.ScheduledProcesses.dll`
  - `HandlerType = Buffaly.Agent.ScheduledProcesses.PromptScheduledTaskHandler`
  - `TriggerMode = External`
- The external scheduler should call Buffaly's trigger route/tool, not `run-proto-script-method` directly.
- Do not create task-specific C# handlers unless the user explicitly needs deterministic pre/post processing that cannot be expressed as a prompt-driven scheduled task.

## Information to collect

Collect or infer these fields before creating the row:

1. `ProcessName`: stable human-readable name, unique in `dbo.Processes`.
2. `SessionKey`: parent session used for scheduled work grouping.
3. `CreateChildSession`: `true` to create one child session per run; `false` to reuse/evaluate the parent session.
4. `PromptContext`: context prompt name to load for the scheduled run.
5. `Instruction`: the run-specific prompt.
6. Optional `ExternalTriggerKey`: shared secret/key if the external trigger needs one.
7. Optional `TimeoutSeconds`: default to 600 unless the task needs a different timeout.
8. Optional `MaximumRunTime`: default to 10 minutes unless a different process timeout is required.

## Preferred tool workflow

1. List existing scheduled tasks first:
   - Use `ToListScheduledTasks()`.
   - Confirm the name does not already exist unless the user intends an update.
2. Create or update the row:
   - Use `ToAddScheduledTask(processName, handlerAssembly, handlerType, sessionKey, createChildSession, promptContext, instruction)`.
   - For the standard prompt-driven handler, pass:
     - `handlerAssembly = "Buffaly.Agent.ScheduledProcesses.dll"`
     - `handlerType = "Buffaly.Agent.ScheduledProcesses.PromptScheduledTaskHandler"`
3. Inspect the row:
   - Use `ToListScheduledTasks()` or `ToGetBuffalyProcessDetails(processID)`.
4. Validate configuration:
   - Use `ToValidateBuffalyProcessConfiguration(processID)`.
   - A valid external task should have `Action=ExternalScheduledTask`, `RunEvery=NULL`, `RunData.TriggerMode=External`, and handler coordinates.
5. Trigger a safe validation run only if appropriate:
   - Use `ToTriggerScheduledTaskNow(processName, triggerKey)`.
   - If `CreateChildSession=true`, expect a child session key in the result.
6. If the user is wiring Windows Task Scheduler or cron:
   - Instruct the scheduler to call the Buffaly trigger route/tool for the stored process row.
   - Do not tell it to call ProtoScript directly.

## Response style

When answering the user:

- Explain the model briefly.
- Show the exact recommended tool call arguments.
- Mention validation steps and expected evidence.
- If you create or update the row, report ProcessID, ProcessName, Action, handler coordinates, enabled state, and validation result.

## Safety rules

- Do not rotate or generate production trigger secrets unless requested.
- Do not enable a task with uncertain instruction/session targeting.
- Do not trigger a task if it may send messages, emails, or perform expensive work without user approval.
- Prefer a validation-only temporary task for route/tool checks.
