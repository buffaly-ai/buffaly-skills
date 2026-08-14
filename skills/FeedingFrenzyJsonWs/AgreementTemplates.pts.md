# AgreementTemplates.pts

Reusable actions for listing/getting current Feeding Frenzy agreement templates, registering new reusable agreement templates, and for the guarded handoff of Buffaly-authored Markdown to a lead signing Draft.

Template registration includes:

- `ToInsertFeedingFrenzyAgreementTemplate` for inserting one active or inactive reusable agreement template through the server-owned `agreement-templates/insert-agreement-template` route. It only registers template Markdown in `AgreementTemplates`; it does not create a signing request, send email, mint tokens, or attach anything to a lead.

The signing-request lifecycle surface now includes:

- `ToListFeedingFrenzySigningRequestsForLead` for bounded, redacted 0/1/N inventory and duplicate Draft hints.
- `ToGetFeedingFrenzySigningRequest` for redacted post-create/pre-update state proof, with Markdown opt-in and token/PDF payload exclusion.
- `ToCreateFeedingFrenzySigningDraftFromMarkdown` for duplicate-aware Draft creation.
- `ToUpdateFeedingFrenzySigningDraftFromMarkdown` for optimistic-concurrency updates to a pristine unsent Draft only.
- `ToPrepareFeedingFrenzySigningRequestToSend` for automation-safe server preflight and signing-link preparation. This calls the named-administrator `prepare-to-send-as-automation` route, mints the customer signing token/link, and does not send email.
- `ToSendPreparedFeedingFrenzySigningEmail` for automation-safe delivery of a prepared signing request. This calls the named-administrator `send-prepared-signing-email-as-automation` route, requires the signing URL returned by prepare, sends the customer email, and moves the request through the server-owned Sent lifecycle.
- `ToCancelFeedingFrenzySigningRequest` for automation-safe cancellation of a non-terminal signing request. This calls the named-administrator `cancel-signing-request-as-automation` route, invalidates active signing tokens through the server lifecycle, and does not send email.
- `ToUpdateFeedingFrenzySigningRecipient` for correcting recipient name, title, and email on an unsigned, unsent Draft request. This calls `update-signing-recipient-as-automation`, invalidates any prepared customer token, and requires a new prepare step before signing.

All actions bind the configured automation administrator and rely on the server's lead authorization. Create and full draft update never send, cancel, remind, mint customer tokens, or return token secrets. Prepare is the explicit token/link-minting boundary, send is the explicit external-delivery boundary, recipient update is the explicit pre-delivery identity-correction boundary, and cancel is the explicit token-invalidation boundary for non-terminal requests. Full draft update requires expected version/hash evidence and returns the new version/hash/status for readback proof.
