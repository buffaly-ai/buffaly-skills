# Buffaly Browser Agent 0.2.40 / WebModule 0.1.34 validation

0.2.40 retains explicit `microphone` delegation on the cross-origin Buffaly conversation iframe. Chrome microphone access is a page-origin permission requested by the embedded Buffaly composer; `audioCapture` is a DevTools automation permission name, not a valid Chrome extension manifest permission, so it must not be added to the extension authority set.

0.2.39 keeps reusable installation authorization, channel transport, completion persistence, and authenticated acknowledgement in the MV3 service worker. Bound browser tools execute through one dedicated long-lived port owned by the persistent side-panel extension page, which receives only correlated tool names, arguments, and results. The side panel persists a correlated browser result before returning it to the replaceable worker, so a navigation-triggered worker replacement can recover and deliver the authenticated completion without repeating the browser action. The React state and iframe never receive reusable channel authority.

0.2.39 presents Chat and Agent as mutually exclusive full-panel tabs while keeping both tab panels mounted. The inactive panel is hidden and inert, so Chat -> Agent -> Chat does not remount the iframe, reuse its single-use navigation token, or discard in-progress iframe state. Chat visibly renders only the embedded conversation; Agent visibly renders only current-page controls and browser activity. The former nested Chat/Activity navigation and vertical Agent-controls-plus-chat split remain removed. Full-tab pop-out is authorized by the service worker, issues a fresh single-use navigation token for the existing binding, and explicitly requests the WebModule's `standard` presentation. Neither the component nor the opened URL receives a durable session key or installation credential.

WebModule 0.1.28 defines the package-owned `ExtensionBrowserBoundSession` prompt context already assigned by Chrome conversation creation. It makes the bound active tab live conversational context, requires fresh active-tab/page evidence before page-dependent answers, preserves prompt-injection and consequential-action confirmation boundaries, and does not force page reads for unrelated questions. It also retains the dedicated bound visible-page action that routes natural-language read/summarize requests to the existing safe `get_page_text` capability. The generic bound invoker documents its exact supported tool names and explicitly does not expose arbitrary JavaScript or a `runScript` tool. It validates the requested presentation as either `sidepanel` or `standard`. The compact iframe redeems into `presentation=sidepanel`; full-tab pop-out redeems the same one-time-token contract into the normal Buffaly conversation without the side-panel presentation flag. It also exposes owner-checked per-session and installation revoke operations; installation revoke immediately detaches the live channel while retaining child binding records and conversation history. Channel authenticate/publication/connected-state persistence shares the installation revoke lock, and failed publication is rolled back, so a reconnect cannot become routable after revocation.

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
- Live workers race the normal port reply against the same durable result journal, with replacement-worker recovery as fallback: PASS
- New conversation creates a distinct conversation slot: PASS
- Same-owner child-agent actions resolve the immutable parent session binding through bounded canonical ancestry: PASS
- Credentialed authorization, binding creation, and navigation-token issuance are service-worker-owned: PASS
- Side-panel source and production bundle contain no credential-bearing connection object or durable session key: PASS
- Iframe navigation uses the package-owned bootstrap route with `presentation=sidepanel` and a single-use `navigationToken`: PASS

The source gates above do not substitute for the required isolated staging WebModule deployment and regular-Chrome conversation acceptance.

- Live WebSocket completions receive a typed correlation acknowledgement before durable outbox removal; authenticated HTTP remains the recovery path: PASS

- Visible side-panel executor sends one 20-second port heartbeat, cleared on disconnect/unmount, to prevent MV3 suspension without reconnect fan-out: PASS
