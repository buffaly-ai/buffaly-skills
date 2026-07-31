# Diagnose A Buffaly Scheduled Process Failure

Use this workflow for one exact Buffaly `ProcessID` when the user asks why a scheduled/recurring process failed, did not run, timed out, or produced an unexpected last-run decision.

This is a read-only diagnostic. Do not enable, disable, trigger, run, repair, reconfigure, or mutate the process or any dependency.

## Inputs

- Required numeric `ProcessID`.
- Optional lookback window.
- Optional `maxLogLines` and `maxLogBytes`; use conservative bounded defaults when omitted.
- Optional dependency preflight flag; default true only when the RunData/handler identifies a supported dependency kind.

## Diagnostic workflow

1. Call `ToGetBuffalyProcessDetails(ProcessID)` and `ToValidateBuffalyProcessConfiguration(ProcessID)`.
2. Extract the process identity and operational state: process name, action, enabled/running/timed-out flags, `RunEvery`, run start/end, last update, maximum runtime, handler assembly/type, session key, and prompt context.
3. Inspect `RunData` and its nested `State` without echoing the full payload. Report only bounded diagnostic fields that exist, such as decision, error/error message, account keys, dispatch execution mode, build-only mode, cursors, and failure-notification status.
4. Resolve the likely log/session source from the exact handler type, process name, and session key. Use typed session/log actions when available. Read only the requested bounded lookback and enforce both line and byte limits; never dump an entire log file.
5. If the process declares a known dependency, run only read-only dependency preflight:
   - For Google Workspace account keys, use the typed account get/list or token-health action. Report booleans/status such as token present, last refresh succeeded, or reauthorization needed. Never reveal access tokens, refresh tokens, client secrets, authorization headers, or secret values.
   - For unknown dependency kinds, report that no typed preflight owner was available rather than guessing or probing with ad-hoc HTTP.
6. Classify likely causes from direct evidence only. Useful classes include disabled or unscheduled, still running, timed out, invalid process configuration, handler exception, dependency authorization failure, expected no-work decision, missing failure notification, and insufficient evidence.
7. Return a concise structured report containing:
   - process identity and schedule/state,
   - last decision/error and selected redacted RunData fields,
   - bounded log excerpts or exact pointers,
   - dependency health summary,
   - likely causes with evidence and confidence,
   - safe read-only next checks,
   - `mutative=false`.

## Hard safety gates

- Never call `ToEnableBuffalyProcess`, `ToDisableBuffalyProcess`, `ToTriggerScheduledTaskNow`, a run-now action, or any mutative repair action.
- Never print OAuth/access/refresh tokens, passwords, API keys, cookies, or full secret-bearing RunData.
- Bound every log read by lines and bytes. Prefer pointers plus short excerpts.
- Do not infer success/failure solely from `IsEnabled`; reconcile timestamps, state, validation, and logs.
- Distinguish an expected no-work decision from a failed execution.
- If dependency-specific typed tooling is unavailable, state that limitation and continue with process/config/log evidence.
