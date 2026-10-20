# CodeReviews settings script
- Loads CodeReviews agent target settings through JsonWs, renders editable base URL fields, and saves validated changes back to the WebHarness.

## 2026-10-09 — Configurable global reviewer in existing settings
- UC1: exact PascalCase field through existing Get/Save async client; preserve typed input on rejected save.
- Implemented approved v3 design using existing agent-targets.json, settings Save and profile-backed shell provisioning. Capture the key once per dispatch; preserve old delivered completion, terminal records, queue behavior and unrelated settings. No rotation locks, new file/store, ledger, generation registry or migration.
- Validation: owning WebHarness Debug build passed (one existing RooTrax nullable warning); all 51 non-environment CodeReviews tests and 6 core publication-contract tests passed. Existing Dev/Staging session-list integration tests failed before deployment; live rotation/endpoint/staging acceptance is recorded separately after deployment, not claimed here. Full suite initially exposed missing WebAppUtilities test compile reference and shared runtime-override test interference; both corrected in this batch.

## 2026-10-20 — Exact boolean mode load/save
- Load and save UseSessionReviewers through existing typed settings JsonWs methods; checkbox readback uses the same declared PascalCase member. Save status explains lazy per-source routing versus configured global destination. Other target-editing behavior unchanged.
- Validation: node --check passed; full owning suite 90/90 passed and Release WebHarness build passed (22 dependency warnings). Source binding/HTML inspected; installed API/browser acceptance not run. No deployment, settings mutation or live reviewer creation.
- Additional client validation: inert Node VM ran the actual settings script with stubbed JsonWs; true mode load, false mode submit/readback and true mode reload all passed. No browser, server or live settings writes. git diff --check passed.
