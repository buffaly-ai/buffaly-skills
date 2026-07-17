# Use Desktop Interaction Skill

Use this prompt skill when a task requires visible desktop or non-browser application interaction. This skill is guidance only: it does not start a task runner, create a child session, choose a provider, choose a model, or call an API key. The active Buffaly agent session and its selected provider/model remain authoritative.

## Capability Routing

Choose the highest reliable surface for each step:

1. Domain-specific typed action when one owns the workflow.
2. Direct service or native application API.
3. BrowserSession or Playwright locator/DOM action for web content.
4. Accessibility or UI Automation semantic element action when available.
5. Bound application-window capture and window-relative desktop action.
6. Global desktop screenshot and absolute-coordinate action only as a last resort.

Do not use desktop coordinates for browser work that BrowserSession or Playwright can perform. Do not open an existing image in a browser or desktop viewer when the selected model can receive the image artifact directly.

## Observe, Act, Verify

Run one bounded loop:

1. Resolve the target.
2. Observe the current state with the smallest reliable observation.
3. Choose one minimal action or one compact deterministic batch.
4. Execute through a typed tool.
5. Verify the expected state change.
6. Continue, complete, ask for user input, or fail explicitly.

Never act from a stale screenshot after the window may have moved, resized, navigated, or changed focus. After navigation, submission, popup creation, focus change, or layout change, observe again before coordinate input. Stop as soon as the requested outcome is proven.

## Desktop Window Binding

For desktop application work:

1. Resolve the window with `ToResolveDesktopWindow(processName, windowTitleContains)`.
2. Store the returned process ID, exact title, native handle, and bounds.
3. If multiple windows are plausible, disambiguate by exact title, process ID, or task context before acting.
4. For each action, pass the same process name/title substring and the resolved `WindowHandle`.
5. Use native window-relative actions only with native window coordinates.
6. Use image-relative actions with `NativeWindowWidth`, `NativeWindowHeight`, `ImageWidth`, and `ImageHeight` from the screenshot artifact.
7. Let the driver revalidate, restore, foreground, refresh bounds, validate capture bounds, and translate coordinates.
8. Treat stale or mismatched handle or bounds errors as binding failures. Re-resolve and re-capture deliberately before retrying.

Bound actions include `ToFocusDesktopWindow`, `ToCaptureDesktopWindowScreenshotFile`, `ToClickDesktopWindow`, `ToDoubleClickDesktopWindow`, `ToScrollDesktopWindow`, `ToClickDesktopWindowImage`, `ToDoubleClickDesktopWindowImage`, `ToScrollDesktopWindowImage`, `ToTypeDesktopWindowText`, and `ToPressDesktopWindowKeys`.

## Screenshots And Coordinates

Prefer a selected-window screenshot over a full desktop screenshot. Persist PNG evidence when it may be reviewed, reused, or included in proof. The capture result reports target identity, native bounds, image dimensions, scale factors, MIME type, hash, and file path.

Click the center of a stable visual target, not an edge. Use native window-relative coordinates for native bound desktop actions. Use image-relative coordinates only with the matching screenshot artifact dimensions. Do not add screen offsets yourself; the driver refreshes bounds and computes screen coordinates internally.

## Popup And Window Transitions

For popup-producing actions:

1. Capture the pre-action window/page set when possible.
2. Perform the action.
3. Wait a bounded interval for a new visible window or page.
4. Diff pre/post windows or pages.
5. Resolve the new target explicitly by process/title/URL/page identity.
6. Bind subsequent actions to the new target.
7. If multiple new windows appear, stop and disambiguate instead of guessing.

## Retry And Stop States

Use one retry for a transient native/tool failure after fresh observation. If the same action fails twice without new evidence, change method or report the blocker. Use normal session outcomes:

- `Complete`: requested outcome is proven.
- `NeedsUserInput`: authentication, MFA, consent, ambiguity, or consequential choice requires the user.
- `Blocked`: environment or capability failure with evidence.
- `BudgetExceeded`: bounded action, capture, or time limit was reached.

## Safety

Do not dismiss dialogs, accept terms, submit forms, purchase, delete, send messages, or change permissions unless the user requested it and policy allows it. Type secrets only through secret-aware typed actions. Never use global typing unless the intended target is verified as foreground.
