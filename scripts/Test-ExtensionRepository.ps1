param(
    [Parameter(Mandatory = $false)]
    [string]$RepoRoot = (Split-Path $PSScriptRoot -Parent),

    [switch]$JsonOutput
)

$ErrorActionPreference = "Stop"

# Dot-source the single-package validation script to get Test-ExtensionPackageInternal
. (Join-Path $PSScriptRoot "Test-ExtensionPackage.ps1")
. (Join-Path $PSScriptRoot "New-ExtensionProfileLock.ps1")

function Read-JsonFile([string]$path) {
    if (-not (Test-Path $path)) { return $null }
    return Get-Content $path -Raw | ConvertFrom-Json
}

function Test-ExtensionRepository {
    param([string]$RepoRoot)

    $allErrors = [System.Collections.Generic.List[string]]::new()
    $allWarnings = [System.Collections.Generic.List[string]]::new()
    $results = [System.Collections.Generic.List[object]]::new()

    $skillIndex = Read-JsonFile (Join-Path $RepoRoot "skills.index.json")
    $packageIndex = Read-JsonFile (Join-Path $RepoRoot "packages.index.json")

    # --- Validate index files exist and parse ---
    if ($null -eq $skillIndex) {
        $allErrors.Add("skills.index.json not found or invalid JSON in repo root: $RepoRoot")
    }
    if ($null -eq $packageIndex) {
        $allErrors.Add("packages.index.json not found or invalid JSON in repo root: $RepoRoot")
    }
    if ($null -eq $skillIndex -and $null -eq $packageIndex) {
        return [PSCustomObject]@{
            TotalPackages = 0; Passed = 0; Failed = 0
            Errors = $allErrors; Warnings = $allWarnings; Results = @()
        }
    }

    # --- Validate schema versions ---
    if ($null -ne $skillIndex -and $skillIndex.SchemaVersion -ne 1) {
        $allErrors.Add("skills.index.json SchemaVersion is $($skillIndex.SchemaVersion), expected 1.")
    }
    if ($null -ne $packageIndex -and $packageIndex.SchemaVersion -ne 1) {
        $allErrors.Add("packages.index.json SchemaVersion is $($packageIndex.SchemaVersion), expected 1.")
    }    # --- Collect all package IDs for duplicate detection ---
    $allIds = [System.Collections.Generic.List[string]]::new()
    if ($null -ne $skillIndex) {
        foreach ($s in @($skillIndex.Skills)) { $allIds.Add([string]$s.SkillName) }
    }
    if ($null -ne $packageIndex) {
        foreach ($p in @($packageIndex.Packages)) { $allIds.Add([string]$p.PackageId) }
    }
    $duplicates = $allIds | Group-Object | Where-Object { $_.Count -gt 1 }
    foreach ($dup in @($duplicates)) {
        $allErrors.Add("Duplicate package ID '$($dup.Name)' appears $($dup.Count) times across indexes.")
    }

    # --- Validate each skill package ---
    if ($null -ne $skillIndex) {
        foreach ($skill in @($skillIndex.Skills)) {
            $name = [string]$skill.SkillName
            $result = Test-ExtensionPackageInternal -PackageName $name -RepoRoot $RepoRoot -SkillIndex $skillIndex -PackageIndex $packageIndex
            $results.Add($result)
            if (-not $result.Passed) {
                foreach ($e in $result.Errors) { $allErrors.Add("[$name] $e") }
            }
            foreach ($w in $result.Warnings) { $allWarnings.Add("[$name] $w") }
        }
    }

    # --- Validate each web module / other package ---
    if ($null -ne $packageIndex) {
        foreach ($pkg in @($packageIndex.Packages)) {
            $id = [string]$pkg.PackageId
            # Skip if already validated as a skill (same ID in skills index)
            if ($null -ne $skillIndex -and @($skillIndex.Skills | Where-Object { $_.SkillName -eq $id }).Count -gt 0) { continue }
            $result = Test-ExtensionPackageInternal -PackageName $id -RepoRoot $RepoRoot -SkillIndex $skillIndex -PackageIndex $packageIndex
            $results.Add($result)
            if (-not $result.Passed) {
                foreach ($e in $result.Errors) { $allErrors.Add("[$id] $e") }
            }
            foreach ($w in $result.Warnings) { $allWarnings.Add("[$id] $w") }
        }
    }

    # --- Check for unindexed skill directories and skills/web-module overlap ---
    $skillsDir = Join-Path $RepoRoot "skills"
    $webModulePackageIds = @()
    if ($null -ne $packageIndex) {
        $webModulePackageIds = @($packageIndex.Packages | Where-Object { $_.PackageType -eq "WebModule" } | ForEach-Object { [string]$_.PackageId })
    }
    if (Test-Path $skillsDir -PathType Container) {
        $indexedSkillPaths = @()
        if ($null -ne $skillIndex) {
            $indexedSkillPaths = @($skillIndex.Skills | ForEach-Object { [string]$_.Path })
        }
        Get-ChildItem $skillsDir -Directory | ForEach-Object {
            $relativePath = "skills/" + $_.Name
            if ($relativePath -notin $indexedSkillPaths) {
                if ($_.Name -in $webModulePackageIds) {
                    $allErrors.Add("Orphaned skills/ directory '$relativePath' overlaps with WebModule package '$($_.Name)'. Remove the skills/ directory — the package is owned by packages.index.json.")
                } else {
                    $allWarnings.Add("Directory '$relativePath' exists but has no entry in skills.index.json.")
                }
            }
        }
    }

    # --- Check for unindexed web module directories (warning only) ---
    $webModulesDir = Join-Path $RepoRoot "web-modules"
    if (Test-Path $webModulesDir -PathType Container) {
        $indexedModulePaths = @()
        if ($null -ne $packageIndex) {
            $indexedModulePaths = @($packageIndex.Packages | Where-Object { $_.PackageType -eq "WebModule" } | ForEach-Object { [string]$_.SourcePath })
        }
        Get-ChildItem $webModulesDir -Directory | ForEach-Object {
            $relativePath = "web-modules/" + $_.Name
            if ($relativePath -notin $indexedModulePaths) {
                $allWarnings.Add("Directory '$relativePath' exists but has no WebModule entry in packages.index.json.")
            }
        }
    }

    # --- Validate the authoritative installer profile for every supported target ---
    $profilePath = Join-Path $RepoRoot "profiles\core-installer.profile.json"
    foreach ($targetPlatform in @("windows", "linux", "mac")) {
        $profileResult = New-ExtensionProfileLock -RepoRoot $RepoRoot -ProfilePath $profilePath -TargetPlatform $targetPlatform -RepositoryCommit "" -ValidateOnly $true
        if (-not $profileResult.Passed) {
            foreach ($profileError in @($profileResult.Errors)) {
                $allErrors.Add("[core-installer/$targetPlatform] $profileError")
            }
        }
    }
    $passed = ($results | Where-Object { $_.Passed }).Count
    $failed = ($results | Where-Object { -not $_.Passed }).Count

    return [PSCustomObject]@{
        TotalPackages = $results.Count
        Passed        = $passed
        Failed        = $failed
        Errors        = $allErrors
        Warnings      = $allWarnings
        Results       = $results
    }
}# --- Main execution when run directly (not dot-sourced) ---
if ($MyInvocation.InvocationName -ne '.') {
    $result = Test-ExtensionRepository -RepoRoot $RepoRoot

    if ($JsonOutput) {
        $output = [PSCustomObject]@{
            TotalPackages = $result.TotalPackages
            Passed        = $result.Passed
            Failed        = $result.Failed
            Errors        = @($result.Errors)
            Warnings      = @($result.Warnings)
            Results       = @($result.Results | ForEach-Object {
                [PSCustomObject]@{
                    PackageId   = $_.PackageId
                    PackageType = $_.PackageType
                    Passed      = $_.Passed
                    Errors      = @($_.Errors)
                    Warnings    = @($_.Warnings)
                }
            })
        }
        $output | ConvertTo-Json -Depth 5
    } else {
        Write-Host ""
        Write-Host "Buffaly Extension Repository Validation" -ForegroundColor Cyan
        Write-Host "=========================================" -ForegroundColor Cyan
        Write-Host "Repository: $RepoRoot"
        Write-Host "Total packages: $($result.TotalPackages)"
        Write-Host "Passed: $($result.Passed)" -ForegroundColor Green
        Write-Host "Failed: $($result.Failed)" -ForegroundColor $(if ($result.Failed -gt 0) { 'Red' } else { 'Green' })
        Write-Host ""

        if ($result.Errors.Count -gt 0) {
            Write-Host "ERRORS ($($result.Errors.Count)):" -ForegroundColor Red
            foreach ($e in $result.Errors) { Write-Host "  - $e" -ForegroundColor Red }
            Write-Host ""
        }

        if ($result.Warnings.Count -gt 0) {
            Write-Host "WARNINGS ($($result.Warnings.Count)):" -ForegroundColor Yellow
            foreach ($w in $result.Warnings) { Write-Host "  - $w" -ForegroundColor Yellow }
            Write-Host ""
        }

        # Per-package summary
        Write-Host "Per-package results:" -ForegroundColor Cyan
        foreach ($r in $result.Results) {
            $status = if ($r.Passed) { "PASS" } else { "FAIL" }
            $color = if ($r.Passed) { 'Green' } else { 'Red' }
            $warningCount = @($r.Warnings).Count
            $warningStr = if ($warningCount -gt 0) { " ($warningCount warnings)" } else { "" }
            Write-Host "  [$status] $($r.PackageId) ($($r.PackageType))$warningStr" -ForegroundColor $color
            if (-not $r.Passed) {
                foreach ($e in $r.Errors) { Write-Host "      - $e" -ForegroundColor Red }
            }
        }
    }

    if ($result.Failed -gt 0 -or $result.Errors.Count -gt 0) { exit 1 }
    exit 0
}
