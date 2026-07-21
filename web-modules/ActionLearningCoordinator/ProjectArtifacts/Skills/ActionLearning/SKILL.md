# Action Learning Skill

Private, restricted skill library for learning reusable actions from historical Buffaly work.

The skill separates five stages:

1. idempotently refresh zero or more candidates within one attached historical session and its living source-owned artifact;
2. build a cross-session candidate metrics matrix;
3. ground and expand one selected candidate;
4. evaluate one grounded New Tool Artifact;
5. reconcile explicitly evaluated candidates when requested.

Candidate discovery is LLM review of an observed historical route. Historical `ToSearchCandidateActions` traces and semantic neighbors are later grounding evidence, not the only source of candidates.

The canonical repeatable route uses one deterministic `action-learning` worker attached to one exact source session. It refreshes only that source's `artifacts/action-learning/action-candidates.md` from an exact canonical session snapshot, reuses completed identical snapshots, records evidence-bound candidate deltas when history changes, and preserves the last completed result on failure. Cross-session metrics and downstream New Tool Artifacts remain separate.

`ActionLearningActionRoot` and `ActionLearningEntityRoot` are bound to the dedicated `action-learning` agent profile. Child-visible actions are limited to bounded historical inspection, current capability ownership checks, and fixed Action Learning artifact I/O. Parent-only session lifecycle actions inherit directly from `OpsAction` and are not exposed through the restricted skill root.

The skill does not implement, compile, deploy, approve, or validate candidate action code.
