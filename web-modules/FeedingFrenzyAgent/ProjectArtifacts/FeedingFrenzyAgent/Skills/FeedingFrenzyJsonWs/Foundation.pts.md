# Foundation.pts

Earlier changes to this file are recorded in `index.pts.md`.

## 2026-11-02 - Automations route helper
Trial patch for the external-driver design (2026-11-02). Authored in the scratch clone only; not applied to C:\dev\FeedingFrenzy.
- Added `AutomationsApiPrefix = "api/feedingfrenzy.automations"` and `CallAutomationsRoute(routePath, args)` to `FeedingFrenzyJsonWsService`. FeedingFrenzy.Automations JsonWs classes such as `AutomationReview` are served under their own assembly prefix (the generated client's base URL is `/api/feedingfrenzy.automations/automation-review`), not the business prefix. The helper follows the existing business, call-center and UI helpers exactly, including the bearer-token and secret-key paths.
- Validation: parsed with ProtoScript.Parsers `Files.ParseFileContents` (a broken control snippet was rejected). Not compiled into a running Buffaly project and not called against a server. `FeedingFrenzyJsonWsServiceTests` counts route helpers in `index.pts`, which now contains only an include line, so that test does not cover this file; it was not run or changed.

## 2026-11-02 - Applied to main
Applied the reviewed trial patch to C:\dev\FeedingFrenzy main, approved by Matt on 2026-11-02 for external-driver design v1. No code change from the trial entry above. At commit time this ProtoScript had parse-only evidence from the trial; live load in an embedded session is recorded in the design ledger.
