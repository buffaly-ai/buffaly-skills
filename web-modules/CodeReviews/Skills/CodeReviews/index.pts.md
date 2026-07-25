# CodeReviews ProtoScript tools

The skill exposes source-grounded review readers and lifecycle completion actions. Attached turn-level review adds:

- `ToAttachConfiguredCodeReviewAgent`, `ToDetachCodeReviewAgent`, and `ToGetCodeReviewAttachmentStatus`
- `ToDispatchCodeReviewTurnCompletedEvent` for typed event callbacks
- grouped findings, clean-completion, and failure actions that project one result onto every manifest commit

Commit-free turns return the typed callback result with `ShouldQueue=false`. Existing single-commit actions remain available for explicitly separate historical/retry review.

## Attached Turn-Level Actions (2026-07-19)
- Added attach/status/detach/dispatch actions and grouped completion actions. Grouped actions accept the delivered `SourceTurnContextJson` as one opaque cross-worker binding rather than separate repository paths, SHAs, or source-session keys; single-commit fallback actions remain unchanged.

