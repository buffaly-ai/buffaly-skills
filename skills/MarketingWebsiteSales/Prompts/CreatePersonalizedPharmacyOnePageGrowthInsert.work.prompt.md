# FairPath Personalized Pharmacy One-Page Growth Insert
## Canonical Deep-Research, Sales-Reasoning, Copy, Design, and Validation Prompt

**Status:** Standalone execution prompt  
**Purpose:** Create one deeply customized, customer-facing, one-page direct-mail insert for one independent pharmacy.  
**Not:** A proposal deck, audit report, website scorecard, templated “snapshot,” or summary of the pharmacy’s own website.

## Cold-start execution runbook

Use this runbook before reading the detailed sections. Read deeper sections only when the current step references them; do not attempt to materialize this entire long prompt in one file-read call.

1. Read the lead input, supplied campaign-safety sources, and any supplied lead-specific research artifacts.
2. Recheck identity, operating status, customer/defunct status, prior-mail duplicates, same-business duplicates, recent contact, and active-sales conflict.
3. Obtain the canonical website audit. Reuse a supplied current audit only when it names this exact pharmacy, URL, address, and checked date and includes website, competitor, conversion, and AI/LLM-readiness evidence. Otherwise the coordinator must run `ToAnalyzeExistingWebsiteForImprovementsSkill` through `ToRunValidatedPromptSkill` and supply the result to the worker. Do not run that validated action through a worker relay known to fail.
4. Obtain the reputation scan. `ToCheckPharmacyReputationSkill` returns the owned checklist instructions, not a completed lead report. Read those instructions once, execute the checklist research for this exact pharmacy, and save the resulting report. A supplied current completed report may be reused after identity/date/source checks.
5. Synthesize services, workflow, practical local context, and evidence limits.
6. Generate three materially different growth ideas using the detailed candidate procedure; select one by evidence, usefulness, FairPath fit, visual clarity, and owner relevance.
7. Build the upper half around the selected pharmacy-specific idea and a meaningful official-site screenshot. Build the lower half around FairPath outcomes: remote care, less manual intake/process work, and more patients.
8. Render one canonical HTML, one-page PDF, and exact preview PNG. OCR and visually inspect that exact PNG. Fix and rerender substantive defects.
9. Release only when evidence, screenshot, language, visual, artifact-identity, and mail-safety gates pass. Otherwise return the defined nonvisual blocker package.

Critical financial-copy rendering rule: when inserting approved copy such as `$10,000-$20,000`, do not pass dollar-sign text through replacement APIs that interpret `$` as a capture-group or variable token. Use literal-safe replacement, escaped values, or a renderer that writes the final text directly. Exact-PNG OCR must capture the actual numerical amount and its qualifier; detecting only a dollar sign, the word `month`, or a paraphrase such as `this amount` does not pass. The release record must separately prove the pharmacy identity, FairPath identity, selected-idea headline, flow, CTA, exact financial amount when used, required qualifier, and absence of forbidden/internal wording.

---

## 1. Role

You are the senior research strategist, pharmacy-growth sales strategist, direct-response copywriter, evidence editor, and print-art director responsible for one personalized FairPath stage-one mail piece.

You must do the judgment work. Research is not the deliverable. A list of findings is not the deliverable. A smaller proposal deck is not the deliverable. Your job is to discover one useful, believable, pharmacy-specific growth idea; explain it in language a human pharmacy owner can absorb quickly; connect it to outcomes FairPath can help create; and turn it into a polished one-page visual that makes the owner want to learn more.

Perform full pharmacy-specific reasoning for every approved lead. Do not create shallow tiers in which only a few leads receive genuine customization. Each page's central idea, evidence, wording, screenshot, and visual flow must be selected specifically for that pharmacy.

---

## 2. Campaign intent

The direct-mail sequence has a distinct job from the full Pharmacy Growth Proposal Deck. Stage one earns attention; it is not a proposal deck.

- **Stage one:** Earn attention and a response with one useful personalized insight and a simple visual story.
- **Later stage:** If the owner engages, use the full proposal cadence to establish broader evidence, economics, implementation, and commercial terms.

The one-page insert must not attempt to close the entire sale. It should create the reaction:

> “They actually looked at our pharmacy, they understand something we care about, and this might be worth seeing.”

It should not create the reaction:

> “An AI scraped our website and summarized it back to us.”

The insert goes with or informs a letter. It is a new lead-generation mechanism inspired by the broader FairPath growth offer—not a compressed version of the deck.

---

## Execution resources and acceptance contract

### Skills and prompt references

This map is part of the core execution contract. A `Run` dependency is an action to execute. A `Read/Reuse` dependency supplies standards or evidence. Resolve action availability through the runtime's action discovery. If a named optional action is unavailable, continue using the equivalent procedures written in this prompt.

For each required validated-prompt research action that has not already been satisfied by a current, identity-matched canonical artifact supplied in the input, use this route exactly:

1. discover the action and confirm its canonical prototype;
2. invoke it through the runtime's validated-prompt runner from the coordinator/parent session rather than calling the validated action directly or relying on a worker-session relay;
3. if the runner fails, record the exact error and try one materially different supported typed route only when discovery exposes one;
4. do not repeat the same failed call, do not loop through wrappers, and do not stop on a progress message while a safe next step remains;
5. if the required action still has not produced its canonical output, stop production and return a research-capability blocker package only.

A research-capability blocker is not evidence that the lead is unsafe, defunct, duplicated, or inappropriate to mail. Keep infrastructure status separate from lead/mail-safety status. However, required-action failure does mean the creative insert has not met this prompt's production contract. Do not create a mock, internal-proof, placeholder, or customer-facing HTML/PDF/PNG in that state unless the caller explicitly asks for a blocked visual prototype. The normal blocker package contains only a blocker JSON/Markdown file, the verified identity and mail-safety evidence gathered so far, the failed action name, attempted route, exact error, and recommended rerun step.

| Stage | Skill or prompt reference | Mode | Required use |
|---|---|---|---|
| Identity and mail safety | The CRM, mailing-decision, and prior-mailing sources supplied in the input contract | Read/Reuse | Confirm operating status, customer/defunct state, duplicates, previous mailing, and active sales constraints. If required sources are absent and cannot be discovered safely, stop before production. |
| Optional lead enrichment | `ToEnrichPharmacyLeadSkill` | Run only when needed and available | Fill current decision-maker, technology, clinical-service, or website-capability gaps. Do not treat its concise card as the complete research packet. |
| Website, competitors, conversion, and AI readiness | `ToAnalyzeExistingWebsiteForImprovementsSkill` | Run once from the coordinator, or reuse one supplied current identity-matched canonical audit | Produce the canonical site/competitor/conversion audit and built-in AI Search and LLM Readiness evidence. Its owned work and validation prompts govern the action. A worker may reuse the supplied result but may not substitute a generic web summary. |
| Reputation | `ToCheckPharmacyReputationSkill` | Load instructions once, then execute the checklist; or reuse one supplied current identity-matched completed report | This action returns workflow instructions, not the completed pharmacy report. Follow its owned checklist to research profile, review, name/address/phone/hours, reputation, photo, and closure/relocation evidence, then save the completed report. |
| Services and workflow | Website/reputation outputs, CRM, enrichment artifacts | Read/Reuse | Synthesize verified services, patient/provider actions, staff-work signals, and unknowns. |
| Market and broader FairPath strategy | `ToCreatePharmacyGrowthProposalDeckSkill` owned work prompt: `Skills/MarketingWebsiteSales/Prompts/CreatePharmacyGrowthProposalDeck.work.prompt.md` | Read/Reuse only when the runtime can inspect the owned prompt | Reuse context-market versus practical-service-area discipline, source hierarchy, local-care evidence, and broader digital/remote-care/provider-partnership cadence. Do not execute the deck action for this insert. If the prompt cannot be inspected, use the equivalent rules written in this document. |
| Market and claim rigor | The deck action's owned validation prompt: `Skills/MarketingWebsiteSales/Prompts/CreatePharmacyGrowthProposalDeck.validation.prompt.md` | Read/Reuse only when accessible | Apply its evidence and arithmetic standards when market or financial facts appear. This prompt's validation rules remain sufficient when the owned file is unavailable. |
| Candidate ideas and selection | This prompt, Phases B and C | Execute directly | Reconcile evidence, generate divergent candidates, challenge them, and select one. No separate installed skill replaces this judgment. |
| Clinical/provider wording, when relevant | Optional `ToAddClinicalServicesToWebsiteSkill` | Run only when available and the selected idea is clinical or referral-centered | Reuse its human provider/patient wording discipline. The equivalent requirements in Phase D remain authoritative if the action is unavailable. |
| Copy, design, rendering, and QA | This prompt, the canonical HTML template, and approved FairPath brand assets | Execute directly | Build, render, OCR, review, remediate, and validate the one-page insert. |

### Locked production template

The visual master is external, versioned, and mandatory:

- Template: `Skills/MarketingWebsiteSales/Templates/fairpath-one-page-insert-v1/fairpath-one-page-insert.template.html`
- Contract: `Skills/MarketingWebsiteSales/Templates/fairpath-one-page-insert-v1/template-contract.json`
- Brand asset: `Skills/MarketingWebsiteSales/Templates/fairpath-one-page-insert-v1/fairpath-logo-complete.png`
- Template ID: `fairpath-one-page-insert-v1`

This template is the sterilized form of the approved visual master. Its CSS, semantic section order, grid proportions, typography, spacing, colors, cards, result band, CTA treatment, and footer position are locked. Do not redesign it. Do not adapt proportions. Do not move or replace sections. Do not create a new scaffold. Do not use Pillow, SVG text drawing, a canvas, or a flattened image as the authoring surface. Do not make an HTML file that merely wraps a PNG.

The agent performing research and sales reasoning produces structured content only. The deterministic renderer then:

1. reads the template and contract;
2. verifies `TemplateId = fairpath-one-page-insert-v1`;
3. copies the template and approved FairPath logo into the lead output directory;
4. populates every required slot with HTML-escaped plain text or a validated local image path;
5. enforces every `MaxCharacters` limit before rendering;
6. rejects missing, extra, unresolved, or over-limit fields;
7. rejects any screenshot that is not one contiguous capture of an actual official webpage;
8. writes semantic HTML containing the recipient-visible text;
9. renders that HTML through a browser-quality HTML/CSS engine to one-page PDF and exact PNG;
10. validates design fidelity, exact content, and the exact rendered image.

Only these content regions vary by pharmacy: recipient identity, kicker, split headline, introduction, three-step idea flow, 90-day outcome, proof label/headline/copy, actual official-site screenshot, the three outcome-card bodies, result context, approved financial amount/qualifier, CTA, and disclaimer. The fixed FairPath section headings and visual language remain unchanged.

If content does not fit, shorten and improve the content. Never shrink fonts, alter CSS, change page geometry, remove whitespace, replace the website screenshot with a collage, or switch to coordinate-based raster drawing.

Required structured content artifact: `<basename>-template-content.json`. Its keys must match the template contract exactly. It must be saved before rendering and must record character counts for every limited field.

Required fidelity checks:

- final HTML CSS hash equals the sterile template CSS hash;
- final HTML has the same locked section sequence and classes;
- all 33 required slots were populated exactly once and no braces remain;
- final HTML includes semantic recipient-visible text and is not an image wrapper;
- screenshot source is a contiguous official webpage capture;
- PDF has exactly one Letter page;
- exact PNG preserves header, intro, idea flow, proof card, three outcome cards, dark result band, CTA, and footer;
- text density and whitespace remain comparable to the approved master;
- no clipping, overlap, tiny type, or ad hoc design substitution;
- exact-PNG OCR proves pharmacy name, headline, flow, CTA, approved amount when used, qualifier, and absence of internal language.

A result can pass factual and OCR checks while still failing template fidelity. Template fidelity is a blocking release gate.
### Objective and release criteria

Do not deliver unless every item is true:

1. **Mail-safe:** current, operating, non-customer, non-defunct, nonduplicate, and not improperly crossing an active sales motion or previous mailing.
2. **Researched:** validated website/competitor/AI-readiness audit, reputation scan, service/workflow synthesis, and relevant practical-market evidence exist.
3. **Strategically specific:** at least three materially different ideas were developed; one was selected with explicit rationale and counterevidence.
4. **Useful:** the chosen idea teaches the owner more than their own website or service list.
5. **Human:** recipient copy discusses people, pharmacy work, and concrete outcomes in language an owner might actually use.
6. **Customer-appropriate:** no internal analysis labels, consultant jargon, production notes, unsupported criticism, creepy inference, unexplained acronym, or demeaning language is visible.
7. **Visual:** one meaningful official-site screenshot supports the idea; the page is branded, readable, compelling, and exactly one US Letter page.
8. **Outcome-led:** the lower half clearly explains relevant FairPath outcomes—remote care, less manual work, and more patients—without forcing unsupported fit.
9. **Truthful:** every consequential claim is traceable; financial proof is approved, responsible, and qualified.
10. **Actionable:** a real visible response route explains what happens next.
11. **Artifact-correct:** the exact linked preview was OCR-checked; its PDF/HTML siblings are canonical; obsolete drafts cannot be mistaken for final.
12. **Validated:** all evidence, customer-language, customization, screenshot, strategy, visual, and exact-artifact gates pass with `ValidationIssues: []`.

---

## Input contract

Prefer a Feeding Frenzy LeadID. Resolve or accept:

- LeadID;
- legal/public pharmacy name and common name;
- verified physical and mailing address;
- city, state, ZIP;
- phone;
- official website;
- owner/addressee when verified;
- CRM record and narrative notes, or an explicit statement that CRM data is unavailable;
- approved Mail / Do Not Mail decision, or the source data needed to make that decision;
- prior-mailing and duplicate-check evidence, including the comparison list or queryable source;
- current FairPath/customer relationship state;
- approved CTA route for this campaign;
- current FairPath logo and brand assets;
- approved language for financial examples.

If the input contains conflicting identity, address, status, ownership, or website information, resolve it before creative work. Do not “pick the most likely” silently. If a required CRM, prior-mailing, brand, claim-approval, or CTA source is missing and cannot be discovered with available tools, record the blocker and stop before producing mail-ready artwork. An internal proof may be produced only when explicitly requested and visibly labeled as such.

---

## 6. Phase A — Mailing and identity safety gate

Before researching the creative concept:

1. Confirm the pharmacy is open and operating.
2. Confirm the physical business and mailing address.
3. Check the supplied or discoverable CRM source for customer/FairPath-account, defunct, bad lead, duplicate, related location, recent contact, and active pipeline.
4. Check the supplied or discoverable prior-mailing source by LeadID.
5. Check normalized company name, address, phone, website domain, owner/addressee, and contact for cross-mailing duplicates.
6. Treat one physical business as one mailing target unless explicitly instructed otherwise.
7. Record related brands, affiliates, sister pharmacies, shared ownership, and shared website vendors.
8. Stop if the lead is not currently approved for mail.

A technically beautiful page for a customer, closed pharmacy, or previously mailed duplicate is a campaign failure.

Save an internal identity block:

```yaml
lead_id:
pharmacy_name:
physical_address:
mailing_address:
official_website:
phone:
operating_status:
crm_status:
customer_or_fairpath_account:
original_list_match:
duplicate_or_related_location:
recent_contact_or_active_pipeline:
mail_decision:
checked_date:
identity_sources: []
open_conflicts: []
```

---

## 7. Phase B — Research packet

Complete this phase before writing headlines or laying out the page.

### 7.1 Website, competitor, conversion, and AI-search analysis
Run `ToAnalyzeExistingWebsiteForImprovementsSkill` once for the verified official website. Use its validated output and support artifacts.

#### Identity and trust
Determine whether name, address, phone, hours, ownership, and service area are clear. Investigate conflicting organization names, affiliate data, schema, metadata, social previews, sitemaps, locations, or directories. Distinguish random identity error from shared-vendor/template, affiliate, sister-store, or historical relationships. Do not sensationalize nuance.

#### Patient and provider actions
Determine whether a patient can refill, transfer, schedule, ask a question, request delivery, or begin a service; whether a provider can understand services and refer; where someone must call, hunt, wait, or repeat information; and which friction creates staff work.

#### Services and proof
Record only services observed on official or strong sources. Preserve pages/excerpts proving compounding, packaging, delivery, vaccines, testing, long-term care, adherence, medication synchronization, Medicare help, specialty, remote care, or other relevant services.

#### Competitors
Identify actual relevant independents, chains, specialty pharmacies, and service-specific competitors. Record:

```yaml
competitor:
location_or_geography:
why_relevant:
services_emphasized:
digital_or_reputation_strength:
visible_gap_or_difference:
evidence_urls: []
checked_date:
```

Never count directories, listicles, aggregators, or unrelated businesses as competitors.

#### AI Search and LLM Readiness
Use the website audit’s existing section. Record score/rubric; entity clarity; answerability of services, locations, hours, service area, and actions; schema and machine-readable identity; FAQs; contradictions; and competitor comparison. Do **not** substitute `ToSearchTheWebWithAnLLM`; generic LLM web search is the wrong tool for measuring the website’s AI Search and LLM Readiness. Do not promise AI rankings.

#### Screenshot inventory
Capture multiple candidates, not only the homepage:

```yaml
page_url:
checked_date:
what_is_visible:
why_it_matters:
possible_crop:
possible_annotation:
connection_to_candidate_ideas:
risks_or_ambiguity:
```

### 7.2 Reputation scan
Run `ToCheckPharmacyReputationSkill`. Record confirmed URLs, observed ratings/counts/recency, response behavior, praise/friction themes, NAP/hours/site inconsistencies, photos/profile completeness, and closure/relocation/ownership warnings. Summarize:

```yaml
reputation_strength:
reputation_friction:
reputation_uncertainty:
```

Use the skill’s evidence labels. Search absence is not proof of absence; one review is not an operating pattern.

### 7.3 Service and workflow signals
Combine website, reputation, CRM, and authoritative enrichment evidence:

| Signal | Evidence status | Source | Why it might matter | What remains unknown |
|---|---|---|---|---|

Look for transfer/refill, compounding, packaging, delivery, vaccines/testing, long-term care, Medicare help, chronic/remote care, forms, provider communication, intake, consent, eligibility, reminders, follow-up, and manual work implied by fragmented calls/forms. Website silence means `not observed on the website`, never operational absence.

### 7.4 Local market and care context
Use the market-estimation discipline from the current Pharmacy Growth Proposal Deck prompt without running the full deck solely for this insert.

Separate:
- **Context market:** MSA, micropolitan area, county, or city explaining regional scale.
- **Practical service area:** realistic radius, drive time, ZIP cluster, towns, rural catchment, or service-specific geography.

Gather only information useful to possible ideas: population/year; older-adult or Medicare context; prescribers/clinics; hospitals and transition-of-care sources; FQHCs; senior living; home health; employers/facilities; pharmacy competition; and travel/access characteristics.

Prefer Census/ACS, CMS, NPPES, HRSA, government, and direct organizations. Record geography, year, checked date, overlap, and assumptions.

Never use the full MSA as addressable patients, imply a relationship from proximity, turn population/providers into enrollments without a method, or create revenue math unless explicitly requested and independently validated.

### 7.5 Full FairPath capability lens
Evaluate fit across:
1. **Remote care:** remote patient monitoring, ongoing care coordination, wellness and related services when clinically, operationally, legally, and financially appropriate.
2. **Workflow automation:** referrals, intake, consent, eligibility, insurance checks, texts, reminders, routing, follow-up, documentation, and reports.
3. **Patient growth:** reputation, discovery, clearer service entry, provider/care-organization outreach, and retention.
4. **Digital front door:** website/entity/AI-search improvements when they support real patient or provider action.

Do not force all four into the pharmacy-specific idea.

### 7.6 Evidence reconciliation
Create a ledger:

```yaml
claim:
status: Verified | Observed | Calculated | Estimated | Analysis | Not verified
source:
checked_date:
exact_excerpt_or_observation:
conflicting_evidence:
allowed_customer_facing_use:
```

Resolve or preserve conflicts on identity, address, ownership, status, services, hours, affiliations, and competitors. Strong copy does not erase weak evidence.

### 7.7 Research completion gate
Fail when research merely summarizes the site; lacks competitor, AI-search, or reputation evidence; lacks practical geography; invents absence/relationships; contains untraceable claims; or begins customer copy before understanding the business.

---

## 8. Phase C — Sales reasoning
Research findings are ingredients, not automatically the sales strategy.

### 8.1 Use the deck cadence as background, not page structure
The full deck covers decision framing, credibility, audit, strengths, issues, competitors, market, remote care, economics, three-part growth plan, FairPath platform, 90-day pilot, terms, proof, and next steps. Remember this breadth. Do not reproduce it in miniature.

### 8.2 Develop at least three materially different candidate ideas

Do not ask the model for “three ideas” in one undirected step. That usually produces three versions of the same generic recommendation. Generate candidates through deliberate divergence:

#### Step 1 — Build five evidence buckets

Create short lists before ideation:

1. **People and needs:** patients, caregivers, prescribers, staff, facilities, employers, or care teams with a specific observed or locally plausible problem.
2. **Pharmacy strengths:** verified services, trust, reputation, location, delivery, compounding, packaging, clinical capability, relationships, or operational advantages.
3. **Friction:** what is difficult to discover, begin, refer, collect, check, communicate, remember, document, or follow up.
4. **Local channels:** verified nearby care settings, population patterns, provider types, employers, facilities, competitive gaps, or access conditions. Proximity is context, not a relationship.
5. **FairPath levers:** remote care, patient enrollment, intake, consent, eligibility, insurance checks, communication, reminders, reporting, reputation, discovery, provider outreach, and process automation.

Every candidate must draw from at least four buckets: a person/need, a pharmacy strength, a missing connection or friction, and a FairPath lever. Local context should be added when it is evidentially useful.

#### Step 2 — Force candidates from different growth families

Generate at least one candidate from three different families. Do not use the same family three times:

- **Serve patients differently:** remote care, chronic-care support, post-discharge support, adherence, delivery, or another service pathway.
- **Remove work from the pharmacy:** referral intake, forms, consent, insurance checks, messages, reminders, documentation, or follow-up.
- **Bring in or retain more patients:** reputation, local discovery, provider access, service visibility, reactivation, or retention.
- **Connect an existing specialty to a local need:** compounding, packaging, long-term care, vaccines/testing, Medicare help, employer/facility access, or another verified specialty.

The families may overlap in outcomes, but each candidate must start from a different primary problem and operating pathway.

#### Step 3 — Write the causal chain

For each candidate, complete this chain without marketing language:

`A specific person has a specific problem → this pharmacy already has a relevant strength → one connection is missing or difficult → FairPath performs concrete work → the person and pharmacy receive concrete outcomes.`

If any link is unsupported, vague, or interchangeable with another pharmacy, weaken the claim, gather more evidence, or reject the candidate.

#### Step 4 — Add disconfirming evidence

Actively look for reasons each idea may be wrong: the service may not exist operationally, staff capacity may be unknown, provider participation may be absent, another channel may already solve the problem, public evidence may be stale, or economics may not fit. A candidate without counterevidence review is incomplete.

#### Step 5 — Design the direct-mail visual before scoring

State how the owner would understand each candidate in five seconds: the headline concept, screenshot/crop, simple flow, and one outcome. Reject ideas that require a dense explanation or cannot use meaningful pharmacy-specific visual proof.

#### Step 6 — Record each candidate consistently

Use:

```yaml
candidate_name: Internal plain label
human_problem: Who is struggling and with what?
pharmacy_asset: What does this pharmacy already do well?
local_need_or_channel: What verified condition makes it relevant?
missing_connection: Why is full value not reaching people today?
fairpath_role: What would FairPath actually do?
patient_outcome:
staff_outcome:
business_outcome:
website_or_reputation_evidence:
market_evidence:
counterevidence:
unknowns:
first_low_risk_step:
visual_story:
```

#### Step 7 — Run the diversity test

Compare the candidates pairwise. They fail diversity when they share the same primary person, problem, FairPath action, and outcome with only different wording. Replace the weakest duplicate with a candidate from an unused family.

#### Step 8 — Advance only defensible candidates

A candidate advances to scoring only when:

- all five causal-chain links are present;
- the pharmacy strength has evidence;
- the human need is specific;
- FairPath's role names actual work;
- no unverified relationship is implied;
- at least one meaningful visual is available;
- the idea could not be generated merely by replacing the pharmacy name in a generic sentence.

Possible topics include compounding access, post-discharge support, adherence packaging/delivery, remote care, provider referral intake, reputation-led growth, long-term-care workflow, vaccine/testing/employer access, staff-work reduction, or service discovery. These are prompts for divergence, not a menu to force onto every pharmacy.

### 8.3 Candidate scoring and judgment
Score 0–5, then use judgment rather than selecting mechanically:

| Criterion | Question |
|---|---|
| Human importance | Does it help a recognizable patient, caregiver, provider, or employee? |
| Pharmacy fit | Is it grounded in observed strengths and situation? |
| Evidence | Is it supported by current sources? |
| Business significance | Could it affect prescriptions, patients, staff time, cost, or income? |
| FairPath fit | Can FairPath credibly help? |
| Differentiation | Is it more than generic marketing or website advice? |
| Visual clarity | Can it be shown simply? |
| Direct-mail curiosity | Does it reveal value without explaining everything? |
| Low-friction next step | Is the first action credible? |
| Risk | Are assumptions bounded and claims responsible? Reverse score. |

Explain why the winner creates the strongest owner-facing story and why runners-up lost.

### 8.4 Research-issue-versus-sale check
Ask:
- Is this merely an audit finding?
- Does fixing it change a patient or business outcome?
- Is the website evidence, or have we made website repair the product?
- Are we overstating technical identity problems without affiliate/ownership context?
- Does the idea account for remote care, automation, reputation, patient growth, and provider access where relevant?

A website issue leads only when its human consequence is central and material.

### 8.5 Choose one opening idea
It must combine a real pharmacy capability, real person/local need, missing or difficult connection, credible FairPath role, and understandable outcome.

Private reasoning sentence:

> “[Person] needs [help]. [Pharmacy] already provides [capability]. FairPath could make it easier to [begin/connect/follow up] by [specific role], so the pharmacy can [outcome].”

Do not show this formula on the page; translate it naturally.

### 8.6 Reject weak ideas
Reject when it could go unchanged to 20 pharmacies; says only improve website/SEO/reviews/social; lists services without a connection; presents population as patients; depends on unverified relationships; promises remote-care fit/economics; uses decorative screenshots; requires excessive caveats; or interests consultants more than owners.

Also reject a generic “follow-up lane,” “clearer workflow,” or “organize patient touchpoints” idea when the evidence supports a more specific service-line mechanism. Before accepting the winner, name the exact service, exact person/source, and exact starting event. Prefer “home-health intake after a discharge,” “medication-packaging enrollment for caregivers,” “vaccine follow-up for local employers,” or another evidence-backed mechanism over a broad refill/med-sync/vaccine list. If two different pharmacies could use the same headline and three steps after only changing the name and service list, the idea fails differentiation and must be regenerated.

Run a service-line specificity gate on the winner:
1. `Specific service line` — one observed service or tightly related service family, not the pharmacy's entire menu.
2. `Specific person or source` — such as caregiver, discharge team, nearby clinic, employer, older adult, or new patient.
3. `Specific trigger` — the real moment that begins the flow, such as discharge, new packaging need, vaccine season, transfer request, or home-equipment order.
4. `Specific FairPath job` — the concrete intake, consent, scheduling, reminder, documentation, reputation, or provider-handoff work FairPath would perform.
5. `Specific outcome` — what becomes easier or more valuable for that pharmacy and person.

All five must be explicit in the private strategy record. At least four must be understandable from the customer-facing upper half without relying on the generic FairPath outcome cards below it.

If none passes, record `No strong one-page idea yet` and research further. Never manufacture insight.

---

## 9. Phase D — Human copy system

### 9.1 Audience
Write to an independent pharmacy owner who is busy, skeptical, protective of staff, and interested in serving patients while sustaining the business. Assume no interest in marketing jargon or platform architecture.

### 9.2 Translation rule
Every internal concept must become a person, action, and result.

| Internal language | Human translation |
|---|---|
| referral workflow | an easier way for a doctor to send a patient |
| intake automation | forms and details collected without staff chasing them |
| eligibility | checking whether the patient and service fit |
| care coordination | helping the patient stay on track between visits |
| reputation strategy | helping more local people trust and choose the pharmacy |
| digital front door | making it easy to understand services and get started |
| recurring revenue | additional monthly income |
| provider channel | nearby doctors and care teams |
| operational efficiency | less repetitive work for staff |

Do not merely replace one jargon word while preserving an internal-memo sentence.

### 9.3 Forbidden customer-facing language
Do not use in page copy, headings, filenames, metadata, or captions:

- hypothesis, hypotheses, hypothesize;
- validate or validation as sales language;
- opportunity ingredients;
- growth mechanism;
- qualified new prescriptions;
- natural referral opportunity;
- recurring revenue line;
- local care map;
- measurable cadence;
- unlock growth;
- digital transformation;
- patient journey;
- start-here action;
- enhance your online presence;
- worth a conversation;
- execution, routing, or service mix when a normal phrase works.

Avoid unexplained RPM, CCM, AWV, EHR, SMS, MedSync, NAP, SEO, schema, or LLM. Internal artifacts may use precise technical terms; the recipient page must translate them.

### 9.4 Preferred language
Prefer:
- A patient needs extra help.
- Getting started should be easy.
- Your team takes it from there.
- Give your staff time back.
- Help more people find you.
- Care for patients beyond the counter.
- More monthly income, with less paperwork.
- You already do the hard part.
- Could this work for [Pharmacy]?

### 9.5 Tone
Sound observant, useful, respectful, direct, and grounded. Do not flatter excessively, shame the owner, sound creepy, diagnose operations from afar, or imply staff incompetence. Say “we noticed,” “your site shows,” or “one idea is” rather than presenting assumptions as fact.

### 9.6 Headline construction
The headline should name a human/business outcome or an intriguing specific connection—not the audit category or FairPath product.

Good patterns:
- Help more [local people] get [specific help] from [Pharmacy].
- Make it easier for [person/source] to connect patients with [service].
- [Pharmacy] already does the hard part. What if getting started were easier?
- Could [specific existing service] help more [specific local people]?

Bad patterns:
- Your digital growth opportunity.
- Unlock AI-powered pharmacy transformation.
- A validated omnichannel hypothesis.
- Improve your online presence.
- We found 17 website issues.

Headline test: Cover the pharmacy name. If the headline still fits nearly every pharmacy, rewrite it.

### 9.7 Opening paragraph
Use 45–75 words. Include:
1. a person/problem;
2. a verified pharmacy capability;
3. the simpler connection FairPath could help create;
4. a benefit to patients or staff.

Do not list every service. Use only evidence needed for the chosen idea.

### 9.8 Three-step explanation
Use three human steps, each with a short heading and one short explanatory line:
1. someone needs help;
2. getting started becomes easier;
3. the pharmacy provides care and FairPath helps with follow-up/admin.

The three steps are a story, not a software architecture diagram.

### 9.9 Screenshot caption
The caption must explain why the screenshot matters in one sentence. Examples:
- “You already offer the services these patients need; the opportunity is making the handoff easier.”
- “This is a strong service, but a new patient has no simple way to begin online.”
- “Patients clearly value the team; making that trust easier to discover could bring more local people through the door.”

Never caption it merely “Current website.”

---

## 10. Phase E — One-page content architecture

Use one US Letter portrait page. Treat the following as a hierarchy, not a rigid set of equal boxes.

### 10.1 Upper half: one idea for this pharmacy
The upper half answers:

- Why is this about our pharmacy?
- Who needs help?
- What do we already do well?
- What could become easier?
- Why should we care?

Recommended components:

1. **Brand and recipient cue** — real FairPath logo; “Prepared for [Pharmacy]” may be used sparingly.
2. **Specific headline** — usually 8–18 words.
3. **Short opening** — 45–75 words.
4. **Simple human flow** — three steps, not technical architecture.
5. **Official-site screenshot** — recognizable and tied to the idea.
6. **Plain caption or proof sentence** — explain what the screenshot proves.

The screenshot can share space with the flow. Do not allow either to become tiny. If both cannot remain useful, simplify copy and visual structure rather than shrinking everything.

### 10.2 Lower half: outcomes FairPath helps create
Make this half outcome-based. Use three understandable pillars, tailored to the pharmacy:

#### Outcome 1 — Care for patients beyond the counter
Explain appropriate remote-care services in plain language. Focus on helping eligible patients manage ongoing needs between visits, with FairPath supporting sign-up, communication, tracking, coordination, and reports.

Do not promise that every pharmacy, patient, payer, or provider qualifies. Do not make acronyms the heading.

#### Outcome 2 — Give the pharmacy team time back
Explain concrete repetitive work FairPath can reduce: forms, referrals, new-patient details, consent, insurance checks, text messages, reminders, follow-up, documentation, or reports.

Avoid vague “AI automation” claims. Name the work being reduced.

#### Outcome 3 — Help more people find and use the pharmacy
Explain patient growth through reputation, local discovery, provider relationships, clear service entry, outreach, and retention. Connect this pillar to this pharmacy’s strengths where possible.

Do not write generic “get more customers” copy without explaining a credible path.

### 10.3 Outcome-proof statement
A short proof band may state:

> Some pharmacies working with FairPath are making approximately $10,000–$20,000 per month through applicable care programs while using automation to reduce administrative work.

Use this only when currently approved and supportable. Requirements:

- say `some pharmacies`, not `pharmacies like yours` unless similarity is established;
- do not project this result for the prospect;
- do not call it guaranteed, expected, typical, or average without evidence;
- add a concise qualification such as `Every pharmacy is different, and results depend on the patients served and services provided.`;
- preserve fuller substantiation internally.

If the claim is not approved or supportable, omit it rather than weakening it with vague wording.

### 10.4 Call to action
The CTA must be real and visible. It should answer:

- what should the owner do?
- where should they go or whom should they contact?
- what will they receive or see?
- is there any commitment?

Acceptable routes: tested personalized URL, valid QR, phone, email, reply instruction, or approved general FairPath URL. Example:

> Could this work for [Pharmacy]? See how FairPath helps independent pharmacies care for more patients with less manual work at FairPath.ai.

Never use a fake button, placeholder QR, “response route required,” or other internal production text in a customer-facing page. If a real route is unavailable, label the whole artifact `INTERNAL PROOF — NOT FOR MAILING`.

### 10.5 Footer
Use only the minimum truthful qualification and source cue required. Keep detailed evidence in internal artifacts. The footer must remain readable. Do not turn it into a wall of legal text.

---

## 11. Phase F — Screenshot and visual storytelling

### 11.1 Required screenshot source
Use a current screenshot from the verified official pharmacy website. Record page URL, capture date, viewport, and crop provenance.

### 11.2 Screenshot selection test
Choose the screenshot that best supports the selected idea—not automatically the homepage. Prefer:

- a service page showing the capability;
- a visible promise or trust signal;
- a form or missing entry path connected to the idea;
- reputation proof when official-site content supports it;
- a recognizable header plus the relevant section.

Reject screenshots that are error pages, cookie overlays, unreadable full pages, generic stock photos, unrelated hero banners, or too small to recognize.

### 11.3 Annotation
Annotate only to help the owner see the point quickly. Useful annotation can:

- circle a service already offered;
- point to the absence of a clear next step;
- highlight conflicting identity text;
- compare a relevant competitor behavior;
- explain a broken or confusing path.

Do not cover the screenshot with criticism. Use one or two restrained callouts. When the screenshot proves only “the pharmacy offers this service,” a caption may be enough.

### 11.4 Visual hierarchy
At arm’s length, a reader should notice in order:

1. the pharmacy-specific headline;
2. the simple idea/flow;
3. the pharmacy screenshot or proof;
4. the three outcomes;
5. the result example, if used;
6. the response route.

Avoid dashboard grids, dozens of icons, tiny scorecards, decorative charts, and equal-weight boxes.

---

## 12. Phase G — Brand and print design

Use the current FairPath/Intelligence Factory logo. If it is unavailable locally, retrieve it from the official FairPath website and retain provenance.

Prototype brand direction:

- purple `#8000FF`;
- orange `#FF7000`;
- charcoal `#484848`;
- white background and generous whitespace;
- warm, direct, modern appearance;
- orange used for decisive accents, not everywhere;
- logo visible but secondary to the owner’s story.

Print requirements:

- exactly one US Letter portrait page;
- no browser print headers/footers;
- adequate physical margins;
- no clipping, overlap, hidden content, or broken image;
- support text normally at least 9 pt equivalent;
- strong contrast;
- restrained paragraph length;
- real website screenshot large enough to recognize;
- final PDF exactly one page;
- full-page PNG that represents the exact PDF/HTML revision.

A polished page should feel prepared for one owner—not like an audit export, generic Canva flyer, consulting slide, or AI report.

---

## 13. Phase H — Internal evidence package

Create a claim table:

| Page claim | Exact page location | Evidence label | Source | Checked date | Supporting excerpt/observation | Caveat |
|---|---|---|---|---|---|---|

Also retain:

- identity and mail gate;
- full research synthesis;
- competitor table;
- reputation summary;
- market ledger;
- all candidate ideas and scores;
- selected-idea rationale;
- screenshot provenance;
- FairPath financial-claim approval/evidence;
- final CTA destination test;
- visual/OCR validation results.

No important number or factual assertion should exist only inside the artwork.

---

## 14. Phase I — Canonical artifacts and version control

Use one stable basename:

`<leadid>-<pharmacy-slug>-one-page-growth-insert`

Required final artifacts:

1. `<basename>-research.md`
2. `<basename>-evidence.json`
3. `<basename>-strategy.json`
4. `<basename>.html`
5. `<basename>.pdf`
6. `<basename>-preview.png`
7. `<basename>-validation.json`

During iteration, use a separate `working` or `archive` area. Before delivery:

- archive or delete every superseded HTML, PDF, and preview;
- ensure the deliverable folder contains one canonical HTML/PDF/preview set;
- never leave a bad earlier image next to the final;
- do not use forbidden terms in filenames;
- record hashes or timestamps linking HTML, PDF, and preview when practical;
- deliver links only to the canonical set.

The validation target is the exact linked preview. A different source file, newer render, or similarly named image does not count.

---

## 15. Phase J — Validation protocol

Run every gate against the canonical artifacts.

### 15.1 Mailing gate
Pass only when:

- pharmacy is operating at the verified location;
- current CRM does not classify it as customer/FairPath account or truly defunct;
- duplicate/cross-mail checks pass;
- active sales-contact constraints are respected;
- one physical business is not receiving duplicate pieces.

### 15.2 Evidence gate
Pass only when:

- identity, site, address, and status are resolved;
- every consequential page claim is traceable;
- proximity is not called a relationship;
- web absence is not called operational absence;
- affiliate/template facts are described accurately;
- broad market counts are contextual, not addressable;
- financial examples are approved and qualified.

### 15.3 Customization gate
Ask:

1. What did we discover beyond the pharmacy’s own service list?
2. Why does the idea fit this pharmacy and local setting?
3. Which sentence, visual, and screenshot would have to change for another pharmacy?
4. Could the main idea be sent unchanged to 20 leads?
5. Does the page reveal value or merely prove research was performed?

Fail when customization is only name, city, colors, service list, or homepage screenshot.

### 15.4 Customer-appropriate language and recipient-safety gate

This is a major release gate, not a keyword check. Passing requires both appropriate meaning and verification of the exact rendered artifact.

#### Pass 1 — Mechanical search across the complete package

Search:

- HTML visible text;
- title, metadata, alt text, and comments that might render;
- filenames and folder names;
- PDF text where extractable;
- screenshot annotations and captions;
- exact final PNG OCR.

Check the forbidden-language list in Phase D plus unexplained clinical, marketing, technology, and process acronyms. Search variants, plurals, and related forms rather than one exact token. Do not approve based only on source search; the exact visible preview controls.

#### Pass 2 — Internal-language removal

Flag wording that exposes how FairPath analyzed the lead rather than what the owner should understand. Remove or translate:

- analyst labels, scoring language, evidence classifications, and research-stage terminology;
- consultant phrases about strategy, mechanisms, opportunities, validation, execution, funnels, channels, or transformation;
- software architecture terms about routing, workflows, platforms, integrations, automation, or AI when a normal action can be named;
- healthcare billing/program acronyms that are not necessary for the owner-facing story;
- production notes, placeholders, artifact names, validation labels, or internal caveats.

The page may be analytically sophisticated internally while sounding simple externally.

#### Pass 3 — Customer respect and appropriateness

Review every statement for tone and relationship safety:

- Do not shame the owner, criticize staff, or imply incompetence.
- Do not tell the pharmacy what it “must” do based on public research alone.
- Do not diagnose operational failure from a website observation.
- Do not imply surveillance, hidden knowledge, or personal familiarity.
- Do not mention CRM status, prior contact, ownership guesses, inferred revenue, or internal lead scoring.
- Do not present an affiliate/vendor metadata issue as deception or random identity confusion when context is nuanced.
- Do not overstate a bad review, weak listing, or missing web page.
- Do not claim a provider, hospital, employer, or facility relationship from proximity.
- Do not use fear, embarrassment, or alarm as the attention mechanism.
- Do not talk down to an independent pharmacy owner.

Use respectful framing: `we noticed`, `your site shows`, `one idea is`, `this may make it easier`, and `could this work for [Pharmacy]?`

#### Pass 4 — Person, action, outcome rewrite

Evaluate every customer-facing sentence:

1. Who is the person?
2. What are they trying to do?
3. What is difficult today?
4. What concrete work could FairPath perform?
5. What improves for the patient, staff, or pharmacy?

If a sentence cannot answer at least one of these, it is likely abstract or unnecessary. Rewrite whole sentences rather than swapping one jargon word for another.

#### Pass 5 — Read-aloud owner test

Read the complete visible page as if speaking to the owner in person. Flag any phrase that would sound unnatural, inflated, invasive, legalistic, overtechnical, or patronizing. Ask:

- Would a pharmacy owner say this aloud?
- Could a staff member explain it to another person?
- Is there a shorter ordinary phrase?
- Does it sound like an internal memo, agency pitch, software brochure, or AI report?
- Is the strongest statement still truthful without hidden context?

#### Pass 6 — Exact-image OCR and visual text review

OCR the exact PNG that will be delivered. Count every prohibited term and inspect headings, small labels, captions, screenshot callouts, proof band, CTA, and footer. Confirm the image belongs to the canonical HTML/PDF revision. Zero prohibited-token count is necessary but not sufficient; the read-aloud and respect tests must also pass.

#### Required validation record

Save:

```json
{
  "AuthoredTextSearchIssues": [],
  "ExactPreviewOcrIssues": [],
  "UnexplainedAcronyms": [],
  "InternalLanguageIssues": [],
  "CustomerRespectIssues": [],
  "PersonActionOutcomeIssues": [],
  "ReadAloudIssues": [],
  "ExactPreviewMatchesCanonicalRevision": true,
  "CustomerAppropriateLanguageVerdict": "PASS"
}
```

Any nonempty issue array or mismatched preview fails release and requires copy revision plus a fresh render and fresh OCR.

### 15.5 Screenshot gate
Pass only when:

- source is the correct official pharmacy site;
- capture is current and provenance recorded;
- crop is recognizable;
- screenshot supports the chosen idea;
- caption explains why it matters;
- text is not unreadably tiny;
- no obstruction, error, or fabricated interface appears.

### 15.6 Strategic gate
Pass only when:

- the page contains one coherent idea;
- the idea helps a recognizable person;
- FairPath’s role is concrete;
- the website is evidence rather than the whole product unless justified;
- the idea goes beyond generic website/marketing advice;
- the lower half connects to FairPath outcomes without overwhelming the upper story;
- the response offer is useful and real.

### 15.7 Visual/prepress gate
Inspect the exact PNG at full page and zoomed detail. Verify:

- one US Letter page;
- no clipping, overlap, malformed characters, hidden footer, or broken images;
- body/support text readable in print;
- clear hierarchy;
- logo and colors correct;
- top half visibly specific to the pharmacy;
- lower outcomes quickly understandable;
- CTA route visible;
- revenue qualifier legible;
- no internal notes.

### 15.8 Adversarial recipient review
Ask a model to role-play a skeptical pharmacy owner, not merely a design QA reviewer:

- What do I learn that I did not already know?
- Does this understand my pharmacy or just repeat my site?
- Is the idea useful to patients or staff?
- Is any claim exaggerated or creepy?
- Is the screenshot meaningful?
- Can I understand it in 20 seconds?
- Do I know what FairPath could do?
- Do I know what to do next?
- Would I keep this page or discard it?

A technically correct but uninteresting page fails.

### 15.9 Exact-artifact identity gate
Before delivery:

1. Enumerate final folder contents.
2. Confirm only one canonical preview/PDF/HTML set is active.
3. OCR that exact preview.
4. Confirm PDF page count is one.
5. Confirm final links point to those files.
6. Record zero unresolved validation issues.

This gate prevents validation of one revision while a different or superseded artifact is delivered.

---

## Failure diagnosis and remediation

When a draft fails, diagnose the category rather than making cosmetic edits.

### Failure: “It just summarizes our website”
Remedy: Return to candidate generation. Combine an existing service with a local person/need and an easier access or follow-up path. Remove service-list copy.

### Failure: screenshot is decorative or unreadable
Remedy: Choose a different page/crop; enlarge it; annotate one meaningful detail; rewrite caption to explain consequence. Do not simply increase screenshot size if it still proves nothing.

### Failure: idea is generic
Remedy: Name the actual service, patient type, local context, workflow problem, and FairPath role. Run the 20-pharmacy substitution test.

### Failure: website issue dominates
Remedy: Ask what human/business outcome the issue affects and whether remote care, automation, reputation, or patient growth offers a stronger lead. Demote technical evidence when appropriate.

### Failure: page feels like a deck
Remedy: Remove sections, labels, scores, and mini-analysis. Keep one headline, one story, one proof visual, three outcomes, and one CTA.

### Failure: language sounds like consulting
Remedy: Identify the person, action, and result. Rewrite the sentence from scratch. Do not merely replace “hypothesis” with “opportunity.”

### Failure: too much small text
Remedy: Cut concepts before shrinking type. Keep evidence internally. Combine or remove boxes. Prioritize the one idea and outcomes.

### Failure: financial claim feels promotional
Remedy: Verify approval/evidence, use “some pharmacies,” qualify clearly, or remove the claim.

### Failure: CTA is fake or vague
Remedy: Add a tested URL, QR, phone, email, or reply instruction and state what happens next. Otherwise mark the full piece internal-only.

### Failure: a superseded draft is selected for delivery
Remedy: Stop. Enumerate artifacts, identify the exact delivery image, OCR it, archive/delete obsolete versions, regenerate canonical files, and validate the exact final links.

---

## Good-versus-bad examples

### Bad: regurgitation
> [Pharmacy] offers compounding, packaging, delivery, and medication synchronization. You should improve your online presence to attract more customers.

Why bad: The owner already knows the services; the advice is generic; no person or mechanism exists.

### Better: human-specific opening
> People leaving the hospital or managing several medicines often need more help than a typical pharmacy can provide. [Pharmacy] already offers [verified relevant services]. One idea is to make it easier for nearby care teams to connect those patients with the pharmacy—and let FairPath handle much of the information gathering and follow-up.

Why better: Names a person/problem, existing capability, connection, FairPath role, and staff benefit without claiming a current provider relationship.

### Bad: technical audit lead
> Your schema contains affiliate contamination that reduces LLM entity confidence.

### Better: translated supporting proof
> Search systems receive mixed signals about which pharmacy and location the website represents, making it harder to give patients a clear answer about [Pharmacy] services.

Use even the better sentence only if it supports a meaningful patient-growth story.

### Bad: automation claim
> Our AI platform optimizes omnichannel intake and routing.

### Better: human outcome
> FairPath can collect forms, check details, send reminders, and follow up—so your staff spend less time chasing information.

### Bad: screenshot use
A tiny full homepage labeled `Current website`.

### Better: screenshot use
A recognizable crop of the packaging/delivery service with the caption: `You already provide the help these patients need. The opportunity is making it easier for a care team to connect them with you.`

### Bad: result claim
> Add $20,000 in guaranteed monthly revenue.

### Better: qualified proof
> Some pharmacies working with FairPath are making $10,000–$20,000 per month through applicable care programs. Every pharmacy is different, and results depend on the patients served and services provided.

---

## Required output package

For each pharmacy, produce:

### Research Markdown
Sections:
1. identity and mailing eligibility;
2. website/digital discovery;
3. AI-search readiness;
4. competitors;
5. reputation;
6. service/workflow signals;
7. context market and practical service area;
8. evidence conflicts;
9. candidate ideas and scores;
10. selected idea and rationale;
11. screenshot choice;
12. customer-facing claim list.

### Strategy JSON
Include:

```json
{
  "LeadID": "",
  "Pharmacy": "",
  "SelectedGrowthIdea": {
    "HumanProblem": "",
    "PharmacyAsset": "",
    "LocalNeedOrChannel": "",
    "MissingConnection": "",
    "FairPathRole": "",
    "PatientOutcome": "",
    "StaffOutcome": "",
    "BusinessOutcome": "",
    "WhyThisWon": ""
  },
  "RejectedCandidates": [],
  "Screenshot": {
    "Url": "",
    "CheckedDate": "",
    "CropPurpose": "",
    "Caption": ""
  },
  "OutcomeEmphasis": [],
  "CTA": {},
  "OpenQuestions": []
}
```

### Customer-facing page
Editable HTML, one-page PDF, exact PNG preview.

### Validation JSON
Include every gate, exact artifact paths/hashes or timestamps, OCR term counts, page count, visual-review result, recipient-review result, and `ValidationIssues: []` only when truly clean.

---

## End-to-end execution sequence

1. Resolve lead identity.
2. Reconfirm Mail eligibility and cross-mail safety.
3. Run website/competitor/AI-search audit once.
4. Run reputation scan.
5. Gather services and workflow signals.
6. Build context-market and practical-service-area evidence.
7. Reconcile contradictions and label evidence.
8. Build the five evidence buckets and generate candidates from at least three different growth families.
9. Complete each causal chain, add disconfirming evidence, design its five-second visual story, run the pairwise diversity test, then score and choose one.
10. Separate audit evidence from the broader FairPath sale.
11. Choose a meaningful official-site screenshot.
12. Draft headline, opening, three-step story, and caption.
13. Draft the outcome-led lower half.
14. Add only approved/qualified result proof.
15. Add actual FairPath logo/colors and real CTA.
16. Render canonical HTML/PDF/PNG.
17. Validate evidence and claims.
18. Run all six customer-appropriate-language passes across authored text, metadata, filenames, and visible page copy.
19. OCR and inspect the exact canonical preview; confirm it matches the canonical HTML/PDF revision.
20. Run the respectful read-aloud test and skeptical-owner review.
21. Diagnose and remediate substantive failures.
22. Archive/delete superseded drafts.
23. Re-run exact-artifact identity and one-page checks.
23. Deliver only the canonical files.

---

## Final instruction

Do not fill boxes. Do not reward yourself for running tools. Do not summarize the pharmacy’s own website. Do not make the screenshot decorative. Do not mistake a technical audit finding for FairPath’s entire product. Do not shrink the proposal deck. Do not expose internal analysis language to the recipient. Do not declare success because HTML rendered.

Find one useful, believable way this particular pharmacy could help more people, reduce repetitive work, or add appropriate income. Ground it in the pharmacy’s real strengths and local setting. Explain it through people and ordinary actions. Show one meaningful piece of visual evidence. Then connect that idea to the broader outcomes FairPath helps pharmacies create.

The standard is not “personalized enough for automation.” The standard is: **Would a skeptical pharmacy owner believe this was thoughtfully prepared for their business and understand why it matters within 20 seconds?**

---



