# Pharmacy Growth Proposal Template - Implementation Notes

These notes travel with `index.html` and explain how to populate the Asheville-inspired pharmacy growth proposal deck without inventing evidence. Use them before slide assembly and during validation.

## Required research packet before slide writing

Create `proposal-research-packet.md` before filling slides. It must include:

- Lead identity: company name, address, phone, contact, role/title, appointment/follow-up context, NPI if available, CRM/enrichment notes, and source evidence.
- Official website resolution branch: confirmed official website, likely but not confirmed, no official website found, or public profiles only.
- Website audit feeder status: ran, reused, skipped because no confirmed official website, or failed with degraded evidence used.
- Website/profile screenshots captured and where each should be used.
- Website metrics or readiness scores from the validated website audit feeder when available.
- Patient-action checklist results: refill, transfer, hours, call, directions, vaccines/services, delivery/sync/clinical services, and search/AI-answer clarity.
- Competitor comparison ledger summary: named competitors/profiles checked, public URLs or identifiers, and observed patient-action facts.
- AI/LLM-answer readiness evidence: whether public pages clearly answer common patient prompts. Do not claim model ranking/citation/share unless directly captured.
- Remote-care fit observations: plausible patient population, services to lead with, staffing/operations caveats, and whether any services are visible online today.
- Market/economics source summary linked to `market-economics-ledger.json`.
- Slide-use decisions: which screenshot or evidence point goes into each slide.

Required supporting files: `proposal-research-packet.md`, `evidence-summary.md`, `market-economics-ledger.json`, `competitor-comparison-ledger.md` when comparison is possible, website/profile screenshots or a documented no-screenshot reason, and render QA screenshots/metrics.

## Slide 1 - Cover

Purpose: establish a tailored growth plan, not a generic sales deck.

Gather first: pharmacy name, market/city, verified prepared-for contact/title, month/year, and whether this is one-path or two-path.

Use: prospect-first title, verified prepared-for block, and the packaged Intelligence Factory + FairPath presented-by treatment. This is the default `IntelligenceFactoryDirect` profile; use the separate `reference-packet-template-clearspan/` package only when `ClearSpanPartner` is explicitly selected.

Avoid: LeadID, CRM status, appointment timestamp, internal notes, tool names, or overclaimed savings/revenue.

## Slide 2 - Value Proposition

Purpose: explain the remote-care-first offer before the prospect-specific analysis.

Message: make more money, attract more patients, and cut costs / save time.

Gather first: whether the proposal includes remote care, website growth, or both; which services are relevant (RPM, CCM, AWV, RTM, APCM); and any pricing/platform/support constraints.

Use: three cards for new revenue, more patients, less manual work; service chips for RPM, CCM, AWV, RTM, APCM; concrete buyer language.

Avoid: company-brag language or implying every service is immediately billable for every pharmacy.

## Slide 3 - Remote Care Proof Period

Purpose: make remote care feel concrete and low-risk.

Message: prove Remote Care with a manageable first patient group before scaling. Review at 30 / 60 / 90 days, keep control of the relationship, and confirm terms before launch.

Gather first: remote-care fit, first-group feasibility, team/training needs, 30/60/90-day review measures, and any verified commercial terms.

Use: `Start with a manageable group`, `Review at 30 / 60 / 90 days`, `Keep control of the relationship`, and `Confirm terms before launch`. This slide is Remote Care general, not CCM-only and never CCML.

Avoid: saying everyone can bill immediately, guaranteeing reimbursement, CCM-only proof framing, or unsupported defaults such as month-to-month, cancellation, no per-user fee, no revenue share, leave with your data, or locked in.

## Slide 4 - Remote Care Opportunity

Purpose: show the five program paths before the workflow.

Gather first: plausible services, patient population/export feasibility, and operational caveats.

Use: RPM, CCM, AWV, RTM, and APCM with comparable prominence; APCM and RTM cannot be footnotes. Use the eligibility scoring screenshot and state that scoring supports staff review and does not guarantee eligibility, enrollment, coverage, payment, or reimbursement.

Avoid: CCM-only framing or implying every service is immediately billable.

## Slide 5 - One Clear Remote-Care Workflow

Purpose: show how the work actually happens.

Gather first: FairPath platform screenshot and whether calls/texts, AI assistance, documentation, billing readiness, and custom queues are in scope.

Use this sequence: 1) open the priority queue, 2) see the patient context, 3) connect, document, and confirm readiness.

Also include: less searching, fewer hand-built records, clearer handoffs, earlier visibility into incomplete work, AI helps identify what needs attention next, and people stay responsible for review/judgment/care decisions.

Avoid: vague platform language or AI replacing clinical judgment.

## Slide 6 - Market Opportunity Size

Purpose: size the local opportunity before economics.

Gather first: service-area population, estimated Medicare beneficiaries, estimated physicians, estimated physician offices/clinics, sources, and assumptions.

Use: directional metrics with evidence labels. Values must match `market-economics-ledger.json`.

Avoid: treating estimates as verified or putting economics before workflow.

## Slide 7 - Economics / Participation Examples

Purpose: show what participation could mean.

Gather first: low/base/high patient counts, annual gross billing per patient, annual gross billing totals, ledger arithmetic, and caveats.

Use: A Cautious Start, Steady Growth, Strong Participation. Use gross billing only. Required qualification: examples only, not a promise.

Avoid: net revenue, profit, guaranteed income, or unsupported payer assumptions.

## Slide 8 - What Is Already Working

Purpose: lead with positive proof before critique.

Gather first: official website screenshot if confirmed and visually useful; public profile/social/reputation/storefront screenshot if stronger or if no official website exists; evidence-backed strengths.

Screenshot guidance: use one dominant visual. Prefer current-site homepage/header/hero/action crop for confirmed websites. For no-site cases, use the strongest verified public profile/social visual. Do not use a weak generated mockup.

Use: 2-4 proof points and a positive observational caption with evidence label.

Avoid: starting with criticism or unsupported traffic/conversion/reach/ranking claims.

## Slide 9 - The Practical Gap

Purpose: summarize what is good and bad using metrics/statuses.

Gather first: confirmed official website; validated website-audit feeder output; overall score if produced; category scores/statuses for local discovery/SEO, customer actions, trust/content, mobile/readability, and AI-answer readiness.

Branching: confirmed website uses audit feeder scores/statuses. No confirmed website must not fabricate a website score; use public-presence readiness only if explicitly supported. Feeder failure must use degraded evidence labels and avoid score-like presentation unless directly observed.

Use: overall score panel if supported; category rows with one strength and one opportunity.

Avoid: fake scores or technical scores that do not help the owner conversation.

## Slide 10 - Metric-Driven Website Score

Purpose: translate website evidence into patient actions.

Gather first: screenshot/crop of current site or public profile; checklist results for refill, transfer, hours, call, directions, vaccines/services, delivery/med sync/clinical services, and search + AI-answer clarity.

Use statuses: Clear, Present but buried, Missing, Not verified.

Use: screenshot/crop on one side; checklist/status rows on the other.

Avoid: crawl jargon, ranking claims, or treating missing website content as proof the pharmacy does not offer a service offline.

## Slide 11 - What the Website Adds

Purpose: translate evidence into the business gap.

Gather first: strongest 3 consequences from the website evidence and the no-site / weak-site / established-site branch.

Use: three consequence cards and one next-step strip.

Branching: no website means owned searchable home gap; weak website means patient actions are harder than they should be; established website means strongest remaining growth gap.

Avoid: accusatory tone or unsupported lost-revenue claims.

## Slide 12 - Website and AI-Answer Opportunity

Purpose: show practical upside from clearer patient answers.

Gather first: evidence for hours, location, refills, transfers, vaccines, delivery, services, phone, directions; AI/LLM-answer readiness observations; optional compact competitor/profile contrast.

Use: opportunity cards for hours/location, refill/transfer, services, local search, AI answers, and optional contrast. Frame AI readiness as clear public facts, not rankings.

Avoid: claiming ChatGPT/Google AI citation/ranking unless directly captured. Do not move the named competitor comparison here.

## Slide 13 - Sourced Competitor Comparison

Purpose: show what patients can clearly see and do elsewhere.

Gather first: 2-4 nearby independent competitors where identifiable, 1-3 chain/large public profiles when relevant, public URLs/identifiers, and observed patient-action facts.

Compare: website/profile found, refill/transfer, services/vaccines, hours/contact/directions, patient-answer readiness, and observed public trust/profile signals.

Use: named columns/cards and required caveat: focused public-evidence comparison, not map-pack/ranking/review audit.

Avoid: generic categories only, superiority claims, or review/ranking claims not collected.

## Slide 14 - Growth Recap / Control

Purpose: recap the offer and buyer reassurance.

Message: start fast without giving up control; make more money by adding services; attract patients through website/local discovery/SEO/LLM answers; cut costs/save time through automation and one platform.

Gather first: which paths are included and any approved FairPath proof/context metrics if available and allowed.

Use: three cards for make more money, attract patients, cut costs/save time; control reassurance that pharmacy keeps the patient relationship and operating decision. Optional proof strip only if approved.

Avoid: repeating slide 2 word-for-word or unsupported FairPath-wide stats.

## Slide 15 - Two Clear Starting Paths

Purpose: make next steps concrete.

Gather first: whether BAA/export is required, whether patient scoring within five days is supported, whether first billing-active/billing-ready patients within 30 days is supported and caveated, and website access/content approval assumptions.

Remote-care path:
- Today: agreement, BAA, export request, owners named.
- 5 days: population scored and first priority outreach group selected.
- 30 days: first participating patients billing-ready or active when consent, documentation, payer, and operational fit are confirmed.

Website path:
- Today: start build from verified facts, services, proof, and top patient actions.
- 1 week: website foundation live with SEO, LLM-ready answers, and integrated service pages.
- 1 month: reputation management, service campaigns, measurement, and ongoing improvements.

Avoid: guaranteeing billing by day 30 or promising website timing without access/content assumptions.

## Slide 16 - Choose a Starting Path

Purpose: end with a clear decision.

Gather first: assigned sales rep if known, otherwise default Justin Brochetti; which paths apply; concrete first action for each path.

Use: remote care first, website first, both together, warm next-step footer, and optional line that the pharmacy continues from evidence rather than lock-in.

Avoid: false urgency, unsupported ROI promises, or internal process language.

## Render and final QA

After filling the deck:

- Confirm 16 slide sections.
- Confirm all slide numbers are `N / 16`.
- Confirm all local image references exist.
- Render every slide at 1280x720.
- Inspect slides 3, 4, 5, 8, 9, 10, 11, 12, 13, 15, and 16 closely for overflow or tiny text.
- Confirm no body/page scroll exceeds the slide canvas.
- Save QA screenshots and metrics in `render-qa/`.
- Keep old deck versions when making material flow/style changes.

## How to adjust the source prompt skill

Update `Skills/MarketingWebsiteSales/Prompts/CreatePharmacyGrowthProposalDeck.work.prompt.md` to make this artifact the target structure:

1. Use the packaged 16-slide Asheville-inspired sequence exactly.
2. Use the remote-care-general proof-period flow on slide 3: manageable first patient group, 30/60/90-day reviews, retained relationship control, confirmed terms before launch, and no guarantee language.
3. Replace the FairPath workflow slide instructions with the one-clear-workflow sequence: priority queue, patient context, connect/document/confirm readiness, AI assistance with people in control.
4. Keep website resolution and website audit feeder orchestration from v3.3.
5. Strengthen the research packet requirements to include patient scoring/export feasibility, BAA/agreement assumptions, first-wave ownership, and billing-readiness caveats.
6. Validation must require the 16-slide sequence, APCM/RTM prominence, remote-care-general proof-period caveats, AI-with-people-in-control caveat, two-path timing caveats, and all-slide render QA.
7. Routing fixtures and tests must enforce this 16-slide packaged contract.
8. Treat the packaged HTML, notes, JSON contract, assets, and website visuals as one canonical bundle.
