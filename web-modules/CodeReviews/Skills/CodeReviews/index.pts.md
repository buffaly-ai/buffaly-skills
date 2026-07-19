# CodeReviews ProtoScript tools

The skill exposes source-grounded review readers and lifecycle completion actions. Attached turn-level review adds:

- `ToAttachConfiguredCodeReviewAgent`, `ToDetachCodeReviewAgent`, and `ToGetCodeReviewAttachmentStatus`
- `ToDispatchCodeReviewTurnCompletedEvent` for typed event callbacks
- grouped findings, clean-completion, and failure actions that project one result onto every manifest commit

Commit-free turns return the typed callback result with `ShouldQueue=false`. Existing single-commit actions remain available for explicitly separate historical/retry review.
