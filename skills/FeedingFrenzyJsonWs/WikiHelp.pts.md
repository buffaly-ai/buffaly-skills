# Feeding Frenzy Wiki Help actions

Read-only shared help tools for every Feeding Frenzy agent profile.

- `FeedingFrenzyWiki_SearchHelp` searches the existing authenticated `WikiService.Search` route and returns up to five ranked article snippets.
- `FeedingFrenzyWiki_GetHelpArticle` reads the full Markdown article through `WikiService.GetArticle` after search identifies the exact slug.
- The tools are included by `SalesRepresentative.pts`; `Administrator.pts` composes that entry point, so both supported role profiles receive the same help surface.
- No wiki save/edit action is exposed. The user's existing Feeding Frenzy authorization token remains the only service credential.
