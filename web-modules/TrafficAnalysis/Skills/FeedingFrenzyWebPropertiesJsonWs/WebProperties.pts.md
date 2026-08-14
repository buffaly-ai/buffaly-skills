# WebProperties wrappers

Thin pass-through actions for the generated `FeedingFrenzy.Admin.Business.WebProperties` JsonWs routes. Parameter names and casing match the generated JsonWs contract exactly. The wrappers return raw route JSON and intentionally contain no parsing, retry, analytics, or traffic-classification logic.

## Metadata mutation actions

### `WebProperties_UpdateWebProperty`

Calls `web-properties/update-web-property` with the complete generated contract:

- `service`
- `Data`
- `Name`
- `DomainName`
- `WebsiteUrl`
- `AnalyticsInstalled`
- `GoogleAnalyticsMeasurementID`
- `GoogleAnalyticsUrl`
- `GoogleAdsUrl`
- `FacebookBusinessUrl`
- `RepositoryUrl`
- `StagingUrl`
- `ProductionUrl`
- `TrackingHost`
- `IsActive`
- `WebPropertyID`

Read the exact environment-specific record through `WebProperties_GetWebProperty` first. Preserve every unrelated standard field and the complete `Data` document; the generated update contract replaces the full row rather than applying a partial patch. Re-read the same ID after the update and verify intended changes plus representative preserved fields.

### `WebProperties_InsertWebProperty`

Calls `web-properties/insert-web-property` with the same complete metadata contract except `WebPropertyID`, which is assigned and returned by the application.

Before insertion, inspect the complete target-environment inventory and match canonical domain, name, website URL, staging URL, and production URL to prevent duplicates. Local and production IDs are independent and must never be copied between environments. Immediately read back the returned ID and verify the complete record.

## Authorization boundary

Use `FeedingFrenzyWebPropertiesJsonWsService#Local` with the `FeedingFrenzy.Local.ApiKey` UserSecrets key for local calls and `FeedingFrenzyWebPropertiesJsonWsService#Remote` with `FeedingFrenzy.ApiKey` for production. Local calls use HTTPS directly because an HTTP-to-HTTPS redirect can discard the bearer header. Never store token values in source, logs, task evidence, or metadata documents.
