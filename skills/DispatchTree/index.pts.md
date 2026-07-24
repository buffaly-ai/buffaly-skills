# DispatchTree ProtoScript Skill

- 2026-07-21: Replaced the unimported `ArgumentException` with the project-supported `InvalidOperationException` for required prototype-name validation.

## Purpose

Provides bounded read-only routing evidence for a normal Buffaly Dispatch agent. The existing `DispatchContext` owns destination judgment and the per-turn algorithm; this skill only searches and reads a session-local `DispatchMemoryRoot` hierarchy. Confirmed `Reuse` decisions are delivered separately through the normal `ToSendToSession` action.

## Contracts

- `DispatchAgentActionRoot` and `DispatchTreeSkillAction` preserve the public Skill discovery surface without defining the normal Dispatch agent profile.
- `DispatchTreeContextAction : DispatchTreeSkillAction, DispatchContext` is the supplemental context root. When `PromptContext = DispatchContext`, the host automatically registers only its four bounded descendants in addition to normal `CoreAction` tools.
- `ToSearchDispatchMemories` accepts one concise meaning phrase and an optional exact subtree root. It searches only `Dispatch Memory` tags in `session:<currentSessionKey>` and returns typed compact semantic anchors with similarity preserved.
- `ToGetDispatchChildren` returns only one immediate child level. `ToGetDispatchPath` returns only one root-to-candidate path. Both hide historical examples and exact destination values.
- `ToGetDispatchNode` recursively verifies one exact narrowed node beneath `DispatchMemoryRoot` and is the only bounded action that returns full assigned evidence, including `HistoricalDispatches` and `SessionKey`.
- `ToGetDispatchTree` remains a recursive complete-topology diagnostic and is intentionally outside `DispatchTreeContextAction` because its projection omits assigned routing evidence.
- `ToPlanDispatchRoute` remains an exact-name compatibility PromptAction outside `DispatchTreeContextAction`. Its prompt is a deprecation notice; it contains no route algorithm or semantic action phrases.
- `DispatchNodeSummary` is a typed CLR result row rendered by the standard Buffaly enumerable formatter. It is not JSON, a raw ontology node, or an opaque native reference.
- DispatchTree contains no queue or send action. In particular, the obsolete `ToDispatchPlannedTask` helper was removed; ordinary `ToSendToSession` is the one supported delivery path after a tree-backed lookup or when an exact destination is already established without a lookup.

## Design Decision

Context judgment, evidence reads, and delivery have separate ownership: `DispatchContext` decides, DispatchTree returns bounded evidence, and the normal Buffaly agent queues the user's complete instruction through `ToSendToSession`. Tree-extension decisions remain proposal-only in this version.
