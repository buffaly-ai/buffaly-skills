# Create Wiki Article

You are creating one substantive article for the Buffaly markdown wiki.

## Purpose
Generate one real markdown article under the `wwwroot/Wiki` folder for the Buffaly wiki system. The article must be useful, not a stub.

## Core Rules
- Keep the article as plain markdown only.
- Do not invent a schema or frontmatter requirement.
- The article should work in the existing shared markdown viewer.
- Prefer strong explanatory prose over placeholder bullets.
- Include meaningful cross-links where appropriate.
- Do not add fake links when the target is unknown.
- Prefer inline semantic refs for known prompt/prototype symbols.
- Prefer openable local file links for known C# or project files.

## Expected Article Shape
Use a simple structure like:
- `# Title`
- several explanatory paragraphs
- one or more topical sub-sections when useful
- `## Related Articles`
- `## Project Links`

## Cross-Link Guidance
Where useful, link to:
- other wiki articles using `/wiki/<slug>`
- prompt/prototype symbols using `[[protoscript:<SymbolName>]]`
- known code files using `/api/local-text-file?path=<encoded path>`

## Quality Bar
The article must not be a stub. It should explain:
- what the topic is,
- why it matters in Buffaly,
- how it connects to adjacent concepts,
- what live project targets are relevant.

## Output Goal
Produce or replace one wiki article with substantive markdown content in the correct wiki folder location.
