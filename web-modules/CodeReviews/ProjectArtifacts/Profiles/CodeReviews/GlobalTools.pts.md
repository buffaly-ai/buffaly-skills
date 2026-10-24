# GlobalTools.pts

Profile-local eager CodeReviews action file for `Profiles/CodeReviews/Project.pts`.

It mirrors the operational CodeReviews review tools needed by `GlobalCodeReviewsAgentAction` but intentionally omits the legacy `ToRunSourceGroundedCodeReviewSkill : PromptAction` declaration. The CodeReviews global reviewer runs on the CoreLite profile substrate, where `PromptAction` is not defined; including the full skill `index.pts` caused best-effort compile skipping and made grouped review tools discoverable but not loadable. Source-turn reader wrappers return JSON strings here so the CoreLite profile does not need native session DTO prototype declarations. Language-guidance prompt paths are relative to `Profiles/CodeReviews/Project.pts`, so they use `../../Nodes/Personal/CodeReviews/...`.

Keep this file aligned with the operational global-review actions in `Skills/CodeReviews/index.pts` whenever those actions change. Do not add prompt actions, interactive attach/detach tools, or broad workflow helpers to this profile-local surface.

## 2026-10-11 — Complete bounded review evidence
- Aligned lightweight eager global wrappers with complete evidence/catalog reads. Preserve CoreLite no PromptAction/native session DTO requirements, relative trusted paths, read-only root and grouped completion. Old whole diff/file remain outside global root.
- Validation performed: owning WebHarness Debug build passed; fresh serial test rebuild passed; all 63 non-environment CodeReviews tests passed, including 10 complete evidence cases and real profile/lazy module compile cases. Canonical isolated sidecar generation succeeded with no diagnostics. Host cap/core source unchanged. Existing dependency vulnerability warnings remain. No installed deployment, live model review, replay, SQL change or Matt-local restart was performed. Those are separate from source acceptance.

## 2026-10-11 — Complete context and exact owner discovery
- Aligned eager profile with full skill bounded source readers and exact committed path action. Optional CharacterOffset preserves first-call arguments but results are complete-page envelopes requiring continuation. No PromptAction, broad filesystem or legacy terminal actions added to global root.
- Validation: actual CoreLite eager compile and full lazy compile passed within all 77 non-environment tests; isolated generator succeeded with zero diagnostics. Installed replay pending. Scoped owning-source SmartPatch used because personal authoring tools cannot express external profile ownership.

## 2026-10-21 — Eager native binary inspection tool
- Aligned eager profile with ToInspectCodeReviewCommittedBinary service/native-result imports and exact manifest-index/ParentSide signature. Modified/renamed binaries require both sides; deleted files inspect their parent. No PromptAction, shell/filesystem or broad SessionManagement root introduced.
- Validation: all 101 owning tests passed, including real CoreLite eager and full lazy compile checks plus native action execution. Release build/publish and isolated original-manifest acceptance passed. No installed profile edits, model review or deployment.

## 2026-10-24 — Separate linked-design owner from immutable review identity
- Corrected `ToReadCodeReviewSourceArtifactPage.Description`: source-owned documents retain the reviewed session key; explicitly referenced governing documents use their exact owning session and session-relative path. Do not guess owners, browse unrelated sessions or change SourceTurnContextJson. Preserve full paging/hash/identity checks and owning access/path rules.
- Reason: the Fable review supplied Fable's key plus an absolute Astra design path, then mistook rooted-path rejection for unavailable cross-session access. The existing C# reader already accepts the exact linked owner; no executable signature, action root, reader or completion service changed.
- Authoring: active-project prototype upsert cannot target this externally owned module/profile, so a scoped owning-source SmartPatch changed only the description.
- Validation: fresh serial Debug test build succeeded; focused regression/eager/lazy compilation run passed 10/10. Broader suite passed 110/110, including existing Dev/Staging read-only session-list cases. New tests exercise real owning-facade multi-page cross-session reads and retained absolute/traversal/missing/locked-read failures. Initial 120-second dependency rebuild timed out before test execution; subsequent full run completed. Existing dependency vulnerability/nullability/analyzer warnings remain. No installed copy edited, deployment, review retry, status clearing, provider review or protected-process restart.

## 2026-10-24 — Turn-bound discovery snapshots
- Both catalog Execute wrappers now pass the existing _opsAgent runtime to the owning C# reader so snapshots bind to the actual reviewer session/turn; caller-facing parameters and action roots are unchanged. Artifact discovery describes immutable reviewer evidence retention and explicitly preserves source-session read-only behavior. No broad artifact writer is exposed.
- Active-project upsert still cannot target this owning module/profile; used scoped SmartPatch. No action names/phrases changed, so lazy ownership index regeneration is unnecessary.
- Validation: full owning suite 115/115 passed, including real eager CoreLite/lazy compilation and new multi-page changing-source tests. No installed update or live review at this entry.
