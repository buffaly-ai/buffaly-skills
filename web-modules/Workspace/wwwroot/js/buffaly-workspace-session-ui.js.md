# buffaly-workspace-session-ui.js Change History

## Initial Next-Shell Contribution (2026-07-21)

- Registered `workspace.current-session` through `BuffalyAgentNextExtensions` at `sessionHeader.context`.
- Added attached/unattached rendering, workspace chip, Shared files/Sessions drawer, request cancellation, and deterministic disposal.
- Preserve drawer visibility and the selected tab by session key across same-session shell remounts, while continuing to refetch and rebuild the workspace summary on every mount.
- Replace inert artifact controls with module-owned open links, render the current session as status rather than a fake action, and register shared artifacts through the removable `BuffalyAgentFileSources` contract.
- Design Decision: the module never queries private next-shell selectors; all feature markup and state are owned below the provided slot.

## Runtime JSON Contract (2026-07-21)

- Read the module endpoint's ASP.NET Core camel-case JSON properties directly.
- Keep the browser fixture in the same wire shape so client tests detect serialization-contract drift.

## Optional Next-Shell Host Guard (2026-07-23)

- Guard the top-level `BuffalyAgentNextExtensions` registration path so generic WebModule AgentScripts can load on non-next-shell pages without throwing.
- Keep the Workspace header contribution and shared file source active when the next-shell registry is present.
