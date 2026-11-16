## Shared page utilities`n- Added common query parsing, HTML escaping, date formatting, JsonWs calls, and diff-line classification for the three-page browser.

- 2026-05-07: Refined navigation/cards, normalized displayed paths, added CodeMirror read-only diff rendering, aggregate diff summary, and binary-file sorting for the initial code review browser.

## Build footer (2026-05-21)
- Added shared footer injection that fetches `/build-info.json` with `no-store` and displays the current CodeReviews build ID and timestamp on every harness page.

## 2026-11-16 — Shared human-readable not-reviewed presentation
- Resolve the blocking UI-STD-01 Principle 4 finding on b3b9ce6, confirmed still present at 0920478. Add and export `formatNotReviewedFiles` in the existing `window.CodeReviews` presentation owner rather than formatting paths in the diff page. Reuse `fileName` to show item names without repository directories. Present the known unreadable-text reason concisely and use a neutral message for unclassified diagnostics, keeping raw diagnostic text out of this new result list.
- Preserve every list entry, exact authoritative paths/reasons and repository/commit identity without mutation. The formatter does not change coverage, status, stored records, findings text or the newer rule that readable evidence must never be skipped for size.
- Validation: typed Node runner passed 37/37 tests, including the existing 30 semantic-reference regressions and seven new production formatter/panel cases. Tested both path separators, repeated file names without entry loss, frozen record preservation, safe text output, concise diagnostics and Reviewed/Running/Failed panel behavior. No browser rendering, .NET suite, deployment or real review run was performed for this JavaScript-only batch.
