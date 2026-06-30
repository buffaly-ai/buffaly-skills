## Split check-ins page fix
- Aligned element IDs with the dedicated check-ins JavaScript and separated script tags for cleaner loading.


## Shared script cleanup (2026-05-07)
- Added the shared code reviews common script before the check-ins page script and removed extra shared Buffaly scripts that required jQuery.

- 2026-05-07: Refined navigation/cards, normalized displayed paths, added CodeMirror read-only diff rendering, aggregate diff summary, and binary-file sorting for the initial code review browser.
- 2026-05-20: Added a branch selector to the check-ins page so recent commits can be loaded from any local or remote branch without checking out the branch.
- 2026-05-20: Changed the CodeMirror stylesheet link to a module-relative path so the page works both as a standalone WebHarness root page and when installed under `/web-modules/CodeReviews/`.

## Phase 1 Agent Review Client Cache Bust (2026-06-30)
- Updated check-ins page script versions so the new agent review badge renderer and JsonWs client methods load after deployment.
