# Use ComputerUse Guidance Skill

ComputerUse's former OpenAI task-level loop is retired. Do not start a separate ComputerUse run, do not create a nested model/provider/API-key workflow, and do not call retired run-control tools such as `ToRunComputerUseTask`, `ToRunComputerUseTaskAndWait`, `ToGetComputerUseRunStatus`, or `ToStopComputerUseRun`.

Use the active Buffaly agent session and its selected provider/model. For visible desktop or non-browser application interaction, use the Desktop interaction workflow and direct typed tools.

## Route

1. Prefer a domain-specific typed action when one owns the workflow.
2. Prefer BrowserSession or Playwright locator/DOM actions for web content.
3. For native desktop work, use `UseDesktopInteractionSkill` and the Desktop primitives.
4. Use global desktop coordinates only as a last resort after a fresh observation.

## Desktop workflow

Use one bounded observe/act/verify loop:

1. Resolve the target window with `ToResolveDesktopWindow`.
2. Capture the smallest reliable observation, preferably `ToCaptureDesktopWindowScreenshotFile` for the resolved window.
3. Choose one minimal action or compact deterministic batch.
4. Execute through direct Desktop tools such as `ToFocusDesktopWindow`, `ToClickDesktopWindow`, `ToClickDesktopWindowImage`, `ToDoubleClickDesktopWindowImage`, `ToScrollDesktopWindowImage`, `ToTypeDesktopWindowText`, or `ToPressDesktopWindowKeys`.
5. Verify after navigation, focus changes, submissions, popups, layout changes, or other state changes.
6. Stop when the requested outcome is proven, or report a clear blocker.

Do not act from stale screenshots. Do not add screen offsets to image-relative actions; pass the native and image dimensions from the matching screenshot artifact and let the Desktop driver translate coordinates.
