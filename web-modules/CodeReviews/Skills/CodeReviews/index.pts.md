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

