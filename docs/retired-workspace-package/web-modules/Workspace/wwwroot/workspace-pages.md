# Workspace WebModule Page Assets

## 2026-08-01

- `workspace-index.html` is the module index shell listing available workspaces.
- `workspace-workbench.html` is the module detail shell for one workspace.
- Both pages intentionally delegate data loading and rendering to `buffaly-workspace-module.js` so the route shell stays small and portable.


## 2026-11-25 — Retire the unused Workspace package
Preserved this original package history while removing all executable/compressed payloads, the module manifest and catalog membership to match the retired owning source. Source data and installed files are untouched. Validation: retirement regression4/4 and canonical version/hash checks pass; no package/profile depends on the retired identity. No deployment or phone-latency cure is claimed.
