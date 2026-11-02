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
Status tones: neutral/success/warning/danger/info. `ed-subject` wraps selected long subject; list links use ellipsis/title, never break-all. `ed-grid-rules` explicitly normal word breaking. `ed-email-body` bounds independently scrollable source content; full evidence uses `ed-evidence` only in Evidence. Shared `data-keyboard` owner preserves keyboard focus while suppressing pointer/initial focused heading boxes.

## 2026-11-02
Created shared owner for authorized structural redesign, using inspected FF shared-elements as reference, not copied assets. Previous Bootstrap-only all-task stack rejected. Actual1440/390/200%screens and Rule10 receipt in docs/EmailDispatch-Focused-UI.md; routine48/48 plus real configured-model synthetic UI1/1. Parent visual acceptance separately required.
