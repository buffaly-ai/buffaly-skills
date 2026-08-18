# Analyze Existing Website For Improvements

> VALIDATED PROMPT ACTION ONLY
>
> Do not run this markdown file directly as ordinary prompt guidance.
> This prompt must be executed through the corresponding ProtoScript `ValidatedPromptAction` so the validation prompt runs after the work turn.
> If you are an agent, call the action/tool instead of loading this file directly.

## Purpose and Overview

Use this prompt skill when the user wants to audit an existing small-business website for practical website, SEO, local SEO, AI-search/LLM information quality, trust, and conversion improvements. This workflow is based on the Insurance Site session pattern.

### Overview

Produce an evidence-backed, client-ready website opportunity audit that identifies what is working, what is likely costing the business leads, how the site compares against actual local and surrounding-market competitors, and what should be improved first.

The workflow resolves and verifies the audit target, captures durable first-party website evidence, inventories and samples representative pages, completes a reusable audit matrix, compares the prospect with evidence-backed competitors, prioritizes improvements, assembles durable artifacts, and performs a final completeness check. The work prompt must stand on its own: do not rely on a separate validation prompt to supply missing research, output, evidence, or quality requirements.

## Inputs

Resolve the following inputs before the audit is assembled:

- Website URL.
- Business name, if known.
- Industry or service category, if known.
- Target city, region, or service area, if known.
- Output audience: internal lead qualification, client delivery, or sales outreach.
- Competitor-analysis mode: actual business competitors, search-result competitors, or both. Default to actual business competitors first and separate SEO-only/directory/lead-generation sites when they appear.

The user may supply only a URL or partial business identity. Inspect the public site and safe public signals before asking for missing facts. Never silently infer a required identity fact when the evidence is ambiguous.

## Outputs

Produce one repeatable website-audit report package in the absolute final-deliverable root supplied by the Workbench step instruction. That injected root is authoritative; do not substitute a repository-relative, legacy WorkflowWorkbench, business-named, or timestamped folder.

Create or replace these exact files on every run:

| Artifact key | Exact filename | Purpose |
|---|---|---|
| `primary-report-markdown` | `website-opportunity-audit.md` | Canonical editable client-facing report. |
| `primary-report-html` | `website-opportunity-audit.html` | Primary rendered report for direct review in the workflow harness. |
| `evidence-source-notes` | `evidence-source-notes.md` | Inspected URLs, public signals, samples, competitor sources, limitations, and `Not verified` items. |
| `audit-matrix` | `audit-matrix.json` | Reusable evidence-backed matrix with every applicable row. |
| `artifact-manifest` | `artifact-manifest.json` | Canonical identity, artifact keys, filenames, media types, producer steps, and paths. |
| `completion-validation` | `completion-validation.json` | Step 8's deterministic final checks and overall status. |

The overall output is the report itself, not a list of file paths. `website-opportunity-audit.html` is the primary visible deliverable and `website-opportunity-audit.md` is its canonical source. The report must include the evidence-backed improvement decision: incremental improvement, substantial rebuild, demo opportunity, or insufficient evidence. Supporting files exist to prove and reuse the report.

### Report Content Contract

The canonical Markdown report and its rendered HTML counterpart must contain these substantive sections in this order:

1. Executive summary.
2. Quick scorecard.
3. What is working well.
4. Main issues and opportunities.
5. AI Search and LLM Readiness: how well the site exposes trustworthy business facts for AI assistants/search systems and why it matters.
6. Competitor analysis: top actual competitors, what they do better or worse based on inspected evidence, and where the prospect can credibly win.
7. High-priority action plan.
8. Quick wins.
9. Longer-term SEO/content recommendations.
10. Demo/rebuild opportunity summary.
11. Lead-quality or sales notes when the audience mode is internal prospecting; omit this section from client-facing delivery.
12. Evidence reviewed and artifact/source-note references.

### Style and Presentation Contract

- Be specific, practical, and business-focused.
- Explain how each major issue affects leads, trust, local visibility, or conversion using `observed evidence -> business impact -> recommended fix`.
- Prioritize fixes a small business can understand and explain necessary jargon simply.
- Do not make unsupported claims about ownership, years in business, ratings, licenses, compliance, rankings, performance, market share, or response times.
- Format the client-ready artifact for a salesperson or prospect without exposing internal deliberation or sales-rep language.
- Use clear headings, short paragraphs, scannable bullets, and semantic HTML tables or scorecards where useful.
- Keep source notes and uncertainty explicit, but phrase client-facing limitations safely and professionally.

The reusable pattern is: audit the prospect's public website; find revenue, SEO, AI-search/LLM information-quality, trust, conversion, and competitive-positioning problems; create a prioritized improvement plan; and determine whether a demo website makeover would help close the client. The saved matrix, report, manifest, identity, audit date, and evidence paths must allow a downstream workflow to determine whether the audit can be safely reused without re-synthesizing it from memory.

### Audit Category and Matrix Specification

Use these categories when relevant:

- Local SEO foundation
- Technical crawlability
- Service keyword coverage
- Content quality and differentiation
- Conversion optimization
- Trust and E-E-A-T signals
- Reviews and social proof
- Phone/NAP consistency
- Service-area/city page quality
- Blog/resource strategy
- Image alt text and media quality
- Performance/template bloat risk
- Brand positioning
- Competitive positioning
- Competitor SEO/service-page gaps
- LLM information quality and AI-search readiness

## Acceptance Criteria

The workflow is complete only when all of the following are true:

- The canonical business identity, official website URL, market/location, audience mode, competitor mode, and audit date are recorded or explicitly unresolved with reasons.
- The homepage, `robots.txt`, `sitemap.xml`, important discovered pages, and representative pages were inspected or individually marked `Not verified` with a useful reason.
- Every applicable audit-matrix row contains evidence, a finding, business impact, a recommended fix, and a score/status rationale; unavailable checks are marked `Not verified` rather than omitted or invented.
- Competitor findings identify the actual set inspected, separate true business competitors from directories/search/lead-generation entities, and avoid unsupported ranking, traffic, review, or performance claims.
- Major findings are business/category-specific and use the contract `observed evidence -> business impact -> recommended fix`.
- The scorecard, report, decision, and downstream-ready findings are derived from the saved matrix and evidence rather than re-synthesized from memory.
- Internal lead-quality or sales notes are kept out of client-facing output.
- Required artifacts are saved under the session `artifacts` folder, their paths are reported, and the audit does not exist only as inline chat text.
- All six exact overall-output files exist in the deterministic deliverables folder; the HTML report uses semantic HTML headings, paragraphs, lists, and tables, renders successfully, contains no visible Markdown heading/table syntax, and materially agrees with the Markdown report.
- `artifact-manifest.json` identifies `website-opportunity-audit.html` as the primary visible deliverable and `website-opportunity-audit.md` as its canonical source.
- A downstream workflow can determine whether the audit is reusable by checking business identity, URL, location/market, audit date, and evidence paths.

## Workflow

### Step 1: Resolve and Verify the Audit Target

#### Inputs

- Required workflow inputs and confirmed values.

#### Instructions

Resolve the website URL, business identity, industry/category, target market or service area, output audience, and competitor-analysis mode. Confirm that the website is the business's official site by comparing available name, address, phone, branding, services, and other public identity evidence. Record rejected or ambiguous candidate domains rather than silently using them.

#### Outputs

- Canonical audit identity: business name, official URL, location/market, category, audience mode, competitor mode, and audit date.
- Identity evidence and candidate-domain decision notes.
- An unresolved-input list with reasons and the evidence needed to resolve each item.

#### Acceptance Criteria

- The official website is confirmed from matching public identity evidence or the run is explicitly blocked/limited because it cannot be confirmed.
- Client-facing and internal prospecting modes are distinguished before research findings are assembled.
- Missing or ambiguous identity facts are not invented.
- The canonical identity is specific enough for downstream workflows to test safe audit reuse.

### Step 2: Capture Homepage and Crawlability Evidence

#### Inputs

- Step 1 canonical target identity and unresolved limitations.

#### Instructions

Fetch or inspect the homepage. Capture the title, meta description, canonical when visible, H1, primary first-screen positioning, navigation, primary calls to action, visible business facts, and contact/NAP signals. Check `robots.txt` and `sitemap.xml` when available, and record homepage and important-page status/crawlability signals that can be directly observed.

#### Outputs

- Homepage evidence record with inspected URL and captured metadata/content observations.
- `robots.txt` and `sitemap.xml` results.
- Initial internal-link/page discoveries and crawlability limitations.
- Saved source notes, extraction references, and screenshots when available and useful.

#### Acceptance Criteria

- Homepage claims are traceable to the inspected official URL.
- `robots.txt` and `sitemap.xml` are each checked or individually marked `Not verified` with a reason.
- Observed status, crawlability, and performance signals are separated from assumptions.
- No performance, ranking, ownership, rating, compliance, or business claim is made without direct evidence.

### Step 3: Build the Page Inventory and Representative Sample

#### Inputs

- Step 2 homepage and crawlability evidence.

#### Instructions

Identify important service, product, location, about, review/testimonial, blog/resource, FAQ, and contact pages. Select and inspect representative pages for titles, meta descriptions, H1s, headings, copy quality, CTAs, local targeting, internal links, schema, trust signals, reviews, phone/NAP consistency, image alt text, mobile/conversion readiness, and the clarity of business facts exposed to search engines, LLMs, and AI assistants.

Look for templated or generic copy, city-name mismatch, placeholder content, inconsistent phone numbers, thin location pages, missing proof, weak quote/contact paths, and observable performance/template bloat.

#### Outputs

- Classified page inventory and important-page-type coverage.
- Representative-page sample with selection rationale and inspected URLs.
- Per-page evidence notes and missing/weak page-type findings.
- Page-discovery and sampling limitations.

#### Acceptance Criteria

- The audit is not based only on the homepage.
- Relevant service, location, about, proof, resource, and contact page types are represented when available.
- Every representative-page observation names the inspected page/source.
- Limited discovery or inaccessible pages are documented rather than silently treated as absent.

### Step 4: Complete the Evidence-Backed Audit Matrix

#### Inputs

- Steps 2-3 saved evidence and page sample; audit specification in Outputs.

#### Instructions

Create and save the reusable acceptance matrix below. Do not complete it only mentally. Fill every applicable row with the current business's evidence during execution. For each row, record status/score, rationale, observed evidence and inspected source, business impact, recommended fix, and confidence or `Not verified` reason. Do not invent missing evidence.

#### Outputs

- Completed audit matrix in reusable Markdown or JSON form.
- Score/status and rationale for every applicable row.
- Traceable evidence references and limitations.
- Major findings expressed as observed evidence, business impact, and recommended fix.

#### Acceptance Criteria

- Every relevant matrix row is completed or marked `Not verified` with a useful reason.
- Scores and grades have evidence-backed rationales.
- Findings remain specific to the current business, category, market, and inspected pages.
- Vague findings such as "improve SEO," "add trust signals," "improve CTAs," or "add AI content" are rejected unless they identify the concrete evidence gap, impact, and fix.
- Observable and measured facts are distinguished from recommendations and assumptions.

#### Required Matrix

| Area | Required checks | Evidence to capture | Audit output requirement |
|---|---|---|---|
| Homepage metadata | Title, meta description, canonical if visible, H1, primary above-the-fold copy | Homepage HTML/extraction and inspected URL | Note strengths, mismatches, missing fields, and customer/search impact. |
| Local SEO and NAP | Business name, address, phone, city, service area, location wording consistency | Homepage, footer, contact/about pages, schema if present | Identify inconsistencies such as city mismatch, phone mismatch, missing address, or unclear service area. |
| Technical crawlability | Homepage status, important page status, robots.txt, sitemap.xml, crawlable navigation | HTTP status checks, robots/sitemap fetches, discovered links | Report crawlability blockers, missing sitemap, broken important pages, or unclear page discovery. |
| Page inventory | Service/product pages, location pages, about page, contact page, review/testimonial page, blog/resource pages | Discovered internal links and sampled page fetches | List important pages found and important page types missing or weak. |
| Service keyword coverage | Priority services/products, dedicated page coverage, local keyword wording, internal links to services | Service page titles, headings, URLs, body samples | Score whether high-intent services have findable, locally relevant pages. |
| Content quality and differentiation | Generic/template copy, placeholder copy, specificity, local proof, customer benefits | Representative page text samples | Identify where copy is clear, generic, thin, duplicated, or not differentiated. |
| Conversion path | Phone/call CTA, contact form, booking/schedule, refill/order/quote/request, transfer/start path, mobile action clarity | Homepage/header/nav/service/contact pages | Explain friction in terms of calls, refills, transfers, appointments, contact, and mobile usability. |
| Trust and E-E-A-T | Ownership/team, credentials, reviews/testimonials, community proof, guarantees, compliance-safe proof | Homepage, about, review/testimonial, footer, social/profile links when available | Note inspected proof signals and proof gaps using evidence-safe wording. |
| Reviews and social proof | Visible testimonials/reviews, ratings snippets, review links, third-party profile signals when inspected | Site pages and public profile/search evidence when available | Do not claim rating/review performance unless directly observed; note if inspected pages did not show social proof. |
| Accessibility and media | Image alt text, meaningful media, obvious missing alt values, video/media quality when visible | Image extraction and representative page samples | Report missing/empty alt text and practical accessibility/media improvements. |
| AI-search / LLM readiness | Clear business facts, services, locations, FAQs, schema, proof, hours/contact, service-area answers | Content/schema inspection and page samples | Score how well AI/search assistants can understand and accurately summarize the business without promising AI rankings. |
| Competitor landscape | Actual local competitors, surrounding-market competitors, search/directory/lead-generation competitors | Public search, directories/maps where accessible, direct competitor pages when possible | Separate actual business competitors from search/directory competitors and avoid unsupported ranking claims. |
| Competitor page gaps | Competitor service pages, CTAs, trust/proof, local positioning, SEO structure, visible weaknesses | Competitor website/directories/screenshots when available | Explain where the client can win on service pages, trust, CTAs, local clarity, and AI-search readiness. |
| Performance/template risk | Obvious bloat, excessive scripts, template look, slow/heavy pages when observable | HTML size, page weight signals, visible template patterns, performance tooling if available | Mention only observable performance/template risks or mark as not measured. |
| Quick wins and prioritization | Small fixes, high-impact improvements, longer-term content/SEO needs | Findings across matrix rows | Prioritize practical next steps a small business can understand. |

The audit scorecard must be derived from this matrix. The client-facing report and proposal deck should reuse the same matrix findings rather than re-synthesizing from memory.

### Step 5: Research and Compare Competitors

#### Inputs

- Step 1 target identity/geography, Step 4 matrix, and competitor scope.

#### Instructions

Identify top actual local competitors and relevant surrounding-market competitors using public evidence, then inspect their websites for SEO structure, service pages, local positioning, trust/proof, CTAs, content depth, answer clarity, and visible weaknesses. Separate actual business competitors from SEO-only, directory, and lead-generation search competitors when they appear.

#### Outputs

- Named competitor set with competitor type, location/market relevance, inspected URLs, and source method.
- Direct competitor-page observations and comparison dimensions.
- Practical opportunities where the prospect can credibly improve or differentiate.
- Competitor-evidence limitations and unverified claims excluded from the comparison.

#### Acceptance Criteria

- The competitor set and evidence sources are named, not implied.
- Actual businesses are separated from directories, search competitors, and lead generators.
- Every comparative claim is tied to inspected public evidence.
- Ranking, traffic, market-share, review-superiority, and performance claims are omitted unless directly verified.
- If adequate competitor evidence cannot be obtained, the limitation is explicit and the audit does not fabricate a comparison.

### Step 6: Synthesize and Prioritize the Opportunity

#### Inputs

- Steps 4-5 saved matrix and competitor evidence.

#### Instructions

Derive the scorecard, strengths, main issues, AI Search and LLM Readiness findings, competitor positioning, quick wins, high-priority actions, longer-term SEO/content recommendations, and demo/rebuild opportunity from the completed matrix and saved evidence.

#### Outputs

- Executive synthesis and matrix-derived scorecard.
- Prioritized strengths, issues, quick wins, and longer-term recommendations.
- Clearly labeled AI Search and LLM Readiness assessment.
- Improvement decision: incremental improvement, substantial rebuild, demo opportunity, or insufficient evidence.
- Internal lead-quality/sales notes only when the audience mode permits them.

#### Acceptance Criteria

- Every major recommendation is traceable to matrix evidence and explains business impact.
- AI/LLM readiness identifies specific strong, weak, or missing facts and concrete improvements without promising AI rankings.
- Recommendations are concrete enough to brief a website team.
- The improvement decision follows from evidence rather than sales preference.
- Internal sales notes are isolated from client-facing material.

### Step 7: Assemble the Durable Audit Package

#### Inputs

- Saved outputs and evidence from Steps 1-6; artifact specifications in Outputs.

#### Instructions

Create or replace the deterministic audit package from the saved results and evidence produced by Steps 1-6. Do not re-research or substitute conversational memory for saved step evidence. Write every output directly under the absolute final-deliverable root supplied in this Workbench step instruction; do not substitute a relative or legacy WorkflowWorkbench folder, and do not create business-named variants, alternate report filenames, or timestamped copies.

The client-ready audit must contain these substantive sections:

1. Executive summary.
2. Quick scorecard.
3. What is working well.
4. Main issues and opportunities.
5. AI Search and LLM Readiness: how well the site exposes trustworthy business facts for AI assistants/search systems and why it matters.
6. Competitor analysis: top actual competitors, what they do better or worse based on inspected evidence, and where the prospect can credibly win.
7. High-priority action plan.
8. Quick wins.
9. Longer-term SEO/content recommendations.
10. Demo/rebuild opportunity summary.
11. Lead-quality or sales notes when the audience mode is internal prospecting; omit this section from client-facing delivery.
12. Evidence reviewed and artifact/source-note references.

Format the audit for a salesperson or prospect without exposing internal deliberation. Use clear headings, short paragraphs, scannable bullets, and tables or scorecards where useful. For each major issue state observed evidence, business impact, and recommended fix. Explain necessary jargon simply, keep uncertainty explicit and professionally phrased, and make no unsupported ownership, tenure, rating, license, compliance, ranking, performance, or response-time claim.

#### Outputs

- `website-opportunity-audit.md`: complete canonical client-facing report.
- `website-opportunity-audit.html`: complete standalone semantic-HTML rendering of the same report, suitable for direct browser review. Convert the Markdown structure into real `<h1>`-`<h3>`, `<p>`, `<ul>`/`<ol>`, and `<table>` elements; do not place raw Markdown in `<body>` with `<br>` substitutions.
- `evidence-source-notes.md`: inspected URLs, public signals, competitor sources, sampled pages, limitations, and every `Not verified` item.
- `audit-matrix.json`: reusable matrix derived from the completed acceptance matrix.
- `artifact-manifest.json`: canonical audit identity plus the exact artifact keys, filenames, media types, producer step keys, and absolute paths under the supplied Workbench final-deliverable root for the five Step 7 outputs and expected Step 8 validation output.

Write `artifact-manifest.json` with this exact contract:

```json
{
  "schemaVersion": "workflow-artifact-manifest/v1",
  "workflowKey": "AnalyzeExistingWebsiteForImprovements",
  "title": "<business name> Website Opportunity Audit",
  "primaryArtifactKey": "primary-report-html",
  "canonicalSourceArtifactKey": "primary-report-markdown",
  "artifacts": [
    {
      "artifactKey": "primary-report-html",
      "fileName": "website-opportunity-audit.html",
      "mediaType": "text/html",
      "createdByStepKey": "assemble-the-durable-audit-package",
      "path": "<absolute path>"
    }
  ]
}
```

The `artifacts` array must contain all six artifact keys from Overall Expected Output with their exact filenames; the completion-validation entry may be marked as expected until Step 8 creates it.

#### Acceptance Criteria

- All five exact Step 7 files exist in the deterministic deliverables folder and no alternate primary-report filename is used.
- The audit contains all 12 required sections above, except that internal sales notes are omitted in client-facing mode.
- The client-facing artifact is readable without internal deliberation or sales-rep language.
- The HTML report is a standalone document with a doctype, UTF-8 declaration, title, and semantic headings, paragraphs, lists, and tables that materially agree with the Markdown report.
- The HTML body does not expose raw Markdown heading markers such as `# ` or `## `, pipe-table delimiter rows such as `|---`, fenced-code markers, or Markdown converted only by replacing newlines with `<br>`.
- The scorecard and report agree with the saved matrix.
- Evidence reviewed, source paths, limitations, and `Not verified` items remain visible.
- Major issues use the contract `observed evidence -> business impact -> recommended fix` and follow the style and claim-safety requirements in this step.
- The audit is not considered complete if it exists only in chat.

### Step 8: Perform the Pre-Handoff Completeness Check

#### Inputs

- Step 7 deterministic package; workflow Acceptance Criteria.

#### Instructions

Before reporting completion, directly inspect the deterministic deliverables folder against every overall workflow acceptance criterion and every Step 7 output/acceptance criterion. Verify files and report content rather than trusting earlier summaries. Correct the exact deterministic files when possible without inventing evidence; otherwise return a truthful blocked or limited result naming exactly what is missing and what a later run must add.

Confirm all of the following:

- Canonical business identity, official URL, market, audience mode, competitor mode, and audit date are recorded or explicitly unresolved.
- Homepage, `robots.txt`, `sitemap.xml`, important discovered pages, and representative pages were inspected or individually marked `Not verified` with reasons.
- Every applicable matrix row has evidence, finding, impact, recommendation, and score/status rationale.
- Actual competitors are separated from directories, search competitors, and lead generators; comparative claims are evidence-backed.
- The report and scorecard derive from the saved matrix and evidence.
- Internal sales notes are absent from client-facing output.
- The client-ready audit, evidence/source notes, matrix/scorecard, and manifest exist at reported paths.
- The exact filenames in Overall Expected Output are used; the HTML report opens as a semantic HTML report, includes real heading and table/list markup, contains no visible raw Markdown syntax, and its substantive content agrees with the Markdown source.
- Every required Step 7 report section is present and substantive.
- Every major issue follows `observed evidence -> business impact -> recommended fix`.
- Every material claim is traceable to evidence; unavailable checks remain `Not verified`.
- A downstream workflow can determine reuse safety from identity, URL, market, audit date, and evidence paths.

#### Outputs

- `completion-validation.json` in the same absolute final-deliverable root supplied by the Workbench step instruction, containing overall status and one result for every confirmation in this step.
- Verified final artifact inventory using the exact artifact keys and filenames from Overall Expected Output.
- Primary report binding identifying `primary-report-html` for rendering and `primary-report-markdown` as canonical source.
- Unverified-items, limitations, audience-separation, claim-safety, and downstream-reuse results.

Write `completion-validation.json` with this exact contract:

```json
{
  "schemaVersion": "workflow-completion-validation/v1",
  "workflowKey": "AnalyzeExistingWebsiteForImprovements",
  "status": "complete|limited|blocked",
  "validatedByStepKey": "perform-the-pre-handoff-completeness-check",
  "primaryArtifactKey": "primary-report-html",
  "canonicalSourceArtifactKey": "primary-report-markdown",
  "checks": [
    {
      "requirement": "<exact requirement checked>",
      "status": "pass|fail|not_verified",
      "evidence": ["<artifact path or direct evidence>"]
    }
  ],
  "limitations": ["<remaining limitation>"]
}
```

Update `artifact-manifest.json` so its `completion-validation` entry contains the actual path before returning the Step 8 result. Return all six deterministic artifact paths in the Step 8 result's `Artifacts` array so the harness can bind the overall report without inferring filenames from prose.

#### Acceptance Criteria

- Every required report section is present and substantive.
- Every major claim is traceable to evidence and every matrix row is represented.
- Required artifacts and reported paths exist.
- `completion-validation.json` exists and records `complete` only when all six deterministic files pass their checks.
- The final result identifies the actual HTML report and Markdown source as openable overall outputs, not merely supporting path strings.
- Internal/client-facing content separation has been checked.
- Missing evidence is reported as unresolved or blocked rather than hidden, generalized, or invented.
- The completion result contains one pass/fail/not-verified entry for every confirmation listed above.
- The workflow is marked complete only when no required check fails; otherwise its status is `limited` or `blocked` with exact remediation.

## Validation

The final numbered step is the deterministic validation gate. Validate the complete package against the workflow Acceptance Criteria and every step Acceptance Criteria. Do not bind or hand off the overall result when any requirement fails.
