# Assert-DiagnosticCompletion.ps1 history

## 2026-11-06 — Reject unsupported finalization

Added the SchemaVersion 2 completion validator called before report rendering. Validates required check areas, evidence files and locators, incident log coverage, hypotheses, blocker references and alternatives, coordinator-authority reconciliation, terminal disposition/scope and verified-fix evidence. Visible Causes checked is derived from these hypotheses, preventing a second authored table from hiding an unresolved cause. A Blocked diagnosis may recommend an independently supported alarm-only action but never call it a connection repair.

Validation: package tests 23/23 passed with executable renderer fixtures. Negative cases reject remaining work, Researching finals, unreviewed or missing evidence, partial/inventory-only/needed-but-skipped logs, unsupported blockers/actions, unreconciled coordinator limits, available alternatives and build-only verified claims. Supported alarm-only plus blocked cause renders both confirmed and not-determined rows. File existence is only a deterministic prerequisite, not proof of truthful or exhaustive reasoning. No live incident or runtime final-response interception was tested or added.
