# Feeding Frenzy Wiki Help actions

Read-only shared help tools for every Feeding Frenzy agent profile.

- `FeedingFrenzyWiki_SearchHelp` searches the existing authenticated `WikiService.Search` route and returns up to five ranked article snippets.
- `FeedingFrenzyWiki_GetHelpArticle` reads the full Markdown article through `WikiService.GetArticle` after search identifies the exact slug.
- The tools are included by `SalesRepresentative.pts`; `Administrator.pts` composes that entry point, so both supported role profiles receive the same help surface.
- No wiki save/edit action is exposed. The user's existing Feeding Frenzy authorization token remains the only service credential.

## 2026-11-04 — Remove tenant-specific example from shared tool description

GetHelpArticle now requests the exact slug returned by SearchHelp without a Commerce example. Route, parameters, validation and return contract are unchanged. Verasol reuses these two existing read tools, not copied actions. The dedicated entrypoint is outside the OpsAgent project root and contains includes only, so the project-relative prototype-upsert tool cannot express that file change; direct source editing was used. Focused actual module tests18/18 and WikiRuntime34checks pass; full native profile compile/model/installed retrieval remain separate pending checks.
