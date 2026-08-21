# CodingActions.pts Change Notes

## 2026-04-17
- Added `CodingContext` as the core grouping prototype for coding-oriented core tools.
- Added `ToApplySmartPatchToProjectFile` as the core file-oriented SmartPatch action.
- Design: keep ProtoScript as thin glue only and route file validation, patch application, and file write logic through `Buffaly.Development.Common.SmartPatch.ApplyToFileUnderRoot(...)`.
- Design: removed the text-based SmartPatch core tool exposure so the agent-facing contract is file-based only.

## 2026-04-18
- Reworked `ToApplySmartPatchToProjectFile` to route directly through `SmartPatch.ApplyToFileUnderRoot(...)` and added the sibling `ToApplySmartPatchToFileUnderRoot` action for explicit-root edits outside the current agent project root.
- Clarified SmartPatch grammar requirements in the tool descriptions: the `*** Update File:` path must exactly match the provided `relativePath`, each `@@` chunk must contain at least one `+` or `-` line, and unified-diff headers/line-number hunks are not accepted.
- Updated the coding context prompt to reinforce the same SmartPatch grammar constraints for agent-generated patch payloads.
