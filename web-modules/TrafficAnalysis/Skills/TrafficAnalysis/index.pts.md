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

Both the compact property-ID input and the growing response accumulator are therefore declared as `StringRef` at the recursive action boundary and materialized inside every invocation. Declaring either value as `string` reintroduces the worker-spooling defect and can terminate the ordinary collector with `Method did not return a value` before it produces an envelope.

The recursive wrappers no longer pass an index between ProtoScript actions. Each invocation derives its typed current index from the accumulated response-array count through `GetWebPropertyIDCount`, avoiding both bare numeric literals and `index + 1` expressions that become string-typed at ProtoScript action boundaries.

After deterministic envelope construction, each successful collector makes one bounded `ToAskModelViaBuffalyRuntime` call. The strict response may replace only `analysis.summary`, `analysis.insights`, `analysis.anomalies`, and `analysis.recommendations`. Invalid or failed model output preserves the deterministic fallback; raw data and metrics are never model-authored.
## Deterministic email rendering

`ToAggregateTrafficAnalysis` emits only the versioned `intelligence-factory-traffic-email.v1` report view model in `artifacts/traffic-summary.json`. The TrafficAnalysis WebModule owns the packaged Intelligence Factory HTML template, logo, value escaping, repeated action/source rendering, and final `artifacts/traffic-summary-email.html` artifact. This keeps presentation iteration separate from collector and analysis prompting.

## Facebook Ads collector
TrafficAnalysis now includes Facebook Ads as a seventh ordinary collector. It calls the existing FacebookAds provider for the run's explicit inclusive date range, preserves the provider dashboard response, derives spend/impressions/reach/click/link-click/rate/campaign metrics deterministically, and omits conversions until exact Meta action semantics are defined. Facebook participates in aggregate spend/reach visualizations and has a distinct report style.

## Native StringRef return contracts
Source bridge and large-payload collector methods return StringRef when the underlying provider can spool large JSON. This preserves native typed flow and prevents the ProtoScript interpreter from rejecting reference-backed values as missing string returns.

The same native contract extends through all seven public `ToCollect*` actions because the analyzed envelope can also exceed the inline threshold. Google Ads keeps its intermediate collected envelope in a `StringRef` local before analysis. Returning or assigning these reference-backed values as `string` causes the worker to report `Method did not return a value` even when the provider itself is healthy.

## 2026-08-07
- Added `ToAnalyzeTrafficAnalysisCollector` as an ordinary, analysis-only JSON boundary for the standalone application.
- Added `ToAnalyzeTrafficAnalysisCollector` to the lazy-load manifest so remote `run-proto-script-method` calls can resolve and activate the module by prototype name.
- Moved the two public remote LLM actions into `Bridge.pts`, a minimal lazy module that excludes every source-provider dependency and includes only the Buffaly LLM runtime plus the TrafficAnalysis validation facade.
- This action accepts materialized envelope JSON while the existing internal analyzer retains its `StringRef` contract for large collector outputs. It performs no source acquisition and keeps the existing bounded model contract.
