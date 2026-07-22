# Ontology Foundry ProtoScript

Defines the private Ontology Foundry action/entity roots, the `OntologyFoundrySkill` registration, prompt actions, parent-only profile launch/continuation actions, and narrow wrappers over current ontology, conversation search, and the fixed artifact owner.

The artifact wrappers require an exact Level1 `sourceSessionKey` and can read or atomically replace only that source session's `artifacts/ontology-foundry/evidence-graph.md`. The reusable Foundry worker is a child of the source and does not own a second canonical graph. Candidate analysis and scoring remain in the trusted prompt; ProtoScript is thin orchestration.

The superseded `ToOntologyFoundryFindEntitySearchEpisodes` session-key/message-row wrapper is intentionally absent. It implemented the wrong navigation boundary and made the whole skill depend on the tabled `SessionEntitySearchEpisodeDriver`. The corrected EvidenceGraph path remains blocked until a fragment-first typed query-neighbor owner is available.

`ToEvaluateOntologyFoundryCalibrationSession` is intentionally outside `OntologyFoundryActionRoot`: the parent calibration coordinator can synchronously continue an attached child through the typed `BuffalyAgentService.CreateChildSession` cross-worker relay, but Foundry children do not receive that cross-session capability.

`ToCreateOntologyFoundrySession` is also parent-only and outside the restricted root. A Foundry child can inspect evidence and maintain its Level1 parent's source-owned artifact, but cannot create sibling/child sessions.

Mode B Expand-and-Enhance reuses `SessionTools.SearchSessionMessagesTool(...)`, `SessionTools.SearchSessionFinalAssistantMessagesTool(...)`, current ontology details/schema, and the existing direct-descendant action through thin wrappers. `ToRunOntologyFoundryExpandSkill` stages bounded evidence, classifications, and schema-valid typed proposals in the same EvidenceGraph artifact; it has no authoring capability and does not recursively traverse descendants.
