window.CodeReviewsAgentBridge = (function () {
	var pendingKey = "Buffaly.CodeReviews.PendingReviews";
	var targetSettings = null;
	function query(name) { return new URLSearchParams(window.location.search || "").get(name) || ""; }
	function text(value) { return value === null || value === undefined ? "" : String(value); }
	function normalizeEnvironment(value) { return /^staging$/i.test(value || "") ? "Staging" : "Dev"; }
	function resolveEnvironment() {
		var environment = query("buffalyEnvironment") || query("agentEnvironment");
		if (environment) {
			localStorage.setItem("Buffaly.CodeReviews.AgentEnvironment", normalizeEnvironment(environment));
			return normalizeEnvironment(environment);
		}
		return normalizeEnvironment(localStorage.getItem("Buffaly.CodeReviews.AgentEnvironment") || "Dev");
	}
	function resolveSessionKey() {
		var sessionKey = query("sourceSessionKey") || query("sessionKey") || query("agentSessionKey");
		if (sessionKey) {
			localStorage.setItem("Buffaly.CodeReviews.SessionKey", sessionKey);
			return sessionKey;
		}
		return localStorage.getItem("Buffaly.CodeReviews.SessionKey") || "";
	}
	function getConfig() {
		var environment = resolveEnvironment();
		var sessionKey = resolveSessionKey();
		return { Environment: environment, SessionKey: sessionKey, IsConnected: !!sessionKey };
	}
	function configure(environment, sessionKey) {
		localStorage.setItem("Buffaly.CodeReviews.AgentEnvironment", normalizeEnvironment(environment));
		if (sessionKey) localStorage.setItem("Buffaly.CodeReviews.SessionKey", sessionKey);
		else localStorage.removeItem("Buffaly.CodeReviews.SessionKey");
		return getConfig();
	}
	async function loadTargetSettings() {
		targetSettings = await CodeReviewsHarnessJsonWsService.GetAgentTargetSettingsAsync({});
		return targetSettings;
	}
	function getTargetSettings() { return targetSettings; }
	async function loadRecentSessions(environment) {
		environment = normalizeEnvironment(environment || getConfig().Environment);
		return await CodeReviewsHarnessJsonWsService.GetRecentAgentSessionsAsync({ Environment: environment, Count: 50, Skip: 0 });
	}
	function annotationLineLabel(item) {
		var startLine = Number(item && item.StartLine || 0);
		var endLine = Number(item && item.EndLine || startLine);
		if (startLine > 0 && endLine > 0 && startLine !== endLine) return "lines " + startLine + "-" + endLine;
		if (startLine > 0) return "line " + startLine;
		return "selected lines not captured";
	}
	function buildAnnotationDetails(review, comments) {
		if (!comments.length) return ["No review annotations were included."];
		var lines = ["Review annotations:"];
		for (var i = 0; i < comments.length; i++) {
			var item = comments[i] || {};
			lines.push("");
			lines.push("Annotation " + (i + 1) + ":");
			lines.push("- Commit: " + text(item.CommitSha || review.CommitSha || "worktree"));
			lines.push("- Relative path: " + text(item.FilePath));
			lines.push("- Full path: " + text(item.FullFilePath || item.FullPath || item.AbsolutePath || item.FilePath));
			lines.push("- Selection: " + annotationLineLabel(item));
			lines.push("- Origin: " + text(item.Origin || "diff"));
			lines.push("- Note: " + text(item.Note));
			lines.push("- Selected text:");
			lines.push("```text");
			lines.push(text(item.SelectedText || "No selected text captured."));
			lines.push("```");
		}
		return lines;
	}
	function buildInstruction(review) {
		var comments = review.Annotations || [];
		var lines = [
			"Code review feedback received from the CodeReviews web module.",
			"",
			"Repository: " + text(review.RepositoryName),
			"Path: " + text(review.RepositoryPath),
			"Target: " + text(review.Mode),
			"Commit: " + text(review.CommitSha || "worktree"),
			"Branch: " + text(review.Branch),
			"",
			"Summary:",
			"- " + Number(review.FilesChanged || 0) + " files changed",
			"- +" + Number(review.AddedLines || 0) + " -" + Number(review.RemovedLines || 0) + " lines",
			"- " + comments.length + " review annotations",
			""
		];
		lines = lines.concat(buildAnnotationDetails(review, comments));
		lines = lines.concat([
			"",
			"Please review these annotations and decide what needs to be changed.",
			"Structured review payload is available in UserState.CodeReviewFeedback."
		]);
		return lines.join("\n");
	}
	function buildQueuePayload(review, sessionKey) {
		return {
			sessionKey: sessionKey,
			input: {
				Instruction: buildInstruction(review),
				PromptContext: "CodingContext",
				MessageKey: "code-review:" + Date.now().toString(36),
				UserState: { CodeReviewFeedback: review },
				Images: [],
				Files: []
			}
		};
	}
	function loadPendingReviews() {
		try { return JSON.parse(localStorage.getItem(pendingKey) || "[]") || []; } catch (_) { return []; }
	}
	function savePendingReviews(rows) { localStorage.setItem(pendingKey, JSON.stringify(rows || [])); }
	function getPendingReviewCount() { return loadPendingReviews().length; }
	function savePendingReview(review, config, error) {
		var rows = loadPendingReviews();
		rows.push({
			SavedUtc: new Date().toISOString(),
			Environment: config && config.Environment ? normalizeEnvironment(config.Environment) : getConfig().Environment,
			SessionKey: config && config.SessionKey ? config.SessionKey : getConfig().SessionKey,
			Review: review,
			LastError: text(error && error.message || error)
		});
		savePendingReviews(rows);
	}
	async function sendReviewFeedback(review) {
		var config = getConfig();
		if (!config.IsConnected) {
			savePendingReview(review, config, "No session key configured.");
			return { Connected: false, Message: "Review saved locally. Configure a Buffaly session key to send it." };
		}
		var payload = buildQueuePayload(review, config.SessionKey);
		try {
			var result = await CodeReviewsHarnessJsonWsService.QueueAgentInputAsync({ Environment: config.Environment, SessionKey: payload.sessionKey, Input: payload.input });
			return { Connected: true, Message: "Review queued to Buffaly session.", Result: result };
		} catch (error) {
			savePendingReview(review, config, error);
			throw error;
		}
	}
	async function sendPendingReviews() {
		var rows = loadPendingReviews();
		var remaining = [];
		var sent = 0;
		for (var i = 0; i < rows.length; i++) {
			var row = rows[i] || {};
			var config = getConfig();
			if (row.Environment) config.Environment = normalizeEnvironment(row.Environment);
			if (row.SessionKey) config.SessionKey = row.SessionKey;
			if (!config.SessionKey) { remaining.push(row); continue; }
			try {
				var payload = buildQueuePayload(row.Review || {}, config.SessionKey);
				await CodeReviewsHarnessJsonWsService.QueueAgentInputAsync({ Environment: config.Environment, SessionKey: payload.sessionKey, Input: payload.input });
				sent++;
			} catch (error) {
				row.LastError = text(error && error.message || error);
				remaining.push(row);
			}
		}
		savePendingReviews(remaining);
		return { Sent: sent, Remaining: remaining.length, Message: "Sent " + sent + " pending review" + (sent === 1 ? "" : "s") + "; " + remaining.length + " remaining." };
	}
	return { getConfig: getConfig, configure: configure, loadRecentSessions: loadRecentSessions, loadTargetSettings: loadTargetSettings, getTargetSettings: getTargetSettings, sendReviewFeedback: sendReviewFeedback, sendPendingReviews: sendPendingReviews, getPendingReviewCount: getPendingReviewCount, normalizeEnvironment: normalizeEnvironment };
})();
