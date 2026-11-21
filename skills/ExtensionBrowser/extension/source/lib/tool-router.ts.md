# tool-router.ts history

## 2026-11-21 — Route explicit terminal paste through scoped injection
- Added handleTerminalPasteText and terminal_paste_text dispatch through the existing executeInjectedDomOperation. Existing bound window, tab, Chrome document/frame preflight and pinned token validation remain unchanged. No main-world execution, arbitrary script or debugger fallback.
- Terminal tool log arguments omit the text payload; operation receipts contain lengths/identity and unverified dispatch, not terminal text. Ordinary form handling is unchanged.
- Validation: full npm release:check passed TypeScript,38 executable contracts,page-context tests,old pointer baseline and141 Chrome DOM assertions,build,ZIP,production audit0. This validates source/fixtures, not installed MV3 or actual CloudShell consumer delivery.
