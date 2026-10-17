param([string]$RepoRoot = (Split-Path $PSScriptRoot -Parent))
$ErrorActionPreference='Stop'
$packages=(Get-Content -Raw (Join-Path $RepoRoot 'packages.index.json')|ConvertFrom-Json).Packages
if(@($packages|Where-Object {$_.PackageType -ceq 'WebModule' -and $_.PackageId -ceq 'ComputerUse'}).Count){throw 'Retired workbench remains indexed'}
if(Test-Path (Join-Path $RepoRoot 'web-modules/ComputerUse')){throw 'Retired workbench payload remains'}
$skills=(Get-Content -Raw (Join-Path $RepoRoot 'skills.index.json')|ConvertFrom-Json).Skills
if(@($skills|Where-Object {$_.SkillName -ceq 'ComputerUse'}).Count -ne 1){throw 'Normal ComputerUse skill was removed or duplicated'}
foreach($name in @('core-installer','recommended-installer')){
 $profile=(Get-Content -Raw (Join-Path $RepoRoot "profiles/$name.profile.json")|ConvertFrom-Json)
 if(@($profile.Packages|Where-Object {$_.PackageType -ceq 'WebModule' -and $_.PackageId -ceq 'ComputerUse'}).Count){throw "$name selects retired workbench"}
 if($name -eq 'recommended-installer' -and @($profile.Packages|Where-Object {$_.PackageType -ceq 'Skill' -and $_.PackageId -ceq 'ComputerUse'}).Count -ne 1){throw 'Recommended profile lost desktop skill'}
 foreach($platform in @('windows','linux','mac')){
  $lock=(Get-Content -Raw (Join-Path $RepoRoot "profiles/$name.$platform.profile.lock.json")|ConvertFrom-Json)
  if(@($lock.Packages|Where-Object {$_.PackageType -ceq 'WebModule' -and $_.PackageId -ceq 'ComputerUse'}).Count){throw "$name/$platform locks retired workbench"}
 }
}
'PASS retired WebModule absent; normal Skill retained; six target locks exclude paid workbench'
