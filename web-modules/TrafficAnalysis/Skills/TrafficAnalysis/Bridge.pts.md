# Bridge.pts

Owns the two ordinary ProtoScript actions exposed to the external TrafficAnalysis application through Buffaly's public `run-proto-script-method` JSON boundary.

The module intentionally includes only the Buffaly LLM runtime and the TrafficAnalysis facade. It has no provider/data-collection references, so collector analysis and aggregate synthesis can compile and execute independently of Google Ads, Facebook Ads, LinkedIn, WebProperties, OpenAI usage, or Reddit packages.

- `ToAnalyzeTrafficAnalysisCollector` performs one bounded source-level LLM pass and deterministically merges only analysis fields.
- `ToAggregateTrafficAnalysis` performs one bounded cross-source LLM synthesis and deterministically validates/builds the report view model.
