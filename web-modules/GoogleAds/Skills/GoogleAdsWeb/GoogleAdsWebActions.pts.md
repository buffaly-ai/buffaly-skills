# GoogleAdsWebActions.pts Change History

## Add Read-Only Interactive-Site Views (2026-07-25)
- Added performance, campaigns, search terms, and creative popup actions.
- Each action delegates to one allowlisted launcher that reads module-owned shell assets, injects bounded state, and uses the typed `LaunchInteractiveSite` host call.
- No Google Ads mutation endpoint is exposed by these tools.

## Serialize Browser Configuration Safely (2026-07-25)
- Replaced executable JavaScript string concatenation with the typed `GoogleAdsInteractiveSiteConfiguration.BuildJavaScript` serializer.
- Public tool arguments now remain JSON data; optional account IDs are constrained to digits by the typed builder.

## Avoid ProtoScript AddOperator in Launch Initializer (2026-07-25)
- Compose the final browser JavaScript with `System.String.Concat(config, js)` before constructing `InteractiveSiteLaunchRequestContract`.
- Assign the precomputed `javascript` value in the member initializer so the launcher does not depend on ProtoScript `+` conversion for the `JavaScript` property.
