# UserDocumentSigning.Admin.pts history

### 2026-11-19 - Initial User document signing wrappers

- **What:** Hand-written User wrappers for five of the seven Root UserDocumentSigning.Admin actions. They keep the Root names, infinitive phrases, base prototypes and `Execute` signatures. The send action keeps the `SigningUrl` parameter. Each calls the matching `FeedingFrenzyUserJsonWs` signing static.
- **Not included:** the UploadedMarkdownFile and LocalMarkdownFile variants. `SigningClient` reads them with `LocalSigningFiles` (`File.Exists` and `ReadAllBytes`), and User source has no file access. A facade for them would widen native access.
- **Why:** The Root file uses `SigningClient` and `#Current.AutomationUserEmail`, which User source cannot reach. The wrappers are hand-written because they are not `BasicUtilities.JsonObject` builders that the generator can rewrite.
- **Preserved:** Server `DocumentSigningAuthorization.ValidateActor` still derives the actor from the token and requires Administrator plus a matching email. Sending stays an explicit user-requested action. No send was exercised in testing.
- **Validation actually performed: generator `-Check` reported "User wrapper copies are current." `FeedingFrenzy.Agent.Tools.Tests` (Release, explicit Buffaly.Agent.Host Release SDK, serial) first run: 93 passed, 2 failed. Both failures were test expectations: the WebModule call count of 3 became 4, and an ordered JSON property-name assertion did not hold for `BasicUtilities.JsonObject`. Both were corrected in the tests. Second run: 95/95 passed.**
- **Limitation: User composition by the Host and a live admin chat turn are proven only after the parent redeploys the WebModule to staging. No signing request was created or sent in testing.**