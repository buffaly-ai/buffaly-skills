# Create Pharmacy Growth Proposal Deck

## Purpose and Overview

Produce a polished, independently validated, 16-slide HTML proposal deck using the pharmacy/FairPath growth framework. The normal target is a pharmacy lead, but the workflow may also serve a pharmacy operator, pharmaceutical company, healthcare organization, or another prospect when the user explicitly authorizes this framework. The deck uses a fixed reference design system while choosing a customer-friendly narrative from the prospect's actual business type, size, digital maturity, reputation, social presence, current website maturity, sourced competitor context, pharmacy/healthcare fit, and applicable clinical-services opportunity. Detailed evidence and arithmetic remain authoritative in the supporting ledger and evidence summary; the visible deck should read like a clear decision-maker conversation rather than an audit report.

The native workflow must produce the final buyer-ready deck directly. Do not rely on an external model or polish agent to fix readability, flow, organization, or visual hierarchy; Claude, Antigravity, Gemini, and similar tools are not a required completion stage.

This is the single user-facing pharmacy proposal workflow. The user should not have to separately ask for a website audit before requesting the deck. The workflow must first resolve the official website identity. If a confirmed official website exists, run or reuse `ToAnalyzeExistingWebsiteForImprovementsSkill` as the canonical website-audit feeder and condense its relevant outputs into the deck evidence. If no official website is confirmed, skip the website-audit feeder and build the website portion from verified public-profile/social/directory evidence and the no-owned-site opportunity. Never duplicate a separate lightweight audit in place of the canonical feeder when a confirmed official site is available.

Target conversation: what we verified about the prospect, what its current website shows, what relevant market options show online, the specific gap, the practical growth paths that actually fit, and the safest first 90-day decision.

## Inputs

The user provides one of:
- A Feeding Frenzy LeadID (preferred) -- pull lead data via `LeadAutomation_GetLeadAndNotesAsMarkdown` using `FeedingFrenzyJsonWsService#Remote`
- A company name with optional website URL (fallback) -- research the company directly and resolve the official website when missing or uncertain

Optional presenter selection:
- `PresenterMode`: `IntelligenceFactoryDirect` (default) or `ClearSpanPartner`.
- When `PresenterMode` is omitted, blank, or not explicitly supplied, use `IntelligenceFactoryDirect`. Do not infer ClearSpan from prior runs, the prospect, or the presence of the partner template.
- Use `ClearSpanPartner` only when the user or run input explicitly selects it.

## Outputs

A self-contained HTML proposal deck (index.html + assets folder) saved to the current session's `artifacts/` folder, plus a summary of findings with evidence-state labels.

The proposal output folder must also include:
- `proposal-run-profile.json` - the resolved presenter mode, selected template path, presenter identity, contact identity, prompt version, and run/lead identity used by every slide and final artifact.
- `proposal-research-packet.md` - the orchestration ledger for lead identity, website resolution, audit feeder status/reuse, public-profile evidence, selected visuals, competitor evidence, AI/LLM-answer evidence, and slide-use decisions.
- `evidence-summary.md` - source evidence, caveats, and claim labels.
- `market-economics-ledger.json` - authoritative numeric contract for market sizing and economics.
- `competitor-comparison-ledger.md` - named checked competitors/profiles when public comparison evidence is available.
- current-site screenshots when a confirmed official website is audited, or public-profile/social/directory screenshots when no official website is confirmed and those profiles are used in the deck.

---

### Reference Template Location

The default Intelligence Factory direct template lives at:
```
Skills/MarketingWebsiteSales/reference-packet-template/
```

The ClearSpan partner template lives at:
```
Skills/MarketingWebsiteSales/reference-packet-template-clearspan/
```

Resolve exactly one template from `PresenterMode` before producing Slide 1. Record the selection in `proposal-run-profile.json`, and use that same profile for all 16 slide artifacts, assembly, validation, and reruns. A step rerun must not change presenter mode unless the run input is deliberately changed and all brand-dependent slides are invalidated.

#### Asset Inventory (copy as-is, do not modify)

```
reference-packet-template/
- index.html                          - 16-slide packaged reference deck with placeholders and a remote-care-general proof-period slide
- IMPLEMENTATION_NOTES.md             - slide-by-slide build notes, required evidence, screenshot guidance, and QA rules
- slide-content-contract.json         - machine-readable slide plan, required inputs, visuals, and validation cues
- bvp-deck-assets/
  - intelligence-factory-logo.png     - IF logo (light background)
  - fairpath-logo.png                 - FairPath logo (light background)
  - fairpath-logo-dark.png            - FairPath logo (dark background)
  - fairpath-unified-work-queue.jpg   - FairPath platform screenshot (work queue dashboard)
  - fairpath-eligibility-score.jpg    - FairPath platform screenshot (patient eligibility scoring)
  - fonts/
    - Glancyr-Regular.otf             - Custom heading font (weight 400)
    - Glancyr-Medium.otf              - Custom heading font (weight 500)
    - Glancyr-SemiBold.otf            - Custom heading font (weight 600)
- website-growth-visuals/             - bundled placeholder website-evidence visuals used by the reference template; replace with lead-specific screenshots when available
```

The `bvp-deck-assets/` folder name is kept as-is in all decks. It contains shared brand assets that do not change between leads. Copy `IMPLEMENTATION_NOTES.md`, `slide-content-contract.json`, and any referenced placeholder visual folders with the template so the work prompt, template, assets, and build contract travel together as one package.

---

### Design System (from reference template -- do not change)

#### CSS Custom Properties (brand tokens)

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

#### Fonts

- **Headings:** Glancyr (custom OTF, bundled in `bvp-deck-assets/fonts/`)
- **Body:** Inter, "Segoe UI", system-ui, Arial, sans-serif
- `@font-face` declarations for weights 400, 500, 600

#### Canvas

- Fixed 1280x720 stage, scaled to viewport via JavaScript `transform: scale()`
- Slides positioned absolutely, toggled via `.active` class
- Transitions: opacity 0.45s ease, transform 0.45s ease

#### Slide Backgrounds

- `.lt` -- light: white with subtle purple radial gradients
- `.dk` -- dark: `--dark` (#0B1020) with purple radial gradients + dotted grid pattern overlay

#### Reusable CSS Classes

| Class | Purpose |
|---|---|
| `.slide` | Base slide container (absolute, 1280x720, padding 52px 64px 60px) |
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
| `.icon` | 34x34 rounded icon container with SVG |
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

#### Navigation JavaScript

The deck includes a self-executing IIFE that handles:
- Viewport scaling (`fit()` function)
- Slide navigation (arrow keys, space, PageUp/Down, Home/End, touch swipe, button clicks)
- URL hash sync (`#1` through `#16`)
- Idle auto-hide for nav controls (3.5s timeout)
- Print support (`@media print` with page-break-after)

**Do not modify the JavaScript or CSS structure.** Only substitute content within slide sections.

---

### Presenter Profiles and Customer-Language Contract

- `IntelligenceFactoryDirect` is the default. Present the deck as Intelligence Factory with FairPath, use the packaged Intelligence Factory/FairPath logos and footer treatment, and default to `Justin Brochetti`, `Chief Executive Officer - Intelligence Factory`, `justin@intelligencefactory.ai` unless the lead's assigned sales representative is explicitly selected.
- `ClearSpanPartner` is opt-in. Present the deck as ClearSpan with FairPath, use the typographic wordmark `ClearSpan` with the smaller qualifier `with FairPath`, and use the verified ClearSpan contact supplied by the run input or lead context. Do not select this profile merely because ClearSpan appears in history or supporting evidence.
- Never mix presenter profiles within a deck. Presenter name, logo/wordmark, contact, footer, Slide 1 treatment, Slide 2 value proposition, and Slide 16 close must all match `proposal-run-profile.json`.
- Lead with the prospect's remote-care opportunity and verified fit, not company brag language.
- Normally introduce the selected presenter and FairPath after the reader understands why the proposal matters, around slides 7-9.
- Every title must be immediately understandable when spoken aloud to the prospect's actual decision-maker. Use independent-pharmacy-owner language only for a verified independent pharmacy.
- Prefer concrete nouns and actions. Avoid consulting, procurement, audit, and software jargon in visible headings.
- Do not use customer-facing headings such as `illustrative capture scenarios`, `explicit capture assumptions`, `operating motion`, `gated`, `evidence-backed`, `credible comparison`, `readiness gate`, `controlled enrollment`, `evidence review`, `systemwide rollout`, or `validation workshop`.
- Prefer `What patient participation could mean`, `Three simple starting points`, `Two paths that work together`, `Check-ins at 30, 60, and 90 days`, `Start with a manageable patient group`, and `Review what worked`.
- If meaningful social proof exists, place the strongest screenshot or reputation proof on slide 2 or 3. Show identity and key metrics, add three compact proof points, and caption it positively. Do not claim organic reach, ad spend, or conversion performance without evidence.
- Remove `Confidential` by default. Add it only when the user or a real business requirement calls for it.
- Do not show CRM/process metadata on customer-facing slides: no LeadID, internal status, follow-up timestamp, tool names, workflow names, likely PIC, No new mockup, Shortcoming visual, or production commentary.
- Do not include generated redesign/mockup screenshots by default. Prefer current-site proof, readable current-site crops, audit-gap cards, sourced competitor comparison, and action/readiness visuals.

### Evidence and Disclaimer Separation

The ledger and evidence summary--not the visible deck--carry the full audit machinery.

- Keep source years, URLs, evidence states, formulas, rate bases, operational caveats, and detailed uncertainty in `market-economics-ledger.json` and `evidence-summary.md`.
- Keep the visible deck accurate, internally consistent, and non-misleading, but conversational.
- Use only short qualifications that materially affect the buying decision: financial examples are not promises; remote care depends on patient, payer, staffing, and operational fit; final scope and pricing are agreed before work begins.
- Do not repeat `Verified`, `Observed`, `Estimated`, `Not verified`, evidence-file counts, audit methodology, email-pattern uncertainty, or long payer/compliance caveats across customer-facing slides.
- Do not hide uncertainty. Express it in plain language or move the detail to the evidence summary without turning a directional example into a guarantee.

#### Required Supporting Ledgers

Create these source files in the proposal output folder before final deck assembly:
1. market-economics-ledger.json - authoritative numeric contract for market sizing and economics.
2. proposal-research-packet.md - orchestration ledger for lead identity, website resolution, audit feeder status/reuse, public-profile evidence, selected visuals, competitor evidence, AI/LLM-answer evidence, and slide-use decisions.
3. evidence-summary.md - identity, website, lead, service, market, and caveat evidence.
4. competitor-comparison-ledger.md - required whenever a functioning website exists or public profiles can be checked.

The competitor ledger must name checked competitors/profiles, source URLs or public identifiers, observed/not-found facts, and caveats. It is not a map-pack/ranking/review audit unless those facts were actually collected. The visible deck must summarize named checked examples, not generic categories alone.

Create an AI/LLM-answer-readiness section inside `proposal-research-packet.md`. Check whether the official website or verified public profiles expose clear facts that answer common patient prompts such as `{pharmacy name} hours`, `{pharmacy name} refill`, `independent pharmacy near {town}`, `{town} pharmacy vaccines`, and `{town} pharmacy delivery` when those services are relevant. Record only observable facts: whether the pharmacy's own site/profile provides a clear answer, whether competitor/public profiles expose clearer answers, and which missing facts should be fixed. Do not claim actual ChatGPT/Google AI rankings, citations, or answer share unless those outputs were directly captured.

#### Deck Evidence Routing Map

Use this map before slide assembly so research does not become generic appendix material:

- Slide 2: selected presenter with FairPath value proposition - make more money by adding services and attracting patients; cut costs/save time through automation and one connected platform.
- Slide 8: strongest positive proof about the pharmacy today - social proof, reputation, local service strength, storefront/profile evidence, CRM/enrichment evidence, or current-site identity evidence.
- Slide 9: the main current online-presence gap - no owned website, weak customer actions, or the strongest remaining growth gap for an established site, with a readable current-site/profile visual when available.
- Slide 10: metric-driven website scorecard - real scored audit metrics only when a confirmed official website and feeder audit exist; otherwise use outcome cards without fabricated scores.
- Slide 11: what the website adds - durable owned information, measurable customer actions, and content that social/profile pages cannot fully own.
- Slide 12: website and AI-answer opportunity - patient questions the current site/profile answers clearly or fails to answer clearly; one compact competitor/public-profile contrast may appear here.
- Slide 13: sourced competitor comparison - named checked competitors/profiles, practical patient-action dimensions, and the required no-ranking/no-review-audit caveat.
- Slide 3: remote-care-general proof period - a lower-risk 90-day way to prove remote care with a manageable first patient group, team training, measured readiness, and control. This slide is never CCM-only and never says CCML.
- Slide 4: remote care opportunity - all five program options (RPM, CCM, AWV, RTM, APCM) with APCM and RTM visible alongside RPM/CCM/AWV.
- Slide 5: FairPath platform / workflow - eligibility scoring, priority queue, outreach/documentation workflow, and billing-support evidence.
- Slide 6: local market / opportunity size - population, Medicare, physicians, and clinic/office estimates only.
- Slide 7: economics / growth examples - low/base/high participation scenarios from `market-economics-ledger.json` only.
- Slide 14: growth recap - make more money by adding services and attracting patients; cut costs/save time through automation and one platform.
- Slide 15: two paths - remote care can score patients within five business days and first patients can begin within 30 days when inputs/fit are ready; website work can start now with a new website by next week and SEO/LLM/reputation improvements after launch.
- Slide 16: choose a starting path - website first, remote care first, or both together.

Do not move competitor comparison before slide 13, proof-period framing out of slide 3, market sizing before slide 6, or economics before slide 7. If an evidence type is unavailable, leave that slide's unsupported details out rather than borrowing static template copy.

### Slide-by-Slide Structure (16 slides)

Each slide is a `<section class="slide [lt|dk] [top]" aria-roledescription="slide" aria-label="...">` with:
- `<div class="s-num">N / 16</div>` - slide number
- `<div class="chrome-logo">` with logo `<img>` (light slides: `fairpath-logo.png`, dark slides: `fairpath-logo-dark.png`)
- `<div class="foot">` with left context text and right `<span class="fr">Intelligence Factory · FairPath</span>`

#### Slide 1 - Cover (dark, top-aligned)

**Layout:** Dark slide with FairPath dark logo top-left, large title block, bottom row with "Prepared for" (left) and "Presented by" (right).

**Content to substitute:**
- Eyebrow: `{One-Part|Two-Part} Growth Plan for {Company} · {Month Year}`.
- H1: a prospect-first statement. When both paths apply, prefer `You've already earned {Market}'s trust.` + `<br>` + `<span style="color:#B78AFF">Here are two ways to build on it.</span>`.
- Lead paragraph: summarize the selected path(s) in plain language. Do not force a location count into the sentence.
- "Prepared for" block: verified CRM or public decision-maker names and titles. Do not fill empty slots or infer titles.
- "Presented by" block: FairPath logo image.
- Footer: one short statement of the selected path(s), not a confidentiality or methodology notice.

#### Slide 2 - Prospect Strength / Social Proof (light)

**Layout:** Choose the best evidence-led opener. Prefer a 58% narrative / 42% screenshot split when strong social or reputation proof exists; otherwise use a balanced card grid.

**Content to substitute:**
- Eyebrow: `What You've Already Built`, `What's Already Working`, or another prospect-specific strength label.
- H2: a warm proof-led title such as `Your customers already love you online`.
- Lead: explain the existing trust, reputation, social audience, service strength, or local position before discussing gaps.
- If using a screenshot, copy it into the deck assets, preserve its important identity/metric region, and add three compact evidence-backed proof points.
- Caption: observational and positive, for example `Your Facebook page today-real trust, real activity, and content ready to build from.`
- Never use `not a {N}-location leap`, rebut an objection the deck has not established, or lead with a decision request.

#### Slide 3 - The Gap (light)

**Layout:** Eyebrow + h2 + plain-language lead, then three concrete consequence cards and one next-step strip.

**Content to substitute:**
- For no-website prospects: explain gently that social trust has no owned, searchable home and that people outside the current following have a discovery gap.
- For weak websites: describe the customer actions that are difficult today rather than leading with framework or crawl terminology.
- For established websites: use this slide for the most important remaining growth gap.
- Do not introduce Intelligence Factory here unless the prospect already knows the opportunity and the user explicitly prefers an early introduction.

#### Slide 4 - The Practical Website Move (light)

**Layout:** Use a three-card benefit layout for no-website prospects or the score-panel layout only when a retrievable site and real scored audit exist.

**Content to substitute:**
- No website: `A website built from what you already have`; show the existing photos/posts/reviews/voice, core customer actions, and a small first scope.
- Weak website: state the clearest customer/business consequence and the practical fix; technical architecture belongs in supporting evidence.
- Established website: show the next conversion/local-search improvement rather than forcing a rebuild story.
- Never manufacture a technical score, architecture claim, or crawl finding when no retrievable site exists.

#### Slide 5 - What the Website Adds (light)

**Layout:** Eyebrow + h2 + lead, then 3-column grid of 6 cards with SVG icons.

**Content to substitute:**
- H2: explain the owner/customer value in plain language, for example `What a website can do that social media can't`.
- For social-first prospects, explain owned search visibility, one permanent information source, measurable actions, and durable content without diminishing Facebook or Instagram.
- For website prospects, highlight actual strengths and show how the proposal builds on them.
- Use only evidence-supported examples; do not carry template strengths into a new lead.

#### Slide 6 - Immediate Opportunity (light)

**Layout:** Prefer three outcome cards. Use an issue table only when a real website audit produced substantive, customer-relevant findings.

**Content to substitute:**
- H2: state the opportunity, for example `Help more {Market} neighbors find you`.
- Use `Find`, `Trust`, and `Act` or similarly concrete customer outcomes.
- If an issue table is warranted, limit it to the 3-5 issues that affect customer discovery or action. Keep audit counts and technical detail in the evidence summary.

#### Slide 7 - Local Market / Care Need (light)

**Layout:** Market metrics plus three practical opportunity cards. Use a competitor table only when direct, comparable evidence materially helps the sale.

**Content to substitute:**
- Website-led path: show the local population and practical discovery opportunity.
- Remote-care or two-path proposal: connect the Medicare-age market, physician/clinic context, and any evidence-supported access pressure to patient support between visits.
- Do not use categorical competitor yes/no cells without direct evidence. Unknown capabilities belong in the evidence summary, not as a customer-facing matrix of `Not verified` cells.

#### Slide 8 - Who Is Behind the Plan (light)

**Layout:** Two balanced cards for Intelligence Factory and FairPath after the prospect opportunity has been established.

**Content to substitute:**
- H2: use plain language such as `A small team helping independent pharmacies grow online and in patient care`.
- Keep total narrative copy under 70 words outside labels.
- For a two-path proposal, label the cards `Path 1 · Get found online` and `Path 2 · Support patients remotely` and explain how each can stand alone or work together.
- For a one-path proposal, keep the unused service secondary rather than forcing equal weight.

#### Slide 9 - Remote Care Opportunity (dark)

**Layout:** 2-column grid (1fr / 0.92fr). Left: eyebrow + h2 + lead + 3 service cards. Right: FairPath eligibility screenshot in `.frame` + source tag + caveat.

**Content to substitute:**
- Eyebrow: `Path 2 · Remote Care` when both paths apply, or another plain-language service label.
- H2: explain the patient and pharmacy value, for example `A new way to support patients-and grow beyond the counter`.
- Lead: connect evidence-supported local care needs and current pharmacy strengths to patient check-ins between visits.
- 3 service cards:
  1. **RPM** - Bluetooth devices, CPT 99453/99454/99457
  2. **CCM** - Monthly care coordination, CPT 99490
  3. **AWV** - Health-risk assessments, G0438/G0439
- Right: `fairpath-eligibility-score.jpg` in a `.frame` with caption
- Source tag: `FairPath product interface · fairpath.ai` when useful.
- State in plain language that the service should start with a manageable patient group and grow only when the team is ready. Put detailed operational qualification in the evidence summary.
- Footer: one patient/pharmacy value statement, not an internal CRM classification.

#### Slide 10 - Remote-Care Growth Examples (light)

**Layout:** Prioritize one clear scenario table or three scenario cards. Keep technical rate detail in the ledger unless the user asks for it.

**Content to substitute:**
- H2: `What patient participation could mean for the pharmacy` or another immediately understandable title.
- Table labels: Starting point | Share who join | Patients | Example per patient/year | Example annual billing.
- Scenario labels: `A Cautious Start`, `Steady Growth`, `Strong Participation`, mapped to the ledger's low/base/high values.
- Never use `patients per location` for a single-location lead. Use per-location scenarios only when multi-location evidence and the ledger support them.
- Keep the ledger's exact market rate, patient count, per-patient value, equation, and annual total.
- Visible qualification: `Examples only-not a promise. Actual results depend on patient participation, services provided, and current reimbursement.`
- Do not present annual billing as net revenue, profit, or guaranteed income.

#### Slide 11 - How the Paths Work Together (light)

**Layout:** Eyebrow + h2, then two or three cards showing the selected path and sequence.

**Content to substitute:**
- H2: `Two paths that work together` when both opportunities apply.
- Show `Website first`, `Remote care first`, and `Both together` as legitimate choices when the evidence supports both paths.
- Explain how the website can turn social attention and search traffic into customer actions and remote-care interest without implying that remote care requires a website rebuild.
- For one-path proposals, use this slide for a simple sequence of practical improvements instead of showing an irrelevant second path.
- Do not use `operating motion`, `readiness gate`, or enterprise rollout language for a small independent pharmacy.

#### Slide 12 - FairPath Platform (dark)

**Layout:** 2-column grid (0.78fr / 1fr). Left: eyebrow + h2 + bullet list + source tag. Right: `fairpath-unified-work-queue.jpg` in `.frame` with caption.

**Content to substitute:**
- H2: `A manageable way to support patients between visits` or another team-centered title.
- Explain who handles patient outreach, device or service coordination, documentation, scheduling, and billing support. Distinguish verified platform capabilities from pharmacy responsibilities.
- Bullet examples: Patient intake, outreach queue, device assignment when applicable, care coordination, scheduling, messaging, and billing reports.
- Right: product screenshot with caption
- Footer left: one plain-language workload or patient-support benefit.

#### Slide 13 - 90-Day Start (light)

**Layout:** 2-column grid (1fr / 1fr). Left: timeline rows. Right: success measures table + strip.

**Content to substitute:**
- H2: `A 90-day start with check-ins along the way`.
- Timeline:
  - DAYS 1-30: Build the foundation and agree on the first patient/customer actions.
  - DAYS 31-60: Launch a manageable first group and learn from real use.
  - DAYS 61-90: Review what worked and choose the next step.
- For two-path proposals, include visible work for both the website and remote-care path. For a single path, remove the unused work rather than leaving placeholder milestones.
- Success measures must fit the route: customer calls, directions, form activity, social-to-site visits, participating patients, completed outreach, or another measurable evidence-backed result.
- Use per-location targets only for verified multi-location prospects. Never imply a small pharmacy must commit systemwide before seeing results.

#### Slide 14 - Scope and Pricing Conversation (light)

**Layout:** Eyebrow + h2, then 3-column grid of pricing cards, then strip + caveat.

**Content to substitute:**
- Show separate cards for `Website`, `Remote care`, and `Both together` when both paths apply; show only relevant scope for a one-path proposal.
- Use confirmed pricing only. Do not carry static package pricing, per-location fees, or implementation assumptions into a lead without validation.
- If pricing is not confirmed, describe what each scope includes and state that final scope and pricing will be agreed before work begins.
- Keep one short material qualifier; detailed exclusions and assumptions belong in the evidence summary.

#### Slide 15 - Why One Partner (light)

**Layout:** Eyebrow + h2, then 3-column grid of 6 cards with SVG icons.

**Content to substitute:**
- H2: explain the practical benefit of continuity across online presence, outreach, measurement, and remote-care administration.
- Use 3-6 concise capabilities supported by the actual proposed scope. Avoid generic self-praise and procurement language.
- Keep the prospect and the work ahead central; this is supporting rationale, not a second company introduction.

#### Slide 16 - Choose a Starting Path (dark)

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

#### Supplemental Cross-Slide Requirements

Each slide is a `<section class="slide [lt|dk] [top]" aria-roledescription="slide" aria-label="...">` with a visible `N / 16` slide number, the packaged FairPath logo, and a footer. The visible presentation container must be exactly one edge-to-edge 1280x720 slide. Do not place the slide inside a taller page, centered letterbox, preview shell, or outer card that leaves bands above or below the canvas.

Use the packaged `slide-content-contract.json` and `IMPLEMENTATION_NOTES.md` while assembling every deck. The HTML template, assets, notes, and contract are one package; do not copy only `index.html` and then invent slide behavior.

1. **Cover** - prospect-first Remote-Care-first title, prepared-for block, and the selected presenter with FairPath treatment.
2. **Value proposition** - the selected presenter and FairPath help healthcare organizations make more money, cut costs, and save time: launch remote-care services, attract patients/providers, and automate work in one platform.
3. **Prove Remote Care for 90 Days** - remote-care-general proof period with a manageable first patient group, 30/60/90-day reviews, retained relationship control, confirmed terms, and no guarantee language.
4. **Remote Care Opportunity** - show all five core programs offered: RPM, CCM, AWV, RTM, and APCM with comparable visual weight; APCM and RTM are not footnotes.
5. **FairPath Platform / Workflow** - score/prioritize, open the work queue, see context, connect, document, and confirm readiness; AI assists and people decide.
6. **Market / Opportunity Size** - relevant population, patient/provider audience, physicians, clinics/offices, or organization-scale opportunity, sourced and labeled.
7. **Remote-care economics / participation examples** - low/base/high scenarios from the ledger. Do not show a separate share/capture-rate column; present patient counts directly, with no forecast or guarantee.
8. **What is already working** - lead-specific strengths from verified company, website, portfolio, profile, service, or current-site evidence.
9. **The practical gap** - dominant readable current-site visual and the main customer, patient, provider, or owned-presence gap; use a zoomed crop with `object-fit: cover` or an equivalent deliberate viewport, not a tiny whole-page screenshot.
10. **Metric-driven website scorecard** - This is the website scoring page: show a prominent overall score plus LLM/AI-answer readiness, SEO/local search, customer actions, trust/content, and technical/readability when a confirmed audited site exists.
11. **What the website adds** - owned information, searchable service/portfolio content, measurable actions, and durable patient/provider pathways.
12. **Website and AI-answer opportunity** - practical answer clarity for relevant customer, patient, provider, investor, or partner questions; no invented AI rankings.
13. **Sourced competitor comparison** - named checked peers/profiles, practical action dimensions, answer clarity, and no map-pack/ranking/review-audit caveat.
14. **Growth recap** - remote care first, website second, automation underneath both, and a manageable start.
15. **Two paths to start** - Remote Care is Path 1 and website growth is Path 2; preserve timing/input caveats.
16. **Choose a starting path** - use the customer-facing heading `Which path should we start with?`; present Remote Care first, Website second, or Both together, with the contact from `proposal-run-profile.json`.
---

### Evidence-State Labels (Required)

Every claim in the deck and summary must be labeled with one of:
- **Verified** -- Confirmed through direct observation (raw HTML fetch, DNS lookup, CRM data, WHOIS record)
- **Observed** -- Found in a single source but not independently confirmed
- **Estimated** -- Approximation from general knowledge, not verified against primary sources
- **Not verified** -- Cannot be confirmed with available tools

### Caveats (Required in Deck)

1. Revenue estimates are approximations based on public data -- not verified financial projections
2. Absence of remote care services on the website does not prove they are not offered -- may be available offline or through patient portal
3. Market population figures are estimates -- not verified against Census or CMS data
4. Email patterns are observed/tentative -- not independently verified unless SMTP confirmation succeeded
5. CPT reimbursement rates are approximate -- verify against current CMS Physician Fee Schedule before presenting as definitive

---

### First-Pass Deliverable and Data Contracts

The first pass is not complete until these deterministic artifacts exist in the reported session artifact folder and agree with each other:

- Final proposal `index.html` and PDF export, each containing exactly 16 slides/pages.
- `proposal-research-packet.md` containing lead identity evidence or a CRM-unavailable note; CRM/enrichment website-field status; candidate sites and public profiles checked; final website branch; audit-feeder status; selected current-site/public-profile evidence; competitor and AI-answer evidence; selected visuals; and slide-use decisions.
- `proposal-run-profile.json` containing `presenterMode`, selected template path, presenter label, contact name/title/email, prompt version, lead/run identity, and a validation state confirming that every slide and final artifact uses that profile.
- `market-economics-ledger.json` containing source geography/year, service-area population, Medicare basis/range, beneficiary estimate/range, physician-density basis/range, physician estimate/range, office/clinic basis/range, and low/base/high scenarios. Each scenario records capture assumption, enrolled-patient count, illustrative annual gross billing per patient, total, arithmetic, evidence state, and caveats.
- `competitor-comparison-ledger.md` whenever a functioning website or public-profile comparison is possible. It names checked entities and URLs/public identifiers and covers practical patient actions, hours/contact/directions clarity, and patient-answer/AI-readiness clarity using observable facts only.
- `evidence-summary.md` mapping every material visible claim, score, market figure, economics figure, screenshot, and competitor comparison to its source artifact or URL and evidence state.
- Final rendered screenshots for all 16 slides, a contact sheet, and machine-readable QA metrics/report for the exact delivered HTML.
- All referenced images, fonts, template assets, `IMPLEMENTATION_NOTES.md`, and `slide-content-contract.json`.
- `proposal-artifact-manifest.json` listing each required artifact, deterministic path, media type, producing step, and validation status.
- `proposal-completion-validation.json` containing the structured result defined under Validation.

Do not report completion from chat text or an unrendered HTML draft. The manifest, HTML, PDF, ledgers, evidence summary, rendered QA, and completion validation are the output contract.

## Acceptance Criteria

- [ ] Deck saved to session `artifacts/` folder with all image and font assets
- [ ] All `<img>` references resolve to existing files in `bvp-deck-assets/`
- [ ] All `@font-face` references resolve to existing OTF files in `bvp-deck-assets/fonts/`
- [ ] All 16 slides present and properly numbered (N / 16)
- [ ] `<title>` tag reflects the correct company name
- [ ] `proposal-research-packet.md` exists and records lead identity, website resolution branch, audit feeder run/reuse/skip/failure status, selected visuals, competitor evidence, AI/LLM-answer evidence, and slide-use decisions
- [ ] Every claim labeled with evidence state (verified/observed/estimated/not verified)
- [ ] `market-economics-ledger.json` exists and records population, Medicare, physician, clinic/office, capture, patient, per-patient billing, and low/base/high annual gross-billing assumptions and results
- [ ] Market slide contains population, estimated Medicare beneficiaries, estimated physicians, and estimated physician offices/clinics with visible bases or arithmetic
- [ ] Economics slide carries the same Medicare market into explicit low/base/high capture, patient, per-patient, and annual gross-billing scenarios
- [ ] Final slide values match the ledger within ordinary display rounding
- [ ] No later slide contradicts computable directional estimates with `TBD`, `cannot estimate`, `no dollar estimates can be provided`, or equivalent refusal language
- [ ] All 5 required caveats present in the deck
- [ ] Deck opens in a browser with no broken images or fonts
- [ ] Design system matches reference template (purple palette, Glancyr font, 1280x720 canvas, slide transitions, navigation)
- [ ] CSS variables, `@font-face`, JavaScript navigation, and `bvp-deck-assets/` folder unchanged
- [ ] Summary of findings provided with evidence-state labels
- [ ] CRM lead data referenced where available (LeadID noted in output)
- [ ] Native readability and flow pass applied; no external polish agent is required
- [ ] `competitor-comparison-ledger.md` exists for website-enabled proposals and names sources checked
- [ ] Slide 13 contains a sourced competitor/profile comparison with named examples and no-ranking/no-review-audit caveat
- [ ] Confirmed-website proposals run or reuse `ToAnalyzeExistingWebsiteForImprovementsSkill` as the canonical audit feeder unless feeder failure is explicitly recorded and the degraded website section remains truthful
- [ ] No-confirmed-website proposals skip the website-audit feeder and use only verified public profile/social/directory evidence for website-gap claims
- [ ] No fabricated website score, crawl finding, architecture claim, current-site screenshot, or rebuild finding appears when no official website was confirmed
- [ ] Confirm that slide 12 shows prospect website/AI-answer opportunity, slide 13 contains named competitor comparison, slide 6 contains market/opportunity size, and slide 7 contains economics/growth examples
- [ ] Market/opportunity-size slide appears after remote-care opportunity/workflow and before economics in two-path proposals
- [ ] Rendered visual QA completed for all 16 slides with contact sheet and metrics saved
- [ ] Print/PDF optimization included
- [ ] Slides 3, 7, 10, and 11 are lead-specific when evidence exists; do not leave static generic content in these decision-making slides
- [ ] Contact card on slide 16 shows correct sales rep or default to Justin Brochetti

### First-Pass Quality Gates

- Directly inspect the exact handoff files; a completion narrative or pre-enhancement draft is not evidence.
- Prospect type, locations, contacts, website status, and story match verified evidence. Explicitly authorized healthcare/pharmacy-adjacent prospects are allowed, but inapplicable independent-pharmacy, retail-patient, local-owner, multi-location, or remote-care assumptions are removed or translated.
- Website branch and feeder behavior are correct: confirmed sites run/reuse the matching audit or document feeder failure and degraded evidence; likely sites remain unconfirmed; no-site/public-profile branches do not audit an unconfirmed candidate and contain no fabricated scores, crawl findings, screenshots, architecture, or rebuild claims.
- Every visible website, competitor, market, economics, capability, contact, and screenshot claim is traceable to the research packet, feeder, ledger, evidence summary, or captured source.
- Market/economics values are reproducible and continuous across ledger and slides. Directional values are labeled Estimated; illustrative gross billing is never presented as net revenue, profit, guaranteed reimbursement, or a forecast.
- No final slide contains `TBD`, refusal-to-estimate language when directional inputs are computable, LeadID, timestamps, tool/workflow names, draft labels, internal shorthand, or unsupported static-template facts.
- The rendered deck contains exactly 16 edge-to-edge 1280x720 slides, no letterboxing or body scroll, no clipped content, no unresolved assets, readable crops, balanced whitespace, no footer/navigation collision, and no meaningful text below readable size.
- Applicable narrative coverage is substantive without letting branding, evidence labels, methodology, or caveats overwhelm the prospect story.
- HTML/PDF page counts agree, every required artifact exists, and nothing is attached, published, or sent without explicit approval.

## Workflow

### Prospect Classification and Narrative Routing

Classify the prospect before selecting slide copy or cadence. Record this routing decision in the evidence summary.

Eligibility is evidence-and-fit based, not limited to independent pharmacies. Do not reject a user-authorized prospect solely because it is a pharmaceutical company, healthcare organization, enterprise operator, or pharmacy-adjacent business. Instead:

- State the verified business type and operating model accurately.
- Identify which parts of the pharmacy/FairPath framework apply and which do not.
- Remove or replace independent-pharmacy, local-owner, retail-pharmacy, patient-action, market, and remote-care assumptions that are unsupported for this prospect.
- Use organization-level, portfolio, business-development, patient-support, provider-partnership, or pharmacy-operations language when the evidence supports it.
- If a requested claim or offer does not fit, omit that element or present it as an optional discovery question; do not block the entire proposal when a truthful website-growth or healthcare-growth story remains.
- Keep the normal pharmacy-specific route for actual pharmacy leads.

Required classification dimensions:

- Verified prospect type: independent pharmacy, pharmacy operator, pharmaceutical company, healthcare organization, pharmacy-adjacent business, or other user-authorized prospect.
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
- **Pharmaceutical or healthcare organization:** lead with the verified organization, portfolio, patient/provider audience, business-development priorities, and website opportunity. Use pharmacy-operation examples only when they are evidenced. Translate local retail-pharmacy language into organization-appropriate language, and do not imply that the parent company is itself an independent pharmacy.
- **Both opportunities are meaningful:** present two distinct but connected paths--get found and convert interest online; support patients between visits through remote care. Each path may stand alone, run in sequence, or launch together. Neither may be reduced to an afterthought. When the user requests Remote Care first, slides 3-7 must establish proof period, programs, workflow, market, and economics before slides 8-13 present current strengths, website gaps, scorecard, AI-answer opportunity, and competitor evidence.

Do not infer youth, ownership style, sophistication, or budget from appearance alone. Use CRM, public evidence, and the prospect's observable operating model.

### Component Actions

- `LeadAutomation_GetLeadsBySearch` -- CRM lead search
- `LeadAutomation_GetLeadAndNotesAsMarkdown` -- CRM lead details + notes
- `ToSearchFeedingFrenzyLeadsByEmail` -- CRM email search
- `ToAnalyzeExistingWebsiteForImprovementsSkill` -- Canonical website-audit feeder for confirmed official websites; run/reuse its deterministic artifact contract internally and skip it for unconfirmed/no-site branches
- `ToCreateWebsiteAnalysisSalesPacketSkill` -- Optional full sales-packet packaging when explicitly requested; not required for this deck
- Native browser/render tooling - all-slide 1280x720 visual QA screenshots, contact sheet, and metrics

---

### Step 1: Lead Pull and Official Website Resolution

#### Inputs

- Required workflow inputs and supplied meeting context.

#### Instructions

If a LeadID is provided:
1. Call `LeadAutomation_GetLeadsBySearch` with `FeedingFrenzyJsonWsService#Remote` to find the lead
2. Call `LeadAutomation_GetLeadAndNotesAsMarkdown` to get full lead details, contacts, and notes
3. Extract: company name, locations, contacts (names, phones, emails), NPIs, tags (CPESN, Operator, etc.), sales rep, status, prior contact history, and any executive summaries in the notes
4. Search for additional leads by alternate company names, individual location names, and NPIs
5. Resolve the official website before Step 2:
   - Start with the CRM website field when present.
   - If the CRM website field is blank, missing, stale, or ambiguous, search public evidence for candidate domains and public profiles.
   - Compare each candidate against company name, address, phone, NPI, branding, services, and any CRM/enrichment notes.
   - Classify website status as one of: `confirmed official website`, `likely but not confirmed`, `no official website found`, or `public profiles only`.
   - Only the `confirmed official website` status may proceed to the canonical website-audit feeder in Step 2.
   - `likely but not confirmed` may be described only as an unconfirmed candidate in the evidence summary; do not audit it as the official site.
   - `no official website found` and `public profiles only` must use the no-site branch in Step 2.

If only a company name is provided:
1. Research the company directly.
2. Resolve the official website using the same evidence standard above.
3. Note that CRM data is not available.

If a company name + URL is provided:
1. Verify the URL against the company name, address, phone, branding, and other public evidence.
2. Treat the URL as confirmed only if it clearly matches the pharmacy.
3. If the URL is not confirmed, record it as rejected or unconfirmed and follow the no-site branch unless another official site is confirmed.

Create or update `proposal-research-packet.md` during Step 1 with lead identity evidence, CRM/enrichment website field status, candidate websites and public profiles checked, accepted/rejected/unconfirmed website reasoning, final website status branch, source URLs, and screenshots available for Step 2.

Record the exact final branch value as `confirmed official website`, `likely but not confirmed`, `no official website found`, or `public profiles only`. Do not defer branch documentation until deck assembly.

If only a company name and URL are provided, research the company website directly, including relevant HTML and JavaScript-bundle evidence, and explicitly record that CRM data was unavailable.

#### Outputs

- Canonical prospect and lead record.
- `proposal-research-packet.md` with accepted/rejected identity and website evidence and the selected branch.

- `lead-snapshot.json` containing resolved company name, locations, contacts, NPIs, tags, sales representative, lead status, prior contact history, executive summaries, related lead IDs, and CRM availability.
- `lead-notes.md` containing the complete lead details and notes used by the workflow.
- `lead-resolution-log.json` containing every LeadID, alternate company name, location name, and NPI search, selected primary lead, and related-lead linkage reasons.

#### Acceptance Criteria

- Prospect/location and official-website status are evidence-backed or explicitly unresolved.
- The selected branch is recorded and no unconfirmed site is treated as official.
- The complete identity/website-resolution record exists in `proposal-research-packet.md`, not only in conversation.
- Explicitly authorized non-pharmacy or pharmacy-adjacent prospects record verified type and every inapplicable assumption to remove or translate.

- The selected primary lead is the intended prospect and records the supplied LeadID when present.
- Requested CRM fields are populated when present and explicitly unavailable when absent.
- Related leads are linked with their search basis and are not silently merged.
- Company-name-and-URL fallback records that CRM data was unavailable.
- No CRM record, note, status, contact, or artifact is modified.

### Step 2: Website Evidence Branch

#### Inputs

- Step 1 canonical prospect identity, classification, and website-resolution branch.

#### Instructions

Confirmed official website branch:
1. Reuse an existing website-audit feeder artifact only when it clearly matches the same lead/company, official website URL, and current run context. Record the reused artifact path and freshness rationale in `proposal-research-packet.md`.
2. If no matching feeder artifact exists, run `ToAnalyzeExistingWebsiteForImprovementsSkill` directly with a descriptive child session key (e.g., `{company-slug}-website-audit`). Treat the feeder as usable only after its own deterministic artifacts and completion validation satisfy its prompt contract.
3. Pass the company name, confirmed official website URL, locations, services, leadership, and CRM/enrichment context as input.
4. The feeder produces: opportunity audit (MD + HTML), evidence source notes, screenshots, competitor/audit observations when available, AI-search readiness observations when available, and acceptance matrix.
5. Condense the feeder output into `proposal-research-packet.md` and `evidence-summary.md`: current-site strengths, readable current-site screenshots/crops, critical customer-action issues, quick wins, competitor observations, patient-answer / AI-readiness observations, and evidence caveats.
6. Use only deck-relevant, evidence-backed audit findings in the visible proposal. Do not copy audit boilerplate or technical scoring unless it helps the owner conversation and is supported.
7. If the audit feeder fails, times out, produces no validated artifact, or does not include usable screenshots, make one safe retry when the failure is likely transient. If it still fails, record `website audit feeder unavailable` in `proposal-research-packet.md`, capture any directly verifiable public website/profile evidence available, evidence-label the degraded website section, and continue only if the deck can remain truthful. Do not fabricate audit results.
8. If the audit feeder did not produce a concrete named competitor comparison or patient-answer / AI-readiness comparison, perform the focused competitor and AI-answer ledger steps before deck assembly.

No confirmed official website branch:
1. Do not run `ToAnalyzeExistingWebsiteForImprovementsSkill` against an unconfirmed candidate, directory listing, or public profile.
2. Do not fabricate website scores, crawl findings, architecture claims, screenshots, or rebuild findings.
3. Use verified public profiles, social pages, directory pages, CRM/enrichment notes, and reputation/social evidence to explain the owned-searchable-home opportunity.
4. Capture public-profile/social/directory screenshots only when those sources are used in the deck.
5. Record the no-site evidence and screenshot/source paths in `proposal-research-packet.md` and `evidence-summary.md`.
6. Continue to the focused competitor comparison ledger using public sources.

Write audit-feeder status as exactly `ran`, `reused`, `skipped - no confirmed official website`, or `failed - degraded evidence used`. For confirmed sites, save the matching feeder artifact or record the failure, retry/fallback decision, and directly verifiable degraded evidence.

Pass company name, confirmed website URL, locations, services, and leadership context to the website-audit feeder. Extract only supported overall score, critical issues, quick wins, competitor evidence, and AI-search/readiness findings from its saved artifacts.

#### Outputs

- Saved website-audit feeder references or qualified no-site/public-profile evidence.
- Updated research packet and `evidence-summary.md` with screenshots, sources, findings, and limitations.

- Website-audit child-run binding with action, skill version, status, artifact folder, and completion-validation status.
- Opportunity audit in Markdown and HTML, evidence/source notes, and acceptance matrix.
- Structured findings containing confirmed URL, supported score, critical issues, quick wins, competitor analysis, AI-search readiness, evidence states, and source references.

#### Acceptance Criteria

- The confirmed-site branch uses the validated feeder or records its qualified failure; the no-site branch contains no fabricated website findings.
- Every visible claim and screenshot is traceable.
- Every selected website/public-profile visual has a saved source and planned slide use.
- Branch-specific prohibited claims are explicitly checked before this step passes.

- The audited URL is the confirmed official website.
- All required audit artifacts exist, are readable, and satisfy the feeder's deterministic completion validation.
- Every material downstream finding retains a source reference and evidence state.
- A reused audit matches the current prospect and URL and is current enough for the meeting.

### Step 3: Focused Competitor Comparison Ledger

#### Inputs

- Steps 1-2 target, geography, website/public-profile evidence, and competitor scope.

#### Instructions

Create competitor-comparison-ledger.md in the proposal output folder. Identify named nearby pharmacy competitors using public sources such as NPPES, public search/direct pages where accessible, official websites, and public chain/store pages. Select 2-4 nearby independents when identifiable plus 1-3 chain/large-format pages when relevant. For each checked entity, record name, location, source URL/public identifier, website/profile result, visible services/actions, and evidence label. Do not claim ranking, map-pack position, review superiority, or competitor quality unless directly verified.

The competitor ledger is required even in no-confirmed-website cases when public profiles can be checked. In those cases, compare the prospect's verified public presence against named nearby examples and make the owned-searchable-home gap concrete without implying ranking, review superiority, or verified traffic performance.

Minimum competitor dimensions to check and record when evidence is available:
- Official website or public profile found/not found.
- Refill, transfer, vaccine, delivery, compounding, med sync, immunization, or service actions visible.
- Hours, phone, address, directions, and contact clarity.
- Trust/profile signals visible in public evidence, without making unsupported quality or ranking claims.
- Patient-answer/AI-readiness clarity: whether public text clearly answers common patient prompts such as hours, refills, transfers, vaccines, delivery, services, location, phone, and directions.

Frame AI-readiness as answer clarity, not model ranking or citation performance unless those facts were directly captured. State that this is not a map-pack/ranking/review audit unless those facts were collected.

Slide placement: use slide 13 for the named competitor comparison. Use slide 12 only for the prospect's practical website/AI-answer opportunity and at most one compact callout from the competitor or AI-readiness evidence. Keep the full source ledger out of the visible deck.

#### Outputs

- `competitor-comparison-ledger.md` with named entities, checked dimensions, source URLs, evidence labels, and limitations.

#### Acceptance Criteria

- Required competitor types and dimensions are checked when evidence permits.
- No ranking, review superiority, traffic, or quality claim exceeds observed evidence.
- The ledger names checked entities and URLs/public identifiers and covers every practical dimension that was actually checkable.
- Slide-ready comparisons use observable facts and named examples.

### Step 4: Email & Infrastructure Research

#### Inputs

- Step 1 official domain and Step 2 website evidence, when a website is confirmed.

#### Instructions

1. Fetch the website's JavaScript bundle and search for email addresses, mailto components, and domain references
2. Check WHOIS records (via who.is) for all discovered domains to find registrant emails
3. Check DNS: MX records, SPF/TXT records, SSL certificates
4. Identify the email pattern (e.g., `firstinitial.lastname@domain.com`)
5. **Evidence label: "observed/tentative"** -- do not label email patterns as "confirmed" unless independently verified via SMTP or other means

Run website-specific infrastructure research only for a confirmed official website. Skip this step for unconfirmed, no-site, and public-profile-only branches, and do not treat skipped infrastructure checks as negative evidence.

#### Outputs

- Email/domain/infrastructure evidence ledger, or an explicit not-applicable result for the no-confirmed-site branch.

- `email-infrastructure-findings.json` containing discovered emails/domains, WHOIS findings, MX, SPF/TXT, SSL findings, inferred email pattern, and evidence state.
- `dns-whois-evidence.md` containing sources, timestamps, failures, unavailable checks, and qualifications.

#### Acceptance Criteria

- Infrastructure research runs only for a confirmed official domain.
- Email patterns remain tentative unless independently verified; skipped checks are not negative evidence.

- Every finding retains its source and retrieval result.
- WHOIS, MX, SPF/TXT, and SSL checks record success, failure, unavailable, or not applicable.
- Inferred patterns remain `Observed` or `Tentative` unless independently verified.
- No tentative email or pattern is labeled confirmed; no email is sent and no CRM data is modified.

### Step 5: Service Gap Analysis

#### Inputs

- Steps 1-4 saved identity, website, competitor, email, and infrastructure evidence.

#### Instructions

Cross-reference website content and CRM notes against this checklist:
- Remote Patient Monitoring (RPM) -- CPT 99453/99454/99457
- Chronic Care Management (CCM) -- CPT 99490
- Annual Wellness Visits (AWV) -- G0438/G0439
- Remote Therapeutic Monitoring (RTM)
- Advance Primary Care Management (APCM)
- Online immunization scheduling
- Behavioral Health Integration (BHI)

**Critical evidence rule:** Label findings as "website-observed absence" -- not "verified operational absence." The company may offer services offline, through a patient portal, or through partner arrangements not visible on the public website.

#### Outputs

- Evidence-backed service-gap and narrative-routing record with applicable and removed assumptions.

- `service-gap-analysis.json` containing every checklist service, public-website evidence state, source references, and blocked operational-absence claims.
- `service-evidence-matrix.md` comparing CRM notes, website content, observed services, website-observed absences, and unresolved operational status.

#### Acceptance Criteria

- Recommendations follow confirmed prospect type, maturity, and fit.
- Inapplicable assumptions are removed and every material gap is evidence-backed.

- Every checklist service has an explicit evidence state and source reference.
- A service not found publicly is labeled `website-observed absence`, never `verified operational absence`.
- Offline, portal-based, and partner-delivered possibilities remain explicit where unresolved.
- No downstream claim presents an unresolved service absence as verified fact.

### Step 6: Market Estimation

#### Inputs

- Steps 1-5 saved findings, geography, and confirmed fit.

#### Instructions

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

`estimated Medicare market x assumed capture rate x illustrative annual gross billing per enrolled patient = illustrative annual gross billing`

Show the capture rate, resulting patient count, per-patient assumption, and annual total for every scenario. Patient and billing values in the deck must match the ledger within ordinary display rounding.

**Evidence labels:** market figures are **Estimated**; revenue figures are **Illustrative**. Gross billing is not net revenue and not a forecast. Payer rules, current rates, program mix, billable months, staffing, devices, denials, collections, compliance, and partner economics still require validation.

Do not replace computable directional estimates with `TBD`, `Not verified`, `cannot estimate`, `no dollar estimates can be provided`, or equivalent refusal language merely because first-party pharmacy data is unavailable. Before completion, scan the final deck for contradictions between the estimated market and later economic slides.

Independently recompute every low/base/high scenario from the saved ledger values before passing them to assembly. Record selected range basis, rounding, expected patient counts, and expected annual totals. Correct discrepancies in this step rather than deferring them to validation.

#### Outputs

- Reproducible market-estimation ledger with inputs, formulas, arithmetic, evidence states, and fit limits.

- The authoritative `market-economics-ledger.json` defined in Outputs.
- A readable ledger summary in Markdown or an HTML source-notes section.
- Structured low/base/high scenarios containing capture rate, patient count, per-patient annual gross billing, annual total, visible arithmetic, source basis, evidence state, and caveats.

#### Acceptance Criteria

- Every estimate is reproducible from saved inputs and arithmetic.
- Assumptions, caveats, and unsupported scenarios remain visibly qualified.
- Recomputed patient counts and totals materially agree with the stated inputs and explicit equation.

- The ledger exists before deck assembly and contains every required geography, population, Medicare, physician, clinic, capture, patient, billing, source, basis, and arithmetic field.
- Gross billing is not represented as net revenue, profit, guaranteed reimbursement, or forecast.
- Operational, payer, staffing, device, denial, collection, compliance, and partner-economics caveats are present.
- No contradiction or refusal placeholder remains where a directional estimate can be computed.


### Step 7: Produce Slide 1 - Cover

#### Inputs

- Completed Steps 1-6 research, prerequisite manifests, the complete Slide 1 contract in Outputs, shared template assets, and accepted slides needed for continuity.

#### Instructions

Produce only Slide 1: **Cover**. Populate every field required by its complete contract in Outputs, bind every material claim to saved evidence, and remove unsupported template content. Save one standalone 1280x720 slide; do not create or modify another slide. Render the current HTML to PNG and validate both. A rerun replaces only slides/slide-01/ and makes assembly, QA, PDF, and overall result stale.

#### Outputs

- slides/slide-01/slide-01-data.json - exact visible copy, values, labels, layout, caveats, assets, dependencies, and content hash required specifically for **Cover**.
- slides/slide-01/slide-01-evidence.json - claim-by-claim source workflow, step, artifact, URL, excerpt/value, evidence state, qualification, and sufficiency.
- slides/slide-01/slide-01.html - one standalone controlled 1280x720 **Cover** slide.
- slides/slide-01/slide-01-preview.png - current rendered 1280x720 preview.
- slides/slide-01/slide-01-validation.json - slide-specific required-content, evidence, unsupported-claim, dimensions, overflow, clipping, assets, text-size, HTML/preview hash, and overall checks.

#### Acceptance Criteria

- Every requirement in the Slide 1 **Cover** contract in Outputs passes and appears in slide-01-validation.json.
- All five files exist, agree on slide identity, and bind with SlideOutput.SchemaVersion = proposal-slide/v1 and PrimaryArtifactKey = slide-01-preview.
- Every claim has evidence or visible qualification; HTML has exactly one 1280x720 slide; assets resolve; preview is current, unclipped, non-overlapping, and readable.
- No other slide or final-deck artifact is created or modified.

### Step 8: Produce Slide 2 - Value Proposition

#### Inputs

- Completed Steps 1-6 research, prerequisite manifests, the complete Slide 2 contract in Outputs, shared template assets, and accepted slides needed for continuity.

#### Instructions

Produce only Slide 2: **Value Proposition**. Populate every field required by its complete contract in Outputs, bind every material claim to saved evidence, and remove unsupported template content. Save one standalone 1280x720 slide; do not create or modify another slide. Render the current HTML to PNG and validate both. A rerun replaces only slides/slide-02/ and makes assembly, QA, PDF, and overall result stale.

#### Outputs

- slides/slide-02/slide-02-data.json - exact visible copy, values, labels, layout, caveats, assets, dependencies, and content hash required specifically for **Value Proposition**.
- slides/slide-02/slide-02-evidence.json - claim-by-claim source workflow, step, artifact, URL, excerpt/value, evidence state, qualification, and sufficiency.
- slides/slide-02/slide-02.html - one standalone controlled 1280x720 **Value Proposition** slide.
- slides/slide-02/slide-02-preview.png - current rendered 1280x720 preview.
- slides/slide-02/slide-02-validation.json - slide-specific required-content, evidence, unsupported-claim, dimensions, overflow, clipping, assets, text-size, HTML/preview hash, and overall checks.

#### Acceptance Criteria

- Every requirement in the Slide 2 **Value Proposition** contract in Outputs passes and appears in slide-02-validation.json.
- All five files exist, agree on slide identity, and bind with SlideOutput.SchemaVersion = proposal-slide/v1 and PrimaryArtifactKey = slide-02-preview.
- Every claim has evidence or visible qualification; HTML has exactly one 1280x720 slide; assets resolve; preview is current, unclipped, non-overlapping, and readable.
- No other slide or final-deck artifact is created or modified.

### Step 9: Produce Slide 3 - Prove Remote Care for 90 Days

#### Inputs

- Completed Steps 1-6 research, prerequisite manifests, the complete Slide 3 contract in Outputs, shared template assets, and accepted slides needed for continuity.

#### Instructions

Produce only Slide 3: **Prove Remote Care for 90 Days**. Populate every field required by its complete contract in Outputs, bind every material claim to saved evidence, and remove unsupported template content. Save one standalone 1280x720 slide; do not create or modify another slide. Render the current HTML to PNG and validate both. A rerun replaces only slides/slide-03/ and makes assembly, QA, PDF, and overall result stale.

#### Outputs

- slides/slide-03/slide-03-data.json - exact visible copy, values, labels, layout, caveats, assets, dependencies, and content hash required specifically for **Prove Remote Care for 90 Days**.
- slides/slide-03/slide-03-evidence.json - claim-by-claim source workflow, step, artifact, URL, excerpt/value, evidence state, qualification, and sufficiency.
- slides/slide-03/slide-03.html - one standalone controlled 1280x720 **Prove Remote Care for 90 Days** slide.
- slides/slide-03/slide-03-preview.png - current rendered 1280x720 preview.
- slides/slide-03/slide-03-validation.json - slide-specific required-content, evidence, unsupported-claim, dimensions, overflow, clipping, assets, text-size, HTML/preview hash, and overall checks.

#### Acceptance Criteria

- Every requirement in the Slide 3 **Prove Remote Care for 90 Days** contract in Outputs passes and appears in slide-03-validation.json.
- All five files exist, agree on slide identity, and bind with SlideOutput.SchemaVersion = proposal-slide/v1 and PrimaryArtifactKey = slide-03-preview.
- Every claim has evidence or visible qualification; HTML has exactly one 1280x720 slide; assets resolve; preview is current, unclipped, non-overlapping, and readable.
- No other slide or final-deck artifact is created or modified.

### Step 10: Produce Slide 4 - Remote Care Opportunity

#### Inputs

- Completed Steps 1-6 research, prerequisite manifests, the complete Slide 4 contract in Outputs, shared template assets, and accepted slides needed for continuity.

#### Instructions

Produce only Slide 4: **Remote Care Opportunity**. Populate every field required by its complete contract in Outputs, bind every material claim to saved evidence, and remove unsupported template content. Save one standalone 1280x720 slide; do not create or modify another slide. Render the current HTML to PNG and validate both. A rerun replaces only slides/slide-04/ and makes assembly, QA, PDF, and overall result stale.

#### Outputs

- slides/slide-04/slide-04-data.json - exact visible copy, values, labels, layout, caveats, assets, dependencies, and content hash required specifically for **Remote Care Opportunity**.
- slides/slide-04/slide-04-evidence.json - claim-by-claim source workflow, step, artifact, URL, excerpt/value, evidence state, qualification, and sufficiency.
- slides/slide-04/slide-04.html - one standalone controlled 1280x720 **Remote Care Opportunity** slide.
- slides/slide-04/slide-04-preview.png - current rendered 1280x720 preview.
- slides/slide-04/slide-04-validation.json - slide-specific required-content, evidence, unsupported-claim, dimensions, overflow, clipping, assets, text-size, HTML/preview hash, and overall checks.

#### Acceptance Criteria

- Every requirement in the Slide 4 **Remote Care Opportunity** contract in Outputs passes and appears in slide-04-validation.json.
- All five files exist, agree on slide identity, and bind with SlideOutput.SchemaVersion = proposal-slide/v1 and PrimaryArtifactKey = slide-04-preview.
- Every claim has evidence or visible qualification; HTML has exactly one 1280x720 slide; assets resolve; preview is current, unclipped, non-overlapping, and readable.
- No other slide or final-deck artifact is created or modified.

### Step 11: Produce Slide 5 - FairPath Platform and Workflow

#### Inputs

- Completed Steps 1-6 research, prerequisite manifests, the complete Slide 5 contract in Outputs, shared template assets, and accepted slides needed for continuity.

#### Instructions

Produce only Slide 5: **FairPath Platform and Workflow**. Populate every field required by its complete contract in Outputs, bind every material claim to saved evidence, and remove unsupported template content. Save one standalone 1280x720 slide; do not create or modify another slide. Render the current HTML to PNG and validate both. A rerun replaces only slides/slide-05/ and makes assembly, QA, PDF, and overall result stale.

#### Outputs

- slides/slide-05/slide-05-data.json - exact visible copy, values, labels, layout, caveats, assets, dependencies, and content hash required specifically for **FairPath Platform and Workflow**.
- slides/slide-05/slide-05-evidence.json - claim-by-claim source workflow, step, artifact, URL, excerpt/value, evidence state, qualification, and sufficiency.
- slides/slide-05/slide-05.html - one standalone controlled 1280x720 **FairPath Platform and Workflow** slide.
- slides/slide-05/slide-05-preview.png - current rendered 1280x720 preview.
- slides/slide-05/slide-05-validation.json - slide-specific required-content, evidence, unsupported-claim, dimensions, overflow, clipping, assets, text-size, HTML/preview hash, and overall checks.

#### Acceptance Criteria

- Every requirement in the Slide 5 **FairPath Platform and Workflow** contract in Outputs passes and appears in slide-05-validation.json.
- All five files exist, agree on slide identity, and bind with SlideOutput.SchemaVersion = proposal-slide/v1 and PrimaryArtifactKey = slide-05-preview.
- Every claim has evidence or visible qualification; HTML has exactly one 1280x720 slide; assets resolve; preview is current, unclipped, non-overlapping, and readable.
- No other slide or final-deck artifact is created or modified.

### Step 12: Produce Slide 6 - Market and Opportunity Size

#### Inputs

- Completed Steps 1-6 research, prerequisite manifests, the complete Slide 6 contract in Outputs, shared template assets, and accepted slides needed for continuity.

#### Instructions

Produce only Slide 6: **Market and Opportunity Size**. Populate every field required by its complete contract in Outputs, bind every material claim to saved evidence, and remove unsupported template content. Save one standalone 1280x720 slide; do not create or modify another slide. Render the current HTML to PNG and validate both. A rerun replaces only slides/slide-06/ and makes assembly, QA, PDF, and overall result stale.

#### Outputs

- slides/slide-06/slide-06-data.json - exact visible copy, values, labels, layout, caveats, assets, dependencies, and content hash required specifically for **Market and Opportunity Size**.
- slides/slide-06/slide-06-evidence.json - claim-by-claim source workflow, step, artifact, URL, excerpt/value, evidence state, qualification, and sufficiency.
- slides/slide-06/slide-06.html - one standalone controlled 1280x720 **Market and Opportunity Size** slide.
- slides/slide-06/slide-06-preview.png - current rendered 1280x720 preview.
- slides/slide-06/slide-06-validation.json - slide-specific required-content, evidence, unsupported-claim, dimensions, overflow, clipping, assets, text-size, HTML/preview hash, and overall checks.

#### Acceptance Criteria

- Every requirement in the Slide 6 **Market and Opportunity Size** contract in Outputs passes and appears in slide-06-validation.json.
- All five files exist, agree on slide identity, and bind with SlideOutput.SchemaVersion = proposal-slide/v1 and PrimaryArtifactKey = slide-06-preview.
- Every claim has evidence or visible qualification; HTML has exactly one 1280x720 slide; assets resolve; preview is current, unclipped, non-overlapping, and readable.
- No other slide or final-deck artifact is created or modified.

### Step 13: Produce Slide 7 - Remote-Care Economics

#### Inputs

- Completed Steps 1-6 research, prerequisite manifests, the complete Slide 7 contract in Outputs, shared template assets, and accepted slides needed for continuity.

#### Instructions

Produce only Slide 7: **Remote-Care Economics**. Populate every field required by its complete contract in Outputs, bind every material claim to saved evidence, and remove unsupported template content. Save one standalone 1280x720 slide; do not create or modify another slide. Render the current HTML to PNG and validate both. A rerun replaces only slides/slide-07/ and makes assembly, QA, PDF, and overall result stale.

#### Outputs

- slides/slide-07/slide-07-data.json - exact visible copy, values, labels, layout, caveats, assets, dependencies, and content hash required specifically for **Remote-Care Economics**.
- slides/slide-07/slide-07-evidence.json - claim-by-claim source workflow, step, artifact, URL, excerpt/value, evidence state, qualification, and sufficiency.
- slides/slide-07/slide-07.html - one standalone controlled 1280x720 **Remote-Care Economics** slide.
- slides/slide-07/slide-07-preview.png - current rendered 1280x720 preview.
- slides/slide-07/slide-07-validation.json - slide-specific required-content, evidence, unsupported-claim, dimensions, overflow, clipping, assets, text-size, HTML/preview hash, and overall checks.

#### Acceptance Criteria

- Every requirement in the Slide 7 **Remote-Care Economics** contract in Outputs passes and appears in slide-07-validation.json.
- All five files exist, agree on slide identity, and bind with SlideOutput.SchemaVersion = proposal-slide/v1 and PrimaryArtifactKey = slide-07-preview.
- Every claim has evidence or visible qualification; HTML has exactly one 1280x720 slide; assets resolve; preview is current, unclipped, non-overlapping, and readable.
- No other slide or final-deck artifact is created or modified.

### Step 14: Produce Slide 8 - What Is Already Working

#### Inputs

- Completed Steps 1-6 research, prerequisite manifests, the complete Slide 8 contract in Outputs, shared template assets, and accepted slides needed for continuity.

#### Instructions

Produce only Slide 8: **What Is Already Working**. Populate every field required by its complete contract in Outputs, bind every material claim to saved evidence, and remove unsupported template content. Save one standalone 1280x720 slide; do not create or modify another slide. Render the current HTML to PNG and validate both. A rerun replaces only slides/slide-08/ and makes assembly, QA, PDF, and overall result stale.

#### Outputs

- slides/slide-08/slide-08-data.json - exact visible copy, values, labels, layout, caveats, assets, dependencies, and content hash required specifically for **What Is Already Working**.
- slides/slide-08/slide-08-evidence.json - claim-by-claim source workflow, step, artifact, URL, excerpt/value, evidence state, qualification, and sufficiency.
- slides/slide-08/slide-08.html - one standalone controlled 1280x720 **What Is Already Working** slide.
- slides/slide-08/slide-08-preview.png - current rendered 1280x720 preview.
- slides/slide-08/slide-08-validation.json - slide-specific required-content, evidence, unsupported-claim, dimensions, overflow, clipping, assets, text-size, HTML/preview hash, and overall checks.

#### Acceptance Criteria

- Every requirement in the Slide 8 **What Is Already Working** contract in Outputs passes and appears in slide-08-validation.json.
- All five files exist, agree on slide identity, and bind with SlideOutput.SchemaVersion = proposal-slide/v1 and PrimaryArtifactKey = slide-08-preview.
- Every claim has evidence or visible qualification; HTML has exactly one 1280x720 slide; assets resolve; preview is current, unclipped, non-overlapping, and readable.
- No other slide or final-deck artifact is created or modified.

### Step 15: Produce Slide 9 - The Practical Gap

#### Inputs

- Completed Steps 1-6 research, prerequisite manifests, the complete Slide 9 contract in Outputs, shared template assets, and accepted slides needed for continuity.

#### Instructions

Produce only Slide 9: **The Practical Gap**. Populate every field required by its complete contract in Outputs, bind every material claim to saved evidence, and remove unsupported template content. Save one standalone 1280x720 slide; do not create or modify another slide. Render the current HTML to PNG and validate both. A rerun replaces only slides/slide-09/ and makes assembly, QA, PDF, and overall result stale.

#### Outputs

- slides/slide-09/slide-09-data.json - exact visible copy, values, labels, layout, caveats, assets, dependencies, and content hash required specifically for **The Practical Gap**.
- slides/slide-09/slide-09-evidence.json - claim-by-claim source workflow, step, artifact, URL, excerpt/value, evidence state, qualification, and sufficiency.
- slides/slide-09/slide-09.html - one standalone controlled 1280x720 **The Practical Gap** slide.
- slides/slide-09/slide-09-preview.png - current rendered 1280x720 preview.
- slides/slide-09/slide-09-validation.json - slide-specific required-content, evidence, unsupported-claim, dimensions, overflow, clipping, assets, text-size, HTML/preview hash, and overall checks.

#### Acceptance Criteria

- Every requirement in the Slide 9 **The Practical Gap** contract in Outputs passes and appears in slide-09-validation.json.
- All five files exist, agree on slide identity, and bind with SlideOutput.SchemaVersion = proposal-slide/v1 and PrimaryArtifactKey = slide-09-preview.
- Every claim has evidence or visible qualification; HTML has exactly one 1280x720 slide; assets resolve; preview is current, unclipped, non-overlapping, and readable.
- No other slide or final-deck artifact is created or modified.

### Step 16: Produce Slide 10 - Website Scorecard or No-Site Outcome

#### Inputs

- Completed Steps 1-6 research, prerequisite manifests, the complete Slide 10 contract in Outputs, shared template assets, and accepted slides needed for continuity.

#### Instructions

Produce only Slide 10: **Website Scorecard or No-Site Outcome**. Populate every field required by its complete contract in Outputs, bind every material claim to saved evidence, and remove unsupported template content. Save one standalone 1280x720 slide; do not create or modify another slide. Render the current HTML to PNG and validate both. A rerun replaces only slides/slide-10/ and makes assembly, QA, PDF, and overall result stale.

#### Outputs

- slides/slide-10/slide-10-data.json - exact visible copy, values, labels, layout, caveats, assets, dependencies, and content hash required specifically for **Website Scorecard or No-Site Outcome**.
- slides/slide-10/slide-10-evidence.json - claim-by-claim source workflow, step, artifact, URL, excerpt/value, evidence state, qualification, and sufficiency.
- slides/slide-10/slide-10.html - one standalone controlled 1280x720 **Website Scorecard or No-Site Outcome** slide.
- slides/slide-10/slide-10-preview.png - current rendered 1280x720 preview.
- slides/slide-10/slide-10-validation.json - slide-specific required-content, evidence, unsupported-claim, dimensions, overflow, clipping, assets, text-size, HTML/preview hash, and overall checks.

#### Acceptance Criteria

- Every requirement in the Slide 10 **Website Scorecard or No-Site Outcome** contract in Outputs passes and appears in slide-10-validation.json.
- All five files exist, agree on slide identity, and bind with SlideOutput.SchemaVersion = proposal-slide/v1 and PrimaryArtifactKey = slide-10-preview.
- Every claim has evidence or visible qualification; HTML has exactly one 1280x720 slide; assets resolve; preview is current, unclipped, non-overlapping, and readable.
- No other slide or final-deck artifact is created or modified.

### Step 17: Produce Slide 11 - What the Website Adds

#### Inputs

- Completed Steps 1-6 research, prerequisite manifests, the complete Slide 11 contract in Outputs, shared template assets, and accepted slides needed for continuity.

#### Instructions

Produce only Slide 11: **What the Website Adds**. Populate every field required by its complete contract in Outputs, bind every material claim to saved evidence, and remove unsupported template content. Save one standalone 1280x720 slide; do not create or modify another slide. Render the current HTML to PNG and validate both. A rerun replaces only slides/slide-11/ and makes assembly, QA, PDF, and overall result stale.

#### Outputs

- slides/slide-11/slide-11-data.json - exact visible copy, values, labels, layout, caveats, assets, dependencies, and content hash required specifically for **What the Website Adds**.
- slides/slide-11/slide-11-evidence.json - claim-by-claim source workflow, step, artifact, URL, excerpt/value, evidence state, qualification, and sufficiency.
- slides/slide-11/slide-11.html - one standalone controlled 1280x720 **What the Website Adds** slide.
- slides/slide-11/slide-11-preview.png - current rendered 1280x720 preview.
- slides/slide-11/slide-11-validation.json - slide-specific required-content, evidence, unsupported-claim, dimensions, overflow, clipping, assets, text-size, HTML/preview hash, and overall checks.

#### Acceptance Criteria

- Every requirement in the Slide 11 **What the Website Adds** contract in Outputs passes and appears in slide-11-validation.json.
- All five files exist, agree on slide identity, and bind with SlideOutput.SchemaVersion = proposal-slide/v1 and PrimaryArtifactKey = slide-11-preview.
- Every claim has evidence or visible qualification; HTML has exactly one 1280x720 slide; assets resolve; preview is current, unclipped, non-overlapping, and readable.
- No other slide or final-deck artifact is created or modified.

### Step 18: Produce Slide 12 - Website and AI-Answer Opportunity

#### Inputs

- Completed Steps 1-6 research, prerequisite manifests, the complete Slide 12 contract in Outputs, shared template assets, and accepted slides needed for continuity.

#### Instructions

Produce only Slide 12: **Website and AI-Answer Opportunity**. Populate every field required by its complete contract in Outputs, bind every material claim to saved evidence, and remove unsupported template content. Save one standalone 1280x720 slide; do not create or modify another slide. Render the current HTML to PNG and validate both. A rerun replaces only slides/slide-12/ and makes assembly, QA, PDF, and overall result stale.

#### Outputs

- slides/slide-12/slide-12-data.json - exact visible copy, values, labels, layout, caveats, assets, dependencies, and content hash required specifically for **Website and AI-Answer Opportunity**.
- slides/slide-12/slide-12-evidence.json - claim-by-claim source workflow, step, artifact, URL, excerpt/value, evidence state, qualification, and sufficiency.
- slides/slide-12/slide-12.html - one standalone controlled 1280x720 **Website and AI-Answer Opportunity** slide.
- slides/slide-12/slide-12-preview.png - current rendered 1280x720 preview.
- slides/slide-12/slide-12-validation.json - slide-specific required-content, evidence, unsupported-claim, dimensions, overflow, clipping, assets, text-size, HTML/preview hash, and overall checks.

#### Acceptance Criteria

- Every requirement in the Slide 12 **Website and AI-Answer Opportunity** contract in Outputs passes and appears in slide-12-validation.json.
- All five files exist, agree on slide identity, and bind with SlideOutput.SchemaVersion = proposal-slide/v1 and PrimaryArtifactKey = slide-12-preview.
- Every claim has evidence or visible qualification; HTML has exactly one 1280x720 slide; assets resolve; preview is current, unclipped, non-overlapping, and readable.
- No other slide or final-deck artifact is created or modified.

### Step 19: Produce Slide 13 - Sourced Competitor Comparison

#### Inputs

- Completed Steps 1-6 research, prerequisite manifests, the complete Slide 13 contract in Outputs, shared template assets, and accepted slides needed for continuity.

#### Instructions

Produce only Slide 13: **Sourced Competitor Comparison**. Populate every field required by its complete contract in Outputs, bind every material claim to saved evidence, and remove unsupported template content. Save one standalone 1280x720 slide; do not create or modify another slide. Render the current HTML to PNG and validate both. A rerun replaces only slides/slide-13/ and makes assembly, QA, PDF, and overall result stale.

#### Outputs

- slides/slide-13/slide-13-data.json - exact visible copy, values, labels, layout, caveats, assets, dependencies, and content hash required specifically for **Sourced Competitor Comparison**.
- slides/slide-13/slide-13-evidence.json - claim-by-claim source workflow, step, artifact, URL, excerpt/value, evidence state, qualification, and sufficiency.
- slides/slide-13/slide-13.html - one standalone controlled 1280x720 **Sourced Competitor Comparison** slide.
- slides/slide-13/slide-13-preview.png - current rendered 1280x720 preview.
- slides/slide-13/slide-13-validation.json - slide-specific required-content, evidence, unsupported-claim, dimensions, overflow, clipping, assets, text-size, HTML/preview hash, and overall checks.

#### Acceptance Criteria

- Every requirement in the Slide 13 **Sourced Competitor Comparison** contract in Outputs passes and appears in slide-13-validation.json.
- All five files exist, agree on slide identity, and bind with SlideOutput.SchemaVersion = proposal-slide/v1 and PrimaryArtifactKey = slide-13-preview.
- Every claim has evidence or visible qualification; HTML has exactly one 1280x720 slide; assets resolve; preview is current, unclipped, non-overlapping, and readable.
- No other slide or final-deck artifact is created or modified.

### Step 20: Produce Slide 14 - Growth Recap

#### Inputs

- Completed Steps 1-6 research, prerequisite manifests, the complete Slide 14 contract in Outputs, shared template assets, and accepted slides needed for continuity.

#### Instructions

Produce only Slide 14: **Growth Recap**. Populate every field required by its complete contract in Outputs, bind every material claim to saved evidence, and remove unsupported template content. Save one standalone 1280x720 slide; do not create or modify another slide. Render the current HTML to PNG and validate both. A rerun replaces only slides/slide-14/ and makes assembly, QA, PDF, and overall result stale.

#### Outputs

- slides/slide-14/slide-14-data.json - exact visible copy, values, labels, layout, caveats, assets, dependencies, and content hash required specifically for **Growth Recap**.
- slides/slide-14/slide-14-evidence.json - claim-by-claim source workflow, step, artifact, URL, excerpt/value, evidence state, qualification, and sufficiency.
- slides/slide-14/slide-14.html - one standalone controlled 1280x720 **Growth Recap** slide.
- slides/slide-14/slide-14-preview.png - current rendered 1280x720 preview.
- slides/slide-14/slide-14-validation.json - slide-specific required-content, evidence, unsupported-claim, dimensions, overflow, clipping, assets, text-size, HTML/preview hash, and overall checks.

#### Acceptance Criteria

- Every requirement in the Slide 14 **Growth Recap** contract in Outputs passes and appears in slide-14-validation.json.
- All five files exist, agree on slide identity, and bind with SlideOutput.SchemaVersion = proposal-slide/v1 and PrimaryArtifactKey = slide-14-preview.
- Every claim has evidence or visible qualification; HTML has exactly one 1280x720 slide; assets resolve; preview is current, unclipped, non-overlapping, and readable.
- No other slide or final-deck artifact is created or modified.

### Step 21: Produce Slide 15 - Two Paths to Start

#### Inputs

- Completed Steps 1-6 research, prerequisite manifests, the complete Slide 15 contract in Outputs, shared template assets, and accepted slides needed for continuity.

#### Instructions

Produce only Slide 15: **Two Paths to Start**. Populate every field required by its complete contract in Outputs, bind every material claim to saved evidence, and remove unsupported template content. Save one standalone 1280x720 slide; do not create or modify another slide. Render the current HTML to PNG and validate both. A rerun replaces only slides/slide-15/ and makes assembly, QA, PDF, and overall result stale.

#### Outputs

- slides/slide-15/slide-15-data.json - exact visible copy, values, labels, layout, caveats, assets, dependencies, and content hash required specifically for **Two Paths to Start**.
- slides/slide-15/slide-15-evidence.json - claim-by-claim source workflow, step, artifact, URL, excerpt/value, evidence state, qualification, and sufficiency.
- slides/slide-15/slide-15.html - one standalone controlled 1280x720 **Two Paths to Start** slide.
- slides/slide-15/slide-15-preview.png - current rendered 1280x720 preview.
- slides/slide-15/slide-15-validation.json - slide-specific required-content, evidence, unsupported-claim, dimensions, overflow, clipping, assets, text-size, HTML/preview hash, and overall checks.

#### Acceptance Criteria

- Every requirement in the Slide 15 **Two Paths to Start** contract in Outputs passes and appears in slide-15-validation.json.
- All five files exist, agree on slide identity, and bind with SlideOutput.SchemaVersion = proposal-slide/v1 and PrimaryArtifactKey = slide-15-preview.
- Every claim has evidence or visible qualification; HTML has exactly one 1280x720 slide; assets resolve; preview is current, unclipped, non-overlapping, and readable.
- No other slide or final-deck artifact is created or modified.

### Step 22: Produce Slide 16 - Choose a Starting Path

#### Inputs

- Completed Steps 1-6 research, prerequisite manifests, the complete Slide 16 contract in Outputs, shared template assets, and accepted slides needed for continuity.

#### Instructions

Produce only Slide 16: **Choose a Starting Path**. Populate every field required by its complete contract in Outputs, bind every material claim to saved evidence, and remove unsupported template content. Save one standalone 1280x720 slide; do not create or modify another slide. Render the current HTML to PNG and validate both. A rerun replaces only slides/slide-16/ and makes assembly, QA, PDF, and overall result stale.

#### Outputs

- slides/slide-16/slide-16-data.json - exact visible copy, values, labels, layout, caveats, assets, dependencies, and content hash required specifically for **Choose a Starting Path**.
- slides/slide-16/slide-16-evidence.json - claim-by-claim source workflow, step, artifact, URL, excerpt/value, evidence state, qualification, and sufficiency.
- slides/slide-16/slide-16.html - one standalone controlled 1280x720 **Choose a Starting Path** slide.
- slides/slide-16/slide-16-preview.png - current rendered 1280x720 preview.
- slides/slide-16/slide-16-validation.json - slide-specific required-content, evidence, unsupported-claim, dimensions, overflow, clipping, assets, text-size, HTML/preview hash, and overall checks.

#### Acceptance Criteria

- Every requirement in the Slide 16 **Choose a Starting Path** contract in Outputs passes and appears in slide-16-validation.json.
- All five files exist, agree on slide identity, and bind with SlideOutput.SchemaVersion = proposal-slide/v1 and PrimaryArtifactKey = slide-16-preview.
- Every claim has evidence or visible qualification; HTML has exactly one 1280x720 slide; assets resolve; preview is current, unclipped, non-overlapping, and readable.
- No other slide or final-deck artifact is created or modified.

### Step 23: Assemble the Full HTML Deck

#### Inputs

- Sixteen accepted slide packages from Steps 7-22 and the unchanged reference template design system.

#### Instructions

Before assembly, verify the complete slide-to-evidence plan represented by the sixteen `slide-NN-evidence.json` files. Assemble only accepted `slide-NN.html` artifacts in order into `{company-slug}-proposal/index.html`. Apply shared navigation, numbering, CSS, fonts, print behavior, and assets deterministically. Do not regenerate or rewrite slide content.

#### Outputs

- `{company-slug}-proposal/index.html`, `slide-content-bindings.json`, and `assembly-record.json` with included slide hashes, template, order, count, assets, and warnings.

#### Acceptance Criteria

- Exactly sixteen current accepted slides appear in order; stale, failed, or missing slides block assembly.
- No slide content changes during assembly; section hashes match accepted slide artifacts; navigation, CSS, fonts, print behavior, and assets resolve.

### Step 24: Cross-Slide Readability and Narrative QA

#### Inputs

- Step 23 HTML and all accepted slide validation/evidence packages.

#### Instructions

Render all 16 slides at 1280x720 during this step and check narrative, titles, numbering, branding, values, caveats, overflow, clipping, collisions, whitespace, text size, and assets. Do not silently rewrite slide content. A content defect identifies its owning slide step for rerun.

#### Outputs

- Sixteen full-deck PNG screenshots, `contact-sheet.png`, `cross-slide-qa.json`, and `cross-slide-change-ledger.json`.

#### Acceptance Criteria

- All slides render without clipping, overlap, body overflow, missing assets, or unreadable meaningful text.
- Narrative, branding, claims, caveats, market values, and economics are consistent. Slide-content defects block this step and identify the owner.

### Step 25: Export PDF and Package Deliverables

#### Inputs

- Step 24 accepted HTML and QA, research artifacts, per-slide packages, and all workflow acceptance criteria.

#### Instructions

Export the accepted HTML to PDF, inspect all pages, create the deterministic final package, and record exact export provenance. Do not publish, attach, email, or modify external systems.

#### Outputs

- Final 16-slide HTML, 16-page PDF, rendered slides, contact sheet, research/market/competitor/evidence records, all per-slide packages, `proposal-artifact-manifest.json`, `artifact-manifest.json`, `completion-validation.json`, and `pdf-export-record.json` recording engine, action, version, source/PDF paths and hashes, timestamp, page size/count, and settings.

#### Acceptance Criteria

- HTML has sixteen slides and PDF has sixteen corresponding pages from that exact HTML.
- Export provenance and hashes are recorded; every artifact resolves and appears in the Workbench Output area; no external mutation occurred.

## Validation

Final independent validation is owned by `Skills/MarketingWebsiteSales/Prompts/CreatePharmacyGrowthProposalDeck.validation.prompt.md` through the prototype's `ValidationPromptPath`. Steps 7-22 must still satisfy their slide-local acceptance criteria, Step 24 must perform cross-slide QA, and Step 25 must assemble/export the exact candidate package. Do not claim final workflow completion until the separate final validator passes against that package.
