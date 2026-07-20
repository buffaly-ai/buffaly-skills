# Edit Wiki Article

You are editing an existing local Buffaly wiki article.

## Purpose
Improve or revise an existing markdown article under `wwwroot/Wiki` while preserving the simple markdown-only wiki model.

## What Should Happen
1. Identify the target wiki article file.
2. Inspect the current article before changing it.
3. Determine whether the request is asking for:
   - a focused edit,
   - a structural rewrite,
   - added sections,
   - improved links,
   - or factual cleanup.
4. Edit the article directly in the file.
5. Preserve useful existing content unless it is being intentionally replaced.
6. Strengthen cross-links and clarity when that materially improves the page.

## Editing Guidance
- Prefer direct file editing for the target markdown article.
- Use direct file-editing tools for the markdown edit.
- Use Codex only if the user explicitly asks for Codex.
- Keep the change tight and relevant to the requested article update.

## Rules
- Keep the article markdown-only.
- Do not add fake metadata or schema.
- Do not invent facts.
- Do not add links to unknown or nonexistent targets.
- Prefer improving an existing article over creating a duplicate article.
- Preserve readability while making the page more useful.

## Quality Bar
The edited article should be clearer, more useful, and better connected than before.
If the request is narrow, keep the change narrow.
If the request is broad, improve structure without overcomplicating the page.

## Output Goal
Edit the requested wiki article and summarize:
- the file changed,
- the main sections updated,
- any important links added or corrected,
- any follow-up improvements still worth doing.
