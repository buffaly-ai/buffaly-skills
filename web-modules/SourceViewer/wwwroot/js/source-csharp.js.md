# Module-owned C# highlighting adapter

## 2026-11-23 — Initial implementation
Wraps the unmodified bundled clike mode with modern contextual keywords, arbitrary-length raw delimiters, interpolated/verbatim string prefixes and preprocessor styling. Lexical identifiers distinguish method calls/declarations, PascalCase types and member properties; this is presentation, not compiler symbol resolution. It never changes editor text or authorization. Shared language mapping loads it for standalone and embedded viewers.

Validation: SourceHighlighting.cjs passed with real CodeMirror StringStream/state for record/required/init, types and calls, multiline raw strings containing comment markers, verbatim/interpolated strings, directives, numeric/boolean/comment tokens and exact reconstructed source text. Full .NET31/31 passed. Staging browser acceptance tracked separately.
