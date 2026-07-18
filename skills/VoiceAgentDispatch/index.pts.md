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
- Staging validation showed models could still repeat the send in a later completion round when given the raw queue DTO. Both send actions now follow the proven Level 2 wrapper pattern by discarding the internal queue DTO and returning explicit truthful text. Unlike the Level 2 wording, the dispatcher return does not claim to terminate processing.
