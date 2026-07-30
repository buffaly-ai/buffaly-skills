# Buffaly Browser Agent

A Manifest V3 Chrome extension that lets Buffaly operate the user's current browser through a typed tool surface. DOM operations use `chrome.scripting`; debugger-backed operations require explicit consent from the side panel and expire after four hours.

The side panel can also embed a configured Buffaly session using the host's frame-enabled Next shell:

`/buffaly-agent-next.html?hideSessionChrome=true&sessionKey=<session-key>`

The Buffaly host must explicitly allow the installed `chrome-extension://<extension-id>` origin through `AppSettings:OpsAgent.EmbeddedTimeline.FrameAncestors`. The iframe owns normal Buffaly session authentication and conversation. It does not receive extension tool messages or debugger-consent authority.

## Development

```sh
npm ci
npm run typecheck
npm run build
```

## Release verification

```sh
npm ci
npm run release:check
```

The release archive is written to `.output/buffaly-browser-agent-<version>-chrome.zip`. Before publishing, manually load `.output/chrome-mv3` in a supported Chrome profile and complete the extension-mode validation matrix in the release report. CDP-direct fallback results are not extension-mode results.

## Permissions

- `sidePanel`: provides the extension UI and debugger-consent control.
- `storage`: persists only the configured Buffaly origin and session key.
- `tabs`: lists, opens, closes, switches, and navigates tabs.
- `scripting`: performs page text and DOM operations.
- `activeTab`: scopes user-initiated access to the active tab.
- `debugger`: provides trusted input, console events, and debugger-backed navigation after explicit consent. Visible-viewport screenshots use `chrome.tabs.captureVisibleTab` and do not require debugger access.
- `<all_urls>` host access: enables the browser tool surface on user-selected web pages. Browser-internal and file URLs are blocked by the extension safety layer.

See `PRIVACY.md` for data handling and disclosure details.
