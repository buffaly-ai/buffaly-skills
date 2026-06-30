(function () {
	var C = window.CodeReviews;
	var Bridge = window.CodeReviewsAgentBridge;
	var repo = C.decode(C.query("repo"));
	var path = C.normalizePath(C.decode(C.query("path")));
	var sha = C.decode(C.query("sha"));
	var mode = C.query("mode") === "worktree" ? "worktree" : "commit";
	var selectedBranch = C.decode(C.query("branch"));
	var sourceSessionKey = C.decode(C.query("sourceSessionKey"));
	var state = { snapshot: null, files: [], editors: {}, annotations: [], editTarget: null, selectedTarget: null, fullFilePaths: {}, reviewed: false, agentReview: null, agentReviewLoading: false, agentReviewError: "", codeReviewAgentTrigger: { running: false, childSessionKey: "", message: "", error: "" } };
	function contextLines() { var value = C.byId("contextSelect").value; return value === "full" ? 200000 : Number(value || 5); }
	function total(files, property) { return files.reduce(function (sum, file) { return sum + Number(file[property] || 0); }, 0); }
	function sortFiles(files) { return files.slice().sort(function (a, b) { return (a.IsBinary === b.IsBinary) ? C.text(a.Path).localeCompare(C.text(b.Path)) : (a.IsBinary ? 1 : -1); }); }
	function normalizeSha(value) { return C.text(value).trim().toLowerCase(); }
	function shaMatches(left, right) {
		var a = normalizeSha(left);
		var b = normalizeSha(right);
		return !!(a && b && (a === b || a.indexOf(b) === 0 || b.indexOf(a) === 0));
	}
	function scopeKey() { return "Buffaly.CodeReviews.Annotations:" + [repo, path, mode, sha || "worktree"].join("|"); }
	function annotationKey(item) { return [item.FilePath, item.Origin || "diff", item.StartLine, item.EndLine].join("|"); }
	function loadAnnotations() { try { state.annotations = JSON.parse(localStorage.getItem(scopeKey()) || "[]") || []; } catch (_) { state.annotations = []; } }
	function saveAnnotations() { localStorage.setItem(scopeKey(), JSON.stringify(state.annotations)); renderAnnotationSummary(); }
	function annotationsForFile(filePath) { return state.annotations.filter(function (x) { return x.FilePath === filePath; }).sort(function (a, b) { return a.StartLine - b.StartLine || a.EndLine - b.EndLine; }); }
	function buildId() { return "crn_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8); }
	function upsertAnnotation(target, note) {
		var now = new Date().toISOString();
		var item = { Id: target.Id || buildId(), FilePath: target.FilePath, StartLine: target.StartLine, EndLine: target.EndLine, Origin: target.Origin || "diff", SelectedText: target.SelectedText || "", Note: note.trim(), CreatedUtc: target.CreatedUtc || now, UpdatedUtc: now, SentUtc: target.SentUtc || "" };
		var key = annotationKey(item);
		state.annotations = state.annotations.filter(function (x) { return annotationKey(x) !== key; });
		if (item.Note) state.annotations.push(item);
		saveAnnotations();
		renderFileAnnotations(item.FilePath);
	}
	function removeAnnotation(id) {
		var removed = state.annotations.find(function (x) { return x.Id === id; });
		state.annotations = state.annotations.filter(function (x) { return x.Id !== id; });
		saveAnnotations();
		if (removed) renderFileAnnotations(removed.FilePath);
	}
	function lineLabel(item) { return item.StartLine === item.EndLine ? "line " + item.StartLine : "lines " + item.StartLine + "-" + item.EndLine; }
	function renderSummary(snapshot, files) {
		var added = total(files, "AddedLines");
		var removed = total(files, "RemovedLines");
		C.byId("diffSummary").textContent = files.length + " files changed | +" + added + " -" + removed + " lines on " + (snapshot.Branch || "detached");
		return '<div class="diff-overview"><div><strong>' + files.length + '</strong><span>files changed</span></div><div class="add"><strong>+' + added + '</strong><span>added</span></div><div class="remove"><strong>-' + removed + '</strong><span>removed</span></div><div><strong>' + files.filter(function (file) { return file.IsBinary; }).length + '</strong><span>binary</span></div></div>';
	}
	function renderFileAnnotations(filePath) {
		markAnnotationOverlays(filePath);
	}
	function renderAnnotationSummary() {
		var node = C.byId("annotationSummary");
		if (node) node.textContent = state.annotations.length + " pending note" + (state.annotations.length === 1 ? "" : "s");
	}
	function reviewedBadgeHtml(reviewed) {
		return reviewed ? '<span class="reviewed-badge reviewed">Reviewed</span>' : '<span class="reviewed-badge unreviewed">Unreviewed</span>';
	}
	function currentCommitSha() {
		return C.text((state.snapshot && state.snapshot.CommitSha) || sha).trim();
	}
	function agentReviewStatus(record) {
		return C.text(record && (record.Status || record.status) || "NotReviewed");
	}
	function agentReviewStatusLabel(status) {
		if (status === "NotReviewed") return "Not reviewed";
		return status || "Not reviewed";
	}
	function agentReviewBadgeClass(status) {
		if (status === "Reviewed") return "reviewed";
		if (status === "Running") return "agent-running";
		if (status === "Failed") return "agent-failed";
		return "unreviewed";
	}
	function agentReviewEnvironment() {
		var config = Bridge.getConfig ? Bridge.getConfig() : { Environment: "Dev" };
		return Bridge.normalizeEnvironment ? Bridge.normalizeEnvironment(config.Environment || "Dev") : (config.Environment || "Dev");
	}
	function renderAgentReviewPanel() {
		var panel = C.byId("agentReviewPanel");
		if (!panel) return;
		panel.classList.toggle("hidden", mode !== "commit");
		var statusNode = C.byId("agentReviewStatus");
		var metaNode = C.byId("agentReviewMeta");
		var bodyNode = C.byId("agentReviewBody");
		var submitButton = C.byId("agentReviewSubmitButton");
		if (mode !== "commit") {
			if (statusNode) statusNode.textContent = "Agent review is available for committed diffs only.";
			if (submitButton) submitButton.disabled = true;
			return;
		}
		if (submitButton) submitButton.disabled = state.agentReviewLoading || !currentCommitSha();
		if (state.agentReviewLoading) {
			if (statusNode) statusNode.textContent = "Loading agent review status...";
			return;
		}
		if (state.agentReviewError) {
			if (statusNode) statusNode.textContent = "Agent review load failed: " + state.agentReviewError;
			return;
		}
		var record = state.agentReview || {};
		var status = agentReviewStatus(record);
		var rawText = C.text(record.RawReviewText || record.rawReviewText);
		var childSessionKey = C.text(record.ChildSessionKey || record.childSessionKey);
		var sourceSession = C.text(record.SourceSessionKey || record.sourceSessionKey);
		var reviewedUtc = record.ReviewedUtc || record.reviewedUtc;
		var failedReason = C.text(record.FailureReason || record.failureReason);
		if (statusNode) statusNode.innerHTML = '<span class="reviewed-badge ' + agentReviewBadgeClass(status) + '">Agent: ' + C.escapeHtml(agentReviewStatusLabel(status)) + '</span>' + (reviewedUtc ? ' <span>' + C.escapeHtml(C.formatWhen(reviewedUtc)) + '</span>' : '') + (failedReason ? ' <span>' + C.escapeHtml(failedReason) + '</span>' : '');
		if (metaNode) {
			var meta = [];
			if (childSessionKey) meta.push("Child: " + childSessionKey);
			if (sourceSession) meta.push("Source: " + sourceSession);
			if (record.Provider || record.provider || record.ModelName || record.modelName) meta.push(C.text(record.Provider || record.provider) + " / " + C.text(record.ModelName || record.modelName));
			metaNode.innerHTML = meta.map(function (item) { return '<span>' + C.escapeHtml(item) + '</span>'; }).join("");
		}
		if (bodyNode) bodyNode.textContent = rawText || "No agent review text submitted.";
	}
	function loadAgentReview() {
		if (mode !== "commit" || !path || !currentCommitSha()) { renderAgentReviewPanel(); return Promise.resolve(null); }
		state.agentReviewLoading = true;
		state.agentReviewError = "";
		renderAgentReviewPanel();
		return C.call("GetCommitReview", { RepositoryPath: path, CommitSha: currentCommitSha() })
			.then(function (response) {
				state.agentReview = response.Record || null;
				if (agentReviewStatus(state.agentReview) === "Running") return syncAgentReview();
				return null;
			})
			.catch(function (error) { state.agentReviewError = C.errorMessage(error); })
			.then(function () { state.agentReviewLoading = false; renderAgentReviewPanel(); });
	}
	function syncAgentReview() {
		return C.call("SyncCommitReview", { Environment: agentReviewEnvironment(), RepositoryPath: path, CommitSha: currentCommitSha(), SourceSessionKey: sourceSessionKey, ChildSessionKey: C.text(state.agentReview && state.agentReview.ChildSessionKey) })
			.then(function (response) { state.agentReview = response.Record || state.agentReview; return response; });
	}
	function submitCommitReviewText() {
		var text = C.text(C.byId("agentReviewText").value).trim();
		if (!text) { C.log("Paste review text before submitting."); return; }
		var button = C.byId("agentReviewSubmitButton");
		if (button) { button.disabled = true; button.textContent = "Submitting..."; }
		return C.call("SubmitCommitReviewText", { Environment: agentReviewEnvironment(), RepositoryPath: path, CommitSha: currentCommitSha(), ReviewText: text, SourceSessionKey: sourceSessionKey, ChildSessionKey: C.text(state.agentReview && state.agentReview.ChildSessionKey) })
			.then(function (response) {
				state.agentReview = response.Record || response.record || null;
				C.byId("agentReviewText").value = "";
				C.log("Agent review text submitted.");
			})
			.catch(function (error) { C.log("Agent review text submit failed: " + C.errorMessage(error)); })
			.then(function () { if (button) { button.disabled = false; button.textContent = "Submit review text"; } renderAgentReviewPanel(); });
	}
	function updateReviewStatusSummary() {
		var node = C.byId("reviewStatusSummary");
		if (node) node.innerHTML = reviewedBadgeHtml(state.reviewed);
		var button = C.byId("reviewToggleButton");
		if (button) {
			var isSaving = button.classList.contains("saving");
			button.classList.toggle("reviewed", state.reviewed);
			button.classList.toggle("unreviewed", !state.reviewed);
			button.setAttribute("aria-pressed", state.reviewed ? "true" : "false");
			button.innerHTML = '<span aria-hidden="true">' + (isSaving ? '&#8987;' : (state.reviewed ? '&#10003;' : '&#9675;')) + '</span><span>' + (isSaving ? 'Saving...' : (state.reviewed ? 'Reviewed' : 'Unreviewed')) + '</span>';
			button.title = state.reviewed ? "Mark commit as unreviewed" : "Mark commit as reviewed";
		}
	}
	function setCurrentReviewed(reviewed) {
		if (!sha) return Promise.resolve(null);
		var previous = state.reviewed;
		var button = C.byId("reviewToggleButton");
		state.reviewed = reviewed;
		if (button) { button.disabled = true; button.classList.add("saving"); }
		updateReviewStatusSummary();
		return C.call("SetCheckInReviewed", { RepositoryPath: path, Sha: sha, Reviewed: reviewed })
			.then(function () { C.log(reviewed ? "Marked reviewed." : "Marked unreviewed."); })
			.catch(function (error) { state.reviewed = previous; C.log("Review status update failed: " + C.errorMessage(error)); })
			.then(function () { if (button) { button.disabled = false; button.classList.remove("saving"); } updateReviewStatusSummary(); });
	}
	function setSendStatus(message, stateName) {
		var node = C.byId("sendAnnotationsStatus");
		if (!node) return;
		node.textContent = message || "";
		node.className = "send-annotations-status" + (stateName ? " " + stateName : "");
	}
	function renderAllAnnotations() { state.files.forEach(function (file) { renderFileAnnotations(file.Path); }); renderAnnotationSummary(); }
	function updatePendingReviewButton() {
		var button = C.byId("sendAnnotationsButton");
		if (!button) return;
		var pendingCount = Bridge.getPendingReviewCount ? Bridge.getPendingReviewCount() : 0;
		button.textContent = pendingCount > 0 ? "Send notes (" + pendingCount + " pending)" : "Send notes";
	}
	function setCodeReviewAgentStatus(message, stateName) {
		var node = C.byId("codeReviewAgentStatus");
		if (node) {
			node.textContent = message || "";
			node.className = "code-review-agent-status" + (stateName ? " " + stateName : "");
		}
		var button = C.byId("runCodeReviewAgentButton");
		if (button) button.disabled = state.codeReviewAgentTrigger.running || mode !== "commit";
	}
	function buildCodeReviewAgentRequest() {
		if (mode !== "commit") throw new Error("Code Review Agent can only review committed diffs.");
		if (!sourceSessionKey) throw new Error("sourceSessionKey is required. Open this diff from a session commit link before running agent review.");
		if (!path || !sha) throw new Error("repository path and commit SHA are required.");
		return { Environment: "Dev", SourceSessionKey: sourceSessionKey, RepositoryName: repo, RepositoryPath: path, CommitSha: sha, CodeReviewUrl: window.location.pathname + window.location.search, ReviewMode: "Manual" };
	}
	function triggerCodeReviewAgent() {
		var request;
		try { request = buildCodeReviewAgentRequest(); }
		catch (error) { setCodeReviewAgentStatus(error.message || String(error), "error"); C.log(error.message || String(error)); return; }
		state.codeReviewAgentTrigger.running = true;
		setCodeReviewAgentStatus("Starting Code Review Agent...", "pending");
		C.call("TriggerCodeReviewAgent", request)
			.then(function (response) {
				state.codeReviewAgentTrigger.childSessionKey = C.text(response.ChildSessionKey || response.childSessionKey);
				state.codeReviewAgentTrigger.message = C.text(response.Message || response.message || "Code review started.");
				state.agentReview = response.CommitReview || response.commitReview || state.agentReview;
				renderAgentReviewPanel();
				setCodeReviewAgentStatus(state.codeReviewAgentTrigger.message + (state.codeReviewAgentTrigger.childSessionKey ? " Child: " + state.codeReviewAgentTrigger.childSessionKey : ""), "sent");
				C.log(state.codeReviewAgentTrigger.message);
			})
			.catch(function (error) {
				state.codeReviewAgentTrigger.error = C.errorMessage(error);
				setCodeReviewAgentStatus("Code review trigger failed: " + state.codeReviewAgentTrigger.error, "error");
				C.log("Code review trigger failed: " + state.codeReviewAgentTrigger.error);
			})
			.then(function () { state.codeReviewAgentTrigger.running = false; setCodeReviewAgentStatus(C.byId("codeReviewAgentStatus") ? C.byId("codeReviewAgentStatus").textContent : "", state.codeReviewAgentTrigger.error ? "error" : "sent"); });
	}
	function setAllFilesOpen(open) {
		document.querySelectorAll("#diffFiles details.diff-file").forEach(function (details) { details.open = open; details.classList.toggle("collapsed-by-toolbar", !open); });
	}
	function isBinaryLikeFile(file) {
		if (!file) return false;
		if (file.IsBinary === true || file.isBinary === true) return true;
		var filePath = C.text(file.Path || file.path).toLowerCase();
		return /\.(dll|exe|pdb|png|jpg|jpeg|gif|webp|ico|pdf|zip|7z|tar|gz|rar|bin|dat|sqlite|db)$/i.test(filePath);
	}
	function setBinaryFilesHidden(hidden) {
		C.byId("diffFiles").classList.toggle("hide-binary", hidden);
	}
	function checkInsUrl(commitSha) {
		var url = "diff.html?repo=" + C.encode(repo) + "&path=" + C.encode(path) + "&sha=" + C.encode(commitSha) + "&mode=commit";
		if (selectedBranch) url += "&branch=" + C.encode(selectedBranch);
		return url;
	}
	function normalizeLoadedCommit(snapshot) {
		if (mode !== "commit" || !snapshot || !snapshot.CommitSha) return;
		if (shaMatches(sha, snapshot.CommitSha)) {
			sha = C.text(snapshot.CommitSha).trim();
		}

		var current = new URL(window.location.href);
		if (current.searchParams.get("sha") !== sha) {
			current.searchParams.set("sha", sha);
			window.history.replaceState(null, "", current.toString());
		}
	}
	function populateCheckInSelect(checkIns) {
		var select = C.byId("checkInSelect");
		if (!select) return;
		state.checkIns = checkIns || [];
		var options = state.checkIns.slice();
		if (mode === "commit" && state.snapshot && sha && !options.some(function (item) { return shaMatches(item.Sha || item.sha, sha); })) {
			options.unshift({
				Sha: sha,
				ShortSha: state.snapshot.CommitShortSha || sha.substring(0, 7),
				Subject: state.snapshot.CommitSubject || "Current commit",
				Reviewed: state.reviewed
			});
		}
		select.innerHTML = options.map(function (item) {
			var reviewed = item.Reviewed === true || item.reviewed === true;
			var label = (reviewed ? "Reviewed | " : "Unreviewed | ") + C.text(item.ShortSha || item.shortSha) + " " + C.text(item.Subject || item.subject);
			var itemSha = C.text(item.Sha || item.sha);
			return '<option value="' + C.escapeHtml(itemSha) + '"' + (shaMatches(itemSha, sha) ? ' selected' : '') + '>' + C.escapeHtml(label) + '</option>';
		}).join("") || '<option value="">No check-ins found</option>';
	}
	function handleMissingCommit() {
		var redirectUrl = C.byId("checkinsLink").href;
		C.byId("diffTitle").textContent = "Commit not found";
		C.byId("diffSummary").textContent = "That commit does not exist in this local repository. Redirecting to the check-ins list...";
		C.byId("diffFiles").innerHTML = '<div class="empty">That commit does not exist. Returning to the list of commits so you can select one that exists locally.</div>';
		C.log("Commit was not found. Redirecting to check-ins list...");
		window.setTimeout(function () { window.location.href = redirectUrl; }, 1600);
	}
	function loadCheckInOptions() {
		var select = C.byId("checkInSelect");
		if (!path || mode !== "commit") { if (select) select.innerHTML = '<option value="">Current worktree</option>'; return Promise.resolve(); }
		if (select) select.innerHTML = '<option value="">Loading check-ins...</option>';
		return C.call("GetCheckIns", { RepositoryPath: path, BranchName: selectedBranch, Limit: 60 })
			.then(function (response) { populateCheckInSelect(response.CheckIns || []); })
			.catch(function (error) { if (select) select.innerHTML = '<option value="">Could not load check-ins</option>'; C.log("Check-in list load failed: " + (error.message || error)); });
	}
	function openAnnotationModal(target) {
		state.editTarget = target;
		C.byId("annotationModalTitle").textContent = target.Id ? "Edit review note" : "Add review note";
		C.byId("annotationModalPath").textContent = target.FilePath + " (" + lineLabel(target) + ")";
		C.byId("annotationModalSnippet").textContent = target.SelectedText || "No snippet captured.";
		C.byId("annotationModalText").value = target.Note || "";
		C.byId("annotationModalRemove").disabled = !target.Id;
		hideSelectionActions();
		C.byId("annotationModal").classList.remove("hidden");
		C.byId("annotationModalText").focus();
	}
	function closeAnnotationModal() { C.byId("annotationModal").classList.add("hidden"); state.editTarget = null; }
	function ensureSelectionActions() {
		var node = C.byId("selectionActionBar");
		if (node) return node;
		node = document.createElement("div");
		node.id = "selectionActionBar";
		node.className = "selection-action-bar hidden";
		node.innerHTML = '<span id="selectionActionSummary">Selection ready</span><button id="copySelectionButton" type="button">Copy</button><button id="annotateSelectionButton" type="button">Annotate</button>';
		document.body.appendChild(node);
		return node;
	}
	function hideSelectionActions() { state.selectedTarget = null; ensureSelectionActions().classList.add("hidden"); }
	function showSelectionActions(target) {
		state.selectedTarget = target;
		var node = ensureSelectionActions();
		C.byId("selectionActionSummary").textContent = lineLabel(target);
		node.classList.remove("hidden");
	}
	function updateSelectionActions(filePath) {
		var target = getSelectedTarget(filePath);
		if (!target || !target.SelectedText) { hideSelectionActions(); return; }
		showSelectionActions(target);
	}
	function handleEditorSelection(filePath, editor) {
		window.setTimeout(function () { updateSelectionActions(filePath); }, 0);
	}
	function copySelectedSnippet() {
		if (!state.selectedTarget || !state.selectedTarget.SelectedText) return;
		var text = state.selectedTarget.SelectedText;
		var copied = navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(text) : Promise.reject(new Error("Clipboard API unavailable"));
		copied.then(function () { C.log("Copied selected code to clipboard."); hideSelectionActions(); }).catch(function () { window.prompt("Copy selected code", text); });
	}
	function getSelectedTarget(filePath) {
		var editor = state.editors[filePath];
		if (!editor) return null;
		var from = editor.getCursor("from");
		var to = editor.getCursor("to");
		var selectedText = editor.getSelection();
		var startLine = lineNumberForEditorLine(editor, from.line) || (from.line + 1);
		var endLine = lineNumberForEditorLine(editor, Math.max(from.line, to.line)) || startLine;
		if (!selectedText) { selectedText = editor.getLine(from.line) || ""; endLine = startLine; }
		return { FilePath: filePath, StartLine: startLine, EndLine: endLine, Origin: "diff", SelectedText: selectedText };
	}
		function parseDiffLineNumbers(patch) {
		var oldLine = 0;
		var newLine = 0;
		return C.text(patch).split(/\r?\n/).map(function (line) {
			var hunk = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(line);
			if (hunk) { oldLine = Number(hunk[1]); newLine = Number(hunk[2]); return { OldLine: "", NewLine: "" }; }
			if (line.indexOf("diff ") === 0 || line.indexOf("index ") === 0 || line.indexOf("---") === 0 || line.indexOf("+++") === 0) return { OldLine: "", NewLine: "" };
			if (line.indexOf("+") === 0) return { OldLine: "", NewLine: String(newLine++) };
			if (line.indexOf("-") === 0) return { OldLine: String(oldLine++), NewLine: "" };
			if (oldLine || newLine) return { OldLine: String(oldLine++), NewLine: String(newLine++) };
			return { OldLine: "", NewLine: "" };
		});
	}
	function applyDiffLineGutter(editor, patch) {
		if (!editor) return;
		var rows = parseDiffLineNumbers(patch || "");
		editor.state.codeReviewLineNumbers = rows;
		editor.setOption("gutters", ["CodeMirror-linenumbers", "code-review-oldline", "code-review-newline"]);
		for (var i = 0; i < editor.lineCount(); i += 1) {
			var row = rows[i] || { OldLine: "", NewLine: "" };
			var oldMarker = document.createElement("span");
			oldMarker.className = "code-review-gutter-old";
			oldMarker.textContent = row.OldLine;
			var newMarker = document.createElement("span");
			newMarker.className = "code-review-gutter-new";
			newMarker.textContent = row.NewLine;
			editor.setGutterMarker(i, "code-review-oldline", oldMarker);
			editor.setGutterMarker(i, "code-review-newline", newMarker);
		}
	}
	function lineNumberForEditorLine(editor, editorLine) {
		var rows = editor && editor.state ? editor.state.codeReviewLineNumbers : null;
		var row = rows && rows[editorLine];
		if (!row) return 0;
		return Number(row.NewLine || row.OldLine || 0);
	}
	function editorLinesForAnnotation(editor, annotation) {
		var rows = editor && editor.state ? editor.state.codeReviewLineNumbers : null;
		var start = Number(annotation.StartLine || 0);
		var end = Number(annotation.EndLine || annotation.StartLine || 0);
		var matches = [];
		if (!rows || !start) return matches;
		for (var index = 0; index < rows.length; index += 1) {
			var row = rows[index] || {};
			var newLine = Number(row.NewLine || 0);
			var oldLine = Number(row.OldLine || 0);
			if ((newLine >= start && newLine <= end) || (!newLine && oldLine >= start && oldLine <= end)) matches.push(index);
		}
		return matches;
	}
	function markAnnotationOverlays(filePath) {
		var editor = state.editors[filePath];
		if (!editor) return;
		(editor.state.codeReviewAnnotationWidgets || []).forEach(function (widget) { widget.clear(); });
		editor.state.codeReviewAnnotationWidgets = [];
		for (var clearLine = 0; clearLine < editor.lineCount(); clearLine += 1) {
			editor.removeLineClass(clearLine, "background", "annotation-line-pending");
			editor.removeLineClass(clearLine, "background", "annotation-line-sent");
		}
		annotationsForFile(filePath).forEach(function (item) {
			var lines = editorLinesForAnnotation(editor, item);
			lines.forEach(function (line) {
				editor.addLineClass(line, "background", item.SentUtc ? "annotation-line-sent" : "annotation-line-pending");
			});
			if (lines.length) {
				var node = document.createElement("div");
				node.className = "annotation-inline-note " + (item.SentUtc ? "sent" : "pending");
				node.innerHTML = '<div><strong>' + C.escapeHtml(lineLabel(item)) + '</strong><span>' + (item.SentUtc ? 'sent' : 'not sent') + '</span></div><p>' + C.escapeHtml(item.Note) + '</p><div class="annotation-inline-actions"><button class="annotation-icon-button" type="button" data-annotation-edit="' + C.escapeHtml(item.Id) + '" title="Edit note" aria-label="Edit note">&#9998;</button><button class="annotation-icon-button danger" type="button" data-annotation-remove="' + C.escapeHtml(item.Id) + '" title="Remove note" aria-label="Remove note">&times;</button></div>';
				editor.state.codeReviewAnnotationWidgets.push(editor.addLineWidget(lines[lines.length - 1], node, { coverGutter: false, noHScroll: false }));
			}
		});
	}
	function patchForFile(snapshot, filePath) {
		var files = snapshot && snapshot.Files ? snapshot.Files : [];
		for (var i = 0; i < files.length; i += 1) {
			var candidatePath = C.text(files[i].Path || files[i].path);
			if (candidatePath === filePath) return C.text(files[i].Patch || files[i].patch);
		}
		return "";
	}
	async function toggleWholeFile(filePath) {
		var editor = state.editors[filePath];
		if (!editor) return;
		var button = document.querySelector('[data-full-file="' + CSS.escape(filePath) + '"]');
		var isFull = !!state.fullFilePaths[filePath];
		if (isFull) {
			state.fullFilePaths[filePath] = false;
			editor.setValue(patchForFile(state.snapshot, filePath));
			applyDiffLineGutter(editor, editor.getValue());
			markAnnotationOverlays(filePath);
			if (button) { button.classList.remove("selected"); button.setAttribute("aria-pressed", "false"); button.title = "Show whole file context"; }
			C.log("Collapsed whole-file context for " + filePath + ".");
			return;
		}
		if (button) { button.disabled = true; button.classList.add("loading"); }
		try {
			var response = await C.call("GetDiffSnapshot", { RepositoryPath: path, Mode: mode, CommitSha: sha, MaxFiles: 240, MaxPatchChars: 1000000, ContextLines: 200000 });
			var patch = patchForFile(response, filePath);
			if (!patch) { C.log("Whole-file context was not available for " + filePath + "."); return; }
			state.fullFilePaths[filePath] = true;
			editor.setValue(patch);
			applyDiffLineGutter(editor, patch);
			markAnnotationOverlays(filePath);
			if (button) { button.classList.add("selected"); button.setAttribute("aria-pressed", "true"); button.title = "Show selected diff context"; }
			C.log("Showing whole-file context inline for " + filePath + ".");
		} catch (error) {
			C.log("Whole-file context load failed: " + (error.message || error));
		} finally {
			if (button) { button.disabled = false; button.classList.remove("loading"); }
		}
	}
	function renderDiff(snapshot) {
		state.snapshot = snapshot;
		state.files = sortFiles(snapshot.Files || []);
		state.editors = {};
		C.byId("diffTitle").textContent = snapshot.Mode === "worktree" ? "Uncommitted worktree" : (snapshot.CommitShortSha + " " + snapshot.CommitSubject);
		state.reviewed = snapshot.Reviewed === true;
		var html = renderSummary(snapshot, state.files) + '<div class="annotation-toolbar"><div><strong id="annotationSummary">0 pending notes</strong><span id="reviewStatusSummary" class="review-status-summary">' + reviewedBadgeHtml(state.reviewed) + '</span><p id="sendAnnotationsStatus" class="send-annotations-status" role="status" aria-live="polite"></p><p id="codeReviewAgentStatus" class="code-review-agent-status" role="status" aria-live="polite"></p></div><span class="annotation-toolbar-actions"><button id="reviewToggleButton" class="review-toggle" type="button" aria-pressed="' + (state.reviewed ? 'true' : 'false') + '"><span aria-hidden="true">' + (state.reviewed ? '&#10003;' : '&#9675;') + '</span><span>' + (state.reviewed ? 'Reviewed' : 'Unreviewed') + '</span></button><button id="sendAnnotationsButton" type="button">Send notes</button><button id="runCodeReviewAgentButton" type="button">Run Code Review Agent</button></span></div>' + (state.files.map(function (file) {
			var isBinary = isBinaryLikeFile(file);
			var patch = isBinary ? "Binary file changed. Diff body is hidden." : C.text(file.Patch || file.patch);
			var filePath = C.text(file.Path || file.path);
			var modeName = isBinary ? "diff" : (C.codeMirrorModeForPath(filePath) || "diff");
			return '<details class="diff-file ' + (isBinary ? 'binary' : '') + '" open><summary><span class="status">' + C.escapeHtml(file.StatusCode || file.statusCode) + '</span><span class="path-wrap"><strong>' + C.escapeHtml(C.fileName(filePath)) + '</strong><em>' + C.escapeHtml(C.normalizePath(filePath)) + '</em></span><span class="stat"><span class="stat-add">+' + (file.AddedLines || file.addedLines || 0) + '</span> <span class="stat-remove">-' + (file.RemovedLines || file.removedLines || 0) + '</span></span><button class="file-header-icon icon-button" type="button" aria-pressed="false" data-full-file="' + C.escapeHtml(filePath) + '" title="Show whole file context" aria-label="Show whole file context">⇱</button></summary>' +
				(file.OriginalPath ? '<div class="rename">Renamed from ' + C.escapeHtml(C.normalizePath(file.OriginalPath)) + '</div>' : '') +
				'<textarea class="code-review-code" data-path="' + C.escapeHtml(filePath) + '" data-mode="' + C.escapeHtml(modeName) + '">' + C.escapeHtml(patch) + '</textarea></details>';
		}).join("") || '<div class="empty">No file changes.</div>');
		C.byId("diffFiles").innerHTML = html;
		C.enhanceCodeBlocks(C.byId("diffFiles"), function (textarea, editor) { var filePath = textarea.getAttribute("data-path") || ""; state.editors[filePath] = editor; applyDiffLineGutter(editor, editor.getValue()); editor.on("cursorActivity", function () { handleEditorSelection(filePath, editor); }); });
		setBinaryFilesHidden(C.byId("hideBinaryFilesToggle").checked);
		renderAgentReviewPanel();
		renderAllAnnotations(); updatePendingReviewButton(); updateConnectionSummary(); setCodeReviewAgentStatus(state.codeReviewAgentTrigger.message || state.codeReviewAgentTrigger.error, state.codeReviewAgentTrigger.error ? "error" : "");
	}
	function buildReviewPayload() {
		var files = state.files || [];
		function fullPath(filePath) {
			var normalized = C.normalizePath(filePath || "");
			var root = C.normalizePath(path || "").replace(/\/$/, "");
			return root && normalized ? root + "/" + normalized : normalized;
		}
		return { Source: "Buffaly.CodeReviews", RepositoryName: repo, RepositoryPath: path, Mode: mode, CommitSha: sha, CommitShortSha: state.snapshot ? (state.snapshot.CommitShortSha || "") : "", CommitSubject: state.snapshot ? (state.snapshot.CommitSubject || "") : "", Branch: state.snapshot ? (state.snapshot.Branch || "") : "", FilesChanged: files.length, AddedLines: total(files, "AddedLines"), RemovedLines: total(files, "RemovedLines"), Annotations: state.annotations.map(function (x) { return { FilePath: x.FilePath, FullFilePath: fullPath(x.FilePath), StartLine: x.StartLine, EndLine: x.EndLine, Origin: x.Origin, SelectedText: x.SelectedText, Note: x.Note }; }) };
	}
	function sendAnnotations() {
		var hasCurrentNotes = state.annotations.length > 0;
		var hasPendingReviews = Bridge.getPendingReviewCount && Bridge.getPendingReviewCount() > 0;
		if (!hasCurrentNotes && !hasPendingReviews) { setSendStatus("Add at least one note before sending.", "warning"); C.log("Add at least one note before sending."); return; }
		setSendStatus("Sending notes...", "pending");
		C.log("Sending notes...");
		var sendCurrent = hasCurrentNotes ? Bridge.sendReviewFeedback(buildReviewPayload()).then(function (result) {
			var now = new Date().toISOString();
			if (result.Connected) state.annotations.forEach(function (x) { x.SentUtc = now; });
			return result;
		}) : Promise.resolve(null);
		sendCurrent.then(function () {
			return hasPendingReviews && Bridge.sendPendingReviews ? Bridge.sendPendingReviews() : null;
		}).then(function (pendingResult) {
			saveAnnotations(); renderAllAnnotations(); updateConnectionSummary();
			var message = pendingResult && pendingResult.Message ? pendingResult.Message : "Notes sent to the configured Buffaly session.";
			setSendStatus(message, "sent");
			C.log(message);
		}).catch(function (error) { var message = "Send notes failed: " + (error.message || error); setSendStatus(message, "error"); C.log(message); });
	}
	function targetBaseUrlForEnvironment(environment) {
		var settings = Bridge.getTargetSettings ? Bridge.getTargetSettings() : null;
		var targets = settings && (settings.Targets || settings.targets) || [];
		var normalized = Bridge.normalizeEnvironment(environment || "Dev");
		var match = targets.find(function (target) { return C.text(target.Environment || target.environment) === normalized; });
		return match ? C.text(match.BaseUrl || match.baseUrl) : "target URL not loaded";
	}
	function buildConnectionSummaryText() {
		var config = Bridge.getConfig();
		var sessionKey = C.text(config.SessionKey).trim();
		var status = sessionKey ? "Connected" : "Not connected";
		return status + " | Environment: " + config.Environment + " | URL: " + targetBaseUrlForEnvironment(config.Environment) + " | Session: " + (sessionKey || "choose an existing loaded session");
	}
	function updateConnectionSummary() {
		var node = C.byId("connectionSummary");
		if (!node) return;
		node.textContent = buildConnectionSummaryText();
	}
	function configureSession() {
		openSessionConfigModal();
	}
	function defaultSessionKey() { return ""; }
	function openSessionConfigModal() {
		var current = Bridge.getConfig();
		selectSessionEnvironment(current.Environment, false);
		C.byId("sessionKeyInput").value = current.SessionKey || "";
		updateSessionDestinationSummary();
		C.byId("sessionConfigModal").classList.remove("hidden");
		loadRecentSessions(current.Environment);
	}
	function closeSessionConfigModal() { C.byId("sessionConfigModal").classList.add("hidden"); }
	function saveSessionConfig() {
		var select = C.byId("recentSessionsSelect");
		var sessionKey = C.text(C.byId("sessionKeyInput").value).trim();
		if (!sessionKey || !select.value || select.value !== sessionKey) { C.log("Choose an existing loaded session before saving."); return; }
		Bridge.configure(Bridge.getConfig().Environment, sessionKey);
		updateSessionDestinationSummary();
		updateConnectionSummary();
		closeSessionConfigModal();
		C.log("Session bridge configured.");
	}
	function isLevelTwoSessionKey(key) { return /(^|[-_.])level[-_.]?two$/i.test(C.text(key)); }
	function sessionKeyFromRow(session) { return session.SessionKey || session.Key || session.Name || ""; }
	function updateSessionDestinationSummary() {
		var input = C.byId("sessionKeyInput");
		var select = C.byId("recentSessionsSelect");
		var key = C.text(input.value || "").trim();
		var selectedExisting = !!(select && select.value && select.value === key);
		var label = selectedExisting ? "Using loaded session: " + key : "Choose an existing loaded session; CodeReviews cannot create new sessions.";
		var node = C.byId("sessionDestinationSummary");
		if (node) node.textContent = label;
	}
	function selectSessionEnvironment(environment, shouldLoad) {
		var normalized = Bridge.normalizeEnvironment(environment || "Dev");
		Bridge.configure(normalized, C.byId("sessionKeyInput").value || "");
		document.querySelectorAll("[data-session-env]").forEach(function (button) { button.classList.toggle("selected", button.getAttribute("data-session-env") === normalized); });
		updateSessionDestinationSummary();
		updateConnectionSummary();
		if (shouldLoad) loadRecentSessions(normalized);
	}
	function loadRecentSessions() {
		var environment = arguments.length ? arguments[0] : Bridge.getConfig().Environment;
		var select = C.byId("recentSessionsSelect");
		select.innerHTML = '<option value="">Loading recent sessions...</option>';
		Bridge.loadRecentSessions(environment).then(function (sessions) {
			var filtered = (sessions || []).map(sessionKeyFromRow).filter(function (key) { return key && !isLevelTwoSessionKey(key); });
			select.innerHTML = '<option value="">Choose an existing loaded session...</option>' + filtered.map(function (key) { return '<option value="' + C.escapeHtml(key) + '">' + C.escapeHtml(key) + '</option>'; }).join("");
			var current = Bridge.getConfig().SessionKey;
			if (current && filtered.indexOf(current) >= 0) select.value = current;
			updateSessionDestinationSummary();
			C.log("Loaded " + filtered.length + " recent sessions.");
		}).catch(function (error) { select.innerHTML = '<option value="">Could not load recent sessions</option>'; C.log("Recent sessions load failed: " + (error.message || error)); });
	}
	function loadDiff() {
		if (!path) { C.byId("diffFiles").innerHTML = '<div class="empty">Local clone not found.</div>'; return; }
		C.log("Loading diff...");
		loadAnnotations();
		return C.call("GetDiffSnapshot", { RepositoryPath: path, Mode: mode, CommitSha: sha, MaxFiles: 240, MaxPatchChars: 1000000, ContextLines: contextLines() })
			.then(function (response) { renderDiff(response); normalizeLoadedCommit(response); populateCheckInSelect(state.checkIns || []); return loadAgentReview().then(function () { C.log("Diff loaded."); }); })
			.catch(function (error) {
				var message = C.errorMessage ? C.errorMessage(error) : (error.message || error);
				if (mode === "commit" && /Commit was not found/i.test(message || "")) {
					var redirectUrl = C.byId("checkinsLink").href;
					C.byId("diffTitle").textContent = "Commit not found";
					C.byId("diffSummary").textContent = "That commit does not exist in this local repository. Redirecting to the check-ins list...";
					C.byId("diffFiles").innerHTML = '<div class="empty">That commit does not exist. Returning to the list of commits so you can select one that exists locally.</div>';
					C.log("Commit was not found. Redirecting to check-ins list...");
					window.setTimeout(function () { window.location.href = redirectUrl; }, 1600);
					return;
				}
				C.log("Diff load failed: " + message);
			});
	}
	C.byId("repoMeta").textContent = (repo || "Repository") + " | " + (path || "No local clone");
	C.byId("repositoriesBreadcrumb").href = "index.html?org=" + C.encode(C.query("org")) + "&localRoot=" + C.encode(C.query("localRoot"));
	C.byId("checkinsLink").href = "checkins.html?repo=" + C.encode(repo) + "&path=" + C.encode(path) + "&org=" + C.encode(C.query("org")) + "&localRoot=" + C.encode(C.query("localRoot")) + (selectedBranch ? "&branch=" + C.encode(selectedBranch) : "");
	C.byId("contextSelect").addEventListener("change", loadDiff);
	C.byId("checkInSelect").addEventListener("change", function (event) { if (event.target.value && event.target.value !== sha) window.location.href = checkInsUrl(event.target.value); });
	C.byId("collapseAllButton").addEventListener("click", function () { setAllFilesOpen(false); });
	C.byId("expandAllButton").addEventListener("click", function () { setAllFilesOpen(true); });
	C.byId("hideBinaryFilesToggle").addEventListener("change", function (event) { setBinaryFilesHidden(event.target.checked); });
	C.byId("reloadButton").addEventListener("click", loadDiff);
	C.byId("sessionConfigSave").addEventListener("click", saveSessionConfig);
	C.byId("sessionConfigCancel").addEventListener("click", closeSessionConfigModal);
	C.byId("recentSessionsSelect").addEventListener("change", function (event) { C.byId("sessionKeyInput").value = event.target.value || ""; updateSessionDestinationSummary(); updateConnectionSummary(); });
	C.byId("sessionKeyInput").addEventListener("input", updateSessionDestinationSummary);
	document.querySelectorAll("[data-session-env]").forEach(function (button) { button.addEventListener("click", function () { selectSessionEnvironment(button.getAttribute("data-session-env") || "Dev", true); }); });
		document.addEventListener("click", function (event) {
		if (event.target.id === "copySelectionButton") { copySelectedSnippet(); return; }
		if (event.target.id === "annotateSelectionButton") { if (state.selectedTarget) openAnnotationModal(state.selectedTarget); return; }
		if (event.target.id === "sendAnnotationsButton") { sendAnnotations(); return; }
		if (event.target.id === "runCodeReviewAgentButton") { triggerCodeReviewAgent(); return; }
		if (event.target.id === "agentReviewSubmitButton") { submitCommitReviewText(); return; }
		if (event.target.closest && event.target.closest("#reviewToggleButton")) { setCurrentReviewed(!state.reviewed); return; }
		if (event.target.id === "configureSessionButton") { configureSession(); return; }
		var fullFile = event.target.closest("[data-full-file]");
		if (fullFile) { toggleWholeFile(fullFile.getAttribute("data-full-file") || ""); return; }
		var edit = event.target.closest("[data-annotation-edit]");
		if (edit) { var item = state.annotations.find(function (x) { return x.Id === edit.getAttribute("data-annotation-edit"); }); if (item) openAnnotationModal(item); return; }
		var remove = event.target.closest("[data-annotation-remove]");
		if (remove) { removeAnnotation(remove.getAttribute("data-annotation-remove")); return; }
	});
	C.byId("annotationModalSave").addEventListener("click", function () { if (state.editTarget) upsertAnnotation(state.editTarget, C.byId("annotationModalText").value || ""); closeAnnotationModal(); });
	C.byId("annotationModalCancel").addEventListener("click", closeAnnotationModal);
	C.byId("annotationModalRemove").addEventListener("click", function () { if (state.editTarget && state.editTarget.Id) removeAnnotation(state.editTarget.Id); closeAnnotationModal(); });
	updateConnectionSummary();
	loadCheckInOptions();
	if (Bridge.loadTargetSettings) Bridge.loadTargetSettings().then(updateConnectionSummary).catch(function (error) { C.log("Target settings load failed: " + (error.message || error)); });
	loadDiff();
})();





