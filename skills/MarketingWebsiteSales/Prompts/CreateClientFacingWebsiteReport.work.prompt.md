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
- says “add trust signals” without naming the observed trust/proof gap and proposed proof modules;
- says “improve CTAs” without explaining the current conversion path and recommended replacement;
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
- Preserve evidence wording. Say “inspected pages did not show...” rather than “you do not have...” when evidence is limited to inspected HTML.
- Explain issues in terms of customer impact: calls, trust, local visibility, refills, transfers, appointment/contact friction, request/demo friction, and mobile usability.
- Keep language practical and small-business friendly.

## Template substitution guidance

Replace these key placeholders:

- `{{CLIENT_NAME}}` — business name.
- `{{REPORT_SUBTITLE}}` — concise description of the report focus.
- `{{WEBSITE_DOMAIN}}` — display domain, not necessarily full URL.
- `{{BUSINESS_TYPE}}` — e.g., “Independent local pharmacy” or “Remote patient monitoring technology.”
- `{{PRIMARY_OUTCOME}}` — e.g., “More calls, refills, transfers, and local visibility” or “More qualified provider demo conversations.”
- `{{EXECUTIVE_SUMMARY_HEADLINE}}` — client-safe headline.
- `{{EXECUTIVE_SUMMARY_PARAGRAPH}}` — 1–2 paragraphs grounded in evidence.
- `{{MAIN_OPPORTUNITY}}` — one concise callout.
- `{{MAIN_OPPORTUNITY_EXPLANATION}}` — explain why it matters.
- `{{SCORECARD_COLUMNS_HTML}}` — score rows/cards with rationale.
- `{{LLM_INFORMATION_QUALITY_HTML}}` — client-safe explanation of how effectively the site exposes clear, accurate business facts for LLMs/AI search and why that matters.
- `{{STRENGTH_CARDS_HTML}}` — six or fewer evidence-backed strength cards.
- `{{OPPORTUNITY_CARDS_HTML}}` — six or fewer issue/opportunity cards with evidence, impact, and fix.
- `{{ACTION_PLAN_CARDS_HTML}}` — numbered/prioritized action cards.
- `{{COMPETITOR_ANALYSIS_HTML}}` — concise client-safe competitor summary/table when the template or report variant includes a competitor section.
- `{{QUICK_WIN_BADGES_HTML}}` — badges or cards.
- `{{LONG_TERM_RECOMMENDATIONS_HTML}}` — two-column or card-based recommendations.
- `{{REFRESH_CARDS_HTML}}` — optional website refresh/rebuild opportunity cards.
- `{{EVIDENCE_LIST_ITEMS}}` — list items citing direct evidence.
- `{{FOOTER_NOTE}}` — include compliance/review note when relevant.

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
- Any recommendations requiring business confirmation are phrased conditionally, e.g. “if accurate” or “when available.”
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

## Final response
Return concise paths to the HTML and PDF and mention that the report is client-facing and checked for internal/sales language only after the report has passed objective and subjective validation or has failed with explicit blockers.


