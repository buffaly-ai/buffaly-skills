# index.html Change Notes

## Initial UI
- Added the standalone check-in browser page.

## Simplify repository navigation
- Changed the harness from a three-column dashboard to screen-style navigation: repository list first, then check-ins and diffs after selection.


## Remove Missing KCS Dependencies (2026-05-07)`n- Removed standalone harness script references to shared `/js/kcs` files because they are not served by this module.

## Standalone navigation cleanup
- Removed shared KCS script dependencies so the standalone harness does not request missing /js/kcs assets.

`n## Static Buffaly script includes`n- Restored shared Buffaly JavaScript includes through `//static.buffa.ly/v2/js/...` and kept the local harness script after the JsonWs stub.

## Static Buffaly shared scripts
- Restored the shared //static.buffa.ly/v2/js/... script references so the harness uses the standard Buffaly JavaScript stack instead of local copies.


## Restore shared Buffaly scripts (2026-05-07 14:47:50)
- Restored static.buffa.ly shared script includes so the harness uses the standard Buffaly JavaScript stack.

## Shared script cleanup (2026-05-07)
- Added the shared code reviews common script before the repositories page script and reduced shared Buffaly dependencies to the scripts this harness actually uses.

- 2026-05-07: Refined navigation/cards, normalized displayed paths, added CodeMirror read-only diff rendering, aggregate diff summary, and binary-file sorting for the initial code review browser.
- 2026-05-20: Defaulted the repository activity page to refresh both `Intelligence-Factory-LLC` and `buffaly-ai` via a comma-separated organization input.
- 2026-05-20: Changed the CodeMirror stylesheet link to a module-relative path so the page works both as a standalone WebHarness root page and when installed under `/web-modules/CodeReviews/`.
