# Distribution profiles

`core-installer.profile.json` is the authoritative installer composition. Indexes own versions, source paths, and hashes; profiles contain only typed identities and target applicability.

Generate a deterministic target lock with `pwsh ./scripts/New-ExtensionProfileLock.ps1 -TargetPlatform windows -RepositoryCommit <40-character-commit>`. Use `-ValidateOnly` to validate without writing. Identical metadata and inputs produce identical lock bytes.

Only `windows`, `linux`, and `mac` are valid platform values. `Desktop` and `VisualStudio` are deliberately Windows-only. `IsDefaultPackage` is forbidden; membership is expressed only by named profiles.
