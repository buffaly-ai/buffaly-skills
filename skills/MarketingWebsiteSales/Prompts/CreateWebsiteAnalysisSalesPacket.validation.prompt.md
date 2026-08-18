# Validate Website Analysis Sales Packet

Validate that the work result created a complete sales-rep-ready packet from evidence-backed website analysis and related sales artifacts.

Do not treat statements made by the work result as proof by themselves. Claims such as `called`, `validated`, `visually inspected`, `passed`, or `regenerated` require matching runtime evidence, artifact evidence, or independently inspectable validation output. The existence of a component validation JSON file does not prove that the named function ran.

## Objective checks

Fail if any required packet component is missing without explanation:

- References the completed website audit/analysis and evidence source.
- Includes or references competitor analysis/positioning.
- Includes or references a client-facing report.
- Includes or references proposal/deck material or explains why deck generation was intentionally deferred.
- Includes or references demo website assets, screenshots, annotated improvements, or demo direction when relevant.
- Includes a manifest or README for the sales rep listing included files, links, and intended use.
- Names artifact paths, folder paths, URLs, ZIP path, or landing-page path where the packet can be found.
- Keeps internal evidence separate from client-facing material.
- Does not claim artifacts were created unless paths/links/evidence are provided.

## Per-step component validation evidence checks

Fail unless the packet includes explicit component validation records. A single final packet summary is not enough.

For a full packet, require these records under `component-validations/` unless a component was explicitly deferred with an acceptable reason:

- `website-analysis-validation.json`
- `client-facing-report-validation.json`
- `competitor-analysis-validation.json`
- `demo-website-validation.json`
- `annotated-improvements-validation.json`
- `proposal-deck-validation.json`
- `staging-deployment-validation.json` when publishing/deployment was requested

Each component validation record must include:

- component name;
- exact required function name;
- whether the exact function was called;
- child session key or correlation ID;
- work-turn and validation-turn IDs when available;
- validated-action result;
- whether the artifact was reused, repaired, regenerated, deferred, or blocked;
- status: `passed`, `failed`, `deferred`, or `blocked`;
- attempt count;
- artifact paths validated;
- artifact hashes when practical;
- objective checks performed;
- subjective/customer-visible quality checks performed when applicable;
- screenshot or public URL evidence when applicable;
- validation timestamp;
- retry/blocker feedback when not passed.

Fail if any required component is marked `passed` without artifact paths and objective checks. Fail if any customer-visible component is marked `passed` without subjective quality checks. Fail if publishing is requested and staging deployment is marked passed without public HTTP evidence.

Fail if a component record uses terms such as `equivalent`, `manual equivalent`, `equivalent workflow`, or `self-validated` in place of an actual required function call. Fail if the record merely names a required function without runtime evidence that it was called.

If a component uses an existing artifact instead of regenerating it, the required component function must still be called for current-run validation. Fail if an existing artifact was reused or repaired without that call.

When failing, `FeedbackForRetry` must name the missing component validation record, missing field, failed component status, missing artifact path, missing subjective quality gate, or missing public/screenshot evidence and explain the exact correction needed.

Also fail unless the packet includes `validation/function-execution-ledger.json`.

For a full packet, the ledger must contain passing execution entries for:

- `ToAnalyzeExistingWebsiteForImprovementsSkill`
- `ToCreateClientFacingWebsiteReportSkill`
- `ToBuildDemoWebsiteFromAnalysisSkill`
- `ToCreateWebsiteGrowthProposalDeckSkill`

Require `ToDeployGeneratedDemoWebsiteToFeedingFrenzyStagingSkill` only when publishing was requested. Require `ToDraftClientDemoEmailSkill` only when outreach-email creation was requested.

For each required entry, fail unless:

- `Required` is `true`;
- `Called` is `true`;
- `FunctionName` exactly matches the required callable function;
- runtime execution evidence is present;
- `Attempts` is at least `1`;
- `ValidatedStatus` is `passed`;
- the listed artifacts exist;
- the corresponding component validation record agrees with the ledger.

Fail if the ledger and component record disagree about function name, call status, attempt count, validation status, disposition, or artifacts.

## Competitor analysis artifact checks

Fail unless the packet includes a concrete competitor analysis artifact or an explicit evidence-based reason that competitor analysis could not be completed.

When competitor analysis is expected, the packet must include:

- `competitor-analysis/competitor-analysis.md` or an equivalent markdown artifact path.
- `competitor-analysis/competitor-analysis.html` or an explicit reason HTML was intentionally not created.
- Source notes or evidence references for each competitor, such as website URLs, search/profile URLs, screenshots, page summaries, or inspected page excerpts.
- A clear distinction between actual business competitors and SEO-only, directory, marketplace, or lead-generation search competitors when both appear.
- A market-scope statement explaining whether the analysis used local, surrounding-market, regional/state, national, or industry competitors, and why.
- A comparison of the prospect against competitors on relevant dimensions such as service/product overlap, local or industry relevance, SEO/page structure, proof/trust signals, calls to action, content depth, AI-search/LLM readiness, and visible weaknesses.
- A ranked or prioritized summary of where the prospect stands today and what must improve to outrank, out-position, or out-convert the competitors.
- Links or references to the competitor artifact from the manifest, sales-rep README, packet landing page, and proposal deck or client-facing report when safe.

Fail if competitor analysis is only a short paragraph, generic market commentary, unsupported ranking claim, or list of competitor names without source evidence.

Do not require local competitors when no local market is verified. In that case, pass only if the limitation is explicit and the artifact safely uses industry/national competitors or explains why competitor discovery is blocked.

When failing, `FeedbackForRetry` must name the missing competitor artifact, missing source evidence, missing actual-vs-search separation, unsupported ranking/market claim, missing comparison dimension, missing summary, or missing packet link and explain the exact correction needed.

## Annotated improvements handoff checks

When a demo website, demo screenshot, or proposal deck is included in the packet, fail unless an annotated improvements handoff artifact is created or an explicit user-approved deferral is documented.

The annotated improvements handoff must include concrete artifact paths for at least one customer-visible annotated asset, such as:

- `sales-assets/annotated-improvements.html`;
- `sales-assets/annotated-improvements.png` or equivalent screenshot/image;
- `sales-assets/annotated-improvements-handoff.md` or equivalent sales-rep notes.

Fail if the handoff only describes intended annotations without creating a reviewable artifact.

The handoff must:

- Map visible demo improvements back to specific website-analysis findings.
- Explain the sales value of each visible improvement, such as stronger hero/message, service/product clarity, CTA/contact path, retained brand continuity, helpful answers/FAQ, local or industry trust, mobile action path, and proof/trust improvements.
- Include the annotated asset in the proposal deck when a proposal deck is included and the handoff exists.
- Link or list the annotated asset from the packet landing page, manifest, and sales-rep README.
- Use customer-safe wording; do not expose internal-only critique or unsupported claims.

## Annotated handoff visual quality checks

Because the annotated handoff may be customer-visible, fail unless it is visually reviewable and professional:

- Screenshot/image/page annotations must be readable at normal review size.
- Callouts must not overlap important content or obscure the improvement they describe.
- The selected client/prospect palette or packet palette must be used consistently when the handoff is styled.
- The handoff must not show broken images, missing screenshots, placeholder labels, unrelated template branding, unreadable contrast, or unfinished layout.
- If the handoff is HTML, it must include enough embedded CSS or inline styling to render cleanly from the artifact folder.

When failing, `FeedbackForRetry` must name the missing handoff artifact, missing link location, weak/missing callout, unreadable screenshot, palette/style issue, or unsupported claim and explain the exact correction needed.

## Subjective checks

Fail if the packet is only a summary and not useful to a sales rep:

Score each customer-visible component from 1 through 5 on:

- prospect specificity;
- evidence depth;
- strategic usefulness;
- sales persuasiveness;
- visual polish;
- readability;
- consistency with the other packet components;
- readiness to show the prospect without additional explanation.

Fail the packet if:

- any component scores below 3 in any category;
- any component averages below 4;
- the validator does not provide concrete evidence supporting each score;
- the report, demo, competitor analysis, and deck merely repeat the same shallow observations;
- competitor findings lack source-specific observations;
- visual review does not inspect every report page and every proposal slide.

Do not accept `looks professional`, `coherent palette`, or `screenshots inspected` as sufficient quality evidence without concrete observations.

- The packet must make it clear what was found, why it matters, how the demo/report/deck support the sales conversation, and what the recommended next step is.
- Client-facing language must be safe, professional, and evidence-backed.
- Sales-rep notes must be practical and specific to the prospect.
- The output must not re-synthesize from memory when existing matrix/audit findings are available.
- Any customer-visible annotated improvements asset must look polished, intentional, and useful enough for a sales rep to show or explain without apologizing for unfinished design.
- Competitor findings must be useful for sales positioning, not just SEO trivia; they should help the sales rep explain where the prospect can credibly win and what proof or site structure would close the gap.
