# Source language detection

Shared browser mapping for both SourceViewer entry points. It detects presentation from the canonical opened filename returned by the API, maps known source extensions case-insensitively to a language label and CodeMirror mode, and declares the ordered local mode assets required by each language. `.patch` and `.diff` use distinct PATCH/DIFF labels with the bundled `text/x-diff` mode. Unknown or extensionless text falls back to plain text; no network assets are used.
## 2026-11-23 — Shared C# presentation adapter
C# now selects source-csharp over clike and declares its module-owned adapter. Other extensions and mode dependencies are unchanged. SourceHighlighting.cjs passed with real CodeMirror tokenization; ownership and existing .NET suite31/31 passed.
