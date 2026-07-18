# Voice Agent Dispatch Skill

This bundled infrastructure skill implements the minimal queued-message bridge between a lightweight Voice Agent and its automatically attached full Buffaly dispatcher child.

- `VoiceAgentAction` exposes only `ToSendMessageToVoiceAgentDispatcher` and `ToGetLatestVoiceAgentDispatcherTurn`.
- `VoiceAgentDispatcher` is the dispatcher prompt-context prototype and supplemental action root; its specialized action is `ToSendMessageToVoiceAgent`.
- Send actions call `SessionTools.SendToSessionTool` and return a truthful plain-text delivery signal that prevents model-driven duplicate sends; latest-turn recovery returns the existing `TurnSummaryContract`.
- Targets come only from runtime-bound `VoiceAgent.DispatcherSessionKey` and `VoiceAgent.SourceSessionKey`.
- Dispatcher returns begin with `[label: Voice Agent Dispatcher]`.

No dispatch DTO, event, subscription, callback, polling loop, job store, or internal HTTP path is introduced.

## Queue-acceptance acknowledgement guard

- Clarified that a successful `QueuedInputResult` is definitive evidence that the instruction is already queued, so the Voice Agent must acknowledge once and never repeat the same send while finishing that turn.
- Staging validation showed models could still repeat the send in a later completion round when given the raw queue DTO. Both send actions now follow the proven Level 2 wrapper pattern by discarding the internal queue DTO and returning explicit truthful text.

## Dispatcher return end-cycle guard

- Fresh staging validation proved that `SessionTools.SendToSessionTool(...)` queues the return but does not mechanically terminate dispatcher processing.
- The dispatcher return now uses the established Level 2 result wording: delivery is complete and the current cycle must end now.
- This prevents the mandatory send-back prompt from firing twice without adding DTOs, events, deduplication state, or special runtime code.

## Voice Agent outbound end-cycle guard

- Concurrent-turn staging validation proved the Voice Agent could also enter another completion round and resend the same dispatcher instruction despite a successful queue acknowledgement.
- The Voice Agent outbound action now uses the same established Level 2 end-cycle result as the dispatcher return action.
- This makes both bridge directions symmetric: one successful delivery ends that model cycle, while later user or dispatcher inputs start ordinary new turns.

## Hard per-turn duplicate suppression

- Overlapping-input staging validation proved that end-cycle wording alone is advisory: providers may still issue the same side-effectful action in later completion rounds of one turn.
- Both bridge actions now call `SessionTools.SendToSessionOncePerCurrentTurnTool(...)`, which claims the exact direction, target, and instruction against the authoritative active turn before queueing.
- Repeated calls in the same turn are suppressed at the side-effect boundary; identical instructions remain valid in later turns. Ordinary queued session messages remain the only transport.
