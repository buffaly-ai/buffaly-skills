# ErrorLogDispatch ProtoScript Skill

Thin pass-through skill exposing exactly two curated dispatch-agent actions:

- `ToGetErrorDispatchSession` creates/reuses and verifies a diagnostic owner and its DispatchTree attachment.
- `ToDispatchErrorToSession` validates and queues one bounded assignment.

All business rules and typed validation live in `Buffaly.ErrorLogDispatch.WebModule`.
