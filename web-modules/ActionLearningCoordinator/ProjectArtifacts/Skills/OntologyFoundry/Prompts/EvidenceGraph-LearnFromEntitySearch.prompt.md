# EvidenceGraph — Learn Ontology Candidates from Session Evidence

Use this procedure when asked to analyze a bounded source-session/entity cohort and generate reviewable ontology candidates.

Version: 2.1-blocked. The former session-key/message-row episode driver is retired because it did not navigate the persisted entity-query fragment corpus. Historical entity-search learning must stop blocked until the fragment-first typed query-neighbor owner described by the canonical design is available. Conversation-message search is not a substitute for that missing primary path.

## Inputs

The instruction should identify:

- a bounded cohort: named source sessions, a date/workstream slice, or a focused entity family;
- one or more seed phrases or entity-search probes;
- a target hypothesis count, normally 6–10.

If a named cohort is unavailable, use exact/semantic conversation search to locate the closest bounded sessions. Do not expand beyond 10 conversations per seed or recurse through discovered probes.

## Artifact contract

Maintain exactly one file through `ToReadOntologyFoundryEvidenceGraph` and `ToWriteOntologyFoundryEvidenceGraph`.

Required sections:

1. `# Ontology Foundry EvidenceGraph`
2. `## Run`
3. `## Search-intent probes`
4. `## Evidence`
5. `## Classifications`
6. `## Staged learnings`
7. `## Validation`

Rewrite the complete coherent document after material progress. Do not create other files, indexes, run directories, raw exports, or phase reports.

## Procedure

0. Check whether the corrected fragment-first query-neighbor action is available. If it is unavailable, write or update the single EvidenceGraph with status `blocked`, blocker `FragmentFirstEntityQueryNeighborActionUnavailable`, zero ontology writes, and the exact required next capability; then stop. Do not call a session-key episode scanner and do not substitute semantic conversation search.

Execution may span bounded continuation turns. Continue making safe tool calls while the host permits. Before every turn boundary, write the complete current artifact with status `running`, completed evidence, and an explicit `Next step`; never end a turn with prose-only planning. The parent coordinator may then resume the same artifact. Set `completed` only after terminal validation.

Use this deterministic phase token in `## Run` as `Next phase`:

- `query-fragment-neighbors` — navigate persisted entity-query fragments semantically, then join retained neighbors to exact calls/results/use evidence;
- `current-search` — run current candidate searches for every seed and write compact results;
- `conversation-context` — attempt bounded semantic context once, then exact fallback when degraded;
- `verify-targets` — inspect only likely current prototypes/schemas and hard identity facts;
- `classify` — create the canonical eight-row table and candidate details from gathered evidence; no more discovery;
- `validate` — enforce score/contradiction/size/no-write checks and set `completed`.

On a continuation, read the artifact and execute the named phase immediately. The first response item after reading must be the first tool call for that phase, not a statement of intent. Advance exactly one phase per bounded continuation when the runtime cannot complete more.

Phase checkpoint invariant: if the prior turn completed tool calls for a phase but ended before rewriting the artifact, the next continuation must first call `ToWriteOntologyFoundryEvidenceGraph` to persist those already-observed results and advance `Next phase`. Do not rerun the completed searches and do not begin the next phase before that checkpoint write succeeds.

1. Read the working artifact. Resume it only when its nonterminal cohort and inputs match. If it contains unresolved different work, stop and report the conflict. A new explicitly requested cohort may replace terminal/dispositioned work.
2. After the capability gate succeeds, write the bootstrap artifact with status `running`, the bounded cohort, seeds, limits, prompt version, zero ontology writes, and `Next phase: query-fragment-neighbors`. This first write is mandatory so provider/tool interruption is always resumable.
3. In `query-fragment-neighbors`, call only the corrected fragment-first typed action. It must resolve the normalized persisted fragment for each raw `semanticQuery`, search bounded nearest query fragments using the stored vector, and join retained neighbors to exact calls/results/downstream use. Preserve fragment, call, result, session, turn, and sequence locators. Do not scan all message rows by supplied session key and do not recurse from discovered nodes. Then advance to `current-search`.
4. For each input seed and any bounded recurring historical probe, run current candidate search. Run bounded historical conversation search when healthy to recover user intent and outcome context. Exact search is a valid fallback context path; do not label exact matches semantic.
5. Treat every model-generated query as a `SearchIntentProbe`: evidence of intended meaning, never truth. Compare intended object, historical retrieval, exact downstream use, current retrieval, and verified current prototype. A historical hit requires evidence that the retrieved object matches the source intent; rank alone or downstream use alone is insufficient.
6. Build compact evidence IDs. Retain session/message/fragment/call identifiers, ranks, similarity, counts, short excerpts, and current prototype facts. Do not paste full tool payloads.
7. Verify likely targets through current candidate search and prototype details/schema. Prefer an existing object, relation, alias, or lifecycle mapping over a new object.
8. Classify each hypothesis as one of:
   - ExistingHit / no-op
   - AliasGap
   - IndexDiagnosis
   - MissingObject
   - MissingRelationship
   - WrongTypeOrAmbiguity
   - SupersededObject
   - NoBuild
9. Generate at least the requested hypothesis count when evidence supports it. Do not manufacture candidates to meet a quota; include no-build rows during evaluation.
   Use exactly one canonical classification table with columns `ID | Title | Class | Decision | Target | Evidence | Score`. IDs are `H-01`, `H-02`, and so on. Decision is exactly `Accepted`, `Rejected`, or `NoBuild`. Score is `n/24` for scored rows or `n/a` for NoBuild.
10. Score each build candidate 0–4 on six dimensions: identity confidence, recurrence/source diversity, user impact, ontology fit/nonduplication, implementation clarity, and contradiction handling. Maximum 24. Candidates below 18 remain rejected/evaluation rows.
11. For every score-qualified candidate, include:
    - title, class, and exact target;
    - evidence IDs and source-session provenance;
    - current-state verification;
    - contradictions and no-build alternative;
    - score breakdown;
    - expected impact;
    - exact implementation approach;
    - validation tests and promotion risk.
12. Keep traversal one hop. Do not recursively expand probes or candidate neighborhoods.
13. Validate counts, bounds, degraded tools, unresolved contradictions, and zero ontology writes. Set status `completed` and end with the next review action.

Keep the complete artifact concise: target 6–12 KB for 6–10 hypotheses. Do not repeat full evidence narratives under every candidate. Candidate detail should usually be 5–8 compact bullets and reference evidence IDs.

## Quality rules

- Rank 1 is not a correctness label.
- Repetition of a wrong result does not prove identity.
- Hard source identity and current ownership override historical recall.
- A candidate must say what would change and how it would be tested.
- Prefer high-impact recurring entrypoints and typed relations over incidental nouns.
- Preserve `NoBuild` when a term is session-specific, already modeled, ambiguous, or unsupported.
- Never call ontology authoring, compile, backup, restore, or arbitrary file-writing actions.

## Done

Stop when the one artifact is coherent and complete, every accepted candidate scores at least 18 with no unresolved hard contradiction, rejected hypotheses are accounted for, and no ontology write occurred.
