# CodeReviews ProtoScript tools

The skill exposes source-grounded review readers and lifecycle completion actions. Attached turn-level review adds:

- `ToAttachConfiguredCodeReviewAgent`, `ToDetachCodeReviewAgent`, and `ToGetCodeReviewAttachmentStatus`
- `ToDispatchCodeReviewTurnCompletedEvent` for typed event callbacks
- grouped findings, clean-completion, and failure actions that project one result onto every manifest commit
- `ToGetCodeReviewCommitDiff` and `ToGetCodeReviewFileAtCommit` expose bounded, read-only evidence from the exact repository/SHA manifest through `GitCheckInBrowserService`; they never substitute the working tree or use PowerShell

Commit-free turns return the typed callback result with `ShouldQueue=false`. Existing single-commit actions remain available for explicitly separate historical/retry review.

## Dedicated Global Reviewer Surface (2026-07-31)
- `GlobalCodeReviewsAgentAction` is the exact profile root for the automatic global reviewer. Selected source-artifact readers, exact commit/file evidence actions, and the three grouped terminal actions opt into this root while retaining their legacy CodeReviews inheritance.
- `ToGetGlobalCodeReviewMostRecentSourceTurn` and `ToGetGlobalCodeReviewRecentSourceTurns` provide bounded typed turn summaries without exposing the entire SessionManagement action tree.
- `ToGetGlobalCodeReviewLanguageGuidance` reads only the authoritative CSharp, ProtoScript, or JavaScript CodeReviews guidance through the trusted runtime prompt loader.
- CRM, Plan mutation, attach/detach, prompt-action, status, GitHub-interaction, generic shell/filesystem, and single-commit completion actions are intentionally outside this root.

## Attached Turn-Level Actions (2026-07-19)
- Added attach/status/detach/dispatch actions and grouped completion actions. Grouped actions accept the delivered `SourceTurnContextJson` as one opaque cross-worker binding rather than separate repository paths, SHAs, or source-session keys; single-commit fallback actions remain unchanged.

