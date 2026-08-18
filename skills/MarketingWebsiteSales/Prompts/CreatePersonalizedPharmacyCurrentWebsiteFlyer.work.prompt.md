# Create a Personalized Pharmacy Current-Website Flyer

Create one customer-facing FairPath direct-mail flyer for one independent-pharmacy lead. This is a narrow production workflow, not a research project: confirm the lead identity supplied by the operator, capture one clean screenshot of the pharmacy's current official website, write concise human sales copy, substitute those elements into the exact approved flyer template, and render a complete draft package for parent review.

Do not turn this into a website audit, redesign, concept site, proposal deck, competitor study, reputation study, AI-answer test, market analysis, clinical feasibility project, or compliance exercise.

## Required input

Prefer:

```yaml
LeadID: 12345
PharmacyName: Example Pharmacy
Website: https://example.com/location
OutputMode: mail-ready-draft # or internal-proof
TemplateHtmlPath: Skills/MarketingWebsiteSales/Templates/fairpath-current-website-flyer-v1/flyer.html
CTA: https://fairpath.ai/contact
FinancialLanguage: approved campaign language or default below
PreDispatchCheck: passed
```

The operator should check the lead immediately before dispatch. For a mail-ready draft, require explicit evidence that the operator performed a fresh Feeding Frenzy and campaign-collision check covering no owner, no prior contact, no follow-up, no prior mailing, no customer/duplicate/bad status, and no other-campaign ownership. If that evidence is absent or conflicting, return `BLOCKED - LEAD CHECK REQUIRED` without doing CRM research yourself. Internal proof may proceed only when explicitly requested and must be labeled non-mail-ready.

Never guess a LeadID, pharmacy identity, location, or official URL. Do not mutate Feeding Frenzy CRM.

## Exact template contract

Use the exact `TemplateHtmlPath` supplied by the operator. When the operator supplies a parent-session `artifacts/flyer.html`, use that exact file. Otherwise use the packaged canonical template:

```text
Skills/MarketingWebsiteSales/Templates/fairpath-current-website-flyer-v1/flyer.html
```

The packaged quality reference is:

```text
Skills/MarketingWebsiteSales/Templates/fairpath-current-website-flyer-v1/damm-reference.png
```

Resolve packaged paths relative to the loaded project/skill root. Copy the packaged template into the lead-specific artifact folder before personalization so the packaged source remains unchanged.

If the exact template cannot be located and read, return `BLOCKED - TEMPLATE MISSING`. Do not invent or reconstruct a replacement design.

Preserve the template's:

- US Letter portrait page and print CSS;
- FairPath wordmark and Intelligence Factory attribution;
- purple/orange palette and existing typography;
- topbar, hero, three benefits, evidence panel, three cards, impact band, CTA, and footer;
- grid, spacing, borders, icon treatment, margins, and visual hierarchy.

Allowed changes are limited to:

1. pharmacy-specific text;
2. evidence-panel headings and caption;
3. the single evidence-panel image `src`, truthful `alt` text, and `object-position` needed for a clean crop;
4. approved campaign copy, CTA URL, financial language, and disclaimer;
5. the smallest CSS adjustment needed to prevent actual clipping or unreadable content while preserving the design.

Do not redesign, reorder, remove, or add major sections. Damm is a style and quality reference, not a pixel-perfect geometry specification.

Resolve the evidence panel with one actual `<img>` element using the approved current-website screenshot. The screenshot must fill the panel's full image height as one continuous image. Do not split it into multiple crops, repeat it anywhere else on the flyer, add a second website or storefront image, or preserve any obsolete secondary image or CTA-thumbnail slot. Do not leave placeholder patterns, empty thumbnails, slot instructions, or replacement text.

## Official website and screenshot

Open the exact official website or location page supplied for the lead. For multi-location groups, confirm the page represents the intended location using at least two available identity cues such as name, city/state, street address, phone number, or location page.

Read only enough visible content to write accurate copy. Record the final URL and two to five supported facts or patient actions. Do not infer that a service is absent merely because it is not visible.

Capture exactly one primary current-site screenshot. It must be:

- from the verified official URL;
- current during this run or explicitly supplied as the approved current capture;
- free of browser chrome, cookie overlays, chat popups, loading indicators, debug UI, cursors, tool controls, and unrelated windows;
- unannotated and unadulterated: no arrows, labels, highlights, masks, replacement text, generated elements, or visual retouching;
- recognizable as that pharmacy's website at normal flyer size;
- proportionally cropped or scaled without stretching.

Prefer a desktop capture that shows pharmacy identity plus meaningful patient actions or location content and remains recognizable when fit into the template's tall evidence panel. Use `object-fit: cover` or `object-fit: contain` and a truthful `object-position` as appropriate, but never stretch the image. Inspect the exact single crop in the final rendered flyer. If the page cannot be captured cleanly and recognizably, return a precise blocker.

Do not substitute a proposed redesign, homepage clone, storefront photo, map image, competitor image, or stock illustration.

## Human sales copy

Write for a pharmacy owner. The copy should be benefit-led, conversational, concise, and respectful of what the pharmacy already has. Focus on helping more patients find and choose the pharmacy, launching useful income-producing services, and simplifying operations to reduce cost and effort.

Do not use internal or analyst language such as `grounded in`, `evidence`, `audit`, `finding`, `score`, `current-site evidence`, `opportunity noted`, or `AI understanding`. Do not insult the current website.

Customize only what the website supports:

- `Prepared for [Pharmacy Name]`;
- the opening paragraph using the pharmacy name, community/location, and one supported fact;
- evidence-panel headline, screenshot label, and caption;
- strategy-card paragraphs where a natural pharmacy reference helps;
- impact-band support sentence;
- CTA paragraph.

A useful pattern, when it fits naturally, is:

```text
You already have a strong foundation.
[Pharmacy Name]'s website today
Your website already helps [community] patients [supported actions]. We see an opportunity to help it do even more-bring in new patients, highlight valuable services, and turn more visits into action.
```

Do not copy this mechanically when better human wording fits.

## Standard campaign message

Keep `Make more. Keep more.` unless the operator supplies approved alternate copy.

Communicate three lanes without claiming the pharmacy lacks or qualifies for them:

1. **Get found and trusted** - help more local patients find and choose the pharmacy through a stronger website, clearer search visibility, and reputation support.
2. **Add an income stream** - help launch services that fit the pharmacy's patients, including RPM, Annual Wellness Visits, APCM, care coordination, and clinic outreach.
3. **Keep more of what you earn** - simplify intake, outreach, reporting, follow-up, handoffs, and overlapping software or operating costs.

Use the impact band's left side for nonredundant social proof:

```text
Already helping independent pharmacies grow.
FairPath is working with pharmacies like yours to reach more patients, develop new sources of income, and simplify day-to-day operations.
```

Do not promise AI placement, ranking, recommendation, clinical eligibility, reimbursement, clinic relationships, patient volume, revenue, profit, ROI, or software savings.

## Financial language, CTA, and disclaimer

Use supplied approved financial language exactly. Otherwise use:

```text
Potential monthly profit opportunity
$10k-$20k/month
Based on care-program performance at other pharmacies. Full variability details below.
```

Default CTA:

```text
See what's possible for [Pharmacy Name].
We'll show you where we would start-and which opportunities may be worth pursuing first.
20-minute walkthrough · No commitment · Built around your pharmacy
SEE YOUR PLAN
https://fairpath.ai/contact
```

Default disclaimer:

```text
Figures shown are illustrative, not guaranteed. FairPath does not guarantee AI placement, search rankings, clinical eligibility, reimbursement, clinic participation, revenue, profit, or savings. Actual outcomes depend on patient volume, payer mix, eligibility, reimbursement, staffing, costs, and services provided. Program scope and third-party costs are defined in the service agreement.
```

## Required draft package

Work in one lead-specific artifact folder and preserve the source template separately. Return:

- personalized source HTML;
- exactly one-page US Letter portrait PDF;
- exact 2550 × 3300 PNG preview of the complete page;
- clean current-site screenshot;
- concise evidence/source record;
- structured content record;
- a short production report.

Render the 2550 × 3300 PNG as a true full-page image. A reliable method is an 816 × 1056 CSS Letter page rendered at device scale factor 3.125. Do not place a small 816 × 1056 flyer in the corner of a 2550 × 3300 browser canvas.

Suggested structured record:

```yaml
LeadID:
PharmacyName:
Website:
WebsiteFinalUrl:
WebsiteIdentityCues:
VisibleFactsOrActions:
PersonalizedOpeningCopy:
ScreenshotPath:
ScreenshotSourceUrl:
ScreenshotCapturedUtc:
ScreenshotAlterations: none
FinancialLanguage:
CTA:
TemplateSourcePath:
PreDispatchCheck:
OutputMode:
CrmChanged: false
```

## Practical self-check

Inspect the actual final PNG and PDF before returning. Correct obvious defects yourself. Confirm:

- the result is unmistakably the supplied override or packaged `fairpath-current-website-flyer-v1/flyer.html` design;
- the flyer occupies the full 2550 × 3300 canvas;
- the screenshot is clean, recognizable, proportional, and unannotated;
- every visible image slot is resolved;
- pharmacy name, location, URL, and custom copy are correct;
- copy reads naturally and does not sound like an audit;
- financial language, CTA, disclaimer, and footer are present and readable;
- there is no clipping, overflow, broken image, placeholder, loading UI, browser control, tiny page on a large canvas, or accidental second PDF page;
- CRM remains unchanged.

Do not reject a usable draft merely because whitespace, section height, crop, or geometry differs slightly from the Damm example. Cosmetic differences are acceptable when the page is polished, readable, complete, and recognizably on-template.

## Return contract

Return `DRAFT READY FOR PARENT REVIEW` with exact artifact paths and a concise production report when the package passes the practical self-check.

Return `BLOCKED` only for a concrete problem that prevents a useful draft, such as missing template, missing lead-check evidence for mail-ready mode, unresolved identity, inaccessible official site, unusable screenshot, failed render, missing required artifact, clipping, or unreadable essential content.

The parent owns final visual approval, corrections, ledger recording, fresh release preflight, and CRM attachment. Never attach or upload files to CRM from this action.
