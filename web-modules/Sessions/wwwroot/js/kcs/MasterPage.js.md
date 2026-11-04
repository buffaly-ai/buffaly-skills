# MasterPage.js history

## 2026-11-04 — Shared aggregate grid formatters
- Extend existing `OnFormatGrid` with opt-in `CalendarDate` / `data-calendar-date` and `IntegerNumber` / `data-integer` markers. Calendar dates represent a date already grouped in the browser's calendar, not a UTC instant; format without UTC shifting. Exact integer counts receive localized separators without compact abbreviations.
- Keeps all existing date, rounded-number, Markdown, tooltip and striped/bordered Grid formatting unchanged. Existing callers without the markers are unaffected. Daily usage calls this owner rather than private row presentation; the layout already loads MasterPage.js.
- Validation: actual `OnFormatGrid` executed by Node harness for daily replacements, empty results and sibling Grid without markers; 5/5 tests passed in America/New_York. Exact 123,456,789 count and local dates preserved; Sessions.Web8/8 tests/serial compile passed with existing warnings. No installed deployment/browser read-back performed.
