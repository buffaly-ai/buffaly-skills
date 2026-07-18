# Static Sessions Dashboard

## 2026-07-17

- Added `dashboard.html`, `css/dashboard-static.css`, and `js/dashboard-static.js` as the no-Razor dashboard implementation.
- The page calls the generated `DashboardAdmin.GetDashboardAsync()` JsonWs stub and renders the same current metrics, seven-day charts, four-week comparison, top tools, and semantic reindex status as the legacy Razor page.
- HTML, CSS, and JavaScript can be iterated without rebuilding the C# application.
- The generated service returns the canonical snapshot as a JSON string because the legacy JsonWs object serializer omits nested collection properties; the client parses that one authoritative serialized contract before rendering.

## 2026-07-17 — Lightweight analysis V2

- Added URL-backed 7D, 30D, 90D, 6M, 1Y, All, and custom Eastern Time date controls to the physical static page.
- Added independently loaded lifetime and selected-range sections with equal-period comparisons and local retry states.
- Replaced bar charts with a dependency-free, horizontally scrollable SVG daily line graph and accessible daily table; long ranges remain daily and do not introduce server-side bucketing.
- Added date controls, lifetime totals, comparisons, and trends without replacing the original dashboard data.
- Retained the complete V1 today, seven-day KPI, daily bars, composition, four-week comparison, top-tools, and semantic reindex panels as an independently loaded operational section.
- Converted the retained seven-day daily activity and four-week comparison visualizations from bars to SVG line graphs without changing their source data, legends, or tooltips.
- Reordered the page so the all-time metrics appear first, followed by the date controls immediately above the selected-range metrics they affect.
- Kept the previously loaded selected-range metrics visible and dimmed during range refreshes, with an explicit `Updating…` status, so slower ranges no longer look like the controls failed to load data.
- Replaced the selected-range detected-success card with exact new-session counts because production-scale aggregate queries must not scan message content for heuristic failure text.
