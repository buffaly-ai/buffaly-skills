# Proposed source history

## 2026-10-25 — paging proposal v3, not applied

Replace GetMyRecentCallsMarkdown date inputs with GetMyCallsPageMarkdown standard page arguments. Existing appointment action/endpoint and tool Markdown formatter remain. No required date range for recent calls.

Validation: v3 artifact receipt lists actual compiles, SQL temporary-fixture checks and contract tests separately from unrun live FF/browser/model/client acceptance.

## 2026-10-25 - Approved v3 implementation and validation

Apply scoped approved v3 API/tool/payload change without changing generated signatures, trusted actor, host lifecycle or unrelated consumers.

Validation actually performed: full FF Admin Release build passes; 32 focused MSTest cases zero skips (includes real local reader); nine temporary engine paging cases; 14 full-row/error semantic cases; source role compilation and real local modern/legacy HTTP evidence/call-page reads pass. Common40 renderer/transport/dictation tests pass. SDK9.0.300; runtime references recorded in docs/ff-experience-v3.md. Broad test run accidentally selected by empty MSBuild filter failed/hung in unrelated integration/email cases; not a passing suite. Installed candidate, configured Google and production/native/model acceptance remain pending, not claimed. No production mutation in this batch.
