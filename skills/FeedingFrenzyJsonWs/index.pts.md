# FeedingFrenzyJsonWs ProtoScript Change History

## Multi-File JsonWs Mirror Surface (2026-04-22)
- Reworked the FeedingFrenzyJsonWs skill from a small single-file route helper into a multi-file surface that mirrors the direct DLL-backed FeedingFrenzy skill layout.

## Exact Direct-Name Reuse Under Isolated Include Surface (2026-04-22)
- Renamed the JsonWs mirror prototypes to reuse the direct FeedingFrenzy action names because `Project.pts` currently keeps the older direct FeedingFrenzy includes disabled.
- Preserved the intentional omission of the unbounded `Leads_GetLeads` method while aligning the remaining surface names to the direct skill layout.
- Validation note: the isolated project compile still stops on the unrelated GoogleWorkspace secret-feature blocker, but no new FeedingFrenzyJsonWs compile diagnostics were introduced by the rename correction.
- Added separate Business and UI API prefixes so wrappers can target both `/api/feedingfrenzy.admin.business/...` and `/api/feedingfrenzy.admin.ui/...` routes through one shared binding service.
- Preserved compatibility wrappers for the existing lead-by-id, leads-by-email, and leads-by-import-key actions while adding direct-surface-style JsonWs actions in per-area files.
- Intentionally omitted the unbounded `Leads_GetLeads` / `get-leads` surface from the JsonWs mirror to avoid exposing large get-all operations.
- Design decision: mirror direct skill grouping and names closely while returning raw JsonWs response strings so the web-service-backed surface stays thin and transport-focused.
