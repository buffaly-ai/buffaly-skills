# Recommended installer profile

`recommended-installer.profile.json` defines the approved expanded installer composition. It contains 34 skills, 14 web modules, and six provider modules. `VoiceAgentDispatch` is included because the bundled realtime `voice-agent` profile uses `VoiceAgentAction` as its required semantic action root.

`Desktop` is Windows-only. Every other member targets Windows, Linux, and Mac because the distribution indexes contain no stricter platform evidence.

The profile includes `OnlineSessionMemoryCritic` so thumbs-up memory attachment survives installer materialization. It deliberately excludes `VisualStudio`, `Unity`, `ExtensionPublishing`, and `FeedingFrenzy.WebPropertyEditorAgent`. Membership is explicit and does not derive from index defaults.
