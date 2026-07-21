# Action Learning Coordinator ProtoScript

Defines `SessionWorkCoordinatorSkill` as the common coordinator base and `ActionLearningCoordinatorSkill` as the Action Learning specialization.

`ActionLearningCoordinatorEntityRoot` is the restricted semantic entity root required by the `action-learning-coordinator` agent profile during fresh-session initialization.

The first staging slice exposes common live-runtime methods for coordinator identity, reading and initializing the fixed ledger, and typed add/remove of exact source-session entries. Add is idempotent; removing an absent entry returns `NotFound` without changing state. The raw whole-ledger replacement surface is intentionally not public.

All common methods derive from `SessionWorkCoordinatorSkillAction`; Action Learning-specific methods use the separate `ActionLearningCoordinatorSkillAction` root. State is stored at `artifacts/session-work/ledger.json` in the coordinator session. The WebModule calls these methods through `BuffalyAgentService.RunProtoScriptMethodAsync`; it contains no coordinator business logic.

The first specialized operation, `ToAttachActionLearningWorker`, creates or reuses an `action-learning` worker with the exact source session as its parent and records the worker binding in the ledger. `ToListActionLearningCoordinatorActions` provides the exact common, specialized, and worker action inventory rendered by the two-level dashboard.
