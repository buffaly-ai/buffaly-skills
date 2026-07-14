# Sheets.pts Change History

## Initialize GoogleWorkspace Service Before Sheet Operations (2026-06-01)
- Added explicit `GoogleWorkspaceService.Initialize()` calls before `ToCreateGoogleWorkspaceSpreadsheet` and `ToWriteGoogleSheetFromTabularHandleKey` invoke the module facade.

## Native DataTable Spreadsheet Export (2026-06-08)
- Added `ToCreateGoogleSpreadsheetFromDataTable(table)` as the simplest DataTable export action: it accepts only a native `DataTable` reference and creates a Google spreadsheet using the default connected account.
- Design decision: keep account, title, range, headers, and row cap as native defaults so callers can pass the boxed `System.Data.DataTable[...]` token directly without exposing rows JSON or range plumbing.
- This keeps ProtoScript as a thin wrapper while ensuring the GoogleWorkspace-owned feature configuration is loaded before spreadsheet creation or handle-to-sheet writes.
