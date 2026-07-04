# Analyze Existing Website For Improvements — Work Prompt

Use this prompt skill when the user wants to audit an existing small-business website for practical website, SEO, local SEO, AI-search/LLM information quality, trust, and conversion improvements.

## Goal

Produce an evidence-backed, client-ready website opportunity audit that identifies what is working, what is likely costing the business leads, how the site compares against actual local and surrounding-market competitors when discoverable, and what should be improved first.

Keep the output compact enough to complete in one response. Prefer concise bullets and short matrix rows over long prose. Do not expand one section so much that later required sections are omitted.

## Inputs To Resolve

The user input will normally include a website URL and may include business name, industry/service category, target city/region/service area, output purpose, and competitor-analysis preference.

Do not ask for missing facts until you have inspected the public site and safe public signals available to you.

## Required Discovery Workflow

1. Fetch or inspect the homepage.
2. Check robots.txt and sitemap.xml when available.
3. Identify important service, location, about, review/testimonial, blog/resource, and contact pages.
4. Inspect representative important pages for page titles, meta descriptions, H1s, headings, copy quality, CTAs, local targeting, internal links, schema, trust signals, reviews, phone/NAP consistency, image alt text, mobile/conversion readiness, and how effectively the site exposes clear, accurate business facts for LLMs and AI search assistants.
5. Identify practical actual local or surrounding-market competitors from public evidence when possible, then inspect enough of their websites to compare SEO structure, service pages, local positioning, trust/proof, CTAs, and visible weaknesses.
6. Separate actual business competitors from SEO-only, directory, or lead-generation search competitors when both appear.
7. Look for templated or generic copy, city-name mismatch, placeholder content, inconsistent phone numbers, thin location pages, missing proof, weak quote/contact paths, and obvious performance/template bloat.
8. Ground findings in evidence from inspected pages. Do not invent business claims.

## Required Audit Categories

Use these categories when relevant: local SEO foundation, technical crawlability, service keyword coverage, content quality and differentiation, conversion optimization, trust and E-E-A-T signals, reviews and social proof, phone/NAP consistency, service-area/city page quality, blog/resource strategy, image alt text and media quality, performance/template bloat risk, brand positioning, competitive positioning, competitor SEO/service-page gaps, and LLM information quality / AI-search readiness.

## Required Acceptance Matrix

Before the audit is complete, fill this reusable acceptance matrix with the current client's evidence. If a check cannot be completed from available public evidence, mark it as `Not verified` and explain what would be needed. Do not invent missing evidence.

| Area | Required checks | Evidence to capture | Audit output requirement |
|---|---|---|---|
| Homepage metadata | Title, meta description, canonical if visible, H1, primary above-the-fold copy | Homepage HTML/extraction and inspected URL | Note strengths, mismatches, missing fields, and customer/search impact. |
| Local SEO and NAP | Business name, address, phone, city, service area, location wording consistency | Homepage, footer, contact/about pages, schema if present | Identify inconsistencies such as city mismatch, phone mismatch, missing address, or unclear service area. |
| Technical crawlability | Homepage status, important page status, robots.txt, sitemap.xml, crawlable navigation | HTTP status checks, robots/sitemap fetches, discovered links | Report crawlability blockers, missing sitemap, broken important pages, or unclear page discovery. |
| Page inventory | Service/product pages, location pages, about page, contact page, review/testimonial page, blog/resource pages | Discovered internal links and sampled page fetches | List important pages found and important page types missing or weak. |
| Service keyword coverage | Priority services/products, dedicated page coverage, local keyword wording, internal links to services | Service page titles, headings, URLs, body samples | Score whether high-intent services have findable, locally relevant pages. |
| Content quality and differentiation | Generic/template copy, placeholder copy, specificity, local proof, customer benefits | Representative page text samples | Identify where copy is clear, generic, thin, duplicated, or not differentiated. |
| Conversion path | Phone/call CTA, contact form, booking/schedule, quote/request path, mobile action clarity | Homepage/header/nav/service/contact pages | Explain friction in terms of calls, appointments, contact, and mobile usability. |
| Trust and E-E-A-T | Ownership/team, credentials, reviews/testimonials, community proof, guarantees, compliance-safe proof | Homepage, about, review/testimonial, footer, public profile links when available | Note inspected proof signals and proof gaps using evidence-safe wording. |
| Reviews and social proof | Visible testimonials/reviews, rating snippets, review links, third-party profile signals when inspected | Site pages and public profile/search evidence when available | Do not claim rating/review performance unless directly observed; note if inspected pages did not show social proof. |
| Accessibility and media | Image alt text, meaningful media, obvious missing alt values, video/media quality when visible | Image extraction and representative page samples | Report missing/empty alt text and practical accessibility/media improvements. |
| AI-search / LLM readiness | Clear business facts, services, locations, FAQs, schema, proof, hours/contact, service-area answers | Content/schema inspection and page samples | Score how well AI/search assistants can understand and accurately summarize the business without promising AI rankings. |
| Competitor landscape | Actual local competitors, surrounding-market competitors, search/directory/lead-generation competitors | Public search/directories/maps where accessible, direct competitor pages when possible | Separate actual business competitors from search/directory competitors and avoid unsupported ranking claims. |
| Competitor page gaps | Competitor service pages, CTAs, trust/proof, local positioning, SEO structure, visible weaknesses | Competitor website/directories/screenshots when available | Explain where the client can win on service pages, trust, CTAs, local clarity, and AI-search readiness. |
| Performance/template risk | Obvious bloat, excessive scripts, template look, slow/heavy pages when observable | HTML size, page weight signals, visible template patterns, performance tooling if available | Mention only observable performance/template risks or mark as not measured. |
| Quick wins and prioritization | Small fixes, high-impact improvements, longer-term content/SEO needs | Findings across matrix rows | Prioritize practical next steps a small business can understand. |

## Output Structure

Return: executive summary, quick scorecard, what is working, main issues/opportunities, LLM information quality, competitor analysis, high-priority action plan, quick wins, longer-term SEO/content recommendations, demo/rebuild opportunity summary, lead-quality or sales notes if relevant, and the acceptance matrix.

Use this maximum shape:

- Executive summary: 3-5 bullets.
- Quick scorecard: 6-10 rows.
- What is working: 3-6 bullets.
- Main issues/opportunities: 5-8 bullets.
- LLM information quality: 2-4 bullets.
- Competitor analysis: 3-5 competitor/market bullets, including `Not verified` where needed.
- High-priority action plan: 5-7 bullets.
- Quick wins: 5-7 bullets.
- Longer-term SEO/content recommendations: 4-6 bullets.
- Demo/rebuild opportunity summary: 2-4 bullets.
- Lead-quality or sales notes: 2-4 bullets when relevant.
- Acceptance matrix: include every required row, but keep each cell to one concise sentence.

## Style

Be specific, practical, business-focused, evidence-backed, and clear for a small-business owner. Avoid unsupported claims about ownership, years in business, ratings, licenses, response times, rankings, or review volume.
