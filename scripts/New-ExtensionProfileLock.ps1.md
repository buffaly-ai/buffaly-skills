# Lock generator history

## 2026-10-17 — Retired paid ComputerUse WebModule distribution
Removed only WebModule/ComputerUse package/index and core/recommended selections; normal Skill/ComputerUse and Desktop remain. The source runner/workbench is deleted, so keeping stale published payload or profile selection would reinstall paid legacy code. Updated exact profile membership checks and regenerated target locks through owning generator; no pinned SQL or provider behavior changed. Added Test-RetiredComputerUse.ps1 typed-identity assertions. Nine profile/platform generations and focused retirement regression passed. Initial assertion used wrong SkillId field; corrected to canonical SkillName before validation. No Mac/Linux deployment or installed mutation is implied.
