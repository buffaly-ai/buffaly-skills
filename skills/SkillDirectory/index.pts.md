# SkillDirectory/index.pts

## 2026-08-07 Lazy sidecar generation and skill publication

- Added `ToGenerateLazySkillIndex` as the independently callable validation/generation operation. `writeSidecar=false` performs a non-mutating compile check; `writeSidecar=true` writes `index.pts.lazy.json` only after successful validation.
- Added `ToPreviewPublishSkillToBuffalySkillRepository` and `ToPublishSkillToBuffalySkillRepository` as separate repository-publication operations with explicit replace, commit, and push choices.
- These actions call the typed SkillManagement facade in-process. They do not guess JsonWs routes or duplicate compiler/publisher behavior in ProtoScript.
- Generation, publication, package installation, and runtime reset remain separate lifecycle steps. Publishing does not install a package, and resetting a runtime does not generate a sidecar.

## 2026-07-22 Installed extension update actions

- Added package-directory actions that belong to the existing Skill Management/Skill Directory surface rather than Extension Publishing: `ToPreviewInstalledBuffalyExtensionUpdates`, `ToUpdateInstalledBuffalyExtensions`, `ToPreviewBuffalyExtensionProfileUpdate`, and `ToUpdateBuffalyExtensionProfile`.
- These actions call `Buffaly.Agent.SkillManagement.PackageDirectoryService` through internal JsonWs and reuse existing package receipts, source selection, profile, and pre-start lifecycle rules.
- `ToUpdateInstalledBuffalyExtensions` is the executable agent route for natural-language requests like "update all installed Buffaly extensions"; callers should use `dryRun=true` first and set `allowPreStartInstall=true` only during a controlled stopped-instance update.

## Purpose
Defines the OpsAgent SkillDirectory skill and thin ProtoScript actions for official remote skill directory operations.

## Design
- Reuses the existing `Buffaly.Agent.SkillManagement.SkillDirectoryService` JsonWs service as the source of truth.
- Keeps ProtoScript as pass-through glue only: search/list, get/detail, preview install, and explicit install.
- Does not duplicate package validation, DLL support, replacement rules, or enablement behavior; those remain in the SkillManagement C# service.

## Validation
- 2026-06-01: `ToCompileProtoScriptProject` succeeded after adding this skill.
- 2026-06-01: Semantic discovery found `ToSearchBuffalySkillDirectory`, `ToGetBuffalySkillDirectoryEntry`, `ToPreviewBuffalySkillDirectoryInstall`, and `ToInstallBuffalySkillFromDirectory`.
- 2026-06-01: Staging SkillManagement JsonWs service listed official skills, previewed `TailscaleExposure`, and installed it into the staging OpsAgent Skills folder without enabling/executing it.
