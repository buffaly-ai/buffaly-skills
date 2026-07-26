# Collector Output Validator

Validate the collector result before success:
- the named `data-stream/*.json` file exists in the current session;
- it parses as JSON and contains exactly the required common-envelope members;
- `status` is `ok`, `partial`, `failed`, or `cancelled`;
- `promptProvenance.promptFile`, `promptHash`, and full `promptText` exist;
- recomputing SHA-256 from the stored prompt text exactly matches `promptHash`;
- successful traffic output has at least three insights; successful LinkedIn/OpenAI output has at least two; successful Google Ads output discusses spend efficiency;
- raw source responses are preserved and no unsupported metric was invented.

If validation fails, correct the artifact and rerun validation. Return success only with concrete file and validation evidence.
