# source-viewer-module.js

Self-contained registered Web Component entry for the read-only `file` screen. It loads the module-owned CodeMirror assets, calls the canonical source-file endpoint for the explicitly supplied local path, renders the exact returned file, and optionally focuses a one-based line or highlights the first exact text match. It exposes `configure()`, `start()`, and `dispose()` for the shared interactive host and emits the standard ready/error events. It contains no browsing or mutation behavior.
