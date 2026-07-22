> VALIDATED PROMPT ACTION ONLY
>
> Do not run this markdown file directly as ordinary prompt guidance.
> This prompt must be executed through the corresponding ProtoScript `ValidatedPromptAction` so the validation prompt runs after the work turn.
> If you are an agent, call the action/tool instead of loading this file directly.

# Prompt Skill: Create Website Growth Proposal Slide Deck

## Purpose
Create a polished proposal slide deck that uses website audit evidence, screenshots, and a demo concept to explain what should be rebuilt, why it matters, and what ongoing monthly website work includes.

This artifact is proposal-facing, not the same as the client-facing audit report. It may discuss scope, package, monthly plan, and proposal recommendations, but should still be professional and evidence-based.

## Reusable template
Use this template as the base artifact:

- `Nodes/Personal/Marketing/Templates/WebsiteAnalysisSalesPacket/proposal-website-growth-deck.template.html`

Copy it into the proposal output folder and replace all `{{PLACEHOLDER}}` tokens with client-specific content.

## When to use
Use this skill when the user wants a proposal or sales/deal-support deck after a website audit and/or demo-site artifact has been created.

Do not create the final proposal deck before the demo direction and demo screenshots exist unless the user explicitly asks for a deck-only draft. If the deck is expected to show a demo, create or validate the demo first.

Typical inputs:
- Public website audit evidence
- Competitor analysis and competitor-positioning summary
- LLM information quality / AI-search readiness findings and recommended improvements
- Client-facing report findings
- Demo website concept/screenshots
- Selected client color scheme with primary, secondary, accent, light background, ink, muted, and white values
- Current-site screenshots
- Chosen rebuild scope
- Ongoing monthly package and price
- Base program name, e.g. FairPath
- Annotated improvements screenshot or handoff image, when available

## Required matrix-driven proposal acceptance criteria

The proposal deck must be driven by the audit acceptance matrix from `AnalyzeExistingWebsiteForImprovements.prompt.md` and by the client-facing report findings. Do not build the proposal from generic website advice when matrix findings exist.

Before the proposal is considered complete, verify that the deck maps the audit matrix into proposal slides as follows:

| Matrix area | Proposal deck requirement |
|---|---|
| Homepage metadata | Current homepage/issues slide or top rebuild fixes must mention title/meta/local clarity issues when relevant. |
| Local SEO and NAP | Local SEO/service-page solution must include NAP/location consistency and service-area clarity. |
| Technical crawlability | Technical solution or top fixes must include sitemap/robots/crawlability issues when observed. |
| Page inventory | Current strengths/issues must reflect important pages found and missing/weak page types. |
| Service keyword coverage | Local SEO/service-page solution must include dedicated service landing pages for priority offerings. |
| Content quality and differentiation | Content solution must address generic/thin/template copy and differentiation opportunities. |
| Conversion path | Demo solution, mobile conversion, and top fixes must show primary action paths such as call, refill/order/book/contact/transfer/quote. |
| Trust and E-E-A-T | Trust solution must show proof, ownership/team, reviews/testimonials if available, credentials, or community trust opportunities. |
| Reviews and social proof | Include social-proof opportunity only when evidence supports it; otherwise phrase as proof to add if available. |
| Accessibility and media | Technical/content solution or top fixes must include image alt text/media cleanup when observed. |
| AI-search / LLM readiness | Required AI-search/LLM slide/cards must explain clearer facts, services, locations, FAQs, schema, and proof without promising AI rankings. |
| Competitor landscape | Competitive positioning slide must distinguish actual local/surrounding competitors from search/directory competitors when both exist. |
| Competitor page gaps | Competitive positioning slide must state where the prospect can win: service pages, trust, CTAs, local clarity, AI-search readiness, or content depth. |
| Performance/template risk | Technical/performance solution must include observed risk or explicitly avoid unverified performance claims. |
| Quick wins and prioritization | Top rebuild fixes and next steps must be the highest-impact findings from the matrix, not a generic list. |

If screenshots or demo artifacts do not exist yet, create or validate them before claiming visual improvements. If a matrix row was not verified, do not include unsupported claims; either gather evidence or omit the claim.

## Output files
Create a folder such as:
- `artifacts/<client-slug>-proposal-deck/`

Create:
- `index.html` — inline-CSS deck
- `proposal-deck.pdf` — Chrome exported PDF
- `screenshots/` — current-site and demo screenshots used in the deck

## Recommended deck structure
The reusable template is a 14-slide structure:
1. Cover / Website Growth Proposal
2. Current strengths
3. Current homepage screenshot and issues
4. Current service/key page screenshot and issues
5. Demo solution screenshot and action cards
6. Mobile conversion screenshot and action bar
7. Local SEO/service-page solution
8. Competitive positioning: what competitors do better and where the prospect can win
9. Trust/social proof solution
10. Content/blog-to-service solution
11. AI-search/LLM information quality solution
12. Technical/performance solution
13. Top rebuild fixes
14. Monthly website growth layer in addition to base program
15. Recommended proposal
16. Next steps

For website growth sales packets, include the annotated improvements image when available. It may be used as one full-slide image and/or sliced across multiple slides to explain top-of-page, middle-page, and lower-page improvements.

## Annotated improvements slide guidance

When an annotated demo screenshot exists, include it in the proposal deck and map it to the analysis. Typical callouts:

- brand continuity
- stronger local hero/message
- service clarity
- CTA improvements
- appointment/contact path
- retained original content/assets
- helpful answers/FAQ
- local trust/contact clarity
- mobile action path

If the annotated image is tall, create separate detail slides that crop or slice the image so the improvements are readable in the deck and PDF.

## Screenshot workflow
Use Chrome headless when available:

```powershell
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
& $chrome --headless=new --disable-gpu --hide-scrollbars --window-size=1440,1100 --screenshot="$sdir\current-home.png" 'https://example.com/'
& $chrome --headless=new --disable-gpu --hide-scrollbars --window-size=1440,1100 --screenshot="$sdir\current-service.png" 'https://example.com/services'
& $chrome --headless=new --disable-gpu --hide-scrollbars --allow-file-access-from-files --window-size=1440,1100 --screenshot="$sdir\demo-home.png" $demoFileUri
& $chrome --headless=new --disable-gpu --hide-scrollbars --allow-file-access-from-files --window-size=390,900 --screenshot="$sdir\demo-mobile.png" $demoFileUri
```

For local file URIs, use:

```powershell
'file:///' + $path.Replace('\\','/').Replace(' ','%20')
```

## Critical CSS rules
- Inline CSS in the deck HTML. Do not rely on `deck.css` in artifact viewers.
- Replace the default deck palette with the selected client color scheme before exporting screenshots or PDF so the proposal deck visually matches the report and the prospect's brand/demo concept.
- Use the same selected palette as the client-facing report unless the user explicitly requests separate branding.
- White cards on dark slides must explicitly use dark text:
  - `.card{background:white;color:var(--ink);...}`
  - `.card p{font-size:18px;color:var(--ink)}`
- Keep slide print CSS:
  - `@page { size: landscape; margin: 0 }`
- Use fixed slide dimensions (`1200px × 675px`) for predictable PDF export.

## Template substitution guidance
Replace these key placeholders:
- `{{CLIENT_NAME}}`
- `{{PRIMARY_ACTIONS}}` — e.g., “calls, refills, and prescription transfers.”
- `{{CURRENT_STRENGTH_CARDS_HTML}}`
- `{{CURRENT_HOME_SCREENSHOT_PATH}}`
- `{{CURRENT_HOME_ISSUES_HTML}}`
- `{{CURRENT_SERVICE_SCREENSHOT_PATH}}`
- `{{CURRENT_SERVICE_ISSUES_HTML}}`
- `{{DEMO_HOME_SCREENSHOT_PATH}}`
- `{{DEMO_ACTION_CARDS_HTML}}`
- `{{DEMO_MOBILE_SCREENSHOT_PATH}}`
- `{{MOBILE_ACTIONS_HTML}}`
- `{{SERVICE_PAGE_CARDS_HTML}}`
- `{{COMPETITOR_POSITIONING_CARDS_HTML}}` — competitor gaps, actual competitor names, and concise where-we-can-win positioning.
- `{{TRUST_CARDS_HTML}}`
- `{{CONTENT_CARDS_HTML}}`
- `{{LLM_INFORMATION_QUALITY_CARDS_HTML}}` — cards explaining current AI-search/LLM information gaps, why clear business facts matter, and what the rebuild will expose more clearly.
- `{{TECHNICAL_CARDS_HTML}}`
- `{{TOP_REBUILD_FIX_CARDS_HTML}}`
- `{{MONTHLY_PRICE}}`
- `{{BASE_PROGRAM_NAME}}`
- `{{MONTHLY_PACKAGE_CARDS_HTML}}`
- `{{RECOMMENDED_PROPOSAL_CARDS_HTML}}`
- `{{NEXT_STEP_ITEMS}}`

## Choosing top rebuild fixes
Pick the top rebuild fixes from the audit findings rather than listing every possible improvement. For local service businesses, common top fixes are:
1. Mobile action system — Call, Refill/Book/Contact, Transfer/Start, Directions.
2. Dedicated service landing pages — high-intent local services get their own pages.
3. New customer path — transfer, request, book, quote, or consultation journey.
4. Trust and proof — credentials, reviews, testimonials, community proof, compliance-safe social proof.
5. Local SEO structure — titles, headings, FAQs, schema, internal links, service-area detail if accurate.
6. Competitive differentiation — show how the rebuilt site will match or beat actual local competitors on service pages, trust, CTAs, and search clarity.
7. AI-search/LLM readiness — expose clear service, location, proof, FAQ, and business facts so AI assistants can more accurately understand what the business does.
8. Faster, cleaner pages — reduce template bloat and prioritize mobile actions.

## Monthly package slide pattern
For Website Growth / Feeding Frenzy proposals, do not frame the website package as merely `$X/month in addition to BASE_PROGRAM` unless the user explicitly asks for add-on-only positioning.

Default to the Feeding Frenzy package framing:

`$500/month gets you all of this with Feeding Frenzy`

Use cards based on the lead-funnel package language:
- New website — a rebuilt growth-focused marketing website.
- Fix audit issues — address major trust, SEO, CTA, and conversion gaps.
- Convert existing blogs — useful old content becomes stronger search and website assets.
- Basic hosting — standard hosting for the included marketing website.
- Google Analytics setup — setup or connection plus plain-English interpretation.
- Weekly growth report — clear reporting on traffic, activity, issues, and next steps.
- Analytics and monitoring — ongoing visibility into what is happening on the site.
- Threat and health scanner — basic checks for website health, suspicious issues, and uptime concerns.
- AI-search readiness — LLM readability improvements for services, locations, FAQs, and business facts.
- Chat with your site — request everyday website changes in plain English.
- Backups — website backups and restore support.
- 2 optimized blog posts/month — fresh SEO and AI-search friendly content every month.

Footer pattern:
“FairPath can stay the broader growth program. Feeding Frenzy is the $500/month website growth engine that keeps the site useful, visible, and improving.”

## PDF export
Use local Chrome headless:

```powershell
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
& $chrome --headless=new --disable-gpu --allow-file-access-from-files --print-to-pdf="$pdf" ('file:///' + $html.Replace('\\','/').Replace(' ','%20'))
```

## Validation checklist
Before final response, verify:
- HTML file exists.
- PDF file exists and has non-trivial length.
- Deck has expected slide count.
- Deck includes competitor-positioning content when a competitor analysis exists for the packet.
- Deck includes LLM information quality / AI-search readiness content and does not promise specific AI rankings or recommendations.
- Inserted monthly price/base-program slide is present.
- Top rebuild scope slide is present.
- Screenshots referenced by the deck exist.
- CSS is inline and card text color is fixed for dark slides.
- Annotated improvements image is included when available for the packet.
- A cover screenshot, first-few-slides screenshot, and full-deck contact sheet were captured for visual inspection.
- Slide boundaries are visually clear in HTML/contact-sheet review. Add spacing, borders, shadows, or screen-review slide badges when needed, while keeping print/PDF mode clean.
- No placeholder text remains.

Useful checks:

```powershell
$h = Get-Content -Raw -Encoding UTF8 $html
[regex]::Matches($h,'<section class="slide').Count
$h.Contains('$500/month in addition to FairPath')
$h.Contains('.card{background:white;color:var(--ink)')
$h.Contains('.card p{font-size:18px;color:var(--ink)}')
```

## Final response
Return concise paths to:
- proposal deck HTML
- proposal deck PDF
- screenshots folder

Also state the slide count and summarize the newly added/important proposal sections.

