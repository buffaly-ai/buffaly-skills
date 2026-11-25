# GoogleWorkspace Skill

Provides DLL-backed Ops actions for Google Workspace OAuth, Gmail, Drive, Docs, Sheets, and Calendar using facade static classes in `Buffaly.GoogleWorkspace.Facade`.

## Structure
- `Common.pts`
  - Shared references/imports.
  - `_opsAgent` extern.
  - Shared settings resolution helpers.
- `Auth.pts`
- `Gmail.pts`
- `Drive.pts`
- `Docs.pts`
- `Sheets.pts`
- `Calendar.pts`
- `index.pts`
  - Includes only the files above.

## Auth Actions
- `ToStartGoogleWorkspaceAuthorization(accountKey, scopePreset, returnUrl, forceConsent)`
- `ToCompleteGoogleWorkspaceAuthorization(state, code)`
- `ToRefreshGoogleWorkspaceAuthorization(accountKey, scopePreset)`
- `ToRevokeGoogleWorkspaceAuthorization(accountKey, scopePreset)`
- `ToListGoogleWorkspaceAccounts()`
- `ToGetGoogleWorkspaceAccount(accountKey)`
- `ToSetDefaultGoogleWorkspaceAccount(accountKey)`
- `ToRemoveGoogleWorkspaceAccount(accountKey)`

## Gmail Actions
- `ToReadRecentGoogleWorkspaceEmails(accountKey, query, maxResults)` (legacy wrapper)
- `ToGetGoogleWorkspaceEmailById(accountKey, messageId)` (legacy wrapper)
- `ToSearchGoogleWorkspaceMessages(accountKey, scopePreset, query, maxResults)`
- `ToGetGoogleWorkspaceMessage(accountKey, scopePreset, messageId)`
- `ToGetRecentGoogleWorkspaceMessages(accountKey, scopePreset, maxResults)`
- `ToGetNewGoogleWorkspaceMessagesSinceId(accountKey, scopePreset, sinceMessageId, maxResults)`
- `ToSendGoogleWorkspaceEmail(accountKey, scopePreset, from, to, subject, htmlBody, cc, bcc, replyTo, extraHeadersJson)`
- `ToCreateGoogleWorkspaceDraft(accountKey, scopePreset, from, to, subject, htmlBody, threadId, cc, bcc, replyTo, extraHeadersJson)`
- `ToSendGoogleWorkspaceEmailWithInlineImages(accountKey, scopePreset, from, to, subject, htmlBody, inlineImagesJson, cc, bcc, replyTo, extraHeadersJson)`
- `ToCreateGoogleWorkspaceDraftWithInlineImages(accountKey, scopePreset, from, to, subject, htmlBody, inlineImagesJson, threadId, cc, bcc, replyTo, extraHeadersJson)`
- `ToReplyToGoogleWorkspaceMessageWithInlineImages(accountKey, scopePreset, messageId, from, to, htmlBody, inlineImagesJson, cc, bcc)`

For embedded screenshots, use these image-capable actions rather than Drive hyperlinks. `inlineImagesJson` is a strict array of `{contentId,fileName,mediaType,contentBase64}`. HTML must reference every supplied image with `img src="cid:contentId"`. Supported signatures: PNG/JPEG/GIF/WebP; 1–20 images, 10 MiB per image, 20 MiB total. No remote fetching. MIME content headers are owned by the composer. Validate source bytes and CID references before sending; after a send is accepted, inspect the returned message rather than resending. Reply mismatch remains an already-sent outcome. Original HTML-only actions retain their contracts.

- `ToGetGoogleWorkspaceThread(accountKey, scopePreset, threadId)`
- `ToModifyGoogleWorkspaceMessageLabels(accountKey, scopePreset, messageId, addLabelIdsJson, removeLabelIdsJson)`
- `ToTrashGoogleWorkspaceMessage(accountKey, scopePreset, messageId)`
- `ToUntrashGoogleWorkspaceMessage(accountKey, scopePreset, messageId)`

## Drive Actions
- `ToSearchGoogleWorkspaceDriveFiles(accountKey, scopePreset, query, maxResults)`
- `ToGetGoogleWorkspaceDriveMetadata(accountKey, scopePreset, fileId)`
- `ToDownloadGoogleWorkspaceDriveText(accountKey, scopePreset, fileId)`
- `ToDownloadGoogleWorkspaceDriveFileBase64(accountKey, scopePreset, fileId)`
- `ToUploadGoogleWorkspaceDriveText(accountKey, scopePreset, parentFolderId, fileName, mimeType, textContent)`
- `ToUploadGoogleWorkspaceDriveFileBase64(accountKey, scopePreset, parentFolderId, fileName, mimeType, base64Content)`
- `ToUpdateGoogleWorkspaceDriveFile(accountKey, scopePreset, fileId, fileName, mimeType, textContent, base64Content)`
- `ToDeleteGoogleWorkspaceDriveFile(accountKey, scopePreset, fileId)`
- `ToListGoogleWorkspaceDriveFilesPage(accountKey, scopePreset, query, pageSize, pageToken)`
- `ToEnsureGoogleWorkspaceDriveFolder(accountKey, scopePreset, parentFolderId, folderName)`
- `ToGrantGoogleWorkspaceDriveFilePermission(accountKey, scopePreset, fileId, permissionType, role, emailAddress, domain, allowFileDiscovery, sendNotificationEmail, emailMessage, transferOwnership)`
- `ToShareGoogleWorkspaceDriveFile(accountKey, scopePreset, fileId, permissionType, role, emailAddress, domain, allowFileDiscovery, sendNotificationEmail, emailMessage, transferOwnership)` (alias)
- `ToListGoogleWorkspaceDriveFilePermissions(accountKey, scopePreset, fileId, pageSize, pageToken)`
- `ToDeleteGoogleWorkspaceDriveFilePermission(accountKey, scopePreset, fileId, permissionId, useDomainAdminAccess)`
- `ToRevokeGoogleWorkspaceDriveFilePermission(accountKey, scopePreset, fileId, permissionId, useDomainAdminAccess)` (alias)

## Docs Actions
- `ToGetGoogleWorkspaceDocument(accountKey, scopePreset, documentId)`
- `ToCreateGoogleWorkspaceDocument(accountKey, scopePreset, title)`
- `ToReplaceTextInGoogleWorkspaceDocument(accountKey, scopePreset, documentId, searchText, replaceText)`
- `ToBatchUpdateGoogleWorkspaceDocument(accountKey, scopePreset, documentId, requestsJson)`
- `ToExtractPlainTextFromGoogleWorkspaceDocument(accountKey, scopePreset, documentId)`
- `ToCreatePublicGoogleWorkspaceDocument(accountKey, scopePreset, title, bodyTextHtml)`

## Sheets Actions
- `ToReadGoogleWorkspaceSheetRange(accountKey, scopePreset, spreadsheetId, rangeA1)`
- `ToWriteGoogleWorkspaceSheetRange(accountKey, scopePreset, spreadsheetId, rangeA1, valuesJson, majorDimension, valueInputOption)`
- `ToAppendGoogleWorkspaceSheetRows(accountKey, scopePreset, spreadsheetId, rangeA1, rowsJson, valueInputOption, insertDataOption)`
- `ToGetGoogleWorkspaceSpreadsheet(accountKey, scopePreset, spreadsheetId)`
- `ToCreateGoogleWorkspaceSheetTab(accountKey, scopePreset, spreadsheetId, title, rowCount, columnCount)`
- `ToUpdateGoogleWorkspaceSheetCell(accountKey, scopePreset, spreadsheetId, sheetName, rowIndex, columnIndex, value)`
- `ToInsertGoogleWorkspaceSheetRow(accountKey, scopePreset, spreadsheetId, sheetName, rowIndex, rowValuesJson)`

## Calendar Actions
- `ToListGoogleWorkspaceCalendarEvents(accountKey, scopePreset, calendarId, timeMinIso, timeMaxIso, maxResults, query)`
- `ToGetGoogleWorkspaceCalendarEvent(accountKey, scopePreset, calendarId, eventId)`
- `ToCreateGoogleWorkspaceCalendarEvent(accountKey, scopePreset, calendarId, summary, startIso, endIso, timeZone, description, location, attendeesJson)`
- `ToUpdateGoogleWorkspaceCalendarEvent(accountKey, scopePreset, calendarId, eventId, eventJson)`
- `ToDeleteGoogleWorkspaceCalendarEvent(accountKey, scopePreset, calendarId, eventId)`

## Required AppSettings
- Database feature row: `Google Workspace Secrets Feature`
- The GoogleWorkspace module owns OAuth mode, client credentials, redirect URI, account registry, and token state through `Buffaly.GoogleWorkspace.Storage.GoogleWorkspaceSecretsFeature`.

## Notes
- App name is fixed to `OpsAgent Google Workspace`.
- Secrets/settings are resolved server-side through the module-owned feature wrapper (`Buffaly.GoogleWorkspace.Storage.GoogleWorkspaceSecretsFeature`) backed by the database feature store.
- Wrappers return facade JSON directly with no response reshaping.
- Legacy Gmail/Auth names and phrases from the pre-refactor single-file skill are preserved as wrappers/aliases.


