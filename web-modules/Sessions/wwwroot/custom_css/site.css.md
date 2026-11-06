# Sessions shared site stylesheet history

## 2026-11-06 — Shared empty-panel presentation
- Added `.sessions-empty` once in this application-owned stylesheet for the shared `Pages/Shared/_EmptyState.cshtml` partial. Existing rules are preserved. Uses inherited typography, theme border/radius tokens and standard spacing; no page-owned font size or report-specific style. The existing SimpleLayout already loads this owner for standalone and module-hosted Sessions pages.
- Reusable markup is `<partial name="_EmptyState" model='@("Guidance to use the existing primary command.")' />`; the partial HTML-encodes its string model. The initial and empty-result optional report branches are the first callers.
- Validation: Node suite 10/10 checks one shared class, partial ownership and both layout stylesheet routes. Razor build succeeded with 0 errors and 14 existing warnings; C# suite 12/12 passed. No installed-browser visual acceptance or redeployment of this correction was performed.
