# Test-ExtensionRepository.ps1

## 2026-07-30 Make ClaudeCode runtime validation explicitly opt-in
- Ordinary repository and installer validation no longer runs the ClaudeCode live-runtime regression by default; ClaudeCode is not a canonical installer release gate.
- Added `-RequireClaudeCodeRuntimeRegression` for deliberate ClaudeCode-specific release testing. The existing trusted-runner identity checks remain authoritative when that switch is selected.
- Retained `-SkipReleaseRuntimeRegression` for compatibility with existing developer invocations, but it is no longer needed to make ordinary repository validation independent of ClaudeCode runtime availability.

## 2026-07-30 Forward the trusted runtime runner
- Added `-ClaudeCodeRuntimeRegressionCommand` and forward it to ClaudeCode package validation so repository-wide release validation can execute the trusted external runner.
- Superseded: ClaudeCode-specific validation still fails closed when explicitly requested without a runner, but ordinary repository validation does not request it.

## 2026-07-30 Mandatory ClaudeCode release regression evidence
- Superseded: repository-editable evidence is no longer accepted as proof of production execution.
- Ordinary single-package inspection can omit the live evidence unless explicitly run with `-RequireClaudeCodeRuntimeRegression`.
- Superseded: ordinary release automation no longer enables this ClaudeCode-specific runtime regression unless explicitly requested.
