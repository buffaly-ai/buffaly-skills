# DispatchTree ProtoScript Skill

- 2026-07-21: Replaced the unimported `ArgumentException` with the project-supported `InvalidOperationException` for required prototype-name validation.

## Purpose

Provides bounded read-only routing evidence for a normal Buffaly Dispatch agent. The existing `DispatchContext` owns destination judgment and the per-turn algorithm; this skill only searches and reads a session-local `DispatchMemoryRoot` hierarchy. Confirmed `Reuse` decisions are delivered separately through the normal `ToSendToSession` action.

## Contracts

- `DispatchAgentActionRoot` and `DispatchTreeSkillAction` define the public read-only Skill discovery surface without defining the normal Dispatch agent profile.
- `DispatchTreeContextAction : DispatchTreeSkillAction, DispatchContext` is the supplemental context root. When `PromptContext = DispatchContext`, the host automatically registers only its four bounded descendants in addition to normal `CoreAction` tools.
- `ToSearchDispatchMemories` accepts one concise meaning phrase, a required bounded candidate window of 10 through 20 (default 12), and an optional exact subtree root. It searches only `Dispatch Memory` tags in `session:<currentSessionKey>` and returns typed compact semantic anchors with similarity preserved. Anchors must be placed and refined through the local graph before reuse.
- `ToGetDispatchChildren` returns only one immediate child level. `ToGetDispatchPath` returns only one root-to-candidate path. Both hide historical examples and exact destination values.
- `ToGetDispatchNode` recursively verifies one exact narrowed node beneath `DispatchMemoryRoot` and is the only bounded action that returns full assigned evidence, including `HistoricalDispatches` and `SessionKey`.
- `ToGetDispatchTree` remains a recursive complete-topology diagnostic and is intentionally outside `DispatchTreeContextAction` because its projection omits assigned routing evidence.
- There is no planner PromptAction. `DispatchContext` is the sole owner of the routing prescription, so the Skill cannot compete with or hide that algorithm behind action discovery.
- `DispatchNodeSummary` is a typed CLR result row rendered by the standard Buffaly enumerable formatter. It is not JSON, a raw ontology node, or an opaque native reference.
- DispatchTree contains no queue or send action. In particular, the obsolete `ToDispatchPlannedTask` helper and `ToPlanDispatchRoute` PromptAction are absent; ordinary `ToSendToSession` is the one supported delivery path after at least one bounded tree verification read.

## Design Decision

Context judgment, evidence reads, and delivery have separate ownership: `DispatchContext` decides, DispatchTree returns bounded evidence, and the normal Buffaly agent queues the user's complete instruction through `ToSendToSession`. Tree-extension decisions remain proposal-only in this version.
