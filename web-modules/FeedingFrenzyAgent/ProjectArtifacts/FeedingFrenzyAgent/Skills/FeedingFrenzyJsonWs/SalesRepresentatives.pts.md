# FeedingFrenzyJsonWs SalesRepresentatives Change History

## JsonWs Mirror SalesRepresentatives Surface (2026-04-22)
- Added JsonWs wrappers mirroring the direct sales-representative skill surface using the published business routes.

## Exact Direct-Name Reuse (2026-04-22)
- Renamed the sales-representative mirror prototypes from `JsonWsSalesRepresentatives_*` to the direct `SalesRepresentatives_*` names under the isolated include surface.
- Kept direct-style method names while reflecting the current JsonWs parameter contract for insert/update operations.

## Move sales representative writes behind guarded base (2026-06-25)
- Moved copy/insert/enable/disable/remove/update sales-representative prototypes from `FeedingFrenzyJsonWsSkillAction` to `FeedingFrenzyJsonWsGuardedWriteAction`.
- Kept read/list/get sales-representative tools exposed through the default Feeding Frenzy agent skill surface.
- Design Decision: sales-representative mutations should require an explicit guarded action root and confirmation design before becoming available to normal Feeding Frenzy agent turns.
