# FileSystem index.pts Change History

## Add Path Existence Action (2026-08-15)
- Added `ToTestFileExists` as a FileSystem skill action that returns `true` or `false` for existing files and directories.
- Design: expose the common PowerShell `Test-Path` replacement from the FileSystem skill rather than the generic Process skill.

## Add Typed File Copy Action (2026-08-15)
- Added `ToCopyFile` as a thin wrapper over `FileSystemTools.CopyFile` with explicit overwrite behavior.
- Design: keep local file copying in the FileSystem skill and avoid PowerShell `Copy-Item` for this common operation.

## Thin Wrapper Cleanup (2026-04-15)
- Removed trivial wrapper-side validation/error-string returns from direct `SystemOperations`, `FileSystemTools`, and `RipGrepTools` forwarders in the FileSystem skill.
- Kept the cleanup limited to simple launch/list/search wrappers and left path-resolution and write-mode helpers unchanged.
- Design: validation now stays with the authoritative tool paths instead of duplicating lightweight guard behavior in ProtoScript wrappers.

## 2026-04-19
- Added CodingContext as an additional parent on ToSearchTextInDirectoryWithRipgrep so ripgrep search is discoverable from the coding-context tool surface as well as the FileSystem skill.
- Design: keep ripgrep available as a native file-system action while making it directly eligible for coding-context routes that need fast codebase text search.

## 2026-10-09 — C6 bounded file page wrappers
- Replaced ToGetFileBlock wrapper-side path/validation logic with the authoritative C# ReadFileBlockPage facade, preserving its four-argument caller signature and beginning at offset zero. Added ToGetFileBlockPage thin continuation wrapper with explicit characterOffset.
- Description states actual range/EOF/cursor and bounded response semantics. Authored owning source through ProtoScriptPrototypeUpsertTools parse/upsert, not installed Matt-local files.
- Validation: typed parse/upsert succeeded for both definitions; C# tools/test builds0errors and paging regressions pass. Full skill binding/installed staging acceptance pending.
