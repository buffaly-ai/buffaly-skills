# Extension Browser Skill

## Overview

Extension Browser is the Buffaly skill package for the **Buffaly Browser Agent** Manifest V3 Chrome extension. It exposes typed browser actions through a persistent local bridge to the extension service worker.

## Package contents

- `index.pts` and `PromptActions.pts`: ProtoScript skill and discovery phrases.
- `lib/bridge.js`: persistent bridge with bounded extension-worker recovery.
- `lib/extension_helper.js`: direct helper used by raw and diagnostic actions.
- `extension/source`: reproducible Buffaly Browser Agent source maintained with this skill.
- `extension/release/Buffaly-Browser-Agent-0.2.49-chrome.zip`: Chrome Web Store upload artifact produced by `npm run release:check`.
- `docs/VALIDATION.md`: executed publication-gate evidence and remaining store-hosting requirements.

## Runtime requirements

- Chrome or Chromium 136 or newer.
- Node.js 18 or newer for the local bridge.
- A loaded Buffaly Browser Agent extension.
- Explicit side-panel consent for debugger-backed tools. Consent expires after four hours and can be revoked immediately.

## Security model

DOM operations use `chrome.scripting`. Screenshots, trusted keyboard input, console collection, and debugger-backed navigation require user consent from the true extension side panel. The bridge never silently changes from an established extension-mode session to CDP-direct mode after a stopped worker.

## Build the Chrome artifact

From `extension/source`:

```sh
npm ci
npm run release:check
```

The generated archive must match version 0.2.49 and pass `scripts/verify-release.mjs` before staging the indexed release artifact. Saved servers have an explicit settings surface for viewing state/version/authorization, renaming, changing origins, and removal. Changing an origin never transfers the old server credential or conversation authority. Save server validates origins inside the service worker's asynchronous response path and acknowledges persisted state before health or channel work, so malformed input reports an error while authorized-but-offline servers remain editable. Persisted conversation pointers identify their owning installation registration; reconnect never restores an immutable binding owned by another installation. Every Send and Steer page-context snapshot includes URL, title, active tab ID, and capture timestamp. The extension-owned side panel captures microphone audio after a direct user grant and supplies the trusted conversation iframe with a short-lived live track; the iframe receives neither extension authority nor a reusable credential, and the obsolete server-origin setup-tab flow must not return.
