# Create Pharmacy Growth Proposal Deck

## Purpose

Produce a polished, independently validated, 16-slide HTML proposal deck for an independent pharmacy lead. The deck uses a fixed reference design system while choosing a customer-friendly narrative from the prospect's actual size, digital maturity, reputation, social presence, and clinical-services opportunity. Detailed evidence and arithmetic remain authoritative in the supporting ledger and evidence summary; the visible deck should read like a clear owner conversation rather than an audit report.

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

## Prospect Classification and Narrative Routing

Classify the prospect before selecting slide copy or cadence. Record this routing decision in the evidence summary.

Required classification dimensions:

- Single-location, small multi-location, or enterprise/multi-location operator.
- Owner-operated or manager/committee-led.
- No functioning standalone website, weak website, or established website.
- Strong, developing, weak, or unavailable social presence.
- Strong, developing, weak, or unavailable public-reputation evidence.
- Retail/gift merchandising or other non-prescription product activity.
- Current clinical-services maturity.
- Meaningful rural-care, physician-access, or provider-partnership pressure.
- Website-growth opportunity, remote-care opportunity, or both.

Choose the narrative from the evidence:

- **No website + strong social/reputation:** open with what the pharmacy has already built. Present the website as an owned, searchable home behind successful social channels, never as a replacement for them.
- **Weak existing website:** open with customer experience, local discovery, and concrete missed actions. Use technical findings only to support plain-language business consequences.
- **Established website + clinical-services gap:** shorten the website section and introduce remote care earlier.
- **Single-location / owner-operated:** use small steps, direct benefits, manageable workload, and one-pharmacy language. Never use multi-location rollout language.
- **Multi-location operator:** use consistency, location pages, rollout sequencing, and scale language only when location evidence supports it.
- **Both opportunities are meaningful:** present two distinct but connected paths—get found and convert interest online; support patients between visits through remote care. Each path may stand alone, run in sequence, or launch together. Neither may be reduced to an afterthought.

Do not infer youth, ownership style, sophistication, or budget from appearance alone. Use CRM, public evidence, and the prospect's observable operating model.

## Customer-Language Contract

- Lead with the prospect's strengths and opportunity, not Intelligence Factory.
- Normally introduce Intelligence Factory and FairPath after the reader understands why the proposal matters, around slides 7–9.
- Every title must be immediately understandable when spoken aloud to an independent pharmacy owner.
- Prefer concrete nouns and actions. Avoid consulting, procurement, audit, and software jargon in visible headings.
- Do not use customer-facing headings such as `illustrative capture scenarios`, `explicit capture assumptions`, `operating motion`, `gated`, `evidence-backed`, `credible comparison`, `readiness gate`, `controlled enrollment`, `evidence review`, `systemwide rollout`, or `validation workshop`.
- Prefer `What patient participation could mean`, `Three simple starting points`, `Two paths that work together`, `Check-ins at 30, 60, and 90 days`, `Start with a manageable patient group`, and `Review what worked`.
- If meaningful social proof exists, place the strongest screenshot or reputation proof on slide 2 or 3. Show identity and key metrics, add three compact proof points, and caption it positively. Do not claim organic reach, ad spend, or conversion performance without evidence.
- Remove `Confidential` by default. Add it only when the user or a real business requirement calls for it.

## Evidence and Disclaimer Separation

The ledger and evidence summary—not the visible deck—carry the full audit machinery.

- Keep source years, URLs, evidence states, formulas, rate bases, operational caveats, and detailed uncertainty in `market-economics-ledger.json` and `evidence-summary.md`.
- Keep the visible deck accurate, internally consistent, and non-misleading, but conversational.
- Use only short qualifications that materially affect the buying decision: financial examples are not promises; remote care depends on patient, payer, staffing, and operational fit; final scope and pricing are agreed before work begins.
- Do not repeat `Verified`, `Observed`, `Estimated`, `Not verified`, evidence-file counts, audit methodology, email-pattern uncertainty, or long payer/compliance caveats across customer-facing slides.
- Do not hide uncertainty. Express it in plain language or move the detail to the evidence summary without turning a directional example into a guarantee.

## Slide-by-Slide Structure (16 slides)

Each slide is a `<section class="slide [lt|dk] [top]" aria-roledescription="slide" aria-label="...">` with:
- `<div class="s-num">N / 16</div>` — slide number
- `<div class="chrome-logo">` with logo `<img>` (light slides: `fairpath-logo.png`, dark slides: `fairpath-logo-dark.png`)
- `<div class="foot">` with left context text and right `<span class="fr">Intelligence Factory · FairPath</span>`

### Slide 1 — Cover (dark, top-aligned)

**Layout:** Dark slide with FairPath dark logo top-left, large title block, bottom row with "Prepared for" (left) and "Presented by" (right).

**Content to substitute:**
- Eyebrow: `{One-Part|Two-Part} Growth Plan for {Company} · {Month Year}`.
- H1: a prospect-first statement. When both paths apply, prefer `You've already earned {Market}'s trust.` + `<br>` + `<span style="color:#B78AFF">Here are two ways to build on it.</span>`.
- Lead paragraph: summarize the selected path(s) in plain language. Do not force a location count into the sentence.
- "Prepared for" block: verified CRM or public decision-maker names and titles. Do not fill empty slots or infer titles.
- "Presented by" block: FairPath logo image.
- Footer: one short statement of the selected path(s), not a confidentiality or methodology notice.

### Slide 2 — Prospect Strength / Social Proof (light)

**Layout:** Choose the best evidence-led opener. Prefer a 58% narrative / 42% screenshot split when strong social or reputation proof exists; otherwise use a balanced card grid.

**Content to substitute:**
- Eyebrow: `What You've Already Built`, `What's Already Working`, or another prospect-specific strength label.
- H2: a warm proof-led title such as `Your customers already love you online`.
- Lead: explain the existing trust, reputation, social audience, service strength, or local position before discussing gaps.
- If using a screenshot, copy it into the deck assets, preserve its important identity/metric region, and add three compact evidence-backed proof points.
- Caption: observational and positive, for example `Your Facebook page today—real trust, real activity, and content ready to build from.`
- Never use `not a {N}-location leap`, rebut an objection the deck has not established, or lead with a decision request.

### Slide 3 — The Gap (light)

**Layout:** Eyebrow + h2 + plain-language lead, then three concrete consequence cards and one next-step strip.

**Content to substitute:**
- For no-website prospects: explain gently that social trust has no owned, searchable home and that people outside the current following have a discovery gap.
- For weak websites: describe the customer actions that are difficult today rather than leading with framework or crawl terminology.
- For established websites: use this slide for the most important remaining growth gap.
- Do not introduce Intelligence Factory here unless the prospect already knows the opportunity and the user explicitly prefers an early introduction.

### Slide 4 — The Practical Website Move (light)

**Layout:** Use a three-card benefit layout for no-website prospects or the score-panel layout only when a retrievable site and real scored audit exist.

**Content to substitute:**
- No website: `A website built from what you already have`; show the existing photos/posts/reviews/voice, core customer actions, and a small first scope.
- Weak website: state the clearest customer/business consequence and the practical fix; technical architecture belongs in supporting evidence.
- Established website: show the next conversion/local-search improvement rather than forcing a rebuild story.
- Never manufacture a technical score, architecture claim, or crawl finding when no retrievable site exists.

### Slide 5 — What the Website Adds (light)

**Layout:** Eyebrow + h2 + lead, then 3-column grid of 6 cards with SVG icons.

**Content to substitute:**
- H2: explain the owner/customer value in plain language, for example `What a website can do that social media can't`.
- For social-first prospects, explain owned search visibility, one permanent information source, measurable actions, and durable content without diminishing Facebook or Instagram.
- For website prospects, highlight actual strengths and show how the proposal builds on them.
- Use only evidence-supported examples; do not carry template strengths into a new lead.

### Slide 6 — Immediate Opportunity (light)

**Layout:** Prefer three outcome cards. Use an issue table only when a real website audit produced substantive, customer-relevant findings.

**Content to substitute:**
- H2: state the opportunity, for example `Help more {Market} neighbors find you`.
- Use `Find`, `Trust`, and `Act` or similarly concrete customer outcomes.
- If an issue table is warranted, limit it to the 3–5 issues that affect customer discovery or action. Keep audit counts and technical detail in the evidence summary.

### Slide 7 — Local Market / Care Need (light)

**Layout:** Market metrics plus three practical opportunity cards. Use a competitor table only when direct, comparable evidence materially helps the sale.

**Content to substitute:**
- Website-led path: show the local population and practical discovery opportunity.
- Remote-care or two-path proposal: connect the Medicare-age market, physician/clinic context, and any evidence-supported access pressure to patient support between visits.
- Do not use categorical competitor yes/no cells without direct evidence. Unknown capabilities belong in the evidence summary, not as a customer-facing matrix of `Not verified` cells.

### Slide 8 — Who Is Behind the Plan (light)

**Layout:** Two balanced cards for Intelligence Factory and FairPath after the prospect opportunity has been established.

**Content to substitute:**
- H2: use plain language such as `A small team helping independent pharmacies grow online and in patient care`.
- Keep total narrative copy under 70 words outside labels.
- For a two-path proposal, label the cards `Path 1 · Get found online` and `Path 2 · Support patients remotely` and explain how each can stand alone or work together.
- For a one-path proposal, keep the unused service secondary rather than forcing equal weight.

### Slide 9 — Remote Care Opportunity (dark)

**Layout:** 2-column grid (1fr / 0.92fr). Left: eyebrow + h2 + lead + 3 service cards. Right: FairPath eligibility screenshot in `.frame` + source tag + caveat.

**Content to substitute:**
- Eyebrow: `Path 2 · Remote Care` when both paths apply, or another plain-language service label.
- H2: explain the patient and pharmacy value, for example `A new way to support patients—and grow beyond the counter`.
- Lead: connect evidence-supported local care needs and current pharmacy strengths to patient check-ins between visits.
- 3 service cards:
  1. **RPM** — Bluetooth devices, CPT 99453/99454/99457
  2. **CCM** — Monthly care coordination, CPT 99490
  3. **AWV** — Health-risk assessments, G0438/G0439
- Right: `fairpath-eligibility-score.jpg` in a `.frame` with caption
- Source tag: `FairPath product interface · fairpath.ai` when useful.
- State in plain language that the service should start with a manageable patient group and grow only when the team is ready. Put detailed operational qualification in the evidence summary.
- Footer: one patient/pharmacy value statement, not an internal CRM classification.

### Slide 10 — Remote-Care Growth Examples (light)

**Layout:** Prioritize one clear scenario table or three scenario cards. Keep technical rate detail in the ledger unless the user asks for it.

**Content to substitute:**
- H2: `What patient participation could mean for the pharmacy` or another immediately understandable title.
- Table labels: Starting point | Share who join | Patients | Example per patient/year | Example annual billing.
- Scenario labels: `A Cautious Start`, `Steady Growth`, `Strong Participation`, mapped to the ledger's low/base/high values.
- Never use `patients per location` for a single-location lead. Use per-location scenarios only when multi-location evidence and the ledger support them.
- Keep the ledger's exact market rate, patient count, per-patient value, equation, and annual total.
- Visible qualification: `Examples only—not a promise. Actual results depend on patient participation, services provided, and current reimbursement.`
- Do not present annual billing as net revenue, profit, or guaranteed income.

### Slide 11 — How the Paths Work Together (light)

**Layout:** Eyebrow + h2, then two or three cards showing the selected path and sequence.

**Content to substitute:**
- H2: `Two paths that work together` when both opportunities apply.
- Show `Website first`, `Remote care first`, and `Both together` as legitimate choices when the evidence supports both paths.
- Explain how the website can turn social attention and search traffic into customer actions and remote-care interest without implying that remote care requires a website rebuild.
- For one-path proposals, use this slide for a simple sequence of practical improvements instead of showing an irrelevant second path.
- Do not use `operating motion`, `readiness gate`, or enterprise rollout language for a small independent pharmacy.

### Slide 12 — FairPath Platform (dark)

**Layout:** 2-column grid (0.78fr / 1fr). Left: eyebrow + h2 + bullet list + source tag. Right: `fairpath-unified-work-queue.jpg` in `.frame` with caption.

**Content to substitute:**
- H2: `A manageable way to support patients between visits` or another team-centered title.
- Explain who handles patient outreach, device or service coordination, documentation, scheduling, and billing support. Distinguish verified platform capabilities from pharmacy responsibilities.
- Bullet examples: Patient intake, outreach queue, device assignment when applicable, care coordination, scheduling, messaging, and billing reports.
- Right: product screenshot with caption
- Footer left: one plain-language workload or patient-support benefit.

### Slide 13 — 90-Day Start (light)

**Layout:** 2-column grid (1fr / 1fr). Left: timeline rows. Right: success measures table + strip.

**Content to substitute:**
- H2: `A 90-day start with check-ins along the way`.
- Timeline:
  - DAYS 1–30: Build the foundation and agree on the first patient/customer actions.
  - DAYS 31–60: Launch a manageable first group and learn from real use.
  - DAYS 61–90: Review what worked and choose the next step.
- For two-path proposals, include visible work for both the website and remote-care path. For a single path, remove the unused work rather than leaving placeholder milestones.
- Success measures must fit the route: customer calls, directions, form activity, social-to-site visits, participating patients, completed outreach, or another measurable evidence-backed result.
- Use per-location targets only for verified multi-location prospects. Never imply a small pharmacy must commit systemwide before seeing results.

### Slide 14 — Scope and Pricing Conversation (light)

**Layout:** Eyebrow + h2, then 3-column grid of pricing cards, then strip + caveat.

**Content to substitute:**
- Show separate cards for `Website`, `Remote care`, and `Both together` when both paths apply; show only relevant scope for a one-path proposal.
- Use confirmed pricing only. Do not carry static package pricing, per-location fees, or implementation assumptions into a lead without validation.
- If pricing is not confirmed, describe what each scope includes and state that final scope and pricing will be agreed before work begins.
- Keep one short material qualifier; detailed exclusions and assumptions belong in the evidence summary.

### Slide 15 — Why One Partner (light)

**Layout:** Eyebrow + h2, then 3-column grid of 6 cards with SVG icons.

**Content to substitute:**
- H2: explain the practical benefit of continuity across online presence, outreach, measurement, and remote-care administration.
- Use 3–6 concise capabilities supported by the actual proposed scope. Avoid generic self-praise and procurement language.
- Keep the prospect and the work ahead central; this is supporting rationale, not a second company introduction.

### Slide 16 — Choose a Starting Path (dark)

**Layout:** 2-column grid (1fr / 0.9fr). Left: eyebrow + h2 + 3 step rows. Right: contact card + FairPath logo.

**Content to substitute:**
- H2: `Which path should we start with?` when both opportunities apply.
- Options: `Website first`, `Remote care first`, and `Both together`, each with one concrete first action.
- For a one-path proposal, ask for one simple next step instead of presenting false choices.
- Contact card: sales rep name, title, email, websites
  - Default: `Justin Brochetti` · `Chief Executive Officer · Intelligence Factory` · `justin@intelligencefactory.ai`
  - Override with assigned sales rep if different
- Footer left: one warm next-step statement. Keep methodology and detailed qualification in the evidence summary.

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
