# Refresh Action Candidates for One Attached Historical Session

Maintain one source-owned Action Learning candidate artifact for an exact Principal assignment. The worker performs evidence inspection and proposal revision. The Principal owns acceptance and checkpoint advancement.

## Inputs

- `sourceSessionKey`: exact historical source and current worker parent.
- `principalAssignmentId`: exact active Principal ledger assignment.
- `startExclusiveSourceTurnId`: last successfully accepted source turn, or empty on first processing.
- `endInclusiveSourceTurnId`: exact frozen end turn for this assignment.
- `acceptanceCriteriaSet`: exact versioned criteria ID.
- `attempt`: positive bounded review attempt.
- `principalGuidance`: exact prior rejection guidance, or empty.
- `operation`: `PrepareProposal` or `PromoteAcceptedProposal`.
- `acceptedProposalId`: required only for promotion.

Reject missing or contradictory inputs, a current worker whose parent is not `sourceSessionKey`, or promotion that does not name the exact current proposal. Do not discover or substitute source metadata.

## Composition

For `PrepareProposal`, load `ToDiscoverActionCandidatesWithinSessionSkill` once unless its guidance is already active in this assignment. Its candidate test, fields, rejection analysis, contamination rules, and `NONE` result remain authoritative. Do not run metrics, grounding, evaluation, portfolio construction, ontology work, or implementation.

## Artifact

Read and replace only `artifacts/action-learning/action-candidates.md` under the exact source through `ToReadActionLearningCandidateArtifact` and `ToWriteActionLearningCandidateArtifact`.

Maintain this complete structure:

```markdown
# Action Learning Candidates

## Control
- ArtifactVersion: 2.0.0
- SourceSessionKey: <exact>

## Last Accepted Refresh
- AcceptedProposalId: <value-or-empty>
- AcceptedByPrincipalAssignmentId: <value-or-empty>
- AcceptedStartExclusiveSourceTurnId: <value-or-empty>
- AcceptedThroughSourceTurnId: <value-or-empty>
- AcceptedCriteriaSet: <value-or-empty>
- AcceptedAtUtc: <value-or-empty>
- CandidateCount: <integer>
- RejectedAlternativeCount: <integer>
- ArtifactValidation: passed|empty

## Last Accepted Ranked Action Candidates
<complete report or NONE>

## Last Accepted Rejected Alternatives
<complete report or NONE>

## Proposal Under Review
- ProposalId: <deterministic value-or-empty>
- PrincipalAssignmentId: <value-or-empty>
- StartExclusiveSourceTurnId: <value-or-empty>
- EndInclusiveSourceTurnId: <value-or-empty>
- CriteriaSet: <value-or-empty>
- Attempt: <integer-or-empty>
- ProposalStatus: Draft|ReadyForPrincipalReview|RevisionRequested|AcceptedPendingPromotion|empty

### Proposed Ranked Action Candidates
<complete proposal or NONE>

### Proposed Rejected Alternatives
<complete proposal or NONE>

### Incremental Evidence and Delta
<new turns, older reconciliation evidence, candidate dispositions>

### Worker Validation
<criteria self-check, evidence, uncertainty, and blockers>
```

The proposal ID is one stable readable token derived from source key, assignment ID, exact turn range, criteria set, and attempt. Never use time, random values, queue IDs, worker turn IDs, or model prose as identity.

## PrepareProposal

1. Verify worker context and exact parent.
2. Read the artifact before inspecting source history.
3. If the artifact already has `ReadyForPrincipalReview` for the exact assignment, range, criteria, and attempt, reread and return it without repeating discovery.
4. Preserve every `Last Accepted` field and section byte-for-byte while review is active.
5. Inspect bounded source turn summaries from newest backward until both assignment boundaries are located. Review turns in `(startExclusiveSourceTurnId, endInclusiveSourceTurnId]` first. Inspect older spans only when required to reconcile a coherent complete report.
6. Apply the discovery procedure. Produce one complete ranked per-session report or `NONE`, plus rejected alternatives.
7. Reconcile against the last accepted report by purpose, replaced historical span, and conceptual input/output contract, not name alone. Classify candidates `Added`, `Changed`, `Unchanged`, or `NotObserved`; never silently erase accepted history.
8. Apply `principalGuidance` explicitly and record how each requested correction was addressed.
9. Self-check the supplied criteria set. Worker self-check is advisory and never acceptance.
10. Replace the complete artifact with preserved accepted content and one `ReadyForPrincipalReview` proposal.
11. Reread the artifact and report source, worker, assignment, proposal ID, exact range, criteria set, counts, delta, path, and readback result.

The worker may end after a complete proposal is persisted and reread. It must not mark the proposal accepted, alter accepted metadata, or claim that the Principal checkpoint advanced.

## PromoteAcceptedProposal

Promotion is a separate exact instruction from the Principal after it records `AcceptedPendingPromotion`.

1. Read the artifact.
2. Verify `acceptedProposalId`, `principalAssignmentId`, source, exact range, and criteria set match the current `ReadyForPrincipalReview` proposal.
3. Do not rerun discovery or reinterpret content.
4. Copy the complete proposed ranked report and rejected alternatives into the `Last Accepted` sections.
5. Set accepted proposal, assignment, range, criteria, counts, current acceptance timestamp, and `ArtifactValidation: passed`.
6. Preserve incremental evidence needed to audit the accepted decision, then clear all `Proposal Under Review` fields and proposed sections.
7. Replace the complete artifact and reread it.
8. Return exact accepted metadata and readback evidence. Do not claim that the Principal ledger checkpoint advanced; only the Principal can do that after independent readback.

If exact promotion validation fails, make no write and return a precise blocker.

## Failure and restart safety

- Draft, failed, malformed, rejected, or mismatched work never replaces `Last Accepted` content.
- A restart reads the artifact and resumes the exact missing evidence, revision, or promotion step.
- Repeating the same exact assignment/attempt must not duplicate candidates or inflate estimates.
- Source activity after `endInclusiveSourceTurnId` is not part of this assignment.
- If `startExclusiveSourceTurnId` cannot be found when nonempty, report a blocker; do not guess from timestamps.
- Commentary is nonterminal while a safe required evidence or artifact call remains. `ReadyForPrincipalReview` and a true blocker are valid terminal worker outcomes.