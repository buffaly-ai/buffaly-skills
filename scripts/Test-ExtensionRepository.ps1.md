# Test-ExtensionRepository.ps1

## 2026-07-30 Mandatory ClaudeCode release regression evidence
- Full repository and installer-facing validation require production `ToRunClaudeCodeStateScopingRegression` evidence bound to the exact ClaudeCode package version and normalized `index.pts` SHA-256.
- Ordinary single-package inspection can omit the live evidence unless explicitly run with `-RequireClaudeCodeRuntimeRegression`.
- `-SkipReleaseRuntimeRegression` is an explicit developer-only repository inspection escape hatch; release automation must not use it.
