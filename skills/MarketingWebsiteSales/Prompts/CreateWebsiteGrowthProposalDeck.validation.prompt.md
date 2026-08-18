# Validate Website Growth Proposal Deck

Validate that the work result creates a polished, customer-ready, exactly 16-slide website growth proposal deck from audit/demo evidence.

The validator must fail loudly. Do not accept a deck that is merely complete-looking, mechanically generated, internally framed, visually weak, or dependent on a later human/model polish pass.

## Required objective checks

Fail unless all are true:

- A concrete proposal deck artifact folder exists under the session `artifacts/` folder or Workbench-controlled deliverables folder.
- The folder includes `index.html` and `proposal-deck.html` with inline CSS and no dependency on external hosted CSS/JS.
- The folder includes `pdf-export.html`, `proposal-deck.pdf`, `cover-preview.png`, `static-review.html`, `static-review.png`, `proposal-run-profile.json`, `slide-content-contract.json`, and `proposal-deck-validation.json` or equivalent validation evidence.
- All screenshots/assets referenced by HTML exist inside the output folder using relative paths.
- No unresolved `{{PLACEHOLDER}}` tokens remain.
- A real PDF exists, starts with `%PDF`, has non-trivial length, and represents the full 16-slide deck rather than only the active interactive slide.
- Static review image/page exists so the whole deck can be visually reviewed without relying on slide navigation JavaScript.

## Exact slide contract

Fail unless the visible deck contains exactly 16 slides in this exact order:

1. Cover / Website Growth Proposal
2. Current strengths
3. Current homepage screenshot and issues
4. Current service/key page screenshot and issues
5. Demo solution screenshot and action cards
6. Mobile conversion screenshot and action bar
7. Local SEO/service-page solution
8. Competitive positioning: what competitors do better and where the prospect can win
9. Trust/social proof solution
10. Content/blog-to-service solution
11. AI-search/LLM information quality solution
12. Technical/performance solution
13. Top rebuild fixes
14. Monthly website growth layer in addition to base program
15. Recommended proposal
16. Next steps

Fail if:

- slide count is not exactly 16;
- slide numbering, progress rail, footer, or PDF page count implies 22 slides or any other count;
- required slide order is changed;
- extra appendix/discovery/scope/decision/path slides are added to the visible deck;
- multiple outline items are collapsed into a thin heading-only slide;
- the deck uses the old 22-slide website proposal template.


## Mojibake/encoding gate

Fail if any generated customer-visible file, copied template file, prompt-derived slide contract, HTML, PDF source, static review HTML, or README contains mojibake or replacement-artifact tokens such as:

- UTF-8/Windows-1252 corruption sequences represented by Unicode escapes such as U+0393 U+00C7.
- U+00E2 smart-punctuation corruption markers.
- U+FFFD replacement characters.
- U+00C3/U+00C2 double-encoding markers.
- Visible corrupted punctuation sequences in rendered text.

These usually indicate Windows-1252/UTF-8 decoding errors and are never acceptable in a customer-ready deck. Re-save the source prompt/template as UTF-8 and replace the corrupted punctuation with intended UTF-8 glyphs or ASCII-safe equivalents before passing validation.

## Customer-facing language gate

Fail if visible slide text contains internal, sales-rep, process, workflow, or tool language, including but not limited to:

- `sales frame`
- `pitch`
- `sales rep`
- `internal`
- `audit score`
- `task`
- `workflow`
- `validated prompt`
- `demo direction`
- `artifact`
- `Workbench`
- `we inspected` when used as process narration instead of customer-facing evidence
- `matrix row`
- `schema-ready` as jargon without plain-language explanation
- `AI ranking`
- `LLM score`

The final deck may discuss evidence and recommendations, but it must sound like a customer presentation. Process notes belong in `README-review.md`, `proposal-research-packet.md`, or sales guidance, not visible slides.

## Visual quality gate

Fail if the deck feels like a raw report, minimally styled webpage, dense card dump, or generic AI output.

A passing deck must demonstrate:

- premium proposal-deck visual hierarchy comparable to accepted Marketing Agency examples such as the Lasik Home Health Care improved deck or pharmacy growth proposal reference decks;
- strong cover slide;
- customer-specific tone and palette accents;
- large screenshots on screenshot slides;
- balanced dark/light contrast;
- readable typography at 1280x720;
- generous whitespace;
- few enough cards that each slide has one dominant idea;
- intentional screenshot cropping and no broken/archived image references;
- dark slide panels/cards with explicit readable text color;
- no overlapping callouts, cards, footers, or screenshot elements in the static review image.

Structural HTML checks alone are not enough. Inspect the rendered cover preview and static review image. Fail if any slide has clipped/off-canvas content, overlapping text, unreadable small type, broken image icons, large empty accidental whitespace, footer collisions, or a screenshot path that points to an archive/text placeholder instead of an actual image.

## Required deck coverage

Fail if customer-visible content does not cover:

- the prospect's real current strengths before criticism;
- homepage first-screen issue grounded in the current screenshot;
- service/key-page issue grounded in the current screenshot;
- demo/improved direction with screenshot-backed action cards;
- mobile call/book/contact path when relevant;
- local SEO/service-page solution based on confirmed services/locations;
- competitor positioning with honest where-they-win and where-prospect-can-win framing;
- trust/social proof using only sourced/approved proof or explicit confirmation needs;
- content cleanup and service/resource page strategy;
- AI-search / information-quality improvements without ranking/recommendation promises;
- technical/performance cleanup using only observed or measured evidence;
- prioritized top fixes from the audit matrix;
- monthly website growth layer value and price when requested;
- recommended proposal and low-friction next steps.

## Claim-safety gate

Fail if the deck promises, implies, or overstates:

- search rankings;
- AI assistant recommendations, citations, or rankings;
- traffic growth;
- revenue, patient/customer volume, lead volume, or conversion lift;
- review/rating superiority;
- performance/speed gains without measurements;
- exclusivity or market leadership without verified support.

Fail if uncertainty is hidden. Unverified items should be phrased as confirmation needs or omitted from the visible deck.

## Template/source gate

Fail unless the run used the packaged 16-slide website proposal reference template or a documented derivative in the output folder:

```text
Skills/MarketingWebsiteSales/reference-website-growth-proposal-template/
```

Fail if the old 22-slide template is used as the base visible deck:

```text
Nodes/Personal/Marketing/Templates/WebsiteAnalysisSalesPacket/proposal-website-growth-deck.template.html
```

## Required validation evidence

The work result must provide validation evidence naming:

- deck HTML path;
- PDF path;
- static review path;
- cover preview path;
- slide count;
- ordered slide titles;
- placeholder count;
- missing asset count and list;
- forbidden language scan result;
- unsupported claim scan result;
- PDF header and bytes;
- static review image bytes;
- template path used;
- validation status.

When failing, `FeedbackForRetry` must name every failed check and explain exactly what the next attempt must create, remove, or correct.




