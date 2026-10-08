param([Parameter(Mandatory=$true)][string]$ConfigurationPath)
$ErrorActionPreference = 'Stop'
$cfg = Get-Content -LiteralPath $ConfigurationPath -Raw | ConvertFrom-Json
$root = Split-Path -Parent $ConfigurationPath
$runner = Join-Path $root 'run.ps1'
$payload = Join-Path $root 'trigger.json'
# The CLI boundary uses ProcessID, avoiding the existing 1000-row name lookup.
@{ contract = @{ ProcessID = $cfg.ProcessID; TriggerSource = 'SessionSnooze'; TriggerKey = $cfg.TriggerKey } } | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $payload -Encoding UTF8
if (Get-ScheduledTask -TaskName $cfg.TaskName -ErrorAction SilentlyContinue) { throw 'A task already exists for this request; do not overwrite it.' }
$due = [DateTimeOffset]::ParseExact($cfg.ScheduledAtUtc, 'O', [Globalization.CultureInfo]::InvariantCulture)
$trigger = New-ScheduledTaskTrigger -Once -At $due.LocalDateTime
# Explicit UTC boundary avoids machine timezone/DST ambiguity.
$trigger.StartBoundary = $due.UtcDateTime.ToString("yyyy-MM-dd'T'HH:mm:ss'Z'", [Globalization.CultureInfo]::InvariantCulture)
$action = New-ScheduledTaskAction -Execute $cfg.PowerShellPath -WorkingDirectory $cfg.InstallRoot -Argument ('-NoProfile -NonInteractive -ExecutionPolicy Bypass -File "' + $runner + '" -ConfigurationPath "' + $ConfigurationPath + '"')
$principal = New-ScheduledTaskPrincipal -UserId $cfg.Principal -LogonType S4U -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 20)
Register-ScheduledTask -TaskName $cfg.TaskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description 'One-time same-conversation Buffaly snooze reminder' | Out-Null
$task = Get-ScheduledTask -TaskName $cfg.TaskName
if ($task.Actions.Count -ne 1 -or $task.Triggers.Count -ne 1) { throw 'Unexpected task action/trigger count.' }
if ($task.Actions[0].Execute -cne $cfg.PowerShellPath -or $task.Actions[0].WorkingDirectory -cne $cfg.InstallRoot -or $task.Actions[0].Arguments -cne $action.Arguments) { throw 'Task action readback mismatch.' }
if ($task.Principal.LogonType.ToString() -cne 'S4U' -or $task.Principal.RunLevel.ToString() -cne 'Highest') { throw 'Task principal mode readback mismatch.' }
# Windows may return a resolved SID instead of the configured account name.
$expectedSid = ([Security.Principal.NTAccount]$cfg.Principal).Translate([Security.Principal.SecurityIdentifier]).Value
$actualSid = if ($task.Principal.UserId -match '^S-1-') { $task.Principal.UserId } else { ([Security.Principal.NTAccount]$task.Principal.UserId).Translate([Security.Principal.SecurityIdentifier]).Value }
if ($expectedSid -cne $actualSid) { throw 'Task principal identity readback mismatch.' }
$actual = [DateTimeOffset]::Parse($task.Triggers[0].StartBoundary, [Globalization.CultureInfo]::InvariantCulture)
if ([Math]::Abs(($actual - $due).TotalSeconds) -ge 1) { throw 'Task timestamp readback mismatch.' }
$actual.ToUniversalTime().ToString('O')
