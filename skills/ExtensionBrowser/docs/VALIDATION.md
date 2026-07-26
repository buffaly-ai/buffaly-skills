# Buffaly Browser Agent 0.2.1 validation

0.2.1 fixes two installed-runtime defects found during Windows IIS smoke testing:

- Helper and bridge paths now resolve from the active OpsAgent project directory instead of scanning `$HOME`.
- The CDP bridge resumes a newly discovered MV3 service worker before probing `self.__callTool`.

## Release build — PASS

A clean `npm ci` followed by `npm run release:check` passed on 2026-07-26. This includes strict TypeScript checking, WXT production build, ZIP generation, manifest/version/icon/archive/bridge-hook checks, and `npm audit --omit=dev` with zero production vulnerabilities.

Bridge lifecycle validation also covers one in-flight reconnect attempt shared by every close/tool trigger, bounded retry scheduling without resetting connection ownership, session-owned PID and lease files, explicit stop cleanup, and automatic termination after lease expiry.

## Installed helper resolution — PASS

The skill resolves `extension_helper.js` and `bridge.js` from `_opsAgent.GetCurrentProjectDirectory()/Skills/ExtensionBrowser/lib`. This was validated against the Windows IIS Matt-local project layout that exposed the 0.2.0 defect.

## Genuine extension mode — PASS

Validated on Chromium 140 with the exact 0.2.1 production build:

- Bridge connected with `mode=extension`.
- `get_status` passed through the real extension service worker and returned the active tab.
- Service-worker discovery rejected unrelated Chrome extension workers instead of accepting any `chrome-extension://` target.
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
