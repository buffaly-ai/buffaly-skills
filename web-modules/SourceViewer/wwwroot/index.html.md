# SourceViewer standalone page

Read-only SourceViewer shell for explicit file and directory targets. The shared header identifies source language for files and `DIR` for directories. File targets use CodeMirror; HTML files also expose an obvious Preview/Source toggle backed by a credentialless iframe sandboxed with scripts but without same-origin access. Directory targets use a scrollable immediate-child navigation region. Copy remains available for source files in either HTML mode, while Close remains available for all targets.

## 2026-11-23 — Source annotation shell
Loads the shared syntax palette and annotation controller before the standalone viewer. Adds the initially hidden annotation toolbar/dialog host; file loading activates it, directory/HTML preview do not. Asset revisions prevent stale language/script/CSS combinations. Existing sandbox, credentialless iframe and Copy/Close markup retained. Validation: Node suites for annotations/highlighting/line links/preview passed and .NET31/31 passed; installed browser evidence follows in session acceptance record.

## 2026-11-23 — Review correction asset revisions
Bumps shared CSS and annotation-controller query revisions to 4 for the fail-closed draft-load guard and shared command/icon presentation. No source-reader, caller, sandbox or preview contract changes. Validation: all four Node suites and .NET31/31 passed; local managed-browser fixture loaded this page and the bundled icon fonts for five annotation states. Not installed or validated on staging at this entry.


## 2026-11-24 — Shared annotation dependencies
Loads the existing host /js/scribe.js and linked shared Markdown selection-placement asset before the source annotation controller. Bumps controller/CSS revision to 5. Source selection/draft/queue behavior stays module-owned; capture/transcription is not copied. Staging already exposes the required ScribeAutoInit and stopAndWaitForIdle contract (HTTP 200 source inspection). Validation: four SourceViewer Node suites and 31/31 .NET tests pass; real package build passes and includes the linked asset. No core installation replacement is needed to deliver the linked helper.


## 2026-11-24 — Selection-coordinate correction revision
Bumps source-annotations.js to revision6 after actual staging exposed the oversized CodeMirror multi-line paint rectangle. Other assets/commands and Scribe owner unchanged. SourceAnnotations.cjs passed the actual-text-endpoint regression. Installed proof follows normal extension redeployment.
