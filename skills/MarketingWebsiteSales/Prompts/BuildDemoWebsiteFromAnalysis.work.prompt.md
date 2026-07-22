> VALIDATED PROMPT ACTION ONLY
>
> Do not run this markdown file directly as ordinary prompt guidance.
> This prompt must be executed through the corresponding ProtoScript `ValidatedPromptAction` so the validation prompt runs after the work turn.
> If you are an agent, call the action/tool instead of loading this file directly.

# Build Demo Website From Analysis

Use this prompt skill when the user wants to turn a website audit or opportunity analysis into a customer-facing demo website for a lead or client.

## Goal

Create a reviewable static demo website that shows how the business could present itself more clearly, locally, trustworthily, and conversion-focused. The demo should feel like the real business website, not like an audit report or internal strategy memo.

## Inputs To Resolve

- Website audit or analysis
- Business name
- Existing website URL
- Industry/service category
- Primary city or region
- Core services
- Verified business facts, if available
- Demo destination or artifact folder, if requested

If business facts are not verified, avoid unsupported claims. Use cautious language such as local service, helpful guidance, or compare options instead of claiming years in business, ratings, family ownership, licenses, or response times.

## Visual Direction Decision

Before creating files, decide and document the demo's visual direction:

1. **Preserve existing site style/template** — use the current website's layout, proportions, imagery, colors, section order, and visual rhythm as the source of truth. Improve copy, metadata, CTA clarity, mobile behavior, structure, and small layout issues without making it look like a different agency template.
2. **Inspired by existing site, but polished** — keep recognizable brand cues, colors, images, and familiar sections, but allow a cleaner, more modern layout and stronger customer-action presentation.
3. **Full redesign/new concept** — create a new visual direction while retaining verified business facts and brand identity.

If the user says "reuse the same styles and images," "keep the look and feel," "preserve the existing site," or similar, default to **Preserve existing site style/template**.

## Preserve Existing Site Style Rules

When preserving the existing style/template, do not create the demo from scratch. First collect and save the original visual references:

- original rendered screenshot
- network HTML
- rendered DOM when available
- key images, backgrounds, logos, video thumbnails, and icons
- observed colors, typography scale, header/nav layout, hero crop, card dimensions, section order, CTA band dimensions, video/newsletter/contact sections, and mobile behavior

Matching labels and assets is not enough. Compare actual proportions, spacing, crop, typography, colors, overlays, and section sequence.

If the user provides screenshots, treat them as authoritative visual evidence for layout, spacing, crop, proportions, and section order.

## Branch Before Overwrite

If visual direction changes or there is tension between preserving the current site and improving it, preserve the existing iteration and create a second artifact instead of overwriting. Use separate folders such as:

- `artifacts/<client-slug>-one-page-demo/`
- `artifacts/<client-slug>-inspired-polished-demo/`

Return both links when both directions are useful for review.

## Demo Structure

Build or specify a static prototype with sections like:

1. Local benefit-driven hero
2. Primary CTA such as Request a Quote, Book a Consultation, or Get Help
3. Secondary phone/text/contact CTA where appropriate
4. Trust bar with only supportable proof points
5. Service cards for the core services
6. Process section explaining what happens next
7. Service-area or local coverage section
8. Reviews/social proof section only when accurate evidence exists
9. FAQ/resource section
10. Final CTA
11. Mobile sticky conversion path when useful
12. Footer with clear business/service summary

## SEO and Conversion Terms To Carry Forward

Consider these terms from the Insurance Site workflow:

- local SEO
- service pages
- service-area pages
- city pages
- title tags
- meta descriptions
- H1
- schema-ready structure
- LocalBusiness or industry-specific schema
- NAP consistency
- trust signals
- reviews
- quote CTA
- call/text CTA
- mobile sticky conversion bar
- resource hub
- FAQ
- internal links
- image alt text
- customer-facing copy
- demo hosting
- visual QA

## Customer-Facing Copy Rules

### Strict no-commentary rule

The public demo must read as if it is the business's real customer-facing website. It must never read like an explanation of the redesign, a sales-packet artifact, an audit summary, or a build-process note.

This is a hard acceptance rule: if visible page copy includes internal commentary, process language, or meta language about the demo/build/redesign, the demo is not complete and must be rewritten before it is shown or deployed.

Do not put any of the following in visible customer-facing page copy, metadata descriptions, alt text, headings, CTAs, footers, or notes:

- demo
- demo concept
- concept site
- preview site
- sales discussion
- sales packet
- current site
- current website
- existing site
- existing website
- new site
- new website
- this site should
- this demo shows
- website direction
- redesign strategy
- build process
- preserved imagery
- preserve existing content
- template critique
- cookie-cutter
- audit findings
- priority fixes addressed
- internal notes
- before publication
- final wording should be approved

If a compliance or approval caveat is necessary, phrase it like normal customer-facing service language, for example: "Please contact the team to discuss care needs, service availability, insurance, documentation, and next steps." Do not mention that the page is a demo or that wording must be approved before publication.

Before presenting or deploying, run a visible-copy scan for banned commentary terms. The only acceptable matches should be non-visible file paths or asset names; visible page text, metadata, image alt text, headings, and footer notes must be clean.

The public demo must not expose internal process language. Remove or avoid visible phrases like:

- SEO cleanup
- schema-ready copy
- priority fixes addressed
- template critique
- redesign strategy
- conversion optimization notes
- audit findings
- task plan
- demo concept

Rewrite those ideas as natural customer-facing sections. For example:

- Coverage paths → What can we help you with?
- Trust fixes → Clear guidance from a local team
- Local SEO cleanup → Serving customers across [region]
- Resource strategy → Helpful answers for [customer type]
- FAQ + schema-ready copy → Common questions

Also scan for and remove visible phrases such as "revised one-page version," "search engines," "internal," "sales positioning," and other process explanations. The demo must read like a real customer website, not like an explanation of the redesign.

## Screenshot Comparison Loop

For customer-facing visual demos, especially when preserving an existing style, do not call the demo complete until you have performed a screenshot-driven review:

1. Capture the original-site screenshot or use the user's supplied screenshot.
2. Capture the current demo screenshot.
3. Create a side-by-side comparison or contact sheet.
4. Compare header/nav/logo placement, hero/background crop, service-card size/position, overlay colors/opacities, CTA band size/spacing, video/newsletter/contact sections, typography scale, and mobile layout.
5. Patch the highest-impact mismatch.
6. Repeat until the demo is presentable or a blocker is documented.

If you write that the demo is "not done yet," has "remaining differences," or needs a "next pass," continue the loop instead of giving a completion response.

## Annotated Improvements Deliverable

When the demo is intended for a sales packet, create an annotated screenshot or annotated handoff page that maps visible demo improvements to the analysis. Common annotations include brand continuity, stronger local hero/message, service clarity, CTA improvements, appointment/contact path, retained original assets/content, helpful answers/FAQ, local trust/contact clarity, and mobile action path.

## Output Options

Depending on available tools and user request, either:

- create actual static HTML/CSS/JS artifacts in the session artifacts folder, or
- produce a complete implementation brief for an editing/build tool to create the files.

When creating files, include a README explaining how to review the prototype.

## QA Checklist

Before presenting the demo as complete, verify:

- Page reads like a real customer website
- No internal audit/demo language is visible
- Hero answers who the business helps and where
- CTAs are clear above the fold
- Service sections match the audit and known services
- Local/service-area section is accurate
- Trust claims are supportable
- Mobile layout and conversion path are considered
- Public/demo URL loads if deployed
- Screenshot comparison or contact sheet exists when visual fidelity matters
- Annotated improvements image/handoff exists when this demo feeds a sales packet
- Visual direction matches the documented choice: preserve existing, inspired/polished, or full redesign

## Style

Make the demo practical, credible, and small-business friendly. Prefer clear copy and direct CTAs over agency jargon or flashy but unsupported claims.

