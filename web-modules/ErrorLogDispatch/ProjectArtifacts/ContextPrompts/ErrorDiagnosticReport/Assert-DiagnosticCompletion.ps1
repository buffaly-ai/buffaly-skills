# Validates the one findings contract before rendering. Evidence existence is not proof of its truth.
function Assert-DiagnosticCompletion($data, [string]$inputDirectory) {
	function Text($object, [string]$name) {
		$p = $object.PSObject.Properties[$name]
		if ($null -eq $p -or $p.Value -isnot [string] -or [string]::IsNullOrWhiteSpace($p.Value)) { throw "Required nonempty string: $name" }
		return $p.Value
	}
	function Items($object, [string]$name, [bool]$nonempty = $true) {
		$p = $object.PSObject.Properties[$name]
		if ($null -eq $p -or $p.Value -isnot [array] -or ($nonempty -and $p.Value.Count -eq 0)) { throw "Required array: $name" }
		return ,$p.Value
	}
	function Choice($object, [string]$name, [string[]]$allowed) {
		$value = Text $object $name
		if ($value -cnotin $allowed) { throw "Invalid ${name}: $value" }
		return $value
	}
	function Evidence($object, [string]$name = 'Evidence') {
		foreach ($entry in (Items $object $name)) {
			$path = Text $entry 'Path'
			$null = Text $entry 'Locator'
			if (-not [IO.Path]::IsPathRooted($path)) { $path = Join-Path $inputDirectory $path }
			if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Missing evidence file: $path" }
		}
	}
	if ($data.SchemaVersion -cne 2) { throw 'SchemaVersion must be 2; old findings must be re-investigated and authored, not normalized.' }
	$disposition = Choice $data 'Disposition' @('FixIdentified','FixVerified','NoChangeNeeded','Blocked')
	$scope = Choice $data 'RecommendationScope' @('FailureRepair','AlarmOnly','NoChange','ExternalDependency')
	$c = $data.Completion
	if ($null -eq $c) { throw 'Completion is required.' }
	if ((Items $c 'RemainingWork' $false).Count -ne 0) { throw 'RemainingWork is not empty: continue authorized research before finalizing.' }
	if ($c.EvidenceReviewed -isnot [bool] -or -not $c.EvidenceReviewed) { throw 'EvidenceReviewed must be true after inspecting cited results.' }
	$null = Text $c 'ReviewSummary'
	$blockers = Items $c 'Blockers' $false
	$ids = @{}
	foreach ($b in $blockers) {
		$id = Text $b 'Id'
		if ($ids.ContainsKey($id)) { throw "Duplicate blocker Id: $id" }
		$ids[$id] = $true
		foreach ($name in @('MissingFact','Owner','Operation','Constraint','AuthorityBasis')) { $null = Text $b $name }
		$origin = Choice $b 'Origin' @('AccessControl','Retention','UserInstruction','GoverningRule','CoordinatorInstruction')
		Evidence $b
		if ($origin -ceq 'CoordinatorInstruction') { $null = Text $b 'AuthorityReconciliation'; Evidence $b 'ReconciliationEvidence' }
		foreach ($a in (Items $b 'Alternatives')) {
			$null = Text $a 'Operation'; $null = Text $a 'Result'
			$null = Choice $a 'Outcome' @('Unavailable','Prohibited','Insufficient')
			Evidence $a
		}
	}
	function BlockerRefs($object, [bool]$required) {
		$refs = Items $object 'BlockerIds' $false
		if ($required -and $refs.Count -eq 0) { throw 'Blocked or unresolved work requires BlockerIds.' }
		if (-not $required -and $refs.Count -ne 0) { throw 'Completed work cannot reference unresolved blockers.' }
		foreach ($id in $refs) { if ($id -isnot [string] -or -not $ids.ContainsKey($id)) { throw "Unknown BlockerId: $id" } }
	}
	$unresolved = $false
	$checks = Items $c 'Checks'
	$areas = @('Incident','Logs','CodeAndCallers','ConfigurationAndRuntime','HistoryAndProtectedBehavior','AlternativesAndAuthority')
	if ($checks.Count -ne $areas.Count) { throw 'Checks must cover exactly the six required areas.' }
	foreach ($area in $areas) {
		$matches = @($checks | Where-Object { $_.Area -ceq $area })
		if ($matches.Count -ne 1) { throw "Missing or duplicate check area: $area" }
		$check = $matches[0]
		$status = Choice $check 'Status' @('Completed','NotApplicable','Blocked')
		$null = Text $check 'Result'; Evidence $check
		BlockerRefs $check ($status -ceq 'Blocked')
		if ($status -ceq 'Blocked') { $unresolved = $true }
	}
	$logs = $c.Logs
	if ($logs.Required -isnot [bool]) { throw 'Logs.Required must be a boolean.' }
	$logStatus = Choice $logs 'Status' @('Retrieved','NotRequired','Blocked')
	$null = Text $logs 'Reason'; Evidence $logs
	BlockerRefs $logs ($logStatus -ceq 'Blocked')
	$retrievals = Items $logs 'Retrievals' $false
	$complete = $false
	foreach ($r in $retrievals) {
		$null = Text $r 'Target'; $null = Text $r 'Result'
		$op = Choice $r 'Operation' @('Read','Download','Analyze')
		$coverage = Choice $r 'Coverage' @('CompleteIncident','Partial')
		Evidence $r
		if ($op -cin @('Read','Download') -and $coverage -ceq 'CompleteIncident') { $complete = $true }
	}
	if ($logs.Required -and $logStatus -ceq 'NotRequired') { throw 'Needed logs cannot be NotRequired.' }
	if (-not $logs.Required -and $logStatus -cne 'NotRequired') { throw 'Unneeded logs must explicitly be NotRequired with evidence.' }
	if ($logStatus -ceq 'Retrieved' -and -not $complete) { throw 'Needed log retrieval requires actual Read/Download covering the incident; inventory or partial tail is insufficient.' }
	$logCheck = @($checks | Where-Object { $_.Area -ceq 'Logs' })[0]
	if (($logStatus -ceq 'Blocked') -ne ($logCheck.Status -ceq 'Blocked')) { throw 'Logs and Logs check status disagree.' }
	if ($logStatus -ceq 'Retrieved' -and $logCheck.Status -cne 'Completed') { throw 'Retrieved logs require a Completed Logs check.' }
	if ($logStatus -ceq 'NotRequired' -and $logCheck.Status -cne 'NotApplicable') { throw 'NotRequired logs require a justified NotApplicable Logs check.' }
	if ($logStatus -ceq 'Blocked') { $unresolved = $true }
	$supported = $false
	$hypotheses = Items $c 'Hypotheses'
	if ($hypotheses.Count -gt 5) { throw 'Group the cause hypotheses into at most five readable checks; preserve detailed checks in the investigation.' }
	foreach ($h in $hypotheses) {
		foreach ($name in @('Cause','Check','Result')) { $null = Text $h $name }
		$status = Choice $h 'Status' @('Supported','RuledOut','Unresolved')
		Evidence $h; BlockerRefs $h ($status -ceq 'Unresolved')
		if ($status -ceq 'Unresolved') { $unresolved = $true }
		if ($status -ceq 'Supported') { $supported = $true }
	}
	if (($unresolved -or $blockers.Count -gt 0) -and $disposition -cne 'Blocked') { throw 'Unresolved research requires Blocked, not a completed fix or no-change claim.' }
	if ($disposition -ceq 'Blocked' -and $blockers.Count -eq 0) { throw 'Blocked requires directly validated blockers.' }
	if ($disposition -ceq 'Blocked' -and $scope -cnotin @('ExternalDependency','AlarmOnly')) { throw 'Blocked permits only an external dependency or independently supported alarm-only recommendation.' }
	if ($scope -ceq 'AlarmOnly' -and -not $supported) { throw 'AlarmOnly requires an independently supported hypothesis for the logging change.' }
	if ($disposition -cin @('FixIdentified','FixVerified') -and -not $supported) { throw 'A fix requires a supported hypothesis.' }
	if ($disposition -ceq 'NoChangeNeeded' -and $scope -cne 'NoChange') { throw 'NoChangeNeeded requires NoChange scope.' }
	if ($disposition -ceq 'NoChangeNeeded' -and -not $supported) { throw 'NoChangeNeeded requires an evidence-supported explanation of expected behavior.' }
	if ($disposition -cin @('FixIdentified','FixVerified') -and $scope -cin @('NoChange','ExternalDependency')) { throw 'Fix disposition requires FailureRepair or AlarmOnly scope.' }
	if ($scope -ceq 'ExternalDependency' -and $disposition -cne 'Blocked') { throw 'ExternalDependency requires Blocked disposition.' }
	$verification = Items $c 'Verification'
	foreach ($v in $verification) {
		$null = Choice $v 'Area' @('OriginalFailure','ProtectedBehavior','Runtime')
		$null = Choice $v 'Status' @('Passed','Proposed')
		$null = Text $v 'Result'; Evidence $v
	}
	if ($disposition -ceq 'FixVerified') {
		foreach ($area in @('OriginalFailure','ProtectedBehavior','Runtime')) {
			if (@($verification | Where-Object { $_.Area -ceq $area -and $_.Status -ceq 'Passed' }).Count -eq 0) { throw "FixVerified requires actual passed $area acceptance." }
		}
	}
}
