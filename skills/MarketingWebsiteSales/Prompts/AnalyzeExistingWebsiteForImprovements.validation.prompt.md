# Validate Existing Website Improvement Audit

Validate that the work result completed the existing-website improvement audit with enough evidence and judgment to be used for sales or client-facing planning.

Use the concrete objective and subjective checks below. When failing, name the exact missing evidence, weak section, or quality issue and explain what the next attempt must add or correct. The validated prompt runner owns the response format; this prompt defines validation criteria only.

## Required artifact / evidence checks

Fail if any required item is missing, only asserted, or not tied to evidence:

- Names the website URL and business/market context analyzed, or explains what could not be resolved.
- Shows homepage inspection evidence, including title/meta/H1 or first-screen positioning when available.
- Checks `robots.txt` and `sitemap.xml`, or marks each as `Not verified` with a reason.
- Lists important discovered pages or explains why page discovery was limited.
- Inspects representative pages, not just the homepage.
- Grounds findings in inspected URLs, page text, observed screenshots, public profiles, source artifacts, or other named evidence.
- Avoids unsupported claims about ratings, ownership, years in business, licenses, response times, rankings, traffic, revenue, compliance, certifications, or performance.

## Required section representation

Fail if the audit does not include all relevant sections, or if a section is present only as a thin heading:

- Executive summary.
- Quick scorecard derived from the audit matrix.
- What is working well.
- Main issues and opportunities.
- Clearly labeled `AI Search and LLM Readiness` or equivalent section that visibly includes AI and LLM language.
- Competitor analysis or explicit competitor-evidence limitation.
- High-priority action plan.
- Quick wins.
- Longer-term SEO/content recommendations.
- Demo/rebuild opportunity summary when the audit is for sales/demo planning.
- Lead-quality or sales notes only when the output is for internal prospecting; omit from client-facing output.
- Evidence reviewed and limitations.

## Audit matrix coverage gate

Validate that the audit covers each relevant matrix row from the work prompt or explicitly marks it `Not verified` with a useful reason:

- Homepage metadata and first-screen positioning.
- Local SEO and NAP/contact/service-area clarity when applicable.
- Technical crawlability, including robots/sitemap/page status when available.
- Page inventory and important page types.
- Service/product/category keyword coverage.
- Content quality and differentiation.
- Conversion path and CTA clarity.
- Trust and E-E-A-T proof signals.
- Reviews/social proof/case studies when inspected, or safe absence/opportunity wording.
- Accessibility/media/image alt text when inspected.
- AI Search and LLM Readiness: clear business facts, services/products, locations/markets, FAQs, schema, proof, contact/hours, and answerability without ranking promises.
- Competitor landscape, separating actual business competitors from search/directory/lead-generation competitors when both appear.
- Competitor page gaps: services/products, CTAs, trust/proof, local/category positioning, SEO structure, and visible weaknesses.
- Performance/template risk only if observed/measured, otherwise marked as not measured.
- Quick wins and prioritization.

Fail if relevant checked areas are converted into vague advice or ignored.

## Required issue quality

Fail if major issues are generic or incomplete. Each major issue should include:

- Observed evidence: what was seen, where, and from which page/source.
- Business impact: how it affects leads, trust, search visibility, local/category relevance, conversion, calls/forms/bookings/requests, or AI/LLM answerability.
- Recommended fix: a concrete change the business or website team can understand.

Examples that should fail:

- "Improve SEO" without naming the title/meta/page/content issue.
- "Add trust signals" without identifying what proof was missing and what proof module should be added.
- "Improve CTAs" without explaining the current path and recommended replacement.
- "Add AI content" without explaining what facts/questions/schema/proof are missing for AI Search and LLM Readiness.

## Objective quality checks

Use these as safeguards, not as the only definition of quality:

- Scorecard categories have rationale, not just grades.
- Findings include multiple client/category-specific facts.
- Recommendations are specific enough to execute or brief a website team.
- Competitor section names the competitor set used or explains why competitor evidence was limited.
- AI Search and LLM Readiness section is visible, substantive, and includes specific missing/weak facts plus recommendations.
- Evidence reviewed/limitations section names the inspected evidence and gaps.
- The audit distinguishes client-facing findings from internal sales notes when applicable.

Do not use word count as the primary metric. A long generic audit fails; a concise audit can pass only if every relevant section is evidence-backed, specific, and useful.

## Subjective quality checks

Fail if the output is technically present but not useful:

- The audit must be specific enough for a sales conversation or client planning, not generic website advice.
- A reader can understand what is wrong, why it matters, and what to do next.
- Recommendations explain business impact on leads, trust, local/category visibility, conversion, or AI Search and LLM Readiness.
- Competitor positioning identifies practical ways the prospect can win, or clearly documents why competitor evidence is limited.
- Tone is safe, professional, evidence-backed, and appropriate for the requested audience.
- The output is actionable for deciding whether a demo/rebuild opportunity exists.

## Validation response guidance

Use the general response format injected by the validated prompt runner. This validation prompt does not own or restate that schema.

For failures, the retry feedback must be detailed enough for the next work attempt to fix the audit without guessing.

## Artifact failure rule

Fail validation if the work result only returns inline audit text and does not name saved artifact path(s). Fail if evidence/source notes are missing as a durable artifact or explicit saved section. Fail if findings are invented, generic, unsupported, or missing saved evidence artifacts.

