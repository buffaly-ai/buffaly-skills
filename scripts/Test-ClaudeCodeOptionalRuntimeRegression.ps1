$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$validator = Join-Path $repoRoot 'scripts\Test-ExtensionPackage.ps1'
$ordinary = & powershell -NoProfile -ExecutionPolicy Bypass -File $validator -PackageName ClaudeCode -RepoRoot $repoRoot -JsonOutput | ConvertFrom-Json
if (-not $ordinary.Passed) { throw 'Ordinary ClaudeCode package inspection must remain available without a live runner.' }
$release = & powershell -NoProfile -ExecutionPolicy Bypass -File $validator -PackageName ClaudeCode -RepoRoot $repoRoot -RequireClaudeCodeRuntimeRegression -JsonOutput | ConvertFrom-Json
if ($release.Passed) { throw 'Release validation must reject a missing trusted live-runtime command.' }
if (-not (@($release.Errors) -match 'requires a successful live runtime command')) { throw 'Missing-runner rejection did not preserve the expected diagnostic.' }
$failingCommand = "Write-Output 'FAIL: deliberate runtime failure'; exit 17"
$withFailure = & powershell -NoProfile -ExecutionPolicy Bypass -File $validator -PackageName ClaudeCode -RepoRoot $repoRoot -RequireClaudeCodeRuntimeRegression -JsonOutput -ClaudeCodeRuntimeRegressionCommand $failingCommand | ConvertFrom-Json
if ($withFailure.Passed) { throw 'An explicitly supplied failing live-runtime command must remain authoritative over recorded evidence.' }
if (-not (@($withFailure.Errors) -match 'runtime regression command failed with exit code 17')) { throw 'Explicit runtime-command failure evidence was not preserved.' }
$passingCommand = "Write-Output 'PASS: ClaudeCode state scoping regression - trusted test runner'"
$withSuccess = & powershell -NoProfile -ExecutionPolicy Bypass -File $validator -PackageName ClaudeCode -RepoRoot $repoRoot -RequireClaudeCodeRuntimeRegression -JsonOutput -ClaudeCodeRuntimeRegressionCommand $passingCommand | ConvertFrom-Json
if (-not $withSuccess.Passed) { throw ('A successful explicit live-runtime command must satisfy release validation: ' + (@($withSuccess.Errors) -join '; ')) }
Write-Output 'PASS: ClaudeCode release validation requires a successful explicit live command and rejects repository self-attestation.'
