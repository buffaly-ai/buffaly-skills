# code-reviews-agent-bridge.js Change Notes

## Add JavaScript Session Bridge (2026-05-07)
- Added a JavaScript-only Buffaly session bridge for standalone and installed web-module modes.
- Resolves Buffaly base URL/session key from query string, installed web-module same-origin, or localStorage.
- Sends review annotations to `/api/buffaly-agent-service/queue-input` using the existing EvaluateInputContract shape.
- Falls back to saving pending reviews in localStorage when disconnected.

## Pending review retry
- Save failed queue attempts to localStorage with target environment/session metadata so transient Matt queue errors do not drop review notes.
- Added pending review count and retry helpers for the diff page.

## Detailed agent instruction payload
- Expanded the queued instruction text so agents receive the commit SHA, repository path, full file paths, selected line ranges, selected snippets, and reviewer notes directly in the message.
- Kept the structured review payload in `UserState.CodeReviewFeedback` for machine-readable follow-up while making the human-readable instruction self-contained.

## Accept Source Session Query Parameter (2026-05-21)
- Updated diff-page session resolution to accept `sourceSessionKey` before the existing `sessionKey` and `agentSessionKey` query names.
- Design Decision: CodeReviews links generated from Buffaly Agent should carry the originating source session using an explicit name while preserving the existing session configuration fallback behavior.
