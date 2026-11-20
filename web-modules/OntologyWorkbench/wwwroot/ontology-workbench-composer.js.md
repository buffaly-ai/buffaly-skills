# ontology-workbench-composer.js

## Purpose

Adds the Ontology Workbench action beside the Agent Next composer controls through the module-owned `AgentScripts` manifest extension. Core Buffaly composer source is not modified.

## Behavior

The button reads the authoritative active key from `BuffalyAgentSessionContext.getActiveSessionKey()` and the current value from `#txtOpsV2Prompt`. It derives the stable Workbench key `<active session key> - Ontology Workbench`, URL-encodes that key plus the complete composer message as `sessionKey` and `message` query parameters, and opens the same-origin `launch.html` router. The router preserves those parameters and reads browser settings to choose either the configured standalone `/harness/` URL or the installed web-module Workbench route.

The same script also intercepts ProtoScript symbol clicks and long-press pointerdowns in the capture phase, before core `buffaly-agent-deep-links.js` can open the external viewer. Captured symbol launches open the installed web module's `/web-modules/OntologyWorkbench/prototype-viewer` route directly with `prototypeName` and the exact active session key. This preserves session-local prototype ownership and does not apply the independently configurable composer/Tool Menu standalone launch mode to semantic links.

The button does not call an API, create a remote session, run extraction, or modify the source composer. The Workbench page binds the query values into its Attached session and User directive fields; subsequent warmup or extraction remains an explicit Workbench-page action. Input errors remain visible through the button title. Launches do not infer popup blocking from `window.open`'s return value because `noopener` may legitimately return `null` after successfully opening the tab; therefore symbol clicks never show a blocking browser alert.

## 2026-11-20 - Keep ProtoScript links in the installed web module

- Named ProtoScript links now bypass the configurable standalone launcher and open the installed Prototype Viewer directly.
- The handler still obtains the originating session from `BuffalyAgentSessionContext.getActiveSessionKey()` and passes it unchanged as `sessionKey`, allowing the viewer's existing cold-session warmup to inspect session-local prototypes.
- Bumped the module AgentScript version so browsers load the corrected click handler after package activation. Validation: focused and full automated tests plus browser routing/cold-session checks recorded with the delivering commit.

## 2026-11-20 — Route composer text to the Method Runner

- `openWorkbench` now sets the explicit `page=runner` launcher selector while retaining the exact composer message and derived `<active session> - Ontology Workbench` key. It neither clears the composer nor executes a method. The launcher still honors standalone/web-module preferences; default Grammar navigation and direct symbol-viewer navigation are unchanged.
- The previous viewer fixes never changed this composer destination; updating an unchanged package could not repair it. The companion's earlier Behavior description describes the old Grammar destination, superseded for composer launches by this entry.
- Incremented the AgentScripts cache token to 20261120.2 and shared visible build to 2026.11.20.2. Functional Node tests execute the actual composer handler, launcher, and runner initialization in both launch modes, including special characters, stale remembered session, validation errors and no automatic requests.
- Validation: Release solution build succeeded; 56 .NET tests and 18 Node tests pass after updating stale route/build expectations. Live standalone runner loads exact incoming fields and real Run handler; browser found and verified correction of missing shared Markdown dependencies in the runner. Installed activation is recorded separately by the release receipt.
