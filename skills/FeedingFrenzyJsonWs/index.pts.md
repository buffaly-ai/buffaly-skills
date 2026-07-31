# FeedingFrenzyJsonWs ProtoScript Change History

## Add guarded lead-tag mutation (2026-07-29)
- Added the existing `lead-tags/insert-or-update-lead-tag` API route as a guarded write action with fully qualified `SemanticProgram.InfinitivePhrase` annotation syntax.
- Kept the action outside the default read-oriented action root by inheriting from `FeedingFrenzyJsonWsGuardedWriteAction`.

## Add agreement-template and signing-draft tools (2026-07-24)
- Included current agreement-template retrieval and a guarded Markdown-to-lead signing-draft action. The handoff creates a Draft and never sends implicitly.

## Add read-only lead note type lookups (2026-07-24)
- Included `LeadNoteTypes.pts` so the Feeding Frenzy agent can resolve lead note type rows, including `Appointment Set`, without hard-coding numeric IDs.
- Added thin JsonWs wrappers for get-by-id, get-by-name, and list lead note type routes.
- Preserved the existing read-oriented default action surface; no mutating lead note type routes were exposed.

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

## Add read-only calls and guarded write base (2026-06-25)
- Included `Calls.pts` so the Feeding Frenzy agent can inspect call records and transcript markdown through read-only JsonWs wrappers.
- Added `FeedingFrenzyJsonWsGuardedWriteAction` as a non-default-root base for mutating Feeding Frenzy tools.
- Design Decision: keep the default Feeding Frenzy agent action surface read-oriented while preserving write wrappers in source for future explicit guarded roots.

## Route call tools through CallCenter API (2026-06-26)
- Added `CallCenterApiPrefix` and `CallCallCenterRoute(...)` so call wrappers target `/api/feedingfrenzy.callcenter/...` instead of the business JsonWs route prefix.
- Updated the local service binding to use `FeedingFrenzy.Local.ApiKey`, matching the authenticated local Feeding Frenzy JsonWs surface used during staging validation.
- Validation note: staging direct `run-proto-script-method` calls loaded `FeedingFrenzyAgent` and successfully returned distinct lead data for LeadID 1220 and LeadID 1219; call range tools reached the CallCenter API and returned empty results for the tested date range instead of login HTML.
