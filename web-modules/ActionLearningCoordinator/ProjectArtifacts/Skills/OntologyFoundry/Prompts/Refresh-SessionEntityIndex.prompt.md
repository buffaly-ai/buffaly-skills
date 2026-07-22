# Ontology Foundry — Refresh Session Entity Index Evidence

Use this coordinator for the mandatory, repeatable Foundry card for one exact Level1 source session. It gathers current durable entities when source evidence changed, reconciles them against the ontology as it exists now, and produces one current proposed Session Entity Index in the source-owned EvidenceGraph. It performs zero ontology writes and zero Session Entity Index materialization writes.

This is the default Foundry operation for keeping a processed source current. Expand-and-Enhance and Generalize are optional downstream operations and are never invoked automatically.

## Inputs

- `sourceSessionKey`: exact Level1 source session. It owns the living EvidenceGraph and the reusable Foundry worker is its child.
- `sourceSnapshot`: exact principal-supplied snapshot string in this canonical field order:
  `SessionKey=<exact>;UpdatedUtc=<exact>;LastFinalMessageUtc=<exact-or-empty>;MessageCount=<exact>`
- `refreshReason`: `NeverRefreshed|SourceChanged|OntologyRecheckDue|ExplicitRecheck`.

Reject a missing or differently keyed snapshot. Do not invent, normalize, or discover substitute source metadata. The principal obtains these fields from `ToListOntologyFoundrySessionInventory`.

## Composition

This coordinator is self-contained for reconciliation. Do not load or call `ToResolveRankedLevel2EntitiesSkill` during a refresh; nested prompt-action loading is not an execution step and creates an avoidable stall boundary. Use the resolution procedure below directly with the restricted search/detail/artifact tools.

Only when Gather is actually required, load and execute `ToCoordinateOntologyFoundryGatherSkill`; its exact Level2 instruction, correlation, validation, and no-write rules remain authoritative. When Gather is reused, do not load either Gather prompt action.

## Artifact contract

Read and rewrite only the exact Level1 source's `artifacts/ontology-foundry/evidence-graph.md` through `ToReadOntologyFoundryEvidenceGraph(sourceSessionKey)` and `ToWriteOntologyFoundryEvidenceGraph(sourceSessionKey, markdown)`.

Maintain exactly one `## Session Index Refresh` control section. Keep the last completed ranked extraction, ranked resolutions, and proposed index authoritative while a newer attempt is pending or failed. Never expose a mixture of derived sections from different snapshots as completed state.

The control section contains:

```markdown
## Session Index Refresh
- CoordinatorVersion: 1.0.0
- SourceSessionKey: <exact>
- ActiveRefreshId: <deterministic id or empty>
- ActiveSourceSnapshot: <exact input or empty>
- ActiveStatus: NotStarted|GatherRunning|GatherPending|Resolving|Failed|ParseError|empty
- LastCompletedRefreshId: <id or empty>
- LastCompletedSourceSnapshot: <exact snapshot or empty>
- LastCompletedAtUtc: <value or empty>
- GatherReuse: yes|no
- GatherStatus: <status>
- ResolutionStatus: <status>
- ExistingCount: <integer>
- NewCandidateCount: <integer>
- AmbiguousCount: <integer>
- RejectedCount: <integer>
- ProposedIndexRows: <integer>
- ArtifactValidation: <status>
- OntologyWrites: zero
- SessionEntityIndexWrites: zero
```

`refreshId` is deterministic from `CoordinatorVersion + sourceSnapshot + refreshReason`. Use one stable readable token for the same exact inputs; do not use current time, a random value, queue ID, or turn ID as identity. Operational timestamps and queue locators are metadata only.

## Idempotency and freshness

1. Read the EvidenceGraph before dispatch or ontology search.
2. If `LastCompletedSourceSnapshot` equals the exact input snapshot and `refreshReason` is not `OntologyRecheckDue` or `ExplicitRecheck`, reuse the completed `## Ranked Level2 entities` section verbatim. Do not dispatch Gather.
3. If the source snapshot differs, or no completed refresh exists, run the Gather coordinator exactly once for this refresh. Existing pending correlation for the same active refresh must be resumed and never redispatched.
4. Reconciliation freshness is independent of source freshness. For every nonfailed refresh, run Resolve against the current ontology even when Gather was reused. A prior `NewCandidate` may now be `Existing`; prior bindings may also become ambiguous or invalid.
5. Never increment `RelativeValue`. Resolve rebuilds absolute values from the current ranked extraction.
6. Repeating the same completed refresh must yield the same ranked labels, dispositions, prototype mappings, absolute values, and ordering. Only operational check timestamps may differ.

## Mandatory procedure

1. Validate the exact Level1 source key, exact source snapshot, and reason. Read the EvidenceGraph.
2. Derive the deterministic refresh ID. If the same ID is already completed and the current ontology reconciliation has just been verified in that completed run, reread and return it without writes or dispatch.
3. Write only control-state metadata marking the active refresh. Preserve every last-completed derived section unchanged.
4. Decide Gather reuse using the exact snapshot rule above.
5. When Gather is required, invoke and execute `ToCoordinateOntologyFoundryGatherSkill` for the exact source. If it returns `Pending`, `Failed`, `ParseError`, or `Empty`, record that active state without replacing the last completed resolutions or proposed index and stop honestly.
6. When Gather is reused or newly completes, preserve its valid ranked markdown verbatim as the input candidate section for this refresh.
7. Reconcile the current ranked rows directly:
   - parse at most ten rows and preserve rank, label, importance, durability, and evidence exactly;
   - mark `Durable: no` as `Rejected` without semantic search;
   - for each distinct durable label call `ToOntologyFoundrySearchCandidateEntities` once using focused identity phrasing based on the exact label and evidence; a second query is allowed only when the first visibly combines identity/type or returns multiple type families, and both queries must be recorded;
   - inspect `ToOntologyFoundryGetPrototypeDetails` for every plausible candidate needed to decide identity;
   - assign exactly one `Existing|NewCandidate|Ambiguous|Rejected` disposition per row; similarity and rank are evidence, never identity proof;
   - rebuild `## Ranked entity resolutions` with source rank, label, importance, disposition, prototype/candidates, search evidence, details evidence, and reason;
   - rebuild `## Proposed Session Entity Index` from only detail-confirmed `Existing` rows, using Level2 Importance as absolute `RelativeValue`, source `level2-extract`, deterministic ordering, and explicit unresolved-label and rejected counts;
   - perform zero ontology writes and zero Session Entity Index materialization writes.
8. Compare the current ranked rows to the prior completed ranked rows by exact entity label, rank, importance, durability, and evidence. Record a compact `### Refresh delta` table with each current label classified `Added|Changed|Unchanged`. Record prior labels absent from the current extraction as `NotObserved`; do not automatically delete, decay, or carry them into the current proposed index.
9. Validate all current sections as one unit:
   - same exact source key and source snapshot;
   - terminal valid ranked extraction;
   - exactly one resolution per ranked row;
   - proposed index contains only currently confirmed `Existing` prototypes;
   - absolute values and deterministic ordering;
   - unresolved labels listed explicitly;
   - zero ontology and index writes.
10. Only after validation, atomically promote the current ranked extraction, ranked resolutions, proposed index, delta, and completed control metadata in one complete EvidenceGraph replacement. Clear active fields, set the last-completed fields to this refresh, and set `ArtifactValidation: valid`. Do not write a transitional value such as `reread-required` into a promoted completed refresh.
11. Reread the artifact. Return success only when the reread proves the completed refresh ID, exact snapshot, `ArtifactValidation: valid`, counts, and proposed index row count. The reread is confirmation and does not require another write.

## Failure safety

- A pending or failed refresh never invalidates or partially overwrites the last completed refresh.
- Preserve exact queue/turn correlation and failure diagnostics in the active control section.
- Never repair malformed Level2 markdown, silently substitute prototypes, retain stale bindings, or merge old unresolved rows into current results.
- `NotObserved` is evidence, not deletion authorization. Aging/removal policy is outside this card.
- If the source has no usable Level2 observer, record the exact blocker and preserve the prior completed result.

## Principal accounting result

Return a compact terminal result suitable for the principal ledger:

- source session and worker;
- exact source snapshot and refresh ID;
- Gather reused or executed;
- Gather and resolution status;
- Existing/NewCandidate/Ambiguous/Rejected counts;
- proposed index row count;
- artifact validation and reread result;
- whether optional learning is eligible;
- explicit zero ontology and Session Entity Index writes.

Optional learning is eligible only after a completed refresh and only for explicitly selected unresolved entities. Do not invoke it.

## Done

Done means the source-owned EvidenceGraph proves either:

- one atomically completed, validated refresh for the exact snapshot with current reconciliation and proposed Session Entity Index evidence; or
- an honest pending/failed/empty state for the active refresh while the previous completed result remains intact.

Materializing `RelatedEntities` through NL Memory is a separate operation and requires its own policy or explicit authorization.
