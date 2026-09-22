param([Parameter(Mandatory=$true)][string]$PackageRoot)
$entry=Join-Path $PackageRoot 'index.pts'
if(-not (Test-Path $entry -PathType Leaf)){throw 'Missing index.pts'}
$text=Get-Content $entry -Raw
if($text -notmatch 'prototype\s+ToRunClaudeCodeStateScopingRegression\s*:'){throw 'Production regression action is missing.'}
[pscustomobject]@{ProductionRegressionAction='ToRunClaudeCodeStateScopingRegression'}|ConvertTo-Json -Compress
