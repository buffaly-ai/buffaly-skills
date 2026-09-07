# ComputerUse skill

- Replaced detached runner/status/wait actions with ten exact-window Computer Use function actions matching the active N2 target contract.
- Each action is a thin wrapper over `Buffaly.DesktopAutomation.ComputerUseToolService` and reads the authoritative active semantic-tool session key from `ComputerUseToolService.GetCurrentSessionKey()` into a typed local variable before calling the service. The explicit two-step flow avoids ProtoScript nested static-call evaluation failures, avoids nullable `_opsAgent` injection, and keeps the session identifier out of the model-visible tool schema.
- `list_apps` is the target-selection source; models must choose an exact returned window and use its opaque `WindowId`/`Id` rather than a free-form app/process string.
- `get_app_state(opaqueWindowId)` builds a typed `ComputerUseGetAppStateRequest` with `Target.WindowId` and preserves the native structured screenshot-plus-accessibility return value for same-session model continuation.
- All mutation tools accept `opaqueWindowId` and `expectedObservationId`, build typed requests with `Target.WindowId` plus `ExpectedObservationId`, and intentionally do not expose or set the retired free-form `App` input.
- The model must call `get_app_state` before interaction and re-observe after every successful mutation before reusing element ids or observation ids.
