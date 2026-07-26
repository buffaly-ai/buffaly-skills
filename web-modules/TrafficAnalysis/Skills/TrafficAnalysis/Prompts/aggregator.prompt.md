# Traffic Analysis Aggregator

Read all available current-session files under `artifacts/data-stream/`: `traffic-properties.json`, `google-ads.json`, `linkedin-analytics.json`, `openai-usage.json`, and `reddit-ads.json`. Do not require all five.

Create cross-source synthesis with an executive summary, evidence-based cross-source insights, and prioritized actionable items. Explicitly compare human traffic with AI/search/generic bot traffic when traffic data exists. Record every expected input with `ok`, `partial`, `failed`, or `missing` status. Failed/missing sources must appear in the email footer.

Build `artifacts/traffic-summary-email.html` as standalone HTML with inline CSS and inline SVG charts only—no external images/scripts/styles. Produce useful HTML even if only one collector succeeded. Also save `artifacts/traffic-summary.json` using the aggregator envelope with input names/statuses, synthesis, email path, and exact prompt provenance.

Immediately before saving, read this prompt as raw UTF-8 and compute lowercase SHA-256 over the exact bytes. Store `promptProvenance` with `promptFile`, `promptHash` as `sha256:<lowercase hash>`, and full `promptText`.
