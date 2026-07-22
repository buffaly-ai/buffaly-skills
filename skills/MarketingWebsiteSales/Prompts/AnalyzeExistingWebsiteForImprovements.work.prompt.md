> VALIDATED PROMPT ACTION ONLY
>
> Do not run this markdown file directly as ordinary prompt guidance.
> This prompt must be executed through the corresponding ProtoScript `ValidatedPromptAction` so the validation prompt runs after the work turn.
> If you are an agent, call the action/tool instead of loading this file directly.

# Analyze Existing Website For Improvements

Use this prompt skill when the user wants to audit an existing small-business website for practical website, SEO, local SEO, AI-search/LLM information quality, trust, and conversion improvements. This workflow is based on the Insurance Site session pattern.

## Goal

Produce an evidence-backed, client-ready website opportunity audit that identifies what is working, what is likely costing the business leads, how the site compares against actual local and surrounding-market competitors, and what should be improved first.

## Inputs To Resolve

- Website URL
- Business name, if known
- Industry or service category, if known
- Target city, region, or service area, if known
- Whether the output is for internal lead qualification, client delivery, or sales outreach
- Whether competitor analysis should focus on actual business competitors, search-result competitors, or both; default to actual business competitors first and separate SEO-only/lead-generation sites when they appear.

Do not ask for missing facts until you have inspected the public site and safe public signals available to you.

## Discovery Workflow

1. Fetch or inspect the homepage.
2. Check robots.txt and sitemap.xml when available.
3. Identify important service, location, about, review/testimonial, blog/resource, and contact pages.
4. Inspect representative pages for page titles, meta descriptions, H1s, headings, copy quality, CTAs, local targeting, internal links, schema, trust signals, reviews, phone/NAP consistency, image alt text, mobile/conversion readiness, and how effectively the site exposes clear, accurate business facts for LLMs and AI search assistants.
5. Identify top actual local competitors and relevant surrounding-market competitors using public evidence, then inspect their websites for SEO structure, service pages, local positioning, trust/proof, CTAs, and visible weaknesses.
6. Separate actual business competitors from SEO-only or lead-generation search competitors when both appear.
7. Look for templated or generic copy, city-name mismatch, placeholder content, inconsistent phone numbers, thin location pages, missing proof, weak quote/contact paths, and obvious performance bloat.
8. Ground findings in evidence from inspected pages. Do not invent business claims.

## Audit Categories

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

## Required audit acceptance matrix

Before the audit is considered complete, create or mentally complete this reusable acceptance matrix. Do not make it client-specific in the prompt itself; fill it with the current client's evidence during execution. If a check cannot be completed from available public evidence, mark it as `Not verified` and explain what would be needed. Do not invent missing evidence.

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

## Required Artifact Output Contract

This workflow must produce durable artifacts, not only an inline chat answer.

Save the audit outputs under the current session `artifacts` folder unless the user explicitly requested another location. At minimum, create or update:

1. A client-ready website opportunity audit artifact, preferably markdown and HTML when practical.
2. Evidence/source notes listing inspected URLs, fetched public signals, competitor sources, pages sampled, and anything marked `Not verified`.
3. A reusable audit matrix or scorecard artifact derived from the acceptance matrix above.
4. A short manifest or final response section naming the artifact paths created.

The final response may summarize the audit, but it must also include the saved artifact path(s). Do not consider the workflow complete if the audit exists only in the chat response.

Use clear artifact names that include the business or domain when possible, for example:

- `artifacts/<business-or-domain>-website-opportunity-audit.md`
- `artifacts/<business-or-domain>-website-opportunity-audit.html`
- `artifacts/<business-or-domain>-evidence-source-notes.md`
- `artifacts/<business-or-domain>-audit-matrix.json` or `.md`

Save evidence artifacts and source notes. Produce a structured audit with executive summary, scorecard, strengths, issues/opportunities, LLM readiness, action plan, quick wins, long-term recommendations, competitor analysis, and evidence reviewed.

## Output Structure

Create a practical saved audit artifact with:

1. Executive summary
2. Quick scorecard
3. What is working well
4. Main issues and opportunities
5. AI Search and LLM Readiness: a clearly labeled section explaining how well the site exposes trustworthy business facts for AI assistants/search systems and why it matters
6. Competitor analysis: top actual competitors, what they do better/worse, and where the client can win
7. High-priority action plan
8. Quick wins
9. Longer-term SEO/content recommendations
10. Demo/rebuild opportunity summary
11. Lead-quality or sales notes, if this is for prospecting
12. Evidence reviewed and artifact/source-note references

## Style and Presentation

- Be specific, practical, and business-focused.
- Explain how each issue affects leads, trust, local visibility, or conversion. For each major issue, include observed evidence, business impact, and recommended fix.
- Prioritize fixes a small business can understand.
- Avoid jargon unless you explain it simply.
- Do not make unsupported claims about ownership, years in business, ratings, licenses, or response times.
- Format the client-ready artifact so it can be read by a salesperson or prospect without seeing internal deliberation.
- Use clear headings, short paragraphs, scannable bullets, and tables/scorecards where useful.
- Keep source notes and uncertainty explicit, but phrase client-facing limitations safely and professionally.

## Reusable Pattern

Audit the prospect's public website → find revenue, SEO, AI-search/LLM information quality, trust, conversion, and competitive-positioning problems → create a prioritized improvement plan → identify whether a demo website makeover would help close the client.



