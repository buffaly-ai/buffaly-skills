# Validate Personalized Pharmacy One-Page Growth Insert

Independently validate the exact final customer-facing insert and its evidence package. Do not accept a completion narrative, content JSON alone, or an earlier draft as proof.

## Required identity and safety evidence

Fail unless the package identifies the exact lead/pharmacy and records the checked date plus evidence for:

- operating/open status and current address;
- customer, defunct, duplicate, prior-mail, and active-sales-conflict checks;
- official website identity;
- current website/competitor/conversion/AI-readiness analysis;
- completed reputation scan or an explicit research-capability blocker.

A research-action failure must produce only the defined blocker package unless the caller explicitly requested a blocked visual prototype. Never label infrastructure failure as a mail-safety failure.

## Required production artifacts

For a successful visual deliverable, fail unless all exist in one reported output folder:

- exact 33-slot structured-content JSON;
- private evidence/strategy record containing the five-part specificity gate;
- one contiguous official-site screenshot;
- final semantic HTML;
- one-page PDF;
- exact 2550 x 3300 preview PNG rendered from that HTML/PDF production path;
- OCR text or equivalent exact-preview text verification;
- validation JSON with an empty `ValidationIssues` collection.

## Packaged template contract

Validate against these package-owned files:

- `Skills/MarketingWebsiteSales/Templates/fairpath-one-page-insert-v1/fairpath-one-page-insert.template.html`
- `Skills/MarketingWebsiteSales/Templates/fairpath-one-page-insert-v1/template-contract.json`
- `Skills/MarketingWebsiteSales/Templates/fairpath-one-page-insert-v1/fairpath-logo-complete.png`

Fail unless:

- template SHA-256 is exactly `BCF716F871B81A7BA58AF567DADE9168B6AAB9A00D2FE7F57C3D663041686EE7`;
- the content record has exactly the 33 required keys, no missing or extra key, and every configured character maximum passes;
- all placeholders are resolved;
- CSS and semantic section order remain unchanged;
- HTML contains semantic text and is not an image-only wrapper;
- the screenshot is an actual official-page capture rather than a directory card, search result, collage, or fabricated mockup;
- every local image/font reference resolves;
- PDF has exactly one page;
- preview dimensions are exactly 2550 x 3300.

## Pharmacy-specific mechanism gate

Fail unless the private strategy and customer-facing upper half establish:

1. one observed service line or tightly related service family;
2. one specific person, referral source, or patient group;
3. one real starting trigger;
4. one concrete FairPath intake, consent, scheduling, reminder, documentation, reputation, or handoff job;
5. one understandable pharmacy/patient outcome.

At least four of the five must be understandable from the customer-facing upper half. Reject a generic `follow-up lane`, `clearer workflow`, broad service-menu summary, or `organize patient touchpoints` concept that could be reused for another pharmacy by changing only its name and service list.

## Customer-language and claim checks

Fail if visible customer copy contains internal/research language such as `hypothesis`, `hypotheses`, `CRM`, `PHI`, `campaign`, evidence-state labels, production notes, validation instructions, confidence scoring, or unverifiable claims.

Fail if:

- a statement is stronger than its evidence;
- public facts are presented as private knowledge;
- the page promises eligibility, reimbursement, profit, savings, patient volume, or guaranteed results;
- population is presented as patients;
- illustrative financial language lacks the required qualifier;
- the exact financial amount is missing or corrupted in the final preview;
- the pharmacy name, mechanism headline/flow, FairPath identity, CTA, qualifier, or footer is clipped or unreadable.

The lower half must communicate FairPath outcomes in human language: remote-care opportunity where appropriate, less manual intake/process work, and helping the pharmacy reach or serve more patients. It must not become a compressed proposal deck.

## Artifact identity and exact-preview checks

Hash or otherwise identify the final HTML, PDF, PNG, content JSON, screenshot, template, and validation record. Confirm the files validated are the files reported for delivery. OCR and visually inspect the exact final PNG, including focused region checks when color or layout causes normal OCR to miss visible text.

## Validation response

Return success only when every required check passes and `ValidationIssues` is empty. On failure, `FeedbackForRetry` must list each failed gate, exact artifact/path, observed evidence, and precise correction. Do not silently weaken an assertion merely because OCR reading order splits adjacent visual text; use focused-region OCR, normalized whitespace, structured-content comparison, and visual inspection to distinguish validator error from a deliverable defect.