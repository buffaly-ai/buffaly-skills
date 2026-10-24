# CodeReviews ProtoScript tools

## Resolve native turn-reader contracts during independent lazy compilation (2026-10-06)
- Added explicit Host imports for `TurnSummaryContract` and `GetSessionTurnBootstrapResponse`, the existing return types of `ToGetGlobalCodeReviewMostRecentSourceTurn` and `ToGetGlobalCodeReviewRecentSourceTurns`.
- The entry point previously depended on SessionManagement loading those imports first. Keep the existing typed contracts and `Contracts.pts` include; do not include the broader SessionManagement action tree or introduce alternate result shapes.
- Validation: freshly built AgentRemoteJsonWs.Tests (0 warnings/errors), then 37 local tests passed. A real CoreLite-only runtime compiles the fixed module and resolves both reader actions while `ToGetRecentSessionTurns` remains absent; removing either import independently produces a compiler failure naming that contract.
- The broader 38-test run before splitting the negative cases passed 36 and failed only the two existing Dev/Staging session-list HTTP integration tests with status 500. Installed-package publication, deployment and live reviewer execution were not performed; no Matt-local processes were restarted. Edit the owning WebHarness source, not the synchronized buffaly-skills payload.

## Compile the action-root contract with the lazy module (2026-08-09)
- `index.pts` explicitly includes `Contracts.pts`, so lazy compilation resolves `GlobalCodeReviewsAgentAction` before compiling actions that inherit it.
- Packaging the sibling contract file without including it was insufficient because the lazy ownership sidecar loads `index.pts` as the module entry point.

The skill exposes source-grounded review readers and lifecycle completion actions. Attached turn-level review adds:

- `ToAttachConfiguredCodeReviewAgent`, `ToDetachCodeReviewAgent`, and `ToGetCodeReviewAttachmentStatus`
- `ToDispatchCodeReviewTurnCompletedEvent` for typed event callbacks
- grouped findings, clean-completion, and failure actions that project one result onto every manifest commit
- `ToGetCodeReviewCommitDiff` and `ToGetCodeReviewFileAtCommit` expose bounded, read-only evidence from the exact repository/SHA manifest through `GitCheckInBrowserService`; they never substitute the working tree or use PowerShell

Commit-free turns return the typed callback result with `ShouldQueue=false`. Existing single-commit actions remain available for explicitly separate historical/retry review.

## Dedicated Global Reviewer Surface (2026-07-31)
- `GlobalCodeReviewsAgentAction` is the exact profile root for the automatic global reviewer. Selected source-artifact readers, exact commit/file evidence actions, and the three grouped terminal actions opt into this root while retaining their legacy CodeReviews inheritance.
- `ToGetGlobalCodeReviewMostRecentSourceTurn` and `ToGetGlobalCodeReviewRecentSourceTurns` provide bounded typed turn summaries without exposing the entire SessionManagement action tree.
- `ToGetGlobalCodeReviewLanguageGuidance` validates one language token with `StringUtil.EqualNoCase(...)`, resolves its authoritative prompt path from an explicit `new String()` local, and returns a typed local loaded through the trusted runtime prompt loader. This follows established ProtoScript string-comparison, host-method binding, and definite-assignment patterns.
- CRM, Plan mutation, attach/detach, prompt-action, status, GitHub-interaction, generic shell/filesystem, and single-commit completion actions are intentionally outside this root.

## Attached Turn-Level Actions (2026-07-19)
- Added attach/status/detach/dispatch actions and grouped completion actions. Grouped actions accept the delivered `SourceTurnContextJson` as one opaque cross-worker binding rather than separate repository paths, SHAs, or source-session keys; single-commit fallback actions remain unchanged.


## 2026-10-11 — Complete bounded review evidence
- Added thin complete manifest/patch/file/artifact page wrappers and extended authoritative guidance with optional offset and exact SQL/Metabase/subject tokens. Legacy whole diff/file retained for non-global callers, excluded from GlobalCodeReviewsAgentAction. Regenerated index.pts.lazy.json through canonical strict generator in fresh diagnostic process because installed host loaded old WebHarness; 31 prototypes, zero diagnostics. No installed package edits.
- Validation performed: owning WebHarness Debug build passed; fresh serial test rebuild passed; all 63 non-environment CodeReviews tests passed, including 10 complete evidence cases and real profile/lazy module compile cases. Canonical isolated sidecar generation succeeded with no diagnostics. Host cap/core source unchanged. Existing dependency vulnerability warnings remain. No installed deployment, live model review, replay, SQL change or Matt-local restart was performed. Those are separate from source acceptance.

## 2026-10-11 — Enforced complete review evidence
- Added thin exact-commit path-discovery action and optional CharacterOffset to source Plan/Scratch/task/artifact/catalog readers; facade returns bounded coherent pages. Preserve action roots and all read-only scope limits. Regenerated index.pts.lazy.json with canonical isolated generator (32 prototypes, zero diagnostics).
- Validation: owning Debug build and all 77 non-environment tests passed, including actual CoreLite eager profile and independent full lazy compile. Installed deployment/live review not yet performed for this batch. Active-project authoring tools do not target this externally owned module; scoped SmartPatch was used on owning source after authoring route inspection.

## 2026-10-21 — Native binary inspection action
- Added ToInspectCodeReviewCommittedBinary with exact RepositoryPath/CommitSha/FileIndex and optional ParentSide; imports the authoritative inspection service/native structured result. Includes images as native visual content, typed font validation and explicit unsupported failures. Global action root remains bounded/read-only.
- Updated generated index.pts.lazy.json through canonical strict LazySkillIndexGenerator in isolated source-root context: 33 prototypes, zero diagnostics. Active personal authoring tools cannot target this externally owned extension; scoped SmartPatch used for the binding.
- Validation: full owning suite 101/101 passed, including real full lazy/eager CoreLite compilation and execution of the declared native return preserving image parts. Release build/publish and original-manifest isolated validation passed; no installed update/model review/restart.

## 2026-10-24 — Linked governing-document ownership
- Aligned `ToReadCodeReviewSourceArtifactPage.Description` with the eager profile: use the exact referenced document owner for linked governing artifacts, not necessarily the immutable implementation source. Require session-relative paths, complete stable paging and unchanged completion context; forbid unrelated session browsing.
- The underlying Execute signature/delegation and grouped completion contracts remain unchanged. This fixes misleading guidance rather than adding cross-session access or weakening path validation. The lazy ownership sidecar contains names/paths/infinitive phrases only; none changed, so regeneration is unnecessary.
- Active-project prototype upsert cannot target this externally owned module; a scoped owning-source SmartPatch changed only Description.
- Validation: fresh serial Debug test build, focused 10/10 tests (including actual eager/lazy CoreLite compilation) and broader 110/110 suite passed. New owning-facade fixture checks full multi-page linked-owner reads, hash/identity/length, source-owner distinction and unchanged rooted/traversal/missing/locked-read failures. Initial short dependency rebuild timed out without tests; longer run succeeded. Existing dependency warnings remain. No installed update, model review, review status change, retry or protected-process restart.

## 2026-10-24 — Turn-bound discovery snapshots
- Align eager/lazy catalog wrappers by passing _opsAgent to GetSourceCatalogPageJson. Native owner captures only the reviewer turn's first source catalog and persists it under the reviewer's fixed evidence path; repeat/continuation calls retain bytes while source metadata changes. Description names that retention boundary; source sessions remain read-only and no generic write action is added.
- External owning module cannot be targeted by active-project upsert; scoped source SmartPatch used. Names/phrases and lazy ownership metadata remain unchanged, so no sidecar regeneration needed.
- Validation: full owning suite passed 115/115, zero skipped, including real eager/lazy compilation and changing-source/task catalog tests. Deployment and live model acceptance not performed at this entry.

## 2026-10-24 — Align lazy ProtoScriptMinimum guidance discovery
- Match eager description for the closed canonical reference token and its installed project ownership; do not search reviewed application files for this shared reference. No wrapper signature, action root or phrase changed, so ownership-sidecar regeneration is unnecessary. Active-project upsert cannot target this owning source; used scoped SmartPatch rather than installed-file edits.
- Validation: full owning suite passed 117/117, zero skipped, including real eager/lazy ProtoScript compilation. No live reviewer claim.
