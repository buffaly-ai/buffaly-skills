# Ontology Foundry — Resolve Ranked Level2 Entities

Use this procedure to relate the durable labels in `## Ranked Level2 entities` to existing ontology prototypes and produce a proposed Session Entity Index map for the observed Level1 session. Unbound, ambiguous, and rejected labels remain index-resolution evidence; they are not ontology build instructions. This skill performs zero ontology writes.

## Input

- `sourceSessionKey`: exact Level1 source session whose living EvidenceGraph is being resolved.

## Artifact contract

Read and rewrite only the Level1 source's `artifacts/ontology-foundry/evidence-graph.md` through `ToReadOntologyFoundryEvidenceGraph(sourceSessionKey)` and `ToWriteOntologyFoundryEvidenceGraph(sourceSessionKey, markdown)`. Preserve `## Ranked Level2 entities` verbatim and preserve unrelated coherent sections. Replace or add `## Ranked entity resolutions` and `## Proposed Session Entity Index`. Do not create another artifact.

## Procedure

1. Read the EvidenceGraph and require a valid terminal `## Ranked Level2 entities` section with `Status: ok`. If it is missing, pending, failed, empty, or malformed, record the blocked reason and stop.
2. Parse at most ten rows. Preserve source rank, entity label, importance, durability, and evidence exactly. Never fuzzy-merge labels.
3. Mark `Durable: no` rows `Rejected` without semantic entity search and record the source reason.
4. For each distinct durable label, call `ToOntologyFoundrySearchCandidateEntities` once with focused identity phrasing based on the exact label and its evidence. A second call is allowed only when the first query visibly combines identity and type or returns multiple type families; record both queries.
5. Record every plausible returned candidate and similarity. Ignore unrelated low-quality candidates, but preserve enough raw search evidence to audit that decision.
6. Call `ToOntologyFoundryGetPrototypeDetails` for each plausible candidate needed to decide identity. Do not infer a bind from friendly text or rank alone.
7. Assign exactly one resolution:
   - `Existing`: one exact durable identity is confirmed by details and source evidence;
   - `NewCandidate`: the entity is durable and no plausible existing prototype was found;
   - `Ambiguous`: multiple plausible prototypes remain, the label collapses object types, or evidence is insufficient to choose;
   - `Rejected`: the item is non-durable, session-local, temporary, or otherwise outside ontology scope.
8. Rank resolution rows by source rank. Recurrence and candidate similarity are evidence, not identity proof.
9. Write `## Ranked entity resolutions` with this table:

```markdown
| Source Rank | Entity | Importance | Resolution | Prototype / Candidates | Search Evidence | Details Evidence | Reason |
|---:|---|---:|---|---|---|---|---|
```

10. Add totals for Existing, NewCandidate, Ambiguous, and Rejected. Stop. Do not author prototypes, aliases, or relationships and do not invoke ProposeBuild automatically.

## Session Entity Index mapping

After resolutions, write `## Proposed Session Entity Index` for the exact observed Level1 session:

```markdown
| Rank | Entity Prototype | RelativeValue | Evidence | Source | Resolution Row |
|---:|---|---:|---|---|---:|
```

- Include only `Existing` rows whose exact prototype identity was confirmed through details.
- Set `RelativeValue` to the Level2 `Importance` value. It is local to this session, not a global score.
- Preserve the Level2 evidence text and set `Source` to `level2-extract`.
- Sort by `RelativeValue` descending, then source rank ascending.
- Record the observed Level1 `SessionKey` and proposed stable `Level1Session#<StableId>` identity above the table.
- List `NewCandidate` and `Ambiguous` rows under `### Unresolved index labels`; they do not become `SessionEntityRef` rows until an existing prototype is confirmed.
- `Rejected` rows are excluded with counts only.
- Do not route any class to ProposeBuild automatically. Ontology construction is a separate user decision outside this indexing procedure.

## Done

Done means every ranked row has exactly one auditable resolution, all exact binds were confirmed through prototype details, the same artifact contains a proposed session-owned `RelatedEntities` map plus explicit unresolved labels, and zero ontology or session-index writes occurred.
