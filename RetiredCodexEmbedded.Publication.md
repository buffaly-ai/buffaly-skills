# CodexEmbedded WebModule retirement

## 2026-11-20 - Withdraw the retired adapter from local distribution metadata

Matt requested removing the Codex web module after retiring the separate core replay viewer and embedded Codex editing/sub-agent tools. Owning source is buffaly-codex-embedded/Buffaly.CodexEmbedded.WebModule, removed in 8a077e7f06994814a6fa8aa394b83577efcfa4d9. May companion history records intentional start/status supervision, HTTP/WebSocket proxy and landing-page integration; it was reachable, not proven dead.

Removed the exact WebModule/CodexEmbedded 0.1.300 catalog entry and its four-file package payload (assembly, dependencies, manifest and settings). Removed only that typed identity from core/recommended profiles and their exact-membership validator. This is deliberate package retirement metadata cleanup, not hand-editing a compiled payload or replacing an installed module. The independent Skill/Codex, model/provider, account lookup, standalone harness and saved histories remain. Policy protections against stopping old processes are retained.

Actual validation before metadata commit: both profile validations passed; parent/current semantic comparisons confirm all other catalog entries and profile identities/platforms unchanged; Test-ExtensionRepository passed all 119 remaining packages with 691 warnings; git diff --check passed. Target locks, including the legacy unsuffixed recommended lock, will be generated from the committed metadata in a follow-up manifest batch. Their results will be appended here.

The work is local source/distribution preparation only. No remote push, package installation, installer build, staging/Matt-local mutation, provider request, database change or process restart was performed. Installed copies are not uninstalled by removing catalog membership and require a separately authorized release/uninstall operation.

## 2026-11-20 - Regenerate target and legacy locks from committed metadata

Generated all six platform locks and the stale unsuffixed recommended lock through scripts/New-ExtensionProfileLock.ps1 using metadata commit ec20d4bbf605c86b82b45d3198d993272b441451. No generated lock was hand-edited. scripts/Test-RetiredCodexEmbedded.ps1 passed: catalog/payload/profile/lock absence, retained Skill/Codex and byte-for-byte canonical regeneration of all seven locks.

The six active target locks lose only WebModule/CodexEmbedded in membership: core Windows 50 to 49, core Linux/Mac 48 to 47, recommended Windows 62 to 61 and Linux/Mac 55 to 54. Existing pins reconcile to the unchanged current catalog: 44 core Windows entries, 42 per core Linux/Mac, zero recommended Windows and one per recommended Linux/Mac (Antigravity 0.1.38 to 0.1.40). The long-stale legacy recommended lock is also reconciled to its current approved Windows profile: it loses CodexEmbedded, gains the already-approved Antigravity and DispatchTreeViewer identities missing from that old snapshot, and refreshes 53 existing entries. No additional profile selections or payloads were authored. Exact per-entry deltas are preserved in the source session artifact codex-webmodule-lock-deltas.json.

Actual checks: seven generator runs passed, seven deterministic lock comparisons passed, sole-removal membership checks passed for the six active target locks, and the legacy membership delta was separately reconciled against the approved profile. A first generic sole-removal assertion correctly rejected the stale legacy lock because of its two already-approved missing members; it was not treated as passing. Full package validation remains 119/119 with 691 warnings. This local preparation has not been pushed, published, built into an installer, installed or restarted.
