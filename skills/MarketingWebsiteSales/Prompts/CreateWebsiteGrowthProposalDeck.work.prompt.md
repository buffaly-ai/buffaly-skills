# Create Website Growth Proposal Deck

## Purpose and Overview

Produce a polished, independently validated, customer-ready **16-slide** HTML proposal deck from a website audit, client-facing report, competitor evidence, screenshots, and demo concept. The visible deck must read like a concise decision-maker presentation for the prospect, not an audit report, internal sales brief, task log, or generic SEO checklist.

The native workflow must produce the final buyer-ready deck directly. Do not rely on an external model, polish agent, or later manual cleanup to fix readability, organization, visual hierarchy, or customer-facing tone.

This workflow is the general website proposal deck workflow for Website Growth / Feeding Frenzy sales packets. Use it when a user wants a proposal slide deck after website analysis or when a sales-packet workflow needs a proposal deck component.

## Non-negotiable outcome

The final proposal deck must:

- contain **exactly 16 slides**;
- follow the required slide outline in the exact order listed below;
- use a premium, customer-facing proposal style comparable to accepted Marketing Agency decks such as the Lasik Home Health Care improved deck and the pharmacy growth proposal reference decks;
- use the packaged 16-slide website proposal reference template as the starting visual system;
- include real current-site and demo screenshots when available;
- keep all claims evidence-backed and caveated when unmeasured;
- remove sales-rep, internal, workflow, task, audit-score, and process language from the visible deck;
- render reviewable HTML, a real PDF, and visual review artifacts before success.

## Inputs

Use prior validated artifacts already present in the session or supplied by the parent sales-packet workflow:

- confirmed prospect identity and official website;
- website audit matrix and opportunity synthesis;
- client-facing website report findings;
- current homepage screenshot;
- current service/key-page screenshot;
- demo homepage screenshot or demo direction screenshot;
- demo mobile screenshot when available;
- competitor analysis / normalized competitor facts;
- monthly package/program name and price, normally Feeding Frenzy at `$500/month` unless user input overrides it;
- selected customer/demo palette and any available logo/brand assets;
- known unresolved evidence limits.

If required screenshots or source artifacts are missing, create or validate them before claiming visual improvements. If a fact was not verified, do not invent it.

## Output folder and files

Create a self-contained proposal folder under the current session `artifacts/` folder or the Workbench-controlled deliverables folder. Use a stable folder name such as:

```text
artifacts/<client-slug>-proposal-deck/
```

Create these files:

```text
index.html                         interactive 16-slide deck with inline CSS
proposal-deck.html                 copy of index.html
pdf-export.html                    print-safe all-slides export version
proposal-deck.pdf                  rendered full 16-slide PDF
static-review.html                 all-slide review page that does not depend on slide JS
static-review.png                  all-slide review image
cover-preview.png                  rendered first-slide preview
proposal-run-profile.json          resolved identity, selected template, and deck settings
slide-content-contract.json        final slide-by-slide content contract
proposal-deck-validation.json      validation evidence
README-review.md                   short review/use notes
assets/...                         copied template fonts/logos/visual assets
screenshots/...                    copied lead-specific screenshots used by the deck
```

## Reference template package

Use this template package as the visual and structural starting point:

```text
Skills/MarketingWebsiteSales/reference-website-growth-proposal-template/
```

It contains a fixed 16-slide website-growth proposal template, bundled visual assets, implementation notes, and a slide content contract. Copy the full template package into the output folder before customization, then replace placeholders with prospect-specific content. Do not start from the old 22-slide `Nodes/Personal/Marketing/Templates/WebsiteAnalysisSalesPacket/proposal-website-growth-deck.template.html` template.

If you need to adapt the visual design, preserve the premium design principles:

- strong dark/light contrast;
- large confident headlines;
- screenshot-led evidence slides;
- fewer, better cards instead of dense card soup;
- generous whitespace;
- refined footer/progress rail;
- customer-specific palette accents;
- self-contained fonts and assets;
- print-safe layout.

## Required 16-slide outline

The deck must contain exactly these slides, in this order, with one main idea per slide:

1. **Cover / Website Growth Proposal** - warm customer-facing opening, prospect name, website growth theme, no internal framing.
2. **Current strengths** - start with what the prospect already does well.
3. **Current homepage screenshot and issues** - show the homepage and the highest-impact first-screen issue.
4. **Current service/key page screenshot and issues** - show the service/key page and explain the patient/customer journey gap.
5. **Demo solution screenshot and action cards** - show the improved direction and 2-4 concrete action/value cards.
6. **Mobile conversion screenshot and action bar** - show mobile path or explain primary action system.
7. **Local SEO/service-page solution** - map priority local/service pages from confirmed facts.
8. **Competitive positioning: what competitors do better and where the prospect can win** - compare honestly and safely.
9. **Trust/social proof solution** - show how verified people, proof, credentials, testimonials, and model explanations build trust.
10. **Content/blog-to-service solution** - convert useful content into answer-first service/resource pages and remove leftovers.
11. **AI-search/LLM information quality solution** - explain clearer first-party facts, FAQs, schema, and service pages without AI ranking promises.
12. **Technical/performance solution** - crawlability, cleanup, media/accessibility, measurement; avoid unmeasured performance claims.
13. **Top rebuild fixes** - prioritized sequence from the audit matrix, not a generic list.
14. **Monthly website growth layer in addition to base program** - Feeding Frenzy / monthly layer scope and value.
15. **Recommended proposal** - clear, low-friction recommended scope and sequencing.
16. **Next steps** - specific approvals/confirmations and start path.

No extra appendix, discovery, scope-option, or closing slides may be added to the visible deck. If extra detail is useful, put it in `README-review.md`, `proposal-research-packet.md`, or sales guidance outside the deck.

## Required step-by-step workflow

### Step 1 - Resolve proposal identity and output profile

Create `proposal-run-profile.json` before building slides. It must include:

- client name and slug;
- official website URL;
- business category and market/location;
- selected template path;
- deck date;
- presenter/program names;
- monthly package and price;
- required screenshot paths;
- known evidence limits;
- whether the deck is standalone or part of a sales packet.

Use canonical identity artifacts when available. Do not turn category phrases into business names. For example, use "direct primary care in Midway" as a descriptor, not "Midway Direct Primary Care" as a proper name.

### Step 2 - Inventory evidence and visuals

Create `proposal-research-packet.md` or equivalent notes summarizing:

- source audit/report/competitor artifacts used;
- current screenshot files selected;
- demo screenshot files selected;
- major strengths;
- top issues;
- unsupported or unresolved claims to avoid.

Every screenshot referenced in HTML must be copied into the deck output folder and verified there.

### Step 3 - Write the 16-slide content contract

Create `slide-content-contract.json` with exactly 16 slide objects. Each object must include:

- `slideNumber`;
- `requiredOutlineTitle`;
- `customerFacingEyebrow`;
- `headline`;
- `bodyHtml` or structured body content;
- `visualAsset` if applicable;
- `evidenceSource`;
- `claimSafetyNotes`;
- `forbiddenLanguageChecked`.

Write customer-facing copy only. The deck may say "your homepage," "your services," and "recommended next step." It must not say "sales frame," "pitch," "audit score," "task," "workflow," "internal," "demo direction," "we inspected," "validated prompt," or similar process language in visible slides.

### Step 4 - Assemble the premium HTML deck

Copy the reference template package into the output folder and customize it from the slide contract. Requirements:

- inline CSS in `index.html`;
- no external CSS or JS dependencies;
- local relative asset paths only;
- fixed 1280x720 or equivalent landscape slide dimensions;
- keyboard/click navigation;
- print-safe `@page` CSS;
- dark-slide cards/panels remain readable;
- screenshots are framed and cropped intentionally;
- each slide has one dominant message.

### Step 5 - Create export/review artifacts

Create `pdf-export.html` that forces all slides visible for print/PDF export instead of relying on interactive slide state.

Render:

- `proposal-deck.pdf` from `pdf-export.html`;
- `cover-preview.png` from slide 1;
- `static-review.html` containing all 16 slides in a scaled grid;
- `static-review.png` from `static-review.html`.

Do not pass if the PDF is missing, tiny, blank, contains only one slide, or omits screenshot-heavy slides.

### Step 6 - Validate and record evidence

Create `proposal-deck-validation.json`. Record:

- slide count;
- exact outline titles in order;
- placeholder count;
- missing image/asset references;
- PDF bytes and PDF header;
- cover preview bytes;
- static review bytes;
- forbidden visible language scan results;
- unsupported claim scan results;
- screenshot reference checks;
- whether the deck used the packaged 16-slide template and not the old 22-slide template.

If any validation check fails, fix the deck and rerun validation before returning success.

## Encoding and text quality rules

Before rendering or validating, scan all prompt-derived and template-derived text for mojibake/replacement-artifact tokens, including common UTF-8/Windows-1252 corruption sequences represented by Unicode escapes such as U+0393 U+00C7, U+00E2, U+FFFD, U+00C3, and U+00C2. Replace corrupted punctuation with intended UTF-8 glyphs or ASCII-safe punctuation. Do not allow mojibake into HTML, PDFs, static reviews, slide contracts, or README files.

## Claim safety rules

Do not promise or imply:

- search rankings;
- AI assistant recommendations/citations/rankings;
- traffic increases;
- revenue, patient/customer volume, or conversion lift;
- review/rating superiority;
- speed/performance improvement unless measured;
- exclusive market position unless verified.

Use evidence-safe phrases such as:

- "clearer first-party facts";
- "easier for people and search systems to understand";
- "more direct path to call or book";
- "based on inspected public pages";
- "after confirmation."

## Final response

Return concise links/paths to:

- `index.html`;
- `proposal-deck.pdf`;
- `static-review.html` or `static-review.png`;
- `proposal-deck-validation.json`.

Summarize validation: exact 16 slides, no missing images, no placeholders, customer-facing language gate passed, PDF rendered.



