# Ontology Foundry Prompt Actions

## Idempotent Session Index Refresh (2026-07-20)

- Added `ToRefreshOntologyFoundrySessionIndexSkill`, backed by the package-owned `Skills/OntologyFoundry/Prompts/Refresh-SessionEntityIndex.prompt.md` so every installed Foundry worker can run the dashboard-advertised refresh procedure.
- This is the standard repeatable card for one Level1 source: the principal supplies an exact inventory snapshot, Gather is reused only when that snapshot matches, and the coordinator directly rechecks current ontology identity with the restricted search/detail tools.
- Reconciliation is intentionally self-contained instead of loading the standalone Resolve prompt action mid-card; live validation showed nested prompt-action composition repeatedly stalled after commentary. The standalone Resolve skill remains available for explicitly separate use.
- The coordinator keeps active refresh state separate from the last completed result, then atomically promotes ranked evidence, resolutions, delta classifications, and proposed Session Entity Index evidence only after whole-run validation.
- Repeated runs use absolute `RelativeValue` assignments and deterministic refresh identity, so retries cannot double-reinforce the index. Pending and failed runs preserve the previous completed result.
- Materialization, Expand-and-Enhance, Generalize, ProposeBuild, and ontology authoring remain separate and are never invoked automatically.

## Autonomous Gather coordinator (2026-07-19)

- Added `ToCoordinateOntologyFoundryGatherSkill`, backed by `Prompts/Coordinate-Gather.prompt.md`.
- The coordinator loads and obeys the canonical Gather prompt, reads the single EvidenceGraph first, and prefers one bounded synchronous Level2 relay through `ToOntologyFoundryEvaluateLevel2Harvest`; the relay returns the terminal `Response.Message` directly instead of an opaque boxed result contract.
- It validates and preserves the terminal Level2 markdown, rereads the artifact before success, and never auto-runs Resolve.
- Existing `Pending` and `GatherComplete` states are idempotent: pending work resumes without redispatch, and completed work is reported without another child call.
- When synchronous completion is unavailable, the existing asynchronous send/correlation route remains the honest fallback; `Pending` is resumable but not autonomous completion.

## Independent Level2 entity stages (2026-07-19)

- Added `ToGatherAndRankLevel2EntitiesSkill`, backed by `Prompts/Gather-RankedLevel2Entities.prompt.md`.
- Gather targets one exact Level2 observer, dispatches the proven inspect-only extraction instruction, and records at most ten ranked durable entities in `artifacts/ontology-foundry/evidence-graph.md`.
- Added `ToResolveRankedLevel2EntitiesSkill`, backed by `Prompts/Resolve-RankedLevel2Entities.prompt.md`.
- Resolve reads the ranked section, searches and details-checks plausible ontology objects, and classifies every source row as `Existing`, `NewCandidate`, `Ambiguous`, or `Rejected` in the same artifact.
- Both stages are read-only with respect to ontology. Gather performs no entity search; Resolve performs no dispatch and no ontology authoring.
- The existing `ToRunOntologyFoundryHarvestSkill` remains the combined batch orchestration route.
- Harvest emits the same canonical ranked/resolution sections as the standalone stages and adds one proposed Session Entity Index map per observed Level1 session.
- Confirmed `Existing` rows become proposed `SessionEntityRef` values with Level2 Importance used as session-local `RelativeValue`; unresolved labels remain evidence and never trigger ProposeBuild automatically.
- Registered `ToMaterializeSessionEntityIndexSkill` independently under `Nodes/Personal/OntologyFoundry/PromptActions.pts` as the separate, explicitly mutating stage, so indexing is not coupled to the tabled historical-driver import in `Skills/OntologyFoundry/index.pts`. It re-verifies every confirmed prototype and persists one stable `Level1Session` definition through the target session's NL Memory action; it never creates global ontology objects.

## Combined expansion and enhancement (2026-07-19)

- Upgraded `ToRunOntologyFoundryExpandSkill` to version `2.0.0-plan` and added explicit expand-and-enhance infinitives.
- The prompt now performs bounded expansion, exact neighbor resolution, schema comparison, per-finding classification, and exact typed proposals in one EvidenceGraph section.
- Removed the standalone `ToRunOntologyFoundryEnhanceSkill` and `Enhance-PropertiesRelations.prompt.md`; there is no second enhancement handoff or artifact.
- Default mode remains plan-first and zero-write. Guarded apply remains blocked pending a scoped approval/backup/compile/restore coordinator.
- Removed the superseded `SessionEntitySearchEpisodeDriver` import/wrapper from the Foundry skill so the prompt actions can load independently of the tabled historical-query implementation. The EvidenceGraph prompt now blocks explicitly until the corrected fragment-first typed neighbor action exists.

## Physical-seed generalization (2026-07-19)

- Replaced the family/inventory-first Generalize procedure and removed its web-module special case.
- `ToRunOntologyFoundryGeneralizeSkill` and `Generalize-PhysicalPeers.prompt.md` are package-owned under `Skills/OntologyFoundry` so every installed Foundry worker can advertise and run the same plan-only procedure. The older Matt-local registration was the source copied into this owning package and should no longer be required by portable installations.
- The action now starts from one exact physical/operational seed, follows a grounded enclosing relation, selects an existing typed enumerator, discovers real peers, resolves every peer, and only then proposes organizing parents, missing objects, relationships, and shared structure.
- Existing descendants are a late collision/organization check, never the discovery source. The operation remains plan-only and zero-write.
