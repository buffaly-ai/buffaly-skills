# Facebook Ads collector

Collect Facebook Ads account and campaign performance for the requested inclusive date range through the existing FacebookAds provider. Preserve the provider response as `rawData`, calculate spend, impressions, reach, clicks, link clicks, CTR, CPC, CPM, active campaigns, and campaigns with spend deterministically, then add bounded source-only analysis. Do not invent conversion metrics or recalculate authoritative provider totals. Return the common seven-field collector envelope even when the provider fails.
