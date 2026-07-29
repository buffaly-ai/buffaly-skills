[CmdletBinding()]
param(
    [string]$PackageRoot = ""
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($PackageRoot)) {
    $PackageRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
}

$indexPath = Join-Path $PackageRoot "index.pts"
if (-not (Test-Path -LiteralPath $indexPath)) {
    throw "index.pts not found at $indexPath"
}

$source = Get-Content -LiteralPath $indexPath -Raw

function Assert-Contains {
    param(
        [Parameter(Mandatory=$true)][string]$Needle,
        [Parameter(Mandatory=$true)][string]$Message
    )
    if (-not $source.Contains($Needle)) {
        throw $Message
    }
}

# This package test intentionally avoids reimplementing the scope mapper. It verifies that
# the package contains the production ProtoScript regression action and that the action is
# wired to the production helpers/seams which must be exercised in a loaded runtime via
# ToRunClaudeCodeStateScopingRegression.
Assert-Contains 'prototype ToRunClaudeCodeStateScopingRegression : ClaudeCodeSkillAction' 'Missing production ClaudeCode regression action.'
Assert-Contains 'string mappedA = ToClaudePtStateScope(scopeA);' 'Regression action does not call production scope mapper for scopeA.'
Assert-Contains 'string mappedB = ToClaudePtStateScope(scopeB);' 'Regression action does not call production scope mapper for scopeB.'
Assert-Contains 'ToClaudePtWriteState(ToClaudePtModelFile(), "haiku", scopeA);' 'Regression action does not write model state through production scoped writer for scopeA.'
Assert-Contains 'ToClaudePtWriteState(ToClaudePtModelFile(), "opus", scopeB);' 'Regression action does not write model state through production scoped writer for scopeB.'
Assert-Contains 'ToClaudePtReadState(ToClaudePtModelFile(), scopeA)' 'Regression action does not read model state through production scoped reader for scopeA.'
Assert-Contains 'ToClaudePtReadState(ToClaudePtModelFile(), scopeB)' 'Regression action does not read model state through production scoped reader for scopeB.'
Assert-Contains 'ToClaudePtWriteState(ToClaudePtWorkDirFile(), workDir, workScope);' 'Regression action does not write scoped working-directory state through production writer.'
Assert-Contains 'ToClaudePtReadState(ToClaudePtWorkDirFile(), workScope)' 'Regression action does not read scoped working-directory state through production reader.'
Assert-Contains "Write-Output ('workingDirectory=' + (Get-Location).Path)" 'Regression action does not exercise the production wrapper working-directory seam.'
Assert-Contains 'System.Security.Cryptography.SHA256' 'Production scope mapper does not include a SHA-256 hash suffix.'
Assert-Contains 'return scope + "-" + hash;' 'Production scope mapper does not append the hash to the sanitized scope.'

[PSCustomObject]@{
    Passed = $true
    PackageRoot = $PackageRoot
    ProductionRegressionAction = 'ToRunClaudeCodeStateScopingRegression'
    ValidatedSeams = @(
        'ToClaudePtStateScope',
        'ToClaudePtWriteState',
        'ToClaudePtReadState',
        'ToClaudePtWorkDirFile',
        'wrapper workingDirectory metadata'
    )
} | ConvertTo-Json -Depth 3
