# buffaly-workspace-module.js Change History

## Restored Polished Workbench Adapter (2026-08-02)

- Changed the WebModule detail page adapter to feed `/api/web-modules/Workspace/summary` data into the polished `workspace-workbench` Web Component instead of rendering a minimal generic card/list shell.
- Preserves the route-owned workspace index helper while allowing the detail page to reuse the richer artifact-hosted workbench layout: sidebar navigation, pinned files, file icons, source cards/list data, and hosted artifact links.
- Design Decision: the WebModule owns live data loading and URL construction; the visual workbench remains a reusable Web Component so the session-artifact prototype styling can move forward without depending on artifact sidecars.

## Workspace Index and Detail Pages (2026-08-01)

- Added the route-owned browser helper for `/workspace/` and `/workspace/workbench.html`.
- Loads the workspace index through `/api/web-modules/Workspace/list`.
- Loads a specific workspace through `/api/web-modules/Workspace/summary` and renders recent artifacts plus sessions with links back to Agent Next.
- Uses hosted artifact URLs through the Workspace WebModule artifact endpoint instead of download-only or session-artifact mockup paths.
