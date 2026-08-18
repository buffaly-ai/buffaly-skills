# Operate the Personalized Pharmacy Current-Website Flyer Queue

Use this guidance when producing FairPath current-website flyers across a lead range.

The goal is to produce useful marketing material efficiently. This is not a regulated-document workflow and not a pixel-perfect replication exercise. Preserve CRM and campaign ownership safety, but do not confuse release safety with local draft creation.

## Operating model

Work one lead per worker. Maintain only the operator-approved concurrency, never more than 10 workers, and use fewer workers when fewer leads genuinely pass admission. Do not build or maintain a speculative eligibility queue before starting. Instead, inspect each next ranked lead and perform the admission checks immediately before dispatch.

For each candidate:

1. Confirm the rank is within the user-approved range and never below its minimum.
2. Confirm an official website or exact official location page exists.
3. Run fresh typed Feeding Frenzy read-only checks for owner, prior contact, follow-up, prior mailing, customer status, duplicate/bad status, and do-not-contact state.
4. Check exact LeadID against all active campaign ownership and exclusion artifacts.
5. Admit the lead only when those checks are clean.
6. Record the pre-dispatch evidence and then create one worker for that one LeadID.

Do not dispatch a worker merely to fill a slot. If fewer leads pass than the approved pool size, run fewer workers.

## Worker instruction

Invoke `ToCreatePersonalizedPharmacyCurrentWebsiteFlyerSkill` with:

- LeadID, rank, pharmacy name, and official website;
- output mode;
- exact parent `artifacts/flyer.html` path when supplied, otherwise the packaged `Skills/MarketingWebsiteSales/Templates/fairpath-current-website-flyer-v1/flyer.html` path or a worker-readable copy;
- fresh pre-dispatch check evidence;
- approved CTA and financial language when different from defaults;
- explicit instruction to use exactly one tall, clean current-site screenshot in the evidence panel, with no repeated crop, second storefront image, or CTA thumbnail;
- explicit instruction not to mutate CRM.

Require the regular prompt action to return `DRAFT READY FOR PARENT REVIEW` with HTML, one-page PDF, 2550 × 3300 preview, current-site screenshot, evidence, structured content, and production report-or one concrete blocker.

## Parent visual review

Inspect the actual final 2550 × 3300 pixels and PDF. Use the packaged `Skills/MarketingWebsiteSales/Templates/fairpath-current-website-flyer-v1/damm-reference.png` when no operator-approved reference is supplied. Damm is a style and quality reference, not a pixel map.

Approve when:

- the page is clearly the exact FairPath template and looks polished;
- the pharmacy identity and official website are correct;
- exactly one screenshot appears on the flyer, filling the tall evidence panel as one continuous clean, unannotated, current, recognizable, proportionally cropped image;
- there is no repeated website crop, second storefront image, empty image well, or CTA thumbnail;
- custom copy sounds human and relevant;
- approved financial language, CTA, disclaimer, and footer are present and readable;
- the single evidence image is resolved and uses the panel height effectively without destructive cropping or conspicuous blank letterboxing;
- the PDF is one page and the preview is exactly 2550 × 3300;
- nothing essential is clipped, broken, missing, hidden, or unreadable.

Do not reject solely for harmless differences in whitespace, section heights, crop, page occupancy, or geometry relative to Damm. Do not use arbitrary pixel thresholds or white-space ratios as release blockers.

If revision is needed, send one concise correction message listing no more than three concrete visible defects. Do not request general similarity or perfection. Allow one correction round; use a direct-render fallback or parent-owned edit if the regular prompt action cannot correct an obvious defect.

## Stalls and failures

A worker that produces no assistant output, tool activity, nested worker, or new artifact for three minutes is stalled. Stop relying on its `InProgress` label. Supersede it and retry once through a clean route. Do not poll an unchanged turn all night.

If the prompt action fails input binding, do not create more workers through the same broken path. Record the infrastructure blocker and use the direct-render fallback for the current flyer.

## Ledger behavior

Record only material events:

- lead admitted or rejected with reason;
- worker dispatched;
- draft package returned;
- parent approved or requested concrete revision;
- final package blocked with reason;
- CRM attachment and verification completed.

Do not rewrite the ledger for unchanged polls, heartbeat ticks, repeated source hashes, or status narration.

Suggested per-lead fields:

```yaml
Rank:
LeadID:
PharmacyName:
Website:
PreDispatchCheckedUtc:
PreDispatchResult:
CampaignCollisionResult:
WorkerSession:
DraftHtml:
DraftPdf:
DraftPreview:
ParentVisualDecision:
ParentNotes:
ReleasePreflightCheckedUtc:
CrmHtmlAttached:
CrmPdfAttached:
CrmVerified:
Status:
```

## CRM release

Parent approval is necessary but not sufficient for CRM mutation. Immediately before attachment, rerun fresh typed Feeding Frenzy and campaign-collision checks. Confirm the package paths and identity belong to the exact LeadID.

Only then:

1. upload or link the exact approved source HTML using the typed Feeding Frenzy action;
2. attach the exact approved PDF using the typed action;
3. independently verify both against the correct LeadID;
4. record attachment and verification evidence in the ledger.

Never attach an internal proof, blocked draft, wrong-lead artifact, or unreviewed package.

## Heartbeats

Use at most one heartbeat job for this queue. Query heartbeat jobs globally before creating one, deduplicate by target session and workflow, and verify exactly one matching job exists. A heartbeat tick is idempotent: if a tick is already processing or no material state changed, do not repeat work or rewrite the ledger.

Stop the heartbeat when the user asks, the source is exhausted, the workflow is blocked, or no eligible candidates remain. Never create another heartbeat from inside a heartbeat tick.

## Completion standard

Measure progress by flyers visually approved and exact HTML/PDF packages attached and verified-not by heartbeats, status checks, retries, ledger hashes, or worker messages.
