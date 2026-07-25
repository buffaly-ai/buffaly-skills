# GoogleAdsWebActions.pts Change History

## Add Read-Only Interactive-Site Views (2026-07-25)
- Added performance, campaigns, search terms, and creative popup actions.
- Each action delegates to one allowlisted launcher that reads module-owned shell assets, injects bounded state, and uses the typed `LaunchInteractiveSite` host call.
- The interactive shell makes its module-host a definite positioned grid cell and pins the dynamically mounted component to that cell, so the component iframe fills the popup instead of falling back to the browser's default 150-pixel iframe height.
- No Google Ads mutation endpoint is exposed by these tools.

## Serialize Browser Configuration Safely (2026-07-25)
- Replaced executable JavaScript string concatenation with the typed `GoogleAdsInteractiveSiteConfiguration.BuildJavaScript` serializer.
- Public tool arguments now remain JSON data; optional account IDs are constrained to digits by the typed builder.

## Avoid ProtoScript AddOperator in Launch Initializer (2026-07-25)
- Compose the serialized configuration and static site JavaScript with `System.Private.CoreLib`'s `System.String.Concat(config, js)` before constructing `InteractiveSiteLaunchRequestContract`.
- Assign the precomputed `javascript` value in the member initializer; do not replace this with `config + js`, because that invokes ProtoScript `AddOperator` conversion and has failed at runtime as not convertible to string.

## Add Specific-Ad Route (2026-07-25)
- Added `ToViewGoogleAdInteractiveSite`, which requires a digits-only `adId` and launches the `creative` component screen.
- The route reuses the same web-module component and workspace page but passes `adId` as bounded state so only the selected creative is rendered.

## Add Agent Inspect-Resolve-Display Routes (2026-07-25)
- Added text/JSON inventory tools for ad groups and ads. Their records retain campaign, ad-group, and ad IDs so the Agent can resolve names before launching UI.
- Added exact campaign and ad-group display tools. Their allowlisted route state is JSON serialized, uses the existing shared host, and preserves the `System.String.Concat` launcher workaround.
- Route lookup is exact. A missing or stale ID produces a visible component error and does not fall back to another entity.
