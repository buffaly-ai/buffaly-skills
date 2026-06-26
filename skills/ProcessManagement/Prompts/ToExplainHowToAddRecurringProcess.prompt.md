# Explain How To Add A Recurring Process

Use this prompt skill when the user asks how to add, configure, validate, or operationalize an interval-driven Buffaly process.

## Goal

Guide the user through creating an `IntervalSystemProcess` `dbo.Processes` row that is run by the Buffaly process loop according to its `RunEvery` interval and trusted `IScheduledProcessHandler` configuration.

## Key model

- `Action` is the broad execution category: `IntervalSystemProcess`.
- `RunEvery` must be a positive minute interval.
- The process loop evaluates due rows and skips rows that are disabled, running, timed out, or not due.
- The concrete behavior is selected by top-level `RunData.HandlerAssembly` and `RunData.HandlerType`.
- Handler-specific configuration can live at top level in `RunData`; use `RunData.State` only when the handler needs to persist state across runs.
- Do not use an external scheduled-task trigger for recurring interval rows.

## Information to collect

Collect or infer these fields before creating the row:

1. `ProcessName`: stable human-readable name, unique in `dbo.Processes`.
2. `HandlerAssembly`: trusted assembly containing the handler.
3. `HandlerType`: full type name implementing `IScheduledProcessHandler`.
4. `RunEveryMinutes`: positive integer interval.
5. `RunDataJson`: optional handler-specific configuration JSON; use `{}` or an empty string when no config is required.
6. Optional `MaximumRunTime`: default to 8 minutes unless the handler needs a different timeout.
7. Whether the process should be enabled immediately.

## Preferred tool workflow

1. List existing recurring processes first:
   - Use `ToListRecurringProcesses()`.
   - Confirm whether the process already exists.
2. Create or update the row:
   - Use `ToAddRecurringProcess(processName, handlerAssembly, handlerType, runEveryMinutes, runDataJson)`.
   - Use a large interval or disabled state for validation-only rows that should not run soon.
3. Inspect the row:
   - Use `ToListRecurringProcesses()` or `ToGetBuffalyProcessDetails(processID)`.
4. Validate configuration:
   - Use `ToValidateBuffalyProcessConfiguration(processID)`.
   - A valid recurring process should have `Action=IntervalSystemProcess`, positive `RunEvery`, and handler coordinates.
5. Enable/disable as needed:
   - Use `ToEnableBuffalyProcess(processID)` or `ToDisableBuffalyProcess(processID)`.
6. Do not use `ToTriggerScheduledTaskNow` for recurring rows:
   - That trigger is for `ExternalScheduledTask` rows only.
   - Manual execution of interval processes should be handled through a dedicated runner/admin path, not the external scheduled-task route.

## Response style

When answering the user:

- Explain the model briefly.
- Show the exact recommended tool call arguments.
- Include an example `RunDataJson` when handler config is needed.
- Mention validation steps and expected evidence.
- If you create or update the row, report ProcessID, ProcessName, Action, RunEvery, handler coordinates, enabled state, and validation result.

## Safety rules

- Use conservative intervals for new recurring work unless the user specifies otherwise.
- Do not enable frequent or expensive processes without clear confirmation.
- Do not add silent defaults for handler-required config; if required config is missing, ask for the one missing fact after checking available sources.
- Keep recurring processes deterministic; prompt-driven work generally belongs in `ExternalScheduledTask` unless the user explicitly wants interval-driven prompt execution.
