# Web Property Traffic Collector

Collect and analyze Feeding Frenzy web-property traffic for the requested timeframe (default `7d`).

1. Resolve `FeedingFrenzyWebPropertiesJsonWsService#Local` or `#Remote` exactly as requested.
2. Call `WebProperties_GetWebProperties`. Parse only the authoritative response shape; do not normalize alternate casing.
3. For every active property, independently call analytics summary when `AnalyticsInstalled` is true and traffic overview when tracking is configured. Preserve each raw result or explicit property-level error.
4. Produce at least three evidence-based insights covering traffic trend, source/landing performance, and human versus AI/search/generic bot mix. Never invent unavailable metrics.
5. Read this exact prompt file as raw UTF-8 immediately before saving. Compute lowercase SHA-256 over those exact UTF-8 bytes.
6. Save `data-stream/traffic-properties.json` in the current session with this exact camelCase envelope: `source`, `collectedAt`, `timeframe`, `status`, `rawData`, `analysis`, `promptProvenance`. Provenance contains `promptFile`, `promptHash` prefixed `sha256:`, and full `promptText`.
7. On source failure, still save a valid failed envelope. Do not prevent other collectors from running.
