# Plan A Dispatch Route Without Sending

Plan one route for the user's complete instruction. This is an online dry run against the current session's restored local dispatch ontology.

## Mandatory calls

1. Call `ToGetDispatchTree` once to inspect the complete current hierarchy.
2. Call `ToSearchDispatchMemories` once with the complete task meaning as a bounded candidate prefilter.
3. Reconcile search candidates with the hierarchy. Start at `DispatchMemoryRoot`, compare only immediate children, and descend through the closest coherent child context.
4. At the selected leaf, compare the task with `ContextSummary` and each separate line in `HistoricalDispatches`.

## Decision

Return exactly one of:

- `Reuse` — the task belongs in the same working session as the leaf examples.
- `BranchSideways` — the leaf differs, but its parent is already the narrowest correct shared context.
- `BranchDown` — the existing leaf itself is the narrow shared context and should become a hidden parent.
- `InsertParent` — the leaf is too specific and its parent too broad, so a synthesized hidden parent belongs between them.
- `NewTopLevelLeaf` — no existing top-level child coherently contains the task.
- `NeedsReview` — the input is under-specified or two placements remain equally plausible.

## Required output

Return a concise routing receipt with these fields:

- `Mode: DryRun`
- `Path:` root-to-leaf or root-to-proposed-placement path
- `Decision:` one value above
- `ExistingLeaf:` prototype name or `none`
- `DestinationSessionKey:` existing leaf destination for `Reuse`; otherwise `none`
- `ProposedMutation:` `none` for `Reuse`/`NeedsReview`, otherwise the exact new node placement and shared context
- `Rationale:` one short evidence-based paragraph using the saved examples
- `SideEffects: none`

## Hard restrictions

- Do not call any session send or queue action.
- Do not create or modify a session.
- Do not interpret, write, or mutate NLMemory.
- Do not update Plan or Scratch as routing memory.
- Do not treat semantic similarity as the final decision.
- Do not claim a mutation occurred; structural decisions are proposals only.
