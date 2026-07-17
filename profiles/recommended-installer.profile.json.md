# Recommended installer profile

`recommended-installer.profile.json` defines the approved expanded installer composition. It contains 32 skills, 14 web modules, and six provider modules.

`Desktop` is Windows-only. Every other member targets Windows, Linux, and Mac because the distribution indexes contain no stricter platform evidence.

The profile includes `OnlineSessionMemoryCritic` so thumbs-up memory attachment survives installer materialization. It deliberately excludes `VisualStudio`, `Unity`, `ExtensionPublishing`, and `FeedingFrenzy.WebPropertyEditorAgent`. Membership is explicit and does not derive from index defaults.
