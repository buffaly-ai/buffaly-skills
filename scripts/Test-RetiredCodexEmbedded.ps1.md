# Test-RetiredCodexEmbedded.ps1 history

## 2026-11-20 - Enforce the retired WebModule boundary

Added offline typed-identity checks that WebModule/CodexEmbedded is absent from the catalog, package directory, both installer profiles and all seven core/recommended lock files, while independent Skill/Codex remains. Each lock is recomputed through New-ExtensionProfileLock and compared byte-for-byte, reusing its authoritative membership, ordering and hash rules. The six active platform locks and legacy recommended lock were generated against metadata commit ec20d4bbf605c86b82b45d3198d993272b441451. Actual run passed all assertions. No runtime, installation, network provider or process operation is invoked. Repository package validation passed 119/119 with 691 warnings. These are source/distribution checks, not installed endpoint acceptance.
