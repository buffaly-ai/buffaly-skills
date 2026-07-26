# Aggregator Output Validator

Validate before success:
- `artifacts/traffic-summary-email.html` and `artifacts/traffic-summary.json` exist;
- JSON records every expected input and its status plus exact, hash-matching prompt provenance;
- HTML is standalone, contains executive summary and actionable items, has at least one inline `<svg`, and has no external image dependency;
- human-versus-LLM/bot analysis appears when traffic data exists;
- failed/missing source names appear in the footer;
- generation succeeds with partial inputs.

Correct failures and revalidate. Return success only with concrete artifact evidence.
