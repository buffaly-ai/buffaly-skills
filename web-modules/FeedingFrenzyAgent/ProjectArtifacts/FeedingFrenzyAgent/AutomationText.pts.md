# AutomationText.pts history

## 2026-10-28 — Proposed automation-owned boundaries (design v2; not applied)

Relocate the complete automation owner out of Admin.Business while preserving existing CRM operations, typed contracts and nonweekly behavior.

Affected file: `Buffaly/Projects/FeedingFrenzyAgent/AutomationText.pts`.

Validation: isolated Common, Data, Contracts, Admin.Business, Automations, IF and Agent.Tools compilation passed; 123 existing/new pure C# tests and three JS panel tests passed. Four exact JsonWs types produced real descriptors and JS clients in session artifacts; their JS syntax passed. These are design overlay checks, not applied source, production packaging, live auth, SQL save/reload, scheduler, browser, Buffaly-runtime or provider verification. The broad reference overlay is not a full release build. The v2 design records the corresponding required implementation checks.

## 2026-10-28 - Approved v2 local implementation

Implementation correction: the bound cross-process callback now uses api/feedingfrenzy.automations, matching the newly generated catalog descriptor. Added the agent profile-referenced AutomationText.prompt.md, which was absent from the proposal; the two-tool agent remains unable to approve or send.

Actual source validation: 124 C# automation tests passed, including assembly boundaries and legacy-campaign rejection; eight selected JavaScript tests passed. Full Admin Debug build passed (111 existing warnings, zero errors); Agent.Tools build passed with the explicit Host SDK (zero warnings/errors). This entry records source validation only. Local publication, actual Buffaly execution, database save/reload and outgoing no-send proof are still pending and are not claimed by these unit/build results.
