# Source annotation controller

## 2026-11-23 — Initial implementation
Mounts source selection actions and a native modal note editor on read-only CodeMirror. Records canonical path, exact selected text, one-based inclusive line labels and precise CodeMirror endpoints. Drafts are scoped to caller and canonical path. Inline notes support edit/remove; source text is never written. Changed source retains original note selections and labels instead of silently rebinding.

Uses the existing browser queue-input boundary, matching Markdown viewer admission semantics. Persists the complete keyed submission before sending; uncertain retries use that exact input/key across reloads. Requires Accepted=true and matching MessageKey, removes only exact submitted revisions, and retains edits made in flight. Pending submissions remain retryable even if notes were cleared before local submission cleanup. Missing caller cannot send. Preview disables the toolbar. User text renders with textContent.

Validation: SourceAnnotations.cjs passed draft/edit/remove, exact lines/text, literal hostile markup, reload/path-caller scoping, rejected/mismatched receipt retention, uncertain duplicate-safe retry, in-flight revision preservation, missing caller and preview deactivation. .NET31/31 and existing JS suites passed. Staging acceptance is separate from simulated queue tests.
