param([string]$EvidenceDirectory)
$ErrorActionPreference = 'Stop'
$validator = Join-Path $PSScriptRoot 'Test-ExtensionPackage.ps1'
$root = Join-Path ([IO.Path]::GetTempPath()) ('BuffalyNativeAssetTests-' + [guid]::NewGuid().ToString('N'))
$results = [Collections.Generic.List[object]]::new()
$utf8 = [Text.UTF8Encoding]::new($false)

# Exercise the public validator in a fresh process with a real hashed fixture index.
function Test-Case([string]$Name, [hashtable]$Dependency, [string[]]$Files, [bool]$Pass, [string]$Diagnostic = '', [string]$Prefix = '', [string]$Mutation = '') {
	$caseRoot = Join-Path $root $Name
	$packageRoot = Join-Path $caseRoot 'web-modules/Fixture'
	[IO.Directory]::CreateDirectory($packageRoot) | Out-Null
	$target = [ordered]@{ 'Harness/1.0.0' = @{ dependencies = @{ 'Native.Package' = '1.0.0' } }; 'Native.Package/1.0.0' = $Dependency }
	$deps = (@{ targets = @{ 'net9.0' = $target } } | ConvertTo-Json -Depth 20).Replace("`r`n", "`n")
	$depsPath = $Prefix + 'Harness.deps.json'
	$contents = @{}; $contents[$depsPath] = $deps
	foreach ($file in $Files) { $contents[$Prefix + $file] = 'fixture bytes ' + $file }
	$indexed = @()
	foreach ($path in $contents.Keys) {
		$full = Join-Path $packageRoot $path
		[IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($full)) | Out-Null
		[IO.File]::WriteAllText($full, $contents[$path], $utf8)
		$indexed += @{ Path = $path; Sha256 = (Get-FileHash $full -Algorithm SHA256).Hash.ToLowerInvariant() }
	}
	$index = @{ Packages = @(@{ PackageId = 'Fixture'; PackageType = 'WebModule'; SourcePath = 'web-modules/Fixture'; Title = 'Fixture'; Version = '1.0.0'; Files = $indexed }) }
	[IO.File]::WriteAllText((Join-Path $caseRoot 'packages.index.json'), ($index | ConvertTo-Json -Depth 20), $utf8)
	if ($Mutation -eq 'missing-disk') { [IO.File]::Delete((Join-Path $packageRoot ($Prefix + $Files[0]))) }
	if ($Mutation -eq 'corrupt') { [IO.File]::AppendAllText((Join-Path $packageRoot ($Prefix + $Files[0])), 'corrupt', $utf8) }
	if ($Mutation -eq 'unindexed') {
		$full = Join-Path $packageRoot ($Prefix + 'runtimes/win-x64/native/libNative.dll')
		[IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($full)) | Out-Null
		[IO.File]::WriteAllText($full, 'unindexed native', $utf8)
	}
	$output = & pwsh -NoProfile -File $validator -RepoRoot $caseRoot -PackageName Fixture -JsonOutput
	$exitCode = $LASTEXITCODE
	$result = ($output -join "`n") | ConvertFrom-Json
	if ($result.Passed -ne $Pass -or ($Pass -and $exitCode -ne 0) -or (-not $Pass -and $exitCode -eq 0)) { throw "$Name unexpected outcome: $($output -join ' ')" }
	if ($Diagnostic -and -not (($result.Errors -join ' ') -like ('*' + $Diagnostic + '*'))) { throw "$Name missing diagnostic '$Diagnostic': $($output -join ' ')" }
	$results.Add([pscustomobject]@{Name=$Name; Passed=$true; ExpectedPackagePass=$Pass; ValidatorExit=$exitCode; Errors=$result.Errors})
}

try {
	$native = @{ runtimeTargets = @{ 'runtimes/win-x64/native/libNative.dll' = @{rid='win-x64';assetType='native'}; 'runtimes/osx/native/libNative.dylib' = @{rid='osx';assetType='native'} } }
	$nativeFiles = @('runtimes/win-x64/native/libNative.dll', 'runtimes/osx/native/libNative.dylib')
	Test-Case 'native-only' $native $nativeFiles $true
	$symbols = @{ runtimeTargets = @{ 'runtimes/win-x64/native/libNative.dll' = @{rid='win-x64';assetType='native'}; 'runtimes/win-x64/native/libNative.pdb' = @{rid='win-x64';assetType='native'} } }
	Test-Case 'optional-symbols-omitted' $symbols @($nativeFiles[0]) $true
	Test-Case 'symbols-cannot-replace-native' $symbols @('runtimes/win-x64/native/libNative.pdb') $false 'libNative.dll'
	Test-Case 'missing-native' $native @($nativeFiles[0]) $false 'runtimes/osx/native/libNative.dylib'
	Test-Case 'wrong-rid-same-basename' $native @('runtimes/win-arm64/native/libNative.dll', $nativeFiles[1]) $false 'runtimes/win-x64/native/libNative.dll'
	Test-Case 'unindexed-native' $native @($nativeFiles[1]) $false 'Missing runtime asset' '' 'unindexed'
	Test-Case 'missing-disk' $native $nativeFiles $false 'Indexed file does not exist' '' 'missing-disk'
	Test-Case 'wrong-hash' $native $nativeFiles $false 'Hash mismatch' '' 'corrupt'
	Test-Case 'nested-deps' $native $nativeFiles $true '' 'nested/'
	$mixed = @{ runtime = @{'lib/net9.0/Actual.Assembly.dll'=@{}}; runtimeTargets=$native.runtimeTargets }
	Test-Case 'mixed-native-managed' $mixed ($nativeFiles + 'Actual.Assembly.dll') $true
	Test-Case 'mixed-missing-managed' $mixed $nativeFiles $false 'Actual.Assembly.dll'
	$resolved = @{ native = @{'runtimes/win-x64/native/libNative.dll'=@{}}; runtime = @{'lib/net9.0/Actual.Assembly.dll'=@{}} }
	Test-Case 'rid-resolved-flat-native' $resolved @('libNative.dll','Actual.Assembly.dll') $true
	Test-Case 'rid-resolved-missing-native' $resolved @('Actual.Assembly.dll') $false 'libNative.dll'
	Test-Case 'managed-policy-retained' @{runtime=@{'lib/net9.0/Native.Package.dll'=@{}}} @('Native.Package.dll') $true
	Test-Case 'missing-managed-retained' @{runtime=@{'lib/net9.0/Native.Package.dll'=@{}}} @() $false 'Missing DLL dependency'
	if ($EvidenceDirectory) {
		[IO.Directory]::CreateDirectory($EvidenceDirectory) | Out-Null
		$results | ConvertTo-Json -Depth 10 | Set-Content (Join-Path $EvidenceDirectory 'native-dependency-regressions.json')
	}
	Write-Output "PASS: $($results.Count) native dependency regression cases."
} finally {
	if (Test-Path $root) { Remove-Item $root -Recurse -Force }
}
