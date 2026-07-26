# Buffaly Browser Agent 0.2.7 validation

0.2.7 replaces manual session-key targeting with extension-owned Buffaly authorization and automatic per-conversation binding.

Validated 2026-07-26 on Windows Google Chrome:

- `npm run release:check`: PASS
- TypeScript typecheck and WXT production build: PASS
- Chrome MV3 archive: `Buffaly-Browser-Agent-0.2.7-chrome.zip`
- `chrome.identity` installation authorization contract: PASS
- Single-flight installation WebSocket reconnect contract: PASS
- Composite `SessionBindingId` + `InvocationId` completion contract: PASS
- New conversation creates a distinct conversation slot: PASS
- Side-panel component contains no installation credential: PASS
- Built payload synchronized to `C:\Users\Administrator\AppData\Local\Buffaly\ExtensionBrowser\regular-current`; source/installed background and icon hashes match.
- Regular Chrome accepted canonical extension ID `bnlbbfibgdaplbijcbddfmcodkoeoedi` and directly resolved its `sidepanel.html` extension URL.

No full Buffaly/IIS deployment was performed for this extension-only validation.
