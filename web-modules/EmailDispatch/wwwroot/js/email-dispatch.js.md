# email-dispatch.js history

## 2026-11-01
Added real generated-client account/sync, source editor/readback, paged server search, email body review, effect-free saved-policy test and local disposition behavior. Preserves failed input, uses busy guards and safe textContent, no client mailbox filter or model routing. Explicit collapsed panels follow the user's override.24/24 tests passed with Playwright390/1280 against547 real messages; no page errors or overflow. This milestone has no semantic editor, preparation or send controls, which remain implementation work.

## 2026-11-01 — isolated canonical tree editor
Added module-owned canonical tree bootstrap/store/host and typed JsonWs tree search, context and WorkSession operations using existing NLMemory and RuntimeDispatchTreeFacade. The live Email Dispatcher source is copied read-only, with explicit reviewed seed-to-node mapping; no parallel classifier. Reconciliation maps155 seed entries and retains4 pre-existing descendants (159 total nodes), appends evidence-only historical examples and never assigns unvalidated candidate destinations. A second reconciliation left the source SHA256 unchanged. Real SQL semantic tags, context revision rejection, attachment replace/clear preserving AnalysisSession/history, fresh-runtime restoration and generated-client UI search/path/Recent/Save at390/1280 passed. Full suite25/25 passed; Release publish succeeded. Existing dependency warnings (Google Docs version resolution/ImageSharp advisories) remain; live processing/delivery is not part of this batch.


## 2026-11-01 — generated review and receipt operations
Added real ProcessCaptured/GetReviewSummary/PrepareSuggestion/SelectRoutingNode/SendApproved calls; views distinguish proposed/held/accepted/uncertain, and accepted work has no Send. Local disposition rerenders owning data without altering receipt; actual diagnostic accepted receipt remained byte-identical across dismiss/archive/restore at390/1280. Added root hierarchy source and inert rule creation controls. Generated normal/legacy contracts, authenticated actor and server revisions remain authoritative. Full31/31 suite passes. All117 uncertain/unbound prepared frames remain review-only; no historical business execution is inferred from API authentication.

## 2026-11-01 — whole-program search coverage
The existing server search includes bounded policy declaration/prompt/destination results from generated FindPolicyNodes alongside canonical semantic nodes. Selecting a rule opens the same owning source editor. No client whole-table filter or new classification model.31/31 tests passed, including search/open source at390/1280. This closes R08's policy-source gap found in final acceptance review.

## 2026-11-01 — one focused program editor
Opening any policy editor hides the tree editor; opening a semantic node hides policy source. Selection and source are retained, but two active editors cannot stack. Shared helper covers root/add/search/list. Browser tests35/35 pass including both transitions at390/1280 and async completion waits; no overflow. Explicit collapsed-panel user override remains.


## 2026-11-02 — focused UI redesign (UI-STD-01)
Focused navigation/tasks replace stacked configuration dump. Server-paged mailbox/rules search, explicit reviewed state/behavior vocabulary, concise task headings, no raw reason/envelope outside Evidence. Full AST-backed editor, cancel/failure retention, saved-rule test, canonical routing/session and unchanged explicit SendApproved. Presentation-only candidate suffix removal. Pointer/initial heading focus no box, keyboard focus retained by shared modality owner. Generated client transport/request error lifetime reused; no hand HTTP/core edits. Fixture-only browser mutations; actual configured-model synthetic preparation/owner selection yields no Send or receipt.
Validation: source routine48/48 and separate actual-model UI1/1 passed; final package-backed receipt and parent visual acceptance recorded separately in focused UI handoff. No ordinary business Send, protected restart or shared-core change.

## 2026-11-02 — compact commands above the reading surface
`works()` now renders each owning work's status, destination and existing command buttons into the top toolbar, without redundant state headings. Exact proposal text remains available after the message in a separate proposal region. All generated method names, WorkKey/revision/disposition arguments, preparation/routing/approval behavior and textContent rendering stay unchanged; accepted receipts still never offer Send. Empty work has a compact state instead of a paragraph. No email HTML parsing or link execution introduced. Actual Drive1440/390/200% and a long real-message read-only journey pass1/1; prior routine paths48passed in the initial49-test run. Final routine/package receipt and Rule10 are in docs/EmailDispatch-Gmail-Layout.md.

## 2026-11-02 — readable failed observation and excluded Spam
openEmail handles the authoritative nullable Frame and hides effect-free rule check when no frame or Spam; works displays the owning email state and offers no work commands for unreadable/excluded mail. No-work mail no longer falsely says No matching rule. Technical ProjectionError and observation key are confined to the existing Evidence task. Actual mail body remains textContent; no email HTML/link execution added. Shared state vocabulary adds Email could not be read and Spam · not dispatched once. Shell asset version0.1.13 refreshes changed JS on reload.
Validation: modern/legacy fixture and clean actual Tailscale browser2/2; exact original sender/subject/body883 equality at1440/390/200%, no overflow/small reading box/Send, error details visible only Evidence. Visual image review found no visible defect. Full installed-package56/56 pass0fail/skip44sec; no ordinary delivery or operator disposition mutation.

## 2026-11-02 — task-scoped feedback lifetime
The route owner clears shared feedback before opening a different task, including a different message, so a previous Delivery acceptance saved banner cannot imply acceptance of the new email. The shared UI owner resets UserMessages and status safely; real command/approval/receipt semantics are unchanged. Asset version0.1.15 invalidates the old shell. Source routine59/59 passes; the focused installed-browser regression reproduces the banner without calling Send, navigates to the actual healthcare email and verifies hidden feedback, owner/state/body and immutable work/diagnostic. Final installed results live in the healthcare completion evidence.

## 2026-11-02 - Disabled is open
- Added `Disabled` to `openStates`, matching `EmailDispatchActions.OpenStates`, so Add a Note and Pick appear for it.
- Validation: web build 0 errors; no browser run.

## 2026-11-03 - Retired decisions are history only
- works() drops Superseded rows from the decision list, so the detail screen shows only the current decision and its Send to. evidence() shows a retired row's facts before the requeue (state, processor, destination) and its old instruction, labelled as history.
- Why: review finding P2 on b284867 (UI-STD-01 Principle 13).
- Asset version advanced to 0.2.1 in index.html (Finding 2 batch).
- Validation (2026-11-03, before commit): EmailDispatch.Tests Debug build 0 errors. EmailDispatchFlowTests and EmailRuleSeedTests (FakeDispatchAgent, fake transports, their own fixture rows only) 20/20. Routine EmailDispatch.Tests filter (TestCategory not LiveStandalone, TailscaleWalkthrough, ExplicitRepair or MailboxBoundary) 40/40. ReviewWalkthroughTests 1/1: a fixture whose retired suggestion named a different session shows only the new destination in the inbox and the detail screen at 1440px, 390px and 200% zoom, and the evidence view shows the old destination and instruction as "before the requeue". Read-only SQL check after the runs: 0 fixture observations left, 0 rows with Requeue evidence, 0 Superseded rows. The requeue was not run on real mail and nothing was deployed.
