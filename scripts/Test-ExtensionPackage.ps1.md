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

## 2026-10-23 — Validate native-bearing dependency assets instead of package-name DLLs
- Build1331 exposed a false failure for CodeReviews0.1.449: SkiaSharp.NativeAssets.Win32/macOS are NuGet package names, not managed assembly names. Resolve the exact name/version entry in the same deps target when it declares native assets; require published runtime/native files relative to the deps file, preserving RID paths for runtimeTargets and flattened paths for resolved runtime/native entries. Mixed packages also require their managed runtime assets.
- Preserve managed-only/core-provided/framework policies, indexed-file existence and SHA256 checks. Missing unindexed or wrong-RID native assets fail. NuGet _._ placeholders and optional .pdb debug symbols are not executable dependencies; the owning ExtensionPublishingService already deliberately excludes .pdb in its file manifests (lines881/962). No package-specific allowlist, fabricated files, payload edits or validation-gate suppression.
- Actual validation: 15 public-process fixture cases passed (native-only, mixed, resolved, nested, missing, unindexed, wrong-RID, corrupt and symbol exclusions); actual CodeReviews validation passed; full repository validation117/117 passed using the existing canonical SkipReleaseRuntimeRegression mode. Existing framework/unindexed warnings remain. Failed1331 is unchanged; successor build/deployment recorded separately.
