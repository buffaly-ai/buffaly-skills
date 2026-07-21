# buffaly-workspace-session-ui.js Change History

## Initial Next-Shell Contribution (2026-07-21)

- Registered `workspace.current-session` through `BuffalyAgentNextExtensions` at `sessionHeader.context`.
- Added attached/unattached rendering, workspace chip, Shared files/Sessions drawer, request cancellation, and deterministic disposal.
- Design Decision: the module never queries private next-shell selectors; all feature markup and state are owned below the provided slot.
