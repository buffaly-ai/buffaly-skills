$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$validator = Join-Path $repoRoot 'scripts\Test-ExtensionPackage.ps1'
$repositoryValidator = Join-Path $repoRoot 'scripts\Test-ExtensionRepository.ps1'
$previousRuntimeCommand = $env:BUFFALY_CLAUDECODE_RUNTIME_REGRESSION_COMMAND
try {
    $env:BUFFALY_CLAUDECODE_RUNTIME_REGRESSION_COMMAND = $null
    $ordinaryRepositoryOutput = & powershell -NoProfile -ExecutionPolicy Bypass -File $repositoryValidator -RepoRoot $repoRoot 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw ('Ordinary repository validation must not gate on ClaudeCode runtime execution: ' + (($ordinaryRepositoryOutput | Out-String).Trim()))
    }
    $gatedRepositoryOutput = & powershell -NoProfile -ExecutionPolicy Bypass -File $repositoryValidator -RepoRoot $repoRoot -RequireClaudeCodeRuntimeRegression 2>&1
    if ($LASTEXITCODE -eq 0) { throw 'Explicit ClaudeCode repository runtime validation must reject a missing trusted runner.' }
    if (($gatedRepositoryOutput | Out-String) -notmatch 'ClaudeCode release validation requires a successful live runtime command') {
        throw 'Explicit ClaudeCode repository validation did not preserve the missing-runner diagnostic.'
    }
} finally {
    $env:BUFFALY_CLAUDECODE_RUNTIME_REGRESSION_COMMAND = $previousRuntimeCommand
}
$ordinary = & powershell -NoProfile -ExecutionPolicy Bypass -File $validator -PackageName ClaudeCode -RepoRoot $repoRoot -JsonOutput | ConvertFrom-Json
if (-not $ordinary.Passed) { throw 'Ordinary ClaudeCode package inspection must remain available without a live runner.' }
$release = & powershell -NoProfile -ExecutionPolicy Bypass -File $validator -PackageName ClaudeCode -RepoRoot $repoRoot -RequireClaudeCodeRuntimeRegression -JsonOutput | ConvertFrom-Json
if ($release.Passed) { throw 'Release validation must reject a missing trusted live-runtime command.' }
if (-not (@($release.Errors) -match 'requires a successful live runtime command')) { throw 'Missing-runner rejection did not preserve the expected diagnostic.' }
$failingCommand = "Write-Output 'FAIL: deliberate runtime failure'; exit 17"
$withFailure = & powershell -NoProfile -ExecutionPolicy Bypass -File $validator -PackageName ClaudeCode -RepoRoot $repoRoot -RequireClaudeCodeRuntimeRegression -JsonOutput -ClaudeCodeRuntimeRegressionCommand $failingCommand | ConvertFrom-Json
if ($withFailure.Passed) { throw 'An explicitly supplied failing live-runtime command must remain authoritative over recorded evidence.' }
if (-not (@($withFailure.Errors) -match 'runtime regression command failed with exit code 17')) { throw 'Explicit runtime-command failure evidence was not preserved.' }
$genericPassCommand = "Write-Output 'PASS: ClaudeCode state scoping regression - unbound result'"
$withGenericPass = & powershell -NoProfile -ExecutionPolicy Bypass -File $validator -PackageName ClaudeCode -RepoRoot $repoRoot -RequireClaudeCodeRuntimeRegression -JsonOutput -ClaudeCodeRuntimeRegressionCommand $genericPassCommand | ConvertFrom-Json
if ($withGenericPass.Passed) { throw 'A generic trusted PASS must not certify an unbound ClaudeCode candidate.' }
if (-not (@($withGenericPass.Errors) -match 'was not bound to the exact candidate')) { throw 'Unbound-result rejection did not preserve the expected diagnostic.' }
$mismatchedCommand = @'
$candidateRoot = $env:BUFFALY_CLAUDECODE_CANDIDATE_PACKAGE_ROOT
$version = $env:BUFFALY_CLAUDECODE_CANDIDATE_PACKAGE_VERSION
$challenge = $env:BUFFALY_CLAUDECODE_VALIDATION_CHALLENGE
Write-Output 'PASS: ClaudeCode state scoping regression - mismatched candidate'
Write-Output ('CandidatePackageVersion=' + $version)
Write-Output 'CandidateEntryPointSha256=0000000000000000000000000000000000000000000000000000000000000000'
Write-Output ('ValidationChallenge=' + $challenge)
'@
$previousRuntimeCommand = $env:BUFFALY_CLAUDECODE_RUNTIME_REGRESSION_COMMAND
try {
    $env:BUFFALY_CLAUDECODE_RUNTIME_REGRESSION_COMMAND = $mismatchedCommand
    $withMismatch = & powershell -NoProfile -ExecutionPolicy Bypass -File $validator -PackageName ClaudeCode -RepoRoot $repoRoot -RequireClaudeCodeRuntimeRegression -JsonOutput | ConvertFrom-Json
    if ($withMismatch.Passed) { throw 'A trusted runner reporting a different candidate hash must be rejected.' }
$passingCommand = @'
$candidateRoot = $env:BUFFALY_CLAUDECODE_CANDIDATE_PACKAGE_ROOT
$candidatePath = Join-Path $candidateRoot 'index.pts'
$version = $env:BUFFALY_CLAUDECODE_CANDIDATE_PACKAGE_VERSION
$expectedHash = $env:BUFFALY_CLAUDECODE_CANDIDATE_ENTRYPOINT_SHA256
$challenge = $env:BUFFALY_CLAUDECODE_VALIDATION_CHALLENGE
$text = [System.IO.File]::ReadAllText($candidatePath).Replace("`r`n", "`n").Replace("`r", "`n")
if ($text.Length -gt 0 -and $text[0] -eq [char]0xFEFF) { $text = $text.Substring(1) }
$bytes = [System.Text.UTF8Encoding]::new($false).GetBytes($text)
$sha = [System.Security.Cryptography.SHA256]::Create()
try { $actualHash = ([BitConverter]::ToString($sha.ComputeHash($bytes)).Replace('-', '').ToLowerInvariant()) } finally { $sha.Dispose() }
if ($actualHash -ne $expectedHash) { throw "Candidate changed before runtime validation: $actualHash" }
Write-Output 'PASS: ClaudeCode state scoping regression - trusted candidate runner'
Write-Output ('CandidatePackageVersion=' + $version)
Write-Output ('CandidateEntryPointSha256=' + $actualHash)
Write-Output ('ValidationChallenge=' + $challenge)
'@
    $env:BUFFALY_CLAUDECODE_RUNTIME_REGRESSION_COMMAND = $passingCommand
    $withSuccess = & powershell -NoProfile -ExecutionPolicy Bypass -File $validator -PackageName ClaudeCode -RepoRoot $repoRoot -RequireClaudeCodeRuntimeRegression -JsonOutput | ConvertFrom-Json
    if (-not $withSuccess.Passed) { throw ('A successful explicit live-runtime command must satisfy release validation: ' + (@($withSuccess.Errors) -join '; ')) }
} finally {
    $env:BUFFALY_CLAUDECODE_RUNTIME_REGRESSION_COMMAND = $previousRuntimeCommand
}
Write-Output 'PASS: ClaudeCode release validation requires a trusted runner bound to the exact candidate identity and rejects generic or mismatched PASS results.'
