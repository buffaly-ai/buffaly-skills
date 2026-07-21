# DispatchTree ProtoScript Skill

## Purpose

Provides the restricted planning and ontology-guarded delivery surface for the Dispatch agent. The skill reads and searches a session-local `DispatchMemoryRoot`, plans a route, and can queue work only through a selected leaf whose assigned session key is verified exactly.

## Contracts

- `DispatchAgentActionRoot` is intentionally narrow and must never inherit a broad action root. Every concrete Dispatch action explicitly inherits it so runtime descendant discovery registers each `Execute` method on the restricted agent profile.
- `ToGetDispatchTree` requires the current runtime to contain `DispatchMemoryRoot` and returns its complete nested hierarchy through the project's canonical `GetDescendantsAsDistance` formatter.
- `ToGetDispatchNode` accepts one exact prototype selected from the tree, recursively verifies it at any depth beneath the current runtime's `DispatchMemoryRoot`, and returns that verified runtime prototype read-only so its locally assigned properties, including `SessionKey`, remain available.
- `ToDispatchPlannedTask` is the only model-facing delivery action. It verifies the selected prototype is beneath `DispatchMemoryRoot`, resolves the session-local `SessionKey` field through the runtime property graph, and reads that leaf's concrete assigned value before calling the typed session queue service. The caller cannot supply or override a destination, and generic direct send remains outside the Dispatch action root.
- `ToSearchDispatchMemories` searches only `Dispatch Memory` semantic tags in `session:<currentSessionKey>` beneath `DispatchMemoryRoot`.
- `ToPlanDispatchRoute` is a read-only PromptAction and must call both tree read and scoped search before deciding.
- A `Reuse` receipt keeps node identity and destination identity separate: `ExistingLeaf` is the exact prototype name, while `DestinationSessionKey` is copied verbatim from that leaf's assigned `SessionKey`. A missing key fails closed as `NeedsReview`.
- The Dispatch surface has no generic send, session-creation, generic invocation, or NLMemory mutation action.

## Design Decision

Delivery is fail-closed rather than absent: only a `Reuse` decision can proceed, and the guarded action re-resolves the selected leaf and verifies its exact destination immediately before queueing.
