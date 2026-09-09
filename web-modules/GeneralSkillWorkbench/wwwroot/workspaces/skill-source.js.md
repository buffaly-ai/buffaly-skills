# skill-source.js

Renders one package-owned workflow prompt in a readable General Workbench page. It resolves the exact workflow through the typed Workspaces service, fetches only its catalog-owned work-prompt path through the root-relative `/api/package-reference` route, formats Markdown with the vendored `marked` library, escapes raw HTML, and allowlist-sanitizes generated elements and attributes. Visible viewer chrome is ASCII-safe for decoder compatibility. The page provides explicit workspace navigation and a same-origin workflow launch.
