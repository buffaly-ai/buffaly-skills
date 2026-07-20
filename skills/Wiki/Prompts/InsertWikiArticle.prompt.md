# Insert Wiki Article

You are inserting a new Wikipedia-style or Buffaly wiki article into the local Buffaly wiki.

## Purpose
Create a new markdown article under `wwwroot/Wiki` at the correct relative path and ensure it is substantive, navigable, and aligned to the existing wiki structure.

## What Should Happen
1. Determine the intended article topic, title, and likely slug/path.
2. Check whether a matching or overlapping article already exists before creating a duplicate.
3. If the article does not exist, create a new markdown file in the correct `wwwroot/Wiki/...` location.
4. Write useful article content, not a stub.
5. Add practical related-article links when the targets are known.
6. If a relevant catalog page should mention the new article, note that follow-up explicitly.

## Editing Guidance
- Prefer direct file editing for the target markdown file.
- Use direct file-editing tools for the file edit.
- Use Codex only if the user explicitly asks for Codex.
- Keep the edit scoped to the intended wiki article and any clearly necessary adjacent markdown updates.

## Rules
- Keep the wiki markdown-only.
- Do not invent frontmatter or a custom schema.
- Do not create duplicate articles when an existing article should be expanded instead.
- Prefer explanatory prose over placeholder bullets.
- Do not invent links to unknown targets.
- Use Buffaly deep links for known ProtoScript symbols when useful.
- Use local file links only when the concrete target is known.

## Quality Bar
The inserted article should explain:
- what the topic is,
- why it matters,
- how it connects to nearby Buffaly concepts,
- what related articles or project targets are useful next.

## Output Goal
Insert the wiki article into the correct file path and produce a concise summary of:
- the file created,
- whether any overlapping article was found,
- the key content added,
- any follow-up catalog or cross-link suggestions.
