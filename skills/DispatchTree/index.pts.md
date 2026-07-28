# DispatchTree ProtoScript Skill

- 2026-07-21: Replaced the unimported `ArgumentException` with the project-supported `InvalidOperationException` for required prototype-name validation.

## Purpose

Provides bounded routing evidence and guarded local-tree writes for a normal Buffaly Dispatch agent. The existing `DispatchContext` owns destination judgment and the per-turn algorithm; this skill searches, traverses, and applies only typed validated changes to a session-local `DispatchMemoryRoot` hierarchy. Confirmed routing decisions are delivered separately through the normal core session-delivery tooling; this skill deliberately does not wrap or re-export external core session/entity tools.

## Contracts

- `DispatchAgentActionRoot` and `DispatchTreeSkillAction` define the public bounded lookup/builder Skill discovery surface. `DispatchAgentCuratedActionRoot` and `DispatchAgentCuratedEntityRoot` are package-owned operational profile roots so installed `dispatch-agent` profiles retain session lifecycle/search, capability discovery, Scratch, and prototype inspection without depending on unmanaged project-local ProtoScript.
- Each bounded action directly inherits both `DispatchTreeSkillAction` and `DispatchContext`. The host registers only immediate descendants of a supplemental PromptContext action root, so this direct inheritance makes the bounded actions callable from the first Dispatch turn while preserving the public Skill discovery surface. Do not insert an intermediate context-action prototype.
- `ToSearchDispatchMemories` accepts one concise meaning phrase, a required bounded candidate window of 10 through 20 (default 12), and an optional exact subtree root. It searches only `Dispatch Memory` tags in `session:<currentSessionKey>` and returns typed compact semantic anchors with similarity preserved. Anchors must be placed and refined through the local graph before reuse.
- `ToGetDispatchChildren` returns only one immediate child level. `ToGetDispatchPath` returns only one root-to-candidate path. Both hide historical examples and exact destination values.
- `ToGetDispatchNode` recursively verifies one exact narrowed node beneath `DispatchMemoryRoot` and is the only bounded read action that returns full assigned evidence, including `HistoricalDispatches` and typed Dispatch attachments.
- `EnsureDispatchMemoryRoot` seeds the canonical minimal untagged `DispatchNode` and `DispatchMemoryRoot` schema, including minimal `DispatchAttachment(Name, Value)`, into the current session NLMemory artifact and active runtime, idempotently. The structural root remains outside `Dispatch Memory` semantic search; searchable descendants carry explicit tags.
- `ToAddDispatchCommonParent` creates one new common-parent node and one new child beneath it through ordinary complete ProtoScript upserts. Each selected existing immediate child replaces the current parent with the common parent while retaining unrelated additional parents. The upsert writes explicit Dispatch Memory tags, keeps the new nodes unbound with `Entity = null` and `Value = 0`, preserves each moved child's direct `Entity`, `Value`, differently named attachment, context, and history assignments, and rejects invalid relationships before persistence.
- `ToGetDispatchAttachment`, `ToSetDispatchAttachment`, and `ToClearDispatchAttachment` expose exact typed attachment access over the `Attachments` collection. Replacement/clear preserve differently named attachments and never create sessions, queue, or deliver. BuildOnly attachment mutation fails closed for real sessions and is allowed only for isolated build-only session keys.
- `ToGetDispatchBuildOnlyGuard` reports the prompt/test guard contract: isolated root/node/history mutation is allowed, but attachment mutation to real sessions, session creation, queueing, and delivery are unavailable.
- `ToRecordHistoricalDispatch` appends one compact grounded example to a verified terminal node through the typed facade; exact duplicates are no-ops and the action cannot select a route or alter a destination.
- `ToGetDispatchTree` remains a recursive complete-topology diagnostic and intentionally does not inherit `DispatchContext` because its projection omits assigned routing evidence.
- There is no planner PromptAction. `DispatchContext` is the sole owner of the routing prescription, so the Skill cannot compete with or hide that algorithm behind action discovery.
- `DispatchNodeSummary` is a typed CLR result row rendered by the standard Buffaly enumerable formatter. It is not JSON, a raw ontology node, or an opaque native reference.
- DispatchTree contains no queue or send action. In particular, the obsolete `ToDispatchPlannedTask` helper and `ToPlanDispatchRoute` PromptAction are absent; the normal Buffaly session-delivery tool remains the supported delivery path after at least one bounded tree verification read. Integration requirements: the consuming Dispatch prompt/profile must load the core exact session queue/send tool, pass the complete user instruction unchanged, and never use DispatchTree BuildOnly receipts as delivery authorization.

## Design Decision

Context judgment, evidence reads, and delivery have separate ownership: `DispatchContext` decides, DispatchTree returns bounded evidence, and the normal Buffaly agent queues the user's complete instruction through `ToSendToSession`. Tree-extension decisions remain proposal-only in this version.
