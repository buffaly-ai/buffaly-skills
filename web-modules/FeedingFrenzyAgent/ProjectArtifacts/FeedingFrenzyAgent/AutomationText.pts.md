# AutomationText.pts history

## 2026-10-28 — Proposed automation-owned boundaries (design v2; not applied)

Relocate the complete automation owner out of Admin.Business while preserving existing CRM operations, typed contracts and nonweekly behavior.

Affected file: `Buffaly/Projects/FeedingFrenzyAgent/AutomationText.pts`.

Validation: isolated Common, Data, Contracts, Admin.Business, Automations, IF and Agent.Tools compilation passed; 123 existing/new pure C# tests and three JS panel tests passed. Four exact JsonWs types produced real descriptors and JS clients in session artifacts; their JS syntax passed. These are design overlay checks, not applied source, production packaging, live auth, SQL save/reload, scheduler, browser, Buffaly-runtime or provider verification. The broad reference overlay is not a full release build. The v2 design records the corresponding required implementation checks.

## 2026-10-28 - Approved v2 local implementation

Implementation correction: the bound cross-process callback now uses api/feedingfrenzy.automations, matching the newly generated catalog descriptor. Added the agent profile-referenced AutomationText.prompt.md, which was absent from the proposal; the two-tool agent remains unable to approve or send.

Actual source validation: 124 C# automation tests passed, including assembly boundaries and legacy-campaign rejection; eight selected JavaScript tests passed. Full Admin Debug build passed (111 existing warnings, zero errors); Agent.Tools build passed with the explicit Host SDK (zero warnings/errors). This entry records source validation only. Local publication, actual Buffaly execution, database save/reload and outgoing no-send proof are still pending and are not claimed by these unit/build results.

## 2026-10-28 — Live bound-input indexing correction and end-to-end proof

The first real automation-text session failed both ReadAutomationTextInput and SubmitAutomationText with `Collection is not of recognized type for index operator`. The adapter used right-hand index expressions on the native BasicUtilities.JsonObject. Replace those three reads with its typed GetIntOrFail/GetStringOrFail/GetIntOrNull methods; retain the server-bound definition/work identity and nullable topic LeadID. No alternate casing, parsing fallback, authorization or sending behavior added. External owning-project edit used SmartPatch after authoring-tool discovery found no applicable external-project upsert route.

Validated by canonical module build/publication and staging activation 0.1.138, operation extension-20261028T214152580Z-a110240d. Actual restricted Buffaly sessions successfully read the nullable-LeadID topic input, saved a generated proposal, then read two numeric-LeadID recipient inputs and saved distinct generated emails. Local definition6 cycle387957bc3ee64043a13a77855507b4b8 progressed through topic approval, drafts3416/3417, review and Complete. Repeated run retained the same two drafts. Repository readback proved both IsSent=false, IsPending=false and no dispatch stamp; processes27/28 remained disabled. Matt explicitly authorized using his local account for proof; only four labeled example.test fixtures were reassigned. No production or Matt-local runtime activation; provider delivery deliberately untested. Evidence retained in FairPath Rewarming session artifacts/no-send-final-receipt.json.
