param([string]$RepoRoot = (Split-Path $PSScriptRoot -Parent))
$ErrorActionPreference = 'Stop'
. (Join-Path $RepoRoot 'scripts/Test-ExtensionPackage.ps1')

# Exercise the actual package validator with isolated dependency manifests; never publish or load a DLL.
$fixtureRoot = Join-Path ([IO.Path]::GetTempPath()) ('RetiredCodeSearchDependency-' + [Guid]::NewGuid().ToString('N'))
$packageRoot = Join-Path $fixtureRoot 'fixture'
New-Item $packageRoot -ItemType Directory -Force | Out-Null
try {
    $cases = @(
        @{ Name = 'Retired adapter is not host-provided'; Assembly = 'Buffaly.Agent.Tools.CodeSearch'; Supply = $false; Expected = $false },
        @{ Name = 'Legacy self-contained package remains valid'; Assembly = 'Buffaly.Agent.Tools.CodeSearch'; Supply = $true; Expected = $true },
        @{ Name = 'Retained HTTP tool remains host-provided'; Assembly = 'Buffaly.Agent.Tools.Http'; Supply = $false; Expected = $true }
    )
    foreach ($case in $cases) {
        Get-ChildItem $packageRoot -File | Remove-Item -Force
        $assembly = $case.Assembly
        $target = [ordered]@{}
        $target['Fixture/1.0.0'] = @{ dependencies = @{ $assembly = '1.0.0' } }
        $target[$assembly + '/1.0.0'] = @{ runtime = @{ ($assembly + '.dll') = @{} } }
        @{ targets = @{ 'net9.0' = $target } } | ConvertTo-Json -Depth 10 | Set-Content (Join-Path $packageRoot 'fixture.deps.json') -Encoding utf8
        $files = @(@{ Path = 'fixture.deps.json'; Sha256 = '' })
        if ($case.Supply) {
            # Package validation checks presence, not binary execution; this fixture is deliberately not an assembly.
            Set-Content (Join-Path $packageRoot ($assembly + '.dll')) 'dependency presence fixture' -Encoding utf8
            $files += @{ Path = $assembly + '.dll'; Sha256 = '' }
        }
        $index = @{ Packages = @(@{ PackageId = 'Fixture'; PackageType = 'WebModule'; Title = 'Fixture'; Version = '1.0.0'; SourcePath = 'fixture'; Files = $files; ProjectArtifacts = @() }) }
        $result = Test-ExtensionPackageInternal -PackageName 'Fixture' -PackageType 'WebModule' -RepoRoot $fixtureRoot -SkillIndex $null -PackageIndex $index
        if ($result.Passed -ne $case.Expected) { throw ($case.Name + ': ' + ($result.Errors -join '; ')) }
        if (-not $case.Expected -and -not ($result.Errors -join '; ').Contains($assembly + '.dll')) { throw 'Missing adapter must produce an exact missing-runtime-asset diagnostic.' }
        Write-Output ('PASS: ' + $case.Name)
    }
} finally {
    Remove-Item $fixtureRoot -Recurse -Force
}
