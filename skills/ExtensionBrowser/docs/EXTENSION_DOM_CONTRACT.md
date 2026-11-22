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
- select_option applies rendered/disabled/obstruction guards, rejects disabled options before mutation and dispatches a composed input event. The change event remains non-composed, matching native select behavior. Value readback remains required. A native select's own opacity may be zero only with a fresh opaque `presentationElementId` for its immediate visible shell, containing visible text/image/SVG/canvas presentation and enclosing the control geometry. Shell and decorative content prove visibility, not pointer actionability: their pointer-events may be none (direct or inherited) when the native select explicitly restores auto. The select itself must still have enabled computed pointer-events and pass actual hit testing. Parent opacity, hidden/inert/aria-hidden state, disabledness and obstruction remain blocking; a custom widget's hidden backing select is not an alternative action surface.
- `terminal_paste_text` is separate from ordinary `type_text`. It takes observed opaque `inputElementId` (textarea), `terminalElementId` (composed owner, never html/body) and `presentationElementId` (actual painted surface in that owner). All refs resolve in the same pinned document. Owner and presentation must be visible; nearest scroll alignment preserves an already usable clipped surface, then the presentation's center must hit that exact element through open roots, not a covering child of a broad container. The proxy alone may be transparent/tiny/pointer-transparent, but cannot be hidden/inert/disabled/readonly or inside a hidden/disabled/readonly owner, and must actually receive deep focus.
- Terminal delivery backend: one synthetic, composed clipboard-data paste event, without reading/writing the OS clipboard, assigning the proxy value, dispatching change/input/keyboard fallback, or submitting Enter. Reject empty strings, control characters and line separators. It always returns `synthetic:true`, `verified:false`, `delivery:'unverified'`; neither cancellation nor a cleared proxy proves delivery. Verify terminal-visible output separately before claiming success or retrying. Trusted-input-only and non-paste consumers are unsupported. Extension tool logs omit the text payload. This contract does not assert CloudShell's live consumer accepts synthetic paste.
- Ordinary `type_text` retains replace/append/clear, focus and retained-value readback. No force/bypass argument or debugger fallback was introduced. Hidden/inert/aria-hidden owners remain blocked across composed ancestry.
- Run npm run release:check in extension/source. This requires real Chrome (CHROME_PATH overrides the Windows default); missing Chrome fails rather than skipping. It includes the 29-check pointer-events suite and 143-check DOM matrix, plus 38 executable argument checks. These execute the full production function in real Chrome without debugger access, not the installed MV3 transport or live site acceptance.
