# Recommended installer profile

## 2026-10-08 Windows ErrorLogDispatch dependency closure
- Matt authorized adding the existing DispatchTree skill to the Windows distribution and finishing isolated headless acceptance, with production untouched.
- Build 1160's global ErrorLogDispatch actions inherit DispatchAgentCuratedActionRoot, but the prior profile omitted its DispatchTree Contracts.pts provider. Ordinary eager initialization failed; working Matt-local carries that existing skill. Add Windows-only Skill/DispatchTree without altering either action implementation or adding the viewer UI. Linux/Mac membership is unchanged.
- Canonical one-package dry run reports DispatchTree 0.1.36 current from owning buffaly-dispatch/src/DispatchTree.Skill; no payload rebuild or manual copy is needed. Lock generation, profile validation and local runtime acceptance results are recorded below after execution.
- Validation before commit: canonical New-ExtensionProfileLock generated and validated windows/linux/mac locks successfully after updating its exact membership/platform contract for Windows DispatchTree. Windows adds exactly one Skill/DispatchTree 0.1.36; Linux/Mac package membership is unchanged. Locks carry the changed shared profile hash. Candidate runtime acceptance remains pending and is not claimed by profile validation.
- Canonical lock regeneration also advances existing Linux/Mac package versions to current catalog identities (23 packages); their package IDs/platform selection are unchanged. This is lock reconciliation only, not a Linux/Mac build or deployment. Windows existing package versions remain unchanged.

## 2026-10-08 Include repaired ErrorLogDispatch in Windows release
- User explicitly requires the diagnostic provisioning repair included. Added the registered ErrorLogDispatch WebModule for Windows; Linux/Mac membership unchanged pending platform validation.
- xAI remains an existing provider member; Windows lock now selects verified local xAI0.1.95 and ErrorLogDispatch0.1.90. Owner repair tests12/12 and xAI suite88pass2skip passed before membership update. Lock generation/validation recorded with this batch.

`recommended-installer.profile.json` defines the approved expanded installer composition. It contains the recommended skills, web modules, and provider modules. `VoiceAgentDispatch` is included because the bundled realtime `voice-agent` profile uses `VoiceAgentAction` as its required semantic action root. `ComputerUse` and its Windows-only skill plus `DesktopViewer` are included so a new Windows install has the supported desktop interaction surface. `ExtensionBrowser` is included on every platform so each new Buffaly installation exposes the user-facing Buffaly Chrome Extension setup page and its origin-bound browser-agent package.

`OpenRouterCloud` and `Buffaly.Provider.OpenRouter` are included so a new install can register OpenRouter from Feature-admin and run `stealth/ox-alpha` without a later optional package add. The provider also belongs in `core-installer`; the live catalog web module follows the `OllamaCloud` recommended-only pattern.

`Desktop` is Windows-only. Every other member targets Windows, Linux, and Mac because the distribution indexes contain no stricter platform evidence.

The profile includes `OnlineSessionMemoryCritic` so thumbs-up memory attachment survives installer materialization. DispatchTree is included on Windows to supply ErrorLogDispatch's existing action-root contracts; it remains excluded on Linux/Mac. The profile deliberately excludes `Unity`, `DispatchTreeViewer`, `ActionLearningCoordinator`, `ReleaseOps`, `ExtensionPublishing`, `GoogleAds`, `OfflineOntologyCritic`, both `OpenAIAdmin` packages, and `FeedingFrenzy.WebPropertyEditorAgent`. VisualStudio is selected on Windows. Membership is explicit and does not derive from index defaults.
