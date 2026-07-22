# MarketingWebsiteSales PromptActions.pts Change Notes

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
- The action validates required inputs (reference image, working image, prompt), builds `inputPartsJson` safely via `ImageComparisonProtoScriptFacade.BuildInputPartsJson(...)` in C# (no string building in ProtoScript), and delegates to the existing `ToAskModelViaBuffalyRuntime.Execute(...)` for the model call.
- No `_opsAgent` coupling in the new action; no BuffalyAgent C# modification; no string-built JSON in ProtoScript.
- The C# facade `ImageComparisonProtoScriptFacade` lives in `Buffaly.Marketing/ImageComparison/` as a standalone static class with no BuffalyAgent or runtime dependencies.
- Updated `Buffaly.Marketing.dll` in all skill `lib/` directories (GoogleAnalytics, GoogleTagManager, MarketingWebsiteSales) to include the new facade class.
