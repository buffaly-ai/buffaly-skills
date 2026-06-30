# Teams.pts`r`n

## 2026-06-27

- Removed unused PowerShell JSON-filter helper functions from the Teams skill. The skill now keeps Teams actions as thin C# facade calls and no longer declares the generic ToEscapeForSingleQuotedPowerShell helper that collided with other ProtoScript functions.

