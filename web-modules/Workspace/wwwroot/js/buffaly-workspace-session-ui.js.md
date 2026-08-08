# buffaly-workspace-session-ui.js Change History

## Explicit Attachment Visibility (2026-08-08)

- Changed the Agent Next header contribution to request only `/Workspace/identity` and render the existing `.bws-chip` when the current session has its own workspace link.
- Unattached sessions render no Workspace button; identity responses are cached in memory for the current page to avoid repeat requests during header remounts.
- The button links directly with both the resolved workspace key and active session key, while full workspace sessions and artifacts remain deferred to the workbench.

## Deferred Workspace Resolution (2026-08-08)

- Kept the existing Agent Next `sessionHeader.context` contribution and `.bws-chip` appearance, but reduced it to one `Workspace` navigation link.
- The link carries only the active `sessionKey` to `/workspace/workbench.html`; Agent Next no longer requests the current workspace summary or hydrates workspace sessions and artifacts.
- Design Decision: resolve the session's workspace only after the user opens the Workspace page, because ordinary Agent Next text sessions do not need workspace hierarchy data.

## Header Summary Browser Cache (2026-08-03)

- Added a small `sessionStorage` cache for the current-session workspace summary so Agent Next header reloads can reuse the last known workspace link immediately.
- The cache remains browser-side only and every load still starts a background no-store request to refresh the authoritative WebModule response.
- The fresh background response re-renders the current header contribution when cached data was used, so workspace attachment or display-name changes are visible without waiting for another page reload.

## Full WebModule Shortcut (2026-08-01)

- Simplified the Agent Next header contribution to a direct `Workspace: <name>` link into `/workspace/workbench.html`.
- Removed the header dropdown/drawer behavior from this contribution; workspace browsing now belongs to the full Workspace WebModule pages.
- Kept the optional Next-shell host guard so generic WebModule AgentScripts can load on non-next-shell pages without throwing.

## Initial Next-Shell Contribution (2026-07-21)

- Registered `workspace.current-session` through `BuffalyAgentNextExtensions` at `sessionHeader.context`.
- Added attached/unattached rendering and deterministic disposal below the provided slot.
- Design Decision: the module never queries private next-shell selectors; all feature markup and state are owned below the provided slot.

## Runtime JSON Contract (2026-07-21)

- Read the module endpoint's ASP.NET Core camel-case JSON properties directly.
- Keep the browser fixture in the same wire shape so client tests detect serialization-contract drift.
