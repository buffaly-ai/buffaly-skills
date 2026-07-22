> VALIDATED PROMPT ACTION ONLY
>
> Do not run this markdown file directly as ordinary prompt guidance.
> This prompt must be executed through the corresponding ProtoScript `ValidatedPromptAction` so the validation prompt runs after the work turn.
> If you are the parent routing agent, call the action/tool instead of loading this file directly.
> If you are already inside a `ValidatedPromptAction work turn` for this action, do **not** call this action, `ToCreateFeedingFrenzyWebsiteServiceOrderAddendumSkill`, or `ToRunValidatedPromptSkill` again. Continue with the workflow steps in this prompt and produce the requested work result.

# Create Feeding Frenzy Website Service Order Addendum Workflow

Use this workflow when asked to create a Feeding Frenzy Growth Website service order addendum, website service order addendum, or similar client-specific addendum for the $500/month website growth package.

## Invocation phrases

- to create a feeding frenzy website service order addendum
- to create a website service order addendum for a lead
- to generate a growth website addendum from a Feeding Frenzy lead
- to prepare a Feeding Frenzy growth website agreement
- to create a client website service order document

## Inputs

Preferred minimum input:

- Feeding Frenzy lead URL or LeadID, for example `https://ff.medek.ai/lead?LeadID=66537`

Alternative minimum client fields:

- `CLIENT_LEGAL_NAME`
- `CLIENT_ADDRESS`
- `CLIENT_BUSINESS_DESCRIPTION`
- `CLIENT_WEBSITE_URL`

Optional fields:

- `CLIENT_SHORT_NAME` (default to legal name)
- `CLIENT_SIGNER_NAME`
- `CLIENT_SIGNER_TITLE`
- commercial overrides such as monthly fee, ticket count, term, paid ads election, ad spend budget

## Source artifacts

Use these Matt local personal marketing template files as the current source of truth:

- Defaults: `Nodes/Personal/Marketing/Templates/FeedingFrenzyGrowthWebsiteServiceOrderAddendum.defaults.md`
- Template body source: `Nodes/Personal/Marketing/Templates/FeedingFrenzyGrowthWebsiteServiceOrderAddendum.template.md`
- Google Doc shell metadata: `Nodes/Personal/Marketing/Templates/FeedingFrenzyGrowthWebsiteServiceOrderAddendum.google-doc-shell.md`

Use these session artifacts as historical examples and fallback references:

- Legacy defaults: `artifacts/feeding-frenzy-growth-website-addendum-defaults.md`
- Legacy template body source: `artifacts/feeding-frenzy-growth-website-service-order-addendum-template.md`
- Preferred formatted Google Doc shell: `11_iCENHgEbcA_uOH0nY6kuMd7vxe-zUiLby2DAdtabs`
- Immediate Google Drive/Docs runner when live GoogleWorkspace is stale: `artifacts/google-drive-copy-now`

The placeholder inventory belongs in the defaults artifact, not in the client-facing template or output.

## Required rules

1. Resolve lead details first when a Feeding Frenzy lead URL or LeadID is provided.
   - Use `FeedingFrenzyJsonWsService#Remote` for `https://ff.medek.ai` leads.
   - Extract company, mailing address, website, contacts, and signer candidates.
   - Do not guess signer when multiple contacts are plausible; leave signer blank or ask if the signer is required.
2. Apply defaults from `feeding-frenzy-growth-website-addendum-defaults.md`.
   - `INITIAL_TERM_MONTHS` default is `three`, because the template adds `months`.
   - `PAST_DUE_PAUSE_DAYS` default is `15`, because the template adds `days`.
   - `TERMINATION_NOTICE_DAYS` default is `30`, because the template adds `days`.
   - `PAYMENT_TIMING` should be lower-case phrase text that works inside `Fees are due {{PAYMENT_TIMING}}.`
3. Generate the client-specific markdown body from the template.
4. Do **not** include the template signature page in the generated body when inserting into the Google Doc shell.
   - The preferred shell already includes the formatted signature page.
   - Generated body should end before `## Signature Page` when the body will be inserted into the copied shell.
   - If creating a standalone markdown/PDF without the shell, signature page may be included only if explicitly requested.
5. Never include internal placeholder checklist/debug material in client-facing output.
   - The source template should not contain `## Placeholder Checklist`.
   - Verify output/request text does not contain `Placeholder Checklist`, `Required client placeholders`, or unresolved `{{...}}`.
6. Do not insert raw markdown into Google Docs.
   - Strip markdown heading markers (`#`, `##`, `###`) and apply real Google Docs paragraph styles using `Docs.BatchUpdate`.
   - Strip inline bold markers (`**term**`) or convert them to text styling when tooling supports it.
   - Verify extracted Google Doc text has no visible markdown heading markers at the beginning of headings.
7. Prefer creating a fresh copy from the shell if a previous document was populated incorrectly.
   - Mark earlier bad document IDs as superseded in the manifest.

## Google Doc generation flow

1. Copy the formatted shell Google Doc using Drive copy.
2. Generate a clean body request:
   - Start from client-specific markdown.
   - Remove everything from `## Signature Page` onward for shell insertion.
   - Convert headings to plain text and record ranges.
   - Strip `**...**` markers.
   - Insert clean text at index `1`.
   - Apply `TITLE`, `HEADING_1`, `HEADING_2`, and `HEADING_3` paragraph styles for headings.
3. Submit via Google Docs batch update.
4. Extract text from the resulting Google Doc and verify:
   - Client name appears.
   - Website URL appears.
   - `Placeholder Checklist` absent.
   - `Required client placeholders` absent.
   - `{{` absent.
   - `months months`, `days days`, and similar duplicates absent.
   - visible heading markers like `# Feeding Frenzy` absent.
5. Write or update a manifest artifact with lead fields, defaults, generated markdown path, final Google Doc ID/URL, superseded docs, and verification evidence.

## Known good reference

Walker’s Pharmacy lead sample:

- Lead URL: `https://ff.medek.ai/lead?LeadID=66537`
- Final corrected Google Doc: `1oXKhqkHERb-oNGFzcCYoWFQ5agqcKekppLhxOdxe1NI`
- Manifest: `artifacts/walkers-pharmacy-addendum-sample-manifest.md`

## Completion criteria

- Client-specific markdown artifact created with no unresolved placeholders.
- Final Google Doc copied from the shell and populated with clean styled body text.
- No duplicate signature page in the Google Doc body.
- No placeholder checklist/debug material.
- Verification evidence recorded in a manifest.

