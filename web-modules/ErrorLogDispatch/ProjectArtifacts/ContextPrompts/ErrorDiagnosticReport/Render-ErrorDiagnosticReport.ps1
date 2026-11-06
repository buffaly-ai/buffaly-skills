param(
	[Parameter(Mandatory=$true)][string]$InputPath,
	[Parameter(Mandatory=$true)][string]$OutputDirectory
)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$inputFile = (Resolve-Path -LiteralPath $InputPath).Path
$data = Get-Content -LiteralPath $inputFile -Raw | ConvertFrom-Json
. (Join-Path $PSScriptRoot 'Assert-DiagnosticCompletion.ps1')
Assert-DiagnosticCompletion $data (Split-Path $inputFile -Parent)
function RequiredText($object, [string]$name, [int]$maximum = 0) {
	$p = $object.PSObject.Properties[$name]
	if ($null -eq $p -or $p.Value -isnot [string] -or [string]::IsNullOrWhiteSpace($p.Value)) { throw "Required nonempty string: $name" }
	if ($maximum -gt 0 -and $p.Value.Length -gt $maximum) { throw "${name} exceeds $maximum characters; move supporting detail to the investigation." }
	return $p.Value
}
function Encode([string]$value) { return [System.Net.WebUtility]::HtmlEncode($value) }
function Rows($rows, [string[]]$columns, [int]$maximum) {
	return (($rows | ForEach-Object {
		$row = $_
		'<tr>' + (($columns | ForEach-Object { '<td style="padding:12px;border-bottom:1px solid #dce3ea;">' + (Encode (RequiredText $row $_ $maximum)) + '</td>' }) -join '') + '</tr>'
	}) -join '')
}
$values = @{}
$limits = @{Title=120;WhatHappened=900;Recommendation=600;Effect=600;WorkStatus=500;OccurredAt=300;ExactError=0;ThrowLocation=0;CallStack=0}
foreach ($name in $limits.Keys) { $values[$name] = Encode (RequiredText $data $name $limits[$name]) }
$labels = @{FixIdentified='Fix identified';FixVerified='Fix verified';NoChangeNeeded='No change needed';Blocked='Blocked'}
$values.Status = $labels[$data.Disposition]
$limitation = $data.PSObject.Properties['Limitation']
if ($null -eq $limitation -or $limitation.Value -isnot [string] -or $limitation.Value.Length -gt 600) { throw 'Limitation is a required string of at most 600 characters.' }
if (($data.RecommendationScope -ceq 'AlarmOnly' -or $data.Disposition -ceq 'Blocked') -and [string]::IsNullOrWhiteSpace($limitation.Value)) { throw 'AlarmOnly and Blocked require a decision-changing Limitation.' }
$values.Limitation = if ([string]::IsNullOrWhiteSpace($limitation.Value)) { '' } else { '<p><strong>Limitation:</strong> ' + (Encode $limitation.Value) + '</p>' }
$why = $data.PSObject.Properties['Why']
if ($null -eq $why -or $why.Value -isnot [array] -or $why.Value.Count -lt 2 -or $why.Value.Count -gt 4) { throw 'Why requires two to four short evidence-backed points.' }
$values.Why = (($why.Value | ForEach-Object {
	if ($_ -isnot [string] -or [string]::IsNullOrWhiteSpace($_) -or $_.Length -gt 500) { throw 'Each Why point must be a nonempty string of at most 500 characters.' }
	'<li>' + (Encode $_) + '</li>'
}) -join '')
# One authoritative hypothesis record supplies both completion and visible result.
$causeLabels = @{Supported='Confirmed';RuledOut='Ruled out';Unresolved='Not determined'}
$values.CauseRows = (($data.Completion.Hypotheses | ForEach-Object {
	'<tr><td style="padding:12px;border-bottom:1px solid #dce3ea;">' + (Encode (RequiredText $_ 'Cause' 500)) + '</td><td style="padding:12px;border-bottom:1px solid #dce3ea;">' + (Encode (RequiredText $_ 'Check' 500)) + '</td><td style="padding:12px;border-bottom:1px solid #dce3ea;"><strong>' + $causeLabels[$_.Status] + ':</strong> ' + (Encode (RequiredText $_ 'Result' 500)) + '</td></tr>'
}) -join '')
$checks = $data.PSObject.Properties['Verification']
if ($null -eq $checks -or $checks.Value -isnot [array] -or $checks.Value.Count -gt 3) { throw 'Verification must be an array of zero to three checks.' }
if ($data.Disposition -cin @('FixIdentified','FixVerified') -and $checks.Value.Count -eq 0) { throw 'A recommended fix requires visible verification.' }
$verificationHeading = if ($data.Disposition -ceq 'FixVerified') { 'How the fix was verified' } else { 'How the fix will be verified' }
$values.VerificationSection = if ($checks.Value.Count -eq 0) { '' } else {
	'<h2>' + $verificationHeading + '</h2><table style="width:100%;border-collapse:collapse;"><thead><tr style="background:#eef2f6;"><th style="padding:12px;text-align:left;">Check</th><th style="padding:12px;text-align:left;">Required result</th><th style="padding:12px;text-align:left;">Status</th></tr></thead><tbody>' + (Rows $checks.Value @('Check','RequiredResult','Status') 600) + '</tbody></table>'
}
$values.BlockedSection = if ($data.Disposition -cne 'Blocked') { '' } else {
	'<section style="border-left:5px solid #d4ac50;padding:12px 20px;"><h2>Blocked by</h2>' + (($data.Completion.Blockers | ForEach-Object { '<p>' + (Encode (RequiredText $_ 'MissingFact' 600)) + ' <strong>Owner:</strong> ' + (Encode (RequiredText $_ 'Owner' 150)) + '. ' + (Encode (RequiredText $_ 'Constraint' 600)) + '</p><p><strong>Tried:</strong> ' + (($_.Alternatives | ForEach-Object { Encode (RequiredText $_ 'Result' 500) }) -join ' ') + '</p>' }) -join '') + '</section>'
}
$artifact = RequiredText $data 'ArtifactPath'
if ($artifact -match '[\r\n\[\]|<>]' -or $artifact -notmatch '(^artifacts[/\\]|[/\\]artifacts[/\\])') { throw 'ArtifactPath must be a safe report path under artifacts.' }
$artifactFile = if ([IO.Path]::IsPathRooted($artifact)) { $artifact } else { Join-Path (Split-Path $inputFile -Parent) $artifact }
if (-not (Test-Path -LiteralPath $artifactFile -PathType Leaf)) { throw 'ArtifactPath must reference the existing complete investigation.' }
$values.ArtifactPath = Encode $artifact
$actions = $data.PSObject.Properties['Suggestions']
if ($null -eq $actions -or $actions.Value -isnot [array] -or $actions.Value.Count -gt 3) { throw 'Suggestions must be an array of zero to three actions.' }
if ($data.Disposition -ceq 'FixIdentified' -and $actions.Value.Count -eq 0) { throw 'FixIdentified requires the real recommended action as a native chip.' }
$suggestions = @()
foreach ($action in $actions.Value) {
	$label = RequiredText $action 'Label' 60
	$instruction = RequiredText $action 'Instruction' 1600
	if ($label -match '[\r\n`]' -or $instruction -match '[\r\n`]') { throw 'Suggestion fields must be single-line without backticks.' }
	$suggestions += '- label: ' + $label + "`n  instruction: " + $instruction
}
$template = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'report-template.html') -Raw
$html = [regex]::Replace($template, '\{\{([A-Za-z]+)\}\}', [System.Text.RegularExpressions.MatchEvaluator]{ param($match)
	$key = $match.Groups[1].Value
	if (-not $values.ContainsKey($key)) { throw "Unknown template slot: $key" }
	return $values[$key]
})
# Native actions are message-level controls outside the unchanged sandbox document.
$message = $html
if ($suggestions.Count -gt 0) { $message += "`n" + '```suggestions' + "`n" + ($suggestions -join "`n") + "`n" + '```' }
$envelope = @{ items = @(@{ type='message'; role='assistant'; phase='final_answer'; content=@(@{type='output_text';text=$message}); metadata=@{format='html';result_type='display message'} }) }
[IO.Directory]::CreateDirectory($OutputDirectory) | Out-Null
[IO.File]::WriteAllText((Join-Path $OutputDirectory 'report.html'), $html)
[IO.File]::WriteAllText((Join-Path $OutputDirectory 'response.json'), ($envelope | ConvertTo-Json -Depth 10))
Write-Output (Join-Path $OutputDirectory 'response.json')
