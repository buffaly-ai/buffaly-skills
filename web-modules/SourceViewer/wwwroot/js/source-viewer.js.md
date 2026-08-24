# Standalone SourceViewer script

Loads one explicitly supplied local source file through `/api/buffaly.source-viewer/source-file`, detects the language from the canonical opened `model.path`, lazily loads the required bundled CodeMirror modes, and initializes a read-only editor with line numbers. Copy writes the editor's exact source text, not rendered markup. Title and status separators are intentionally ASCII to remain stable across packaging and review encodings. Close, path, byte count, explicit-local-path behavior, and text fallback remain unchanged.
