# Create Pharmacy Growth Proposal Deck - v5 Validation Prompt

## Role

Validate the v5 pharmacy growth proposal deck workflow.

The v5 workflow is a template-package fill workflow. It is not the old v4 story-gate/per-slide-generation workflow.

Do not fail a candidate for omitting old v4-only artifacts such as storyboard.json, deck-content.json, slide packages, market-economics-ledger.json, cross-slide QA contact sheets, or manual render ledgers unless the v5 work prompt or template package explicitly required them for this run.

## Required Outcome Types

The work result is valid if it is one of these:

1. Passed build: model-authored v5 artifacts exist and the deterministic builder produced final HTML plus PDF or a clear PDF-unavailable warning.
2. Correct blocker: the workflow stopped before fill/build because a required v5 template-package file, required slot, branch decision, or safe lead identity value was missing.

## Required v5 Artifacts

For a passed build, require these artifacts or explicit paths in the work result:

- run-input.json
- template-package-check.json
- research-notes.md
- lead-profile.json
- branch-decision.json
- deck-fill.json
- build-request.json
- dist/index.html
- dist/build-report.json

PDF is required unless the build report explicitly records a deterministic PDF export unavailable warning. If PDF is requested and unavailable, validation may pass only if HTML and build-report are otherwise valid and the final response clearly states that PDF export is blocked.

## Template Package Requirements

The template package must contain:

- template-manifest.json
- index.html
- styles.css
- print.css
- slots.json
- branch-rules.json
- static-regions.json
- builder-contract.json
- assets/logos/
- assets/fonts/
- assets/remote-care/
- assets/website-branch/
- assets/shared/

The package check must verify:

- exactly 16 slide sections,
- exactly 16 data-slide sections,
- declared slots exist in HTML,
- branch rules include official_site, no_functioning_site, and unconfirmed_site,
- static region definitions exist.

## Builder Validation

Require build-report.json status passed.

Require:

- no builder errors,
- no builder warnings unless explicitly acceptable and disclosed,
- no unknown slots,
- required slots filled or backed by approved fallback,
- required `image_asset` slots filled with lead-specific local run assets, not packaged template/sample image paths,
- selected branch valid,
- final HTML has exactly 16 sections,
- slot count and applied slot count are reported.

## Model Boundary Validation

Pass only if the model did not manually author final deck HTML/CSS/PDF.

The model may produce:

- research notes,
- lead profile,
- branch decision,
- deck-fill.json,
- build request.

The deterministic builder must produce final HTML/PDF/build-report.

Fail if the work result says or implies the model manually rebuilt slide HTML, changed layout, created new slides, or bypassed the builder.

## Branch Validation

The branch-decision.json must choose exactly one websiteBranch:

- official_site
- no_functioning_site
- unconfirmed_site

For no_functioning_site and unconfirmed_site branches, fail if final customer-facing HTML contains these forbidden concepts as active claims:

- official website
- website score
- redesign
- crawl findings
- site architecture findings
- current-site audit

Do not fail if those terms appear only inside non-rendered JSON, build code, or validation metadata.

For official_site branch, require evidence that the website was reasonably confirmed as official/current before website-specific critique or audit language is used.

## Lead/Research Validation

Require the workflow to use the named prospect and appointment context supplied by the user.

For Adams Family Pharmacy / LeadID 66586, validate that:

- prospect name is Adams Family Pharmacy,
- Nikki Bryant is treated as appointment/contact context when available,
- LeadID and appointment timestamp do not appear in customer-facing final HTML unless explicitly intended,
- CRM/login unavailability is reported if applicable,
- website ownership is not treated as confirmed unless supported.

Research should be enough to support filled fields, but v5 validation should not demand broad v4 market/economics ledgers unless those fields are present in slots.json and filled with specific numeric claims.

## Customer-Facing Cleanliness

Final customer-facing HTML must not contain:

- unresolved moustache placeholders like {{PHARMACY_NAME}},
- mojibake such as ΓÇö or replacement characters,
- LeadID,
- internal workflow/tool/debug language,
- obvious unsupported factual claims,
- branch-forbidden active claims.

Final customer-facing HTML must not keep packaged website sample images in website/public-presence visual regions when `slots.json` declares image slots. Require rewritten `dist/assets/run-images/...` references for those image slots, and require those files to exist.

## Correct Blocker Validation

If the workflow blocks, pass the blocker only if it:

- stops before manual deck generation,
- identifies the exact missing required file/slot/branch/evidence/runtime issue,
- does not create final HTML/PDF by hand,
- gives enough detail for the next implementation fix.

## Final Decision

Return validation status pass only when the v5 workflow either:

- produced valid template-builder artifacts, or
- blocked for a real v5 reason without inventing/rebuilding the deck.

Return fail when the candidate follows the old v4 workflow, manually rebuilds the deck, uses undeclared slots, produces branch-inconsistent customer-facing claims, or omits required v5 artifacts without a valid blocker.
