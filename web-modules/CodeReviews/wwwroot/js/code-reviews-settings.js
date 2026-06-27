(function () {
	var C = window.CodeReviews;
	var state = { targets: [] };

	function normalizeTargets(response) {
		return (response && (response.Targets || response.targets)) || [];
	}

	function targetName(target) { return target.DisplayName || target.displayName || target.Environment || target.environment || "Target"; }
	function targetEnvironment(target) { return target.Environment || target.environment || ""; }
	function targetBaseUrl(target) { return target.BaseUrl || target.baseUrl || ""; }
	function targetNotes(target) { return target.Notes || target.notes || ""; }

	function renderTargets() {
		var host = C.byId("agentTargetList");
		if (!state.targets.length) {
			host.className = "agent-target-list empty";
			host.textContent = "No targets returned.";
			return;
		}

		host.className = "agent-target-list";
		host.innerHTML = state.targets.map(function (target, index) {
			return '<div class="agent-target-card" data-target-index="' + index + '">' +
				'<div><strong>' + C.escapeHtml(targetName(target)) + '</strong><span>' + C.escapeHtml(targetEnvironment(target)) + '</span></div>' +
				'<label><span>Base URL</span><input data-target-field="BaseUrl" value="' + C.escapeHtml(targetBaseUrl(target)) + '" placeholder="http://matt.local:58177/"></label>' +
				'<label><span>Notes</span><input data-target-field="Notes" value="' + C.escapeHtml(targetNotes(target)) + '" placeholder="What this endpoint points at"></label>' +
				'</div>';
		}).join("");
	}

	async function loadTargets() {
		C.log("Loading agent targets...");
		try {
			var response = await CodeReviewsHarnessJsonWsService.GetAgentTargetSettingsAsync({});
			state.targets = normalizeTargets(response);
			renderTargets();
			C.log("Loaded " + state.targets.length + " agent target" + (state.targets.length === 1 ? "" : "s") + ".");
		} catch (error) {
			C.log("Failed to load agent targets: " + (error && error.message ? error.message : error));
			throw error;
		}
	}

	function collectTargets() {
		document.querySelectorAll(".agent-target-card").forEach(function (card) {
			var index = Number(card.getAttribute("data-target-index"));
			var target = state.targets[index];
			if (!target) return;
			card.querySelectorAll("[data-target-field]").forEach(function (input) {
				target[input.getAttribute("data-target-field")] = input.value;
			});
		});
		return state.targets;
	}

	async function saveTargets() {
		C.log("Saving agent targets...");
		try {
			var response = await CodeReviewsHarnessJsonWsService.SaveAgentTargetSettingsAsync({ Targets: collectTargets() });
			state.targets = normalizeTargets(response);
			renderTargets();
			C.log("Saved agent targets.");
		} catch (error) {
			C.log("Failed to save agent targets: " + (error && error.message ? error.message : error));
			throw error;
		}
	}

	C.byId("reloadTargetsButton").addEventListener("click", loadTargets);
	C.byId("saveTargetsButton").addEventListener("click", saveTargets);
	loadTargets();
})();
