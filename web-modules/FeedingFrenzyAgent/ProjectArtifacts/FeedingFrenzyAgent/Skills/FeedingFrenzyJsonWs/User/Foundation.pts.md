# User/Foundation.pts

Hand-written. User-environment `FeedingFrenzyJsonWsService` and `#Current`, backed by the `FeedingFrenzyUserJsonWs` facade.

## History

### 2026-11-19 - Initial User foundation

- **What:** Defines the User service prototypes with the same names as the Root foundation, so the embedded launch's `RunProtoScriptMethod(FeedingFrenzyJsonWsService#Current.ConfigureAuthorization)` binds unchanged. Calls go through the facade, which pins the first bound installation URL.
- **Why:** User source cannot use the Root client or `BasicUtilities.JsonObject`.
- **Not included:** the Root tenant diagnostics `#Medek`, `#Affinity` and `#Local`.
- **Validation actually performed:** forbidden-token and import scan plus facade binding tests in the 92/92 `FeedingFrenzy.Agent.Tools.Tests` run.
- **Limitation:** compilation by the Host User composer is proven only by the staging launch.

### 2026-11-19 - ConfigureAutomationUser service method

- **What:** Added `ConfigureAutomationUser(string Email)` to the User service. It delegates to the facade, which accepts the email only after the launch authorization bind and keeps it pinned for the session.
- **Why:** The WebModule binds the authenticated user's email for the agreement-template and signing wrappers.
- **Validation actually performed: generator `-Check` reported "User wrapper copies are current." `FeedingFrenzy.Agent.Tools.Tests` (Release, explicit Buffaly.Agent.Host Release SDK, serial) first run: 93 passed, 2 failed. Both failures were test expectations: the WebModule call count of 3 became 4, and an ordered JSON property-name assertion did not hold for `BasicUtilities.JsonObject`. Both were corrected in the tests. Second run: 95/95 passed.**
- **Limitation: User composition by the Host and a live admin chat turn are proven only after the parent redeploys the WebModule to staging. No signing request was created or sent in testing.**