# Ontology Foundry — Expand and Enhance

Use this procedure to expand one exact seed into an evidence-grounded one-hop concept map and, in the same run, determine which findings are already represented, safely expressible as exact typed ontology proposals, blocked by a missing object or schema, useful only for disambiguation, unsupported, or contradicted.

The default mode is `plan`. It performs zero ontology writes. `discover` stops after evidence and classification. `apply-approved` is currently blocked because the scoped approval/backup/compile/restore coordinator is not installed; retain the complete plan and return `ApplyBlockedGuardUnavailable`.

## Inputs

- `sourceSessionKey` is required and names the exact Level1 session that owns the living EvidenceGraph.
- `seedPrototype` is required and must resolve exactly.
- `mode`: `plan` (default), `discover`, or `apply-approved`.
- Optional focused corpus hints may prioritize probes but never replace message evidence.

## Artifact contract

Read and rewrite only the Level1 source's `artifacts/ontology-foundry/evidence-graph.md` through `ToReadOntologyFoundryEvidenceGraph(sourceSessionKey)` and `ToWriteOntologyFoundryEvidenceGraph(sourceSessionKey, markdown)`. Preserve unrelated coherent sections and replace or add one `## Expand and Enhance — <seedPrototype>` section. Do not create per-seed files, raw exports, or separate expansion/enhancement artifacts.

The combined section must contain:

1. `### Before state` — exact details, resolved schema, current assignments, aliases, hard identity, and direct descendants if inspected.
2. `### NL surface forms` — `Phrase | Strength | Role | Session/Message IDs | Evidence`.
3. `### Neighbors` — `Neighbor | Category | BindStatus | Prototype/Candidates | Evidence`.
4. `### Separate concepts` — `Concept | Kind | ExistingPrototype | WhySeparate | DistinguishingIdentity`.
5. `### Level1 session mentions` — `Concept | Level1SessionKey (if proven) | SessionID | Role | Rank | MessageKey | Evidence`.
6. `### Disambiguation rules` — `Phrase | Choose concept when | Choose other concept when | Bare-phrase behavior | Evidence`.
7. `### Classified findings` — `FindingID | Evidence finding | Subject | Object/Literal | Resolution | Current representation | Decision | Reason`.
8. `### Typed enhancement proposals` — `FindingID | Target file | Field | DeclaredType | ExactTypedValue | Classification | Evidence | Confidence | Collision/Contradiction`.
9. `### Missing objects, schema gaps, and rejections` — exact prerequisite, proposed owning base/file when known, and why the finding must not be forced into Notes.
10. `### Validation and approval` — plan revision, canonical digest input, validation/rollback checks, approval status, and disposition.

Every section is required in `plan` mode. In `discover` mode sections 8–10 may state that typed planning was intentionally not requested, but section 7 is still required.

## Procedure

1. Read the Level1 source-owned EvidenceGraph. Stop on unresolved nonterminal work for another seed. Record the exact source, seed, mode, bounds, zero writes, and next step in `## Run`.
2. Anchor first with prototype details and complete resolved property schema. Stop if the seed does not resolve. Record current values separately from new evidence. Optionally inspect direct descendants once; never recurse.
3. Build at most eight focused user-message probes from canonical/display names, exact package/assembly/type/project identity, URL/path fragments, usage/failure language, and confusable names. Search user messages first, at most 25 rows per probe. Use at most four final-assistant probes of 15 rows only for secondary outcome phrasing. Preserve session, turn, message, role, rank, and snippets. Never infer a session key from a numeric ID and never use a Level2 key as a work home.
4. Score surface forms: `high` only for repeated user language or exact hard identity; `medium` for clear sparse or assistant-heavy language; `low` for one-off, action-like, or ambiguous language. A score never authorizes an alias write.
5. Collect durable neighboring concepts from anchored fields and the same evidence. Bind each durable entity-like neighbor through focused candidate search and prototype details. Record `Bound`, `Unbound`, `Ambiguous`, or `NonEntity`. Keep literals—including paths and secret names—as literals; never retrieve secret values.
6. Split concepts whenever hard identities or jobs differ. Mandatory checks include action vs result, module vs skill, database vs API/web module, package vs runtime role, source vs installed copy, active vs baseline/preview, credential name vs product, Level1 vs Level2 session, and session-local index relation vs global ontology relation.
7. Express each observed property or relationship only as an evidence finding. Do not choose a property merely because a fluent relation label sounds plausible.
8. For every finding, bind exact subject/object prototypes when possible, compare current assignments, and classify exactly one decision:
   - `AlreadyRepresented` — the current typed ontology already expresses it;
   - `EnhancementReady` — subject/object are exact, the field exists, the value has the declared type, evidence is sufficient, and no contradiction remains;
   - `MissingObject` — a required durable subject/object has no exact prototype;
   - `SchemaGap` — exact objects exist but no declared field can express the structural fact;
   - `DisambiguationOnly` — useful routing/distinction evidence that should not become a typed property;
   - `InsufficientEvidence` — plausible but not adequately grounded;
   - `Contradicted` — evidence conflicts or a proposed value is wrong.
9. In `plan` mode, inspect the schema again immediately before drafting accepted assignments. Emit a typed proposal only for `EnhancementReady`. Every proposal must name the declared field, type-compatible exact value, current value, existing reachable personal target file, evidence IDs, confidence, collision/contradiction state, validation query, and rollback expectation.
10. Never invent a field as if declared and never hide a structural relation in `Notes`. Put absent fields in `SchemaGap` with a separately reviewable base-extension proposal naming the owning base/file and affected descendants when known.
11. `MissingObject` findings route to explicit resolution or ProposeBuild review; they never trigger construction automatically. `DisambiguationOnly` findings remain routing guidance. Alias candidates remain evidence until a separate alias decision.
12. Write the complete combined section. Record canonical digest input—seed, target files, exact proposed blocks, evidence revision, ordered accepted FindingIDs—but do not compute a digest in prompt text.
13. If `mode=apply-approved`, perform no write, backup, compile, or restore call. Mark `ApplyBlockedGuardUnavailable` and stop. Otherwise mark `PlanReady`, or `DiscoveryComplete` for discover mode, and stop. Never auto-call Generalize or ProposeBuild.

## Typed proposal rules

- Exact hard identity outranks fluent similarity.
- A relation hypothesis is not an enhancement until schema and type compatibility are proven.
- Complete ordered `prototype` or `partial prototype` blocks may be shown only for `EnhancementReady` rows.
- Base extension and instance assignment are separate proposals and approvals.
- Existing values are never silently replaced; conflicts are explicit.
- No ontology, alias, session-index, or source-file writes occur in this skill.

## Done

Done means the single EvidenceGraph contains the exact before state, bounded expansion evidence, safe concept splits and routing rules, every finding has one classification, every `EnhancementReady` item has an exact schema-valid typed proposal with provenance and validation/rollback expectations, blocked/rejected findings are explicit, approval disposition is recorded, and zero ontology or index writes occurred.
