$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$validator = Join-Path $repoRoot 'scripts\Test-ExtensionPackage.ps1'
$withoutCommand = & powershell -NoProfile -ExecutionPolicy Bypass -File $validator -PackageName ClaudeCode -RepoRoot $repoRoot -JsonOutput | ConvertFrom-Json
if (-not $withoutCommand.Passed) { throw 'ClaudeCode package validation must pass when no live-runtime command is configured.' }
if (-not (@($withoutCommand.Warnings) -match 'live-runtime regression was not requested')) { throw 'Missing live-runtime command must be reported as an explicit warning.' }
$failingCommand = "Write-Output 'FAIL: deliberate runtime failure'; exit 17"
$withFailure = & powershell -NoProfile -ExecutionPolicy Bypass -File $validator -PackageName ClaudeCode -RepoRoot $repoRoot -JsonOutput -ClaudeCodeRuntimeRegressionCommand $failingCommand | ConvertFrom-Json
if ($withFailure.Passed) { throw 'An explicitly supplied failing live-runtime command must still fail package validation.' }
if (-not (@($withFailure.Errors) -match 'runtime regression command failed with exit code 17')) { throw 'Explicit runtime-command failure evidence was not preserved.' }
Write-Output 'PASS: ClaudeCode live-runtime regression is optional unless explicitly supplied.'
