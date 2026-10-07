# LeadAutomation.Admin.pts history

## 2026-10-07 — fresh latest lead action
Added LeadAutomation_GetLatestLeads discovery phrases and exact JsonWs Search binding to owning GetLatestLeads endpoint. Description requires a fresh query before choosing a newest LeadID, retains conversation continuity and treats timestamp ties as equally recent. Existing wrappers preserved. Ownership is FeedingFrenzy source project, not installed/package-generated copies; current upsert tool is restricted to OpsAgent so SmartPatch used for this external owning file. Validation: exact route exercised via authenticated HTTP returns latest owned fixture4 before2 and1, excludes other rep3. Full ProtoScript project/model turn was not run; no package publication or production install.
