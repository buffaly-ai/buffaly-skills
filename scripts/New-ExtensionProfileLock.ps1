param(
    [string]$RepoRoot = (Split-Path $PSScriptRoot -Parent),
    [string]$ProfilePath = (Join-Path (Split-Path $PSScriptRoot -Parent) "profiles\core-installer.profile.json"),
    [ValidateSet("windows", "linux", "mac")]
    [string]$TargetPlatform = "windows",
    [string]$RepositoryCommit = "",
    [string]$OutputPath = "",
    [switch]$ValidateOnly,
    [switch]$JsonOutput
)

$ErrorActionPreference = "Stop"

function Get-Sha256Text([string]$Text) {
    $bytes = [Text.UTF8Encoding]::new($false).GetBytes($Text)
    $sha = [Security.Cryptography.SHA256]::Create()
    try { return ([BitConverter]::ToString($sha.ComputeHash($bytes))).Replace("-", "").ToLowerInvariant() }
    finally { $sha.Dispose() }
}

function ConvertTo-CanonicalJson($Value) {
    return ($Value | ConvertTo-Json -Depth 100 -Compress)
}

function Get-PropertyNames($Value) {
    if ($null -eq $Value) { return @() }
    return @($Value.PSObject.Properties.Name)
}

function Assert-ExactProperties($Value, [string[]]$Allowed, [string]$Context, [Collections.Generic.List[string]]$Errors) {
    foreach ($name in @(Get-PropertyNames $Value)) {
        if ($name -notin $Allowed) { $Errors.Add("$Context contains unsupported property '$name'.") }
    }
    foreach ($name in $Allowed) {
        if ($name -notin (Get-PropertyNames $Value)) { $Errors.Add("$Context is missing required property '$name'.") }
    }
}

function Get-ContentHash($Entry) {
    $lines = @($Entry.Files | ForEach-Object {
        ([string]$_.Path) + ":" + ([string]$_.Sha256).ToLowerInvariant()
    })
    [Array]::Sort($lines, [StringComparer]::Ordinal)
    return Get-Sha256Text (($lines -join "`n") + "`n")
}

function Assert-ExactMembership($Profile, [string]$PackageType, [string[]]$ExpectedIds, [Collections.Generic.List[string]]$Errors) {
    $actualIds = @($Profile.Packages | Where-Object { [string]$_.PackageType -eq $PackageType } | ForEach-Object { [string]$_.PackageId })
    if ($actualIds.Count -ne $ExpectedIds.Count) { $Errors.Add("$([string]$Profile.ProfileId) must contain exactly $($ExpectedIds.Count) $PackageType entries; found $($actualIds.Count).") }
    foreach ($id in $ExpectedIds) { if ($id -cnotin $actualIds) { $Errors.Add("$([string]$Profile.ProfileId) is missing required $PackageType '$id'.") } }
    foreach ($id in $actualIds) { if ($id -cnotin $ExpectedIds) { $Errors.Add("$([string]$Profile.ProfileId) contains unexpected $PackageType '$id'.") } }
}

function Assert-ExcludedMembership($Profile, [string]$PackageType, [string[]]$ExcludedIds, [Collections.Generic.List[string]]$Errors) {
    $actualIds = @($Profile.Packages | Where-Object { [string]$_.PackageType -eq $PackageType } | ForEach-Object { [string]$_.PackageId })
    foreach ($id in $ExcludedIds) { if ($id -cin $actualIds) { $Errors.Add("$([string]$Profile.ProfileId) must exclude $PackageType '$id'.") } }
}

function Assert-ExactPlatforms($Item, [string[]]$ExpectedPlatforms, [Collections.Generic.List[string]]$Errors) {
    $actual = @($Item.Platforms | ForEach-Object { [string]$_ })
    if ($actual.Count -ne $ExpectedPlatforms.Count -or @($actual | Where-Object { $_ -cnotin $ExpectedPlatforms }).Count -gt 0) {
        $Errors.Add("$([string]$Item.PackageId) must target exactly: $($ExpectedPlatforms -join ', ').")
    }
}

function Sort-PackagesOrdinal([object[]]$Packages) {
    $list = [Collections.Generic.List[object]]::new()
    foreach ($package in $Packages) { $list.Add($package) }
    $list.Sort([Collections.Generic.Comparer[object]]::Create([Comparison[object]]{
        param($left, $right)
        $typeComparison = [StringComparer]::Ordinal.Compare([string]$left.PackageType, [string]$right.PackageType)
        if ($typeComparison -ne 0) { return $typeComparison }
        return [StringComparer]::Ordinal.Compare([string]$left.PackageId, [string]$right.PackageId)
    }))
    return @($list)
}

function New-ExtensionProfileLock {
    param(
        [string]$RepoRoot,
        [string]$ProfilePath,
        [string]$TargetPlatform,
        [string]$RepositoryCommit,
        [bool]$ValidateOnly
    )

    $errors = [Collections.Generic.List[string]]::new()
    foreach ($path in @($ProfilePath, (Join-Path $RepoRoot "skills.index.json"), (Join-Path $RepoRoot "packages.index.json"))) {
        if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { $errors.Add("Required JSON file was not found: $path") }
    }
    if ($errors.Count -gt 0) { return [pscustomobject]@{ Passed=$false; Errors=$errors; Lock=$null } }

    try { $profile = Get-Content -LiteralPath $ProfilePath -Raw | ConvertFrom-Json }
    catch { $errors.Add("Profile is not valid JSON: $($_.Exception.Message)"); return [pscustomobject]@{ Passed=$false; Errors=$errors; Lock=$null } }
    try {
        $skillIndex = Get-Content -LiteralPath (Join-Path $RepoRoot "skills.index.json") -Raw | ConvertFrom-Json
        $packageIndex = Get-Content -LiteralPath (Join-Path $RepoRoot "packages.index.json") -Raw | ConvertFrom-Json
    } catch {
        $errors.Add("Repository index is not valid JSON: $($_.Exception.Message)")
        return [pscustomobject]@{ Passed=$false; Errors=$errors; Lock=$null }
    }

    Assert-ExactProperties $profile @("SchemaVersion","ProfileId","ProfileVersion","Description","Packages") "Profile" $errors
    if ($profile.SchemaVersion -ne 1) { $errors.Add("Profile SchemaVersion must be 1.") }
    if ([string]$profile.ProfileId -notmatch '^[a-z0-9]+(?:-[a-z0-9]+)*$') { $errors.Add("ProfileId must contain lowercase alphanumeric segments separated by single hyphens.") }
    if ([string]$profile.ProfileVersion -notmatch '^\d+\.\d+\.\d+$') { $errors.Add("ProfileVersion must be semantic major.minor.patch.") }
    if ([string]::IsNullOrWhiteSpace([string]$profile.Description)) { $errors.Add("Profile Description is required.") }

    foreach ($indexInfo in @(
        [pscustomobject]@{ Name="skills.index.json"; Entries=@($skillIndex.Skills) },
        [pscustomobject]@{ Name="packages.index.json"; Entries=@($packageIndex.Packages) }
    )) {
        foreach ($entry in $indexInfo.Entries) {
            if ("IsDefaultPackage" -in (Get-PropertyNames $entry)) {
                $errors.Add("$($indexInfo.Name) entry contains forbidden legacy property 'IsDefaultPackage'.")
            }
        }
    }

    $allowedTypes = @("Skill","WebModule","ProviderModule")
    $allowedPlatforms = @("windows","linux","mac")
    $seen = [Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
    $resolved = [Collections.Generic.List[object]]::new()

    foreach ($item in @($profile.Packages)) {
        $context = "Profile package '$([string]$item.PackageId)'"
        Assert-ExactProperties $item @("PackageType","PackageId","Platforms") $context $errors
        $type = [string]$item.PackageType
        $id = [string]$item.PackageId
        $platforms = @($item.Platforms | ForEach-Object { [string]$_ })
        if ($type -notin $allowedTypes) { $errors.Add("$context has unsupported PackageType '$type'.") }
        if ([string]::IsNullOrWhiteSpace($id)) { $errors.Add("Profile package has an empty PackageId.") }
        if (-not $seen.Add("$type|$id")) { $errors.Add("Profile contains duplicate package '$type|$id'.") }
        if ($platforms.Count -eq 0) { $errors.Add("$context has no platforms.") }
        if (@($platforms | Sort-Object -Unique).Count -ne $platforms.Count) { $errors.Add("$context contains duplicate platforms.") }
        foreach ($platform in $platforms) {
            if ($platform -notin $allowedPlatforms) { $errors.Add("$context has unsupported platform '$platform'.") }
        }

        if ($type -eq "Skill") {
            $matches = @($skillIndex.Skills | Where-Object { [string]$_.SkillName -eq $id })
        } else {
            $matches = @($packageIndex.Packages | Where-Object { [string]$_.PackageId -eq $id -and [string]$_.PackageType -eq $type })
        }
        if ($matches.Count -ne 1) {
            $errors.Add("$context must resolve to exactly one matching index entry; found $($matches.Count).")
            continue
        }
        if ($TargetPlatform -notin $platforms) { continue }
        $entry = $matches[0]
        $sourcePath = if ($type -eq "Skill") { [string]$entry.Path } else { [string]$entry.SourcePath }
        $entryEvidence = [ordered]@{
            PackageType = $type
            PackageId = $id
            Version = [string]$entry.Version
            SourcePath = $sourcePath
            IndexEntrySha256 = Get-Sha256Text (ConvertTo-CanonicalJson $entry)
            ContentSha256 = Get-ContentHash $entry
        }
        $resolved.Add([pscustomobject]$entryEvidence)
    }

    if ([string]$profile.ProfileId -eq "core-installer") {
        Assert-ExactMembership $profile "Skill" @("BrowserSession","AudioTranscription","BuffalyCapabilityInspection","BuffalyMaintenance","BuffalySelfManagement","Codex","Desktop","ErrorLogDiagnosis","FFmpeg","SessionManagement","FileSystem","LLM","Level2Watcher","GitHub","Heartbeat","HelpAgent","LocalTask","Onboarding","OnlineSessionMemoryCritic","BuffalyNLMemory","Process","ProcessManagement","Services","SessionHistory","SessionSync","SkillDirectory","SqlServer","TabularData","TailscaleExposure","Unity","UserSecrets","ValidatedPrompt","VisualStudio","Wiki") $errors
        Assert-ExactMembership $profile "WebModule" @("Browser","Buffaly.Agent.Heartbeat","Buffaly.Agent.SkillManagement","Buffaly.Agent.Wiki","ComputerUse","CodeReviews","CodexEmbedded","OfflineOntologyCritic","Sessions") $errors
        Assert-ExactMembership $profile "ProviderModule" @("Buffaly.Provider.Anthropic","Buffaly.Provider.Gemini","Buffaly.Provider.LlamaCpp","Buffaly.Provider.Ollama","Buffaly.Provider.OpenAi","Buffaly.Provider.Xai") $errors
        foreach ($windowsOnlyId in @("Desktop","VisualStudio")) {
            $entry = @($profile.Packages | Where-Object { $_.PackageType -eq "Skill" -and $_.PackageId -eq $windowsOnlyId })
            if ($entry.Count -eq 1) { Assert-ExactPlatforms $entry[0] @("windows") $errors }
        }
    }

    if ([string]$profile.ProfileId -eq "recommended-installer") {
		Assert-ExactMembership $profile "Skill" @("BrowserSession","AudioTranscription","BuffalyCapabilityInspection","BuffalyMaintenance","BuffalySelfManagement","Codex","Desktop","ErrorLogDiagnosis","FFmpeg","SessionManagement","FileSystem","LLM","Level2Watcher","GitHub","Heartbeat","HelpAgent","LocalTask","Onboarding","OnlineSessionMemoryCritic","BuffalyNLMemory","VoiceAgentDispatch","Process","ProcessManagement","Services","SessionHistory","SessionSync","SkillDirectory","SqlServer","TabularData","TailscaleExposure","TwitterXApi","UserSecrets","ValidatedPrompt","Wiki") $errors
        Assert-ExactMembership $profile "WebModule" @("Browser","Buffaly.Agent.Heartbeat","Buffaly.Agent.SkillManagement","ExtensionPublishing","Buffaly.Agent.Wiki","ComputerUse","CodeReviews","CodexEmbedded","OfflineOntologyCritic","Sessions","GoogleWorkspace","Office365","OllamaCloud","OpenAIImageGeneration","OpenAIAdmin","LinkedIn") $errors
        Assert-ExactMembership $profile "ProviderModule" @("Buffaly.Provider.Anthropic","Buffaly.Provider.Gemini","Buffaly.Provider.LlamaCpp","Buffaly.Provider.Ollama","Buffaly.Provider.OpenAi","Buffaly.Provider.Xai") $errors
		Assert-ExcludedMembership $profile "Skill" @("VisualStudio","Unity") $errors
        Assert-ExcludedMembership $profile "WebModule" @("FeedingFrenzy.WebPropertyEditorAgent") $errors
        foreach ($item in @($profile.Packages)) {
            if ([string]$item.PackageType -eq "Skill" -and [string]$item.PackageId -eq "Desktop") { Assert-ExactPlatforms $item @("windows") $errors }
            else { Assert-ExactPlatforms $item @("windows","linux","mac") $errors }
        }
    }

    if (-not $ValidateOnly -and $RepositoryCommit -notmatch '^[0-9a-fA-F]{40}$') {
        $errors.Add("RepositoryCommit must be an explicit 40-character Git commit when generating a lock.")
    }
    if ($errors.Count -gt 0) { return [pscustomobject]@{ Passed=$false; Errors=$errors; Lock=$null } }

    $profileCanonical = ConvertTo-CanonicalJson $profile
    $orderedPackages = Sort-PackagesOrdinal @($resolved)
    $lockEvidence = [ordered]@{
        SchemaVersion = 1
        ProfileId = [string]$profile.ProfileId
        ProfileVersion = [string]$profile.ProfileVersion
        ProfileSha256 = Get-Sha256Text $profileCanonical
        RepositoryUrl = "https://github.com/buffaly-ai/buffaly-skills"
        RepositoryCommit = $RepositoryCommit.ToLowerInvariant()
        TargetPlatform = $TargetPlatform
        Packages = $orderedPackages
    }
    $snapshotHash = Get-Sha256Text (ConvertTo-CanonicalJson $lockEvidence)
    $lock = [ordered]@{}
    foreach ($key in $lockEvidence.Keys) { $lock[$key] = $lockEvidence[$key] }
    $lock["SnapshotSha256"] = $snapshotHash
    return [pscustomobject]@{ Passed=$true; Errors=@(); Lock=[pscustomobject]$lock }
}

if ($MyInvocation.InvocationName -ne '.') {
    $result = New-ExtensionProfileLock -RepoRoot $RepoRoot -ProfilePath $ProfilePath -TargetPlatform $TargetPlatform -RepositoryCommit $RepositoryCommit -ValidateOnly:$ValidateOnly
    if (-not $result.Passed) {
        if ($JsonOutput) { $result | ConvertTo-Json -Depth 10 }
        else { foreach ($errorMessage in $result.Errors) { Write-Error $errorMessage -ErrorAction Continue } }
        exit 1
    }
    if (-not $ValidateOnly) {
        if ([string]::IsNullOrWhiteSpace($OutputPath)) {
            $OutputPath = Join-Path (Split-Path $ProfilePath -Parent) (([string]$result.Lock.ProfileId) + ".profile.lock.json")
        }
        $parent = Split-Path $OutputPath -Parent
        if ($parent) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
        $json = ConvertTo-CanonicalJson $result.Lock
        [IO.File]::WriteAllText([IO.Path]::GetFullPath($OutputPath), $json + "`n", [Text.UTF8Encoding]::new($false))
    }
    if ($JsonOutput) { $result | ConvertTo-Json -Depth 10 }
    elseif ($ValidateOnly) { Write-Host "Profile validation passed: $ProfilePath" }
    else { Write-Host "Profile lock written: $OutputPath" }


}
