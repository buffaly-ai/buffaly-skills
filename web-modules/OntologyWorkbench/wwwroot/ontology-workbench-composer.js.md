# ontology-workbench-composer.js

## Purpose

Adds the Ontology Workbench action beside the Agent Next composer controls through the module-owned `AgentScripts` manifest extension. Core Buffaly composer source is not modified.

## Behavior

The button reads the authoritative active key from `BuffalyAgentSessionContext.getActiveSessionKey()` and the current value from `#txtOpsV2Prompt`. It derives the stable Workbench key `<active session key> - Ontology Workbench`, URL-encodes that key plus the complete composer message as `sessionKey` and `message` query parameters, and opens the same-origin `launch.html` router. The router preserves those parameters and reads browser settings to choose either the configured standalone `/harness/` URL or the installed web-module Workbench route.

The same script also intercepts ProtoScript symbol clicks and long-press pointerdowns in the capture phase, before core `buffaly-agent-deep-links.js` can open the hardcoded standalone viewer. Captured symbol launches go through `launch.html` with `prototypeName` and the active session key so Installed web module vs Standalone Workbench is honored.

The button does not call an API, create a remote session, run extraction, or modify the source composer. The Workbench page binds the query values into its Attached session and User directive fields; subsequent warmup or extraction remains an explicit Workbench-page action. Input errors remain visible through the button title. Launches do not infer popup blocking from `window.open`'s return value because `noopener` may legitimately return `null` after successfully opening the tab; therefore symbol clicks never show a blocking browser alert.
