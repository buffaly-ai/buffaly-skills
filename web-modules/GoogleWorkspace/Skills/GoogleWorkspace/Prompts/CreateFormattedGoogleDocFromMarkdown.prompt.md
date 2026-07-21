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
3. Build one clean document text blob and compute exact paragraph ranges using insertion index base 1. Google Docs indices are zero-based UTF-16 code-unit positions and range end indices are exclusive. If any later cleanup changes text length, fetch the live document structure again before applying styles rather than reusing stale ranges.
4. Insert content with `ToBatchUpdateGoogleWorkspaceDocument` using one or more `insertText` requests.
5. Normalize the complete inserted range before applying headings:
   - Apply the `NORMAL_TEXT` paragraph style to every inserted paragraph.
   - Explicitly reset inherited direct text formatting across the inserted range, including `fontSize` and, when the source does not intentionally specify them, `bold`, `italic`, `underline`, `strikethrough`, `baselineOffset`, and `weightedFontFamily`.
   - This step is mandatory when inserting into a copied or preformatted shell. Setting only `namedStyleType` is insufficient because Google Docs can retain direct font-size and font-family overrides from the insertion point.
6. Apply title and heading styles with `ToBatchUpdateGoogleWorkspaceDocument` using exact paragraph ranges. Apply both the intended `namedStyleType` and explicit title/heading text sizing after body normalization so the body reset cannot flatten the headings.
7. If content includes markdown bold markers (`**text**`), optionally convert to real bold with `updateTextStyle` and remove markers.
8. Validate result:
   - Extract plain text via `ToExtractPlainTextFromGoogleWorkspaceDocument`.
   - Open the actual document in an authenticated browser, force a fresh load after the final formatting update, and capture a screenshot.
   - Inspect the screenshot rather than merely checking that it exists. Verify that the paragraph immediately after every title or heading renders as normal body text and that title, heading, and body sizes are visibly distinct.
   - Do not claim formatting success from a successful Docs API response, named-style value, plain-text extraction, or unauthenticated sign-in screenshot alone.
9. Return:
   - doc URL
   - what formatting was applied
   - screenshot path

## Guardrails
- Prefer creating a new doc for clean formatting over trying to patch a heavily malformed existing one.
- Avoid markdown artifacts in final text (`#`, `##`, `###`, `---`, `**`).
- Use deterministic UTF-16, end-exclusive ranges; avoid guesswork.
- Never rely on a heading-only formatting pass to normalize body paragraphs in a preformatted shell.
- A run is not validated until a fresh authenticated render has been visually inspected and the body-after-heading check passes.
