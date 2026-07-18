# Create a package-managed Buffaly WebModule

1. Resolve and edit the owning source repository, never `buffaly-skills` or an installed package copy. Read applicable `AGENTS.md` and neighboring module patterns.
2. Define the current `IBuffalyWebModule` startup contract without adding code to `Buffaly.Agent.Host` or `buffaly.agent.web` unless explicitly approved.
3. Add module-owned `web-module.json`, runtime assemblies/generated service artifacts, dependencies, pages, and intentional `ProjectArtifacts`.
4. Put owned static files under module `wwwroot`; installed assets map to `/web-modules/<Module>` only after startup reads the manifest.
5. Add build/package behavior and tests for manifest shape, registration, and representative routes/services.
6. Build, test, update `.cs.md`, commit the owning source batch, and report what remains before publication.
7. Use the publication workflow for catalog, package index, version, profile/lock, and Remote work; source presence alone is not package inclusion.
