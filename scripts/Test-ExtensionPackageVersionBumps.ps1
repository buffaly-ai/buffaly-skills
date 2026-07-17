param(
    [string]$BaseRef = "origin/main",
    [switch]$ValidateAllHashes
)

$ErrorActionPreference = "Stop"

function Fail([string]$message) {
    Write-Error $message
    exit 1
}

function Normalize-PathForGit([string]$path) {
    return ($path -replace '\\','/').Trim('/')
}

function Read-JsonFile([string]$path) {
    if (-not (Test-Path $path)) { return $null }
    return Get-Content $path -Raw | ConvertFrom-Json
}

function Read-JsonFromGit([string]$ref, [string]$path) {
    $text = git show ("{0}:{1}" -f $ref, (Normalize-PathForGit $path)) 2>$null
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace(($text -join "`n"))) { return $null }
    return ($text -join "`n") | ConvertFrom-Json
}

function Compare-VersionString([string]$left, [string]$right) {
    try {
        $lv = [version]$left
        $rv = [version]$right
        return $lv.CompareTo($rv)
    }
    catch {
        return [string]::Compare($left, $right, [System.StringComparison]::OrdinalIgnoreCase)
    }
}

function Get-FileHashForPackage([string]$packageRoot, [string]$relativePath) {
    $filePath = Join-Path $packageRoot ($relativePath -replace '/', [System.IO.Path]::DirectorySeparatorChar)
    if (-not (Test-Path $filePath)) { return $null }
    $extension = [System.IO.Path]::GetExtension($filePath)
    if ($extension -ieq ".pts" -or $extension -ieq ".md") {
        $text = [System.IO.File]::ReadAllText($filePath).Replace("`r`n", "`n").Replace("`r", "`n")
        $bytes = [System.Text.UTF8Encoding]::new($false).GetBytes($text)
        $sha = [System.Security.Cryptography.SHA256]::Create()
        try { return ([BitConverter]::ToString($sha.ComputeHash($bytes)).Replace("-", "").ToLowerInvariant()) }
        finally { $sha.Dispose() }
    }
    return (Get-FileHash $filePath -Algorithm SHA256).Hash.ToLowerInvariant()
}

function Convert-FilesToMap($files) {
    $map = @{}
    foreach ($file in @($files)) {
        if ($null -ne $file.Path) { $map[$file.Path] = [string]$file.Sha256 }
    }
    return $map
}

function Test-FilesChanged($currentFiles, $baseFiles) {
    $current = Convert-FilesToMap $currentFiles
    $base = Convert-FilesToMap $baseFiles
    if ($current.Count -ne $base.Count) { return $true }
    foreach ($key in $current.Keys) {
        if (-not $base.ContainsKey($key)) { return $true }
        if ($current[$key] -ne $base[$key]) { return $true }
    }
    return $false
}

function Test-PathChanged([string[]]$changedPaths, [string]$packagePath) {
    $prefix = (Normalize-PathForGit $packagePath) + "/"
    foreach ($changedPath in $changedPaths) {
        $normalized = Normalize-PathForGit $changedPath
        if ($normalized -eq (Normalize-PathForGit $packagePath) -or $normalized.StartsWith($prefix, [System.StringComparison]::OrdinalIgnoreCase)) { return $true }
    }
    return $false
}

function Get-ChangedPaths([string]$baseRef) {
    git rev-parse --verify $baseRef *> $null
    if ($LASTEXITCODE -ne 0) { Fail "Base ref '$baseRef' was not found. Fetch the target branch or pass a valid -BaseRef." }
    $paths = git diff --name-only $baseRef --
    if ($LASTEXITCODE -ne 0) { Fail "git diff failed for base ref '$baseRef'." }
    return @($paths | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
}

function Validate-Packages(
    [string]$indexPath,
    [string]$arrayName,
    [string]$idName,
    [string]$pathName,
    [string]$baseRef,
    [string[]]$changedPaths,
    [System.Collections.Generic.List[string]]$errors
) {
    $currentIndex = Read-JsonFile $indexPath
    if ($null -eq $currentIndex) { return }
    $baseIndex = Read-JsonFromGit $baseRef $indexPath

    $currentItems = @($currentIndex.$arrayName)
    $baseItems = if ($null -ne $baseIndex) { @($baseIndex.$arrayName) } else { @() }

    foreach ($item in $currentItems) {
        $id = [string]$item.$idName
        $packagePath = [string]$item.$pathName
        if ([string]::IsNullOrWhiteSpace($id) -or [string]::IsNullOrWhiteSpace($packagePath)) { continue }

        $baseItem = $baseItems | Where-Object { [string]$_.$idName -eq $id } | Select-Object -First 1
        $packagePathChanged = Test-PathChanged $changedPaths $packagePath
        $indexChanged = $changedPaths | Where-Object { (Normalize-PathForGit $_) -eq (Normalize-PathForGit $indexPath) }
        $filesChanged = $false
        if ($null -ne $baseItem) { $filesChanged = Test-FilesChanged $item.Files $baseItem.Files }

        if ($null -ne $baseItem -and ($packagePathChanged -or ($indexChanged -and $filesChanged))) {
            $currentVersion = [string]$item.Version
            $baseVersion = [string]$baseItem.Version
            if ([string]::IsNullOrWhiteSpace($currentVersion)) { $errors.Add("$id has changed package files but no current Version in $indexPath.") }
            elseif ([string]::IsNullOrWhiteSpace($baseVersion)) { $errors.Add("$id has changed package files but no base Version in $indexPath.") }
            elseif ((Compare-VersionString $currentVersion $baseVersion) -le 0) {
                $errors.Add("$id changed under '$packagePath' but Version did not increase ($baseVersion -> $currentVersion).")
            }
        }

        $shouldValidateHashes = $ValidateAllHashes -or $packagePathChanged -or ($indexChanged -and $filesChanged)
        if ($shouldValidateHashes) {
            $packageRoot = Join-Path (Get-Location) ($packagePath -replace '/', [System.IO.Path]::DirectorySeparatorChar)
            foreach ($file in @($item.Files)) {
                $actual = Get-FileHashForPackage $packageRoot ([string]$file.Path)
                if ($null -eq $actual) { $errors.Add("$id index references missing file '$($file.Path)' under '$packagePath'.") }
                elseif ($actual -ne [string]$file.Sha256) { $errors.Add("$id hash mismatch for '$($file.Path)' in $indexPath. Expected $($file.Sha256), actual $actual.") }
            }
        }
    }
}

$repoRoot = git rev-parse --show-toplevel
if ($LASTEXITCODE -ne 0) { Fail "Run this script inside a git repository." }
Set-Location $repoRoot

$changedPaths = Get-ChangedPaths $BaseRef
$errors = [System.Collections.Generic.List[string]]::new()

Validate-Packages -indexPath "skills.index.json" -arrayName "Skills" -idName "SkillName" -pathName "Path" -baseRef $BaseRef -changedPaths $changedPaths -errors $errors
Validate-Packages -indexPath "packages.index.json" -arrayName "Packages" -idName "PackageId" -pathName "SourcePath" -baseRef $BaseRef -changedPaths $changedPaths -errors $errors

if ($errors.Count -gt 0) {
    Write-Host "Extension package validation failed:" -ForegroundColor Red
    foreach ($errorMessage in $errors) { Write-Host " - $errorMessage" -ForegroundColor Red }
    exit 1
}

Write-Host "Extension package validation passed. Changed paths: $($changedPaths.Count)." -ForegroundColor Green
