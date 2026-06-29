# Offline Ontology Critic Phase 1 - Entrypoint Review

Run Phase 1 for the active offline ontology critic phase artifact. This phase is the OfflineCritic agent's main job: inspect source session history, maintain durable Phase 1 evidence, and make evidence-backed ontology suggestions for later normal-Buffaly review.

Inputs expected from the caller:

- `criticSessionKey`: this offline ontology critic child session.
- `parentSessionKey`: the source session being reviewed.

Use these tools:

- `ToReadOfflineOntologyCriticArtifact`
- `ToWriteOfflineOntologyCriticArtifact`
- `ToReadOfflineOntologyCriticCheckpoint`
- `ToSaveOfflineOntologyCriticCheckpoint`
- `ToOfflineCriticGetRecentSessionTurns`
- `ToOfflineCriticGetSessionTurnPage`
- `ToOfflineCriticGetSessionTurnDetail`
- `ToOfflineCriticSearchSessionMessages` only when turn summaries are insufficient
- `ToOfflineCriticSearchSessionFinalAssistantMessages` only to verify grounded outcomes

Durable run-state rules:

- The durable working artifact is `phase-1-entrypoint-review.md`, accessed through `ToReadOfflineOntologyCriticArtifact(artifactName = "phase1")` and `ToWriteOfflineOntologyCriticArtifact(artifactName = "phase1")`.
- The durable resume record is `checkpoint.json`, accessed through `ToReadOfflineOntologyCriticCheckpoint` and `ToSaveOfflineOntologyCriticCheckpoint`.
- At the start of every run, read both the checkpoint and the existing `phase1` artifact.
- Continue from existing artifact/checkpoint state when present. Do not rely on chat memory as the run state.
- If the existing artifact already contains useful evidence, preserve it and refine/update it rather than discarding it.
- If the model cannot safely rewrite the whole artifact, keep the output smaller and preserve prior evidence by summary rather than inventing replacements.
- At the end of every run, write the updated `phase1` artifact and save a checkpoint that records Phase 1 status, last processed turn information when known, and the next recommended action.

Algorithm:

1. Read the `phase1` artifact and checkpoint.
2. Page source-session turn summaries using `parentSessionKey`.
3. If checkpoint has `LastProcessedTurnKey`, page from recent turns backward until that turn key is found, then process only newer turns.
4. If checkpoint cannot be found, mark the scan uncertain in the `phase1` artifact and perform a conservative review of available turn pages.
5. Collect user messages first. User language is the entrypoint layer.
6. Use later assistant/tool evidence only to map user phrases to grounded systems, workflows, tools, paths, domains, or operational facts.
7. Do not search ontology in this phase.
8. Do not propose ProtoScript in this phase.
9. Do not use Plan.md or Scratch.md as human-language evidence.
10. For each candidate entrypoint, state why it would help a future agent route from human language to the right entity, action, workflow, or relationship faster.
11. Reject candidates that only describe a one-off event, debugging maneuver, validation step, or agent-invented tactic.
12. Replace/refine only the `phase1` artifact markdown. Do not rewrite a combined ledger or any other phase artifact.
13. Save the updated `phase1` artifact with `ToWriteOfflineOntologyCriticArtifact(artifactName = "phase1")`, then save the checkpoint.\n14. If enough session coverage was inspected, mark Phase 1 complete in the checkpoint and set the next action to normal Buffaly Phase 2 ontology review. Otherwise mark Phase 1 open or blocked with the reason and next page/detail to inspect.

Quality bar:

- Promote only things humans are likely to ask for directly.
- Attach supporting details under those entrypoints instead of promoting them.
- A candidate is useful only if it improves future entity search, action search, relationship navigation, or mistake prevention.

Output required in the `phase1` artifact:

```markdown
# Offline Ontology Critic Phase 1 - Entrypoint Review

## Method

## Turn Coverage

| Turn/page | Summary inspected | Detail inspected | Notes |
|---|---:|---:|---|

## Human Phrases That Matter

| Human phrase | Evidence | What it mapped to |
|---|---|---|

## Evidence-Backed Suggestions

### Suggestion 1 - <short name>

- Human wording:
- Evidence pattern:
- Failure/friction/efficiency evidence:
- Grounded mapping:
- Suggested improvement for later Buffaly review:
- Future routing benefit:
- Why not one-off:

## Rejected Candidates

| Candidate | Why rejected | Attach under, if useful |
|---|---|---|

## Next Action

- <normal Buffaly Phase 2 review, continue Phase 1, or blocked reason>
```
