# Gmail.pts Change History

## Add Gmail Archive Action (2026-08-12)
- Added `ToArchiveGoogleWorkspaceMessage` for DMARC cleanup and other safe inbox-removal workflows.
- The action calls `ModifyLabelsAsync` with `removeLabelIds` set to only `INBOX` via `StringUtil.Split("INBOX", ",", true)`.
- It does not trash or delete messages and leaves all other labels/read state intact.

## Fix Full-Payload Gmail Message Retrieval (2026-06-12)
- Corrected `ToGetGoogleWorkspaceMessageWithFullPayload` to call `GoogleWorkspaceServiceHost.GetMessageFullPayloadAsync` instead of the preview-oriented `GetMessageAsync` wrapper.
- Passed `requireHttpsRedirectUri=false`, matching the working Gmail message actions and allowing development OAuth redirect configuration to retrieve full message bodies.
- This preserves the intended action contract: full decoded body text/html plus attachment metadata for diagnostics that need complete Gmail payloads.

## 2026-10-15 — Explicit threaded reply action
- Added ToReplyToGoogleWorkspaceMessage with original Gmail message ID, explicit recipients/body and gmail.reply default. Calls completed-string host adapter and preserves the facade JSON, including already-sent mismatch status and do-not-resend diagnostic.
- Passes the chosen scope directly rather than using Common.pts's legacy gmail-to-workspace scope expansion; the facade enforces read+send. Existing send and draft actions unchanged. OpsAgent-only prototype upsert cannot author this external owning source, so a targeted source patch was used.
- Validation: actual action block compiled/interpreted against signature-matched fake host for empty/default/explicit scopes and argument preservation (3 tests). Offline suite 135/135; Release build successful. No installed action updated, no emails sent or deployment.
