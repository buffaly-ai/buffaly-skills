# FeedingFrenzyJsonWs LeadsAdmin Change History

## JsonWs Mirror LeadsAdmin Surface (2026-04-22)
- Added JsonWs wrappers mirroring the direct LeadsAdmin presentation/query methods through the published admin UI routes.

## Exact Direct-Name Reuse (2026-04-22)
- Renamed the leads-admin mirror prototypes from `JsonWsLeadsAdmin_*` to the direct `LeadsAdmin_*` names under the isolated include surface.
- Preserved direct-style int/bool inputs while converting to the string-based UI JsonWs contract where required.
