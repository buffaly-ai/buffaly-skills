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

## 2026-10-18 — lazy read-only utility declaration
- Imported FileSystemUtilityTools and declared include lazy Utilities/index.pts. Ancestor/hash actions remain outside eager source declarations/default context roots; no existing action signature changed.
- Validation: changed index parsed; actual lazy maps and module wrapper execution verified in Utility.Tests26/26. Source-only, no installed activation.

## 2026-11-05 — Coding-context bounded document reader
- Added ToReadFileDocument as a thin Prototype-returning FileSystemSkillAction/CodingContext facade. Start at 1/0; continue with its exact returned line/UTF-16 offset until EOF. Describes the 32768 rendered-character maximum and when narrow search/pages are preferable. Existing actions and inheritance are unchanged.
- Validation: actual definition parsed/upserted into a disposable project with the typed authoring service, compiled, executed and registered through real ToolRegistrar/TooledAgent dispatch. Full 25000-character source reaches structured ContentParts intact; scoped 47/47 regressions pass. Not deployed to staging or Matt-local.

## 2026-11-13 — Online critic efficiency design proposal v4
- Affected source: content/projects/OpsAgent/Skills/FileSystem/index.pts
- Proposed change and reason: Remove raw reader from routine CodingContext while preserving compatibility and size policy; expose known-file search and improve whole-document discovery.
- Validation status: parent/Opus source review and unified-patch applicability only; compilation, unit/integration tests, runtime evaluation and deployment have NOT been performed. Preserve prior history and add actual batch validation evidence when implementation is authorized.

## 2026-11-14 — Route routine inspection by purpose, preserve compatibility
- Removed Raw's routine CodingContext membership and corrected its description: exact compatibility action/aliases/API mapping and 10,240-byte pre-read guard remain. Added known-file search membership, clarified range/document selection and retained StringRef payload chaining. No new size probe, cap increase or unconditional full-file dump. CodingContext and critique prompts now route literals/ranges to search/block readers and required complete documents through exact cursor-to-EOF reading.
- Validation: actual normal-profile compile confirms Raw is not a CodingContext descendant and search/StringRef readers remain members. Actual wrappers accept exactly 10,240 UTF-8 bytes, reject 10,241 without payload, chain the retained StringRef reader through materialization, and keep a one-line read bounded. Four existing complete-document/Unicode/cursor/boxed-dispatch cases pass. Evidence: focused-ready.trx (22/22). This proves contracts and selection membership, not model-wide token savings. Installed guidance/staging proof remains pending.

## Scoped search design v1 (2026-11-14)
- Proposed: existing directory action uses bounded hash-checked search pages and optional filename scope. Legacy C# search/context APIs remain unchanged. No product deployment or runtime validation claimed by this design entry.

## 2026-11-14 — Approved scoped/page search compatibility correction v3
- Kept ToSearchTextInDirectoryWithRipgrep's exact name/phrase/two-argument body and grouped bounded sample behavior; description now states sample limits. Moved routine CodingContext membership to new ToSearchTextInDirectoryPage, with a distinct phrase and five required explicit arguments. Initial empty/0/empty values are not omitted-default support.
- Typed parse/upsert authored wrappers. Actual compiler exact-arity failure invalidated v1's default assumption; coordinator approved the separate action rather than a compiler change. Actual whitespace failure in ordinary string dispatch led to approved Prototype return via RipGrepTools.SearchDirectoryPage/DirectorySearchPage; authoritative ContentParts preserve exact Text, with no global registrar edit.
- Updated CodingContext guidance only; no critic/UI changes or alias removal. Bounded inventory found no production .pts direct legacy callers; retained eviction/UI/guidance references remain valid under the old identity.
- Validation: real isolated ProtoScript legacy2/new5 callers, exact-name registration,2/5-required schemas, CodingContext descendants and boxed full cursor delivery pass. pipeline-v3.trx3/3; broader final-acceptance.trx111 passed/2 skipped. Nonparallel, artifact-only exclusion of unrelated in-flight QA test; no full installed profile/semantic-DB ranking, deployment or token/latency claim.

## 2026-11-14 — Final compatibility and normal-build validation
- Restored both additional legacy semantic aliases through typed ProtoScriptPrototypeUpsertTools after final diff review. All three original aliases, exact action name and two-argument Execute body remain; only routine CodingContext membership moves to the separately named five-explicit-parameter page action. New action uses the existing boxed structured-result path. Typed upsert's extra separator/EOF blank lines are retained as mechanical authoring output, not a semantic change.
- final-normal-v4.trx: 111 passed, 2 skipped, zero failures, including actual old/new compiled callers, required schemas, context membership, alias assertions and exact model-facing ContentParts. Normal nonparallel build without earlier QA exclusion. No installed catalog, live semantic-ranking or deployment claim.
