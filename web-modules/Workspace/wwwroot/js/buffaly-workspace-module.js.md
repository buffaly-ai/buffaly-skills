# buffaly-workspace-module.js Change History

## Workspace Index and Detail Pages (2026-08-01)

- Added the route-owned browser helper for `/workspace/` and `/workspace/workbench.html`.
- Loads the workspace index through `/api/web-modules/Workspace/list`.
- Loads a specific workspace through `/api/web-modules/Workspace/summary` and renders recent artifacts plus sessions with links back to Agent Next.
- Uses hosted artifact URLs through the Workspace WebModule artifact endpoint instead of download-only or session-artifact mockup paths.
