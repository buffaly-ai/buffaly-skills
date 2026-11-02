# Email Dispatch shared visual owner

`email-dispatch.css` is the sole module visual language. Every task view loads it after the source-linked Bootstrap baseline. It owns body/headings/control sizes, spacing, shell/nav, grid/ellipsis/status, subject/body/instruction, read-only facts, empty/error/success, section, evidence, focus and risky-command presentation. Do not add per-view font/button variants.

Shared markup:
```html
<div class="ed-heading"><h1 tabindex="-1">Task</h1><button class="btn btn-primary">Main command</button></div>
<div class="ed-grid-host"><table class="ed-grid"><!-- bounded shared grid --></table></div>
<span class="ed-status ed-status-success">Accepted by destination</span>
<section class="ed-region"><h2>Part of this task</h2></section>
<dl class="ed-facts"><dt>Destination</dt><dd>Human session name</dd></dl>
<p class="ed-empty">No matches. Change the search.</p>
<div class="ed-danger-zone"><button class="btn btn-outline-danger">Confirm risky command</button></div>
```
Status tones: neutral/success/warning/danger/info. `ed-subject` wraps selected long subject; list links use ellipsis/title, never break-all. `ed-grid-rules` explicitly normal word breaking. `ed-email-body` flows on the main reading surface without an internal height cap or scrollbar; full evidence uses `ed-evidence` only in Evidence. Shared `data-keyboard` owner preserves keyboard focus while suppressing pointer/initial focused heading boxes.

Mailbox markup:
```html
<header class="ed-header"><div class="ed-shell ed-header-inner"><a class="ed-brand" href="#inbox">Email Dispatch</a><nav class="ed-nav" aria-label="Main"><!-- focused task links --></nav><span class="ed-account">Account name</span></div></header>
<div class="ed-message-tools" aria-label="Message commands"><a class="ed-back" href="#inbox">← Inbox</a><div id="works"><section class="ed-work-commands"><!-- status, destination, real command buttons --></section></div><div class="ed-message-secondary"><!-- rule check and evidence navigation --></div></div>
<article class="ed-reading-surface"><h1 class="ed-subject" tabindex="-1">Subject</h1><div class="ed-message-meta"><p class="ed-sender">Sender</p><p class="ed-meta">Local received time</p></div><div class="ed-email-body"><!-- textContent only --></div></article>
```

## 2026-11-02
Created shared owner for authorized structural redesign, using inspected FF shared-elements as reference, not copied assets. Previous Bootstrap-only all-task stack rejected. Actual1440/390/200%screens and Rule10 receipt in docs/EmailDispatch-Focused-UI.md; routine48/48 plus real configured-model synthetic UI1/1. Parent visual acceptance separately required.

## 2026-11-02 — Gmail-style reading workspace
Matt rejected the reading layout's wasted space. Replaced the two-level application header and narrow maximum width with one compact shared shell, reduced shared grid row padding, and defined a top message-command bar, modest subject and same-row sender/date. Removed the shaded 240px body box and its nested scrollbar; the safe plain-text message flows in the main document. Mobile commands wrap with their owning work status; focused rule/routing forms retain their existing owner sizes. No page-local theme, new icon library or behavior change. Exact Drive message: body y331.39 to209.28, width1072 to1360 at1440; actual390/200% and long real-message screenshots plus Rule10 are in docs/EmailDispatch-Gmail-Layout.md. Initial49-test run had48 passes and one navigation-response assertion defect; corrected focused reading test passes1/1. Final routine/package results are recorded in that receipt.

## 2026-11-02 — parent mobile visual correction
Parent accepted the desktop reading structure but measured excessive mobile toolbar rows. Changed the shared mobile toolbar layout to put Inbox and current work status on one row and keep real commands in the next wrapping rows, using their existing semantic groups. Exact unmatched Drive toolbar137.8px at390 (<=140px),36px buttons, no hidden controls or clipping. Added regression assertions for toolbar height/alignment. Source full49/49,0failed/skipped,45sec passed after this correction; actual mobile screenshot sent to parent for final visual acceptance.
