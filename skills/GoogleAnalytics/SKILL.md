# Google Analytics Skill

Primitive GA4 tools for Buffaly.Marketing routed through the canonical Feeding Frenzy route-based Google operations service.

## Binding

- Callers pass `FeedingFrenzyWebPropertiesJsonWsService service`; use `FeedingFrenzyWebPropertiesJsonWsService#Remote` for production.
- Canonical remote binding: `BaseUrl = https://ff.intelligencefactory.ai`, `TokenKey = FeedingFrenzy.ApiKey`.
- Routes are generated method routes under `api/feedingfrenzy.admin.business/google-operations/*`.
- The tool caller does not provide Google secrets, activate `gcloud`, call Google APIs directly, or set process-global credentials.

## Actions

- `ToListMarketingAnalyticsProperties(service)` -> `list-marketing-analytics-properties`
- `ToTestMarketingAnalyticsAccess(service, propertyAlias, startDate, endDate)` -> `test-marketing-analytics-access` with `PropertyAlias`, `StartDate`, `EndDate`
- `ToRunMarketingAnalyticsReport(service, propertyAlias, startDate, endDate, dimensionsCsv, metricsCsv, limit)` -> `run-marketing-analytics-report` with `PropertyAlias`, `StartDate`, `EndDate`, `DimensionsCsv`, `MetricsCsv`, `Limit`
- `ToAddGoogleAnalyticsProperty(service, accountId, propertyDisplayName, webStreamDisplayName, defaultUri, proofDirectoryPath)` -> `add-google-analytics-property` with `AccountID`, `PropertyDisplayName`, `WebStreamDisplayName`, `DefaultUri`

`proofDirectoryPath` is validated by the native `GoogleOperationsLocalProofHelper`, which writes a unique probe and persists sanitized local evidence before mutation. The local path is not sent to Feeding Frenzy; FF creates server-owned proof artifacts.


