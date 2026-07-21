# Action Learning Skill ProtoScript

Owned by `Skills/ActionLearning`. Defines the private `ActionLearningActionRoot` and `ActionLearningEntityRoot`, registers `ActionLearningSkill`, and exposes bounded historical evidence, owner inspection, and fixed artifact surfaces to the dedicated Action Learning child.

Parent-only `ToCreateActionLearningSession`, `ToCreateSourceAttachedActionLearningWorker`, and `ToContinueActionLearningSession` inherit directly from `OpsAction`, so a restricted child cannot create or dispatch sessions. The source-attached bootstrap sets `CreateAgentInitializationContract.ParentSessionKey` to the exact historical source and supports one deterministic reusable worker per source. These actions use existing typed host services and never Buffaly's internal HTTP/JsonWs boundary.

`ToReadActionLearningCandidateArtifact` and `ToWriteActionLearningCandidateArtifact` expose only the exact validated source session's `artifacts/action-learning/action-candidates.md`. `ToRefreshActionLearningSessionCandidatesSkill` version 2 maintains separate last-accepted and proposal-under-review sections for one exact Principal assignment over `(startExclusiveSourceTurnId, endInclusiveSourceTurnId]`. The worker prepares or revises a proposal, while the Action Learning Principal records versioned acceptance criteria, supplies durable rejection guidance, and alone advances `LastAcceptedSourceTurnId` after exact promotion and independent readback. Failed, rejected, malformed, or interrupted work preserves accepted content.

`ToActionLearningGetActionSearchTriggers`, `ToActionLearningResolveTriggerFragment`, and `ToActionLearningFindTriggerNeighbors` are thin wrappers over `ActionSearchTraceDriver`. The driver reproduces the action-search punctuation-removal fragment key, performs no inserts, and returns semantic neighbors only when they map back to canonical historical `ToSearchCandidateActions` calls.

`ToActionLearningListSkillActions` preserves the canonical `SkillEntity -> Collection` contract so action prototypes remain native typed values rather than being coerced to text.

`ToWriteNewToolArtifact` and `ToReadNewToolArtifact` expose only `artifacts/action-learning/new-tool-artifact.md` in the current child session. Portfolio reconciliation similarly exposes only fixed `portfolio-input.md` and `portfolio.md` read/write actions. Per-session discovery, cross-session metrics, and grounded New Tool Artifacts remain distinct. There is no caller-supplied path and no arbitrary command, HTTP, code, ontology, deployment, or filesystem tool under the restricted root.

The Matt-local `Nodes/Personal/ExternalSkills.pts` bridge includes this skill without editing the installer-managed product skill index. Action Learning remains separate from Ontology Foundry even though both learn from historical sessions.
