(function (global) {
	const collectorArtifacts = [
		{ Key: "traffic-properties", Label: "Traffic Properties", Path: "data-stream/traffic-properties.json", PromptName: "traffic-collector" },
		{ Key: "google-ads", Label: "Google Ads", Path: "data-stream/google-ads.json", PromptName: "google-ads-collector" },
		{ Key: "linkedin", Label: "LinkedIn", Path: "data-stream/linkedin-analytics.json", PromptName: "linkedin-collector" },
		{ Key: "openai-usage", Label: "OpenAI Usage", Path: "data-stream/openai-usage.json", PromptName: "openai-usage-collector" }
	];

	function qs(name) {
		return new URLSearchParams(global.location.search).get(name) || "";
	}

	function getRunId() {
		const input = document.getElementById("runId");
		return input && input.value ? input.value.trim() : qs("runId").trim();
	}

	function setRunIdFromQuery() {
		const input = document.getElementById("runId");
		if (input && qs("runId"))
			input.value = qs("runId");
	}

	async function fetchJson(url) {
		const response = await fetch(url, { credentials: "same-origin" });
		if (!response.ok)
			throw new Error("Request failed " + response.status + " for " + url);
		return await response.json();
	}

	async function fetchText(url) {
		const response = await fetch(url, { credentials: "same-origin" });
		if (!response.ok)
			throw new Error("Request failed " + response.status + " for " + url);
		return await response.text();
	}

	function badge(status) {
		const value = status || "missing";
		return '<span class="ta-badge ta-badge-' + escapeHtml(value) + '">' + escapeHtml(value) + '</span>';
	}

	function escapeHtml(value) {
		return String(value ?? "").replace(/[&<>"]/g, function (character) {
			return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[character];
		});
	}

	function renderJson(element, value) {
		element.textContent = JSON.stringify(value, null, 2);
	}

	async function loadRunState(runId) {
		return await fetchJson("/api/traffic-analysis/runs/" + encodeURIComponent(runId));
	}

	async function loadArtifact(runId, artifactName) {
		return await fetchText("/api/traffic-analysis/runs/" + encodeURIComponent(runId) + "/artifacts/" + artifactName);
	}

	async function loadCurrentPrompt(promptName) {
		return await fetchJson("/api/traffic-analysis/prompts/" + encodeURIComponent(promptName));
	}

	async function initializeDashboard() {
		setRunIdFromQuery();
		document.getElementById("loadDashboard").addEventListener("click", load);
		if (getRunId())
			await load();

		async function load() {
			const runId = getRunId();
			if (!runId)
				return;
			const state = await loadRunState(runId);
			renderJson(document.getElementById("runState"), state);
			document.getElementById("summaryGrid").innerHTML = [
				'<article class="ta-card"><h2>Run</h2><p>' + escapeHtml(state.RunId || runId) + '</p>' + badge(state.State) + '</article>',
				'<article class="ta-card"><h2>Timeframe</h2><p>' + escapeHtml(state.Timeframe || "unknown") + '</p></article>',
				'<article class="ta-card"><h2>Service</h2><p>' + escapeHtml(state.ServiceBinding || "unknown") + '</p></article>',
				'<article class="ta-card"><h2>Cancel Requested</h2><p>' + escapeHtml(Boolean(state.CancelRequested)) + '</p></article>'
			].join("");
		}
	}

	async function initializeCollectors() {
		setRunIdFromQuery();
		document.getElementById("loadCollectors").addEventListener("click", load);
		if (getRunId())
			await load();

		async function load() {
			const runId = getRunId();
			const cards = [];
			for (const collector of collectorArtifacts) {
				try {
					const text = await loadArtifact(runId, collector.Path);
					const parsed = JSON.parse(text);
					cards.push('<article class="ta-card"><h2>' + escapeHtml(collector.Label) + '</h2>' + badge(parsed.status) + '<p>' + escapeHtml(parsed.analysis && parsed.analysis.summary || "") + '</p><pre class="ta-pre">' + escapeHtml(JSON.stringify(parsed, null, 2)) + '</pre></article>');
				} catch (err) {
					cards.push('<article class="ta-card"><h2>' + escapeHtml(collector.Label) + '</h2>' + badge("missing") + '<p class="ta-error">' + escapeHtml(err.message) + '</p></article>');
				}
			}
			document.getElementById("collectorCards").innerHTML = cards.join("");
		}
	}

	async function initializePrompts() {
		setRunIdFromQuery();
		document.getElementById("loadPrompts").addEventListener("click", load);
		if (getRunId())
			await load();

		async function load() {
			const runId = getRunId();
			const artifacts = collectorArtifacts.concat([{ Key: "aggregator", Label: "Aggregator", Path: "artifacts/traffic-summary.json", PromptName: "aggregator" }]);
			const cards = [];
			for (const artifact of artifacts) {
				try {
					const parsed = JSON.parse(await loadArtifact(runId, artifact.Path));
					const provenance = parsed.promptProvenance || {};
					const current = await loadCurrentPrompt(artifact.PromptName);
					const savedHash = provenance.promptHash || "missing";
					const currentHash = current.PromptHash || current.promptHash || "missing";
					const status = savedHash === currentHash ? "ok" : "partial";
					cards.push('<article class="ta-card"><h2>' + escapeHtml(artifact.Label) + '</h2>' + badge(status) + '<p><strong>Run file:</strong> ' + escapeHtml(provenance.promptFile || "missing") + '</p><p><strong>Run hash:</strong> ' + escapeHtml(savedHash) + '</p><p><strong>Current hash:</strong> ' + escapeHtml(currentHash) + '</p><h3>Run prompt text</h3><pre class="ta-pre">' + escapeHtml(provenance.promptText || "No prompt text saved.") + '</pre><h3>Current prompt text</h3><pre class="ta-pre">' + escapeHtml(current.PromptText || current.promptText || "No current prompt text available.") + '</pre></article>');
				} catch (err) {
					cards.push('<article class="ta-card"><h2>' + escapeHtml(artifact.Label) + '</h2>' + badge("missing") + '<p class="ta-error">' + escapeHtml(err.message) + '</p></article>');
				}
			}
			document.getElementById("promptCards").innerHTML = cards.join("");
		}
	}

	async function initializeEmailPreview() {
		setRunIdFromQuery();
		document.getElementById("loadEmail").addEventListener("click", load);
		document.getElementById("downloadEmail").addEventListener("click", download);
		if (getRunId())
			await load();

		async function load() {
			const runId = getRunId();
			const html = await loadArtifact(runId, "artifacts/traffic-summary-email.html");
			document.getElementById("emailFrame").srcdoc = html;
		}

		async function download() {
			const runId = getRunId();
			const html = await loadArtifact(runId, "artifacts/traffic-summary-email.html");
			const blob = new Blob([html], { type: "text/html;charset=utf-8" });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = "traffic-summary-email-" + runId + ".html";
			document.body.appendChild(link);
			link.click();
			link.remove();
			URL.revokeObjectURL(url);
		}
	}

	function initializeRun() {
		let activeRunId = "";
		let pollTimer = 0;
		document.getElementById("startRun").addEventListener("click", startRun);
		document.getElementById("cancelRun").addEventListener("click", cancelRun);

		async function startRun() {
			const request = {
				ParentSessionKey: document.getElementById("parentSessionKey").value.trim(),
				Timeframe: document.getElementById("timeframe").value,
				ServiceBinding: document.getElementById("serviceBinding").value
			};
			const response = await fetch("/api/traffic-analysis/runs", {
				method: "POST",
				credentials: "same-origin",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(request)
			});
			if (!response.ok)
				throw new Error(await response.text());
			const state = await response.json();
			activeRunId = state.RunId;
			renderJson(document.getElementById("runState"), state);
			pollTimer = global.setInterval(poll, 3000);
		}

		async function poll() {
			if (!activeRunId)
				return;
			const state = await loadRunState(activeRunId);
			renderJson(document.getElementById("runState"), state);
			if (["done", "failed", "cancelled"].includes(String(state.State).toLowerCase()))
				global.clearInterval(pollTimer);
		}

		async function cancelRun() {
			if (!activeRunId)
				return;
			const response = await fetch("/api/traffic-analysis/runs/" + encodeURIComponent(activeRunId) + "/cancel", { method: "POST", credentials: "same-origin" });
			if (!response.ok)
				throw new Error(await response.text());
			renderJson(document.getElementById("runState"), await response.json());
		}
	}

	global.TrafficAnalysisPage = {
		initializeDashboard,
		initializeCollectors,
		initializePrompts,
		initializeEmailPreview,
		initializeRun
	};
})(window);
