# Auth.pts Change History

## Route OAuth Users To Web Module First (2026-06-01)
- Clarified `ToCompleteGoogleWorkspaceAuthorization` as a low-level fallback for fresh callback state/code only.
- Added explicit `GoogleWorkspaceService.Initialize()` before the fallback completion action calls `GoogleWorkspaceServiceHost.CompleteAuthorizationAsync(...)` so direct action calls do not fail merely because the singleton service host was not initialized in that runtime.
- Design Decision: the Google Workspace web module accounts page is the normal user-facing OAuth flow; ProtoScript auth actions remain available for backup/diagnostic use.
