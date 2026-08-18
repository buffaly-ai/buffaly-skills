# Website Growth Proposal Template Implementation Notes

This template is intentionally fixed at 16 slides. It is a premium customer-facing proposal template, not a report template.

## Build rules

1. Copy the entire template folder into the deck output folder.
2. Copy customer screenshots into `screenshots/` and reference them with relative paths.
3. Replace `{{SLIDES_HTML_EXACTLY_16}}` with exactly 16 `<section class="slide ...">` elements.
4. Use `dark` class for cover, demo, trust/top-fixes, or closing slides where contrast helps the story.
5. Keep each slide to one main idea. Do not fill every slide with four cards by default.
6. Generate `pdf-export.html` by forcing all slides visible and removing interactive nav if necessary.
7. Generate `static-review.html` with all 16 slides scaled in a review grid.
8. Validate from rendered artifacts, not HTML structure alone.

## Slide design guidance

- Slides 3, 4, 5, and 6 should be screenshot-led.
- Slides 7, 8, 9, 10, 11, and 12 should use concise story blocks and only the cards needed to make the point.
- Slide 13 should be a prioritized sequence, not a generic checklist.
- Slide 14 should explain ongoing value without sounding like an internal package list.
- Slide 15 should make a clear recommendation.
- Slide 16 should ask for concrete confirmations and approval.

## Visible-language rules

Never show internal workflow terms in the customer-facing slides. Keep process details in README or validation evidence.

Avoid: sales frame, pitch, sales rep, internal, audit score, task, workflow, validated prompt, demo direction, artifact, Workbench, matrix row, LLM score.

## Claim rules

Use evidence-safe language. Do not promise rankings, AI recommendations, revenue, traffic, patient volume, reviews, or speed gains unless measured and sourced.

