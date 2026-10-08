param([Parameter(Mandatory=$true)][string]$ConfigurationPath)
$ErrorActionPreference = 'Stop'
$cfg = Get-Content -LiteralPath $ConfigurationPath -Raw | ConvertFrom-Json
$directory = Split-Path -Parent $ConfigurationPath
$log = Join-Path $directory 'trigger.log'
# A scheduler restart/retry must not submit the same reminder twice.
$gate = [IO.File]::Open((Join-Path $directory 'dispatch.started'), [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None)
$gate.Dispose()
$env:BUFFALY_INSTALL_ROOT = $cfg.InstallRoot
Set-Location -LiteralPath $cfg.InstallRoot
try {
    $payload = Join-Path $directory 'trigger.json'
    $output = & $cfg.CliPath --jsonws-cli call --service buffaly-sessions-processes --method trigger-scheduled-process --payload $payload 2>&1
    $code = $LASTEXITCODE
    [IO.File]::WriteAllText($log, (($output | Out-String) + "`r`nExitCode=$code"))
    if ($code -ne 0) { throw "Reminder CLI failed with exit code $code." }
    $result = ($output | Out-String) | ConvertFrom-Json
    if ($result.Status -cne 'Completed' -or $result.Decision -cne 'PromptSubmitted' -or $result.SessionKey -cne $cfg.SessionKey -or $result.ChildSessionKey -cne '' -or $result.ErrorMessage -cne '') { throw 'Buffaly process did not complete the same-session reminder successfully.' }
    # Process success still requires independent actual conversation-message readback for delivery proof.
    [IO.File]::WriteAllText((Join-Path $directory 'cli-completed.txt'), [DateTimeOffset]::UtcNow.ToString('O'))
    exit 0
} catch {
    [IO.File]::AppendAllText($log, "`r`nRunnerError=$($_.Exception.Message)")
    exit 1
}
