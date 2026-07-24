# Feeding Frenzy agreement-signing actions

Two lead-centered actions expose the simple Buffaly handoff requested for canonical agreements:

- `ToCreateMasterServicesAgreementDraftForFeedingFrenzyLead`
- `ToCreateWebsiteAddendumDraftForFeedingFrenzyLead`

Each action accepts a `FeedingFrenzyJsonWsService` binding, `LeadID`, and the completed Buffaly-generated Markdown as `StringRef`. The wrapper sends only those values to the corresponding Feeding Frenzy business route. Feeding Frenzy resolves customer identity from the lead, applies the authoritative configurable default countersigner and operational defaults, attaches the exact Markdown to the lead, and creates an unsent signing Draft.

The tools intentionally do not merge templates or send email. Buffaly owns template retrieval and customer-specific drafting; sending remains a separate explicit reviewed operation. Website addenda require a verified governing agreement.