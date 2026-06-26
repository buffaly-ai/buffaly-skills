# ToSetupSqlServer2025ExpressSkill

Use this workflow to install and validate SQL Server 2025 Express on a Windows host with reliable troubleshooting and hardening.

## Scope
- Target: Windows Server host
- Goal: working SQL Server 2025 Express instance with SQL auth enabled
- Includes: install, verification, troubleshooting, and post-install hardening

## Preconditions
1. Run in elevated PowerShell.
2. Confirm installer media exists (for example `C:\temp\sql2025-media\SQLEXPR_x64_ENU.exe`).
3. Choose a strong SA password that meets SQL password policy requirements.
4. If remote-managed, ensure SSM/RDP path is stable before install.

## Install Command Pattern
Use a dedicated argument variable name (not `$args`) to avoid PowerShell automatic variable collisions.

```powershell
$ErrorActionPreference = 'Stop'
$mediaExe = 'C:\temp\sql2025-media\SQLEXPR_x64_ENU.exe'
$saPassword = '<STRONG_SA_PASSWORD>'

$installArgs = @(
  '/Q',
  '/ACTION=Install',
  '/FEATURES=SQL',
  '/INSTANCENAME=SQLEXPRESS2025',
  '/IACCEPTSQLSERVERLICENSETERMS',
  '/SUPPRESSPRIVACYSTATEMENTNOTICE',
  '/UpdateEnabled=False',
  '/TCPENABLED=1',
  '/NPENABLED=1',
  '/SECURITYMODE=SQL',
  "/SAPWD=$saPassword",
  '/SQLSVCSTARTUPTYPE=Automatic',
  '/SQLSYSADMINACCOUNTS=BUILTIN\Administrators'
) | Where-Object { $_ -ne $null -and $_ -ne '' }

$p = Start-Process -FilePath $mediaExe -ArgumentList $installArgs -Wait -PassThru -NoNewWindow
$p.ExitCode
```

## Verification
```powershell
Get-Service -Name 'MSSQL$SQLEXPRESS2025' | Select-Object Name, Status, StartType
```

Expected: service is `Running` and `Automatic`.

Optional SQL auth verification:
```powershell
sqlcmd -S .\SQLEXPRESS2025 -U sa -P "<SA_PASSWORD>" -Q "SELECT @@VERSION;"
```

## Known Failure Modes and Fixes
1. `ArgumentList` null/validation error from `Start-Process`:
   - Cause: use of `$args` or null element in argument array.
   - Fix: use `$installArgs` and filter null/empty elements.

2. `InputSettingValidationException` for SA password:
   - Cause: SA password fails SQL strong password requirements.
   - Fix: choose a longer mixed password with upper/lower/number/symbol and retry.

3. Remote SSM quoting/escaping parser failures:
   - Cause: nested quoting and JSON escaping in inline remote scripts.
   - Fix: run locally over RDP when possible, or use simpler remote payloads with minimal escaping and low output volume.

4. Remote wrapper instability or out-of-memory while streaming large setup output:
   - Cause: very large installer output through remote wrapper.
   - Fix: reduce streamed output, inspect setup logs directly (`Summary_*.txt`, `Detail.txt`).

## Post-Install Hardening
1. Immediately rotate SA password to a final strong secret.
2. Prefer separate least-privilege app logins over daily SA use.
3. Keep RDP ingress restricted to a single trusted `/32` IP when RDP is required.

## Completion Criteria
- SQL service `MSSQL$SQLEXPRESS2025` is running and automatic.
- SQL authentication works with the final password.
- Setup logs show no blocking failures for core DB Engine feature.
- Temporary credentials (if used) are rotated/retired.