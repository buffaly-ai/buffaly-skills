> VALIDATED PROMPT ACTION ONLY
>
> Do not run this markdown file directly as ordinary prompt guidance.
> This prompt must be executed through the corresponding ProtoScript `ValidatedPromptAction` so the validation prompt runs after the work turn.
> If you are an agent, call the action/tool instead of loading this file directly.

# Prompt Skill: Create Client-Facing Website Improvement Report

## Purpose
Create a polished, client-deliverable HTML and PDF website improvement report from an evidence-based website audit. The report should look like a Feeding Frenzy by Buffaly deliverable and should be safe to send directly to the business owner.

This prompt is the full work specification. Validation is additive: validation must enforce this prompt, not replace it with a shorter checklist.

## Reusable template
Use this template as the base artifact:

- `Nodes/Personal/Marketing/Templates/WebsiteAnalysisSalesPacket/client-facing-website-report.template.html`

Copy it into the output folder and replace all `{{PLACEHOLDER}}` tokens with client-specific content. If the template is unavailable, reproduce its structure and quality standard:

- branded cover page;
- client context/meta row;
- executive summary and main opportunity callout;
- quick scorecard with rationale;
- visibly titled AI Search and LLM Readiness section;
- current strengths;
- improvement opportunities;
- competitive landscape / positioning gaps;
- recommended action plan;
- quick wins;
- longer-term SEO/content recommendations;
- website refresh/rebuild opportunity;
- evidence reviewed;
- footer/disclaimer.

## Reference implementation standard
When available, compare against accepted Marketing Agency client-facing reports from prior successful sales packets. Do not copy their content. Use them as a bar for:

- report-like structure rather than memo-like summary;
- client-specific evidence and recommendations;
- strong section purpose;
- polished visual presentation;
- clear business-owner language;
- practical next steps;
- evidence-safe wording.

A report that merely has the right headings but does not help the business owner understand what is wrong, why it matters, and what to do next is not acceptable.

## When to use
Use this skill after a public website audit has already been performed and there is direct evidence for:

- homepage metadata and copy;
- robots.txt and sitemap status;
- important pages discovered;
- service/product/location/about/contact/blog/resource pages;
- title tags, meta descriptions, headings, CTAs, trust signals, NAP/contact details when applicable, schema, links, image alt text, content quality, AI-search/LLM information quality, and performance/template risk;
- competitor analysis covering actual local and surrounding-market competitors when public evidence supports that, plus SEO-only/lead-generation competitors when relevant;
- any screenshots or supporting artifacts, if available.

If the audit evidence is missing or too weak, gather more evidence before writing the report. Do not invent facts. If evidence cannot be obtained, document the limitation in evidence notes and phrase client-facing copy safely.

## Required inputs
- Client/business name.
- Website URL and display domain.
- Business type/category.
- Selected client color scheme with primary, secondary, accent, light background, ink, muted, and white values.
- Audit evidence and findings.
- Scorecard categories, scores, and rationale.
- AI Search and LLM Readiness score and explanation.
- Current strengths.
- Improvement opportunities.
- Competitor findings and competitive-positioning recommendations.
- Recommended action plan.
- Quick wins.
- Long-term SEO/content recommendations.
- Evidence reviewed.
- Preferred output folder under session `artifacts`.

## Required matrix-driven report coverage

The report must be derived from the audit acceptance matrix in `AnalyzeExistingWebsiteForImprovements.prompt.md` or from a matrix-like set of saved audit findings. Do not re-synthesize the report from memory when audit findings exist.

Before filling the template, confirm that the audit includes or can support these matrix rows. Every relevant row must appear somewhere in the client report as a strength, issue/opportunity, scorecard rationale, action-plan item, long-term recommendation, or evidence-reviewed item.

| Matrix area | Must appear in client report as |
|---|---|
| Homepage metadata | Client-safe search setup, snippet, first-screen, or positioning finding when relevant. |
| Local SEO and NAP/contact clarity | Local consistency, service-area, contact, phone, address, or market-clarity recommendation when applicable. If no local market is visible, document the limitation and use industry/national positioning safely. |
| Technical crawlability | Sitemap/robots/crawlability/index-quality finding when observed. |
| Page inventory | Evidence reviewed and strengths/opportunities for important page types. |
| Service/product keyword coverage | Service/product/category page recommendation for high-intent offerings. |
| Content quality and differentiation | Content clarity, differentiation, templated/thin/generic copy finding, or stronger positioning recommendation. |
| Conversion path | Calls, refills, transfers, appointment/contact, quote/request, demo/request-info, or other primary action recommendations. |
| Trust and E-E-A-T | Trust, proof, team, credential, review/testimonial, case-study, safety, support, privacy/security, compliance, or community-signal recommendation using evidence-safe wording. |
| Reviews and social proof | Social-proof finding only if inspected; otherwise phrase as an opportunity to add visible proof if available. |
| Accessibility and media | Image alt text/media/accessibility finding when observed. |
| AI-search / LLM readiness | Required AI-search readiness section with score/explanation and no promise of AI rankings. |
| Competitor landscape | Competitive landscape section separating actual competitors from search/directory/lead-generation competitors when both exist. |
| Competitor page gaps | Positioning recommendations based on verified competitor/service/CTA/trust gaps or marked as needing verification. |
| Performance/template risk | Include only if observed or measured; otherwise omit or mark not measured in evidence notes. |
| Quick wins and prioritization | Quick wins and action plan based on the matrix, not generic suggestions. |

If a matrix row was not checked, do not silently ignore it. Either gather the missing evidence before writing the report or state in the internal task/scratch record why it was not verified. Client-facing copy should not expose internal process notes.

## Required section representation and quality

The report must include each relevant section and each section must do useful work. Section headings alone are not enough.

1. Cover page / client context
   - Include client name, website/domain, business type, and primary outcome.
   - Use the selected client palette or a palette derived from the current site/demo.

2. Executive summary
   - State the main opportunity in client-safe language.
   - Explain why it matters for leads, trust, search visibility, conversion, booking, calls, demos, or the category-specific next step.
   - Include one strong main-opportunity callout.

3. Quick scorecard
   - Include categories and scores/grades.
   - Each score must have rationale tied to evidence.
   - Do not provide unexplained labels.

4. AI Search and LLM Readiness
   - Required when website facts/content structure were inspected. The section heading must visibly include both AI and LLM language, for example "AI Search and LLM Readiness," not only subtle phrases like "answer-ready facts."
   - Explain whether the site exposes clear, accurate, answerable business facts.
   - Recommend structure/content that would improve answerability without promising AI rankings.

5. Current strengths
   - Identify evidence-backed strengths to preserve.
   - Avoid generic compliments that could apply to any business.

6. Improvement opportunities
   - Each major issue must include the triad: observed evidence, business impact, recommended fix.
   - Explain how each issue affects trust, search visibility, conversion, lead quality, booking/contact friction, or the relevant customer action.

7. Competitive landscape and positioning gaps
   - Include when competitor evidence exists.
   - Identify actual competitors or document why the competitor set is industry/national/search-based.
   - Separate actual competitors from SEO-only/search/directory competitors when both exist.
   - Explain what competitors do better and what the client can credibly win on.

8. Recommended action plan
   - Prioritize a practical sequence of fixes.
   - Each action item must be concrete enough to execute.

9. Quick wins
   - Include near-term changes grounded in the audit.
   - Avoid generic items unless tied to observed evidence.

10. Longer-term SEO/content recommendations
    - Tie recommendations to the client business/category.
    - Include service/product/resource/content clusters when useful.

11. Website refresh/rebuild opportunity
    - Explain what to preserve, what to improve, and what proof/modules the improved site should include.

12. Evidence reviewed
    - List direct evidence sources and important limitations.
    - Include homepage, robots/sitemap, page inventory, representative findings, competitor notes, screenshots/assets, or other evidence actually reviewed.

13. Footer / disclaimer
    - Include a brief evidence/verification note when relevant.

## Objective and subjective quality gates before returning

Do not use word count as the primary quality metric. Use section completeness, evidence coverage, specificity, usefulness, and client-readiness.

Objective gates:

- All required template placeholders are replaced; no `{{PLACEHOLDER}}` tokens remain.
- HTML exists and contains embedded CSS in a `<style>` block.
- The report does not depend on an external stylesheet for basic rendering.
- PDF exists and is a real rendered PDF when requested.
- Report includes the recommended section structure or a clearly equivalent structure.
- Every major issue/opportunity includes observed evidence, business impact, and recommended fix.
- Scorecard items include rationale.
- Evidence reviewed includes direct evidence and limitations.
- Competitor material appears in the report body when competitor evidence exists.
- AI-search/LLM readiness appears when website facts/content structure were inspected.
- Report contains no unresolved internal notes or sales/process terms.

Subjective gates:

- The report feels like a client-facing deliverable, not an internal memo or checklist.
- A business owner can understand what is wrong, why it matters, and what to do next.
- Recommendations are specific to this business/category and not interchangeable with another site.
- The report is persuasive but evidence-safe.
- The report feels comparable in usefulness and polish to accepted Marketing Agency client-facing report examples.
- If a first draft is thin, generic, missing section substance, or not comparable to the quality bar, revise it before returning.

It is acceptable and expected to iterate multiple times until both objective and subjective quality pass.

## Failure examples

Do not return a report that:

- merely contains the required headings;
- has unexplained scorecard grades;
- says "add trust signals" without naming the observed trust/proof gap and proposed proof modules;
- says "improve CTAs" without explaining the current conversion path and recommended replacement;
- omits competitor positioning when competitor evidence exists;
- omits AI-search readiness when website facts/content structure were inspected;
- omits evidence reviewed;
- is visually styled but editorially shallow;
- is generic enough to reuse for another client.

## Output files
Create:

- `client-name-client-report.html`
- `client-name-client-report.pdf` when PDF output is requested

Use a stable folder name such as:

- `artifacts/<client-slug>-polished-report/`

## Critical style rules

- This is client-facing. Do not include internal sales language.
- Before filling the template, replace the default template palette with the selected client color scheme so the report visually reflects the prospect's current site or approved demo concept.
- Keep the report and proposal deck on the same palette unless the user explicitly requests separate branding.
- Do not include phrases like: lead quality, prospect, buyer pain, sales note, sales positioning, demo offer, sales deck, salesman, internal, task plan, or Website Growth Demo conversation.
- Do not make unverified claims about revenue, traffic, rankings, reviews, certifications, compliance, clinical outcomes, or business performance.
- Preserve evidence wording. Say "inspected pages did not show..." rather than "you do not have..." when evidence is limited to inspected HTML.
- Explain issues in terms of customer impact: calls, trust, local visibility, refills, transfers, appointment/contact friction, request/demo friction, and mobile usability.
- Keep language practical and small-business friendly.

## Template substitution guidance

Replace these key placeholders:

- `{{CLIENT_NAME}}` - business name.
- `{{REPORT_SUBTITLE}}` - concise description of the report focus.
- `{{WEBSITE_DOMAIN}}` - display domain, not necessarily full URL.
- `{{BUSINESS_TYPE}}` - e.g., "Independent local pharmacy" or "Remote patient monitoring technology."
- `{{PRIMARY_OUTCOME}}` - e.g., "More calls, refills, transfers, and local visibility" or "More qualified provider demo conversations."
- `{{EXECUTIVE_SUMMARY_HEADLINE}}` - client-safe headline.
- `{{EXECUTIVE_SUMMARY_PARAGRAPH}}` - 1-2 paragraphs grounded in evidence.
- `{{MAIN_OPPORTUNITY}}` - one concise callout.
- `{{MAIN_OPPORTUNITY_EXPLANATION}}` - explain why it matters.
- `{{SCORECARD_COLUMNS_HTML}}` - score rows/cards with rationale.
- `{{LLM_INFORMATION_QUALITY_HTML}}` - client-safe explanation of how effectively the site exposes clear, accurate business facts for LLMs/AI search and why that matters.
- `{{STRENGTH_CARDS_HTML}}` - six or fewer evidence-backed strength cards.
- `{{OPPORTUNITY_CARDS_HTML}}` - six or fewer issue/opportunity cards with evidence, impact, and fix.
- `{{ACTION_PLAN_CARDS_HTML}}` - numbered/prioritized action cards.
- `{{COMPETITOR_ANALYSIS_HTML}}` - concise client-safe competitor summary/table when the template or report variant includes a competitor section.
- `{{QUICK_WIN_BADGES_HTML}}` - badges or cards.
- `{{LONG_TERM_RECOMMENDATIONS_HTML}}` - two-column or card-based recommendations.
- `{{REFRESH_CARDS_HTML}}` - optional website refresh/rebuild opportunity cards.
- `{{EVIDENCE_LIST_ITEMS}}` - list items citing direct evidence.
- `{{FOOTER_NOTE}}` - include compliance/review note when relevant.

## Recommended section structure

1. Cover page
2. Executive summary
3. Quick scorecard
4. LLM information quality / AI-search readiness
5. Current strengths
6. Improvement opportunities
7. Competitive landscape and positioning gaps
8. Recommended action plan
9. Quick wins
10. Longer-term SEO/content recommendations
11. Website refresh opportunity
12. Evidence reviewed
13. Footer / disclaimer

## HTML/CSS requirements

- Inline all CSS in the HTML using a `<style>` tag.
- Do not rely on external CSS files in session artifact viewers; they may not load.
- If images are used, prefer local artifact images. Download remote source images when appropriate and rewrite paths to local `assets/` paths.
- Keep print CSS in the template:
  - `@page { size: letter; margin: .35in }`
  - avoid breaking important sections across pages using `break-inside: avoid`.

## PDF export
Use local Chrome headless when available and verify the result is a real PDF, not a renamed placeholder.

## Validation checklist
Before final response, verify:

- HTML file exists and has non-trivial content.
- PDF file exists and has non-trivial content when requested.
- HTML contains `<style>` and does not depend on an external stylesheet.
- Client-facing report does not contain internal/sales terms.
- Evidence section includes only verified evidence and limitations.
- Competitor section distinguishes inspected actual competitors from SEO-only/lead-generation search competitors when both are mentioned.
- LLM information quality section explains business impact without making unsupported claims that any specific AI assistant will recommend the business.
- Any recommendations requiring business confirmation are phrased conditionally, e.g. "if accurate" or "when available."
- Objective and subjective quality gates pass.

Suggested internal-language scan terms:

- `lead quality`
- `sales note`
- `sales positioning`
- `salesman`
- `prospect`
- `demo offer`
- `buyer pain`
- `task plan`
- `internal`
- `Website Growth Demo conversation`

## Workflow

### Step 1: Resolve the Client Report Brief and Evidence Inventory

#### Inputs

- The completed website audit, acceptance matrix or matrix-like saved findings, screenshots, competitor findings, direct evidence, and prior artifacts available in the bound Buffaly session.
- The client identity, website URL and display domain, business category, approved or site-derived color palette, requested output formats, and controlled Workbench deliverable folder.

#### Instructions

- Read the complete client-facing report contract in this prompt before producing any report content; treat it as authoritative for all eight steps.
- Resolve the canonical client identity, report audience, primary outcome, requested HTML/PDF deliverables, output folder, and selected palette without inventing missing facts.
- Inventory the direct audit evidence and map every applicable row from Required matrix-driven report coverage to a supported strength, issue/opportunity, scorecard rationale, action, long-term recommendation, or evidence item.
- Identify missing, weak, conflicting, or unverified evidence. Gather more evidence when safe and available; otherwise record an internal limitation and define client-safe conditional wording.
- Separate actual competitors from SEO-only, directory, lead-generation, industry, or national comparison sources.

#### Outputs

- `reportBrief`: Canonical client identity, website/domain, business category, audience, primary outcome, selected palette, requested formats, and controlled deliverable folder.
- `reportEvidenceInventory`: Direct evidence sources, artifact paths, screenshots/assets, competitor classifications, and important limitations.
- `reportCoverageMatrix`: Every applicable audit matrix area mapped to its intended report representation, with unsupported or unverified rows explicitly identified.

#### Acceptance Criteria

- The brief identifies the correct client and website and does not infer unsupported business facts.
- The evidence inventory references concrete available sources and distinguishes observed evidence from limitations or facts requiring confirmation.
- Every relevant audit matrix row is mapped or explicitly marked for evidence gathering/conditional treatment; none is silently dropped.
- Competitor evidence is classified correctly and the controlled deliverable folder is known before report artifacts are created.

### Step 2: Build the Evidence-Safe Scorecard and Findings Model

#### Inputs

- Step 1 `reportBrief`, `reportEvidenceInventory`, and `reportCoverageMatrix`.
- The complete scorecard, section-quality, claim-safety, and matrix-driven requirements in this prompt.

#### Instructions

- Build the report's evidence model before drafting prose: scorecard categories and rationale, current strengths, improvement opportunities, AI Search and LLM Readiness analysis, competitor positioning, and evidence-reviewed content.
- For every major issue/opportunity, preserve the required triad of observed evidence, business impact, and recommended fix.
- Keep scores and grades proportional to inspected evidence and include rationale; do not create unexplained labels or false precision.
- Apply the claim-safety rules in this prompt, including inspected-page qualifiers, conditional wording, measured-versus-unmeasured distinctions, and prohibitions on unsupported rankings, traffic, reviews, certifications, compliance, outcomes, or performance claims.
- Ensure AI/LLM analysis explains answerable business facts and content structure without promising recommendation or ranking by any AI system.

#### Outputs

- `scorecardModel`: Evidence-backed categories, scores/grades, and concise rationale for each item.
- `findingsModel`: Structured strengths and opportunities with evidence, business impact, recommended fix, priority, and matrix provenance.
- `positioningAndAiModel`: Client-safe competitor positioning plus the required AI Search and LLM Readiness analysis.
- `claimSafetyLedger`: Claims, qualifiers, limitations, conditional language, and excluded unsupported assertions to govern later drafting.

#### Acceptance Criteria

- Every score has evidence-linked rationale and every major opportunity contains evidence, impact, and fix.
- Strengths and recommendations are specific to this client rather than interchangeable with another business.
- AI/LLM and competitor content obeys the evidence and classification limits established in Step 1.
- The models collectively cover every applicable item in `reportCoverageMatrix` without unsupported claims.

### Step 3: Compose the Complete Client-Facing Content

#### Inputs

- Steps 1-2 outputs, including the report brief, evidence inventory, coverage matrix, findings models, and claim-safety ledger.
- The Required section representation and quality, Recommended section structure, template substitution guidance, critical style rules, and failure examples in this prompt.

#### Instructions

- Draft substantive client-facing content for every applicable required section: cover/client context, executive summary and main opportunity, scorecard, visible AI Search and LLM Readiness, strengths, opportunities, competitive landscape, prioritized action plan, quick wins, longer-term SEO/content recommendations, refresh/rebuild opportunity, evidence reviewed, and footer/disclaimer.
- Explain findings in practical business-owner language tied to trust, visibility, conversion, calls, booking/contact friction, demos/requests, refills/transfers, or the category-specific customer action.
- Create a concrete prioritized sequence of fixes and distinguish near-term quick wins from longer-term recommendations.
- Preserve what is working, explain what should improve, and identify proof/content/modules an improved site should include.
- Exclude internal sales/process language and internal evidence notes from client-facing prose while retaining safe limitations in appropriate evidence/disclaimer language.

#### Outputs

- `clientReportContent`: Complete section-by-section client-facing copy ready for template assembly.
- `prioritizedActionPlan`: Concrete ordered actions, responsible outcome, rationale, quick-win designation, and longer-term grouping.
- `templateContentMap`: Final client-specific values for every applicable template placeholder and section component.

#### Acceptance Criteria

- Every applicable required section contains useful judgment, evidence, business impact, and practical next steps rather than headings alone.
- The executive summary, scorecard, AI/LLM section, strengths, opportunities, positioning, action plan, quick wins, and evidence reviewed are complete and mutually consistent.
- The content is constructive, persuasive, specific, small-business friendly, and safe to send to the client.
- No client-facing copy contains unsupported claims, raw internal notes, or prohibited sales/process language.

### Step 4: Prepare the Branded Report Template and Visual System

#### Inputs

- Steps 1-3 outputs, especially `reportBrief`, `reportEvidenceInventory`, `clientReportContent`, and `templateContentMap`.
- The reusable template, reference implementation standard, HTML/CSS requirements, and approved or site-derived client palette defined in this prompt.

#### Instructions

- Copy the reusable report template into the controlled deliverable folder when available; otherwise reproduce its full report structure and quality standard rather than using a minimal article shell.
- Replace the default palette with the approved or site-derived client colors and define a coherent visual system for typography, spacing, cover/hero, metadata, scorecards, cards/panels, action plan, evidence, footer, and print layout.
- Prepare local artifact images/assets when used, downloading eligible remote images and rewriting references to controlled local `assets/` paths.
- Preserve substantial embedded CSS, letter-size print CSS, and `break-inside: avoid` behavior for important report sections.
- Map every applicable content component to the template and identify any unresolved placeholder before HTML assembly.

#### Outputs

- `preparedReportTemplate`: Concrete path to the copied or reconstructed HTML template under the controlled deliverable folder.
- `visualDesignSpecification`: Client palette, typography, components, spacing, responsive behavior, and print-layout decisions.
- `reportAssetManifest`: Local image/font/supporting asset paths, provenance, and intended report use.
- `templateAssemblyMap`: Verified mapping from Step 3 content to all applicable template placeholders and report sections.

#### Acceptance Criteria

- The prepared template has report-grade visual structure comparable to accepted Marketing Agency examples, not a memo or minimal HTML shell.
- The client palette and visual system are coherent, legible, professional, and appropriate for screen and print.
- Basic presentation does not depend on an external stylesheet, and referenced report assets are controlled and resolvable.
- Every applicable template placeholder/section has a mapped value or an explicit correction required before Step 5.

### Step 5: Build and Inspect the Standalone HTML Report

#### Inputs

- Steps 1-4 outputs, including the complete content, evidence limits, prepared template, visual specification, asset manifest, and assembly map.
- The complete HTML/CSS, output-file, style, section, and artifact requirements in this prompt.

#### Instructions

- Assemble `client-name-client-report.html` under the stable controlled deliverable folder, filling every applicable placeholder with the approved client-specific content.
- Embed substantial CSS in a `<style>` block and implement the cover/hero, metadata, scorecard, visible AI Search and LLM Readiness section, strengths, opportunities, competitor positioning when available, action plan, quick wins, longer-term recommendations, refresh opportunity, evidence, and footer/disclaimer.
- Use only controlled local assets for report-critical images and ensure the HTML remains useful when opened as a standalone artifact.
- Inspect the rendered HTML for hierarchy, clipping, overflow, contrast, spacing, empty sections, broken assets, generic/shallow prose, and client-readiness; revise the artifact rather than merely documenting visible defects.
- Scan for unresolved `{{PLACEHOLDER}}` tokens, unsupported claims, prohibited internal/sales terms, and inconsistencies with the claim-safety ledger.

#### Outputs

- `clientFacingHtmlReport`: Concrete path to the complete styled standalone HTML report under the controlled deliverable folder.
- `htmlInspectionReport`: Render/visual inspection results, corrections made, and confirmation of section and asset integrity.
- `htmlSafetyScan`: Placeholder, internal-language, unsupported-claim, and broken-reference scan results.

#### Acceptance Criteria

- The HTML exists, has non-trivial client-specific content, contains substantial embedded CSS, and does not rely on an external stylesheet for basic presentation.
- Every applicable required section is visible, substantive, and consistent with Steps 1-4; AI Search and LLM Readiness is explicitly titled and explained.
- No unresolved placeholders, broken critical assets, unsupported claims, prohibited internal/sales language, or uncorrected material visual defects remain.
- The rendered artifact feels like a polished Feeding Frenzy by Buffaly client deliverable and is ready for PDF rendering and formal QA.

### Step 6: Render and Verify the PDF Deliverable

#### Inputs

- Step 5 `clientFacingHtmlReport`, `htmlInspectionReport`, and `htmlSafetyScan`.
- Step 1 requested output formats and the PDF export requirements in this prompt.

#### Instructions

- When PDF is requested or the report is part of a sales-packet workflow, render `client-name-client-report.pdf` from the accepted HTML using local Chrome headless or another proven renderer.
- Verify the output is a real readable PDF rather than a renamed placeholder, and inspect representative pages for clipping, overflow, awkward page breaks, missing backgrounds/assets, unreadable text, and orphaned headings.
- Correct HTML/print CSS and rerender when defects are found; do not accept a known-bad PDF.
- When PDF is genuinely outside the requested contract, record an explicit not-requested status rather than fabricating a path.
- If rendering is required but blocked, return the exact blocker and remediation needed; do not silently continue as though PDF passed.

#### Outputs

- `clientFacingPdfReport`: Concrete verified PDF path when required, or an explicit not-requested status when PDF is outside the contract.
- `pdfVerificationReport`: Renderer used, file/signature/readability checks, representative-page inspection, defects found, and corrections completed.
- `pdfRenderingBlocker`: Empty when successful/not requested, otherwise the exact required-rendering blocker and remediation.

#### Acceptance Criteria

- A real readable PDF exists in the controlled deliverable folder whenever requested or required by a sales-packet workflow.
- Required PDF output has no known material clipping, overflow, missing critical assets, unreadable content, or unacceptable page breaks.
- The PDF faithfully represents the accepted HTML's content, client palette, visual hierarchy, and evidence-safe wording.
- Any required-rendering failure is explicit and actionable and cannot be mistaken for successful completion.

### Step 7: Run Objective and Subjective Report QA and Revise

#### Inputs

- Steps 1-6 outputs, including the coverage matrix, claim-safety ledger, final HTML, PDF status/artifact, and visual inspection reports.
- Every objective gate, subjective gate, failure example, validation-checklist item, and internal-language scan term in this prompt.

#### Instructions

- Audit the report artifacts against every applicable matrix row, required section, placeholder, evidence, scorecard, AI/LLM, competitor, action-plan, quick-win, long-term, refresh, evidence-reviewed, style, artifact, and claim-safety requirement.
- Evaluate subjective quality: usefulness to a business owner, specificity, clarity, constructive persuasion, evidence safety, visual polish, and comparability to accepted Marketing Agency client-facing examples.
- Scan the complete client-facing artifacts for prohibited internal/sales language and unsupported claims, reviewing context rather than blindly accepting or rejecting substrings.
- Revise the HTML and rerender/reverify the PDF as necessary until all objective and subjective gates pass; a QA document that merely lists defects is not completion.
- If a true blocker prevents correction, identify the exact failed gate, affected artifact/section, evidence, and remediation.

#### Outputs

- `qualityAssuranceReport`: Gate-by-gate objective and subjective results with evidence and corrections made.
- `revisedClientFacingHtmlReport`: Concrete path to the post-QA HTML artifact.
- `revisedClientFacingPdfReport`: Concrete path to the post-QA verified PDF when required, or explicit not-requested status.
- `remainingQualityBlockers`: Empty when all gates pass; otherwise exact blockers and remediation.

#### Acceptance Criteria

- Every applicable objective and subjective quality gate in this prompt passes, or one explicit actionable blocker prevents acceptance.
- The post-QA artifacts remain complete, client-specific, evidence-based, visually polished, and free of unresolved placeholders and internal process language.
- All material defects discovered during QA are corrected in the actual artifacts and, when applicable, the PDF is rerendered and reverified.
- The QA report provides enough evidence to independently understand why the artifacts pass or exactly why they remain blocked.

### Step 8: Execute Owned Validation and Package Final Deliverables

#### Inputs

- Steps 1-7 outputs, especially the post-QA HTML/PDF artifacts, evidence inventory, coverage matrix, claim-safety ledger, and quality-assurance report.
- The corresponding `ValidatedPromptAction` validation contract and the final-response requirements in this prompt.

#### Instructions

- Run the owned validation contract against the actual final artifacts and complete evidence context; validation is additive and must enforce the full work specification rather than replace it with a shorter checklist.
- When validation fails, apply specific feedback to the actual HTML/content/assets, rerender and reinspect the PDF when required, update QA evidence, and validate again within the allowed attempt contract.
- Confirm final paths, file existence, expected formats, client identity, evidence provenance, section completeness, visual quality, internal-language safety, and required PDF status.
- Package the accepted artifacts and concise evidence/validation summary under the controlled deliverable folder.
- Return success only after objective, subjective, and owned validation pass; otherwise return one explicit blocker with the exact remediation needed.

#### Outputs

- `finalClientFacingHtmlReport`: Concrete path to the validated complete styled standalone HTML report.
- `finalClientFacingPdfReport`: Concrete path to the validated rendered PDF when required, or explicit not-requested status.
- `reportEvidenceSummary`: Concise summary of reused audit evidence, client-safe limitations, matrix coverage, and artifact provenance.
- `ownedValidationResult`: Final validation status, attempts, corrections, and evidence that all required checks passed or the exact blocker.
- `finalDeliverableManifest`: Client identity, artifact paths, formats, file verification, and controlled deliverable folder.

#### Acceptance Criteria

- The owned validation contract passes against the final artifacts after all required corrections, or completion is explicitly blocked with actionable remediation.
- The final HTML is polished, client-deliverable, business-specific, evidence-based, substantially styled, and contains every applicable required section from this prompt.
- The final PDF exists and is a verified rendered PDF whenever requested or required by a sales-packet workflow.
- Final artifacts contain no unresolved placeholders, unsupported claims, broken critical references, or prohibited internal sales/process language.
- The final manifest and evidence summary point to concrete reviewable artifacts and accurately describe limitations and validation status.

## Final response
Return concise paths to the HTML and PDF and mention that the report is client-facing and checked for internal/sales language only after the report has passed objective and subjective validation or has failed with explicit blockers.


