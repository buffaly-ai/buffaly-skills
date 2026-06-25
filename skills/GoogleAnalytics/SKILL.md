# Google Analytics Skill

Primitive GA4 Data API access tools for Buffaly.Marketing.

## Configuration and prerequisites

- `gcloud` must be installed and authenticated on the machine running the skill.
- The active gcloud account must be able to mint an access token with `https://www.googleapis.com/auth/analytics.readonly`.
- The configured service account must have Viewer access to each GA4 property.
- This skill intentionally exposes data primitives only; analysis and diagnosis tools should be layered on top later.

## Actions

### ToListMarketingAnalyticsProperties
Returns the configured GA4 property aliases, account IDs, property IDs, and API property names as JSON.

### ToTestMarketingAnalyticsAccess
Arguments:
- `propertyAlias` - configured property alias such as `fairpath.ai`.
- `startDate` - GA4 relative or absolute start date, for example `7daysAgo`.
- `endDate` - GA4 relative or absolute end date, for example `yesterday`.

Runs a small sessions/activeUsers report and returns access status JSON.

### ToRunMarketingAnalyticsReport
Arguments:
- `propertyAlias` - configured property alias.
- `startDate` - GA4 relative or absolute start date.
- `endDate` - GA4 relative or absolute end date.
- `dimensionsCsv` - comma-separated GA4 dimensions.
- `metricsCsv` - comma-separated GA4 metrics.
- `limit` - max rows; values less than or equal to zero default to 1000.

Runs a generic GA4 Data API report and returns raw report JSON wrapped with the resolved property metadata.
