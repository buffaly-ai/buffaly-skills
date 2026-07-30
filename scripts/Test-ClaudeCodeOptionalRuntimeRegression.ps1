$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$validator = Join-Path $repoRoot 'scripts\Test-ExtensionPackage.ps1'
$evidencePath = Join-Path $repoRoot 'validation-evidence\ClaudeCode.runtime-regression.evidence.json'
$ordinary = & powershell -NoProfile -ExecutionPolicy Bypass -File $validator -PackageName ClaudeCode -RepoRoot $repoRoot -JsonOutput | ConvertFrom-Json
if (-not $ordinary.Passed) { throw 'Ordinary ClaudeCode package inspection must remain available without a live runner.' }
$release = & powershell -NoProfile -ExecutionPolicy Bypass -File $validator -PackageName ClaudeCode -RepoRoot $repoRoot -RequireClaudeCodeRuntimeRegression -JsonOutput | ConvertFrom-Json
if (-not $release.Passed) { throw ('Exact production regression evidence must satisfy release validation: ' + (@($release.Errors) -join '; ')) }
$originalEvidenceBytes = [System.IO.File]::ReadAllBytes($evidencePath)
$originalEvidence = Get-Content $evidencePath -Raw
try {
    Remove-Item $evidencePath -Force
    $missingResult = & powershell -NoProfile -ExecutionPolicy Bypass -File $validator -PackageName ClaudeCode -RepoRoot $repoRoot -RequireClaudeCodeRuntimeRegression -JsonOutput | ConvertFrom-Json
    if ($missingResult.Passed) { throw 'Release validation must reject missing production evidence.' }
    if (-not (@($missingResult.Errors) -match 'evidence is required for release validation')) { throw 'Missing-evidence rejection did not preserve the expected diagnostic.' }
    Set-Content $evidencePath -Value $originalEvidence -Encoding utf8
    $stale = $originalEvidence | ConvertFrom-Json
    $stale.EntryPointSha256 = '0000000000000000000000000000000000000000000000000000000000000000'
    $stale | ConvertTo-Json | Set-Content $evidencePath -Encoding utf8
    $staleResult = & powershell -NoProfile -ExecutionPolicy Bypass -File $validator -PackageName ClaudeCode -RepoRoot $repoRoot -RequireClaudeCodeRuntimeRegression -JsonOutput | ConvertFrom-Json
    if ($staleResult.Passed) { throw 'Release validation must reject stale production evidence.' }
    if (-not (@($staleResult.Errors) -match 'does not match this exact package')) { throw 'Stale-evidence rejection did not preserve the expected diagnostic.' }
} finally {
    [System.IO.File]::WriteAllBytes($evidencePath, $originalEvidenceBytes)
}
$failingCommand = "Write-Output 'FAIL: deliberate runtime failure'; exit 17"
$withFailure = & powershell -NoProfile -ExecutionPolicy Bypass -File $validator -PackageName ClaudeCode -RepoRoot $repoRoot -RequireClaudeCodeRuntimeRegression -JsonOutput -ClaudeCodeRuntimeRegressionCommand $failingCommand | ConvertFrom-Json
if ($withFailure.Passed) { throw 'An explicitly supplied failing live-runtime command must remain authoritative over recorded evidence.' }
if (-not (@($withFailure.Errors) -match 'runtime regression command failed with exit code 17')) { throw 'Explicit runtime-command failure evidence was not preserved.' }
Write-Output 'PASS: ClaudeCode release validation requires exact production evidence or a successful explicit live command.'
