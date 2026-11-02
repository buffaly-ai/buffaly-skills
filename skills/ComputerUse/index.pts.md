# ComputerUse skill

- Replaced detached runner/status/wait actions with ten exact-window Computer Use function actions matching the active N2 target contract.
- Each action is a thin wrapper over `Buffaly.DesktopAutomation.ComputerUseToolService` and reads the authoritative active semantic-tool session key from `ComputerUseToolService.GetCurrentSessionKey()` into a typed local variable before calling the service. The explicit two-step flow avoids ProtoScript nested static-call evaluation failures, avoids nullable `_opsAgent` injection, and keeps the session identifier out of the model-visible tool schema.
- `list_apps` is the target-selection source; models must choose an exact returned window and use its opaque `WindowId`/`Id` rather than a free-form app/process string.
- `get_app_state(opaqueWindowId)` builds a typed `ComputerUseGetAppStateRequest` with `Target.WindowId` and preserves the native structured screenshot-plus-accessibility return value for same-session model continuation.
- All mutation tools accept `opaqueWindowId` and `expectedObservationId`, build typed requests with `Target.WindowId` plus `ExpectedObservationId`, and intentionally do not expose or set the retired free-form `App` input.
- The model must call `get_app_state` before interaction and re-observe after every successful mutation before reusing element ids or observation ids.

## 2026-11-01 — Discovery and pointer wrapper draft (in progress)
- Added direct typed forwarding of bounded observation search, continuation, subtree and visit/output limits, plus observed hover and paired-coordinate scroll_at without changing existing scroll/drag signatures.
- Draft drag_path forwards the authoritative ComputerUseDragRequest and retains all bounded waypoints, modifiers and independent destination observation fields. It is not ready for publication: actual registration exposes only a native type name and current argument binding requires an existing native token instead of materializing model JSON.
- Six isolated source/compile and boundary-reproduction tests pass. This does not prove installed tool reachability or positive advanced-request materialization; the parent is coordinating the required boundary decision.

## 2026-11-02 — Independent scalar wrapper checkpoint
- Retained get_app_state's original one-argument signature and added discover_app_state for bounded options, plus hover and scroll_at. This avoids relying on optional argument metadata that the current registrar advertises as required. Existing click, scroll and drag signatures remain unchanged.
- Removed the unusable advanced drag draft from publication source; its exact DTO schema/binder reproduction lives only in the temporary isolated test fixture while the protected boundary decision is pending.
- Six tests pass, including actual registrar parameter counts (get_app_state1, discovery7, hover5, scroll_at6) and positive runtime binding of all five hover arguments. Package publication and installed staging invocation remain outstanding.

## 2026-11-02 — Approved no-Host native drag builder chain
- Added create_drag_request, add_drag_waypoint, add_drag_modifier and set_drag_destination returning Prototype references through the existing native formatter. execute_drag_request consumes the authoritative ComputerUseDragRequest and dispatches through the existing ambient-session service.
- Existing thirteen scalar tools and simple drag signatures remain unchanged. Builder descriptions explain same-session references, new-reference chaining, no desktop input during construction, coordinate spaces and execution-time freshness/bounds. No JSON parser, DTO materializer, Host, provider or shared-schema change.
- Validation: wrapper suite passed 6/6, including actual ProtoScript builder execution, actual eighteen-action schemas, production formatter/binder round-trip, immutable earlier request and invented/wrong-type/cross-session rejection. DesktopAutomation passed 122/122. Publication and live advanced agent drag are still pending.
