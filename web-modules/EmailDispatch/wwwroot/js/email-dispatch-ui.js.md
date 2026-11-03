# email-dispatch-ui.js — shared controls

## 2026-11-02
Created one module-wide visual/control adapter used by every focused view: safe text/links/facts/status/DateUtil/UserMessages, busy guards, keyboard input modality and JsonWsGrid3 HasMore adapter. Existing Buffaly source foundation/grid own mechanics; no copied portal UI or hand-owned HTTP. Grid server requests retain bounded Search/SkipRows/NumRows, display honest range, hide needless pager and recover from loading/error/empty. Promise adapter calls generated FooObject with supported per-callback error handler via ObjectUtil.Promisify; needed because generated FooObjectAsync error handler sits on different method than generated invoke reads. No protected core/generated patch. Actual failed-save browser test now retains edits, clears busy and succeeds on next valid save. Meaning-reviewed status vocabulary; unknowns show Needs inspection, not automatic enum splitting. CSS owns look, not this source. All routine48/48 and real configured-model synthetic UI1/1 pass; final package/parent visual acceptance recorded separately.

## 2026-11-02 — explicit projection and Spam states
Added reviewed human vocabulary ProjectionFailed=Email could not be read and Spam=Spam · not dispatched. State comes from the owning server projection, never raw enum splitting or client classification. Same shared badge sizes/contrast used across inbox/detail. Clean1440/390/200% actual-message/error/Evidence assertions and package-backed56/56 pass0fail/skip44sec; technical parser reasons remain outside task content.

## 2026-11-02 — shared feedback reset
Added clearNotice, the single task-navigation feedback reset: clears UserMessages count and hides/empties status. Route ownership invokes it; no page-local notification variant or command change. Source59/59 passes; installed healthcare browser fixture verifies stale acceptance feedback cannot survive message navigation without executing Send. Final browser/package proof is recorded separately.

## 2026-11-02 - Labels for Disabled and Superseded
- Added state labels: Disabled "Not decided yet" (warning) and Superseded "Replaced by a newer decision" (neutral).
- Validation: web build 0 errors; no browser run.

## 2026-11-03 - run() unwraps the foundation's element wrapper
- Bug, older than b284867 and found by the review walkthrough: $(id) returns the foundation's SafeElement Proxy. run() compared it with document.activeElement and tested instanceof HTMLButtonElement; both are always false for the Proxy. Commands wired through submit() and click() were disabled (the Proxy forwards property sets) but never showed their spinner, and a refused dialog command, for example a Send rejected with "The decision changed. Reload before acting.", left keyboard focus on <body>.
- Fix: run() takes the real element (control.element for the Proxy) and uses it for the spinner test, ToggleSpinnerOn/Off and the disabled fallback. In finally it returns focus to the command only if focus is lost and the command is still on screen, so a dialog that closed on success keeps its own return to its trigger. The action still receives the original control.
- Validation (2026-11-03, before commit): EmailDispatch.Tests Debug build 0 errors. ReviewWalkthroughTests 1/1 (8 s) at 1440x900, 390x844 and 720x450 CSS px at device scale 2, serving the 0.2.1 assets. EmailDispatchFlowTests and EmailRuleSeedTests 20/20. Routine EmailDispatch.Tests filter 40/40. Read-only SQL check: 0 fixture observations left, 0 Requeue-evidence rows, 0 Superseded rows. Screenshots reviewed by the agent. Nothing deployed. Pending Send {Disabled:true, Spinner:true}; refused Send {Disabled:false, Spinner:false} with focus on button#confirm-send; Escape from both dialogs still returns focus to Add a note and Confirm.
