Use this action when the user wants fast recursive text search in local files and directories.

What it does
- Searches a directory tree with ripgrep (`rg`) for a literal text match.
- Returns rg stdout so results include file names, line numbers, and matching lines.
- Intended for quick workspace inspection when the built-in directory search is not sufficient or when ripgrep is preferred.

Usage notes
- `directoryPath` must point to an existing directory.
- `text` is treated as a literal string match, not a regex.
- The action should fail fast with a clear error if inputs are missing or the directory does not exist.
- Keep the wrapper thin; do not reimplement search logic in ProtoScript beyond parameter checks and command execution.

Expected output
- A string containing ripgrep output, or a clear error/no-match message.

When to use
- Search source trees, session folders, and local workspace files.
- Prefer this action when users explicitly ask for ripgrep/rg-based search or need fast recursive literal matching.