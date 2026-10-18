# Utilities/index.pts history

## 2026-10-18 — globally discoverable filesystem utilities remain lazy
- Added ToFindAncestorInstructionFiles and ToVerifyClaimedFileHashes through source-scoped ProtoScriptPrototypeUpsertTools parse/upsert. Thin wrappers call FileSystemUtilityTools; retain established parameter names and return truthful typed-result JSON at boundary.
- Utilities/index.pts.lazy.json maps both actions and phrases. Eager FileSystem index only declares this submodule lazy; no startup context/root inheritance added.
- Validation: Utility.Tests26/26, including actual parser/index discovery with absent actions before load, explicit module activation, wrapper execution for ancestor and hash helpers, malformed claims and mismatch evidence. Loading FileSystem utilities does not materialize Node action. No installed deployment or live semantic-index writes.
