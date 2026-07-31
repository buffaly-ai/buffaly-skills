# TrafficAnalysis ProtoScript history

Initial package-owned validated prompt actions for four independent collectors and one Level 2 aggregator. Source collection remains in existing typed skills.

Added `ToCollectRedditAdsData` as a fifth independent validated-prompt collector. It orchestrates the existing Reddit Ads account/report actions and adds no source-specific client or acquisition logic.

## Ordinary collector orchestration

TrafficAnalysis collectors are ordinary actions, not validated prompts. GA4 and Tracking Logs select the configured Feeding Frenzy Web Properties binding, map the supported `24h`/`7d`/`30d` timeframe, project only safe property identity, and fan out through the existing per-property Web Properties actions. The C# facade receives the returned source JSON only to validate and build deterministic collector envelopes; it does not dispatch source actions or create data clients.

The skill declares an explicit `reference` to the module-owned `FeedingFrenzy.TrafficAnalysis.Web` assembly before importing `TrafficAnalysisProtoScriptFacade`. This is required when the package artifact is compiled inside a worker project. The Web Properties binding is assigned in two statements because Local and Remote are distinct prototype instances and cannot be selected with a typed ternary expression.

Google Ads calls the existing campaign, search-term, and creative actions directly. LinkedIn calls member and organization analytics directly. OpenAI Usage calls the inclusive-date authoritative usage action. Reddit calls the Reddit Ads WebModule report action rather than the obsolete legacy token path. Account bindings and dates come from run settings; C# projects exact provider fields and converts provider units once.

After deterministic envelope construction, each successful collector makes one bounded `ToAskModelViaBuffalyRuntime` call. The strict response may replace only `analysis.summary`, `analysis.insights`, `analysis.anomalies`, and `analysis.recommendations`. Invalid or failed model output preserves the deterministic fallback; raw data and metrics are never model-authored.
## Deterministic email rendering

`ToAggregateTrafficAnalysis` emits only the versioned `intelligence-factory-traffic-email.v1` report view model in `artifacts/traffic-summary.json`. The TrafficAnalysis WebModule owns the packaged Intelligence Factory HTML template, logo, value escaping, repeated action/source rendering, and final `artifacts/traffic-summary-email.html` artifact. This keeps presentation iteration separate from collector and analysis prompting.
