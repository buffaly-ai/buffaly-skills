# MarketingWebsiteSales PromptActions.pts Change Notes

## Use Workbench-owned website-audit deliverable roots (2026-08-15)

- Removed the website-audit prompt's obsolete `workflow-workbench/AnalyzeExistingWebsiteForImprovements/deliverables` folder instruction.
- Step 7 and Step 8 now use the absolute final-deliverable root injected by General Skill Workbench, and manifest paths must point to exact files under that root. Artifact confinement remains authoritative and no path rewriting or fallback folder is supported.

## Decompose the client-facing report into eight Workbench steps (2026-08-15)

- Reworked `ToCreateClientFacingWebsiteReportSkill` v1.3.0 into eight explicit Workbench steps covering evidence intake, evidence-safe findings, complete report copy, branded template preparation, standalone HTML assembly, PDF rendering, iterative objective/subjective QA, and owned validation plus final packaging.
- Preserved the complete report contract outside the workflow, including matrix-driven coverage, evidence/impact/fix reasoning, AI/LLM readiness, competitive-positioning safeguards, placeholder replacement, standalone HTML and PDF deliverables, and validation requirements.

## Own website-audit inputs in ProtoScript (2026-08-15)

- Assigned `Inputs = ["LeadId", "CompanyName", "WebsiteUrl"]` directly on `ToAnalyzeExistingWebsiteForImprovementsSkill`.
- The resolved ProtoScript action is the authority for user-facing input discovery. Workbench JSON Schema may add validation constraints, but it must not be required to discover whether these fields exist.
- Added `ToInspectMarketingWebsiteSalesActionInputs`, a thin typed ProtoScript action that resolves one package action and returns its `Inputs` collection as strict JSON. Workbench preflight uses this instead of parsing `.pts` or asking a model to interpret formatted prototype text.

## Declare proposal Workbench inputs on the prompt action (2026-08-13)

- Added the string-valued `Inputs` collection to `ToCreatePharmacyGrowthProposalDeckSkill`: `LeadId`, `CompanyName`, `WebsiteUrl`, and `PresenterMode`.
- Removed the proposal's duplicate `WorkPromptPath`; `PromptPath` remains the work-prompt authority.

## Add package-owned GeneralSkillWorkbench descriptor catalog (2026-08-13)

- Added `Skills/MarketingWebsiteSales/workbench/skills.json` as the package-owned `workbench-skill-catalog/v1` authority for GeneralSkillWorkbench discovery and graph resolution.
- Cataloged exact descriptors for independently attachable GeneralSkillWorkbench skills: `ToAnalyzeExistingWebsiteForImprovementsSkill` v1.2.0, `ToCheckPharmacyReputationSkill` v1.0.0, and `ToCreatePharmacyGrowthProposalDeckSkill` v3.8.0 with canonical workflow keys, prompt paths, adapters, and package-local input/output schema paths.
- Encoded the owner-prompt dependency truth for `ToCreatePharmacyGrowthProposalDeckSkill`: it conditionally requires `ToAnalyzeExistingWebsiteForImprovementsSkill` only when `facts.officialWebsite.status == 'confirmed official website'`.
- `ToCheckPharmacyReputationSkill` is cataloged as an independently attachable supported workbench skill, but it is not bound as a `ToCreatePharmacyGrowthProposalDeckSkill` prerequisite because `index.pts` and the v3.8.0 work/validation prompts do not authorize a separate reputation edge. Reputation, directory presence, public profiles, and reviews remain internal proposal research/output signals owned by the deck workflow itself.
- Added minimal workbench schemas for lead/session inputs, prerequisite binding payloads, and generic final proposal HTML/PDF artifact semantics that map to the actual validated work/validation prompts.

## Expose the client-facing report in GeneralSkillWorkbench (2026-08-15)

- Added `ToCreateClientFacingWebsiteReportSkill` v1.2.0 to the package-owned Workbench catalog as an independently attachable `validated-markdown-workflow/v1` action.
- Added one explicit Workbench workflow step to the authoritative work prompt. The step executes the complete existing client-facing report contract, returns concrete HTML/PDF/evidence outputs, and requires the owned validation prompt to pass.
- This lets initial selection and Add Skill use the same `SkillCatalogService.GetCurrentPrompt` and `PromptStepCompiler` path instead of a synthetic remote-action wrapper.

## Lead with Remote Care under ClearSpan branding (2026-07-29)

- Updated `ToCreatePharmacyGrowthProposalDeckSkill` to v3.5.1 and reordered the packaged 16-slide contract so the Remote Care proof period, five programs, workflow, market, and economics occupy slides 3-7 before website/current-state evidence on slides 8-13.
- Rebranded the presenting layer to match the supplied ClearSpan example: a typographic `ClearSpan` wordmark with the smaller `with FairPath` qualifier and `ClearSpan · FairPath` footers. Prospect identity and FairPath product references remain distinct.
- Updated the production prompts, independent validation, implementation notes, machine-readable contract, HTML template, and regression assertions to reject stale website-first ordering or Intelligence Factory presenter residue.

## Package remote-care proof-period proposal template (2026-07-29)

- Updated `ToCreatePharmacyGrowthProposalDeckSkill` to v3.5.0 and packaged the current 16-slide HTML reference deck with `IMPLEMENTATION_NOTES.md`, `slide-content-contract.json`, `bvp-deck-assets/`, and `website-growth-visuals/` so the template and build contract travel with the skill.
- Added a dedicated slide 8 proof-period frame: `Prove Remote Care for 90 Days`. It is remote-care-general, not CCM-only/CCML, and requires manageable first patient group, training, measurement/control language, and readiness caveats instead of unsupported no-lock-in/pricing promises.
- Re-indexed the downstream contract so slide 9 is Remote Care Opportunity with RPM, CCM, AWV, RTM, and APCM visible; slide 10 is FairPath workflow; slide 11 is market size; slide 12 is economics; slide 14 is the growth recap; slide 15 is the two-path timeline; and slide 16 is the starting-path choice.
- Added prompt, validation, and regression-fixture checks for the packaged template contract, proof-period slide, remote-care-general wording, source asset resolution, and all-slide rendered QA.

## Tighten proposal composition and scoring (2026-07-29)

- Updated `ToCreatePharmacyGrowthProposalDeckSkill` to v3.4.0 so rendered slides fill the 1280x720 frame without outer-container bands or letterboxing.
- Made slide 2 use a dominant zoomed/clipped official-site screenshot for established websites, and made slide 6 the required scored audit page with visible LLM/AI-answer and material SEO/search/content/technical/conversion signals.
- Smoothed the slide 8 transition into patient-support programs, requires all five core offerings (RPM, CCM, AWV, RTM, APCM), and removed the customer-facing capture/share column from slide 11 while preserving those assumptions in the ledger.
- Added corresponding production-validation and regression-contract checks.

## Broaden the pharmacy/FairPath proposal framework (2026-07-29)

- Updated `ToCreatePharmacyGrowthProposalDeckSkill` to v3.3.1 so an explicitly authorized pharmaceutical company, healthcare organization, enterprise operator, pharmacy-adjacent business, or other prospect is not rejected solely for being outside the independent-pharmacy category.
- Added fit routing that preserves the prospect's verified business type, removes unsupported independent-pharmacy assumptions, and translates the applicable website, healthcare, pharmacy-operations, patient-support, provider-partnership, and remote-care story to the prospect's actual operating model.
- Updated independent validation and regression fixtures to fail misclassification and unsupported pharmacy assumptions while allowing truthful non-pharmacy proposals.
- Added production-path Medicure-like integration cases: the positive case executes `ToCreatePharmacyGrowthProposalDeckSkill` through the validated-prompt child-session runner, while an unchanged staged negative candidate executes through `ToValidatePharmacyGrowthProposalDeckFixtureSkill`, which shares the exact production proposal validation prompt. The repository harness consumes the resulting runner statuses and diagnostics instead of implementing a second eligibility engine.
- Bound the negative case to a committed deterministic 16-slide misclassified Medicure proposal by project-relative path and SHA-256. The staged work phase must open and hash that exact artifact, quote defects observed in it, and attest artifact provenance; the harness rejects runner evidence that does not carry the configured path, hash, and provenance statement.

## Package simplified current-website pharmacy flyers (2026-07-23)

- Added `ToCreatePersonalizedPharmacyCurrentWebsiteFlyerSkill` as a regular prompt action for one current-site pharmacy flyer with narrow identity research and practical parent visual review.
- Added `ToOperatePersonalizedPharmacyCurrentWebsiteFlyerQueueSkill` for bounded one-lead worker pools, material ledger updates, and guarded CRM attachment verification.
- Packaged the canonical `fairpath-current-website-flyer-v1/flyer.html` template, Damm quality reference, and machine-readable template contract so the workflow does not depend on Matt-local or session artifacts.
- The flyer action requires one clean unannotated official-site screenshot shown once and returns HTML, one-page PDF, exact 2550x3300 preview, evidence, structured content, and a production report.
- Kept this workflow prompt-only rather than validated-prompt: the parent performs practical visual QA and one bounded correction instead of an expensive independent validation loop.

## Route pharmacy proposals by prospect maturity (2026-07-22)

- Updated `ToCreatePharmacyGrowthProposalDeckSkill` to v3.3.0 as the single user-facing pharmacy proposal workflow: it resolves missing official websites, internally runs or reuses the validated website opportunity audit for confirmed official sites, skips audit fabrication for no-site cases, and records the branch in the proposal research packet before deck assembly.
- Retained the v3.2 routing foundation for single- versus multi-location prospects, no/weak/established websites, social and reputation proof, retail strengths, clinical maturity, and local care pressure.
- Reworked the 16-slide cadence to lead with prospect momentum, introduce Intelligence Factory/FairPath after the opportunity, and present website growth and remote care as independent, sequenced, or combined paths.
- Replaced audit/procurement jargon with owner-friendly titles, added social-proof/screenshot guidance, removed static template pricing, and limited customer-facing disclaimers to short material qualifications.
- Kept detailed sources, evidence states, equations, assumptions, and operational caveats authoritative in the market ledger and evidence summary; validation still recomputes every financial scenario.
- Added language, prospect-fit, template-contamination, and rendered visual-QA checks plus four regression routing fixtures.

## Add personalized pharmacy one-page growth inserts (2026-07-22)

- Added `ToCreatePersonalizedPharmacyOnePageGrowthInsertSkill` as a validated prompt action for one evidence-grounded, customer-facing FairPath direct-mail insert.
- Packaged the complete work prompt, independent validation prompt, frozen `fairpath-one-page-insert-v1` HTML/CSS template, exact 33-slot contract, and FairPath logo.
- Added a five-part service-line specificity gate so generic follow-up-lane concepts fail when the evidence supports a concrete pharmacy mechanism.
- Validation requires exact HTML, one-page PDF, 2550x3300 preview, official-site screenshot, exact-preview OCR/visual checks, artifact hashes, mail safety, and customer-safe language.
- Replaced the stale package-local DLL path reference with assembly-name resolution for `Buffaly.Marketing`.

## Own pharmacy sales workflows (2026-07-20)

- Moved pharmacy lead enrichment, pharmacy reputation auditing, and pharmacy growth proposal actions under `MarketingWebsiteSalesSkillAction`.
- Their work/validation prompts, reputation checklist, and proposal reference-template assets are now owned by this source package instead of Matt-local personal nodes.

## Separate sales/demo website workflows

- Added `MarketingWebsiteSalesSkillAction` and `MarketingWebsiteSalesSkill` for website analysis, sales packets, proposal collateral, static demo sites, staging previews, outreach emails, and service-order sales documents.
- Promoted the current Matt-local sales/demo prompt actions into a source-controlled sales/demo collection.
- Descriptions explicitly distinguish these workflows from real client website implementation under `ClientWebsiteImplementationSkill`.


## Convert sales/demo workflows to validated prompts (2026-07-06)

- Converted MarketingWebsiteSales public workflow actions from prompt-only `PromptAction` to `ValidatedPromptAction` so invoking the workflow through the validated runner performs a work pass and a validation pass instead of only returning guidance text.
- Added `.work.prompt.md` and `.validation.prompt.md` files for website analysis, demo-site generation, sales packet packaging, client-facing report generation, proposal deck generation, staging deployment, outreach email drafting, and service-order addendum drafting.
- Work prompts explicitly instruct the child agent to execute available tools/actions/methods and create artifacts; they forbid satisfying the request by echoing prompt text or returning summaries only.
- Validation prompts define acceptance criteria for artifact existence, evidence grounding, real PDFs where applicable, competitor/local-market handling, AI-search readiness, README/manifest/landing-page completeness, staging proof, and client-safe language.

## Add image comparison action (2026-07-07)

- Added `ToCompareImagesViaBuffalyRuntime` as a C# facade-backed ProtoScript action for two-image visual comparison through the Buffaly runtime provider catalog.
- Added `reference "lib/Buffaly.Marketing.dll"` and `import` for `ImageComparisonProtoScriptFacade` at the top of `index.pts`.
- The action validates required inputs (reference image, working image, prompt), builds `inputPartsJson` safely via `ImageComparisonProtoScriptFacade.BuildInputPartsJson(...)` in C# (no string building in ProtoScript), and calls the active runtime host directly through `_opsAgent.AskModelViaRuntime(...)`. This avoids a cross-lazy-module compile dependency on the separate LLM package.
- The ProtoScript action intentionally depends on the active `_opsAgent` runtime host for the final model call. It no longer depends on the separately lazy LLM action module; no BuffalyAgent C# modification or string-built JSON in ProtoScript was required.
- The C# facade `ImageComparisonProtoScriptFacade` lives in `Buffaly.Marketing/ImageComparison/` as a standalone static class with no BuffalyAgent or runtime dependencies.
- Updated `Buffaly.Marketing.dll` in all skill `lib/` directories (GoogleAnalytics, GoogleTagManager, MarketingWebsiteSales) to include the new facade class.

## Validated prompt concrete bindings (2026-08-14)

- ToAnalyzeExistingWebsiteForImprovementsSkill and ToCreatePharmacyGrowthProposalDeckSkill assign ValidatedPromptActionName to their own canonical prototype names, as required by the generic validated-prompt runner.
