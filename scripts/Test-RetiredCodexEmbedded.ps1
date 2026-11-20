param([string]$RepoRoot = (Split-Path $PSScriptRoot -Parent))
$ErrorActionPreference = 'Stop'

# Verify the exact retired package identity without installing, starting or contacting any runtime.
$packages = (Get-Content -LiteralPath (Join-Path $RepoRoot 'packages.index.json') -Raw | ConvertFrom-Json).Packages
if (@($packages | Where-Object { $_.PackageType -ceq 'WebModule' -and $_.PackageId -ceq 'CodexEmbedded' }).Count) {
    throw 'Retired CodexEmbedded module remains indexed.'
}
if (Test-Path -LiteralPath (Join-Path $RepoRoot 'web-modules/CodexEmbedded')) {
    throw 'Retired CodexEmbedded package directory remains.'
}
$skills = (Get-Content -LiteralPath (Join-Path $RepoRoot 'skills.index.json') -Raw | ConvertFrom-Json).Skills
if (@($skills | Where-Object { $_.SkillName -ceq 'Codex' }).Count -ne 1) {
    throw 'Independent Codex skill was removed or duplicated.'
}

. (Join-Path $PSScriptRoot 'New-ExtensionProfileLock.ps1')
$checkedLocks = 0
foreach ($name in @('core-installer', 'recommended-installer')) {
    $profilePath = Join-Path $RepoRoot "profiles/$name.profile.json"
    $profile = Get-Content -LiteralPath $profilePath -Raw | ConvertFrom-Json
    if (@($profile.Packages | Where-Object { $_.PackageType -ceq 'WebModule' -and $_.PackageId -ceq 'CodexEmbedded' }).Count) {
        throw "$name selects the retired module."
    }
    if (@($profile.Packages | Where-Object { $_.PackageType -ceq 'Skill' -and $_.PackageId -ceq 'Codex' }).Count -ne 1) {
        throw "$name lost the independent Codex skill."
    }
    foreach ($lockFile in @(Get-ChildItem -LiteralPath (Join-Path $RepoRoot 'profiles') -Filter "$name*.profile.lock.json")) {
        $lockText = [IO.File]::ReadAllText($lockFile.FullName)
        $snapshot = $lockText | ConvertFrom-Json
        if (@($snapshot.Packages | Where-Object { $_.PackageType -ceq 'WebModule' -and $_.PackageId -ceq 'CodexEmbedded' }).Count) {
            throw "$($lockFile.Name) locks the retired module."
        }
        # Recompute through the canonical generator; do not duplicate hash, membership or ordering logic.
        $expected = New-ExtensionProfileLock -RepoRoot $RepoRoot -ProfilePath $profilePath -TargetPlatform $snapshot.TargetPlatform -RepositoryCommit $snapshot.RepositoryCommit -ValidateOnly $false
        if (-not $expected.Passed) {
            throw ($expected.Errors -join '; ')
        }
        if ($lockText -cne ((ConvertTo-CanonicalJson $expected.Lock) + "`n")) {
            throw "$($lockFile.Name) does not match canonical generator output."
        }
        $checkedLocks++
    }
}
if ($checkedLocks -ne 7) {
    throw "Expected six target locks plus the legacy recommended lock; found $checkedLocks."
}
'PASS: retired module absent from catalog, payload, profiles and seven reproducible locks; independent Codex skill retained.'
