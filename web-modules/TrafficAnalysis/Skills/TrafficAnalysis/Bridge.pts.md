# Bridge.pts

Owns the two ordinary ProtoScript actions exposed to the external TrafficAnalysis application through Buffaly's public `run-proto-script-method` JSON boundary.

The owning lazy module intentionally references only the TrafficAnalysis validation facade. It calls the injected Buffaly runtime host's canonical model boundary directly and has no provider/data-collection references, so collector analysis and aggregate synthesis compile independently of Google Ads, Facebook Ads, LinkedIn, WebProperties, OpenAI usage, Reddit, and the separate lazy LLM module.

- `ToAnalyzeTrafficAnalysisCollector` performs one bounded source-level LLM pass and deterministically merges only analysis fields.
- `ToAggregateTrafficAnalysis` performs one bounded cross-source LLM synthesis and deterministically validates/builds the report view model.
