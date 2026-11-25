# Optional direct-Codex baseline retirement — 2026-11-25

Matt approved the project-boundary audit's retirement of the remaining direct-Codex wrapper and optional skill. Core source retirement is committed as 20cc97cb503cd3d78068cc2cd84f3b1301ca134e. The source publication recipe was removed in scripts 2b09ad996a0088483e1852f21f7f86aa4c0937ac. ReleaseOps admission then correctly exposed stale Skill/Codex selection in recommended-installer; this is not a reason to restore the retired workflow.

## Owning metadata change

Commit 0a9977dec4465b7285252e8e649683112f1511fc removes only Skill/Codex from both core/recommended profiles and their exact-membership generator requirements. The existing regression now requires the optional skill absent from baselines and locks, while preserving the earlier retired WebModule/CodexEmbedded absence and historical Skill/Codex catalog availability. This is repository metadata cleanup, not a package refresh or an installed uninstall. Normal Codex model transport, compaction, settings/credits and advisory reviewer remain unchanged.

## Generated manifest receipt

All seven core/recommended target and legacy locks were generated through scripts/New-ExtensionProfileLock.ps1 with explicit RepositoryCommit 0a9977dec4465b7285252e8e649683112f1511fc. No lock JSON was hand-edited. Membership in every lock loses exactly Skill/Codex, gains nothing else, and preserves every retained identity.

| Lock | Count before → after | Retained entries reconciled to existing index |
|---|---|---|
| Core Windows | 49 → 48 | 43 |
| Core Linux/Mac, each | 47 → 46 | 41 |
| Recommended Windows | 61 → 60 | 0 |
| Recommended Linux/Mac, each | 54 → 53 | 47 |
| Legacy recommended Windows | 61 → 60 | 51 |

The old locks pin older catalog snapshots. Canonical regeneration reconciles retained versions/hash evidence to the existing committed catalog; it does not author or publish those packages. In particular, the affected recommended Windows admission has no retained package-entry change. Full per-entry deltas are preserved in the source session artifacts/project-boundary-implementation/installer-lock-deltas.json.

## Actual validation and boundaries

- Six canonical profile/platform validations and semantic sole-selection-removal comparisons passed. Six negative cases reinserting Codex were rejected by the exact-membership owner.
- Test-RetiredCodexEmbedded.ps1 passed all seven byte-for-byte regenerations from their pinned committed inputs, not a moving current catalog.
- Test-ExtensionRepository.ps1 -SkipReleaseRuntimeRegression passed 119/119 packages, zero failures and 690 existing warnings. Live-runtime regression was deliberately skipped. Its JsonOutput option also emitted a text preamble, so the captured log is correctly retained as .txt rather than claimed as parseable JSON.
- No skill/WebModule/Provider payload or either package index changed. No remote push/publication, Prepare All, installer allocation/build, staging/Matt activation, database operation or process restart was performed. ReleaseOps retains sole ownership of subsequent admission, publication and release serialization; no preflight success or deployment acceptance is claimed here.
