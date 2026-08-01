# Workspace WebModule Page Assets

## 2026-08-01

- `workspace-index.html` is the module index shell listing available workspaces.
- `workspace-workbench.html` is the module detail shell for one workspace.
- Both pages intentionally delegate data loading and rendering to `buffaly-workspace-module.js` so the route shell stays small and portable.
