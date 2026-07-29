[CmdletBinding()]
param(
    [string]$TempRoot = (Join-Path ([System.IO.Path]::GetTempPath()) ("claude-code-scope-regression-" + [System.Guid]::NewGuid().ToString("N")))
)

$ErrorActionPreference = "Stop"

function Get-ClaudeStateScope {
    param([Parameter(Mandatory=$true)][string]$StateScope)

    $scope = $StateScope
    foreach ($pair in @(
        @("\", "_"),
        @("/", "_"),
        @(":", "_"),
        @("*", "_"),
        @("?", "_"),
        @('"', "_"),
        @("<", "_"),
        @(">", "_"),
        @("|", "_")
    )) {
        $scope = $scope.Replace($pair[0], $pair[1])
    }
    $scope = $scope.Trim()
    if ([string]::IsNullOrWhiteSpace($scope)) { $scope = "default" }

    $bytes = [System.Text.UTF8Encoding]::new($false).GetBytes($StateScope)
    $sha = [System.Security.Cryptography.SHA256]::Create()
    try {
        $hash = ([BitConverter]::ToString($sha.ComputeHash($bytes)).Replace("-", "").ToLowerInvariant()).Substring(0, 16)
    }
    finally {
        $sha.Dispose()
    }

    return "$scope-$hash"
}

function Get-ClaudeScopedFile {
    param(
        [Parameter(Mandatory=$true)][string]$FileName,
        [Parameter(Mandatory=$true)][string]$StateScope
    )
    Join-Path $TempRoot (Join-Path "claude_pt_state" (Join-Path (Get-ClaudeStateScope -StateScope $StateScope) $FileName))
}

function Write-ClaudeState {
    param(
        [Parameter(Mandatory=$true)][string]$FileName,
        [Parameter(Mandatory=$true)][string]$Value,
        [Parameter(Mandatory=$true)][string]$StateScope
    )
    $path = Get-ClaudeScopedFile -FileName $FileName -StateScope $StateScope
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $path) | Out-Null
    Set-Content -LiteralPath $path -Value $Value -Encoding utf8 -NoNewline
    return $path
}

function Read-ClaudeState {
    param(
        [Parameter(Mandatory=$true)][string]$FileName,
        [Parameter(Mandatory=$true)][string]$StateScope
    )
    $path = Get-ClaudeScopedFile -FileName $FileName -StateScope $StateScope
    if (-not (Test-Path -LiteralPath $path)) { return "" }
    return [string](Get-Content -LiteralPath $path -Raw)
}

function Invoke-WrapperWorkingDirectoryProbe {
    param([Parameter(Mandatory=$true)][string]$WorkingDirectory)

    $script = '$ErrorActionPreference=''Stop'';'
    $script += "if(Test-Path -LiteralPath '$($WorkingDirectory.Replace("'", "''"))'){ Set-Location -LiteralPath '$($WorkingDirectory.Replace("'", "''"))' };"
    $script += "Write-Output ('workingDirectory=' + (Get-Location).Path);"
    return (& ([scriptblock]::Create($script))) -join "`n"
}

try {
    New-Item -ItemType Directory -Force -Path $TempRoot | Out-Null

    # Regression 1: lossy sanitized scopes must not collide.
    $scopeA = "collision/a"
    $scopeB = "collision\a"
    $mappedA = Get-ClaudeStateScope -StateScope $scopeA
    $mappedB = Get-ClaudeStateScope -StateScope $scopeB

    if ($mappedA -eq $mappedB) {
        throw "Scope collision regression failed: '$scopeA' and '$scopeB' mapped to '$mappedA'."
    }
    if (-not ($mappedA.StartsWith("collision_a-") -and $mappedB.StartsWith("collision_a-"))) {
        throw "Scope collision regression failed: expected shared sanitized prefix with hash suffix; got '$mappedA' and '$mappedB'."
    }

    Write-ClaudeState -FileName "claude_pt_model.txt" -Value "haiku" -StateScope $scopeA | Out-Null
    Write-ClaudeState -FileName "claude_pt_model.txt" -Value "opus" -StateScope $scopeB | Out-Null
    $modelA = [string](Read-ClaudeState -FileName "claude_pt_model.txt" -StateScope $scopeA)
    $modelB = [string](Read-ClaudeState -FileName "claude_pt_model.txt" -StateScope $scopeB)
    if ($modelA -ne "haiku") { throw "Scope collision regression failed: expected haiku for '$scopeA', got '$modelA'." }
    if ($modelB -ne "opus") { throw "Scope collision regression failed: expected opus for '$scopeB', got '$modelB'." }

    # Regression 2: scoped working-directory state is consumed by the main wrapper before invocation.
    $workScope = "workdir-scope-regression"
    $workDir = Join-Path $TempRoot "workdir"
    New-Item -ItemType Directory -Force -Path $workDir | Out-Null
    Write-ClaudeState -FileName "claude_pt_workdir.txt" -Value $workDir -StateScope $workScope | Out-Null
    $configuredWorkDir = [string](Read-ClaudeState -FileName "claude_pt_workdir.txt" -StateScope $workScope)
    if ($configuredWorkDir -ne $workDir) { throw "Scoped workdir regression failed: expected '$workDir', got '$configuredWorkDir'." }

    $probe = Invoke-WrapperWorkingDirectoryProbe -WorkingDirectory $configuredWorkDir
    if ($probe -ne "workingDirectory=$workDir") {
        throw "Scoped workdir regression failed: wrapper location probe returned '$probe'."
    }

    [PSCustomObject]@{
        Passed = $true
        TempRoot = $TempRoot
        CollisionScopeA = $mappedA
        CollisionScopeB = $mappedB
        ModelA = $modelA
        ModelB = $modelB
        WorkdirScope = Get-ClaudeStateScope -StateScope $workScope
        WrapperProbe = $probe
    } | ConvertTo-Json -Depth 3
}
finally {
    if (Test-Path -LiteralPath $TempRoot) {
        Remove-Item -LiteralPath $TempRoot -Recurse -Force -ErrorAction SilentlyContinue
    }
}
