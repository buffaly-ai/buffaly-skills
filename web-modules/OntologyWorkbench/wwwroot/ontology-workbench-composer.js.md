# ontology-workbench-composer.js

## Purpose

Adds the Ontology Workbench action beside the Agent Next composer controls through the module-owned `AgentScripts` manifest extension. Core Buffaly composer source is not modified.

## Behavior

The button reads the authoritative active key from `BuffalyAgentSessionContext.getActiveSessionKey()` and the current value from `#txtOpsV2Prompt`. It posts `{ sessionKey, message }` to the configured standalone harness `/harness/api/dispatch-message` endpoint. On success, it replaces the composer text with the returned ontology grammar, dispatches the normal `input` event so draft state remains consistent, and leaves the result in the composer for review rather than submitting it automatically.

The remote endpoint owns deterministic child naming and returns the child key. Errors remain visible through the button title and an alert; the original composer value is preserved when a request fails.
