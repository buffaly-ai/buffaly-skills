# Publish a Buffaly extension

- The only Local publication repository is `C:\dev\buffaly-ai\buffaly-skills`; the only catalog is `C:\dev\buffaly-ai\scripts\extension-publishing.catalog.json`. Never create alternate catalogs or publication repositories.
- Resolve package ID/type and owning source. Ensure one typed catalog entry with an intentional `DefaultPublish` value. `DefaultPublish` means selected by Defaults, not installed by default.
- Preview/build and review exact added, changed, removed, ignored, and missing files.
- Publish through Extension Publishing's authoritative reconciliation engine. Copy only indexed files; increment version only for payload changes; validate all final hashes and `ProjectArtifacts` shape.
- Update typed profile and platform locks only when installer membership is requested.
- Commit only package/index/profile changes. Promote Remote by pushing the exact validated canonical commit; never rebuild during promotion.
- Report Local/Remote commit and version status plus package-scoped failures. Installation is a separate operation.
