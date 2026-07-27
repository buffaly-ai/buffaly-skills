# DispatchTree ProtoScript Skill

- 2026-07-21: Replaced the unimported `ArgumentException` with the project-supported `InvalidOperationException` for required prototype-name validation.

## Purpose

Provides bounded routing evidence and guarded local-tree writes for a normal Buffaly Dispatch agent. The existing `DispatchContext` owns destination judgment and the per-turn algorithm; this skill searches, traverses, and applies only typed validated changes to a session-local `DispatchMemoryRoot` hierarchy. Confirmed routing decisions are delivered separately through the normal `ToSendToSession` action.

## Contracts

- `DispatchAgentActionRoot` and `DispatchTreeSkillAction` define the public bounded lookup/builder Skill discovery surface without defining the normal Dispatch agent profile.
- Each bounded action directly inherits both `DispatchTreeSkillAction` and `DispatchContext`. The host registers only immediate descendants of a supplemental PromptContext action root, so this direct inheritance makes the bounded actions callable from the first Dispatch turn while preserving the public Skill discovery surface. Do not insert an intermediate context-action prototype.
- `ToSearchDispatchMemories` accepts one concise meaning phrase, a required bounded candidate window of 10 through 20 (default 12), and an optional exact subtree root. It searches only `Dispatch Memory` tags in `session:<currentSessionKey>` and returns typed compact semantic anchors with similarity preserved. Anchors must be placed and refined through the local graph before reuse.
- `ToGetDispatchChildren` returns only one immediate child level. `ToGetDispatchPath` returns only one root-to-candidate path. Both hide historical examples and exact destination values.
- `ToGetDispatchNode` recursively verifies one exact narrowed node beneath `DispatchMemoryRoot` and is the only bounded read action that returns full assigned evidence, including `HistoricalDispatches` and `SessionKey`.
- `EnsureDispatchMemoryRoot` seeds the canonical minimal untagged `DispatchNode` and `DispatchMemoryRoot` schema into the current session NLMemory artifact and active runtime, idempotently. The structural root remains outside `Dispatch Memory` semantic search; searchable descendants carry explicit tags.
- `ToAddDispatchCommonParent` creates one new common-parent node, one new child beneath it, and additive direct parent relationships from selected existing immediate children to that parent through constrained NLMemory batch authoring. It preserves existing parent links, writes explicit Dispatch Memory tags, keeps new common-parent/new-child nodes unbound with `Entity = null` and `Value = 0`, preserves selected existing children's direct `Entity` prototype assignments and direct `Value` doubles, and rejects invalid relationships before persistence.
- `ToRecordHistoricalDispatch` appends one compact grounded example to a verified terminal node through the typed facade; exact duplicates are no-ops and the action cannot select a route or alter a destination.
- `ToGetDispatchTree` remains a recursive complete-topology diagnostic and intentionally does not inherit `DispatchContext` because its projection omits assigned routing evidence.
- There is no planner PromptAction. `DispatchContext` is the sole owner of the routing prescription, so the Skill cannot compete with or hide that algorithm behind action discovery.
- `DispatchNodeSummary` is a typed CLR result row rendered by the standard Buffaly enumerable formatter. It is not JSON, a raw ontology node, or an opaque native reference.
- DispatchTree contains no queue or send action. In particular, the obsolete `ToDispatchPlannedTask` helper and `ToPlanDispatchRoute` PromptAction are absent; ordinary `ToSendToSession` is the one supported delivery path after at least one bounded tree verification read.

## Design Decision

Context judgment, evidence reads, and delivery have separate ownership: `DispatchContext` decides, DispatchTree returns bounded evidence, and the normal Buffaly agent queues the user's complete instruction through `ToSendToSession`. Tree-extension decisions remain proposal-only in this version.
