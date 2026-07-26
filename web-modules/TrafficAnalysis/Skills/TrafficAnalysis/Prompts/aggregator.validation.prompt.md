# Aggregator Output Validator

Validate before success:
- `artifacts/traffic-summary-email.html` and `artifacts/traffic-summary.json` exist;
- JSON records every expected input and its status plus exact, hash-matching prompt provenance;
- HTML is standalone, keeps the headline, executive summary, and actionable items visible before source details, has at least one inline `<svg`, and has no external image dependency;
- HTML contains a "Source details" section with one native `<details>` and descriptive `<summary>` per expected source; each usable source includes its analysis summary, useful raw metrics, and evidence, while failed/missing disclosures contain status and available diagnostics;
- source details use semantic HTML and email-safe inline CSS so their labels and content remain readable in clients that do not support interactive disclosure behavior;
- human-versus-LLM/bot analysis appears when traffic data exists;
- failed/missing source names appear in the footer;
- generation succeeds with partial inputs.

Correct failures and revalidate. Return success only with concrete artifact evidence.
