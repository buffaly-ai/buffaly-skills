# DispatchTree ProtoScript Skill

## Purpose

Provides the restricted, read-only action surface for the Dispatch agent staging proof. The skill reads and searches a session-local `DispatchMemoryRoot` hierarchy and invokes a prompt workflow that plans routes without sending, creating sessions, or mutating memory.

## Contracts

- `DispatchAgentActionRoot` is intentionally narrow and must never inherit a broad action root. Every concrete Dispatch action explicitly inherits it so runtime descendant discovery registers each `Execute` method on the restricted agent profile.
- `ToGetDispatchTree` requires the current runtime to contain `DispatchMemoryRoot` and returns its complete nested hierarchy through the project's canonical `GetDescendantsAsDistance` formatter.
- `ToGetDispatchNode` accepts one exact prototype selected from the tree, recursively verifies it at any depth beneath the current runtime's `DispatchMemoryRoot`, and returns that verified runtime prototype read-only so its locally assigned properties, including `SessionKey`, remain available. The recursion is required because `GetDescendants()` returns immediate children rather than the complete transitive hierarchy; `ShallowClone()` is intentionally not used because it omits locally assigned routing properties.
- `ToSearchDispatchMemories` searches only `Dispatch Memory` semantic tags in `session:<currentSessionKey>` beneath `DispatchMemoryRoot`.
- `ToPlanDispatchRoute` is a read-only PromptAction and must call both tree read and scoped search before deciding.
- A `Reuse` receipt keeps node identity and destination identity separate: `ExistingLeaf` is the exact prototype name, while `DestinationSessionKey` is copied verbatim from that leaf's assigned `SessionKey`. A missing key fails closed as `NeedsReview`.
- This staged version has no queue, send, session-creation, generic invocation, or NLMemory mutation action.

## Design Decision

The staging proof deploys route planning before guarded live dispatch. This allows online validation of reuse and proposed tree-extension behavior with zero queue or ontology side effects.
