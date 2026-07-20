param(
    [Parameter(Mandatory = $false)]
    [string]$PackageName,
    [Parameter(Mandatory = $false)]
    [string]$RepoRoot = (Split-Path $PSScriptRoot -Parent),
    [switch]$JsonOutput
)

$ErrorActionPreference = "Stop"

function Get-FileHashForPackage([string]$packageRoot, [string]$relativePath) {
    $filePath = Join-Path $packageRoot ($relativePath -replace '/', [System.IO.Path]::DirectorySeparatorChar)
    if (-not (Test-Path $filePath -PathType Leaf)) { return $null }
    $extension = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
    $normalizedTextExtensions = @('', '.pts', '.ks', '.md', '.json', '.js', '.mjs', '.ts', '.css', '.html', '.htm', '.txt', '.xml', '.config', '.props', '.targets', '.csproj', '.sln', '.prompt', '.sql', '.ps1', '.psm1', '.sh', '.bat', '.cmd', '.yml', '.yaml', '.svg', '.nuspec', '.wxs', '.wxi')
    if ($extension -in $normalizedTextExtensions) {
        $text = [System.IO.File]::ReadAllText($filePath).Replace("`r`n", "`n").Replace("`r", "`n")
        if ($text.Length -gt 0 -and $text[0] -eq [char]0xFEFF) { $text = $text.Substring(1) }
        $bytes = [System.Text.UTF8Encoding]::new($false).GetBytes($text)
        $sha = [System.Security.Cryptography.SHA256]::Create()
        try { return ([BitConverter]::ToString($sha.ComputeHash($bytes)).Replace("-", "").ToLowerInvariant()) }
        finally { $sha.Dispose() }
    }
    return (Get-FileHash $filePath -Algorithm SHA256).Hash.ToLowerInvariant()
}

function Read-JsonFile([string]$path) {
    if (-not (Test-Path $path)) { return $null }
    return Get-Content $path -Raw | ConvertFrom-Json
}function Test-ExtensionPackageInternal {
    param(
        [string]$PackageName,
        [string]$PackageType = "",
        [string]$RepoRoot,
        $SkillIndex,
        $PackageIndex
    )

    $errors = [System.Collections.Generic.List[string]]::new()
    $warnings = [System.Collections.Generic.List[string]]::new()

    $skillEntry = $null
    $packageEntry = $null
    $indexName = ""
    $entryType = ""

    if ($PackageType -in @('', 'Skill') -and $null -ne $SkillIndex) {
        $skillEntry = $SkillIndex.Skills | Where-Object { $_.SkillName -eq $PackageName } | Select-Object -First 1
        if ($null -ne $skillEntry) { $indexName = "skills.index.json"; $entryType = "Skill" }
    }

    if ($null -eq $skillEntry -and $null -ne $PackageIndex) {
        $packageEntry = $PackageIndex.Packages | Where-Object { $_.PackageId -eq $PackageName -and ([string]::IsNullOrWhiteSpace($PackageType) -or $_.PackageType -eq $PackageType) } | Select-Object -First 1
        if ($null -ne $packageEntry) { $indexName = "packages.index.json"; $entryType = $packageEntry.PackageType }
    }

    if ($null -eq $skillEntry -and $null -eq $packageEntry) {
        $errors.Add("Package '$PackageName' was not found in skills.index.json or packages.index.json.")
        return [PSCustomObject]@{ PackageId = $PackageName; PackageType = "Unknown"; Passed = $false; Errors = $errors; Warnings = $warnings }
    }

    if ($null -ne $skillEntry) {
        $entry = $skillEntry
        $packageId = $skillEntry.SkillName; $packageType = "Skill"; $sourcePath = $skillEntry.Path
        $version = $skillEntry.Version; $title = $skillEntry.Title; $files = $skillEntry.Files
        $entryPoint = $skillEntry.EntryPoint; $projectArtifacts = @()
    } else {
        $entry = $packageEntry
        $packageId = $packageEntry.PackageId; $packageType = $packageEntry.PackageType; $sourcePath = $packageEntry.SourcePath
        $version = $packageEntry.Version; $title = $packageEntry.Title; $files = $packageEntry.Files
        $entryPoint = $null; $projectArtifacts = @($packageEntry.ProjectArtifacts)
    }    # --- Validate required metadata fields ---
    if ([string]::IsNullOrWhiteSpace($packageId)) { $errors.Add("PackageId/SkillName is missing or empty in $indexName.") }
    if ([string]::IsNullOrWhiteSpace($title)) { $errors.Add("Title is missing or empty for '$packageId' in $indexName.") }
    if ([string]::IsNullOrWhiteSpace($version)) { $errors.Add("Version is missing or empty for '$packageId' in $indexName.") }
    if ([string]::IsNullOrWhiteSpace($packageType)) { $errors.Add("PackageType is missing or empty for '$packageId' in $indexName.") }
    if ([string]::IsNullOrWhiteSpace($sourcePath)) { $errors.Add("SourcePath/Path is missing or empty for '$packageId' in $indexName.") }

    # --- Validate package directory exists ---
    $packageRoot = Join-Path $RepoRoot ($sourcePath -replace '/', [System.IO.Path]::DirectorySeparatorChar)
    if (-not (Test-Path $packageRoot -PathType Container)) {
        $errors.Add("Package source directory does not exist: $sourcePath (resolved to $packageRoot).")
        return [PSCustomObject]@{ PackageId = $packageId; PackageType = $packageType; Passed = $false; Errors = $errors; Warnings = $warnings }
    }

    # --- Validate file paths and hashes ---
    if ($null -eq $files -or @($files).Count -eq 0) {
        $errors.Add("No files listed in index for '$packageId'. Every package must list at least one file.")
    } else {
        foreach ($file in @($files)) {
            $filePath = [string]$file.Path
            $indexedHash = [string]$file.Sha256
            if ([string]::IsNullOrWhiteSpace($filePath)) { $errors.Add("File path is empty for '$packageId'."); continue }
            if ($filePath.Contains('\')) { $errors.Add("File path contains backslash: '$filePath' in '$packageId'."); continue }
            if ($filePath.Contains('..')) { $errors.Add("File path contains '..': '$filePath' in '$packageId'."); continue }
            if ([System.IO.Path]::IsPathRooted($filePath)) { $errors.Add("File path is absolute: '$filePath' in '$packageId'."); continue }
            $fullFilePath = Join-Path $packageRoot ($filePath -replace '/', [System.IO.Path]::DirectorySeparatorChar)
            if (-not (Test-Path $fullFilePath -PathType Leaf)) {
                $errors.Add("Indexed file does not exist on disk: '$filePath' under '$sourcePath' for '$packageId'.")
                continue
            }
            if (-not [string]::IsNullOrWhiteSpace($indexedHash)) {
                $actualHash = Get-FileHashForPackage $packageRoot $filePath
                if ($null -eq $actualHash) { $errors.Add("Could not compute hash for: '$filePath' in '$packageId'.") }
                elseif ($actualHash -ne $indexedHash.ToLowerInvariant()) {
                    $errors.Add("Hash mismatch for '$filePath' in '$packageId'. Expected $indexedHash, actual $actualHash.")
                }
            } else {
                $warnings.Add("No SHA-256 hash for file: '$filePath' in '$packageId'.")
            }
        }
    }

    # --- Shared exclusion lists for both reference and dependency checks ---
    $frameworkPrefixes = @('System.', 'Microsoft.', 'Newtonsoft.', 'Serilog.', 'Npgsql.', 'Dapper.', 'Autofac.', 'MediatR.', 'Polly.', 'FluentValidation.', 'runtime.', 'runtimepack.')
    # Core/provided assemblies are supplied by the Buffaly host runtime and do not need to be in package files.
    $coreProvidedAssemblies = @('Buffaly.Agent.Host', 'Buffaly.Agent.Web.Common', 'BasicUtilities.Reference', 'Buffaly.Agent.Core', 'Buffaly.Agent.Common', 'Buffaly.Agent.Runtime.Abstractions', 'Buffaly.Agent.ProtoScript.Runtime', 'Buffaly.Agent.ProtoScriptAuthoring', 'Buffaly.DB.Core', 'Buffaly.DB.Hybrid', 'Buffaly.DB.SqlServer', 'Buffaly.DB.Postgres', 'Buffaly.Business', 'Buffaly.ProviderContracts', 'Buffaly.Sessions.DB', 'Buffaly.Sessions.DB.PostGres', 'Buffaly.Agent.SemanticDatabase', 'Buffaly.Agent.SemanticDatabase.DB', 'Buffaly.Agent.CSharpSkill', 'Buffaly.Agent.Tools.Mcp', 'Buffaly.Agent.Tools.Platform', 'Buffaly.Agent.Tools.Process', 'Buffaly.Agent.Tools.Secrets', 'Buffaly.Agent.Tools.SemanticDatabase', 'Buffaly.Agent.Tools.CodeSearch', 'Buffaly.Agent.Tools.Http', 'Buffaly.Agent.Tools.Sessions', 'Buffaly.Data', 'RooTrax.Common', 'RooTrax.Common.DB', 'RooTrax.Creator.DB', 'RooTrax.SqlGenerator', 'RooTrax.VDB', 'RooTrax.VDB.DB', 'RooTrax.VDB.UI', 'FeedingFrenzy.WebPropertyEditorAgent.Tools')

    # --- Validate .pts references: reject path-based DLL references ---
    # Correct ProtoScript references use assembly-name form: reference AssemblyName Alias;
    # Path-based references like reference "lib/Foo.dll" Foo; are invalid even if the DLL exists.
    $indexedFileSet = @{}
    foreach ($f in @($files)) { $indexedFileSet[([string]$f.Path)] = $true }
    $ptsFilesOnDisk = Get-ChildItem $packageRoot -Filter "*.pts" -Recurse -File
    foreach ($ptsFile in @($ptsFilesOnDisk)) {
        $ptsContent = [System.IO.File]::ReadAllText($ptsFile.FullName)
        # Match any reference statement that uses a quoted string containing a path or .dll
        $refMatches = [regex]::Matches($ptsContent, 'reference\s+"([^"]+)"\s*([^;\r\n]*)')
        foreach ($refMatch in $refMatches) {
            $refQuoted = $refMatch.Groups[1].Value
            $refAlias = $refMatch.Groups[2].Value.Trim().TrimEnd(';').Trim()
            # If the quoted value contains a path separator or ends in .dll, it is a path-based reference
            if ($refQuoted.Contains('/') -or $refQuoted.Contains('\') -or $refQuoted.EndsWith('.dll', [StringComparison]::OrdinalIgnoreCase)) {
                # Skip if the assembly is core/provided or a framework library
                $isCoreOrFramework = $false
                $assemblyName = $refAlias
                if (-not [string]::IsNullOrWhiteSpace($assemblyName)) {
                    foreach ($coreName in $coreProvidedAssemblies) {
                        if ($assemblyName -eq $coreName) { $isCoreOrFramework = $true; break }
                    }
                    if (-not $isCoreOrFramework) {
                        foreach ($prefix in $frameworkPrefixes) {
                            if ($assemblyName.StartsWith($prefix, [StringComparison]::OrdinalIgnoreCase)) { $isCoreOrFramework = $true; break }
                        }
                    }
                }
                if ($isCoreOrFramework) {
                    $warnings.Add("Path-based reference 'reference `"$refQuoted`"' in '$($ptsFile.Name)' for '$packageId' references a core/provided assembly. Consider using assembly-name form: 'reference $refAlias'.")
                } else {
                    $errors.Add("Path-based DLL reference 'reference `"$refQuoted`"' in '$($ptsFile.Name)' is invalid for '$packageId'. Use assembly-name form: 'reference $refAlias' (no path, no .dll extension).")
                }
            }
        }
    }

    # --- Validate DLL dependency completeness via .deps.json ---
    # Missing Buffaly/application DLLs are errors; missing System/Microsoft framework DLLs are warnings.
    $depsJsonFiles = Get-ChildItem $packageRoot -Filter "*.deps.json" -Recurse -File
    foreach ($depsFile in @($depsJsonFiles)) {
        $relativeDepsPath = $depsFile.FullName.Substring($packageRoot.Length).TrimStart([System.IO.Path]::DirectorySeparatorChar) -replace '\\', '/'
        try {
            $depsJson = Get-Content $depsFile.FullName -Raw | ConvertFrom-Json
            if ($null -ne $depsJson.targets) {
                foreach ($target in $depsJson.targets.PSObject.Properties) {
                    foreach ($libEntry in $target.Value.PSObject.Properties) {
                        $deps = $libEntry.Value.dependencies
                        if ($null -ne $deps) {
                            foreach ($depProp in $deps.PSObject.Properties) {
                                $depName = $depProp.Name
                                $isFramework = $false
                                foreach ($prefix in $frameworkPrefixes) {
                                    if ($depName.StartsWith($prefix, [StringComparison]::OrdinalIgnoreCase)) { $isFramework = $true; break }
                                }
                                $isCoreProvided = $false
                                foreach ($coreName in $coreProvidedAssemblies) {
                                    if ($depName -eq $coreName) { $isCoreProvided = $true; break }
                                }
                                # Skip core/provided assemblies entirely - they are supplied by the host runtime
                                if ($isCoreProvided) { continue }
                                # Check if this dependency appears anywhere in the Files array
                                $foundInFiles = $false
                                foreach ($indexedPath in $indexedFileSet.Keys) {
                                    if ($indexedPath -match "$depName\.dll$") { $foundInFiles = $true; break }
                                }
                                if (-not $foundInFiles) {
                                    if ($isFramework) {
                                        $warnings.Add("Framework dependency '$depName' (from $($libEntry.Name) via $relativeDepsPath) is not in the Files array for '$packageId'.")
                                    } else {
                                        $errors.Add("Missing DLL dependency '$depName' (from $($libEntry.Name) via $relativeDepsPath) is not in the Files array for '$packageId'. Expected a file matching '$depName.dll'.")
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } catch {
            $warnings.Add("Could not parse .deps.json: '$relativeDepsPath' for '$packageId'. $($_.Exception.Message)")
        }
    }

    # --- Validate EntryPoint for skills ---
    if ($entryType -eq "Skill" -and -not [string]::IsNullOrWhiteSpace($entryPoint)) {
        $entryPointFull = Join-Path $packageRoot ($entryPoint -replace '/', [System.IO.Path]::DirectorySeparatorChar)
        if (-not (Test-Path $entryPointFull -PathType Leaf)) {
            $errors.Add("EntryPoint file does not exist: '$entryPoint' under '$sourcePath' for '$packageId'.")
        }
        $entryPointInFiles = @($files) | Where-Object { $_.Path -eq $entryPoint }
        if (@($entryPointInFiles).Count -eq 0) {
            $errors.Add("EntryPoint '$entryPoint' is not listed in the Files array for '$packageId'.")
        }
    }

    # --- Validate ProjectArtifacts for web modules ---
    if ($entryType -eq "WebModule" -and $null -ne $projectArtifacts -and @($projectArtifacts).Count -gt 0) {
        foreach ($artifact in @($projectArtifacts)) {
            if ($null -eq $artifact) { continue }
            $projectName = [string]$artifact.ProjectName
            $artifactSourcePath = [string]$artifact.SourcePath
            if ([string]::IsNullOrWhiteSpace($projectName)) { $errors.Add("ProjectArtifact has empty ProjectName for '$packageId'.") }
            if ([string]::IsNullOrWhiteSpace($artifactSourcePath)) {
                $errors.Add("ProjectArtifact has empty SourcePath for '$packageId'.")
            } else {
                if (-not $artifactSourcePath.EndsWith('/')) { $errors.Add("ProjectArtifact SourcePath must end with '/': '$artifactSourcePath' in '$packageId'.") }
                $artifactFullPath = Join-Path $packageRoot ($artifactSourcePath.TrimEnd('/') -replace '/', [System.IO.Path]::DirectorySeparatorChar)
                if (-not (Test-Path $artifactFullPath -PathType Container)) { $errors.Add("ProjectArtifact source directory does not exist: '$artifactSourcePath' under '$sourcePath' for '$packageId'.") }
            }
        }
    }

    # --- Check for unindexed files on disk (warning only) ---
    $indexedPaths = @($files) | ForEach-Object { ([string]$_.Path) -replace '/', [System.IO.Path]::DirectorySeparatorChar }
    $allDiskFiles = Get-ChildItem $packageRoot -File -Recurse | ForEach-Object {
        $_.FullName.Substring($packageRoot.Length).TrimStart([System.IO.Path]::DirectorySeparatorChar)
    }
    foreach ($diskFile in $allDiskFiles) {
        $normalizedDisk = $diskFile -replace '\\', '/'
        $normalizedIndexed = @($indexedPaths | ForEach-Object { $_ -replace '\\', '/' })
        if ($normalizedDisk -notin $normalizedIndexed) {
            if ($diskFile -match '\.git' -or $diskFile -match 'Thumbs\.db' -or $diskFile -match '\.DS_Store') { continue }
            $warnings.Add("File on disk but not in index: '$normalizedDisk' under '$sourcePath' for '$packageId'.")
        }
    }

    return [PSCustomObject]@{
        PackageId   = $packageId
        PackageType = $packageType
        Passed      = $errors.Count -eq 0
        Errors      = $errors
        Warnings    = $warnings
    }
}# --- Main execution when run directly (not dot-sourced) ---
if ($MyInvocation.InvocationName -ne '.') {
    if ([string]::IsNullOrWhiteSpace($PackageName)) {
        Write-Host "Usage: Test-ExtensionPackage.ps1 -PackageName <name> [-RepoRoot <path>] [-JsonOutput]"
        Write-Host ""
        Write-Host "Validates a single package from skills.index.json or packages.index.json."
        Write-Host "Checks metadata, file existence, SHA-256 hashes, entry points, and project artifacts."
        exit 1
    }

    $skillIndex = Read-JsonFile (Join-Path $RepoRoot "skills.index.json")
    $packageIndex = Read-JsonFile (Join-Path $RepoRoot "packages.index.json")

    $result = Test-ExtensionPackageInternal -PackageName $PackageName -RepoRoot $RepoRoot -SkillIndex $skillIndex -PackageIndex $packageIndex

    if ($JsonOutput) {
        [PSCustomObject]@{
            PackageId   = $result.PackageId
            PackageType = $result.PackageType
            Passed      = $result.Passed
            Errors      = @($result.Errors)
            Warnings    = @($result.Warnings)
        } | ConvertTo-Json -Depth 5
    } else {
        if ($result.Passed) {
            Write-Host "PASS: $($result.PackageId) ($($result.PackageType))" -ForegroundColor Green
            if ($result.Warnings.Count -gt 0) {
                Write-Host "  Warnings:" -ForegroundColor Yellow
                foreach ($w in $result.Warnings) { Write-Host "    - $w" -ForegroundColor Yellow }
            }
        } else {
            Write-Host "FAIL: $($result.PackageId) ($($result.PackageType))" -ForegroundColor Red
            foreach ($e in $result.Errors) { Write-Host "    - $e" -ForegroundColor Red }
            if ($result.Warnings.Count -gt 0) {
                Write-Host "  Warnings:" -ForegroundColor Yellow
                foreach ($w in $result.Warnings) { Write-Host "    - $w" -ForegroundColor Yellow }
            }
        }
    }

    if (-not $result.Passed) { exit 1 }
    exit 0
}
