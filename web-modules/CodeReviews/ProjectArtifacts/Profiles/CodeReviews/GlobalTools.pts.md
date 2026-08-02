# GlobalTools.pts

Profile-local eager CodeReviews action file for `Profiles/CodeReviews/Project.pts`.

It mirrors the operational CodeReviews review tools needed by `GlobalCodeReviewsAgentAction` but intentionally omits the legacy `ToRunSourceGroundedCodeReviewSkill : PromptAction` declaration. The CodeReviews global reviewer runs on the CoreLite profile substrate, where `PromptAction` is not defined; including the full skill `index.pts` caused best-effort compile skipping and made grouped review tools discoverable but not loadable. Source-turn reader wrappers return JSON strings here so the CoreLite profile does not need native session DTO prototype declarations. Language-guidance prompt paths are relative to `Profiles/CodeReviews/Project.pts`, so they use `../../Nodes/Personal/CodeReviews/...`.

Keep this file aligned with the operational global-review actions in `Skills/CodeReviews/index.pts` whenever those actions change. Do not add prompt actions, interactive attach/detach tools, or broad workflow helpers to this profile-local surface.
