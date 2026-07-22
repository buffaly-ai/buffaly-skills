# Validate Client-Facing Website Report

Validate that the work result creates a polished client-facing website improvement report from evidence-based audit findings.

## Objective checks

Fail if any required report evidence, artifact, or formatting requirement is missing:

- Identifies the client/business and website.
- Uses approved audit findings/evidence rather than inventing new unsupported findings.
- Includes executive summary, quick scorecard or matrix summary, what is working, key issues/opportunities, LLM/AI-search information quality, competitor or market positioning when available, prioritized action plan, quick wins, longer-term recommendations, and demo/rebuild opportunity summary.
- Provides concrete artifact paths for the generated client-facing report. A complete inline report body, raw markdown, or text that is merely "suitable for export" is not enough to pass.
- Creates a styled HTML report artifact under the session `artifacts` folder or the user-specified output folder.
- Creates a rendered PDF report artifact when PDF generation was requested or when this skill is being used inside a sales-packet workflow. If PDF rendering is blocked, fail with the exact blocker and remediation needed; do not silently pass with only HTML or markdown.
- Reuses the audit matrix/findings rather than re-synthesizing unsupported claims from memory.
- Keeps internal notes, uncertainty, and evidence limitations out of client-facing claims unless phrased safely.
- Avoids unsupported claims about ratings, ownership, years in business, licenses, rankings, revenue, or response times.

## Styled HTML artifact checks

Fail if the HTML report artifact is missing, unreadable, or not client-deliverable.

The HTML report must:

- Contain a `<style>` block with substantial embedded CSS sufficient for standalone rendering.
- Not depend on an external stylesheet for basic layout, typography, color, cards, spacing, or report presentation.
- Have no unreplaced `{{PLACEHOLDER}}` tokens.
- Use report-style visual structure such as a cover/hero, client context or metadata row, scorecard, cards or panels, action plan, evidence section, and footer/disclaimer.
- Visibly include the AI-search / LLM information quality section.
- Avoid being just markdown text wrapped in a minimal HTML shell, `<pre>`, or plain article page.
- Be comparable in visual polish and structure to the reusable template or accepted Marketing Agency client-facing report examples.

When failing for artifact/style reasons, `FeedbackForRetry` must name the exact missing file/path, missing style requirement, placeholder, weak section, or rendering blocker and explain what the next attempt must create or correct.

## Subjective checks

Fail if the report is not client-ready:

- The report must be clear, professional, practical, and specific to the business.
- Recommendations must be explained in business terms a small-business client can understand.
- The report should build trust and help the client decide on a website growth project.
- The tone should be constructive and sales-useful without overstating evidence.
- The report must visually feel like a polished Feeding Frenzy by Buffaly deliverable, not a plain memo, raw markdown export, or minimally styled webpage.
- Section headings alone are not sufficient; each section must contain useful client-facing judgment, evidence, and business impact.
