# Skills/SqlServer/Actions.pts

## Restore ToExecuteSqlQuery (2026-08-15)
- Restored `ToExecuteSqlQuery` to execute bounded read-only SQL queries with a caller-provided connection string and return `{ columns, rows, rowCount }` JSON.
- Design: keep the requested typed SQL query action in the SqlServer skill instead of the Process skill.

## Stored Procedure DataTable Action (2026-06-06)
- Added `ToRunStoredProcedureAsDataTable` to the existing SQL Server skill so stored procedure execution remains a source concern outside `TabularDataSkill` and returns native `DataTable` references for downstream TabularData operations.
