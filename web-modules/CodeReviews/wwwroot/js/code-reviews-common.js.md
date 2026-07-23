## Shared page utilities`n- Added common query parsing, HTML escaping, date formatting, JsonWs calls, and diff-line classification for the three-page browser.

- 2026-05-07: Refined navigation/cards, normalized displayed paths, added CodeMirror read-only diff rendering, aggregate diff summary, and binary-file sorting for the initial code review browser.

## Build footer (2026-05-21)
- Removed the optional root-host `/build-info.json` footer probe. Package-managed Code Reviews pages no longer depend on a route that may belong only to a different host revision; the functional repository and review contracts remain unchanged.
