$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$fixturePath = Join-Path $PSScriptRoot 'pharmacy-growth-proposal-routing.json'
$promptPath = Join-Path $root 'Prompts\CreatePharmacyGrowthProposalDeck.work.prompt.md'
$validationPath = Join-Path $root 'Prompts\CreatePharmacyGrowthProposalDeck.validation.prompt.md'
$templatePath = Join-Path $root 'reference-packet-template\index.html'
$partnerTemplatePath = Join-Path $root 'reference-packet-template-clearspan\index.html'
$fixtures = Get-Content -Raw $fixturePath | ConvertFrom-Json
if ($fixtures.cases.Count -ne 4) { throw "Expected exactly four routing fixtures; found $($fixtures.cases.Count)." }
$expectedIds = @('single-no-website-strong-social','single-weak-website','multi-location-operator','strong-website-remote-care-opportunity')
foreach ($id in $expectedIds) {
  if (-not ($fixtures.cases.id -contains $id)) { throw "Missing routing fixture: $id" }
}
if ($fixtures.nonPharmacyEligibilityCases.Count -ne 2) { throw "Expected exactly two non-pharmacy eligibility fixtures; found $($fixtures.nonPharmacyEligibilityCases.Count)." }
$expectedNonPharmacyIds = @('authorized-pharmaceutical-healthcare-fit','reject-pharmaceutical-independent-pharmacy-misclassification')
foreach ($id in $expectedNonPharmacyIds) {
  if (-not ($fixtures.nonPharmacyEligibilityCases.id -contains $id)) { throw "Missing non-pharmacy eligibility fixture: $id" }
}
$positiveFixture = $fixtures.nonPharmacyEligibilityCases | Where-Object { $_.id -eq 'authorized-pharmaceutical-healthcare-fit' }
$negativeFixture = $fixtures.nonPharmacyEligibilityCases | Where-Object { $_.id -eq 'reject-pharmaceutical-independent-pharmacy-misclassification' }
if ($positiveFixture.runnerAction -ne 'ToCreatePharmacyGrowthProposalDeckSkill' -or $positiveFixture.fixtureMode -ne 'production-work-and-validation') { throw 'Positive non-pharmacy fixture must use the production proposal work and validation action.' }
if ($negativeFixture.runnerAction -ne 'ToValidatePharmacyGrowthProposalDeckFixtureSkill' -or $negativeFixture.fixtureMode -ne 'production-validation-only') { throw 'Negative non-pharmacy fixture must use the staged-candidate action backed by the production proposal validator.' }
$repositoryRoot = Split-Path -Parent (Split-Path -Parent $root)
$negativeCandidatePath = Join-Path $repositoryRoot $negativeFixture.stagedCandidatePath
if (-not (Test-Path -LiteralPath $negativeCandidatePath)) { throw "Negative staged candidate not found: $negativeCandidatePath" }
$negativeCandidateHash = (Get-FileHash -LiteralPath $negativeCandidatePath -Algorithm SHA256).Hash.ToLowerInvariant()
if ($negativeCandidateHash -ne $negativeFixture.stagedCandidateSha256) { throw "Negative staged candidate hash mismatch. Expected $($negativeFixture.stagedCandidateSha256); observed $negativeCandidateHash." }
$negativeCandidateHtml = Get-Content -Raw -LiteralPath $negativeCandidatePath
foreach ($requiredDefect in @('Medicure is an independent pharmacy','local pharmacy owner','retail counter')) {
  if ($negativeCandidateHtml -notlike "*$requiredDefect*") { throw "Negative staged candidate is missing required defect: $requiredDefect" }
}

$integrationResultPath = $env:PHARMACY_GROWTH_PROPOSAL_INTEGRATION_RESULTS
if (-not [string]::IsNullOrWhiteSpace($integrationResultPath)) {
  if (-not (Test-Path -LiteralPath $integrationResultPath)) { throw "Production runner result file not found: $integrationResultPath" }
  $integrationResults = Get-Content -Raw -LiteralPath $integrationResultPath | ConvertFrom-Json
  foreach ($case in $fixtures.nonPharmacyEligibilityCases) {
    $result = $integrationResults.cases | Where-Object { $_.id -eq $case.id }
    if ($null -eq $result) { throw "Production runner result missing fixture: $($case.id)" }
    if ($result.validatedPromptAction -ne $case.runnerAction) { throw "Fixture '$($case.id)' ran through '$($result.validatedPromptAction)' instead of '$($case.runnerAction)'." }
    if ($result.runnerBackend -ne 'separate-process-child-session') { throw "Fixture '$($case.id)' did not use the production child-session backend." }
    if ($result.status -ne $case.expectedRunnerStatus) { throw "Fixture '$($case.id)' expected runner status '$($case.expectedRunnerStatus)' but received '$($result.status)'." }
    if ($case.fixtureMode -eq 'production-validation-only') {
      if ($result.stagedCandidatePath -ne $case.stagedCandidatePath) { throw "Fixture '$($case.id)' result is not bound to the configured staged candidate path." }
      if ($result.stagedCandidateSha256 -ne $case.stagedCandidateSha256) { throw "Fixture '$($case.id)' result is not bound to the configured staged candidate hash." }
      if ($result.workResult -notlike "*$($case.stagedCandidateSha256)*") { throw "Fixture '$($case.id)' work result does not report the observed staged candidate hash." }
      if ($result.workResult -notlike '*Candidate provenance verified from staged artifact, not from instruction text.*') { throw "Fixture '$($case.id)' work result does not attest staged-artifact provenance." }
    }
    $diagnosticText = @($result.validationReason) + @($result.validationChecks) -join "`n"
    foreach ($diagnostic in $case.requiredValidationDiagnostics) {
      if ($diagnosticText -notlike "*$diagnostic*") { throw "Fixture '$($case.id)' production validation diagnostics are missing: $diagnostic" }
    }
  }
  Write-Output "PASS: production validated-prompt runner results assert authorized pharmaceutical pass and misclassified independent-pharmacy fail diagnostics."
}
$prompt = Get-Content -Raw $promptPath
$validation = Get-Content -Raw $validationPath
$template = Get-Content -Raw $templatePath
$forbiddenMojibakeMarkers = @(
  ([string][char]0x0393 + [char]0x00C7),
  ([string][char]0x0393 + [char]0x00F6),
  ([string][char]0x0393 + [char]0x00E5),
  ([string][char]0x251C),
  ([string][char]0x252C),
  ([string][char]0x00E2 + [char]0x20AC),
  ([string][char]0x00C3),
  ([string][char]0xFFFD)
)
$scannedSources = @{
  'work prompt' = $prompt
  'validation prompt' = $validation
  'reference template' = $template
}
foreach ($source in $scannedSources.GetEnumerator()) {
  foreach ($marker in $forbiddenMojibakeMarkers) {
    if ($source.Value -like "*$marker*") { throw "$($source.Key) contains mojibake marker: $marker" }
  }
}
$requiredPromptPhrases = @(
  'Sourced Competitor Comparison',
  'Native Readability and Flow Pass',
  'What patient participation could mean',
  'Which path should we start with?',
  'This is the single user-facing pharmacy proposal workflow',
  'Lead Pull and Official Website Resolution',
  'Website Evidence Branch',
  'confirmed official website',
  'no official website found',
  'website-audit feeder',
  'proposal-research-packet.md',
  'run or reuse ``ToAnalyzeExistingWebsiteForImprovementsSkill``',
  'Do not run ``ToAnalyzeExistingWebsiteForImprovementsSkill`` against an unconfirmed candidate',
  'AI/LLM-answer-readiness',
  'Slide placement: use slide 13 for the named competitor comparison',
  'Deck Evidence Routing Map',
  'Eligibility is evidence-and-fit based, not limited to independent pharmacies',
  'Pharmaceutical or healthcare organization',
  'exactly one edge-to-edge 1280x720 slide',
  'object-fit: cover',
  'This is the website scoring page',
  'all five core programs offered',
  'Do not show a separate share/capture-rate column',
  'IMPLEMENTATION_NOTES.md',
  'slide-content-contract.json',
  'remote-care-general proof period',
  'never says CCML',
  'Prove Remote Care for 90 Days',
  'IntelligenceFactoryDirect',
  'ClearSpanPartner',
  'slides 3-7',
  'slides 8-13'
)
foreach ($phrase in $requiredPromptPhrases) {
  if ($prompt -notlike "*$phrase*") { throw "Work prompt is missing required contract phrase: $phrase" }
}
$requiredValidationPhrases = @(
  'Single-location copy',
  'Strong public social or reputation evidence',
  'Render and inspect all 16 slides',
  'Website-resolution and audit-feeder branch checks',
  'proposal-research-packet.md',
  'Audit feeder status',
  'Confirmed official website branch',
  'No confirmed official website branch',
  'Likely-but-not-confirmed branch',
  'AI/LLM-answer readiness',
  'Slide 12 does not contain the prospect''s website/AI-answer opportunity',
  'Do not fail solely because the prospect is not an independent pharmacy',
  'misclassifies the prospect',
  'letterboxed',
  'five core program options',
  'separate share/capture-rate column',
  'remote-care-general 90-day proof-period',
  'CCML',
  'APCM and RTM must be visible',
  'IntelligenceFactoryDirect',
  'ClearSpanPartner',
  'slides 3-7',
  'slides 8-13'
)
foreach ($phrase in $requiredValidationPhrases) {
  if ($validation -notlike "*$phrase*") { throw "Validation prompt is missing required check: $phrase" }
}
$requiredTemplatePhrases = @('Make more money. Cut costs. Save time.','What nearby options show online','Prove it for 90 days','Remote Care Proof Period','A rural service area where the pharmacy can stay close to patients','Which path should we start with?')
foreach ($phrase in $requiredTemplatePhrases) {
  if ($template -notlike "*$phrase*") { throw "Reference template is missing required default: $phrase" }
}
$forbiddenTemplatePhrases = @('not a 12-location leap','Three parts, one operating motion','gated at 30 / 60 / 90 days','Illustrative gross billing -- not a forecast')
foreach ($phrase in $forbiddenTemplatePhrases) {
  if ($template -like "*$phrase*") { throw "Reference template still contains forbidden default: $phrase" }
}
$expectedSlideOrder = @(
  'Cover','Value proposition','Remote Care Proof Period','Remote Care Opportunity','One clear remote care workflow','Local market and care need','Illustrative economics','What is already working','The gap','Audit scorecard','What the website adds','Immediate opportunity','Sourced competitor comparison','Growth recap','Two implementation paths','Choose a starting path'
)
$actualSlideOrder = [regex]::Matches($template, '<section class="slide[^>]+aria-label="(?<title>[^"]+)"') | ForEach-Object { $_.Groups['title'].Value }
if ((Compare-Object $expectedSlideOrder $actualSlideOrder -SyncWindow 0)) { throw "Reference template slide order is stale. Expected Remote Care slides 3-7 and website slides 8-13." }
if ($template -notlike '*Intelligence Factory*FairPath*') { throw 'Default reference template is missing the Intelligence Factory with FairPath presenter treatment.' }
if ($template -like '*ClearSpan*') { throw 'Default reference template contains ClearSpan presenter branding.' }
$partnerTemplate = Get-Content -Raw -LiteralPath $partnerTemplatePath
if ($partnerTemplate -notlike '*ClearSpan*with FairPath*' -or $partnerTemplate -notlike '*ClearSpan &middot; FairPath*') { throw 'Partner reference template is missing the ClearSpan with FairPath presenter treatment.' }
$slideCount = ([regex]::Matches($template, '<section class="slide ')).Count
if ($slideCount -ne 16) { throw "Expected 16 template slides; found $slideCount." }
$requiredWorkPromptPhrases = @(
  'competitor-comparison-ledger.md',
  'Focused Competitor Comparison Ledger',
  'Sourced Competitor Comparison',
  'Native Readability and Flow Pass',
  'Render all 16 slides at 1280x720',
  'Do not rely on an external model or polish agent',
  'website-audit feeder',
  'website audit feeder unavailable',
  'No-confirmed-website proposals skip the website-audit feeder',
  'Minimum competitor dimensions to check',
  'slide 12 shows prospect website/AI-answer opportunity',
  'Do not move competitor comparison before slide 13'
)
foreach ($phrase in $requiredWorkPromptPhrases) { if ($prompt -notlike "*$phrase*") { throw "Work prompt missing required native v5 phrase: $phrase" } }

$forbiddenWorkPromptPhrases = @('### Step 7: Antigravity Enhancement','ToTalkToAntigravity','Antigravity/Gemini Pro enhancement applied')
foreach ($phrase in $forbiddenWorkPromptPhrases) { if ($prompt -like "*$phrase*") { throw "Work prompt still contains obsolete external-polish phrase: $phrase" } }

$requiredValidationPhrases = @('competitor-comparison-ledger.md','Competitor comparison checks','Render and inspect all 16 slides','map-pack/ranking/review audit','Patient-answer / AI-readiness clarity','general-skill-final-validation-result/v1','correctionPlan')
foreach ($phrase in $requiredValidationPhrases) { if ($validation -notlike "*$phrase*") { throw "Validation prompt missing required native v5 phrase: $phrase" } }

$fixtureText = Get-Content -Raw $fixturePath
$requiredFixtureConcepts = @(
  'website resolution branch',
  'website audit feeder skipped',
  'website audit feeder ran or reused',
  'manual website audit prerequisite',
  'website audit feeder condensed into deck',
  'patient-answer readiness',
  'AI-answer clarity',
  'patient-action dimensions',
  'remote-care proof period'
)
foreach ($concept in $requiredFixtureConcepts) {
  if ($fixtureText -notlike "*$concept*") { throw "Routing fixture missing one-call orchestration concept: $concept" }
}

$requiredTemplatePhrases = @('Sourced Competitor Comparison','What nearby options show online','Prove it for 90 days','Opportunity Size','A rural service area where the pharmacy can stay close to patients','What patient participation could look like','comp-grid','class="shot"')
foreach ($phrase in $requiredTemplatePhrases) { if ($template -notlike "*$phrase*") { throw "Reference template missing required native v5 phrase/component: $phrase" } }

foreach ($packagedFile in @('IMPLEMENTATION_NOTES.md','slide-content-contract.json')) {
  if (-not (Test-Path -LiteralPath (Join-Path (Split-Path -Parent $templatePath) $packagedFile))) { throw "Reference template package missing $packagedFile" }
}
foreach ($forbiddenRemoteCarePhrase in @('CCM population','Asheville CCM','FairPath * Asheville CCM','bring CCM home','CCML')) {
  if ($template -like "*$forbiddenRemoteCarePhrase*") { throw "Reference template proof-period slide contains CCM-only/incorrect phrase: $forbiddenRemoteCarePhrase" }
}

$workflowIndex = $template.IndexOf('aria-label="One clear remote care workflow"')
$marketIndex = $template.IndexOf('aria-label="Local market and care need"')
$economicsIndex = $template.IndexOf('aria-label="Illustrative economics"')
$proofIndex = $template.IndexOf('aria-label="Remote Care Proof Period"')
$remoteCareIndex = $template.IndexOf('aria-label="Remote Care Opportunity"')
if ($proofIndex -lt 0 -or $remoteCareIndex -lt 0 -or $workflowIndex -lt 0 -or $marketIndex -lt 0 -or $economicsIndex -lt 0) { throw 'Reference template missing proof/remote-care/workflow/market/economics labels.' }
if (-not ($proofIndex -lt $remoteCareIndex -and $remoteCareIndex -lt $workflowIndex -and $workflowIndex -lt $marketIndex -and $marketIndex -lt $economicsIndex)) { throw 'Expected proof period before remote-care opportunity before FairPath workflow before opportunity size before economics.' }

Write-Output "PASS: four pharmacy routing fixtures, production-path non-pharmacy integration fixture contracts, native v5 prompt/validator contracts, sourced competitor template, corrected slide order, and 16-slide structure validated."
