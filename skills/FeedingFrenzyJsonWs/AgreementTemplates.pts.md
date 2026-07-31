# AgreementTemplates.pts

Reusable actions for listing/getting current Feeding Frenzy agreement templates and for the guarded handoff of Buffaly-authored Markdown to a lead signing Draft.

The signing-request lifecycle surface now includes:

- `ToListFeedingFrenzySigningRequestsForLead` for bounded, redacted 0/1/N inventory and duplicate Draft hints.
- `ToGetFeedingFrenzySigningRequest` for redacted post-create/pre-update state proof, with Markdown opt-in and token/PDF payload exclusion.
- `ToCreateFeedingFrenzySigningDraftFromMarkdown` for duplicate-aware Draft creation.
- `ToUpdateFeedingFrenzySigningDraftFromMarkdown` for optimistic-concurrency updates to a pristine unsent Draft only.

All actions bind the configured automation administrator and rely on the server's lead authorization. Create and update never send, cancel, remind, mint customer tokens, or return token secrets. Update requires expected version/hash evidence and returns the new version/hash/status for readback proof.
