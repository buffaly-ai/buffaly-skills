(function () {
	var state = { Repositories: [], IsUsingCache: false, WorktreeStatuses: {}, IsLoadingWorktreeStatuses: false };
	var C = window.CodeReviews;
	var cacheVersion = "20260520.1";
	function cacheKey() {
		return "Buffaly.CodeReviews.Repositories:" + cacheVersion + ":" + C.byId("orgNameInput").value + ":" + C.byId("localRootInput").value;
	}
	function readCache() {
		try { return JSON.parse(localStorage.getItem(cacheKey()) || "null"); } catch (_) { return null; }
	}
	function writeCache(repositories) {
		try { localStorage.setItem(cacheKey(), JSON.stringify({ SavedUtc: new Date().toISOString(), Repositories: repositories || [] })); } catch (_) { }
	}
	function statusCacheKey() {
		return "Buffaly.CodeReviews.WorktreeStatuses:" + cacheVersion + ":" + C.byId("orgNameInput").value + ":" + C.byId("localRootInput").value;
	}
	function normalizeStatusPath(path) { return C.normalizePath(path || "").toLowerCase(); }
	function readStatusCache() {
		try { return JSON.parse(localStorage.getItem(statusCacheKey()) || "{}"); } catch (_) { return {}; }
	}
	function writeStatusCache() {
		try { localStorage.setItem(statusCacheKey(), JSON.stringify(state.WorktreeStatuses || {})); } catch (_) { }
	}
	function statusFor(repo) {
		return state.WorktreeStatuses[normalizeStatusPath(repo.LocalClonePath || "")];
	}
	function renderWorktreeBadge(repo) {
		if (!repo.HasLocalClone) return "";
		var status = statusFor(repo);
		if (!status) return '<span class="repo-card-worktree pending">Checking local changes...</span>';
		if (status.IsTimedOut || status.isTimedOut) return '<span class="repo-card-worktree pending">Local changes timed out</span>';
		var ahead = Number(status.AheadBy || status.aheadBy || 0);
		var behind = Number(status.BehindBy || status.behindBy || 0);
		var count = Number(status.ChangedFileCount || status.changedFileCount || 0);
		var parts = [];
		if (count > 0) parts.push(count + ' uncommitted change' + (count === 1 ? '' : 's'));
		if (ahead > 0) parts.push(ahead + ' unpushed commit' + (ahead === 1 ? '' : 's'));
		if (behind > 0) parts.push(behind + ' behind remote');
		if (!parts.length) return '<span class="repo-card-worktree clean">No local changes</span>';
		return '<span class="repo-card-worktree dirty">' + C.escapeHtml(parts.join(' | ')) + '</span>';
	}
	function repositoryDate(repo) {
		var status = statusFor(repo);
		var localCommit = status && (status.LatestLocalCommitUtc || status.latestLocalCommitUtc);
		return { Label: localCommit ? "Last local commit" : "Last pushed", Value: localCommit || repo.PushedAtUtc };
	}
	function repositoryDateTicks(repo) {
		var date = repositoryDate(repo).Value;
		if (!date) return 0;
		if (typeof date === "string") {
			var parsed = new Date(date).getTime();
			return isNaN(parsed) ? 0 : parsed;
		}
		var ticks = Number(date.UtcTicks || date.Ticks || date.utcTicks || date.ticks || 0);
		if (ticks > 0) return ticks / 10000;
		var raw = date.UtcDateTime || date.DateTime || date.LocalDateTime || date.Value || date.utcDateTime || date.dateTime || date.localDateTime || date.value;
		var parsedObject = raw ? new Date(raw).getTime() : 0;
		return isNaN(parsedObject) ? 0 : parsedObject;
	}
	function renderCacheIfAvailable() {
		var cached = readCache();
		if (!cached || !cached.Repositories || !cached.Repositories.length) return false;
		state.Repositories = cached.Repositories;
		state.WorktreeStatuses = readStatusCache();
		state.IsUsingCache = true;
		renderRepositories();
		C.log("Showing cached repositories while refreshing...");
		return true;
	}
	function renderRepositories() {
		var filter = C.byId("repoFilterInput").value.trim().toLowerCase();
		var rows = state.Repositories.filter(function (repo) {
			return !filter || C.text(repo.NameWithOwner || repo.RepoName).toLowerCase().indexOf(filter) >= 0;
		}).slice().sort(function (a, b) {
			var dateDiff = repositoryDateTicks(b) - repositoryDateTicks(a);
			return dateDiff || C.text(a.RepoName).localeCompare(C.text(b.RepoName));
		}).map(function (repo) {
			var href = "checkins.html?repo=" + C.encode(repo.NameWithOwner) + "&path=" + C.encode(C.normalizePath(repo.LocalClonePath || "")) + "&localRoot=" + C.encode(C.byId("localRootInput").value) + "&org=" + C.encode(C.byId("orgNameInput").value);
			var date = repositoryDate(repo);
			return '<a class="repo-card" href="' + href + '">' +
				'<span class="repo-card-title">' + C.escapeHtml(repo.RepoName) + '</span>' +
				'<span class="repo-card-meta">' + C.escapeHtml(repo.NameWithOwner || repo.RepoName) + '</span>' +
				'<span class="repo-card-row"><strong>' + C.escapeHtml(date.Label) + '</strong><em>' + C.escapeHtml(C.formatWhen(date.Value)) + '</em></span>' +
				'<span class="repo-card-row"><strong>Branch</strong><em>' + C.escapeHtml(repo.DefaultBranch || "default") + '</em></span>' +
				renderWorktreeBadge(repo) +
				'<span class="repo-card-foot ' + (repo.HasLocalClone ? 'ok' : 'missing') + '">' + (repo.HasLocalClone ? 'Open check-ins' : 'No local clone') + '</span>' +
				'</a>';
		}).join("");
		C.byId("repositoryList").innerHTML = rows || '<div class="empty">No repositories found.</div>';
		C.byId("repoCount").textContent = state.Repositories.length + " repos" + (state.IsUsingCache ? " (cached, refreshing...)" : "");
	}
	function loadRepositories() {
		var hadCache = renderCacheIfAvailable();
		C.log(hadCache ? "Refreshing repositories..." : "Loading repositories...");
		return C.call("GetRepositoryActivity", { OrgName: C.byId("orgNameInput").value, Limit: 200, LocalRootPath: C.byId("localRootInput").value })
			.then(function (response) { state.Repositories = response.Repositories || []; state.WorktreeStatuses = readStatusCache(); state.IsUsingCache = false; writeCache(state.Repositories); renderRepositories(); C.log("Loaded " + state.Repositories.length + " repositories. Checking local changes..."); loadWorktreeStatuses(); })
			.catch(function (error) { C.log("Repository load failed: " + (error.message || error)); });
	}
	function loadWorktreeStatuses() {
		var paths = state.Repositories.filter(function (repo) { return repo.HasLocalClone && repo.LocalClonePath; }).map(function (repo) { return repo.LocalClonePath; });
		if (!paths.length || state.IsLoadingWorktreeStatuses) return;
		state.IsLoadingWorktreeStatuses = true;
		return C.call("GetWorktreeStatuses", { RepositoryPaths: paths, MaxRepositories: 120 })
			.then(function (response) {
				(response.Repositories || response.Statuses || []).forEach(function (status) { state.WorktreeStatuses[normalizeStatusPath(status.RepositoryPath || status.repositoryPath)] = status; });
				state.IsLoadingWorktreeStatuses = false;
				writeStatusCache();
				renderRepositories();
				C.log("Loaded " + state.Repositories.length + " repositories with local change counts.");
			})
			.catch(function (error) { state.IsLoadingWorktreeStatuses = false; C.log("Local change count load failed: " + (error.message || error)); });
	}
	C.byId("refreshButton").addEventListener("click", loadRepositories);
	C.byId("repoFilterInput").addEventListener("input", renderRepositories);
	C.byId("orgNameInput").addEventListener("change", loadRepositories);
	C.byId("localRootInput").addEventListener("change", loadRepositories);
	loadRepositories();
})();
