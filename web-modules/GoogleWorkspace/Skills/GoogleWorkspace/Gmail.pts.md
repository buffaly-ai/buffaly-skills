# Gmail.pts Change History

## Add Gmail Archive Action (2026-08-12)
- Added `ToArchiveGoogleWorkspaceMessage` for DMARC cleanup and other safe inbox-removal workflows.
- The action calls `ModifyLabelsAsync` with `removeLabelIds` set to only `INBOX` via `StringUtil.Split("INBOX", ",", true)`.
- It does not trash or delete messages and leaves all other labels/read state intact.

## Fix Full-Payload Gmail Message Retrieval (2026-06-12)
- Corrected `ToGetGoogleWorkspaceMessageWithFullPayload` to call `GoogleWorkspaceServiceHost.GetMessageFullPayloadAsync` instead of the preview-oriented `GetMessageAsync` wrapper.
- Passed `requireHttpsRedirectUri=false`, matching the working Gmail message actions and allowing development OAuth redirect configuration to retrieve full message bodies.
- This preserves the intended action contract: full decoded body text/html plus attachment metadata for diagnostics that need complete Gmail payloads.
