# To launch Metabase locally (working fallback)

Use this when the IIS Express profile does not stay running or when HTTPS binding fails locally.

## Target project
- Project file: `C:\dev\RooTrax\RooTrax.Utilities\Metabase\Metabase.csproj`
- Working directory: `C:\dev\RooTrax\RooTrax.Utilities`

## Why fallback is needed
- Default launch profiles can fail due to HTTPS bind conflicts/permissions (for example on `https://localhost:7182`).
- IIS Express profile may report start but not keep a listener alive.

## Preferred launch command (HTTP-only)
Run from a Windows shell:

`cmd /c set ASPNETCORE_URLS=http://localhost:5197&& dotnet run --project "C:\dev\RooTrax\RooTrax.Utilities\Metabase\Metabase.csproj" --no-launch-profile`

## Verification checklist
1. Confirm listener on port `5197`.
2. Probe `http://localhost:5197/` and expect HTTP 200 (or login redirect).
3. Open `http://localhost:5197/login`.

## Troubleshooting
- If build fails from stale static web assets, clear `Metabase\bin` and `Metabase\obj`, then rerun.
- If another process is already bound to `5197`, pick a free port and update `ASPNETCORE_URLS` plus browser URL accordingly.

## Output expectation
Return:
1. Launch command used
2. Listener/probe result
3. Final URL to use