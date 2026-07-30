# Test-ExtensionPackage.ps1

## 2026-07-30 Mandatory production evidence for release validation
- Corrected the optional-runtime policy after review showed that it allowed unattended repository and installer validation to pass after checking only package wiring.
- Added `-RequireClaudeCodeRuntimeRegression`, which accepts either a successful explicitly supplied live command or persisted passing evidence bound to the exact ClaudeCode version and normalized `index.pts` SHA-256.
- Missing, malformed, stale, mismatched, or failed evidence blocks release validation. An explicitly supplied live command remains authoritative and cannot be masked by recorded evidence.
- Ordinary single-package inspection remains available without a live runtime; full repository validation enables the production-evidence gate by default.

## 2026-07-30 Optional ClaudeCode live-runtime regression (superseded)
- The earlier warning-only behavior was too broad because full repository and installer validation used the same path.
- It is retained only for ordinary single-package inspection, not release validation.
