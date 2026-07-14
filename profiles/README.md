# Distribution profiles

`core-installer.profile.json` is the authoritative installer composition. Indexes own versions, source paths, and hashes; profiles contain only typed identities and target applicability.

Generate a deterministic target lock with `pwsh ./scripts/New-ExtensionProfileLock.ps1 -TargetPlatform windows -RepositoryCommit <40-character-commit>`. Use `-ValidateOnly` to validate without writing. Identical metadata and inputs produce identical lock bytes. Aggregate package content hashes sort `Path:sha256` evidence with ordinal string ordering before hashing UTF-8 bytes, so PowerShell and .NET verifiers use one language-independent contract.

Only `windows`, `linux`, and `mac` are valid platform values. `Desktop` and `VisualStudio` are deliberately Windows-only. `IsDefaultPackage` is forbidden; membership is expressed only by named profiles.
