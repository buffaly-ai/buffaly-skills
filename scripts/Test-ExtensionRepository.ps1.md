# Test-ExtensionRepository.ps1

## 2026-07-30 Forward the trusted runtime runner
- Added `-ClaudeCodeRuntimeRegressionCommand` and forward it to ClaudeCode package validation so repository-wide release validation can execute the trusted external runner.
- Default release validation fails closed when no runner is configured; repository files cannot satisfy the production execution gate.

## 2026-07-30 Mandatory ClaudeCode release regression evidence
- Superseded: repository-editable evidence is no longer accepted as proof of production execution.
- Ordinary single-package inspection can omit the live evidence unless explicitly run with `-RequireClaudeCodeRuntimeRegression`.
- `-SkipReleaseRuntimeRegression` is an explicit developer-only repository inspection escape hatch; release automation must not use it.
