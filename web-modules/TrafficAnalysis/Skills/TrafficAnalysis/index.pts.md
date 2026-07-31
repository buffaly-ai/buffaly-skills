# TrafficAnalysis ProtoScript history

Initial package-owned validated prompt actions for four independent collectors and one Level 2 aggregator. Source collection remains in existing typed skills.

Added `ToCollectRedditAdsData` as a fifth independent validated-prompt collector. It orchestrates the existing Reddit Ads account/report actions and adds no source-specific client or acquisition logic.

## Ordinary collector orchestration

TrafficAnalysis collectors are ordinary actions, not validated prompts. GA4 and Tracking Logs select the configured Feeding Frenzy Web Properties binding, map the supported `24h`/`7d`/`30d` timeframe, project only safe property identity, and fan out through the existing per-property Web Properties actions. The C# facade receives the returned source JSON only to validate and build deterministic collector envelopes; it does not dispatch source actions or create data clients.

The skill declares an explicit `reference` to the module-owned `FeedingFrenzy.TrafficAnalysis.Web` assembly before importing `TrafficAnalysisProtoScriptFacade`. This is required when the package artifact is compiled inside a worker project. The Web Properties binding is assigned in two statements because Local and Remote are distinct prototype instances and cannot be selected with a typed ternary expression.

Google Ads calls the existing campaign, search-term, and creative actions directly. LinkedIn calls member and organization analytics directly. OpenAI Usage calls the inclusive-date authoritative usage action. Reddit calls the Reddit Ads WebModule report action rather than the obsolete legacy token path. Account bindings and dates come from run settings; C# projects exact provider fields and converts provider units once.

Intermediate collector envelopes can exceed the runtime's inline-string threshold. The analyzer accepts the envelope as `StringRef` and explicitly materializes it through `ToResolveStringReference` before JSON parsing, preventing a large Google Ads envelope from collapsing into analysis-only output. Existing source actions retain their declared `string` contracts; coercing those returns to `StringRef` changes valid source JSON into a reference-shaped value.

Google Ads, OpenAI Usage, and Reddit Ads direct collector actions now explicitly resolve reference-backed source returns before deterministic envelope construction. Scheduled execution additionally invokes these provider actions one at a time from the typed coordinator, keeping large provider payloads out of ProtoScript locals while retaining the same ordinary actions and bounded analyzer.

TrafficAnalysis declares explicit references to the installed Google Ads, OpenAI Admin, and Reddit Ads provider assemblies and exposes thin module-owned bridge prototypes over their existing read-only services. This makes the TrafficAnalysis project compile independently of whether another package's action artifact was imported into the same run project, without adding source clients or duplicating provider logic.

Each provider bridge passes source returns into a `StringRef`-typed envelope builder before crossing the worker method boundary. The builder materializes and parses provider JSON within the same ProtoScript execution, preventing a large value from being returned as a handle and then immediately re-spooled after attempted resolution.

The recursive GA4 and Tracking Logs fan-out helpers receive only a compact numeric property-ID array rather than the full safe property projection. Compact IDs and safe evidence are projected through separate read-only inventory calls so the large provider response is never stored and reused through a ProtoScript string local, where runtime spooling can replace it with a handle. Accumulated source responses are materialized at every recursive entry because those arrays can legitimately cross the inline-string threshold.

After deterministic envelope construction, each successful collector makes one bounded `ToAskModelViaBuffalyRuntime` call. The strict response may replace only `analysis.summary`, `analysis.insights`, `analysis.anomalies`, and `analysis.recommendations`. Invalid or failed model output preserves the deterministic fallback; raw data and metrics are never model-authored.
## Deterministic email rendering

`ToAggregateTrafficAnalysis` emits only the versioned `intelligence-factory-traffic-email.v1` report view model in `artifacts/traffic-summary.json`. The TrafficAnalysis WebModule owns the packaged Intelligence Factory HTML template, logo, value escaping, repeated action/source rendering, and final `artifacts/traffic-summary-email.html` artifact. This keeps presentation iteration separate from collector and analysis prompting.
