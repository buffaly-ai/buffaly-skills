# SessionSync index.pts Change History

## Wrapper Cleanup (2026-04-15)
- Removed dead `SessionSync` debug and temporary-unavailable actions that were not authoritative tool paths.
- Consolidated recent-session batch import down to one working ProtoScript wrapper over `SessionSemDbSyncDriver.SyncRecentSessionsAsDiagnostics(...)`.
- Renamed the full-sync and recent-batch actions to drop stray `Ops` naming where it was just wrapper noise.
- Design: kept the remaining ProtoScript actions as thin pass-through wrappers and removed wrapper-side default session-root policy from the full-sync action.

## Additional Wrapper Cleanup (2026-04-15)
- Removed simple wrapper-side `Error:` guard returns from direct `SessionSemDbSyncDriver` and `SessionFragmentResolutionDriver` forwarders so those actions stay thin.
- Renamed the prompt action prototype to remove leftover `Ops` naming noise without changing its prompt path or prompt behavior.

## Service-First Remote Session SemDB Surface (2026-04-21)
- Added a singleton `SessionSemDbSearchService` that exposes semantic, exact, and hybrid search actions while keeping the ProtoScript layer as thin pass-through wrappers.
- Kept ProtoScript imports bound to the stable session driver classes (`SessionSemDbSyncDriver`, `SessionFragmentResolutionDriver`, `SessionConversationSearchDriver`) after moving the real remote implementation behind the centralized C# module.
- Added plain remote import and fragment-resolution actions plus semantic conversation search wrappers that continue to call the existing driver surface.
- Design Decision: match the Buffaly service-first pattern in ProtoScript without importing the new remote module type directly, avoiding runtime type-resolution issues while preserving the new centralized C# design.


## Scaffold SessionSemDb Phase 1 Service Surface (2026-04-22)
- Added a singleton SessionSemDbService that initializes the new Buffaly.SessionSemanticDatabase.SessionSemDbModule and exposes one projected service-status tool for the Phase 1 facade.
- Kept the existing driver-backed actions and SessionSemDbSearchService intact so Phase 1 adds the new service boundary without breaking current tool names.
- Design Decision: introduce the decoupled service/module seam in ProtoScript first while deferring the wider action migration to a later phase.

## Remove Temporary SessionSemDb ProtoScript Facade Imports (2026-04-22)
- Removed the temporary ProtoScript imports and SessionSemDbService singleton that depended on newly introduced SessionSemDb CLR facade types.
- Kept SessionSemDbSearchService bound directly to SessionConversationSearchDriver and left the existing sync/fragment driver imports in place.
- Design Decision: expose search through one minimal ProtoScript service over the existing driver surface instead of adding a new C# service/module abstraction layer.

## Clarify Local Sessions Semantic Ownership (2026-04-22)
- Updated SessionSync skill and action descriptions to describe the current Sessions-owned local semantic storage/search path instead of the old remote Sessions SemDB wording.
- Kept the existing action/tool names stable while aligning ProtoScript descriptions with the actual imported `Buffaly.SessionSemanticDatabase` driver implementation.
