# SalesRepresentative.pts.md history

## 2026-10-07 — make fresh authorized lookup discoverable for representative agent
Included existing LeadAutomation.Admin.pts read-only wrappers in representative role composition; despite historical filename these operations are authorized by the owning business representative cohort. Default representative previously lacked latest action, so administrator-only parsing could not prove the conversational fix. Actual owning BuffalyAgent runtime compiles and discovers GetLatestLeads; real chat-latest responses_api turns query Lead9 then query again for inserted Lead10 and matching details with earlier assistant answer retained. Existing administrator composition inherits it without duplicate include. No guarded write operations added; no production activation.


## 2026-10-25 — proposed experience design, not applied
Update role read composition and semantic wrappers for recent-call/my-appointment reads and Markdown call/note/manual evidence. Existing public action IDs and tool input contracts remain except the explicit new recent-call action.

Reason: Matt requested deterministic FF conversation continuity, non-timeout call evidence, my recent calls, SQL-filtered appointments and complete sales workflow designs. This companion is part of the proposed patch only; no installed source change is claimed. Artifact validation: four same-assembly real-reference C# compilations succeeded; common UI proposal tests25/25 passed. This file's SQL, live authentication, role-model and installed native integration checks are not claimed by those compile/DOM results. Implementation must append its actual outcomes before delivery. Baseline and exact use-case/test mapping: artifacts/ff-experience-design-v1/design-v1.md and manifest.json in the authoring session.

## 2026-10-25 - Approved v3 implementation and validation

Include common CallPages plus sole appointment wrapper for both role graphs; move LeadNotes.Admin include from Administrator to here so inherited admin loads exactly once. Both actual role profiles compile/register both actions.

Validation actually performed: full FF Admin Release build passes; 32 focused MSTest cases zero skips (includes real local reader); nine temporary engine paging cases; 14 full-row/error semantic cases; source role compilation and real local modern/legacy HTTP evidence/call-page reads pass. Common40 renderer/transport/dictation tests pass. SDK9.0.300; runtime references recorded in docs/ff-experience-v3.md. Broad test run accidentally selected by empty MSBuild filter failed/hung in unrelated integration/email cases; not a passing suite. Installed candidate, configured Google and production/native/model acceptance remain pending, not claimed. No production mutation in this batch.

## 2026-10-25 — Final role inventory reconciliation

Full59-case module suite exposed an unintended additional representative action: moving LeadNotes.Admin.pts also exposed LeadNotes_GetFollowUpByLeadID. Restore that include to Administrator; CallPages already owns the shared appointment action. The representative inventory is exactly36 (prior34 plus call paging and appointment), Administrator retains the existing follow-up action. No endpoint/auth behavior is widened and no test is excluded. Validation: full59module tests pass0fail0skip; both source role graphs and installed final-module validation are recorded separately in release evidence.
