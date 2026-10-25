# LeadNotes.Admin.pts history


## 2026-10-25 — proposed experience design, not applied
Update role read composition and semantic wrappers for recent-call/my-appointment reads and Markdown call/note/manual evidence. Existing public action IDs and tool input contracts remain except the explicit new recent-call action.

Reason: Matt requested deterministic FF conversation continuity, non-timeout call evidence, my recent calls, SQL-filtered appointments and complete sales workflow designs. This companion is part of the proposed patch only; no installed source change is claimed. Artifact validation: four same-assembly real-reference C# compilations succeeded; common UI proposal tests25/25 passed. This file's SQL, live authentication, role-model and installed native integration checks are not claimed by those compile/DOM results. Implementation must append its actual outcomes before delivery. Baseline and exact use-case/test mapping: artifacts/ff-experience-design-v1/design-v1.md and manifest.json in the authoring session.

## 2026-10-25 - Approved v3 implementation and validation

Apply scoped approved v3 API/tool/payload change without changing generated signatures, trusted actor, host lifecycle or unrelated consumers.

Validation actually performed: full FF Admin Release build passes; 32 focused MSTest cases zero skips (includes real local reader); nine temporary engine paging cases; 14 full-row/error semantic cases; source role compilation and real local modern/legacy HTTP evidence/call-page reads pass. Common40 renderer/transport/dictation tests pass. SDK9.0.300; runtime references recorded in docs/ff-experience-v3.md. Broad test run accidentally selected by empty MSBuild filter failed/hung in unrelated integration/email cases; not a passing suite. Installed candidate, configured Google and production/native/model acceptance remain pending, not claimed. No production mutation in this batch.
