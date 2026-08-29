# FeedingFrenzyWebPropertiesJsonWs

Independent thin ProtoScript wrappers for the existing Feeding Frenzy Admin `WebProperties` JsonWs surface. The skill intentionally owns its own service/action root and does not modify or depend on the CRM-focused `FeedingFrenzyJsonWs` skill source.

The local and remote bindings use separate Feeding Frenzy API-key secrets. No analytics or tracking-log business logic is duplicated here.

## Authorization

- Local calls use `https://feedingfrenzy.local` and UserSecrets key `FeedingFrenzy.Local.ApiKey`. Do not change the binding to HTTP: the local site redirects to HTTPS and clients can drop the bearer header across that redirect, causing a misleading 401.
- The local token must be an unexpired Feeding Frenzy `Authorizations` API-key row. Create replacements through an authenticated administrator session and `FeedingFrenzy.Admin.Business.ApiKeys.InsertApiKey`, then store only the token in UserSecrets.
- Production calls use `https://ff.intelligencefactory.ai` and the separate UserSecrets key `FeedingFrenzy.ApiKey`. Never reuse a local key in production.

## Metadata mutations

- `WebProperties_UpdateWebProperty` exposes the generated application update contract. Always read the exact record first and preserve every unrelated field, including its complete `Data` document.
- `WebProperties_InsertWebProperty` exposes the generated insert contract for a canonical domain that is absent after a complete environment inventory check. Capture and read back the returned environment-specific ID; local and production IDs are not interchangeable.
- GA4 synchronization normally sets `AnalyticsInstalled`, `GoogleAnalyticsMeasurementID`, `GoogleAnalyticsUrl`, and the structured account/property/stream identifiers in preserved `Data`, followed by `GetWebProperty` readback.
