# Source annotation controller

## 2026-11-23 — Initial implementation
Mounts source selection actions and a native modal note editor on read-only CodeMirror. Records canonical path, exact selected text, one-based inclusive line labels and precise CodeMirror endpoints. Drafts are scoped to caller and canonical path. Inline notes support edit/remove; source text is never written. Changed source retains original note selections and labels instead of silently rebinding.

Uses the existing browser queue-input boundary, matching Markdown viewer admission semantics. Persists the complete keyed submission before sending; uncertain retries use that exact input/key across reloads. Requires Accepted=true and matching MessageKey, removes only exact submitted revisions, and retains edits made in flight. Pending submissions remain retryable even if notes were cleared before local submission cleanup. Missing caller cannot send. Preview disables the toolbar. User text renders with textContent.

Validation: SourceAnnotations.cjs passed draft/edit/remove, exact lines/text, literal hostile markup, reload/path-caller scoping, rejected/mismatched receipt retention, uncertain duplicate-safe retry, in-flight revision preservation, missing caller and preview deactivation. .NET31/31 and existing JS suites passed. Staging acceptance is separate from simulated queue tests.

## 2026-11-23 — Review corrections: unread drafts and command presentation
Confirmed the initial-load catch could be undone by cursorActivity, allowing an empty in-memory list to replace unread stored drafts. A fail-closed draftsReady guard now controls update/open/persist/submit and form submission. It becomes true only after saved notes parse, validate and render successfully. Selection and preview activation cannot enable mutation after a failed load; original stored bytes remain untouched until a successful reload.

Annotation commands now use module-owned Font Awesome 5 Free icons and the existing shared actions/primary styles. A selected range has primary Add; a ready or pending batch has primary Send; the modal has primary Save. The sending status remains authoritative during cursor changes, and final receipt messages are rendered after busy clears. Queue payload, admission verification, retry identity and in-flight revision preservation are unchanged.

Validation: SourceAnnotations.cjs passed transient initial read failure, malformed JSON, invalid draft, exact stored-byte preservation despite forced clicks/form submission and recovered storage, successful reload/edit, all five command states, required icons, and existing queue regressions. All four Node suites and .NET31/31 passed. Managed-browser fixture walkthrough captured no-selection, selection, ready-to-send, editing and sending views with loaded icon fonts. This is local fixture evidence, not staging or actual recipient delivery; those earlier acceptance blockers remain.
