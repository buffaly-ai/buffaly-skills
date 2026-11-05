# email-dispatch-ui.js — shared controls

## 2026-11-03 — opt-in live server search
PagedGrid.liveSearch debounces input by 250ms, invalidates old requests immediately, shows Searching, resets paging through the existing grid and supports clearing/composition. cancelSearch cancels pending timers and obsolete responses; MakeDataRequest now drops results unless they are the newest requested version, not merely newer than the last rendered version. Stale success/error paths balance the outstanding-call counter. Existing inbox/rules stay submit-driven; destination pickers opt in. Validation: live-search and compact decision browser fixtures passed 2/2; archive, inbox interaction, polling and exact-command regression checks passed 4/4 in a broader six-test run. Its other failures were an installed-inbox test hard-coded to old asset v0.2.2 and the previously documented empty Rules prerequisite. No generated grid/core code was edited.

## 2026-11-03 — shared row link target
Added delegated data-row-href navigation for ordinary primary clicks outside inner interactive controls. Keeps subject anchor native behavior, modifier clicks and text selection; dynamically refreshed grids need no rebinding. No business command runs on row opening. Focused fixture browser suite passed 2/2 for row navigation and existing polling; added inner-button assertion is verified in the final batch. Installed acceptance is separate.

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


## 2026-11-03 — approved compact decision layout
Shared vocabulary now names missing destination as Not sent — choose a destination, Suggested as Ready to send, Error as The dispatch agent could not decide, Archived as Archived. state/status accept optional destination for Ready to send to/Accepted by, not speculative candidate data. Unknown delivery unchanged. No persisted state remapping. Source layout/combinedUI tests pass8/8 and exact command+layout2/2; routine43/43.

## 2026-11-03 — stable Buffaly-only destination picker
PagedGrid.liveSearch preserves rendered rows while a new search is pending instead of replacing the table each keystroke. Shared busy(true/false) makes results/pager inert to prevent selecting obsolete rows and clears on success/error; debounce, immediate selection invalidation, stale rejection and cancel remain. New geometry+endpoint2/2, existingUI5/5 and routine43/43 pass. No generated grid edit.


## 2026-11-04 — shared read-only Inputs table
Added details(values) renderer using standard Inputs table table-condensed markup, td.InputLabel labels and shared Bootstrap table-light alternate rows. Uses existing safe textContent owner for values, no page-specific CSS or innerHTML. Decision summary is its first caller; existing facts owner/callers untouched to avoid unrelated layout migration. Main task: read identified session and reason before deciding about email; existing commands stay in their owner. Source UI7/7 verifies rationale priority, no selection/absent reason, safe markup text, Superseded exclusion, desktop/phone placement and unchanged requests; routine39/39 passed. No server/generated/SQL changes.

## 2026-11-04 — additive Conversations shared controls
Added exact Replied/AwaitingReply/Draft display vocabulary, CursorGrid extending existing PagedGrid for Gmail opaque tokens, and bindEmailFrame as the single source/origin/token/bounded-height owner shared with Review. No new stylesheet/transport/framework; base grid search/busy/error/range owners preserved. Cursor reset clears server tokens, search stays server-side. New conversation browser1440/390 and foreign-mailbox/projection4/4 pass including Review navigation; prior renderer regression/live proof recorded before commit.

### Final verification
2026-11-04: No reply yet display replaces initial Awaiting your reply so notifications do not imply response obligation. Cursor reset version prevents stale search responses repopulating tokens. Focused12/12 includes existing Review resize/sandbox/inbox; routine44/44 and actual-Gmail walkthrough+Gavin decode2/2 pass. Shared sizing behavior retained; installed proof separate.

## 2026-11-04 — describe historical evidence without claiming completion
Changed shared PreviouslyHandled label from Already handled · held to Prior email found · held. Existing state represents matching source text, not a successful module receipt or completed work; current Sales by Style walkthrough exposed misleading wording. No state/capability/transport change. Updated source UI assertion; held-success/error desktop/phone plus Conversations shared-owner regression7/7 passed. Both shells use shared asset0.2.9. Other state vocabulary unchanged.

## 2026-11-04 — Trash vocabulary for excluded direct conversations
Shared status owner now maps exact Trash token to In Trash, reusing existing neutral status presentation. Existing Spam token/wording unchanged. Server owns label classification; no client inference or dispatch capability changes. Excluded-only thread/read-only message fixture passes SPAM/TRASH at1440/390 (2/2 new checks overall); routine48/48 pass. Shell cache key advanced0.2.10; installed proof follows.

## 2026-11-05 — reusable current-page list selection
Added opt-in GridSelection beside shared PagedGrid/CursorGrid, injecting checkbox cells into existing rendered Grid rather than creating another table. Owns select-all current page, mixed checkbox, count, command visibility, page/search reset, busy double-submit and form/pager locks; action/key/label/icon are caller-supplied for later commands. Existing nonselectable grid callers unchanged. Partial archive refresh retains only failures still on displayed page; no cross-page/all-mailbox enumeration. Task: select finished conversations and archive from list; single primary Archive selected appears only with selection. Shared styles, icon/buttons and transport preserved. Source17/17 conversation/archive/inbox tests pass including desktop1440/phone390 and exact per-thread requests; broad55=54pass/1 known missing Rules first-row timeout. Early test failure was reuse of same URL after fixture reset; new document resolves it. No core/backend/SQL changes; installed proof follows.
