# SourceViewer styles

Owns the standalone SourceViewer shell, CodeMirror token presentation, isolated full-height HTML-preview iframe, and bounded directory-list layout. Directory rows expose only type and name, preserve long-name truncation, distinguish disabled entries, and scroll within the viewer. Full-height source/preview rendering, responsive actions, and operating-system light/dark themes remain supported.

## 2026-11-23 — Shared annotation presentation
Adds the standalone annotation toolbar, native modal note form, range marking and inline editable notes using the existing package command owner; no new text sizes. Moves token colors to source-syntax.css so embedded and standalone source use one palette. Dark dialog/mark/note styles follow the existing system theme. Main task: read source and send selected-line notes. Annotate selection appears for a selection; Send annotations appears for drafts with a caller; Save/Cancel/Remove operate on the active note. Existing Copy/Preview/Close remain unchanged. Validation: annotation DOM interaction suite passed; real staging screenshot walkthrough pending at this entry.
