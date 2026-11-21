# Chrome extension version configuration history

## 2026-11-21 — Allocate 0.2.67 for reviewed select presentation repair
- Synchronized package/lock/manifest versions to distribute ed01a74 without replacing the published0.2.66 bytes. No permissions or dependency changes.
- Full0.2.67 release gate passes38 argument contracts,29 pointer+140 matrix assertions,old-guard control,page-context bridge,TypeScript,build,ZIP verification and production audit0. This allocates a distribution identity; installed activation and business-page acceptance remain separate.

## 2026-11-21 — Allocate 0.2.66 for styled selects and terminal dispatch
- Synchronized manifest.version, package.json and package-lock.json without dependency or permission changes; avoids overwriting released0.2.65 with different bytes.
- Full release:check passes38 argument contracts,141 Chrome DOM assertions,page context,TypeScript,build,ZIP verification and production audit0. Installed/live behavior remains separate acceptance.

## 2026-11-02 — Release repaired DOM operations as 0.2.65
- Changed only manifest.version from0.2.64 to0.2.65, synchronized with package.json and package-lock.json. This makes the pointer-events and subsequent DOM robustness repairs from ab50d55 and449afb7 distinguishable from the older0.2.64 download. Permissions, CSP, host access and debugger consent remain unchanged.
- Validation: npm ci and full npm run release:check passed: TypeScript,18 argument-contract checks,page-context suite,old-guard baseline,29+56 real Chrome assertions,build,ZIP manifest verification and production audit0. WebModule contract tests and publish build passed with exact0.2.65 ZIP/hash pins. Existing18 dev dependency audit findings and3 nullable warnings remain; no dependency upgrades or browser/live-account actions.
