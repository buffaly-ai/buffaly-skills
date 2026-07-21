# Evaluate One Action Learning Candidate Artifact

Evaluate the fixed `artifacts/action-learning/new-tool-artifact.md` produced by the current Action Learning child. This is a separate evidence-quality decision; do not implement the proposed tool and do not rewrite the artifact unless the parent later supplies an explicit revision instruction.

Procedure:

1. Read the artifact with `ToReadNewToolArtifact`.
2. Require exactly 16 numbered `##` sections in the documented order.
3. Verify every counted primary case through canonical session/turn detail and every trigger through `ToActionLearningGetActionSearchTriggers`.
4. Verify semantic-neighbor claims are supported by `ToActionLearningFindTriggerNeighbors`; generic semantic similarity alone is insufficient.
5. Verify Level 2, watcher, critic, supervisory, research, Action Learning, and calibration traffic are not counted as independent demand.
6. Re-run representative observed phrases through `ToActionLearningSearchCandidateActions` and inspect plausible owners.
7. Score discoverability, reusable boundary, bounded savings, risk reduction, and implementation usefulness independently from 0 to 5. No score can override invalid schema, evidence, or contamination.
8. Return one JSON object only, with this exact shape and no surrounding prose:

```json
{
  "status": "pass|revise|reject",
  "disposition": "advance|needs_more_evidence|existing_owner|merge|no_build|reject",
  "schemaValid": true,
  "canonicalEvidenceValid": true,
  "contaminationValid": true,
  "discoverabilityScore": 0,
  "reusableBoundaryScore": 0,
  "boundedSavingsScore": 0,
  "riskReductionScore": 0,
  "implementationUsefulnessScore": 0,
  "failures": [],
  "requiredRevisions": []
}
```

Use `pass` only when schema, canonical evidence, and contamination are all valid. `needs_more_evidence`, `existing_owner`, and `no_build` can be valid passing research dispositions; they are not substantive candidate approvals.
