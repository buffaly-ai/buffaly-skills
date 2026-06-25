# FileSystem index.pts Change History

## Thin Wrapper Cleanup (2026-04-15)
- Removed trivial wrapper-side validation/error-string returns from direct `SystemOperations`, `FileSystemTools`, and `RipGrepTools` forwarders in the FileSystem skill.
- Kept the cleanup limited to simple launch/list/search wrappers and left path-resolution and write-mode helpers unchanged.
- Design: validation now stays with the authoritative tool paths instead of duplicating lightweight guard behavior in ProtoScript wrappers.

## 2026-04-19
- Added CodingContext as an additional parent on ToSearchTextInDirectoryWithRipgrep so ripgrep search is discoverable from the coding-context tool surface as well as the FileSystem skill.
- Design: keep ripgrep available as a native file-system action while making it directly eligible for coding-context routes that need fast codebase text search.