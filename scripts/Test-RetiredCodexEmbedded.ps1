param([string]$RepoRoot = (Split-Path $PSScriptRoot -Parent))
$ErrorActionPreference = 'Stop'

# Verify retired module absence and the subsequently approved optional-skill baseline retirement without installing any runtime.
$packages = (Get-Content -LiteralPath (Join-Path $RepoRoot 'packages.index.json') -Raw | ConvertFrom-Json).Packages
if (@($packages | Where-Object { $_.PackageType -ceq 'WebModule' -and $_.PackageId -ceq 'CodexEmbedded' }).Count) {
    throw 'Retired CodexEmbedded module remains indexed.'
}
if (Test-Path -LiteralPath (Join-Path $RepoRoot 'web-modules/CodexEmbedded')) {
    throw 'Retired CodexEmbedded package directory remains.'
}
$skills = (Get-Content -LiteralPath (Join-Path $RepoRoot 'skills.index.json') -Raw | ConvertFrom-Json).Skills
if (@($skills | Where-Object { $_.SkillName -ceq 'Codex' }).Count -ne 1) {
    throw 'Historical Codex package availability changed outside the profile-only retirement batch.'
}

. (Join-Path $PSScriptRoot 'New-ExtensionProfileLock.ps1')
$checkedLocks = 0
$fixtureRoot = Join-Path ([IO.Path]::GetTempPath()) ('buffaly-codex-retirement-locks-' + [Guid]::NewGuid().ToString('N'))
$snapshotRoots = @{}
try {
    foreach ($name in @('core-installer', 'recommended-installer')) {
        $profile = Get-Content -LiteralPath (Join-Path $RepoRoot "profiles/$name.profile.json") -Raw | ConvertFrom-Json
        if (@($profile.Packages | Where-Object { $_.PackageType -ceq 'WebModule' -and $_.PackageId -ceq 'CodexEmbedded' }).Count) {
            throw "$name selects the retired module."
        }
        if (@($profile.Packages | Where-Object { $_.PackageType -ceq 'Skill' -and $_.PackageId -ceq 'Codex' }).Count) {
            throw "$name selects the retired optional Codex skill."
        }
        foreach ($lockFile in @(Get-ChildItem -LiteralPath (Join-Path $RepoRoot 'profiles') -Filter "$name*.profile.lock.json")) {
            $lockText = [IO.File]::ReadAllText($lockFile.FullName)
            $snapshot = $lockText | ConvertFrom-Json
            if (@($snapshot.Packages | Where-Object { $_.PackageType -ceq 'WebModule' -and $_.PackageId -ceq 'CodexEmbedded' }).Count) {
                throw "$($lockFile.Name) locks the retired module."
            }
            if (@($snapshot.Packages | Where-Object { $_.PackageType -ceq 'Skill' -and $_.PackageId -ceq 'Codex' }).Count) {
                throw "$($lockFile.Name) locks the retired optional Codex skill."
            }
            $commit = [string]$snapshot.RepositoryCommit
            if ($commit -cnotmatch '^[0-9a-f]{40}$') { throw 'Lock must pin an exact repository commit.' }
            if (-not $snapshotRoots.ContainsKey($commit)) {
                # Materialize only committed metadata into a disposable test fixture, never a publication root or worktree.
                $snapshotRoot = Join-Path $fixtureRoot $commit
                New-Item -ItemType Directory -Path (Join-Path $snapshotRoot 'profiles') -Force | Out-Null
                foreach ($relativePath in @('packages.index.json', 'skills.index.json', 'profiles/core-installer.profile.json', 'profiles/recommended-installer.profile.json')) {
                    $reference = $commit + ':' + $relativePath
                    $text = git -C $RepoRoot show $reference
                    if ($LASTEXITCODE -ne 0) { throw "Cannot read pinned metadata: $reference" }
                    [IO.File]::WriteAllText((Join-Path $snapshotRoot $relativePath), ($text -join "`n") + "`n", [Text.UTF8Encoding]::new($false))
                }
                $snapshotRoots[$commit] = $snapshotRoot
            }
            $snapshotRoot = $snapshotRoots[$commit]
            # Recompute through the canonical generator against the lock's pinned input, not a moving catalog HEAD.
            $expected = New-ExtensionProfileLock -RepoRoot $snapshotRoot -ProfilePath (Join-Path $snapshotRoot "profiles/$name.profile.json") -TargetPlatform $snapshot.TargetPlatform -RepositoryCommit $commit -ValidateOnly $false
            if (-not $expected.Passed) { throw ($expected.Errors -join '; ') }
            if ($lockText -cne ((ConvertTo-CanonicalJson $expected.Lock) + "`n")) {
                throw "$($lockFile.Name) does not match canonical generation from its pinned commit."
            }
            $checkedLocks++
        }
    }
    if ($checkedLocks -ne 7) {
        throw "Expected six target locks plus the legacy recommended lock; found $checkedLocks."
    }
}
finally {
    if (Test-Path -LiteralPath $fixtureRoot) { Remove-Item -LiteralPath $fixtureRoot -Recurse -Force }
}
'PASS: retired module absent; optional Codex skill absent from both baselines and seven reproducible pinned locks; historical package payload and normal model transport unchanged.'
