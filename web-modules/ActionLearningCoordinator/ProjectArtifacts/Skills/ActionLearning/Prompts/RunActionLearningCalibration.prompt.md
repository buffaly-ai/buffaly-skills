# Run One Action Learning Calibration Iteration

This procedure is for the parent coordinator, not the restricted Action Learning child.

Inputs: exact source session key, deterministic child key, canonical source snapshot, refresh reason, prompt/source version, and calibration artifact path.

1. Call `ToCreateSourceAttachedActionLearningWorker` with the exact source and deterministic child key.
2. Call `ToContinueActionLearningSession` with the exact source key, exact canonical snapshot, refresh reason, and an instruction to run `ToRefreshActionLearningSessionCandidatesSkill`.
3. Accept discovery completion only after the child reports the source-owned `artifacts/action-learning/action-candidates.md` was written and reread, or that the exact completed snapshot was idempotently reused.
4. Inspect the source-owned candidate artifact directly. Do not accept a worker claim without artifact evidence.
5. Persist one calibration record containing profile version, prompt/source commit, tool surface, source snapshot, refresh reason, child key, lifecycle transitions, artifact path, readback result, candidate/`NONE` outcome, deltas, observed failure modes, and the specific prompt/tool revision proposed for the next iteration.
6. Test identical-snapshot restart and changed-snapshot refinement separately. One source refresh is one iteration; do not count a cohort as five sequential guidance revisions.
7. Grounding and evaluation are later explicit stages. Never start them automatically from discovery calibration.

Use varied domains and source-session sets. Include positive missing-action evidence, `NONE` controls, contamination pressure, identical-snapshot replay, changed-source refinement, and failed-refresh preservation. The parent owns calibration records and portfolio reconciliation; each source owns exactly one living candidate artifact.
