# ErrorLogDiagnosis Skill Change History

## Add Local Error Memory Search (2026-07-20)

- Added `ToSearchErrorMemories` for bounded root-wide search under the current session's scoped `Error Memory` tag.
- Added `ToSearchErrorMemoriesInCategory` for bounded search under one exact `ErrorMemoryRoot` descendant.
- Both actions derive `session:<sessionKey>` from the runtime host and delegate category/status filtering to the shared SemanticDatabase C# implementation. They return native prototype candidates so callers can inspect saved signatures, anchors, owner, routing rule, and status without ad hoc JSON.
- The taxonomy itself remains session-local NLMemory and is not declared by this bundled skill.

## Add Phase 0 Skill Shell (2026-06-14)

- Added the initial Error Log Diagnosis ProtoScript skill shell for future interactive-site launch actions.
- Design Decision: keep Phase 0 action-free until the generic interactive-site launch/runtime contracts exist.

## Add Phase 2 Static Interactive Site Test (2026-06-14)
- Added ToRunErrorLogDiagnosisStaticInteractiveSiteTest to load module-owned site assets, launch them through _opsAgent.LaunchInteractiveSite, and wait for browser exit.

## Load Interactive Site Assets From Skill Folder (2026-06-14)
- Moved the Error Log Diagnosis static interactive-site assets under the ErrorLogDiagnosis skill folder and changed the ProtoScript loader to read from `Skills/ErrorLogDiagnosis/interactive-sites/error-log-diagnosis-settings` relative to the current project directory.

## Add Validation-Friendly Explicit Message Launch (2026-06-15)
- Added `ExecuteForMessage(processID, timeoutSeconds, messageKey, toolInvocationId)` so staging validation and direct `RunProtoScriptMethod` callers can provide the live-channel identity required by `LaunchInteractiveSite`.
- Kept `Execute(processID, timeoutSeconds)` as the normal tool-invocation entry point by delegating to `ExecuteForMessage` with blank message fields, preserving existing behavior when the runtime has current tool-card context.
- Design Decision: keep skill-owned UI assets installed alongside the ProtoScript skill rather than deriving app/web-module install paths.

## Add Read-Only Settings Details Launcher (2026-06-14)
- Updated the interactive-site launcher to accept a `processID`, pass the generated Error Log Diagnosis settings JsonWs declaration to the site, and inject the selected process ID into the site bundle.
- Design Decision: Phase 6 keeps the site read-only and loads live settings through the existing websocket-backed JsonWs service client before adding edit/save behavior.

## Add Local Edit And Discard Mode (2026-06-14)
- Added details/edit mode switching to the Error Log Diagnosis settings site with PascalCase `data-bind` fields and local bind/unbind helpers.
- Added Discard behavior that returns to the unchanged loaded settings without calling `SetSettings`; save is intentionally deferred to the next phase.

## Add Save And Repeatable Edit Loop (2026-06-14)
- Added Save behavior that unbinds the edit form, calls `SetSettings` through the websocket-backed JsonWs service client, stores the returned settings object, and returns to refreshed read-only details.
- Design Decision: saves happen immediately while the interactive site remains open so users can repeat edit/save/discard cycles before exiting.

## Clean Up Settings Interactive Site Presentation (2026-06-15)
- Reworked the Error Log Diagnosis settings interactive-site layout into grouped detail cards and grouped edit fieldsets so the live-tool popup is easier to scan.
- Kept the generated JsonWs client, PascalCase settings contract, and existing save/discard flow unchanged; this is a presentation-only cleanup.


## Restore Lab-Compatible Declaration Fallback (2026-06-15)
- Restored the runtime install-root fallback for the generated ErrorLogDiagnosis JsonWs declaration so fresh staging sessions can launch the real interactive site when project-local `Generated/JsonWs` is absent.
- Returned a clear error string for missing `processID` instead of throwing `InvalidOperationException`, avoiding a ProtoScript compile dependency issue in staging.

## Fix Installed Compile Assembly Imports (2026-06-15)

- Removed local `System.IO` and `RuntimeInstallRootFeature` imports from the module skill wrapper so the installed OpsAgent project uses the authoritative project-wide imports from `Imports.pts` instead of failing on repeated skill-local assembly imports.
