# FeedingFrenzyJsonWs LeadAutomation Change History

## JsonWs Mirror LeadAutomation Surface (2026-04-22)
- Added JsonWs wrappers for the direct FeedingFrenzy lead automation methods exposed in OpsAgent: lead search, tag-based search, and lead-and-notes markdown retrieval.

## Exact Direct-Name Reuse (2026-04-22)
- Renamed the lead-automation mirror prototypes from `JsonWsLeadAutomation_*` to the direct `LeadAutomation_*` names under the isolated include surface.
- Kept signatures aligned with the direct ProtoScript action surface while returning raw JsonWs response strings.
