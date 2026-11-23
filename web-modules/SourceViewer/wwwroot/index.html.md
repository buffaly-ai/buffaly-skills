# SourceViewer standalone page

Read-only SourceViewer shell for explicit file and directory targets. The shared header identifies source language for files and `DIR` for directories. File targets use CodeMirror; HTML files also expose an obvious Preview/Source toggle backed by a credentialless iframe sandboxed with scripts but without same-origin access. Directory targets use a scrollable immediate-child navigation region. Copy remains available for source files in either HTML mode, while Close remains available for all targets.

## 2026-11-23 — Source annotation shell
Loads the shared syntax palette and annotation controller before the standalone viewer. Adds the initially hidden annotation toolbar/dialog host; file loading activates it, directory/HTML preview do not. Asset revisions prevent stale language/script/CSS combinations. Existing sandbox, credentialless iframe and Copy/Close markup retained. Validation: Node suites for annotations/highlighting/line links/preview passed and .NET31/31 passed; installed browser evidence follows in session acceptance record.
