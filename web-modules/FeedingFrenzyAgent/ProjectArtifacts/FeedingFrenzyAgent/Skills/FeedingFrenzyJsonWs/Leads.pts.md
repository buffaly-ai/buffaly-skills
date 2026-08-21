# FeedingFrenzyJsonWs Leads Change History

## Guarded Lead Creation (2026-08-10)
- Added `ToInsertFeedingFrenzyLead` as a guarded write action for the existing server-owned `leads/insert-lead` route.
- The action is intended for explicit, bounded creation of one lead when read/search confirms there is no matching existing lead.
- The wrapper does not expose the unbounded all-leads route and keeps creation outside the read-oriented `FeedingFrenzyJsonWsSkillAction` root.

## JsonWs Mirror Leads Surface (2026-04-22)
- Added JsonWs lead wrappers that mirror the direct FeedingFrenzy leads surface for bounded lead queries and lead-admin-adjacent grid/count operations.

## Exact Direct-Name Reuse (2026-04-22)
- Renamed the lead mirror prototypes from the temporary `JsonWsLeads_*` names to the direct `Leads_*` names because the older direct FeedingFrenzy include remains disabled in `Project.pts`.
- Kept `Leads_GetLeads` intentionally omitted so the JsonWs mirror does not reintroduce the unbounded all-leads route.
- Intentionally omitted the unbounded `Leads_GetLeads` surface from the JsonWs mirror.
- Adapted `GetPotentialDuplicates` to accept `LeadID` and resolve `rowLead` through the published `get-lead` route before calling the duplicate route.
