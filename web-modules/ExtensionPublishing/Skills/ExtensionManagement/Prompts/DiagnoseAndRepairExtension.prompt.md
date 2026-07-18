# Diagnose and repair extension state

Inspect in order: owning source; catalog; canonical Local payload/index/version/profile locks; Remote commit; receipt; installed payload; startup registration/logs/routes/tools.

- Hash mismatch: republish from owning source, regenerate/validate index, commit/push, then reinstall. Never bypass hashes.
- Missing or MigrationUnknown receipt: use package-management preview/repair; do not invent a version.
- PendingInstall: run controlled stopped-host update with pre-start enabled, then start and verify.
- Installed files but missing route/tool/provider: repair manifest, payload, dependencies, compatibility, or startup registration in source and republish.
- Keep failures package-scoped and verify cancellation/timeouts leave no child PowerShell, dotnet, or Git process.
- Direct installed-file copies are temporary diagnostics, never durable closure evidence. Do not disrupt Matt without approval.
