# Validate Pharmacy Growth Proposal Deck

Independently validate the final, post-enhancement pharmacy growth proposal and its market/economics calculation ledger. Do not accept a completion narrative or pre-enhancement draft as evidence.

## Prospect eligibility and fit

Do not fail solely because the prospect is not an independent pharmacy. This workflow may be used for a pharmacy, pharmacy operator, pharmaceutical company, healthcare organization, or another prospect when the user explicitly authorized the pharmacy/FairPath growth framework.

Fail if the proposal misstates the verified business type, calls a non-pharmacy an independent pharmacy, or carries unsupported retail-pharmacy, local-owner, patient-action, market, or remote-care assumptions into the deck. Pass a non-pharmacy proposal when the research packet documents the authorization and verified prospect type, explains which framework elements apply, removes or replaces inapplicable assumptions, and supports the remaining website-growth, healthcare-growth, pharmacy-operations, patient-support, provider-partnership, or remote-care story with evidence.

## Required artifacts

Fail unless all of the following exist in the reported session artifact folder:

- Final proposal HTML.
- `proposal-research-packet.md`.
- `market-economics-ledger.json`.
- `competitor-comparison-ledger.md` when the deck includes competitor/profile comparison or when a functioning prospect website was found.
- Rendered visual QA contact sheet and metrics/report for the final delivered deck.
- All referenced images and fonts.
- The expected reference-template asset structure.

Read the final HTML, proposal research packet, market ledger, competitor ledger when applicable, evidence summary, and rendered QA artifacts directly. Validate the exact file that will be delivered.

## Website-resolution and audit-feeder branch checks

Fail unless `proposal-research-packet.md` documents:

- Lead identity evidence or a clear note that CRM data was unavailable.
- CRM/enrichment website field status when CRM data exists.
- Candidate websites and public profiles checked.
- Final website status branch: `confirmed official website`, `likely but not confirmed`, `no official website found`, or `public profiles only`.
- Audit feeder status: `ran`, `reused`, `skipped - no confirmed official website`, or `failed - degraded evidence used`.
- Current-site or public-profile screenshot/source evidence used in the deck.
- Competitor evidence, AI/LLM-answer evidence, selected visuals, and slide-use decisions.

Confirmed official website branch:
- Fail unless the research packet names the confirmed official URL and shows why it matches the pharmacy identity.
- Fail unless `ToAnalyzeExistingWebsiteForImprovementsSkill` was run or a matching existing website-audit feeder artifact was reused.
- If the feeder failed, fail unless the packet records the failure, retry/fallback decision, and every visible website claim is supported by directly verifiable evidence.
- Fail if the deck uses website findings that are not traceable to the feeder artifact, research packet, evidence summary, or captured screenshots.

No confirmed official website branch:
- Fail if `ToAnalyzeExistingWebsiteForImprovementsSkill` was run against an unconfirmed candidate, directory listing, or public profile.
- Fail if the deck contains fabricated website scores, crawl findings, architecture claims, current-site screenshots, rebuild findings, or wording that implies an official website was audited.
- Pass only if the deck clearly uses verified public-profile/social/directory/CRM evidence to explain the owned-searchable-home opportunity.

Likely-but-not-confirmed branch:
- Fail if the likely site is treated as confirmed.
- The candidate may be listed only as unconfirmed evidence with an explicit caveat.

## Deck and asset checks

Fail if:

- The deck does not contain exactly 16 slides or slide numbering is inconsistent.
- The client name/title is incorrect.
- Any `<img>` or `@font-face` reference is unresolved.
- The required reference-template design system, navigation, fixed slide canvas, or print styling is missing or materially broken.
- The packaged template contract files (`IMPLEMENTATION_NOTES.md` and `slide-content-contract.json`) were not copied/read when the deck was assembled from the reference template.
- A financial example lacks a short, plain-language statement that it is not a promise, or remote-care copy implies guaranteed participation, reimbursement, or results.
- The final deck contains internal/process language such as LeadID on a customer-facing slide, follow-up timestamp, tool/workflow names, `likely PIC`, `No new mockup`, or `Shortcoming visual`.
- The deck includes generated redesign/mockup screenshots unless explicitly requested or documented as passing rendered visual QA and stronger than current-site evidence.
- The deck mentions a website audit, competitor audit, technical score, current-site screenshot, AI/LLM ranking, or website rebuild finding that is not supported by the research packet, feeder artifact, evidence summary, or captured evidence.

## Market-sizing checks

Fail unless the ledger and evidence summary contain:

- Geographic unit(s), source, and year.
- Service-area population.
- Medicare percentage or range and its stated basis.
- Estimated Medicare beneficiary count or range.
- Physician-density estimate or range and its stated basis.
- Estimated physician count or range.
- Estimated physician-office/clinic count or range and its stated basis.

Directional estimates are allowed and expected when exact local values are unavailable, but the ledger and evidence summary must label them **Estimated** and show enough basis or arithmetic to be understood. The deck may use a shorter conversational label if it remains accurate and does not imply verification. Do not require exact first-party values when an order-of-magnitude estimate can be calculated.

## Economics continuity checks

Fail unless the ledger contains low, base, and high scenarios with all of:

- Assumed market-capture rate.
- Resulting enrolled-patient count.
- Illustrative annual gross billing per enrolled patient.
- Illustrative annual gross-billing total.

The ledger must explicitly communicate this equation:

`estimated Medicare market x assumed capture rate x illustrative annual gross billing per enrolled patient = illustrative annual gross billing`

Independently recompute each scenario from ledger values. Allow ordinary display rounding, but fail if patient counts or billing totals materially disagree with the stated inputs. Compare the final slide's patient counts, per-patient examples, and annual totals to the ledger and name every mismatch. The deck may use plain-language scenario names and does not need to display the full equation, rate table, or every assumption.

If the Medicare market is a range, verify that the selected low/base/high basis is explicit and that the resulting patient counts are arithmetically plausible within that range.

## Contradiction and evidence checks

Fail if the final deck contains `TBD`, `cannot estimate`, `no dollar estimates can be provided`, `unable to estimate`, or equivalent refusal language for market or gross-billing values when the ledger contains computable directional inputs.

Fail if:

- A later slide contradicts an earlier market estimate.
- Market estimates are relabeled as Verified without primary evidence.
- Illustrative gross billing is presented as net revenue, profit, guaranteed reimbursement, or a forecast.
- The ledger or evidence summary omits material caveats about payer rules, rates, program mix, billable months, staffing, devices, denials, collections, compliance, or partner economics.
- A native readability/flow pass or any editing step removed or changed required figures, arithmetic, labels, or caveats.

## Other proposal coverage

Fail if the deck lacks substantive, lead-specific coverage of the applicable items:

- Website opportunity and observed strengths. Do not require audit findings or a technical score when no confirmed official website exists.
- Sourced competitive/service-gap context.
- AI/LLM-answer readiness as patient-answer clarity when evidence exists: hours, refills, transfers, vaccines, delivery, services, location, phone, and directions. Do not require or accept AI-ranking claims unless directly captured.
- Remote-care opportunity and FairPath capabilities.
- Recommended growth plan, pilot/discovery sequence, roles, investment framing, and next step.
## Competitor comparison checks

When the prospect has a functioning website or public profile evidence is available, fail unless a `competitor-comparison-ledger.md` or equivalent evidence file exists, names checked sources, includes URLs or public identifiers, and the deck summarizes named checked examples rather than only generic categories. Claims must be limited to observable facts. The deck must include a caveat that the comparison is not a map-pack/ranking/review audit unless those facts were collected.

Fail if the competitor comparison omits practical patient-action dimensions when those can be checked: website/profile found, refill/transfer/vaccine/delivery/service actions, hours/contact/directions clarity, and patient-answer / AI-readiness clarity. The AI/LLM dimension must be framed as whether public evidence clearly answers common patient questions, not as model ranking or citation performance unless directly captured.

## Narrative, language, and visual checks

Fail if:

- The rendered slide is letterboxed, centered inside a taller preview/container, or shows material bands above or below the 1280x720 canvas instead of filling the frame edge to edge.
- Slide 9 uses an established-site screenshot that is too small to recognize/read at 1280x720, shrinks a long page with `object-fit: contain`, or fails to use a deliberate zoomed/clipped website viewport.
- A confirmed-site scored audit exists but slide 10 is not a scoring page with a prominent overall score, presentation-scale `LLM / AI-answer readiness` and `SEO / local search` rows/cards, category labels of at least 17px, score values of at least 18px, contact-sheet legibility, and the material poor content/technical/trust/conversion signals supported by the audit.
- Slide 3 is missing the remote-care-general 90-day proof-period frame, says `CCML`, makes the proof period CCM-only, uses `CCM population`/`bring CCM home`/`Asheville CCM`, omits a manageable first patient group, omits measurement/control language, or makes unsupported pricing/cancellation/no-lock-in promises.
- Slide 4 opens abruptly with `Optional path`, lacks a bridge from the proof-period/website opportunity, or presents fewer than the five core program options: RPM, CCM, AWV, RTM, and APCM. APCM and RTM must be visible with comparable weight, not buried in a footnote.
- Slide 7 exposes a separate share/capture-rate column instead of presenting patient counts directly while retaining capture assumptions in the ledger/evidence.
- The deck misclassifies the prospect or uses independent-pharmacy-owner language for a prospect not verified as an independent pharmacy.
- A pharmaceutical, healthcare, enterprise, or pharmacy-adjacent prospect is rejected solely for not being an independent pharmacy despite explicit user authorization.
- Inapplicable pharmacy-specific assumptions are retained instead of being removed or translated to the prospect's verified operating model.
- Single-location copy uses unsupported multi-location, systemwide rollout, or per-location language.
- A no-website prospect receives a fabricated website score, crawl finding, architecture claim, or rebuild narrative.
- A no-confirmed-website prospect is treated as if an official standalone website was audited.
- A confirmed-website prospect lacks a run/reused website-audit feeder artifact without an explicit feeder-failure/degraded-evidence explanation.
- Strong public social or reputation evidence is ignored instead of being used as early positive proof.
- The selected presenter/FairPath branding overwhelms the prospect story or substitutes company-brag language for lead-specific evidence.
- A meaningful website or remote-care opportunity is reduced to an afterthought when the ledger supports both paths.
- A Remote-Care-first request does not place the proof period, five programs, workflow, market, and economics on slides 3-7 before the website/current-state section on slides 8-13.
- `proposal-run-profile.json` is missing or incomplete; an omitted `PresenterMode` does not resolve to `IntelligenceFactoryDirect`; ClearSpan is used without explicit `ClearSpanPartner` selection; or presenter name, contact, logo/wordmark, footer, Slide 1, Slide 2, or Slide 16 mixes the two presenter profiles.
- In a two-path proposal, the market/opportunity-size slide appears before the remote-care proof-period, opportunity, and FairPath workflow are introduced. Market size should bridge remote-care workflow into economics.
- Slide 12 does not contain the prospect's website/AI-answer opportunity, slide 13 does not contain named sourced competitor comparison, slide 3 does not contain the remote-care-general proof period, slide 6 does not contain market/opportunity size, or slide 7 does not contain economics/growth examples.
- Visible headings use internal jargon such as `illustrative capture scenarios`, `explicit capture assumptions`, `operating motion`, `gated`, `credible comparison`, `readiness gate`, `controlled enrollment`, `evidence review`, `systemwide rollout`, or `validation workshop`.
- Repeated evidence labels, methodology notes, or long caveat blocks overwhelm the customer narrative. Detailed rigor belongs in the ledger and evidence summary.
- Static template claims, pricing, strengths, location counts, contacts, screenshots, or capabilities remain without lead-specific support.

Render and inspect all 16 slides at the fixed 1280x720 canvas. A structural HTML check is not enough. Fail if any rendered slide has clipped/off-canvas content, body/document scroll larger than 1280x720, unresolved image/font assets, unreadable screenshot crop, severe whitespace imbalance, navigation/footer collision, meaningful text below a readable minimum size, or unclear closing choice.

## Validation response

Return success only when the final deliverable and ledger pass all checks. Return exactly one fenced `json` object using schema version `general-skill-final-validation-result/v1` with:

- `status`: `passed` or `failed`.
- `summary`: concise overall validation outcome.
- `evidence`: paths and observations inspected directly.
- `checks`: each material validator check with `checkKey`, `status`, `evidence`, and `correction` when failed.
- `correctionPlan`: one item per required correction with `stepKeys` containing exact workflow step keys from the supplied step catalog, `guidance` suitable for the targeted rerun, and `reason`. Use Steps 23-25 when a correction requires reassembly, cross-slide QA, or export after an owning research/slide step changes.
- `feedbackForRetry`: complete human-readable retry guidance.
- `validatedAtUtc`: ISO-8601 UTC timestamp.
- `validationArtifactPath`: controlled absolute path to `proposal-completion-validation.json`, containing the same validation outcome and detailed evidence.

On failure, `feedbackForRetry` and `correctionPlan` must list:

- Every missing artifact or field.
- Every missing slide figure.
- Each arithmetic mismatch, including expected and displayed values.
- Each contradiction or unsupported evidence label.
- Each broken asset or structural defect.
- The exact correction required for the next attempt.
