# buffaly-workspace-session-ui.js Change History

## Initial Next-Shell Contribution (2026-07-21)

- Registered `workspace.current-session` through `BuffalyAgentNextExtensions` at `sessionHeader.context`.
- Added attached/unattached rendering, workspace chip, Shared files/Sessions drawer, request cancellation, and deterministic disposal.
- Design Decision: the module never queries private next-shell selectors; all feature markup and state are owned below the provided slot.

## Runtime JSON Contract (2026-07-21)

- Read the module endpoint's ASP.NET Core camel-case JSON properties directly.
- Keep the browser fixture in the same wire shape so client tests detect serialization-contract drift.
