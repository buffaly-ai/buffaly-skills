# Feeding Frenzy JsonWs

Feeding Frenzy JsonWs is an OpsAgent ProtoScript skill that exposes selected Feeding Frenzy JSON web service routes through typed Buffaly actions.

## What it includes

- ProtoScript service binding prototypes for Feeding Frenzy JSON WS endpoints.
- Remote and local service bindings that resolve authentication through Buffaly UserSecrets keys.
- Lead, lead automation, lead status, source, tag, and sales representative action wrappers.
- Simple lead-centered MSA and website-addendum actions that attach completed Buffaly Markdown and create unsent signing Drafts for review.

## Security and setup

This package does not include API keys or credentials. Remote calls use the logical UserSecrets key `FeedingFrenzy.ApiKey`; local calls use `FeedingFrenzy.Local.ApiKey`. The target Buffaly instance must already have the appropriate key configured before actions can call protected routes.

Installing this skill only copies ProtoScript files into the local Skills folder. It does not execute remote service calls automatically.

## Intended use

Use this skill when Buffaly needs to inspect or call selected Feeding Frenzy JSON WS surfaces through the existing route-based helper contract.

For agreement signing, Buffaly first retrieves and completes the canonical Markdown template, then calls either `ToCreateMasterServicesAgreementDraftForFeedingFrenzyLead` or `ToCreateWebsiteAddendumDraftForFeedingFrenzyLead` with the service binding, LeadID, and completed Markdown. Feeding Frenzy resolves lead/countersigner defaults and stores the Draft; neither action sends email.
