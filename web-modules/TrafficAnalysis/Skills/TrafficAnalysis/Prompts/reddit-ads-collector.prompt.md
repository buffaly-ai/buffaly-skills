# Reddit Ads Collector

Collect and analyze Reddit Ads campaign performance for the requested timeframe (default `7d`).

1. Call `ToListRedditAdAccounts` and use the single visible account; fail explicitly when credentials are missing or account identity is ambiguous.
2. Call `ToGenerateRedditAdsReport` for campaign performance using the resolved account and the requested date-range preset.
3. Preserve the authoritative raw report and produce at least two evidence-based insights covering spend efficiency, click/conversion performance, and leading campaigns. Never invent unavailable metrics.
4. Keep Reddit acquisition isolated from every other collector so a Reddit failure cannot block the report.
5. Read this exact prompt file as raw UTF-8 immediately before saving. Compute lowercase SHA-256 over those exact UTF-8 bytes.
6. Save `data-stream/reddit-ads.json` in the current session with this exact camelCase envelope: `source`, `collectedAt`, `timeframe`, `status`, `rawData`, `analysis`, `promptProvenance`. Provenance contains `promptFile`, `promptHash` prefixed `sha256:`, and full `promptText`.
7. On source failure, still save a valid failed envelope. Do not prevent other collectors from running.
