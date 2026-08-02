# BuffalyNLMemory.pts

Defines runtime prototype-memory services/actions, source-local Online Action Critic persistence actions, and the temporary-memory prompt action. Runtime initialization restores marker-free complete definitions from `artifacts/nl-memory/SessionMemory.pts` and critic-owned executable actions from `artifacts/online-action-critic/SessionActions.pts`. Online Action Critic writes expose create/update, exact-definition read, and start-fresh clear operations while the C# owner enforces same-name ownership and source-scoped phrase binding. The source write wrapper returns parser or interpretation failures as diagnostic text so a remote critic can correct its generated definition. Persisted writes use shared transactional ProtoScript authoring before live runtime mutation. Historical catch-up actions are intentionally absent.

## 2026-08-02

- Moved `ToStartOnlineActionCriticFresh` from eager OpsAgent Core into this skill so the wrapper and its `ToClearOnlineActions` dependency activate together.
- The dedicated online memory profile still includes BuffalyNLMemory eagerly; normal OpsAgent can now discover and explicitly load this complete action surface through the skill's lazy ownership map.
- Removed the full-OpsAgent-only `OnlineActionCriticSkillAction` and `CoreAction` exposure parents. The skill now compiles against shared `ProtoScriptAction`/`PromptAction` contracts in both normal OpsAgent and the CoreLite online-memory profile; profile reachability comes from the explicit include or lazy sidecar rather than unrelated root inheritance.
- Imports the typed `OnlineActionCriticTools` helper directly because the moved start-fresh wrapper must compile in the CoreLite memory profile without relying on the separate Online Action Critic ProtoScript file to introduce that import.
