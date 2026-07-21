# Recommended installer profile

`recommended-installer.profile.json` defines the approved expanded installer composition. It contains the recommended skills, web modules, and provider modules. `VoiceAgentDispatch` is included because the bundled realtime `voice-agent` profile uses `VoiceAgentAction` as its required semantic action root. `ActionLearningCoordinator` is included because the shared Session Work Coordinator workspace now hosts both the Action Learning and Ontology Foundry coordinator adapters and must survive startup reconciliation on installed instances.

`Desktop` is Windows-only. Every other member targets Windows, Linux, and Mac because the distribution indexes contain no stricter platform evidence.

The profile includes `OnlineSessionMemoryCritic` so thumbs-up memory attachment survives installer materialization. It deliberately excludes `VisualStudio`, `Unity`, `ExtensionPublishing`, and `FeedingFrenzy.WebPropertyEditorAgent`. Membership is explicit and does not derive from index defaults.
