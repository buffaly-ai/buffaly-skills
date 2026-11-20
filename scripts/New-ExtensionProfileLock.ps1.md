# Lock generator history

## 2026-11-16 — Antigravity provider in standard baselines
Added Buffaly.Provider.Antigravity to the exact ProviderModule membership for both core-installer and recommended-installer. Matt directed that the provider ship with the standard installation, including Matt's. Its platform falls under the existing all-three-platforms rule. No other membership, exclusion or platform logic changed. Six core and recommended platform locks were regenerated, and both profiles' ValidateOnly checks pass. Test-RetiredComputerUse.ps1 and Test-ExtensionRepository.ps1 (120/120) pass.

## 2026-11-03 — Windows DispatchTree contract dependency
Added DispatchTreeViewer to recommended-installer exact WebModule membership and its Windows-only platform contract; removed the historical exclusion. DispatchTree 0.1.38 imports CLR contracts supplied by Viewer 0.1.175, so a script-only installer baseline is incomplete. Core profile and Linux/Mac membership are unchanged. Regeneration of Windows/Linux/Mac recommended locks passed; Windows selects the exact pair and all three reconcile the already-published CodeReviews 0.1.483. Package build acceptance and installed runtime behavior are separate, not inferred from lock generation.

## 2026-10-17 — Retired paid ComputerUse WebModule distribution
Removed only WebModule/ComputerUse package/index and core/recommended selections; normal Skill/ComputerUse and Desktop remain. The source runner/workbench is deleted, so keeping stale published payload or profile selection would reinstall paid legacy code. Updated exact profile membership checks and regenerated target locks through owning generator; no pinned SQL or provider behavior changed. Added Test-RetiredComputerUse.ps1 typed-identity assertions. Nine profile/platform generations and focused retirement regression passed. Initial assertion used wrong SkillId field; corrected to canonical SkillName before validation. No Mac/Linux deployment or installed mutation is implied.

## 2026-11-20 - Retire CodexEmbedded WebModule membership

Removed CodexEmbedded from both core and recommended exact WebModule membership lists to implement Matt's explicit retirement decision. No Skill or ProviderModule membership, platform rules, hashes or serialization contracts change. Actual validation: both canonical profile validations passed, semantic profile/catalog checks show only the intended WebModule removal, and Test-ExtensionRepository passed 119/119 with 691 warnings. Target/legacy-lock regeneration follows against the committed metadata and is documented with its actual results in the manifest batch. No release, installed change or process operation was performed.
