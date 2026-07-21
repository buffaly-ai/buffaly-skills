# Workspace/index.pts

- Added package-owned WorkspaceSkill source.
- Public current-session actions use `_opsAgent.GetCurrentSessionDirectory()` and `_opsAgent.GetSessionKeyOrEmpty()` so callers do not supply session identity.
- Shared artifact actions delegate to the standalone `Buffaly.Agent.Workspaces` library.
- ProtoScript collection-returning actions expose the runtime-native `Collection` contract; the underlying C# library remains strongly typed and ProtoScript projects avoid generic `List<T>` type-identity conversion failures.
