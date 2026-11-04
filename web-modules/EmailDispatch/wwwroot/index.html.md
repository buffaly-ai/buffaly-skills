# Email Dispatch standalone milestone

## 2026-11-03 — processed-mail archive discovery and integrated validation
Renamed the existing Reviewed filter to Processed & archived; its server filter and paging/search contract remain unchanged. Final CSS/behavior cache keys are 0.2.4; UI helper remains 0.2.3. Archive reuses existing local disposition and preserves Gmail and receipts. Combined source-host browser validation passed 3/3: archive/restore with real SQL synthetic fixture at 1440/390, inbox row/check-now safeguards, and long-body detail walkthrough including exact-instruction evidence navigation/reload at desktop/mobile/zoom. This supersedes the sibling's earlier unrun walkthrough limitation for the integrated source, not its accurately recorded historical test outcomes. Installed package validation follows separately.

## 2026-11-03 — inbox check-now icon
Placed a compact Font Awesome 5 refresh button beside the owning Gmail synchronization status, labelled Check Gmail now. Reuses existing Accounts synchronization operation and shared button/spinner owner; no send or routing change. Versioned module assets to0.2.3. Focused fixture tests 2/2 pass for row targets/check-now/preserved paging and polling; installed validation follows separately.

2026-11-01: Added module-owned single-column intake/editor/inbox page and generated-client behavior. User explicitly requires collapsed/expanded panels, overriding UI-STD-01's general no-collapse default; explicit editable ProtoScript also requires source display. Uses the shared Bootstrap and Buffaly standalone foundation assets by source-linked packaging, no forked button/font styles. Server handles paging/search; email bodies use textContent, no email HTML execution. Real source Save readback, policy test and local disposition call generated ObjectAsync clients. JsonWsStubGenerator emitted the six descriptor/client files from Buffaly.EmailDispatch using canonical Metabase project5059. No manual transport/stubs.

Validation:24/24 tests passed, including real SQL, both route families and isolated Playwright390/1280. Eight saved rules and25 of547 live observed work-main emails rendered. Screenshots/receipt in delivering session artifacts/standalone-browser. Source/host is an incomplete milestone: no semantic editor, preparation/delivery UI or publication is claimed by this batch. Parent received the stable URL and exact window. Remote password submission untested; installation-token auth tested. Shared asset link update was build-validated.

## 2026-11-01 — isolated canonical tree editor
Added module-owned canonical tree bootstrap/store/host and typed JsonWs tree search, context and WorkSession operations using existing NLMemory and RuntimeDispatchTreeFacade. The live Email Dispatcher source is copied read-only, with explicit reviewed seed-to-node mapping; no parallel classifier. Reconciliation maps155 seed entries and retains4 pre-existing descendants (159 total nodes), appends evidence-only historical examples and never assigns unvalidated candidate destinations. A second reconciliation left the source SHA256 unchanged. Real SQL semantic tags, context revision rejection, attachment replace/clear preserving AnalysisSession/history, fresh-runtime restoration and generated-client UI search/path/Recent/Save at390/1280 passed. Full suite25/25 passed; Release publish succeeded. Existing dependency warnings (Google Docs version resolution/ImageSharp advisories) remain; live processing/delivery is not part of this batch.


## 2026-11-01 — review, proposal and immutable receipt UI
Added Process captured (classification only), outcome summary, explicit suggestion preparation, canonical routing review, current proposal Send approval and real receipt display. Accepted/unknown work never offers Send. Local dismiss/archive/restore remain independent of receipts and Gmail. Rule hierarchy editor/add-disabled-rule controls call generated APIs, not local demo state. Generated clients/descriptors regenerated from compiled project5059 custom methods; no raw write endpoints or diagnostic browser API. Actual accepted diagnostic receipt and unchanged local disposition tested at390/1280; full31/31 suite passes. Remote portal password submission remains untested.

## 2026-11-02 — wrap unbroken message content using shared Bootstrap utility
Added shared Bootstrap text-break to the single main container, so inherited overflow-wrap/word-break protect headings, message body and controls without clipping content or adding page-local CSS. Actual newly arrived Drive filename previously caused390px pagewidth599. No layout structure, commands, fonts, panels or business behavior changed. Existing explicit collapsed-panel requirement remains; this is not a whole-screen redesign/conformance claim. Source45/45suite passes,including original real-mail generated-client regression and isolated220character subject/400character body at390/1440 and1440with200%CSSzoom. Screenshot/geometry evidence preserved in direct-private-access. UI-STD-01 Principles2/5/9 use existing stylesheet utility and preserve behavior.


## 2026-11-02 — focused UI redesign (UI-STD-01)
Replaced stacked panels with focused default Review, Rules, Routing, Accounts, email, editor, source, session, evidence and approval task views. No collapsibles or two-column master/detail. New module-wide visual owner fixes bare-Bootstrap inheritance; versioned shell assets. Human list/state, bounded body, intentional rule source, one primary per region, evidence separated. Earlier panel override is obsolete under current governing request. Shared foundation/grid/generated clients only. Rule10 and actual acceptance in docs/EmailDispatch-Focused-UI.md.
Validation: source routine48/48 and separate actual-model UI1/1 passed; final package-backed receipt and parent visual acceptance recorded separately in focused UI handoff. No ordinary business Send, protected restart or shared-core change.

## 2026-11-02 — command-first Gmail-style reading layout
At Matt's direction, replaced the two-row global header and separate Back/subject/sender/date/body-box/work-sections stack with a compact shared header and message toolbar above the subject. Message status and real commands are grouped by owning work; saved-rule test and Evidence remain available above content. Sender and received time share one metadata row. The body is an unboxed flowing text surface; proposed work follows the message instead of duplicating a large instruction envelope. No fake Gmail controls, rich-email HTML rendering or business command changes. Asset references advance to0.1.11 to avoid stale static shell after a normal reload. Initial49-test run48passed with one test-only response assertion failure; corrected focused reading test1/1 passed. Final screenshots, package and routine results are recorded in docs/EmailDispatch-Gmail-Layout.md.

## 2026-11-02 — recipient-group repair asset refresh
Advanced shell static asset query version to0.1.13 for the repaired nullable-frame and honest Spam/error presentation. No layout/command contract change. Actual clean package-backed1440/390/200% browser and full56/56 routine pass; canonical install64files verified. No login, unsafe HTML or main integration added.

## 2026-11-02 — healthcare projection/feedback shell refresh
Advanced existing versioned asset references to0.1.15 for task-scoped feedback cleanup. No layout, navigation, security or command change. Source59/59 passes with published assets; actual installed healthcare1440/390/200% and prior Spam projection receipts are recorded in the healthcare completion evidence.


## 2026-11-03 - asset refresh for the b284867 review fixes
Advanced email-dispatch.css, email-dispatch-ui.js and email-dispatch.js to ?v=0.2.1 (vendor assets stay at 0.2.0) so browsers holding the 0.2.0 copies load the retired-suggestion, focus, spinner and time-cell fixes. No layout, navigation or command change. The walkthrough loaded email-dispatch-ui.js?v=0.2.1 and passed 1/1; flow and seed 20/20; routine 40/40.
## 2026-11-03 — inbox polling cache key
Advanced only email-dispatch.js to 0.2.2 so a page reload fetches the inbox polling fix. No layout/default-filter changes. Validation: targeted InboxRefreshTests 1/1, routine 42/42 and ReviewWalkthroughTests 1/1 passed against current assets.


## 2026-11-03 - Detail readability (detail hunks only)
- Removed the empty <div id="proposals"></div> after the message article; works() no longer fills it.
- Advanced email-dispatch.css and email-dispatch.js to ?v=0.2.4 so browsers load the changed detail assets. email-dispatch-ui.js stays at 0.2.3 because it did not change. The concurrent archive batch also changes this file (the Reviewed filter label and a cache key); the integrating owner sets the final keys.
- Kept the #sender, #received and #body ids that ProjectionBrowserTests read.
- Validation (2026-11-03, source only; nothing committed or deployed): Buffaly.Dispatch.sln Debug build 0 errors (the 18 warnings are existing NU1902/NU1903, CA2200 and SYSLIB0014 warnings from buffaly-development). The routine EmailDispatch.Tests filter ran on the shared tree, which also held the concurrent archive edits: 34 passed, 58 failed, 3 skipped of 95 without the documented environment variables; 72 passed, 23 failed of 95 with only EMAIL_DISPATCH_CONFIG set. The six failure messages read were setup failures (ExactMessageProjectionTests: explicit capture or repair flag required; HealthcareProcessorTests: ArgumentNullException for path). The other 17 were not inspected, flow and seed were not run together, and EMAIL_DISPATCH_EVIDENCE was not set. ReviewWalkthroughTests (LiveStandalone) was not run after this change, so there are no screenshots of it yet. Integration, final validation and the commit were handed to Email Dispatching 11-3.

## 2026-11-03 — isolated formatted HTML email
Added titled sandbox iframe without allow-same-origin/forms/top-navigation and separate formatted-body loading region; retained captured #body for plain messages and failure. App-owned nonce script alone reports height; email scripts removed/CSPblocked. Advanced CSS/behavior/EmailObservations client cache keys0.2.5. Generated EmailObservations .ashx.js/.json map new typed read. CombinedUI6/6/routine43/43 pass; live screenshot verification follows.

## 2026-11-03 — review P2: resize fix asset revision
Advanced only email-dispatch.js cache key0.2.5→0.2.6 so the bounded iframe-sizing listener replaces the earlier feedback-prone behavior when distributed. No markup, command or sandbox-permission changes. Source browser validation formatted4/4, combinedUI7/7 and routine43/43 pass. Installed package remains unchanged by this review follow-up.


## 2026-11-03 — approved compact decision layout
Moved Archive host to the message toolbar and Check saved rules into existing evidence; renamed reconsideration/picker prompts and submit labels to state their effects. Shared UI/behavior asset keys0.2.4/0.2.7. No routing/API/guard changes. Combined sourceUI8/8 and exact-command+layout2/2 passed; routine43/43. Deployment evidence recorded separately.
# 2026-11-03 — live picker assets
Bumped shared UI and application script query versions to 0.2.5/0.2.8 so the installed app loads live destination search. No layout or command changes in this file. Source live-search and compact decision browser tests passed 2/2.


## 2026-11-03 — stable Buffaly-only destination picker
Applied shared ed-dialog-picker class to the common destination picker and advanced stylesheet/shared control asset versions to0.2.6. No command or generated client change. Source geometry/endpoint2/2, existingUI5/5 and routine43/43 pass; installed verification follows.


## 2026-11-04 — Send to the routed session with an optional note
Added Note to the agent (optional) textarea (maxlength2000) inside existing routed confirmation dialog, reusing form/dialog owners. No extra command or rerouting. Incremented EmailWorks client and app JS cache keys. UI task: open destination Send, type optional note, Send or Cancel; cancellation sends nothing. Focus trap/browser exact argument and error-retains-note regression passed with16/16 flow+browser suite; installed desktop/phone checks follow.


## 2026-11-04 — background instruction submission asset
Advanced only email-dispatch.js cache key 0.2.9 to 0.2.10 so existing browsers receive the non-blocking Send/reconsider/picker modal behavior on reload. No markup or generated endpoint change. Focused browser tests 3/3 and routine 43/43 passed against source; installation verification recorded separately.


## 2026-11-04 — show recent arrivals by default
Changed selected review filter from NeedsAttention to All email after Matt reported a stale inbox despite newer mail. Direct bounded database reads proved sync Current at 01:49 UTC, incoming mail through 01:31 UTC, and exact screenshot reproduced by NeedsAttention: newer rows were Notice/Accepted/NoAction/Archived, not absent. The decision-only default originated in 2cb0f8a; preserve it as an explicit filter and preserve archive return to decision queue, server search/paging and ten-second polling. No SQL, Gmail, routing or send semantics changed. UI task: see newest email and its current outcome, then optionally narrow to decisions. Archive regression passes; accelerated polling test failed once at focused-link timing in a combined run, isolated rerun passes; no production timer change. Installed real polling verification follows.


## 2026-11-04 — installed freshness and background modal acceptance
Local package 0.1.32 Installed after exact owning DLL parity and normal hash verification; only standalone process restarted. Live unmocked inbox test 1/1 passed: default newest New Refill request for St. Martin Pharmacy, decision filter newest Sales by Style, reads 3 to 5 over 22 seconds; desktop/phone screenshots in Email Dispatching 11-3/artifacts/inbox-freshness/installed/live. Final combined polling/archive/installed modal timing+recovery 4/4 passed. Earlier background modal source tests 3/3 and routine 43/43 passed. Prior source-only confirmation-preflight fix eeae282c is included in the canonical rebuild. No real send commands executed for this validation. Separate historical Hold/research launch acceptance is not claimed by these checks.


## 2026-11-04 — unreachable footer asset refresh
Advanced only email-dispatch.css cache key0.2.6 to0.2.7 to load the shared picker zoom/height fix. No dialog markup, delivery arguments or command changes. Source footer six-view/hit-test/intercepted-Send test and stable picker/exact arguments/background modal suite4/4 pass. Installed verification follows.

## 2026-11-04 — repeat-send client freshness
Bumped EmailWorks generated client cache key0.2.2 and review script0.2.11 for new SendAgain endpoint/command. No markup/layout/style changes. Source browser1/1 passed; actual route payload and footer verified on synthetic data, no real send.


## 2026-11-04 — late-failure context asset version
Advanced review-script cache key0.2.11 to0.2.12 for owner-based restoration of failed email dialogs after another email/rule reused them. No markup/default filter/contract change. Source UI9/9, routine39/39 pass; new four delayed-failure regressions fail before JS fix/pass after. Existing combined timing failures and isolated passes recorded in JS/test histories. Source-only, no installation/publication.


## 2026-11-04 — session/reason summary asset refresh
Advanced shared UI script to0.2.7 and review script to0.2.13 for visible saved-session/decision-reason Inputs table above body. No markup or command changes. Source UI7/7 and routine39/39 passed; initial test geometry targeted hidden text body, corrected to visible HTML frame. Installed acceptance recorded separately. Includes prior committed late-failure context correction in same normal release.


## 2026-11-04 — current decision-owner reason cache key
Advanced only email-dispatch.js cache key0.2.13 to0.2.14 for Source-selected summary reason. Shared details/evidence, markup, defaults and command contracts unchanged. New ownership browser6/6, focused14/14 and configured routine39/39 pass. Wider installed rule-row walkthrough timeout remains outside the passing focused batch; see email-dispatch.js history for actual limitations. Source-only; no publication/installation or real sends.

## 2026-11-04 — additive Conversations navigation
Add normal /conversations.html navigation link alongside intact Review/Rules/Accounts. Update shared UI and Review script cache versions for shared sandbox sizing owner. Existing Review markup/commands untouched. New page uses same shared styles/foundation/generated client. Conversation browser1440/390 confirms return to Review. Source build succeeds; package verification recorded with delivery.

## 2026-11-04 — current held-state refresh asset
Advanced email-dispatch.js cache key0.2.16 for typed held-outcome/error refresh and open-decision polling. No markup, commands or styling change. Focused10/10 and routine51/51 passed at current source; desktop/phone screenshots from regression. Installed activation recorded separately.

### 2026-11-04 — shared historical-state wording
Both shells now request shared UI0.2.9, labeling matching historical source Prior email found · held rather than claiming already handled. No commands or layout changes. Held-state and Conversations browser7/7 passed.

## 2026-11-04 — failed-draft retention asset
Advance Review script0.2.16 to0.2.17 so a later normal package release loads the error-refresh confirmation-draft fix. No markup/layout/commands changed. Focused browser10/10 and routine47/47 pass against source. Not published/installed in this review correction batch.

## 2026-11-04 — shared shell Conversations entry
Moved existing conversation list/thread/read-only-message markup into this shell and changed nav to #conversations. Incoming captured messages use existing email view/decision/dialog markup, Back link gets current thread; no second picker/rendered command copy. Added module script0.2.0 before Review0.2.18, same shared styles and body sandbox. Focused15/15 and routine47/47 pass including desktop1440/phone390 and previous held-note protection. No business/DTO/schema/core changes; publication/installed proof in session artifact.

## 2026-11-04 — excluded conversation shared status asset
Advanced shared UI cache key0.2.9 to0.2.10 for In Trash vocabulary. No shell layout/commands changed. Excluded thread fixture2/2 overall and routine48/48 pass; installed verification separate.
