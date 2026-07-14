# History

## 2026-04-21
- Added `GoogleWorkspaceService : Service` as the Google Workspace ProtoScript service boundary for OpsAgent.
- Moved internal helper logic for Google Workspace application naming and account-key normalization into the service for clearer organization.
- Kept Google Workspace service initialization responsible for passing feature-backed config into the C# service host.
- Moved non-action Google Workspace helper logic into the service prototype and renamed helpers to plain internal names (GetGoogleWorkspaceApplicationName, NormalizeGoogleWorkspaceAccountKey) instead of misleading To* action-style names.

## 2026-06-01
- Changed `Initialize()` to call `GoogleWorkspaceServiceHost.Initialize(...)` with the feature-backed `ClientId`, `ClientSecret`, `RedirectUri`, and application name explicitly.
- This avoids relying on `InitializeFromFeature()` desktop-mode fields that are not exposed through the ProtoScript-imported feature wrapper, while preserving the existing feature-backed configuration path.
- Follow-up: reverted `Initialize()` to the module-owned `GoogleWorkspaceServiceHost.InitializeFromFeature()` path after `Common.pts` was migrated to import the module-owned `Buffaly.GoogleWorkspace.Storage.GoogleWorkspaceSecretsFeature` type.
