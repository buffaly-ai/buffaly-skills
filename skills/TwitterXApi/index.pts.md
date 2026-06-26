# TwitterXApi index.pts

Defines the Twitter/X API OpsAgent skill, its thin ProtoScript action wrappers over `XApiClient.Core`, and includes skill-owned prompt actions.

- Includes `PromptActions.pts` so setup/authorization runbooks are available as prompt actions.
- Runtime API actions use OAuth2-oriented `TwitterXApiSecretsFeature` settings and pass them into `XCredentials`.

## Add Thread Posting Action (2026-06-15)
- Added ToPostXThread.Execute(threadJson) to post a JSON array as a reply-chain thread using XApiClient reply support.

