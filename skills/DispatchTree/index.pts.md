# DispatchTree ProtoScript Skill

## Purpose

Provides the restricted, read-only action surface for the Dispatch agent staging proof. The skill reads and searches a session-local `DispatchMemoryRoot` hierarchy and invokes a prompt workflow that plans routes without sending, creating sessions, or mutating memory.

## Contracts

- `DispatchAgentActionRoot` is intentionally narrow and must never inherit a broad action root.
- `ToGetDispatchTree` requires the current runtime to contain `DispatchMemoryRoot`.
- `ToSearchDispatchMemories` searches only `Dispatch Memory` semantic tags in `session:<currentSessionKey>` beneath `DispatchMemoryRoot`.
- `ToPlanDispatchRoute` is a read-only PromptAction and must call both tree read and scoped search before deciding.
- This staged version has no queue, send, session-creation, generic invocation, or NLMemory mutation action.

## Design Decision

The staging proof deploys route planning before guarded live dispatch. This allows online validation of reuse and proposed tree-extension behavior with zero queue or ontology side effects.
