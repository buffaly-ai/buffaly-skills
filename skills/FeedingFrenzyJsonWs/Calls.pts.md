# Calls.pts Notes

## Initial read-only call tools (2026-06-25)
- Added read-oriented wrappers for `FeedingFrenzy.CallCenter.Calls` JsonWs routes:
  - `calls/get-call`
  - `calls/get-call-as-markdown`
  - `calls/get-call-by-call-key`
  - `calls/get-calls-by-date-range`
  - `calls/get-calls-by-date-range-as-markdown`
- Deliberately did not expose write/post-process/reclassify call routes in the default Feeding Frenzy agent surface.
- Design Decision: call-agent acceptance can be served from call metadata/transcription markdown first, while mutating call processing remains out of the default agent until guarded confirmation semantics are designed.

## CallCenter route prefix validation (2026-06-26)
- Switched all call wrappers from `CallBusinessRoute(...)` to `CallCallCenterRoute(...)` because the call manifests are generated under `FeedingFrenzy.CallCenter.Calls`, not `FeedingFrenzy.Admin.Business`.
- Staging validation confirmed the wrappers now reach the CallCenter JsonWs endpoint; the tested June 2026 date range returned an empty call collection/markdown rather than the login page returned by the wrong prefix.

## Observation call tools (2026-07-28)
- Added the read-only `ToGetCallTranscript` action for structured incremental status/transcript polling through `calls/get-call-transcript`.
- Added guarded write actions `ToStartObservationCall` and `ToCancelObservationCall` through the `twilio-admin` CallCenter routes.
- Start is intentionally guarded because it can place a billable external call. The FF endpoint currently rejects `DeskPhone` until API-originated screening is proven.
- Cancellation returns request acknowledgement; callers must continue polling until `IsTerminal=true`.
- DTMF is not exposed because no validated FF `SendDTMF` endpoint exists yet.
- Added `ToGetActiveTranscribedCalls` read-only action for passive discovery of active transcribed calls through `calls/get-active-transcribed-calls`. Returns compact call objects with CallID, CallKey, CallStatus, Duration, TranscriptVersion, LastUpdated. Filters to nonterminal/streamed/realtime, capped at 100 newest-first.
- Added `ToUpdateBuffalyObserverState` guarded write action for bounded, idempotent, namespaced write-back to `DataObject['BuffalyObserver']` through `calls/update-buffaly-observer-state`. Validates Sequence, Lifecycle, Category, Confidence, Reason, LastTranscriptVersion. Equal/older sequences are ignored. Never overwrites native AICallOutcome fields or unrelated DataObject properties.
- Updated `ToGetCallTranscript` description to reflect extended response (TranscriptVersion, Turns, PartialParticipantA/B, BuffalyObserver, TranscriptionError).
