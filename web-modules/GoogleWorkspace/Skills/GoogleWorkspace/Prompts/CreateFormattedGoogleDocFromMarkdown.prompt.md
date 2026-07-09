# Create Formatted Google Doc from Markdown (Deterministic)

Use this workflow whenever the user asks to create a Google Doc from markdown with proper formatting.

## Inputs
- accountKey
- title
- markdownText

## Steps
1. Create a fresh Google Doc via `ToCreateGoogleWorkspaceDocument(accountKey, "docs.write", title)`.
2. Normalize markdown text before insert:
   - Strip `---` separator lines.
   - Convert markdown headings to plain heading text:
     - `# ` -> Heading 1
     - `## ` -> Heading 2
     - `### ` -> Heading 3
   - Keep paragraph blank lines.
3. Build one clean document text blob and compute exact paragraph ranges using insertion index base 1.
4. Insert content with `ToBatchUpdateGoogleWorkspaceDocument` using one or more `insertText` requests.
5. Apply heading styles with `ToBatchUpdateGoogleWorkspaceDocument` using `updateParagraphStyle` requests and `fields:"namedStyleType"`.
6. If content includes markdown bold markers (`**text**`), optionally convert to real bold with `updateTextStyle` and remove markers.
7. Validate result:
   - Extract plain text via `ToExtractPlainTextFromGoogleWorkspaceDocument`.
   - Open doc URL and capture screenshot using browser tools.
8. Return:
   - doc URL
   - what formatting was applied
   - screenshot path

## Guardrails
- Prefer creating a new doc for clean formatting over trying to patch a heavily malformed existing one.
- Avoid markdown artifacts in final text (`#`, `##`, `###`, `---`, `**`).
- Use deterministic ranges; avoid guesswork.
