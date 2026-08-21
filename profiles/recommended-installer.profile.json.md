# Recommended installer profile

`recommended-installer.profile.json` defines the approved expanded installer composition. It contains the recommended skills, web modules, and provider modules. `VoiceAgentDispatch` is included because the bundled realtime `voice-agent` profile uses `VoiceAgentAction` as its required semantic action root. `ComputerUse` and its Windows-only skill plus `DesktopViewer` are included so a new Windows install has the supported desktop interaction surface. `ExtensionBrowser` is included on every platform so each new Buffaly installation exposes the user-facing Buffaly Chrome Extension setup page and its origin-bound browser-agent package.

`Desktop` is Windows-only. Every other member targets Windows, Linux, and Mac because the distribution indexes contain no stricter platform evidence.

The profile includes `OnlineSessionMemoryCritic` so thumbs-up memory attachment survives installer materialization. It deliberately excludes `VisualStudio`, `Unity`, `DispatchTree`, `DispatchTreeViewer`, `ActionLearningCoordinator`, `ReleaseOps`, `ExtensionPublishing`, `GoogleAds`, `OfflineOntologyCritic`, both `OpenAIAdmin` packages, and `FeedingFrenzy.WebPropertyEditorAgent`. Membership is explicit and does not derive from index defaults.
