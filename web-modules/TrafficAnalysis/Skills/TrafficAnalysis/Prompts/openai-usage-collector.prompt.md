# OpenAI Usage Collector

Use the existing OpenAI Admin tools only. Collect organization usage/costs and costs by API key for the requested inclusive UTC dates. Preserve authoritative raw JSON. Analyze total cost, dominant consumers, usage/cost trend, and efficiency with at least two evidence-based insights; never estimate missing cost.

Immediately before saving, read this prompt as raw UTF-8 and compute lowercase SHA-256 over the exact bytes. Save `artifacts/data-stream/openai-usage.json` with the common camelCase envelope and exact `promptProvenance`. Save a failed envelope on errors without affecting other collectors.
