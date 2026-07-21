# Action Learning Coordinator ProtoScript

Defines `SessionWorkCoordinatorSkill` as the common coordinator base and `ActionLearningCoordinatorSkill` as the Action Learning specialization.

The first staging slice exposes four live-runtime methods: coordinator identity, read fixed ledger, initialize fixed ledger, and bootstrap-only complete ledger replacement. All state is stored at `artifacts/session-work/ledger.json` in the coordinator session. The WebModule calls these methods through `BuffalyAgentService.RunProtoScriptMethodAsync`; it contains no coordinator business logic.