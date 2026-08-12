# Gmail.pts Change History

## Fix Full-Payload Gmail Message Retrieval (2026-06-12)
- Corrected `ToGetGoogleWorkspaceMessageWithFullPayload` to call `GoogleWorkspaceServiceHost.GetMessageFullPayloadAsync` instead of the preview-oriented `GetMessageAsync` wrapper.
- Passed `requireHttpsRedirectUri=false`, matching the working Gmail message actions and allowing development OAuth redirect configuration to retrieve full message bodies.
- This preserves the intended action contract: full decoded body text/html plus attachment metadata for diagnostics that need complete Gmail payloads.
