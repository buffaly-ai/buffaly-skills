# SkillDirectory/index.pts

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
