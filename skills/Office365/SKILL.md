# Office365 Skill

Provides DLL-backed Ops actions for Office 365 / Microsoft Graph OAuth, Mail, Calendar (and future OneDrive/Teams) using facade static classes in `Buffaly.Office365.Services.Office365ServiceHost`.

## Structure
- `Common.pts`
  - Shared references/imports.
  - Scope normalization helpers (`NormalizeOffice365OperationScopePreset`).
- `Auth.pts`
- `Mail.pts`
- `Calendar.pts`
- `OneDrive.pts`
- `Teams.pts`
- `index.pts`
  - Includes the files above.

## Auth Actions
- `ToStartOffice365Authorization(accountKey, scopePreset, returnUrl, forceConsent)`
- `ToCompleteOffice365Authorization(state, code)`
- `ToRefreshOffice365Authorization(accountKey, scopePreset)`
- `ToRevokeOffice365Authorization(accountKey, scopePreset)`
- `ToListOffice365Accounts()`
- `ToGetOffice365Account(accountKey)`
- `ToSetDefaultOffice365Account(accountKey)`
- `ToRemoveOffice365Account(accountKey)`

## Mail Actions
- `ToSearchOffice365Messages(accountKey, scopePreset, query, maxResults)`
- `ToGetOffice365Message(accountKey, scopePreset, messageId)`
- `ToSendOffice365Email(accountKey, scopePreset, from, to, subject, htmlBody, cc, bcc, replyTo, extraHeadersJson)`
- `ToCreateOffice365Draft(accountKey, scopePreset, from, to, subject, htmlBody, threadId, cc, bcc, replyTo, extraHeadersJson)`
- `ToGetOffice365Thread(accountKey, scopePreset, threadId)`
- `ToModifyOffice365MessageLabels(accountKey, scopePreset, messageId)`
- `ToTrashOffice365Message(accountKey, scopePreset, messageId)`
- `ToUntrashOffice365Message(accountKey, scopePreset, messageId)`
- `ToGetRecentOffice365Messages(accountKey, scopePreset, maxResults)`
- `ToGetNewOffice365MessagesSinceId(accountKey, scopePreset, sinceMessageId, maxResults)`

## Calendar Actions
- `ToListOffice365CalendarEvents(accountKey, scopePreset, calendarId, timeMinIso, timeMaxIso, maxResults, query)`
- `ToGetOffice365CalendarEvent(accountKey, scopePreset, calendarId, eventId)`
- `ToCreateOffice365CalendarEvent(accountKey, scopePreset, calendarId, summary, startIso, endIso, timeZone, description, location, attendeesJson)`
- `ToUpdateOffice365CalendarEvent(accountKey, scopePreset, calendarId, eventId, eventJson)`
- `ToDeleteOffice365CalendarEvent(accountKey, scopePreset, calendarId, eventId)`

## OneDrive Actions
- `ToSearchOffice365OneDriveFiles(accountKey, scopePreset, query, maxResults)`
- `ToGetOffice365OneDriveMetadata(accountKey, scopePreset, fileId)`
- `ToDownloadOffice365OneDriveText(accountKey, scopePreset, fileId)`
- `ToDownloadOffice365OneDriveFileBase64(accountKey, scopePreset, fileId)`
- `ToUploadOffice365OneDriveText(accountKey, scopePreset, parentFolderId, fileName, mimeType, textContent)`
- `ToUploadOffice365OneDriveFileBase64(accountKey, scopePreset, parentFolderId, fileName, mimeType, base64Content)`
- `ToUploadOffice365OneDriveFileFromDisk(accountKey, scopePreset, parentFolderId, localFilePath, fileName, mimeType)`
- `ToUploadOffice365OneDriveFileFromDiskQuick(accountKey, parentFolderId, localFilePath)`
- `ToUpdateOffice365OneDriveFile(accountKey, scopePreset, fileId, fileName, mimeType, textContent, base64Content)`
- `ToDeleteOffice365OneDriveFile(accountKey, scopePreset, fileId)`
- `ToListOffice365OneDriveFilesPage(accountKey, scopePreset, query, pageSize, pageToken)`
- `ToEnsureOffice365OneDriveFolder(accountKey, scopePreset, parentFolderId, folderName)`

## Teams Actions
- `ToListOffice365TeamsSpacesByAccount(accountKey, scopePreset, pageSize, pageToken, joinedOnly, spaceType)`
- `ToListOffice365TeamsMessagesPageByAccount(accountKey, scopePreset, space, pageSize, pageToken)`
- `ToSendOffice365TeamsMessageByAccount(accountKey, scopePreset, space, messageText)`
- `ToListOffice365TeamsMessagesByAccount(accountKey, scopePreset, space, pageSize)`

## Inbox Router (Scheduled Process)
- `Office365InboxRouterClient` (reflection adapter to service host `SearchMessagesAsync` / `GetMessageFullPayloadAsync`)
- `Office365InboxRouterHandler` (IScheduledProcessHandler using `Office365InboxRouterRunData`)
  - Supports cursor by `LastProcessedInternalDateUtc` + processed ID list
  - Dispatches to parent or per-message child sessions
  - Uses `mail.read` scope preset by default
  - Message envelope includes `Office365MessageId`, `Office365ThreadId`

## Required AppSettings / Features
- Database feature row: `Office 365 Secrets Feature`
- The Office365 web module owns OAuth mode, client credentials, redirect URI, account registry, and token state through `Buffaly.Office365.Storage.Office365SecretsFeature`.

## Notes
- Account keys are normalized to the `Office365#label` form (e.g. `Office365#primary`).
- App name is fixed to `OpsAgent Office 365`.
- Secrets/settings are resolved server-side through the module-owned feature wrapper backed by the database feature store.
- All wrappers call the matching `Office365ServiceHost.*Async(...)` (or sync) and return the raw JSON string from the facade with no reshaping.
- Scope presets are normalized in `Common.pts` (maps common presets like `mail.read`, `mail.send`, `calendars.readwrite`).
- `Office365Service.Initialize()` calls `Office365ServiceHost.InitializeFromFeature()`.
- Inbox routing uses the same service host as the skill (no separate DLL dependency).
- Future: OneDrive, Teams/Chat, and additional Mail/Calendar actions will follow the same thin-wrapper + facade pattern.
