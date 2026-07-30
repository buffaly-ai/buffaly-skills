# Test-ExtensionPackage.ps1

## 2026-07-30 Bind production execution to the exact candidate
- The validator now supplies the candidate package root, version, normalized `index.pts` SHA-256, and a one-time challenge to the trusted runtime command through dedicated environment variables.
- A successful runner must load the supplied candidate root and report its independently observed version/hash plus the challenge. Generic, replayed, or mismatched PASS output fails validation.
- This prevents an installed ClaudeCode runtime from certifying different candidate bytes merely because its production regression passes.

## 2026-07-30 Trusted live execution replaces repository self-attestation
- Removed acceptance of `validation-evidence/ClaudeCode.runtime-regression.evidence.json`; a contributor-controlled repository file cannot prove that production behavior executed.
- Release validation now requires a successful explicit command supplied through `-ClaudeCodeRuntimeRegressionCommand` or `BUFFALY_CLAUDECODE_RUNTIME_REGRESSION_COMMAND`.
- Missing and failing runners fail closed. Ordinary single-package inspection can still omit the production execution gate.

## 2026-07-30 Mandatory production evidence for release validation
- Superseded: repository-persisted evidence was subsequently rejected as editable self-attestation.
- Ordinary single-package inspection remains available without a live runtime; full repository validation enables the production-evidence gate by default.

## 2026-07-30 Optional ClaudeCode live-runtime regression (superseded)
- The earlier warning-only behavior was too broad because full repository and installer validation used the same path.
- It is retained only for ordinary single-package inspection, not release validation.
