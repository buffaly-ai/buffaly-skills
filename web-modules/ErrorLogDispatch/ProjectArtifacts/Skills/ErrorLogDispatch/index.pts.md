# ErrorLogDispatch ProtoScript Skill

Thin pass-through skill exposing exactly two curated dispatch-agent actions:

- `ToGetErrorDispatchSession` creates/reuses and verifies a diagnostic owner and its DispatchTree attachment. It does not accept provider/model/reasoning arguments; the C# facade reads the package-owned shared policy so the dispatching agent cannot override configuration.
- `ToDispatchErrorToSession` validates and queues one bounded assignment.

All business rules and typed validation live in `Buffaly.ErrorLogDispatch.WebModule`.
