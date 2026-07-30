# Test-ExtensionPackage.ps1

## 2026-07-30 Optional ClaudeCode live-runtime regression
- ClaudeCode package validation continues to run its packaged static/state-scoping regression.
- The external live-runtime command is optional: absence records an explicit warning instead of blocking the entire extension repository or installer build.
- When a command is explicitly supplied, it remains authoritative and must exit successfully with the expected `PASS: ClaudeCode state scoping regression` output.
