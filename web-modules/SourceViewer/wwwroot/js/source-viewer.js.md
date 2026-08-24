# source-viewer.js

Loads one explicitly supplied local source file through `/api/buffaly.source-viewer/source-file`, initializes CodeMirror read-only with `javascript`, `text/x-csharp`, or plain text mode, and supports copy/close only. The API returns the canonical opened path and exact source text using camelCase JSON serialization; configured-root membership is not part of the request policy.
