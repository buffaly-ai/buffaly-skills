# Validate Pharmacy Growth Proposal Deck

Independently validate the final, post-enhancement pharmacy growth proposal and its market/economics calculation ledger. Do not accept a completion narrative or pre-enhancement draft as evidence.

## Required artifacts

Fail unless all of the following exist in the reported session artifact folder:

- Final proposal HTML.
- `market-economics-ledger.json`.
- All referenced images and fonts.
- The expected reference-template asset structure.

Read the final HTML and ledger directly. If Anti-Gravity/Gemini enhancement was used, validate the enhanced file that will be delivered, not the earlier draft.

## Deck and asset checks

Fail if:

- The deck does not contain exactly 16 slides or slide numbering is inconsistent.
- The client name/title is incorrect.
- Any `<img>` or `@font-face` reference is unresolved.
- The required reference-template design system, navigation, fixed slide canvas, or print styling is missing or materially broken.
- Required evidence-state labels or caveats are absent.

## Market-sizing checks

Fail unless both the ledger and final deck contain:

- Geographic unit(s), source, and year.
- Service-area population.
- Medicare percentage or range and its stated basis.
- Estimated Medicare beneficiary count or range.
- Physician-density estimate or range and its stated basis.
- Estimated physician count or range.
- Estimated physician-office/clinic count or range and its stated basis.

Directional estimates are allowed and expected when exact local values are unavailable, but they must be labeled **Estimated** and must show enough basis or arithmetic to be understood. Do not require exact first-party values when an order-of-magnitude estimate can be calculated.

## Economics continuity checks

Fail unless the ledger and final deck show low, base, and high scenarios with all of:

- Assumed market-capture rate.
- Resulting enrolled-patient count.
- Illustrative annual gross billing per enrolled patient.
- Illustrative annual gross-billing total.

The deck must visibly communicate this equation:

`estimated Medicare market × assumed capture rate × illustrative annual gross billing per enrolled patient = illustrative annual gross billing`

Independently recompute each scenario from ledger values. Allow ordinary display rounding, but fail if patient counts or billing totals materially disagree with the stated inputs. Compare final slide values to the ledger and name every mismatch.

If the Medicare market is a range, verify that the selected low/base/high basis is explicit and that the resulting patient counts are arithmetically plausible within that range.

## Contradiction and evidence checks

Fail if the final deck contains `TBD`, `cannot estimate`, `no dollar estimates can be provided`, `unable to estimate`, or equivalent refusal language for market or gross-billing values when the ledger contains computable directional inputs.

Fail if:

- A later slide contradicts an earlier market estimate.
- Market estimates are relabeled as Verified without primary evidence.
- Illustrative gross billing is presented as net revenue, profit, guaranteed reimbursement, or a forecast.
- Required caveats about payer rules, rates, program mix, billable months, staffing, devices, denials, collections, compliance, or partner economics are omitted.
- Anti-Gravity polishing removed or changed required figures, arithmetic, labels, or caveats.

## Other proposal coverage

Fail if the deck lacks substantive, lead-specific coverage of:

- Website audit findings and observed strengths.
- Competitive/service-gap context.
- Remote-care opportunity and FairPath capabilities.
- Recommended growth plan, pilot/discovery sequence, roles, investment framing, and next step.

## Validation response

Return success only when the final deliverable and ledger pass all checks. On failure, `FeedbackForRetry` must list:

- Every missing artifact or field.
- Every missing slide figure.
- Each arithmetic mismatch, including expected and displayed values.
- Each contradiction or unsupported evidence label.
- Each broken asset or structural defect.
- The exact correction required for the next attempt.