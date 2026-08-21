# CoreActions.pts Change Notes

## 2026-04-12
- Added `ToRememberOntologyObjectSkill` and `ToRememberHowToDoSomethingSkill` as `PromptAction, CoreAction`.
- Rewrote their descriptions to explain the concrete task fit the model should recognize instead of meta wording about loading a workflow.
- Design: remembering facts/preferences and remembering procedures should be core-discoverable before low-level prototype upsert tools.

## 2026-04-17
- Updated `ToApplySmartPatchToText` to remain the core typed wrapper over `Buffaly.Development.Common.SmartPatch` while routing through `Apply(...)` instead of `ApplyToRelativePath(...)` because direct ProtoScript binding to the overload was unreliable at compile time. The `expectedRelativePath` parameter remains the tool-boundary contract for the single update section.
- Added `ToApplySmartPatchToProjectFile` as the preferred core small-edit fallback. Design: provide a safer non-Codex file-writing path that uses stripped-down Codex-style update-only patch grammar against one project-relative existing file instead of raw shell text mutation.
## 2026-04-17
- Moved SmartPatch-related coding actions out of `CoreActions.pts` into `CodingActions.pts`.
- Design: keep general core/system actions separate from coding-edit actions so tool descriptions remain easier to maintain and compile.

## 2026-04-18
- Removed deprecated ToSetSessionPlan from CoreActions.pts because freeform plan editing is disabled and the tool only returned an error message.
- Design: keep unsupported plan-writing paths out of the callable tool surface so models route directly to the structured session-plan wrappers.

## 2026-04-18
- Removed deprecated ToSetSessionPlan from OpsAgent CoreActions so semantic discovery no longer advertises a disabled freeform plan writer.
- Design: unsupported plan editing paths should be removed from the discoverable tool surface once structured session-plan wrappers are the only supported route.

## 2026-05-07
- Updated `ToResolveStringReference` guidance: this action is now the authoritative StringRef materializer and should accept `StringRef` directly, returning `string` so ProtoScript performs the materialization at the typed boundary.
- Design: no normalizer/helper function is required for this path; a `string` parameter can echo serialized handle text, while a `StringRef` parameter preserves the reference boundary.

## 2026-06-09
- Updated `ToSearchCandidateActions` guidance to keep action queries operation-focused and route entity binding through separate entity search.
- Updated `ToSearchCandidateEntities` guidance to search exact target names or aliases separately from type/category searches before reconciling results.
- Design: semantic discovery should decompose target identity, entity type, and action intent instead of hiding the correct binding inside one overloaded query.


## 2026-06-14
- Routed `ToGetSessionScratch`, `ToAppendSessionScratch`, and `ToSetSessionScratch` through `SessionPlanManagementService` instead of direct ProtoScript `File.*` calls.
- Design: Plan/Scratch tools should share the same C# bounded-retry file I/O path so transient local file contention surfaces as explicit diagnostics instead of apparent worker hangs.
## 2026-06-13
- Renamed the callable session-plan status tools from `To*SessionPlanTask` to `To*SessionPlanStep` without compatibility aliases.
- Updated parameter descriptions from `taskText` to `stepText` so plan items are consistently described as steps.
- Design: reserve "Task" for durable local task artifacts and use "Step" for Plan.md execution items.

## 2026-06-13
- Added `ToListLocalTasks`, `ToListActiveLocalTasks`, and `ToSetLocalTaskStatus`.
- Design: expose simple typed task-status accounting without turning task documents into plan steps or requiring manual markdown edits for status-only changes.

## 2026-06-20
- Removed `CoreAction` from `ToLoadContextPrompt`, `ToResolveStringReference`, and `ToGetPrototypeNotes` during the second default-core-surface cleanup pass.
- Design: keep default-loaded core tools focused on bootstrap discovery and session continuity; specialized helpers remain discoverable/loadable through semantic action search.

