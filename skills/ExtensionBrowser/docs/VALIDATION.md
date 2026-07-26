# Buffaly Browser Agent 0.2.9 validation

0.2.9 keeps reusable installation authorization in the MV3 service worker and navigates the side-panel iframe with only a single-use conversation token.

Validated 2026-07-26 on Windows Google Chrome:

- `npm run release:check`: PASS
- TypeScript typecheck and WXT production build: PASS
- Chrome MV3 archive: `Buffaly-Browser-Agent-0.2.9-chrome.zip`
- `chrome.identity` installation authorization contract: PASS
- Single-flight installation WebSocket reconnect contract: PASS
- Composite `SessionBindingId` + `InvocationId` completion contract: PASS
- New conversation creates a distinct conversation slot: PASS
- Credentialed authorization, binding creation, and navigation-token issuance are service-worker-owned: PASS
- Side-panel source and production bundle contain no credential-bearing connection object or durable session key: PASS
- Iframe navigation uses the package-owned bootstrap route with `presentation=sidepanel` and a single-use `navigationToken`: PASS

No full Buffaly/IIS deployment or regular-Chrome installation was performed for this source/package validation.
