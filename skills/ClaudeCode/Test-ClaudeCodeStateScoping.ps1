[CmdletBinding()]
param([Parameter(Mandatory = $true)][string]$PackageRoot)
$ErrorActionPreference = 'Stop'
$entry = Join-Path $PackageRoot 'index.pts'
if (-not (Test-Path -LiteralPath $entry -PathType Leaf)) { throw 'ClaudeCode package entry point is missing.' }
$text = [IO.File]::ReadAllText($entry)
# Wiring check only; live runtime regression is a separate explicit check.
if ($text -notmatch 'prototype\s+ToRunClaudeCodeStateScopingRegression\s*:\s*ClaudeCodeSkillAction') { throw 'Production ClaudeCode state scoping regression action is missing.' }
if ($text -notmatch 'ClaudeCodeTools\.HashConversationIdentity\(') { throw 'Production state scoping regression hash call is missing.' }
[pscustomobject]@{ ProductionRegressionAction = 'ToRunClaudeCodeStateScopingRegression' } | ConvertTo-Json -Compress
