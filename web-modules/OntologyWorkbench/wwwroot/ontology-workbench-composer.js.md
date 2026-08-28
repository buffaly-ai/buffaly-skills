# ontology-workbench-composer.js

## Purpose

Adds the Ontology Workbench action beside the Agent Next composer controls through the module-owned `AgentScripts` manifest extension. Core Buffaly composer source is not modified.

## Behavior

The button reads the authoritative active key from `BuffalyAgentSessionContext.getActiveSessionKey()` and the current value from `#txtOpsV2Prompt`. It derives the stable Workbench key `<active session key> - Ontology Workbench`, URL-encodes that key plus the complete composer message as `sessionKey` and `message` query parameters, and opens the same-origin `launch.html` router. The router preserves those parameters and reads browser settings to choose either the configured standalone `/harness/` URL or the installed web-module Workbench route.

The button does not call an API, create a remote session, run extraction, or modify the source composer. The Workbench page binds the query values into its Attached session and User directive fields; subsequent warmup or extraction remains an explicit Workbench-page action. Errors remain visible through the button title and an alert.
