# Shared SourceViewer syntax palette

## 2026-11-23 — Initial implementation
Owns token colors for both viewer entry points: keywords, types, functions, properties, strings, comments, numbers/atoms and metadata/tags/builtins. Uses restrained light/dark palettes with visible gutters and selection/caret colors. No text-size or command styles are duplicated here. Source highlighting remains lexical and uses bundled/local assets only. Validation: SourceHighlighting.cjs passes token-category generation; browser color/screenshot verification is recorded separately in staging acceptance.
