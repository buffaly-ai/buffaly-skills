# Create Pharmacy Growth Proposal Deck

## Purpose

Produce a polished, evidence-qualified, 16-slide HTML proposal deck for an independent pharmacy lead. The deck uses a fixed reference template (design system, CSS, fonts, images, navigation) and substitutes lead-specific research findings into each slide.

## Input

The user provides one of:
- A Feeding Frenzy LeadID (preferred) — pull lead data via `LeadAutomation_GetLeadAndNotesAsMarkdown` using `FeedingFrenzyJsonWsService#Remote`
- A company name and website URL (fallback) — research the company directly

## Output

A self-contained HTML proposal deck (index.html + assets folder) saved to the current session's `artifacts/` folder, plus a summary of findings with evidence-state labels.

---

## Reference Template Location

The reference template lives at:
```
Skills/MarketingWebsiteSales/reference-packet-template/
```

### Asset Inventory (copy as-is, do not modify)

```
reference-packet-template/
├── index.html                          ← 16-slide reference deck (Best Value Pharmacies)
└── bvp-deck-assets/
    ├── intelligence-factory-logo.png   ← IF logo (light background)
    ├── fairpath-logo.png               ← FairPath logo (light background)
    ├── fairpath-logo-dark.png          ← FairPath logo (dark background)
    ├── fairpath-unified-work-queue.jpg ← FairPath platform screenshot (work queue dashboard)
    ├── fairpath-eligibility-score.jpg  ← FairPath platform screenshot (patient eligibility scoring)
    └── fonts/
        ├── Glancyr-Regular.otf          ← Custom heading font (weight 400)
        ├── Glancyr-Medium.otf           ← Custom heading font (weight 500)
        └── Glancyr-SemiBold.otf         ← Custom heading font (weight 600)
```

The `bvp-deck-assets/` folder name is kept as-is in all decks. It contains shared brand assets that do not change between leads.

---

## Design System (from reference template — do not change)

### CSS Custom Properties (brand tokens)

```css
:root{
  --purple:#6A00F5; --purple-deep:#5200C2; --violet:#9333EA;
  --ink:#0F172A; --muted:#475569; --faint:#64748B;
  --line:#E5E7EB; --soft:#F8FAFC; --lav:#F3F4FF; --lav-line:#D9D6FF;
  --dark:#0B1020; --orange:#FF7300;
  --green:#0E9F6E; --green-bg:#E7F6F0; --red:#DC2626; --red-bg:#FDEBEB;
  --amber:#B45309; --amber-bg:#FBF0DC; --slate-bg:#EEF2F7;
}
```

### Fonts

- **Headings:** Glancyr (custom OTF, bundled in `bvp-deck-assets/fonts/`)
- **Body:** Inter, "Segoe UI", system-ui, Arial, sans-serif
- `@font-face` declarations for weights 400, 500, 600

### Canvas

- Fixed 1280×720 stage, scaled to viewport via JavaScript `transform: scale()`
- Slides positioned absolutely, toggled via `.active` class
- Transitions: opacity 0.45s ease, transform 0.45s ease

### Slide Backgrounds

- `.lt` — light: white with subtle purple radial gradients
- `.dk` — dark: `--dark` (#0B1020) with purple radial gradients + dotted grid pattern overlay

### Reusable CSS Classes

| Class | Purpose |
|---|---|
| `.slide` | Base slide container (absolute, 1280×720, padding 52px 64px 60px) |
| `.slide.top` | Top-aligned slide (justify-content: flex-start) |
| `.lt` / `.dk` | Light / dark background variant |
| `.chrome-logo` | Top-left logo (absolute, top:26px, left:64px, height:22px) |
| `.s-num` | Slide number (top-right, font-size:11.5px) |
| `.foot` | Footer strip (bottom, border-top, flex space-between) |
| `.eyebrow` | Section label (11px, uppercase, letter-spacing:0.2em, purple) |
| `h1` | Title (Glancyr 50px, weight 600) |
| `h2` | Section heading (Glancyr 30px, weight 600) |
| `h3` | Card heading (15px, weight 700) |
| `.lead` | Body lead text (15px, muted color, max-width:900px) |
| `.accent` | Purple accent text |
| `.grid3` / `.grid2` | 3-col / 2-col card grids (gap:14px) |
| `.card` | White card with border, radius:14px, shadow |
| `.icon` | 34×34 rounded icon container with SVG |
| `.dec` | Decision card (purple left border, uppercase label) |
| `table` | Styled table (lavender header, rounded, shadow) |
| `.pill` | Status pill (`.pill-red`, `.pill-amber`, `.pill-green`, `.pill-slate`) |
| `.chip` | Capability chip (lavender bg, purple text) |
| `.metric` | Large metric number (Glancyr 46px, purple) |
| `.metric-label` | Metric caption (10.5px, uppercase, faint) |
| `.score-panel` | Lavender panel with rounded corners (radius:18px) |
| `.score-big` | Huge score number (Glancyr 88px, purple) |
| `.bar-row` / `.bar-track` / `.bar-fill` | Score bar chart row |
| `.frame` | Product screenshot frame (white, radius:14px, shadow) |
| `.frame-cap` | Screenshot caption (10.5px) |
| `.src-tag` | Source tag with orange dot |
| `.strip` | Note strip (lavender bg, purple-deep text) |
| `.caveat` | Caveat text (11px, faint color) |
| `.tl-row` / `.tl-when` | Timeline row (grid: 86px 1fr) |
| `.price-card` / `.price` / `.price-tag` | Pricing card layout |
| `.step-row` / `.step-n` | Next-steps row (grid: 74px 1fr) |
| `#progress` | Top progress bar (fixed, gradient) |
| `#nav` | Bottom-right navigation pill (prev/next/counter) |
| `#hint` | Bottom-left hint text |

### Navigation JavaScript

The deck includes a self-executing IIFE that handles:
- Viewport scaling (`fit()` function)
- Slide navigation (arrow keys, space, PageUp/Down, Home/End, touch swipe, button clicks)
- URL hash sync (`#1` through `#16`)
- Idle auto-hide for nav controls (3.5s timeout)
- Print support (`@media print` with page-break-after)

**Do not modify the JavaScript or CSS structure.** Only substitute content within slide sections.

---

## Slide-by-Slide Structure (16 slides)

Each slide is a `<section class="slide [lt|dk] [top]" aria-roledescription="slide" aria-label="...">` with:
- `<div class="s-num">N / 16</div>` — slide number
- `<div class="chrome-logo">` with logo `<img>` (light slides: `fairpath-logo.png`, dark slides: `fairpath-logo-dark.png`)
- `<div class="foot">` with left context text and right `<span class="fr">Intelligence Factory · FairPath</span>`

### Slide 1 — Cover (dark, top-aligned)

**Layout:** Dark slide with FairPath dark logo top-left, large title block, bottom row with "Prepared for" (left) and "Presented by" (right).

**Content to substitute:**
- Eyebrow: `Executive Proposal · {Month Year} · Confidential`
- H1: `A stronger digital front door.` + `<br>` + `<span style="color:#B78AFF">A validated path into remote care.</span>`
- Lead paragraph: company name + location count + region description
- "Prepared for" block: top 3 decision-maker names + titles (from CRM contacts or website leadership page)
- "Presented by" block: FairPath logo image
- Footer: `Confidential — prepared for {Company Name} leadership only`

### Slide 2 — Executive Summary (light)

**Layout:** Eyebrow + h2 + lead paragraph, then 2×2 grid of `.card.dec` (decision cards), then a `.strip` evidence-standard note.

**Content to substitute:**
- H2: `One practical first move — not a {N}-location leap`
- Lead: `We are asking for permission to validate, fix the low-risk items, and design a scoped pilot. Nothing in this proposal commits {Company} to a systemwide rollout.`
- 4 decision cards:
  1. **Verified digital issue** — top technical finding from audit
  2. **Strategic opportunity** — market positioning + remote care
  3. **Recommended first move** — validate, quick wins, pilot scoping
  4. **Decision requested** — authorize discovery and pilot scoping
- Evidence standard strip: `observations come from the public website and cited public data. Service availability, economics, compliance posture, and operational fit all require stakeholder validation.`
- Footer left: `Decision requested: approve a validation workshop and scoped pilot design`

### Slide 3 — Who We Are (light)

**Layout:** Eyebrow + h2, then 2-column grid with two cards.

**Content (static — does not change between leads):**
- Left card: Intelligence Factory logo + "The company" description + 3 bullet points
- Right card: FairPath logo + "The platform" description + capability chips (RPM, CCM, AWV, SMS outreach, Intake/consent/referrals, Billing reports)
- Footer: `intelligencefactory.ai · fairpath.ai`

### Slide 4 — Website Audit (light)

**Layout:** 2-column grid (1.15fr / 0.85fr). Left: eyebrow + h2 + lead text + strip. Right: score panel.

**Content to substitute:**
- Eyebrow: `Public website audit · {Month Year}`
- H2: `Your strongest content is hard for machines to see` (or audit-specific headline)
- Lead: describe the site's technical architecture (e.g., client-side rendering, SPA framework)
- Score panel: overall score (e.g., `3.5 / 10`) + 4 bar rows for sub-scores (Crawlability, AI-search readiness, Local SEO, Content)
- Strip: opportunity statement
- Footer left: `Source: public-site technical audit, {N}-area scorecard with {N} evidence files · Observations require stakeholder validation`

### Slide 5 — What's Working (light)

**Layout:** Eyebrow + h2 + lead, then 3-column grid of 6 cards with SVG icons.

**Content to substitute:**
- H2: `What's already working`
- Lead: positive framing of existing strengths
- 6 cards: each with an SVG icon, h3 title, and p description
  - Examples: Clean design, Location schema, Transfer form, Mobile app, Leadership story, Service content
  - Adapt to actual audit findings — highlight what the specific lead's website does well

### Slide 6 — Key Issues (light)

**Layout:** Eyebrow + h2, then a full-width table.

**Content to substitute:**
- H2: `What's holding the site back`
- Table columns: Issue | Why it matters | Fix effort
- Fix effort pills: `.pill-red` (High), `.pill-amber` (Medium), `.pill-green` (Low), `.pill-slate` (Review)
- Include 6-10 rows from the audit findings
- Footer left: `{N} items are quick wins deliverable in the first two weeks · Full audit packet with {N} evidence files available`

### Slide 7 — Competitor Landscape (light)

**Layout:** Eyebrow + h2, then a comparison table.

**Content to substitute:**
- H2: `Strong differentiators — invisible online`
- Table columns: Capability | {Company Name} | Competitor 1 | Competitor 2 | Chains (Walgreens/CVS)
- Rows: Locations, Compounding, Mobility aids, Compliance packaging, Server-rendered website, Individual location pages, Online immunization scheduling, RPM/CCM/AWV, AI-search readiness
- Use `.yes`, `.no`, `.na` classes for Yes/No/N/A
- Caveat below table: `*Absence from the public website does not prove a service is not offered — it may be available offline or through the patient portal.`
- Footer left: competitive differentiation summary

### Slide 8 — Market Opportunity (light)

**Layout:** 2-column grid (1fr / 0.82fr). Left: table of cities with population and Medicare estimates. Right: 3 stacked metric cards.

**Content to substitute:**
- H2: `The market around your {N} locations`
- Table: City | Est. population | Medicare (est.) — one row per location city, plus a Total row
- Right column: 3 metric cards:
  1. Total service-area population
  2. Estimated Medicare beneficiaries
  3. Physician offices in primary county
- Caveat: `Estimates from public population data — directional context, not verified revenue figures.`
- Footer left: `Each location likely has 50–200+ physician offices within a five-mile radius`

### Slide 9 — Remote Care Opportunity (dark)

**Layout:** 2-column grid (1fr / 0.92fr). Left: eyebrow + h2 + lead + 3 service cards. Right: FairPath eligibility screenshot in `.frame` + source tag + caveat.

**Content to substitute:**
- H2: `Remote care: a revenue line worth validating`
- Lead: list current services from website, note absence of RPM/CCM/AWV
- 3 service cards:
  1. **RPM** — Bluetooth devices, CPT 99453/99454/99457
  2. **CCM** — Monthly care coordination, CPT 99490
  3. **AWV** — Health-risk assessments, G0438/G0439
- Right: `fairpath-eligibility-score.jpg` in a `.frame` with caption
- Source tag: `Real FairPath product interface · fairpath.ai`
- Caveat: `Absence from the public site is not proof {Company} lacks a service — some capability may exist offline or in the patient portal. This analysis uses public website content only.`
- Footer left: CRM lead notes classification if available (e.g., "Services Builder" with readiness level)

### Slide 10 — Illustrative Economics (light)

**Layout:** 2-column grid (1fr / 1fr). Left: per-service rate table. Right: scenario table + score panel summary.

**Content to substitute:**
- H2: `Illustrative gross billing — not a forecast`
- Left table: Service | Rate | Per patient/year
  - CCM (CPT 99490): ~$42.72/mo, ~$513/yr
  - RPM setup (99453): ~$19.53 once
  - RPM device (99454): ~$50.27/mo, ~$603/yr
  - RPM management (99457): ~$50.80/mo, ~$610/yr
  - AWV initial (G0438): ~$187.96 once
  - AWV subsequent (G0439): ~$93.69/yr
- Right table: Scenario | Patients/loc | Total | Annual gross billing
  - Conservative: 50 patients/loc → ${low}–${high}
  - Moderate: 100 → ${low}–${high}
  - Aggressive: 200 → ${low}–${high}
- Score panel: `${low}M–${high}M` illustrative annual gross billing range
- Caveats: `Historical illustrative rates only — validate current CMS and payer-specific rules before use.` and `Gross billing illustration — not net revenue, not a forecast.`
- Footer left: `All figures subject to current CMS / payer validation and {Company} operating assumptions`

### Slide 11 — Three-Part Growth Plan (light)

**Layout:** Eyebrow + h2, then 3-column grid of 3 cards.

**Content to substitute:**
- H2: `Three parts, one operating motion`
- Card 1 — **01 · WEBSITE REBUILD**: Now (quick wins), Architecture (SSR/static), Add (location pages, FAQs, scheduling), Result
- Card 2 — **02 · REMOTE CARE PLATFORM**: RPM, CCM, AWV, Plus (online booking)
- Card 3 — **03 · PHYSICIAN PARTNERSHIPS**: Connect, Partner, Compliance, Network
- Footer left: `Sequenced so digital wins land first and clinical programs launch only after the readiness gate`

### Slide 12 — FairPath Platform (dark)

**Layout:** 2-column grid (0.78fr / 1fr). Left: eyebrow + h2 + bullet list + source tag. Right: `fairpath-unified-work-queue.jpg` in `.frame` with caption.

**Content (mostly static):**
- H2: `One operational view for the pharmacy team`
- Bullet list: Patient intake queue, RPM device assignment, CCM care coordination, AWV scheduling, SMS templates, Billing reports
- Right: product screenshot with caption
- Footer left: `RPM, proactive outreach, and data-driven insight in one system`

### Slide 13 — 90-Day Pilot (light)

**Layout:** 2-column grid (1fr / 1fr). Left: timeline rows. Right: success measures table + strip.

**Content to substitute:**
- H2: `A 90-day pilot at one or two locations, gated at 30 / 60 / 90 days`
- Timeline:
  - WEEKS 1–2: Quick wins live
  - WEEKS 3–4: Readiness gate
  - WEEKS 5–8: Controlled enrollment (25–50 patients per location)
  - WEEKS 9–12: Evidence review
- Recommended pilot sites: suggest 1-2 locations (one urban, one rural if possible)
- Success measures table: Website visibility score, Location pages ranking, RPM patients, CCM patients, Physician partners, Gross billing signal, Immunization scheduling
- Strip: `30 / 60 / 90-day gates: technical validation → operational readiness → compliant workflow approval → scale, adjust, or stop.`
- Footer left: `We show you the impact before you commit to all {N} locations`

### Slide 14 — Commercial Terms (light)

**Layout:** Eyebrow + h2, then 3-column grid of pricing cards, then strip + caveat.

**Content (static pricing — do not change):**
- Card 1 — One-time: $15,000 (Implementation & setup)
- Card 2 — Monthly: $2,500/mo (FairPath platform)
- Card 3 — Per location: $250/mo (Per active location)
- Strip: pilot-scale example calculation
- Caveat: `Platform fees only — excludes devices, staffing, and clearinghouse / billing-service costs. Final terms in a mutually agreed statement of work. No reimbursement level or revenue outcome is guaranteed.`
- Footer left: `Pricing subject to final SOW · No revenue outcome guaranteed`

### Slide 15 — Why IF + FairPath (light)

**Layout:** Eyebrow + h2, then 3-column grid of 6 cards with SVG icons.

**Content (static — does not change between leads):**
- 6 cards: Evidence-based, Compliance-aware, Revenue-focused, Built for pharmacies, Low-friction onboarding, Scales when proven
- Footer left: `Technology for independent pharmacy growth`

### Slide 16 — Next Steps (dark)

**Layout:** 2-column grid (1fr / 0.9fr). Left: eyebrow + h2 + 3 step rows. Right: contact card + FairPath logo.

**Content to substitute:**
- H2: `Three steps to a confident decision`
- 3 steps: 01 Validate, 02 Scope, 03 Decide
- Contact card: sales rep name, title, email, websites
  - Default: `Justin Brochetti` · `Chief Executive Officer · Intelligence Factory` · `justin@intelligencefactory.ai`
  - Override with assigned sales rep if different
- Footer left: `Public-site observations only — validate services, reimbursement, compliance, economics, and operating assumptions with {Company} stakeholders`

---

## Workflow

### Step 1: CRM Lead Pull

If a LeadID is provided:
1. Call `LeadAutomation_GetLeadsBySearch` with `FeedingFrenzyJsonWsService#Remote` to find the lead
2. Call `LeadAutomation_GetLeadAndNotesAsMarkdown` to get full lead details, contacts, and notes
3. Extract: company name, locations, contacts (names, phones, emails), NPIs, tags (CPESN, Operator, etc.), sales rep, status, prior contact history, and any executive summaries in the notes
4. Search for additional leads by alternate company names, individual location names, and NPIs

If only a company name + URL is provided:
1. Research the company website directly (fetch HTML, extract JS bundle data)
2. Note that CRM data is not available

### Step 2: Website Technical Audit

1. Run `ToAnalyzeExistingWebsiteForImprovementsSkill` via `ToRunValidatedPromptSkill` with a descriptive child session key (e.g., `{company-slug}-website-audit`)
2. Pass the company name, website URL, locations, services, and leadership as input context
3. The audit produces: opportunity audit (MD + HTML), evidence source notes, and acceptance matrix
4. Extract key findings: overall score, critical issues, quick wins, competitor analysis, AI-search readiness

### Step 3: Email & Infrastructure Research

1. Fetch the website's JavaScript bundle and search for email addresses, mailto components, and domain references
2. Check WHOIS records (via who.is) for all discovered domains to find registrant emails
3. Check DNS: MX records, SPF/TXT records, SSL certificates
4. Identify the email pattern (e.g., `firstinitial.lastname@domain.com`)
5. **Evidence label: "observed/tentative"** — do not label email patterns as "confirmed" unless independently verified via SMTP or other means

### Step 4: Service Gap Analysis

Cross-reference website content and CRM notes against this checklist:
- Remote Patient Monitoring (RPM) — CPT 99453/99454/99457
- Chronic Care Management (CCM) — CPT 99490
- Annual Wellness Visits (AWV) — G0438/G0439
- Remote Therapeutic Monitoring (RTM)
- Advance Primary Care Management (APCM)
- Online immunization scheduling
- Behavioral Health Integration (BHI)

**Critical evidence rule:** Label findings as "website-observed absence" — not "verified operational absence." The company may offer services offline, through a patient portal, or through partner arrangements not visible on the public website.

### Step 5: Market Estimation

Create `market-economics-ledger.json` in the proposal output folder before assembling the deck. Also include a readable ledger summary in markdown or in an HTML source-notes section. The ledger is the authoritative numeric contract for the market and economics slides.

Required ledger inputs and outputs:
- Geographic units, source, and year
- Service-area population
- Medicare percentage or range and the local/public basis used
- Estimated Medicare beneficiary count or range, with visible arithmetic
- Physician-density estimate or range and its basis
- Estimated physician count or range, with visible arithmetic
- Estimated physician-office/clinic count or range and its basis
- Low, base, and high market-capture rates
- Resulting low, base, and high enrolled-patient counts
- Illustrative gross billing per enrolled patient/year assumptions and basis
- Low, base, and high annual gross-billing arithmetic and totals

Use order-of-magnitude estimates when exact figures are unavailable. Research a reasonable local basis when possible. Do not use one universal Medicare percentage for every market. If primary data cannot be retrieved, use an explicitly labeled range based on the best available public or regional context and state that basis.

The market slide must show all of these directional figures:
- Service-area population
- Estimated Medicare beneficiaries
- Estimated physicians
- Estimated physician offices/clinics

The economics slide must carry the same Medicare market into low/base/high scenarios using this explicit equation:

`estimated Medicare market × assumed capture rate × illustrative annual gross billing per enrolled patient = illustrative annual gross billing`

Show the capture rate, resulting patient count, per-patient assumption, and annual total for every scenario. Patient and billing values in the deck must match the ledger within ordinary display rounding.

**Evidence labels:** market figures are **Estimated**; revenue figures are **Illustrative**. Gross billing is not net revenue and not a forecast. Payer rules, current rates, program mix, billable months, staffing, devices, denials, collections, compliance, and partner economics still require validation.

Do not replace computable directional estimates with `TBD`, `Not verified`, `cannot estimate`, `no dollar estimates can be provided`, or equivalent refusal language merely because first-party pharmacy data is unavailable. Before completion, scan the final deck for contradictions between the estimated market and later economic slides.

### Step 6: Deck Assembly

1. Copy the reference template from `Skills/MarketingWebsiteSales/reference-packet-template/` to the session artifacts folder
2. Rename the folder to `{company-slug}-proposal/`
3. Modify `index.html` to substitute lead-specific content into each slide following the slide-by-slide structure above
4. **Keep the design system completely unchanged:** CSS variables, `@font-face` declarations, all CSS rules, JavaScript navigation, and the `bvp-deck-assets/` folder
5. Preserve all caveats and evidence labels in the deck content
6. Update the `<title>` tag to reflect the new company name
7. Update the nav counter text (default: `1 / 16`)
8. Populate market and economics slides only from `market-economics-ledger.json`; do not independently rewrite or approximate those values during slide assembly

### Step 7: Antigravity Enhancement

1. Check `ToGetAntigravityAuthStatus` — confirm agy is installed and authenticated
2. Set working directory to the deck's folder via `ToSetAntigravityWorkingDirectory`
3. Start a fresh conversation with `ToStartNewAntigravityConversation` using model "Gemini 3.1 Pro (High)"
4. Send the deck to `ToTalkToAntigravity` with instructions to:
   - Preserve the existing design system (CSS variables, Glancyr font, purple palette, 1280×720 canvas, slide transitions)
   - Polish copy while preserving all caveats and evidence labels
   - Preserve every market/economics figure, range, equation, evidence label, and caveat from `market-economics-ledger.json`; presentation may improve, but numeric meaning may not change
   - Ensure all image references are correct
   - Optimize for print/PDF
   - Keep it self-contained (inline CSS/JS, images and fonts from assets folder)
5. Save as `index-v2.html` in the same directory

### Step 8: Validation

1. Verify all `<img>` tags in the final file reference correct asset paths (`bvp-deck-assets/...`)
2. Confirm all image files exist on disk (including fonts)
3. Verify all 16 slides are present and properly numbered
4. Verify the `<title>` tag reflects the correct company name
5. Validate the final post-Antigravity HTML against `market-economics-ledger.json`: required market figures exist, low/base/high scenarios exist, displayed arithmetic is consistent, and forbidden refusal/contradiction language is absent
6. Copy the validated deck, ledger, and all assets to the current session's `artifacts/` folder for easy access
7. Report the final artifact path

---

## Evidence-State Labels (Required)

Every claim in the deck and summary must be labeled with one of:
- **Verified** — Confirmed through direct observation (raw HTML fetch, DNS lookup, CRM data, WHOIS record)
- **Observed** — Found in a single source but not independently confirmed
- **Estimated** — Approximation from general knowledge, not verified against primary sources
- **Not verified** — Cannot be confirmed with available tools

## Caveats (Required in Deck)

1. Revenue estimates are approximations based on public data — not verified financial projections
2. Absence of remote care services on the website does not prove they are not offered — may be available offline or through patient portal
3. Market population figures are estimates — not verified against Census or CMS data
4. Email patterns are observed/tentative — not independently verified unless SMTP confirmation succeeded
5. CPT reimbursement rates are approximate — verify against current CMS Physician Fee Schedule before presenting as definitive

---

## Component Actions (Reuse, Do Not Reimplement)

- `LeadAutomation_GetLeadsBySearch` — CRM lead search
- `LeadAutomation_GetLeadAndNotesAsMarkdown` — CRM lead details + notes
- `ToSearchFeedingFrenzyLeadsByEmail` — CRM email search
- `ToAnalyzeExistingWebsiteForImprovementsSkill` — Website audit (validated)
- `ToCreateWebsiteAnalysisSalesPacketSkill` — Full sales packet packaging (validated, optional)
- `ToRunValidatedPromptSkill` — Validated prompt runner
- `ToTalkToAntigravity` — Gemini Pro deck enhancement
- `ToSetAntigravityWorkingDirectory` — Antigravity working directory
- `ToStartNewAntigravityConversation` — Fresh Gemini conversation
- `ToGetAntigravityAuthStatus` — Antigravity auth check

---

## Acceptance Criteria

- [ ] Deck saved to session `artifacts/` folder with all image and font assets
- [ ] All `<img>` references resolve to existing files in `bvp-deck-assets/`
- [ ] All `@font-face` references resolve to existing OTF files in `bvp-deck-assets/fonts/`
- [ ] All 16 slides present and properly numbered (N / 16)
- [ ] `<title>` tag reflects the correct company name
- [ ] Every claim labeled with evidence state (verified/observed/estimated/not verified)
- [ ] `market-economics-ledger.json` exists and records population, Medicare, physician, clinic/office, capture, patient, per-patient billing, and low/base/high annual gross-billing assumptions and results
- [ ] Market slide contains population, estimated Medicare beneficiaries, estimated physicians, and estimated physician offices/clinics with visible bases or arithmetic
- [ ] Economics slide carries the same Medicare market into explicit low/base/high capture, patient, per-patient, and annual gross-billing scenarios
- [ ] Final post-Antigravity slide values match the ledger within ordinary display rounding
- [ ] No later slide contradicts computable directional estimates with `TBD`, `cannot estimate`, `no dollar estimates can be provided`, or equivalent refusal language
- [ ] All 5 required caveats present in the deck
- [ ] Deck opens in a browser with no broken images or fonts
- [ ] Design system matches reference template (purple palette, Glancyr font, 1280×720 canvas, slide transitions, navigation)
- [ ] CSS variables, `@font-face`, JavaScript navigation, and `bvp-deck-assets/` folder unchanged
- [ ] Summary of findings provided with evidence-state labels
- [ ] CRM lead data referenced where available (LeadID noted in output)
- [ ] Antigravity/Gemini Pro enhancement applied (if available)
- [ ] Print/PDF optimization included
- [ ] Static slides (3, 12, 14, 15) use standard content without lead-specific modifications
- [ ] Contact card on slide 16 shows correct sales rep or default to Justin Brochetti
