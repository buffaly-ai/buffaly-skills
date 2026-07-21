# Action Learning Coordinator ProtoScript

Defines `SessionWorkCoordinatorSkill` as the common coordinator base, with `ActionLearningCoordinatorSkill` and `OntologyFoundryCoordinatorSkill` as specializations.

The reusable workspace contract adds `SessionWorkWorkspaceDefinitionProvider`, `SessionWorkPortfolioProvider`, and `SessionWorkItemWorkspaceProvider`. The dashboard binds to one specialization, calls `ToGetSessionWorkCoordinatorInfo(specialization)`, and then invokes only the provider names advertised by that live coordinator. Action Learning and Ontology Foundry use one renderer.

`ActionLearningCoordinatorEntityRoot` is the restricted semantic entity root required by the `action-learning-coordinator` agent profile during fresh-session initialization.

The first staging slice exposes common live-runtime methods for coordinator identity, reading and initializing the fixed ledger, and typed add/remove of exact source-session entries. Add is idempotent; removing an absent entry returns `NotFound` without changing state. The raw whole-ledger replacement surface is intentionally not public.

All common methods derive from `SessionWorkCoordinatorSkillAction`; Action Learning-specific methods use the separate `ActionLearningCoordinatorSkillAction` root. State is stored at `artifacts/session-work/ledger.json` in the coordinator session. The WebModule calls these methods through `BuffalyAgentService.RunProtoScriptMethodAsync`; it contains no coordinator business logic.

The first specialized operation, `ToAttachActionLearningWorker`, creates or reuses an `action-learning` worker with the exact source session as its parent and records the worker binding in the ledger. `ToListActionLearningCoordinatorActions` provides the exact common, specialized, and worker action inventory rendered by the two-level dashboard; the worker inventory includes `ToRefreshActionLearningSessionCandidatesSkill` as the primary living-artifact stage.

`ToAttachOntologyFoundryWorker` applies the same source-child pattern with the `ontology-foundry` profile. The first Foundry workspace is read-only beyond common track, attach, and remove bookkeeping: it exposes no acceptance, promotion, Session Entity Index materialization, ontology authoring, expansion, or generalization operation.

The browser does not read session files or parse domain Markdown. Each source-workspace provider validates the exact source key and reads only its fixed source-owned artifact. New ledgers identify `SessionWorkCoordinatorSkill`; existing version-1 Action Learning ledgers remain readable and are not rewritten merely by loading the workspace.
