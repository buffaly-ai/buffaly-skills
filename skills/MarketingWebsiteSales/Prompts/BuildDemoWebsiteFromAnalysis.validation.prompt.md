# Validate Demo Website From Analysis

Validate that the work result created a reviewable sales/demo website artifact from approved audit evidence without pretending it is the final client implementation.

## Objective checks

Fail if any required item is missing:

- References the source website analysis/audit evidence and the target business/website.
- Creates a concrete static demo-site artifact folder under the session `artifacts` folder or the user-specified output folder. A concept description, inline file listing, or proposed content is not enough to pass.
- Creates a `demo-site/index.html` entry point or an equivalent named static entry point with a concrete artifact path.
- Provides concrete paths for every generated demo page, CSS file or inline-CSS page, image/media asset, source map, visual direction note, screenshot, and annotated handoff when applicable.
- Verifies the demo can be opened as a static artifact or through a preview URL without missing required local assets. Fail if required CSS, images, fonts, scripts, links, or page routes are broken.
- States the chosen visual direction: preserve existing style, inspired/polished, or full redesign/new concept.
- If preserving existing style, cites visual references such as screenshots, colors, layout, imagery, typography, section order, CTAs, and mobile observations.
- Documents the selected color palette or brand/demo palette and applies it consistently across the demo pages.
- Addresses hero/message, service/product clarity, local or industry trust, CTAs/contact path, proof/trust signals, helpful answers/FAQ, and AI-search/LLM-readable business facts.
- Avoids unsupported factual claims and clearly labels unverified placeholders.
- Includes a source/image map when original website images, logos, screenshots, or visual assets are used or referenced.
- Includes limitations and explicitly labels the demo as sales collateral, not the final client implementation source.

## Visual screenshot and pixel-review checks

Fail if customer-visible demo pages were not visually reviewed.

The work result must:

- Capture screenshots for every customer-visible demo page and for each important responsive state that was created, including desktop and mobile for the home page at minimum.
- Provide concrete screenshot paths, not just a statement that screenshots should be taken.
- Use the screenshots to verify that the selected palette is visible and consistent, text is readable, spacing is professional, hero/CTA areas render correctly, cards/sections are aligned, and mobile action paths are usable.
- Verify that screenshots do not show obvious broken images, missing fonts, overlapping text, clipped important content, unreadable contrast, placeholder template labels, or unrelated template branding.
- When a multi-page demo is created, verify navigation between pages and include screenshots for each page or fail with a specific missing-page screenshot list.
- Include visual/pixel-level notes or a validation summary explaining what was inspected and what passed or failed.

When visual review fails, `FeedbackForRetry` must name the page, screenshot, viewport, visual problem, and exact correction needed.

## Subjective checks

Fail if the demo is generic or not useful for sales:

- The demo must visibly address the audit weaknesses rather than merely restyling text.
- The demo should feel plausible for the real business and not like an unrelated agency template.
- Copy and layout should make the business easier to understand and act on.
- The demo should help a salesperson explain the opportunity to the prospect.
- The demo must look professional, polished, and customer-presentable in screenshots before it can pass.
- The selected color palette, typography, spacing, section hierarchy, imagery, and CTA treatment must feel intentional and consistent.
- A reasonable customer should be able to look at the demo and understand the improvement opportunity without seeing broken layout, generic filler, or obvious unfinished placeholder content.
