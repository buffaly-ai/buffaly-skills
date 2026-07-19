# Publish or promote a Buffaly extension

1. Resolve the exact package ID/type and owning source. Refuse publication when the only material is an installed Matt/staging payload, generated `bin/obj`, backup, or temporary recovery folder; recover or establish the source owner first.
2. Verify exactly one catalog entry in `C:\dev\buffaly-ai\scripts\extension-publishing.catalog.json` and the sole canonical Local repository `C:\dev\buffaly-ai\buffaly-skills`. `DefaultPublish` controls the Defaults publisher selector only.
3. Build and preview with the shared Extension Publishing engine. Preferred operator surface:
   - one package dry run: `Publish-ExtensionCatalog.ps1 -Id <Id> -Type <Type> -DryRun`
   - one package Local publish: `Publish-ExtensionCatalog.ps1 -Id <Id> -Type <Type> -Commit`
   - changed catalog packages: `Publish-ExtensionCatalog.ps1 -AllStale -Commit`
   - exact Local-to-Remote promotion: `Publish-ExtensionCatalog.ps1 -Id <Id> -Type <Type> -Target Remote -Commit -Push`
   Use the Extension Publishing page for visible package progress/retry/cancellation; both surfaces must use the same reconciliation engine.
4. Review exact added/changed/removed/ignored/missing files. Publish only indexed files, increment version only when payload changes, regenerate the correct index, and validate final normalized hashes plus `ProjectArtifacts` (`[]`, never `[null]`).
5. Local publication and Remote promotion are separate states. Remote promotion pushes the exact validated canonical commit; it must not rebuild a different payload.
6. Profiles/platform locks are separate installer-membership changes. Installation and activation are separate Skill Management operations.
7. Report source commit, Local package version/commit, Remote parity/push, profile membership, and any package-scoped failures independently.
