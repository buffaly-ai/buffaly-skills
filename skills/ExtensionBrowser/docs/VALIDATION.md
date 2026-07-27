# Buffaly Browser Agent 0.2.21 / WebModule 0.1.20 validation

0.2.21 keeps reusable installation authorization in the MV3 service worker, keeps the package-owned channel alive with typed heartbeats and single-timer recovery after initial connection failures, persists non-secret correlated completions, and journals only idempotent `navigate` / `get_active_tab` invocations through navigation worker replacement. A resumed navigation now acknowledges an already reached target without navigating again and replacing the recovery worker. The replacement worker applies its own installation credential while flushing; the iframe and stored records never receive reusable authority.

Validated 2026-07-26 on Windows Google Chrome:

- `npm run release:check`: PASS
- TypeScript typecheck and WXT production build: PASS
- Chrome MV3 archive: `Buffaly-Browser-Agent-0.2.12-chrome.zip`
- `chrome.identity` installation authorization contract: PASS
- Single-flight installation WebSocket reconnect contract: PASS
- Initial WebSocket failure recovery with one reconnect timer: PASS
- Composite `SessionBindingId` + `InvocationId` completion contract: PASS
- Authenticated HTTP completion delivery with strict type/schema validation and bounded retry: PASS
- Navigation completion is persisted before delivery, flushed on replacement-worker startup, acknowledged before removal, and expired after 45 seconds: PASS
- Only idempotent bound navigation and active-tab reads are resumed from the 45-second invocation journal: PASS
- New conversation creates a distinct conversation slot: PASS
- Same-owner child-agent actions resolve the immutable parent session binding through bounded canonical ancestry: PASS
- Credentialed authorization, binding creation, and navigation-token issuance are service-worker-owned: PASS
- Side-panel source and production bundle contain no credential-bearing connection object or durable session key: PASS
- Iframe navigation uses the package-owned bootstrap route with `presentation=sidepanel` and a single-use `navigationToken`: PASS

The source gates above do not substitute for the required isolated staging WebModule deployment and regular-Chrome conversation acceptance.
