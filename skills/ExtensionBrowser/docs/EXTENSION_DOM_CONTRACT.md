# Extension DOM Operation Contract

The extension routes DOM discovery and fixed DOM actions through `extension/source/lib/injected-dom-ops.ts`.

## Injection model

- `injectedDomOperation(request)` is passed directly to `chrome.scripting.executeScript` in the isolated world.
- Runtime constants and helper functions are nested inside `injectedDomOperation` because Chrome serializes only the function body. Do not move runtime helpers to module scope unless switching to an injected file entrypoint.
- The isolated world stores element identity in a document-scoped `globalThis` registry using `Map`/`WeakMap`. Element refs are opaque strings and must not be treated as selectors.

## Scope and refs

- Discovery returns opaque `id`/`elementId` refs plus Chrome result scope (`tabId`, `frameId`, `documentId`, `documentToken`).
- Actions should pass the discovered `elementId` and, when known, the returned `frameId`/`documentId`/`documentToken`.
- If both `documentId` and `frameId` are supplied, the router first runs a non-mutating `documentIds` preflight that verifies the document belongs to the requested frame. Only after that succeeds does the mutating operation target the verified `documentId` with the isolated-world document token pinned.
- Ref resolution validates document token and `isConnected`; stale refs fail before side effects and are never silently rebound.

## Selectors

- CSS selectors emitted by discovery are optional convenience metadata. Opaque refs are authoritative.
- A selector is emitted only when it is unique in the same deep action lookup scope used by actions, including open shadow roots.
- If an element has no action-scope-unique CSS selector, discovery returns an empty selector rather than a root-local selector that could later be ambiguous.

## Action limitations

- DOM `click` dispatch reports that the click was executed/dispatched; it does not verify page task success.
- `press_key` dispatches synthetic keyboard events and reports `verifiedNativeAction: false`; it is not a native input action.
- `type_text` supports native text input/textarea value setting with readback validation. Hidden, disabled, readonly, unsupported, unfocused, or obstructed targets fail with `ok:false` before mutation when detectable.
- `contenteditable` typing uses plain-text `textContent` semantics with readback validation. It does not claim rich-editor document-model success.
- Fixed DOM actions do not automatically fall back to debugger control.

## Rendered controls and open shadow roots (2026-10-31)

- Visibility and pointer-events use the target's computed inherited value: a visible/auto child can override a hidden/none ancestor. Ancestor display:none and opacity:0 still block interaction, including across open shadow hosts and assigned slots.
- Focus verification descends nested open shadow roots. Hit testing also descends open roots and checks the composed ancestry of the actual topmost target; a shadow host alone is not evidence that its covered child is actionable.
- SVG targets receive a synthetic MouseEvent click after the existing press/release lifecycle. HTML elements retain HTMLElement.click activation. Neither reports page-task verification.
- Effective disabledness uses :disabled (including fieldsets, the first-legend exception and disabled optgroups) plus explicit target aria-disabled.
- Hover rejects obstruction and its mouse events cross shadow boundaries. Keyboard events target the deepest focused element and are composed. Explicit keyboard targets must be enabled and actually receive focus; readonly focusable fields can still receive keys.
- select_option applies the shared rendered/disabled/obstruction guards, rejects disabled options before mutation and dispatches a composed input event. The change event remains non-composed, matching native select behavior. Value readback remains required.
- Run npm run release:check in extension/source. This now requires real Chrome (CHROME_PATH overrides the Windows default); missing Chrome fails rather than skipping. It includes the 29-check pointer-events suite and 56-check DOM matrix. These execute the full production function in real Chrome without debugger access, not the installed MV3 transport.
