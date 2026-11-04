
# Usage dashboard browser history

## 2026-11-04
- Add exact daily token table from already-filtered aggregates, with localized dates/counts and browser IANA zone. Remove Codex limit and request-detail rendering, controls and dead helpers. Correct provider-only chart legend; retain other optional graphs on demand. Empty state suggests wider range/cleared filters; failure clears stale totals and surfaces typed timeout warnings.
- Validation: 4/4 deterministic Node tests in America/New_York; actual script/markup/shared theme isolated preview rendered desktop and 390px viewport with one aggregate request, exact 6,519,873,727-token reference count and no removed sections; optional graph click made no extra request. Preview replay only, not deployed endpoint acceptance or speed measurement. Source service tests 6/6. No new styles/font sizes.

## 2026-11-04 — Review correction: shared grid and factual period labels
- Confirmed the daily list bypassed the already-loaded shared `OnFormatGrid` and used the private usage-table presentation; Hour's negative caption also violated UI-STD-01 Principle 12.
- `renderDailyRows` emits shared CalendarDate/IntegerNumber markers and invokes `OnFormatGrid("usage-daily-grid")` after each replacement, including empty results. Formatting belongs to MasterPage.js; exact counts, local grouping and server filters are unchanged.
- Replaced captions with factual range labels, including “Token usage in the last hour”. Existing theme text class retained; no new styles, fonts or optional graph behavior.
- Validation: 5/5 Node tests execute actual shared OnFormatGrid with DOM adapters, verify striped/bordered classes, localized exact counts, rebind/empty behavior, all factual labels and an existing sibling Grid caller. Full C# suite 8/8 passed. No new browser screenshot or installed runtime acceptance; no deployment/restart/database operations.
