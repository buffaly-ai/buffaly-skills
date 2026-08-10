# CdpBrowser Skill

Explicit CDP/real-Chrome browser automation skill. Generic browser requests route to Browser Skill / `UseBrowserSkill`; use this package only for explicit CDP, Chrome DevTools Protocol, real Chrome, existing-login preservation, or trusted CDP input requirements.

## Overview

CDP browser automation skill that connects to the user's real Chrome instance via the Chrome DevTools Protocol (CDP). Preserves logged-in sessions, avoids anti-bot detection, and uses trusted input events.

## Architecture

- ProtoScript actions (52 total) in `index.pts`
- Bundled Node.js CDP helper (`lib/cdp_helper.bundle.js`) containing the pinned `chrome-remote-interface` runtime dependency
- Typed actions capture helper stdout separately from stderr, clean the runtime streaming envelope, and return either the non-empty helper JSON or an explicit launch/timeout/no-output diagnostic.
- Session state stored in `/tmp/buffaly-cdp-sessions.json`
- Approval grant stored in `<session-dir>/.cdp/grant.json`

## Action Tiers

### Tier 1: Default (22 actions)
Available without approval. Non-detectability-increasing, least-privilege.

- Session management: open, close, list
- Navigation: navigate, get URL, get title, go back, go forward
- DOM interaction (trusted input): click, type, press key, press selector key, hover, scroll, select option
- DOM inspection (read-only): get text, get attribute, check exists, wait for selector, get viewport
- Capture: screenshot, console events
- Secret-aware: fill selector with secret, fill password with secret

### Tier 2: Privileged (27 actions + 1 reset)
Require session-scoped approval. Each action checks `ToCdpCheckAdvancedApproved()` first.

- Chrome lifecycle: launch, check, close
- JavaScript execution: run script, run mutation script, run automation
- File upload
- Cookie access: get (redacted), set
- Network monitoring
- Tab management: list, create, close
- Reload (cache bypass)
- Page content: selector HTML, page HTML
- Browser fingerprint modification (9 actions): user agent, device metrics, geolocation, timezone, extra headers, script injection, touch emulation, CSP bypass, cache disable
- Override reset: clear all fingerprint overrides

### Approval actions (2)
- `ToApproveCdpAdvancedActions` -- enables Tier 2 for 4 hours
- `ToRevokeCdpAdvancedActions` -- revokes Tier 2 approval

## Chrome Setup

Chrome must be running with remote debugging enabled:

`ToLaunchCdpChrome` discovers Chrome from standard Windows, macOS, and Linux installation locations and launches it with a dedicated profile and localhost remote-debugging port.

Or use `ToLaunchCdpChrome` (Tier 2) to launch automatically.

## Dependencies

- Node.js >= 18.0
- `chrome-remote-interface` >= 0.33 is bundled into the published helper; installed skills do not run `npm install`
- Chrome >= 136

## Package build

Run `npm ci` followed by `npm run build` in `lib` before publishing. The package ships `cdp_helper.bundle.js`; `node_modules` remains authoring-only and is never required or mutated in an installed OpsAgent skill.

The installed action path is always `Skills/CdpBrowser/lib/cdp_helper.bundle.js`; `cdp_helper.js` is authoring input only and must never be selected by a runtime action.

## Security

- CDP endpoint is localhost only (127.0.0.1)
- Cookie values are redacted in `ToGetCdpCookies` returns
- Tab ownership is tracked and enforced
- Approval grant is session-scoped with 4-hour expiry
- Override state is tracked and reset on session close
- Malformed grants are rejected (fail-closed)
