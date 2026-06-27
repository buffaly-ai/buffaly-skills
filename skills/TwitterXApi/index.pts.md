# TwitterXApi index.pts

Defines the Twitter/X API OpsAgent skill, its thin ProtoScript action wrappers over `XApiClient.Core`, and includes skill-owned prompt actions.

- Includes `PromptActions.pts` so setup/authorization runbooks are available as prompt actions.
- Runtime API actions use OAuth2-oriented `TwitterXApiSecretsFeature` settings and pass them into `XCredentials`.

## Add Thread Posting Action (2026-06-15)
- Added ToPostXThread.Execute(threadJson) to post a JSON array as a reply-chain thread using XApiClient reply support.


## Move Thread Posting Loop To C# (2026-06-26)
- Reworked ToPostXThread.Execute(threadJson) into a thin wrapper around XClient.PostThreadRawJsonAsync(...) so the skill no longer contains an unsupported ProtoScript or statement that caused the entire file to be skipped with Unknown statement type.


