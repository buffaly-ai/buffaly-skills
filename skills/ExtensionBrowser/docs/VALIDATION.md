# Buffaly Browser Agent 0.2.25 / WebModule 0.1.20 validation

0.2.25 keeps reusable installation authorization, channel transport, completion persistence, and authenticated acknowledgement in the MV3 service worker. Bound browser tools execute in the persistent side-panel extension page, which receives only tool names, arguments, and results; navigation can no longer terminate the executor before it reports completion. Every completion remains in the durable outbox until the WebModule confirms that it matched the pending invocation. The React state and iframe never receive reusable channel authority.

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
