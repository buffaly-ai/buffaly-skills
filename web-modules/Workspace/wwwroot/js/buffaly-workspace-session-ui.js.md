# buffaly-workspace-session-ui.js Change History

## Full WebModule Shortcut (2026-08-01)

- Simplified the Agent Next header contribution to a direct `Workspace: <name>` link into `/workspace/workbench.html`.
- Removed the header dropdown/drawer behavior from this contribution; workspace browsing now belongs to the full Workspace WebModule pages.
- Kept the optional Next-shell host guard so generic WebModule AgentScripts can load on non-next-shell pages without throwing.

## Initial Next-Shell Contribution (2026-07-21)

- Registered `workspace.current-session` through `BuffalyAgentNextExtensions` at `sessionHeader.context`.
- Added attached/unattached rendering and deterministic disposal below the provided slot.
- Design Decision: the module never queries private next-shell selectors; all feature markup and state are owned below the provided slot.

## Runtime JSON Contract (2026-07-21)

- Read the module endpoint's ASP.NET Core camel-case JSON properties directly.
- Keep the browser fixture in the same wire shape so client tests detect serialization-contract drift.
