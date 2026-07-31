# buffaly-workspace-workbench.js Change History

## Initial Workspace Workbench (2026-07-30)

- Added a package-owned Web Component for Home, Files, Skills, Templates, and Sources views.
- Uses the existing current-workspace summary and guarded artifact endpoint; it does not copy or synchronize session artifacts.
- Supports live file search and open, browser-local important-file pins, the configured parent skill and actions, composer preparation, and linked-session navigation.
- Opens from the compact Workspace drawer or `workspaceView=workbench` URL state and removes itself cleanly when returning to chat.
