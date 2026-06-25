# index.pts Change History

## Add Fast PowerShell Process Actions (2026-04-21)
- Added `ToExecuteFastPowerShellOperation` and `ToExecuteFastPowerShellOperationWithTimeout` so callers can opt into the in-process PowerShell host for lower startup overhead.
- Added `ToExecuteFastPowerShellOperationInWorkingDirectory` and `ToExecuteFastPowerShellOperationInWorkingDirectoryWithTimeout` to expose the fast path with explicit working-directory control.
- Preserved the existing disallowed Buffaly session HTTP guard on every new action.
- Design Decision: keep the existing external PowerShell actions as the conservative default while exposing the faster path through explicit opt-in action names.

## Update Fast PowerShell Descriptions For Managed Worker Compatibility (2026-06-13)
- Restored the fast PowerShell action descriptions to describe the managed PowerShell compatibility path rather than the retired in-process host implementation.
- Design Decision: preserve existing ProtoScript action names and signatures while making the user-facing contract clear that timeout/kill behavior is now owned by the managed process worker layer.

## Add Runtime UI Event Test Action (2026-06-12)
- Added `ToEmitRuntimeUiEvent` as a thin ProtoScript wrapper over `_opsAgent.EmitRuntimeUiEvent(...)` for Phase 2 bridge validation.
- Design Decision: keep the action under the existing Process skill for immediate validation without adding a new skill registration path; the C# runtime host owns event shaping and websocket routing.

## Streaming Console Output Action (2026-06-13)
- Added `ToExecuteStreamingPowerShellOperationWithTimeout` to run real PowerShell through `SystemOperations.RunPowerShellStreamingToRuntimeUi(...)` and emit live stdout/stderr as `console-output` runtime UI events.
- Design Decision: keep streaming output opt-in for validation and Phase 3 groundwork instead of changing existing process tool behavior unexpectedly.

## Realtime Existing PowerShell Tool Output (2026-06-13)
- Routed the existing command-line, PowerShell, and fast PowerShell action implementations through runtime-UI streaming paths so the normal tool cards can show stdout/stderr in realtime through browser `console-output` events while preserving final captured output.
- Added a small stream-label helper so working-directory scoped tools label the visible console stream with the PowerShell context and working directory.
- Design Decision: make realtime output the default for existing process tools now that Phase 2/3 websocket rendering is available, rather than requiring agents to choose a separate streaming-only action.

## Add Phase 4 Live Tool Input Round Trip Action (2026-06-13)
- Imported shared runtime abstraction contracts for typed live tool input collection and typed runtime UI output.
- Added `ToRunLiveToolInputRoundTripTest`, a real ProtoScript action that emits live output, calls `_opsAgent.CollectLiveToolInput(new LiveToolInputCollectionRequestContract { ... })`, waits for the browser-submitted value, emits follow-up output, and returns the value.

## Use Non-Overloaded Typed Runtime Output Method (2026-06-13)
- Updated `ToRunLiveToolInputRoundTripTest` to call `_opsAgent.EmitRuntimeUiOutput(new RuntimeUiEventOutputContract { ... })` because the existing `_opsAgent.EmitRuntimeUiEvent(string, string)` binding rejected the typed overload.

## Expose Phase 4 Proof Action As Core Tool (2026-06-13)
- Added `CoreAction` to `ToRunLiveToolInputRoundTripTest` so normal Buffaly sessions can discover, load, and call the Phase 4 live input proof action from the visible tool surface. This default-tool exposure was later removed when the core tool surface was narrowed.
- Design Decision: keep the action in the existing Process skill while avoiding default `CoreAction` exposure unless a tool is truly bootstrap capability.

## Make Phase 4 Proof Success Check Value-Based (2026-06-13)
- Changed `ToRunLiveToolInputRoundTripTest` to use the returned `Value` as the success indicator instead of relying on ProtoScript string inequality against `Status`, which incorrectly sent the accepted `submitted` result down the failure branch during staging proof.
- Design Decision: the proof action's acceptance criterion is that ProtoScript resumes with the submitted value, so the branch should key off that value directly.

## Add Multi-Step Live Tool Input Coordination Test (2026-06-14)
- Added `ToRunMultiStepLiveToolInputCoordinationTest`, a real ProtoScript action that performs three sequential `CollectLiveToolInput(...)` calls in one tool invocation.
- The action emits typed runtime UI output after each submitted value and returns a final summary, proving repeated browser input collection/resume/output coordination.

## Add GitHub Auth Visible Output Tool (2026-06-14)
- Added `ToRunGitHubAuthLoginWithVisibleOutput`, a Process skill action that launches `gh auth login` through the streaming PowerShell path and passes one `ProcessToolDisplayOptions` object with `ForceOpenToolWindow = true`.
- Design Decision: use explicit launch-time display intent for auth-code workflows instead of stdout/stderr string detection, and keep display metadata grouped in one object rather than adding more scalar process parameters.
