$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$fixturePath = Join-Path $PSScriptRoot 'pharmacy-growth-proposal-routing.json'
$promptPath = Join-Path $root 'Prompts\CreatePharmacyGrowthProposalDeck.work.prompt.md'
$validationPath = Join-Path $root 'Prompts\CreatePharmacyGrowthProposalDeck.validation.prompt.md'
$templatePath = Join-Path $root 'reference-packet-template\index.html'
$fixtures = Get-Content -Raw $fixturePath | ConvertFrom-Json
if ($fixtures.cases.Count -ne 4) { throw "Expected exactly four routing fixtures; found $($fixtures.cases.Count)." }
$expectedIds = @('single-no-website-strong-social','single-weak-website','multi-location-operator','strong-website-remote-care-opportunity')
foreach ($id in $expectedIds) {
  if (-not ($fixtures.cases.id -contains $id)) { throw "Missing routing fixture: $id" }
}
$prompt = Get-Content -Raw $promptPath
$validation = Get-Content -Raw $validationPath
$template = Get-Content -Raw $templatePath
$requiredPromptPhrases = @('No website + strong social/reputation','Two paths that work together','What patient participation could mean','Which path should we start with?')
foreach ($phrase in $requiredPromptPhrases) {
  if ($prompt -notlike "*$phrase*") { throw "Work prompt is missing required contract phrase: $phrase" }
}
$requiredValidationPhrases = @('Single-location copy','Strong public social or reputation evidence','Render and inspect at minimum')
foreach ($phrase in $requiredValidationPhrases) {
  if ($validation -notlike "*$phrase*") { throw "Validation prompt is missing required check: $phrase" }
}
$requiredTemplatePhrases = @('Your customers already know and trust you','Two paths that work together','A 90-day start with check-ins along the way','Which path should we start with?')
foreach ($phrase in $requiredTemplatePhrases) {
  if ($template -notlike "*$phrase*") { throw "Reference template is missing required default: $phrase" }
}
$forbiddenTemplatePhrases = @('not a 12-location leap','Three parts, one operating motion','gated at 30 / 60 / 90 days','Illustrative gross billing — not a forecast')
foreach ($phrase in $forbiddenTemplatePhrases) {
  if ($template -like "*$phrase*") { throw "Reference template still contains forbidden default: $phrase" }
}
$slideCount = ([regex]::Matches($template, '<section class="slide ')).Count
if ($slideCount -ne 16) { throw "Expected 16 template slides; found $slideCount." }
Write-Output "PASS: four routing fixtures, prompt/validator contracts, friendly template defaults, and 16-slide structure validated."
