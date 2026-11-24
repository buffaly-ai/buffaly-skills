# Source annotation controller

## 2026-11-23 — Initial implementation
Mounts source selection actions and a native modal note editor on read-only CodeMirror. Records canonical path, exact selected text, one-based inclusive line labels and precise CodeMirror endpoints. Drafts are scoped to caller and canonical path. Inline notes support edit/remove; source text is never written. Changed source retains original note selections and labels instead of silently rebinding.

Uses the existing browser queue-input boundary, matching Markdown viewer admission semantics. Persists the complete keyed submission before sending; uncertain retries use that exact input/key across reloads. Requires Accepted=true and matching MessageKey, removes only exact submitted revisions, and retains edits made in flight. Pending submissions remain retryable even if notes were cleared before local submission cleanup. Missing caller cannot send. Preview disables the toolbar. User text renders with textContent.

Validation: SourceAnnotations.cjs passed draft/edit/remove, exact lines/text, literal hostile markup, reload/path-caller scoping, rejected/mismatched receipt retention, uncertain duplicate-safe retry, in-flight revision preservation, missing caller and preview deactivation. .NET31/31 and existing JS suites passed. Staging acceptance is separate from simulated queue tests.

## 2026-11-23 — Review corrections: unread drafts and command presentation
Confirmed the initial-load catch could be undone by cursorActivity, allowing an empty in-memory list to replace unread stored drafts. A fail-closed draftsReady guard now controls update/open/persist/submit and form submission. It becomes true only after saved notes parse, validate and render successfully. Selection and preview activation cannot enable mutation after a failed load; original stored bytes remain untouched until a successful reload.

Annotation commands now use module-owned Font Awesome 5 Free icons and the existing shared actions/primary styles. A selected range has primary Add; a ready or pending batch has primary Send; the modal has primary Save. The sending status remains authoritative during cursor changes, and final receipt messages are rendered after busy clears. Queue payload, admission verification, retry identity and in-flight revision preservation are unchanged.

Validation: SourceAnnotations.cjs passed transient initial read failure, malformed JSON, invalid draft, exact stored-byte preservation despite forced clicks/form submission and recovered storage, successful reload/edit, all five command states, required icons, and existing queue regressions. All four Node suites and .NET31/31 passed. Managed-browser fixture walkthrough captured no-selection, selection, ready-to-send, editing and sending views with loaded icon fonts. This is local fixture evidence, not staging or actual recipient delivery; those earlier acceptance blockers remain.


## 2026-11-24 — Reuse Markdown selection placement and host Scribe
Matt requested the Markdown-style floating annotation action and Scribe rather than a parallel implementation. Add now floats at CodeMirror's visible selection rectangles via the shared BuffalyAnnotationSelection owner extracted from Markdown. Repositions after editor/window/visual-viewport scroll and resize; hidden for collapsed/offscreen selections, modal focus, preview and failed draft loading. Captured exact source endpoints and selected text remain authoritative; pointer-down preserves selection.

The note editor uses host ScribeAutoInit, not a copied recorder/transcriber. Save awaits stopAndWaitForIdle before reading the final note; duplicate saves are suppressed. A failed finalization keeps text/audio recovery and persisted drafts unchanged. Cancel, native dialog Escape, Remove and preview cancel recording; an edit revision prevents an old awaited save from writing into a newly opened or cancelled editor. Native required validation is handled after finalization so a spoken-only note can be saved directly. Existing queue/persisted retry and in-flight note protections remain unchanged.

Validation: SourceAnnotations.cjs passed final-vs-preview text, pending double-save, transcription failure retention, Cancel/Escape/preview during finalization, floating placement/pointer preservation and all prior draft/queue regressions. Other three SourceViewer Node suites, three shared/Markdown Node suites and 31/31 .NET tests passed. Real staging microphone-pipeline/visual proof is recorded separately after normal deployment; no local test is labelled staging.


## 2026-11-24 — Staging correction: anchor to text, not blank selection paint
Real installed 0.1.109 browser inspection showed CodeMirror multi-line paint spans its entire horizontal scroll area, placing the action far right of short selected source. selectionRects now adapts exact CodeMirror character endpoints for only the rendered viewport lines, clipping to editor bounds, before invoking the unchanged shared Markdown positioning owner. It excludes blank end-of-line filler and offscreen editor content without changing source/queue ranges. SourceAnnotations.cjs passes a regression with painted width3900 but selected text width104, anchoring at the text rather than the filler. No shared positioning fork added. Browser correction verification follows the next normal ReleaseOps deployment.
