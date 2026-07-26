# Buffaly Browser Agent

A Manifest V3 Chrome extension that lets Buffaly operate the user's current browser through a typed tool surface. DOM operations use `chrome.scripting`; debugger-backed operations require explicit consent from the side panel and expire after four hours.

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
- `tabs`: lists, opens, closes, switches, and navigates tabs.
- `scripting`: performs page text and DOM operations.
- `activeTab`: scopes user-initiated access to the active tab.
- `debugger`: provides trusted input, screenshots, console events, and debugger-backed navigation after explicit consent.
- `<all_urls>` host access: enables the browser tool surface on user-selected web pages. Browser-internal and file URLs are blocked by the extension safety layer.

See `PRIVACY.md` for data handling and disclosure details.
