# Validate Website Growth Proposal Deck

Validate that the work result creates a sales-usable website growth proposal deck from audit/demo evidence.

## Objective checks

Fail if required deck evidence, artifact output, or visual/export requirement is missing:

- References the prospect/business, source website, audit findings, and demo/screenshots when available.
- Creates a concrete proposal deck artifact folder under the session `artifacts` folder or the user-specified output folder. A slide outline, inline deck body, or description of what would be produced is not enough to pass.
- Creates a deck HTML artifact such as `index.html` or `proposal-deck.html` with inline CSS. The deck must not rely on an external stylesheet for basic slide rendering in artifact viewers.
- Creates a real rendered proposal deck PDF when PDF generation was requested or when this skill is being used inside a sales-packet workflow. If PDF rendering is blocked, fail with the exact blocker and remediation needed; do not silently pass with only HTML or markdown.
- Provides concrete paths for the deck HTML, PDF when required, and referenced screenshot/asset files.
- Verifies that referenced screenshot/asset files exist, or fails with specific feedback naming the missing assets. Do not pass by merely listing intended screenshots.
- Has no unreplaced `{{PLACEHOLDER}}` tokens.
- Explains the problem, business impact, recommended solution, demo/rebuild value, competitor positioning, and next step.
- Uses evidence-backed claims and avoids unsupported performance, ranking, rating, revenue, review, or outcome promises.
- Includes speaker/sales notes or guidance sufficient for a sales rep.

## Required deck coverage

Fail if the deck artifact is missing required slides/sections or if they are present only as thin headings:

- Cover / Website Growth Proposal.
- Current strengths.
- Current issue framing grounded in audit evidence.
- Current homepage or key-page screenshot/issues when available.
- Demo solution or demo direction, with screenshots when expected.
- Mobile conversion or primary action path when relevant.
- Local/industry SEO and service/product page solution.
- Competitor positioning, or explicit competitor-evidence limitation.
- Trust/social proof solution using evidence-safe wording.
- Content/resource strategy.
- AI-search / LLM information quality solution, without promising AI rankings.
- Technical/performance solution using only observed or measured evidence.
- Top rebuild fixes selected from the audit matrix, not a generic list.
- Monthly package/program slide when requested.
- Recommended proposal and next steps.

When annotated improvements assets exist or the packet workflow requires them, fail unless the deck includes or links the annotated improvements slide/handoff and maps visible improvements to audit findings.

## Visual and export checks

Fail if the deck is not a reviewable slide artifact:

- Slides must be styled as a proposal deck, not a plain document, raw markdown export, or minimally styled webpage.
- Slide CSS must preserve predictable landscape export, including fixed slide dimensions or equivalent print layout and `@page` landscape styling when HTML-to-PDF export is used.
- White cards or panels on dark slides must explicitly use dark readable text.
- The selected client/prospect palette or a documented brand/demo palette must be applied consistently.
- The deck must be comparable in structure and polish to the reusable proposal template or accepted Marketing Agency proposal deck examples.

When failing, `FeedbackForRetry` must name every missing artifact, missing slide/section, missing screenshot/asset, placeholder, contrast/readability issue, PDF/export blocker, or unsupported claim and explain what the next attempt must create or correct.

## Subjective checks

Fail if the deck would not help a sales conversation:

- The story must be clear, concise, and prospect-specific.
- Visual/content recommendations must support business value rather than generic SEO jargon.
- The proposed next step must be concrete and low-friction.
- A sales rep should be able to use the deck to explain what is wrong, why it affects leads/trust/search/conversion/AI readiness, what the demo or rebuild improves, and why the prospect should take the next step.
- The deck must feel polished and intentional, not mechanically generated from headings.
