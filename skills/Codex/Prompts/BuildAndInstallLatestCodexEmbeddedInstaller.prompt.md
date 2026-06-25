# Build And Install Latest CodexEmbedded Installer

Goal
- Build the latest Buffaly.CodexEmbedded installer (MSI) from local source and install it silently on this machine.

Execution rules
- Use the local repo at `C:\dev\Buffaly.CodexEmbedded`.
- Prefer typed tools; use PowerShell only for repo/script execution.
- Fail fast on non-zero exit codes and report exact command and error.
- Keep the run deterministic and provide final artifact paths.

Steps
1) Validate prerequisites
- Confirm `pwsh`, `dotnet`, `git`, and `wix` are available.
- Confirm repo exists at `C:\dev\Buffaly.CodexEmbedded`.

2) Determine version tag for MSI script
- Read latest git tag matching `v*`.
- Compute next version in format `vYYYY.MM.DD.NN` for today.
- If today already has tags, increment `NN`; otherwise start at `01`.

3) Publish payloads
- Run:
  - `pwsh -NoProfile -ExecutionPolicy Bypass -File .\scripts\release\publish.ps1 -Runtime win-x64 -Configuration Release`
- Verify output folders exist:
  - `artifacts\publish\win-x64\cli`
  - `artifacts\publish\win-x64\web`

4) Build MSI
- Run:
  - `pwsh -NoProfile -ExecutionPolicy Bypass -File .\scripts\release\msi.ps1 -Runtime win-x64 -Version <computedVersion>`
- Verify MSI exists at:
  - `artifacts\release\Buffaly.CodexEmbedded-win-x64-<computedVersion>.msi`

5) Install silently
- Ensure writable log folder exists, e.g. `C:\temp\Buffaly\msi-logs`.
- Run:
  - `msiexec /i "<msiPath>" /qn /norestart /l*v "C:\temp\Buffaly\msi-logs\codexembedded-install-<computedVersion>.log"`
- Confirm exit code is `0`.

6) Verify installation
- Confirm these files exist (expected default location):
  - `C:\Program Files (x86)\Buffaly Codex Embedded\apps\cli\Buffaly.CodexEmbedded.Cli.exe`
  - `C:\Program Files (x86)\Buffaly Codex Embedded\apps\web\Buffaly.CodexEmbedded.Web.exe`
  - `C:\Program Files (x86)\Buffaly Codex Embedded\bin\buffaly-codex.cmd`
  - `C:\Program Files (x86)\Buffaly Codex Embedded\bin\buffaly-codex-web.cmd`

7) Report
- Return:
  - computed version
  - MSI path
  - install log path
  - installer exit code
  - verification results for each expected binary
- If any step fails, include concise remediation and stop.
