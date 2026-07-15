# Distribution profiles

`core-installer.profile.json` is the immutable core installer composition. `recommended-installer.profile.json` is the approved expanded composition. Indexes own versions, source paths, and hashes; profiles contain only typed identities and target applicability.

Generate a deterministic target lock with `pwsh ./scripts/New-ExtensionProfileLock.ps1 -ProfilePath ./profiles/<profile>.profile.json -TargetPlatform windows -RepositoryCommit <40-character-commit>`. Use `-ValidateOnly` to validate without writing. The default output name follows the validated profile ID. Identical metadata and inputs produce identical lock bytes. Package ordering and aggregate `Path:sha256` evidence use ordinal string ordering before hashing UTF-8 bytes, so PowerShell and .NET verifiers use one language-independent contract.

Only `windows`, `linux`, and `mac` are valid platform values. In core, `Desktop` and `VisualStudio` are Windows-only; in recommended, `Desktop` is Windows-only. `IsDefaultPackage` is forbidden; membership is expressed only by named profiles.
