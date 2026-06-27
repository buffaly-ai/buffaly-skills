## Split diff page fix
- Aligned element IDs with the dedicated diff JavaScript and separated script tags for cleaner loading.


## Shared script cleanup (2026-05-07)
- Added the shared code reviews common script before the diff page script and removed extra shared Buffaly scripts that required jQuery.

- 2026-05-07: Refined navigation/cards, normalized displayed paths, added CodeMirror read-only diff rendering, aggregate diff summary, and binary-file sorting for the initial code review browser.
- 2026-05-20: Changed CodeMirror stylesheet and script references to module-relative paths so the diff page works both as a standalone WebHarness root page and when installed under `/web-modules/CodeReviews/`.

## Diff header and toolbar refinement (2026-05-21)
- Reworked the diff page header into repository/check-ins/diff breadcrumbs, changed Agent targets to a settings-styled link, added a check-in selector to the toolbar, and moved the session connection summary into the top card.

## Diff toolbar source/format fix (2026-05-21)
- Kept the toolbar as one visual card by removing nested card styling from its control groups.
