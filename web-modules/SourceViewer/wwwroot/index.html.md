# SourceViewer standalone page

Read-only SourceViewer shell for explicit file and directory targets. The shared header identifies source language for files and `DIR` for directories. File targets use CodeMirror; HTML files also expose an obvious Preview/Source toggle backed by a credentialless iframe sandboxed with scripts but without same-origin access. Directory targets use a scrollable immediate-child navigation region. Copy remains available for source files in either HTML mode, while Close remains available for all targets.
