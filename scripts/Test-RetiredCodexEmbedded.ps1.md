# Test-RetiredCodexEmbedded.ps1 history

## 2026-11-20 - Enforce the retired WebModule boundary

Added offline typed-identity checks that WebModule/CodexEmbedded is absent from the catalog, package directory, both installer profiles and all seven core/recommended lock files, while independent Skill/Codex remains. Each lock is recomputed through New-ExtensionProfileLock and compared byte-for-byte, reusing its authoritative membership, ordering and hash rules. The six active platform locks and legacy recommended lock were generated against metadata commit ec20d4bbf605c86b82b45d3198d993272b441451. Actual run passed all assertions. No runtime, installation, network provider or process operation is invoked. Repository package validation passed 119/119 with 691 warnings. These are source/distribution checks, not installed endpoint acceptance.

## 2026-11-20 - Verify pinned inputs rather than moving catalog HEAD

An unrelated concurrent publication 0f4d92673 advanced OfflineOntologyCritic from 0.1.171 to 0.1.172 after the first passing run. The original regression incorrectly recomputed the saved lock against moving current catalog contents and then failed core Linux reproducibility. Corrected the test to read the two indexes and two profiles from each lock's exact RepositoryCommit via local git objects into a unique disposable metadata-only fixture. It invokes the existing canonical generator with those pinned inputs and deletes only its own temporary fixture in finally. No alternate publishing repository, worktree, network fetch, lock edit or unrelated package selection is introduced.

Actual validation: revised regression passes all seven byte-for-byte pinned reproductions against ec20d4bbf605c86b82b45d3198d993272b441451 despite the later unrelated publication; current catalog/profile absence and independent Skill/Codex assertions also pass; git diff --check passes. This tests immutable lock evidence, not current-catalog freshness for a future release. No installed, process or publication behavior was exercised.

## 2026-11-25 — Enforce the later optional-skill baseline retirement
- The approved project-boundary cleanup now retires Skill/Codex source as well as the earlier WebModule. Change the earlier profile-retention assertion to require the skill absent from both baselines and all seven locks. Keep module absence, pinned-input recomputation and historical package-availability checks. Published skill payload/index stay unchanged; normal model transport is not a profile package and is verified in the source extraction tests.
- Actual validation before source commit: six canonical profile checks, sole-removal comparisons and six generator rejection cases pass. This seven-lock regression cannot pass until locks are generated from the committed changed metadata; its actual result is recorded in the subsequent manifest entry rather than claimed in advance. No runtime/network/install/process operation.

## 2026-11-25 — Seven pinned lock checks executed
- After canonical generation against 0a9977dec4465b7285252e8e649683112f1511fc, this regression passes all seven pinned byte-for-byte lock comparisons and current profile/retired-module assertions. Every membership delta is exactly Skill/Codex removal; recommended Windows has no retained entry updates. Older baseline/legacy pins reconcile the unchanged index, recorded in RetiredOptionalCodex.Baseline.md.
- Static repository validation passes 119/119, zero failures, 690 existing warnings with release runtime regression explicitly skipped. No package payload/index, network provider, installed runtime, process or publication operation changed.
