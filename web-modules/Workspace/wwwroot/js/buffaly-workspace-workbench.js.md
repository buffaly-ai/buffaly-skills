# buffaly-workspace-workbench.js Change History

## Restored Session-Artifact Workbench Styling (2026-08-02)

- Restored the polished Workspace Workbench Web Component from the session-artifact prototype into the packaged WebModule asset.
- Brings back the richer sidebar/workbench layout, pinned-file persistence, file-type badges, Sources cards/list behavior, per-source file browsing, and styled artifact/session actions that were lost in the first WebModule promotion.
- The component still consumes `window.WORKSPACE_WORKBENCH_DATA`; the WebModule adapter is responsible for mapping live API summary data into that contract.

## Initial Workspace Workbench (2026-07-30)

- Added a package-owned Web Component for Home, Files, Skills, Templates, and Sources views.
- Uses the existing current-workspace summary and guarded artifact endpoint; it does not copy or synchronize session artifacts.
- Supports live file search and open, browser-local important-file pins, the configured parent skill and actions, composer preparation, and linked-session navigation.
- Opens from the compact Workspace drawer or `workspaceView=workbench` URL state and removes itself cleanly when returning to chat.
