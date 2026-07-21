# Workspace/index.pts

- Added package-owned WorkspaceSkill source.
- Public current-session actions use `_opsAgent.GetCurrentSessionDirectory()` and `_opsAgent.GetSessionKeyOrEmpty()` so callers do not supply session identity.
- Shared artifact actions delegate to the standalone `Buffaly.Agent.Workspaces` library.
- Agent-facing list actions return deterministic text reports, while the UI and internal C# library retain typed collections; this keeps generic `List<T>` types entirely off the package-managed ProtoScript boundary.
