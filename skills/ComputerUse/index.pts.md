# ComputerUse skill

- Replaced detached runner/status/wait actions with ten app-aware Computer Use function actions matching the verified Codex Desktop/Sky surface.
- Each action is a thin wrapper over `Buffaly.DesktopAutomation.ComputerUseToolService` and reads the current Buffaly session directory from its injected action `_opsAgent` instance as the internal lease scope. Do not route session lookup through a global ProtoScript helper because global helper evaluation does not receive the action instance context.
- `get_app_state` preserves the native structured screenshot-plus-accessibility return value for same-session model continuation.
- The model must call `get_app_state` before interaction; window leases retain exact identity across title changes.
