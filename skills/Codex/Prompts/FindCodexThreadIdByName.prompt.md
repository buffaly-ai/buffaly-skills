# Find Codex Thread ID By Thread Name

Goal
- Resolve a Codex `threadId` from a known thread name.

Steps
1. Resolve Codex home:
   - Use `CODEX_HOME` if set.
   - Else use `%USERPROFILE%\.codex`.
2. Read `<codexHome>\session_index.jsonl`.
3. Parse each JSONL line as JSON.
4. Filter by `thread_name` case-insensitively for the target name.
5. Return matching rows with:
   - `id`
   - `thread_name`
   - `updated_at`
6. Use `id` as `threadId`.

PowerShell Example
```powershell
$codexHome = if ($env:CODEX_HOME -and $env:CODEX_HOME.Trim()) { $env:CODEX_HOME } else { Join-Path $env:USERPROFILE '.codex' }
$index = Join-Path $codexHome 'session_index.jsonl'
Get-Content $index |
  Where-Object { $_.Trim() } |
  ForEach-Object { $_ | ConvertFrom-Json } |
  Where-Object { $_.thread_name -match '(?i)google\s*workspace' } |
  Select-Object id, thread_name, updated_at
```
