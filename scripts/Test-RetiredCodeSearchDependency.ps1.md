# Test-RetiredCodeSearchDependency.ps1 history

## 2026-11-20 — Exact retired-adapter dependency boundary
- Added isolated temporary package fixtures invoking the real `Test-ExtensionPackageInternal` validator without publishing packages or loading/executing DLLs. A plain-text `.dll` fixture tests structural file presence only.
- Cases: reject a missing CodeSearch dependency now that Host no longer provides it; accept a structurally self-contained legacy package; preserve the retained HTTP host-provided dependency rule. Temporary fixture files are cleaned in `finally`.
- Actual validation: 3/3 cases passed. Full offline catalog validation independently returned 118/119 packages passing, with the expected real EmailDispatch missing-CodeSearch release gate and 690 warnings. No finalized payload, index, installed package, runtime/provider request or publication was changed. The fixture does not certify executable binary compatibility or live release readiness.
