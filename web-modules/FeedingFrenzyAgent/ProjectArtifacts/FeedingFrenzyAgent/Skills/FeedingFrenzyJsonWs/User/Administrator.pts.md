# User/Administrator.pts

Hand-written. Administrator role graph for User sessions, mirroring `../Administrator.pts`.

## History

### 2026-11-19 - Initial User administrator graph

- **What:** Includes `Foundation.pts` and the generated User wrappers that the Root administrator graph includes. It leaves out the Root-only capabilities listed in `GENERATED.md`: AgreementTemplates.Admin, UserDocumentSigning.Admin, the automation prospect-research action and the automation-drafts PromptAction.
- **Why:** New authenticated administrator chats must keep the CRM administration tools in a User environment. The excluded capabilities need `_opsAgent`, file upload, the signing client or prompts outside the shared prompt roots.
- **Validation actually performed:** action-name and `Execute`-signature parity with the Root administrator graph (minus the exact exclusions) in the 92/92 `FeedingFrenzy.Agent.Tools.Tests` run.
- **Limitation:** compilation by the Host User composer is proven only by the staging launch.

### 2026-11-19 - Include agreement templates and user document signing

- **What:** Includes the generated `AgreementTemplates.Admin.pts` and the hand-written `UserDocumentSigning.Admin.pts` before `Automations.Admin.pts`.
- **Still excluded:** the three local-file upload actions (User source has no file access), `ToResearchFeedingFrenzyAutomationProspect` (the User runtime has no `_opsAgent`, and no User facade offers research) and `ToWriteFeedingFrenzyAutomationDraftsSkill` (its prompt is outside the User prompt roots and its workflow requires research).
- **Validation actually performed: generator `-Check` reported "User wrapper copies are current." `FeedingFrenzy.Agent.Tools.Tests` (Release, explicit Buffaly.Agent.Host Release SDK, serial) first run: 93 passed, 2 failed. Both failures were test expectations: the WebModule call count of 3 became 4, and an ordered JSON property-name assertion did not hold for `BasicUtilities.JsonObject`. Both were corrected in the tests. Second run: 95/95 passed.**
- **Limitation: User composition by the Host and a live admin chat turn are proven only after the parent redeploys the WebModule to staging. No signing request was created or sent in testing.**