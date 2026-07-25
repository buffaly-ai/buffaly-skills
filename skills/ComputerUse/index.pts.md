# ComputerUse skill

- Replaced detached runner/status/wait actions with ten app-aware Computer Use function actions matching the verified Codex Desktop/Sky surface.
- Each action is a thin wrapper over `Buffaly.DesktopAutomation.ComputerUseToolService` and reads the authoritative active semantic-tool session key from `ComputerUseToolService.GetCurrentSessionKey()` as the internal lease scope. This avoids nullable `_opsAgent` injection and keeps the session identifier out of the model-visible tool schema.
- `get_app_state` preserves the native structured screenshot-plus-accessibility return value for same-session model continuation.
- The model must call `get_app_state` before interaction; window leases retain exact identity across title changes.
