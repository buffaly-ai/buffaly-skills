# Buffaly Browser Agent 0.2.29 / WebModule 0.1.22 validation

0.2.29 keeps reusable installation authorization, channel transport, completion persistence, and authenticated acknowledgement in the MV3 service worker. Bound browser tools execute through one dedicated long-lived port owned by the persistent side-panel extension page, which receives only correlated tool names, arguments, and results. The side panel persists a correlated browser result before returning it to the replaceable worker, so a navigation-triggered worker replacement can recover and deliver the authenticated completion without repeating the browser action. The React state and iframe never receive reusable channel authority.

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
- Duplicate invocation frames reuse durable state and cannot execute navigation twice: PASS
- Interrupted navigation recovery compares canonical URLs and returns an explicit interruption instead of repeating the browser action: PASS
- WebModule reconnect replay is restricted to read-only active-tab inspection and never replays navigation: PASS
- Side-panel bound-tool results are durably keyed by session binding plus invocation ID before worker handoff: PASS
- New conversation creates a distinct conversation slot: PASS
- Same-owner child-agent actions resolve the immutable parent session binding through bounded canonical ancestry: PASS
- Credentialed authorization, binding creation, and navigation-token issuance are service-worker-owned: PASS
- Side-panel source and production bundle contain no credential-bearing connection object or durable session key: PASS
- Iframe navigation uses the package-owned bootstrap route with `presentation=sidepanel` and a single-use `navigationToken`: PASS

The source gates above do not substitute for the required isolated staging WebModule deployment and regular-Chrome conversation acceptance.
