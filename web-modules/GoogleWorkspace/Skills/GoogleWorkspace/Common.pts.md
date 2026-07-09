# History

## 2026-04-21
- Simplified shared Google Workspace ProtoScript helpers to only keep cross-file imports and scope normalization.
- Removed misleading `To*` helper names for non-action internal helpers from `Common.pts`.
- Shifted application-name and account-key-normalization helpers into `GoogleWorkspaceService.pts` for service-local organization.
- Removed misleading non-action ToGoogleWorkspaceApplicationName and ToResolveGoogleWorkspaceAccountKey helpers from Common.pts; Common.pts now only holds shared scope normalization and imports.
