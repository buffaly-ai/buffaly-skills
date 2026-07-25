# GoogleAdsWebActions.pts Change History

## Add Read-Only Interactive-Site Views (2026-07-25)
- Added performance, campaigns, search terms, and creative popup actions.
- Each action delegates to one allowlisted launcher that reads module-owned shell assets, injects bounded state, and uses the typed `LaunchInteractiveSite` host call.
- No Google Ads mutation endpoint is exposed by these tools.