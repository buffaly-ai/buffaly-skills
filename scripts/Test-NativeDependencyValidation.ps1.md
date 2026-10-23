# Native dependency validation regressions

## 2026-10-23
Exercise the public Test-ExtensionPackage.ps1 entry point in independent PowerShell7 processes against synthetic hashed package indexes. Temporary fixtures are removed in finally; optional EvidenceDirectory retains result receipts outside the repository. No installed or production files are touched.

Fifteen cases cover native-only success, mixed managed/native completeness, RID-resolved flattened assets, nested deps location, optional debug symbols, symbols not replacing executable assets, absent/unindexed/native disk files, wrong RID with identical basename, hash corruption, and preservation of managed-only rejection behavior. Initial fixture hash incorrectly retained CRLF unlike repository text hashing; corrected fixture text before the successful run. Initial null-array counting classified absent native sections as native-bearing; regression caught and corrected that condition before delivery.

Actual validation:15/15 passed; actual CodeReviews package passed; full117-package repository validation passed with the canonical SkipReleaseRuntimeRegression mode. This validates package metadata/assets, not Skia rendering or installed staging operation.
