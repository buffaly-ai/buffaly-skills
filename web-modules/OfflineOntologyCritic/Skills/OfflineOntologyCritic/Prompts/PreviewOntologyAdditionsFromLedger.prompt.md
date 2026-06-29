# Preview Ontology Additions From Critic Artifacts

Prepare a markdown approval proposal from the active offline ontology critic phase artifacts.

Inputs expected from the caller:

- `criticSessionKey`: this offline ontology critic child session.

Use these tools:

- `ToReadOfflineOntologyCriticArtifact`
- `ToOfflineCriticSearchCandidateEntities`
- `ToOfflineCriticSearchCandidateActions`
- `ToOfflineCriticGetPrototypeDetails`
- `ToOfflineCriticGetPrototypeNotes`

Algorithm:

1. Read the `phase1` and `phase2` artifacts.
2. Collapse duplicate or weak suggestions.
3. Keep only additions or modifications that clearly improve future semantic entity/action routing.
4. Exclude one-off incident actions, temporary debugging/deploy steps, validation probes, and agent-invented workflow names.
5. Include ProtoScript snippets only when grounded in inspected existing ontology patterns; otherwise use markdown-only proposals.
6. Return a markdown approval proposal with an approval checklist.
7. Do not apply changes.
8. Do not emit JSON.
9. Ask for explicit approval before any materialization step.
