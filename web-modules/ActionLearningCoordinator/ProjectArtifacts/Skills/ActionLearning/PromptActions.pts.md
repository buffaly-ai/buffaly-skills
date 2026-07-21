# Action Learning Prompt Actions

Owned by `Skills/ActionLearning`. Version 2.0.0 replaced the former standalone guidance loader with prompt actions rooted in the registered restricted `ActionLearningSkill`.

- `ToDiscoverActionCandidatesWithinSessionSkill` independently reviews one historical route and returns zero or more evidence-bound candidates, or `NONE`.
- `ToRefreshActionLearningSessionCandidatesSkill` idempotently maintains one attached source's living `artifacts/action-learning/action-candidates.md` from an exact canonical snapshot. Identical completed snapshots are reused; changed snapshots produce a complete reconciled report and evidence-bound delta; failed attempts preserve the last completion.
- `ToBuildActionCandidateMetricsMatrixSkill` filters, consolidates, scores, and ranks discoveries from multiple sessions for validation priority.
- `ToGroundAndExpandActionCandidateSkill` runs candidate grounding/expansion and owns the fixed 16-section artifact procedure.
- `ToEvaluateActionLearningArtifact` separately audits schema, canonical evidence, contamination, discoverability, reusable boundary, savings, risk reduction, and implementation usefulness.
- `ToRunActionLearningCalibration` guides the parent through one typed child lifecycle iteration.
- `ToBuildActionLearningPortfolio` separates controls/evidence-limited items, merges genuine duplicates, and ranks substantive candidates honestly.

Prompt actions return trusted procedure text; the dedicated child or parent must execute the returned procedure. Source descriptions and versions are authoritative and must not be replaced by catalog-only metadata.
