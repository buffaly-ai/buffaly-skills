# Chrome extension version configuration history

## 2026-11-02 — Release repaired DOM operations as 0.2.65
- Changed only manifest.version from0.2.64 to0.2.65, synchronized with package.json and package-lock.json. This makes the pointer-events and subsequent DOM robustness repairs from ab50d55 and449afb7 distinguishable from the older0.2.64 download. Permissions, CSP, host access and debugger consent remain unchanged.
- Validation: npm ci and full npm run release:check passed: TypeScript,18 argument-contract checks,page-context suite,old-guard baseline,29+56 real Chrome assertions,build,ZIP manifest verification and production audit0. WebModule contract tests and publish build passed with exact0.2.65 ZIP/hash pins. Existing18 dev dependency audit findings and3 nullable warnings remain; no dependency upgrades or browser/live-account actions.
