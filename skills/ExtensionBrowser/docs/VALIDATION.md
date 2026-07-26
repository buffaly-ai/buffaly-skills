# Buffaly Browser Agent 0.2.0 validation

Validated source commits:

- Chrome extension: `dc6b25fa372033e19b32306d5d0fc5eababf6dbf`
- ExtensionBrowser skill: `812982b7767a1809baaadb6ee72f80b01922c4a1`
- Worker recovery implementation: `4111b77580939ff0afb372dc59aac17decaa2dc9`

## Release build — PASS

A clean `npm ci` followed by `npm run release:check` passed on 2026-07-26. This includes strict TypeScript checking, WXT production build, ZIP generation, manifest/version/icon/archive checks, and `npm audit --omit=dev` with zero production vulnerabilities. The packaged ZIP is 71.3 KB.

## Genuine extension mode — PASS

Validated on Chromium 136 with the exact committed release output:

- Bridge connected with `mode=extension`.
- Manifest APIs and `self.__callTool` were present in the real extension service worker.
- The Buffaly Browser Agent content script injected in an isolated world.
- All 26 routed browser tools were exercised through the real service worker.
- Navigation and content-script reinjection passed.

## Consent lifecycle — PASS

Before side-panel consent, debugger-backed calls were denied. After the user clicked **Attach debugger** in the true side panel, screenshot, trusted keyboard input, console collection, and navigation passed. After **Stop (detach)**, consent was revoked and debugger-backed calls were denied again.

## Worker lifecycle — PASS

After forced service-worker termination, the bridge returned explicit `SW_UNAVAILABLE` in 9.178 seconds, below the 30-second client deadline, and health changed to `connected=false`, `mode=none`. Initial startup fallback remained available separately. No keepalive workaround was added.

## Package boundary

This package contains only the ExtensionBrowser ProtoScript skill, bridge/helper, tracked extension source, release artifact, and publication documentation. It does not alter or include the unrelated BrowserSession skill or shared OpsAgent DLLs.

## External Chrome Web Store requirements

The code/package validation gates are complete. Store submission still requires:

1. A publicly hosted URL for `extension/source/PRIVACY.md`.
2. Chrome Web Store listing graphics, support contact, and listing copy.
3. Upload and review in the publisher's Chrome Web Store account.