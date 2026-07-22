# DispatchTree ProtoScript Skill

- 2026-07-21: Replaced the unimported `ArgumentException` with the project-supported `InvalidOperationException` for required prototype-name validation.

## Purpose

Provides read-only routing helpers for a normal Buffaly Dispatch agent. The skill reads and searches a session-local `DispatchMemoryRoot` hierarchy and invokes a prompt workflow that plans routes without sending, creating sessions, or mutating memory. Confirmed `Reuse` decisions are delivered separately through the normal `ToSendToSession` action.

## Contracts

- `DispatchAgentActionRoot` groups the routing helpers but does not define the Dispatch agent's overall capability surface; the agent profile uses normal `CoreAction` and `CoreEntity` roots.
- `ToGetDispatchTree` requires the current runtime to contain `DispatchMemoryRoot` and returns its complete nested hierarchy through the project's canonical `GetDescendantsAsDistance` formatter.
- `ToGetDispatchNode` accepts one exact prototype selected from the tree, recursively verifies it at any depth beneath the current runtime's `DispatchMemoryRoot`, and returns that verified runtime prototype read-only so its locally assigned properties, including `SessionKey`, remain available. The recursion is required because `GetDescendants()` returns immediate children rather than the complete transitive hierarchy; `ShallowClone()` is intentionally not used because it omits locally assigned routing properties.
- `ToSearchDispatchMemories` searches only `Dispatch Memory` semantic tags in `session:<currentSessionKey>` beneath `DispatchMemoryRoot`.
- `ToPlanDispatchRoute` is a read-only PromptAction and must call both tree read and scoped search before deciding.
- A `Reuse` receipt keeps node identity and destination identity separate: `ExistingLeaf` is the exact prototype name, while `DestinationSessionKey` is copied verbatim from that leaf's assigned `SessionKey`. A missing key fails closed as `NeedsReview`.
- DispatchTree contains no queue or send action. In particular, the obsolete `ToDispatchPlannedTask` helper was removed; ordinary `ToSendToSession` is the one supported delivery path after mandatory planning.

## Design Decision

Routing and delivery have separate ownership: DispatchTree plans and verifies the destination, while the normal Buffaly agent queues the user's complete instruction through `ToSendToSession`. Tree-extension decisions remain proposal-only in this version.
