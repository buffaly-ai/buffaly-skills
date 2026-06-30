(function () {
	var C = window.CodeReviews;
	var repo = C.decode(C.query("repo"));
	var path = C.normalizePath(C.decode(C.query("path")));
	var org = C.decode(C.query("org"));
	var localRoot = C.decode(C.query("localRoot"));
	var selectedBranch = C.decode(C.query("branch"));
	var checkInLimit = 60;
	var reviewFilter = C.decode(C.query("review")) || "all";
	var cacheVersion = "20260630.1";
	function cacheKey() {
		return "Buffaly.CodeReviews.CheckIns:" + cacheVersion + ":" + path + ":" + (selectedBranch || "") + ":" + checkInLimit;
	}
	function readCache() {
		try { return JSON.parse(localStorage.getItem(cacheKey()) || "null"); } catch (_) { return null; }
	}
	function writeCache(response) {
		try { localStorage.setItem(cacheKey(), JSON.stringify({ SavedUtc: new Date().toISOString(), Response: response })); } catch (_) { }
	}
	function statHtml(files, add, del) { return '<span>' + files + ' files</span> | <span class="stat-add">+' + add + '</span> <span class="stat-remove">-' + del + '</span>'; }
	function syncText(response) {
		var ahead = Number(response.AheadBy || response.aheadBy || 0);
		var behind = Number(response.BehindBy || response.behindBy || 0);
		var upstream = C.text(response.Upstream || response.upstream);
		var text = ahead + " unpushed commit" + (ahead === 1 ? "" : "s");
		if (behind > 0) text += " | " + behind + " behind remote";
		if (upstream) text += " | " + upstream;
		return text;
	}
	function renderSyncControls(response) {
		var summary = C.byId("syncSummary");
		var button = C.byId("pushAllButton");
		if (!summary || !button) return;
		var ahead = Number(response.AheadBy || response.aheadBy || 0);
		summary.textContent = syncText(response);
		button.classList.toggle("hidden", ahead <= 0);
		button.textContent = ahead > 0 ? "Push all (" + ahead + ")" : "Push all";
		button.disabled = ahead <= 0;
	}
	function renderWorktree(response) {
		var node = C.byId("worktreeStatus");
		if (!node) return;
		var href = "diff.html?repo=" + C.encode(repo) + "&path=" + C.encode(path) + "&mode=worktree";
		var syncHtml = "";
		if (response.HasWorktreeChanges) {
			node.innerHTML = '<div class="worktree-status dirty"><div><strong>Uncommitted worktree changes</strong><span>' + statHtml(response.WorktreeChangedFileCount, response.WorktreeInsertions, response.WorktreeDeletions) + '</span><em>' + C.escapeHtml((response.WorktreePreviewFiles || []).join(", ")) + '</em></div><a class="worktree-open-button" href="' + href + '">Open diff</a></div>';
			C.byId("worktreeLink").textContent = "Open uncommitted worktree (" + response.WorktreeChangedFileCount + ")";
		} else {
			node.innerHTML = '<div class="worktree-status clean"><strong>Working tree clean</strong><span>No uncommitted changes detected.</span></div>';
			C.byId("worktreeLink").textContent = "Open uncommitted worktree";
		}
	}
	function renderReviewedBadge(item) {
		return item.Reviewed ? '<span class="reviewed-badge reviewed">Reviewed</span>' : '<span class="reviewed-badge unreviewed">Unreviewed</span>';
	}
	function renderAgentReviewBadge(item) {
		var status = C.text(item.AgentReviewStatus || item.agentReviewStatus || "NotReviewed");
		var label = status === "NotReviewed" ? "Not reviewed" : status;
		var css = status === "Reviewed" ? "reviewed" : (status === "Running" ? "agent-running" : (status === "Failed" ? "agent-failed" : "unreviewed"));
		return '<span class="reviewed-badge ' + css + '">Agent: ' + C.escapeHtml(label) + '</span>';
	}
	function filteredCheckIns(checkIns) {
		if (reviewFilter === "reviewed") return checkIns.filter(function (item) { return item.Reviewed === true; });
		if (reviewFilter === "unreviewed") return checkIns.filter(function (item) { return item.Reviewed !== true; });
		return checkIns;
	}
	function updateReviewFilterButtons() {
		document.querySelectorAll("[data-review-filter]").forEach(function (button) {
			var selected = button.getAttribute("data-review-filter") === reviewFilter;
			button.classList.toggle("selected", selected);
			button.setAttribute("aria-pressed", selected ? "true" : "false");
		});
	}
	function renderCheckIns(checkIns, aheadCount) {
		aheadCount = Math.max(0, Number(aheadCount || 0));
		updateReviewFilterButtons();
		var visibleCheckIns = filteredCheckIns(checkIns);
		C.byId("checkInList").innerHTML = visibleCheckIns.map(function (item) {
			var href = "diff.html?repo=" + C.encode(repo) + "&path=" + C.encode(path) + "&sha=" + C.encode(item.Sha) + "&mode=commit";
			var index = checkIns.findIndex(function (checkIn) { return checkIn.Sha === item.Sha; });
			var isUnpushed = index < aheadCount;
			var toggleText = item.Reviewed ? "Mark as unreviewed" : "Mark as reviewed";
			return '<a class="checkin-row ' + (item.Reviewed ? 'reviewed-row' : 'unreviewed-row') + (isUnpushed ? ' unpushed' : '') + '" href="' + href + '" data-checkin-sha="' + C.escapeHtml(item.Sha) + '">' +
				'<span class="checkin-title"><strong>' + C.escapeHtml(item.ShortSha) + ' ' + C.escapeHtml(item.Subject) + '</strong><span class="checkin-badges">' + renderReviewedBadge(item) + renderAgentReviewBadge(item) + (isUnpushed ? ' <span class="unpushed-badge">Unpushed</span>' : '') + '</span></span>' +
				'<span class="checkin-date">' + C.escapeHtml(C.formatWhen(item.CommittedAtUtc)) + '</span>' +
				'<span class="checkin-stats">' + statHtml(item.ChangedFileCount, item.Insertions, item.Deletions) + '</span>' +
				'<span class="checkin-review-action"><button class="review-toggle ' + (item.Reviewed ? 'reviewed' : 'unreviewed') + '" type="button" data-review-toggle="' + C.escapeHtml(item.Sha) + '" data-reviewed="' + (item.Reviewed ? 'true' : 'false') + '" title="' + toggleText + '" aria-label="' + toggleText + '"><span aria-hidden="true">' + (item.Reviewed ? '&#10003;' : '&#9675;') + '</span><span>' + (item.Reviewed ? 'Reviewed' : 'Unreviewed') + '</span></button></span>' +
				'</a>';
		}).join("") || '<div class="empty">No ' + C.escapeHtml(reviewFilter === "all" ? "" : reviewFilter + " ") + 'check-ins found.</div>';
	}
	function setCheckInReviewed(sha, reviewed) {
		return C.call("SetCheckInReviewed", { RepositoryPath: path, Sha: sha, Reviewed: reviewed })
			.then(function () { clearCache(); return loadCheckIns(); })
			.catch(function (error) { C.log("Review status update failed: " + C.errorMessage(error)); });
	}
	function renderBranches(response) {
		var select = C.byId("branchSelect");
		if (!select) return;
		var current = response.SelectedBranch || response.Branch || "";
		var branches = response.Branches || [];
		select.innerHTML = branches.map(function (branch) { return '<option value="' + C.escapeHtml(branch) + '"' + (branch === current ? ' selected' : '') + '>' + C.escapeHtml(branch) + '</option>'; }).join("");
		if (!branches.length) select.innerHTML = '<option value="">Current branch</option>';
		selectedBranch = current;
	}
	function renderResponse(response, isCached) {
		renderBranches(response);
		renderSyncControls(response);
		renderWorktree(response);
		renderCheckIns(response.CheckIns || [], response.AheadBy || response.aheadBy || 0);
		C.log((isCached ? "Showing cached " : "Loaded ") + (response.CheckIns || []).length + " check-ins from " + (response.SelectedBranch || response.Branch || "current branch") + (isCached ? " while refreshing..." : "."));
	}
	function renderCacheIfAvailable() {
		var cached = readCache();
		if (!cached || !cached.Response) return false;
		renderResponse(cached.Response, true);
		return true;
	}
	function loadCheckIns() {
		if (!path) { C.byId("checkInList").innerHTML = '<div class="empty">Local clone not found.</div>'; return; }
		var hadCache = renderCacheIfAvailable();
		C.log(hadCache ? "Refreshing check-ins..." : "Loading check-ins...");
		return C.call("GetCheckIns", { RepositoryPath: path, BranchName: selectedBranch, Limit: checkInLimit })
			.then(function (response) { writeCache(response); renderResponse(response, false); })
			.catch(function (error) { C.log("Check-in load failed: " + C.errorMessage(error)); });
	}
	C.byId("selectedRepoTitle").textContent = repo || "Repository";
	C.byId("selectedRepoMeta").textContent = (repo || "") + (path ? " | " + path : " | No local clone");
	C.byId("repositoriesBreadcrumb").href = "index.html?org=" + C.encode(org) + "&localRoot=" + C.encode(localRoot);
	C.byId("worktreeLink").href = "diff.html?repo=" + C.encode(repo) + "&path=" + C.encode(path) + "&mode=worktree";
	function clearCache() {
		try { localStorage.removeItem(cacheKey()); } catch (_) { }
	}
	function pushAll() {
		if (!path) return;
		if (!window.confirm("Push all unpushed commits for " + (repo || path) + "?")) return;
		var button = C.byId("pushAllButton");
		if (button) { button.disabled = true; button.textContent = "Pushing..."; }
		C.log("Pushing unpushed commits...");
		return C.call("PushRepository", { RepositoryPath: path })
			.then(function (response) {
				clearCache();
				C.log((response.Message || (response.Success ? "Push completed." : "Push failed.")) + (response.ErrorOutput ? " " + response.ErrorOutput : ""));
				return loadCheckIns();
			})
			.catch(function (error) {
				C.log("Push failed: " + C.errorMessage(error));
				return loadCheckIns();
			});
	}
	C.byId("checkInList").addEventListener("click", function (event) {
		var button = event.target.closest("[data-review-toggle]");
		if (!button) return;
		event.preventDefault();
		event.stopPropagation();
		var sha = button.getAttribute("data-review-toggle") || "";
		var reviewed = button.getAttribute("data-reviewed") !== "true";
		button.disabled = true;
		button.textContent = "Saving...";
		setCheckInReviewed(sha, reviewed);
	});
	C.byId("refreshButton").addEventListener("click", loadCheckIns);
	C.byId("pushAllButton").addEventListener("click", pushAll);
	C.byId("branchSelect").addEventListener("change", function () {
		selectedBranch = C.byId("branchSelect").value;
		var nextUrl = "checkins.html?repo=" + C.encode(repo) + "&path=" + C.encode(path) + "&localRoot=" + C.encode(localRoot) + "&org=" + C.encode(org) + "&branch=" + C.encode(selectedBranch) + "&review=" + C.encode(reviewFilter);
		window.history.replaceState(null, "", nextUrl);
		loadCheckIns();
	});
	document.querySelectorAll("[data-review-filter]").forEach(function (button) {
		button.addEventListener("click", function () {
			reviewFilter = button.getAttribute("data-review-filter") || "all";
			var nextUrl = "checkins.html?repo=" + C.encode(repo) + "&path=" + C.encode(path) + "&localRoot=" + C.encode(localRoot) + "&org=" + C.encode(org) + "&branch=" + C.encode(selectedBranch) + "&review=" + C.encode(reviewFilter);
			window.history.replaceState(null, "", nextUrl);
			loadCheckIns();
		});
	});
	loadCheckIns();
})();
