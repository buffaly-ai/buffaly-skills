# index.pts

GoogleAnalytics owner-source ProtoScript skill.

History:
- 2026-06-18: Added primitive GA4 tools.
- 2026-08-14: Added property/web-stream provisioning action.
- 2026-09-07: Routed actions through Feeding Frenzy GoogleOperations.
- 2026-09-07: Added ToRunMarketingAnalyticsReportAdvanced, preserving Offset, OrderByCsv and DimensionFilterJson through the FF advanced endpoint. Real source Execute passed with Walker hostName filter, descending views and offset1; all sixteen Google actions passed after the addition. Used the typed ProtoScript authoring parser/upsert against the owning source, not an installed file edit.
- 2026-09-07 contract fix: actions now use `FeedingFrenzyWebPropertiesJsonWsService` with Marketing compatibility GoogleOperations routes and PascalCase parameters from `C:\dev\FeedingFrenzy\FeedingFrenzy.Admin.Business\GoogleOperations.cs`. Local `proofDirectoryPath` is validated before setup calls and is not sent to Feeding Frenzy.



