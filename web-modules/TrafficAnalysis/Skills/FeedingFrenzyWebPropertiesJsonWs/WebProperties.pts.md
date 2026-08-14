# WebProperties wrappers

Thin pass-through actions for the generated `FeedingFrenzy.Admin.Business.WebProperties` JsonWs routes. Parameter names and casing match the generated JsonWs contract exactly. The wrappers return raw route JSON and intentionally contain no parsing, retry, analytics, or traffic-classification logic.

## Metadata mutation actions

### `WebProperties_UpdateWebProperty`

Calls `web-properties/update-web-property-google-analytics` with a narrow GA metadata contract:

- `service`
- `WebPropertyID`
- `AnalyticsInstalled`
- `GoogleAnalyticsMeasurementID`
- `GoogleAnalyticsUrl`
- `GoogleAnalyticsAccountID`
- `GoogleAnalyticsPropertyID`

The authoritative C# facade reads the exact environment-specific row, preserves every unrelated standard field and the complete `Data` document, changes only GA metadata, writes, re-reads the same ID, and rejects a readback that does not contain the intended values and preserved fields.

### `WebProperties_InsertWebProperty`

Calls `web-properties/insert-web-property-if-canonical-domain-absent` with the complete create contract. The ID is assigned by the application and the created row is returned.

The authoritative C# facade requires a canonical domain, rejects an existing canonical domain before mutation, inserts only when absent, immediately reads back the returned ID, and verifies canonical domain, name, and website URL. Local and production IDs are independent and must never be copied between environments.

## Authorization boundary

Use `FeedingFrenzyWebPropertiesJsonWsService#Local` with the `FeedingFrenzy.Local.ApiKey` UserSecrets key for local calls and `FeedingFrenzyWebPropertiesJsonWsService#Remote` with `FeedingFrenzy.ApiKey` for production. Local calls use HTTPS directly because an HTTP-to-HTTPS redirect can discard the bearer header. Never store token values in source, logs, task evidence, or metadata documents.
