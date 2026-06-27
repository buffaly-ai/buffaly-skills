(function () {
	var state = {
		Repositories: [],
		SelectedRepository: null,
		Mode: "repositories"
	};

	function byId(id) { return document.getElementById(id); }
	function text(value) { return value === null || value === undefined ? "" : String(value); }
	function escapeHtml(value) {
		return text(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
	}
	function log(message) { byId("statusLog").textContent = message; }
	function showPage(name) {
		state.Mode = name;
		byId("repositoryPage").classList.toggle("hidden", name !== "repositories");
		byId("checkInsPage").classList.toggle("hidden", name !== "checkins");
	}
	function service() {
		return window.Buffaly && window.Buffaly.CodeReviews && window.Buffaly.CodeReviews.WebHarness && window.Buffaly.CodeReviews.WebHarness.CodeReviewsHarnessJsonWsService;
	}
	function callJsonWs(methodName, request) {
		var api = service();
		if (!api || typeof api[methodName] !== "function") return Promise.reject(new Error("JsonWs stub is not loaded: " + methodName));
		return new Promise(function (resolve, reject) {
			try { api[methodName](request, resolve, reject); } catch (error) { reject(error); }
		});
	}
	function formatWhen(value) {
		if (!value) return "";
		var date = new Date(value);
		return isNaN(date.getTime()) ? text(value) : date.toLocaleString();
	}
	function repoPath() {
		if (byId("repoPathInput").value.trim()) return byId("repoPathInput").value.trim();
		return state.SelectedRepository ? state.SelectedRepository.LocalClonePath : "";
	}
	function renderRepositories() {
		var filter = byId("repoFilterInput").value.trim().toLowerCase();
		var rows = state.Repositories.filter(function (repo) {
			return !filter || text(repo.NameWithOwner || repo.RepoName).toLowerCase().indexOf(filter) >= 0;
		}).map(function (repo) {
			return '<button type="button" class="repo-row" data-repo="' + escapeHtml(repo.NameWithOwner) + '">' +
				'<span class="repo-main"><strong>' + escapeHtml(repo.RepoName) + '</strong><em>' + escapeHtml(repo.DefaultBranch || "default") + '</em></span>' +
				'<span>Last pushed ' + escapeHtml(formatWhen(repo.PushedAtUtc) || "unknown") + '</span>' +
				'<span>' + (repo.HasLocalClone ? 'Open local clone' : 'No local clone') + '</span>' +
				'</button>';
		}).join("");
		byId("repositoryList").innerHTML = rows || '<div class="empty">No repositories found.</div>';
	}
	function renderCheckIns(checkIns) {
		byId("checkInList").innerHTML = checkIns.map(function (item) {
			return '<button type="button" class="checkin-row" data-sha="' + escapeHtml(item.Sha) + '">' +
				'<strong>' + escapeHtml(item.ShortSha) + ' ' + escapeHtml(item.Subject) + '</strong>' +
				'<span>' + escapeHtml(formatWhen(item.CommittedAtUtc)) + ' | ' + item.ChangedFileCount + ' files | +' + item.Insertions + ' -' + item.Deletions + '</span>' +
				'</button>';
		}).join("") || '<div class="empty">No check-ins found.</div>';
	}
	function diffLineClass(line) {
		if (line.indexOf("+") === 0 && line.indexOf("+++") !== 0) return "add";
		if (line.indexOf("-") === 0 && line.indexOf("---") !== 0) return "remove";
		if (line.indexOf("@@") === 0 || line.indexOf("diff ") === 0 || line.indexOf("index ") === 0 || line.indexOf("---") === 0 || line.indexOf("+++") === 0) return "header";
		return "context";
	}
	function renderDiff(snapshot) {
		byId("diffTitle").textContent = snapshot.Mode === "worktree" ? "Uncommitted worktree" : (snapshot.CommitShortSha + " " + snapshot.CommitSubject);
		byId("diffSummary").textContent = snapshot.ChangeCount + " file change(s) on " + (snapshot.Branch || "detached");
		byId("diffFiles").innerHTML = (snapshot.Files || []).map(function (file) {
			var lines = file.IsBinary ? ["Binary file changed. Diff body is hidden."] : text(file.Patch).split(/\r?\n/);
			return '<details class="diff-file"><summary><span class="status">' + escapeHtml(file.StatusCode) + '</span><span>' + escapeHtml(file.Path) + '</span><span class="stat">+' + file.AddedLines + ' -' + file.RemovedLines + '</span></summary>' +
				(file.OriginalPath ? '<div class="rename">Renamed from ' + escapeHtml(file.OriginalPath) + '</div>' : '') +
				'<pre>' + lines.map(function (line) { return '<span class="line ' + diffLineClass(line) + '">' + escapeHtml(line) + '</span>'; }).join('') + '</pre></details>';
		}).join("") || '<div class="empty">No file changes.</div>';
	}
	function loadRepositories() {
		log("Loading repositories...");
		showPage("repositories");
		return callJsonWs("GetRepositoryActivity", { OrgName: byId("orgNameInput").value, Limit: 200, LocalRootPath: byId("localRootInput").value })
			.then(function (response) { state.Repositories = response.Repositories || []; renderRepositories(); log("Loaded " + state.Repositories.length + " repositories."); })
			.catch(function (error) { log("Repository load failed: " + (error.message || error)); });
	}
	function openRepository(repoName) {
		state.SelectedRepository = state.Repositories.filter(function (repo) { return repo.NameWithOwner === repoName; })[0] || null;
		if (!state.SelectedRepository) return;
		byId("selectedRepoTitle").textContent = state.SelectedRepository.RepoName;
		byId("selectedRepoMeta").textContent = state.SelectedRepository.NameWithOwner + " | " + (state.SelectedRepository.LocalClonePath || "No local clone");
		showPage("checkins");
		loadCheckIns();
	}
	function loadCheckIns() {
		var path = repoPath();
		if (!path) { byId("checkInList").innerHTML = '<div class="empty">Local clone not found.</div>'; return; }
		log("Loading check-ins...");
		return callJsonWs("GetCheckIns", { RepositoryPath: path, Limit: 60 })
			.then(function (response) { renderCheckIns(response.CheckIns || []); log("Loaded " + (response.CheckIns || []).length + " check-ins."); })
			.catch(function (error) { log("Check-in load failed: " + (error.message || error)); });
	}
	function loadDiff(mode, commitSha) {
		var path = repoPath();
		if (!path) return;
		log("Loading diff...");
		return callJsonWs("GetDiffSnapshot", { RepositoryPath: path, Mode: mode, CommitSha: commitSha || "", MaxFiles: 240, MaxPatchChars: 800000, ContextLines: Number(byId("contextSelect").value) })
			.then(function (response) { renderDiff(response); log("Diff loaded."); })
			.catch(function (error) { log("Diff load failed: " + (error.message || error)); });
	}
	document.addEventListener("click", function (event) {
		var repoRow = event.target.closest("[data-repo]");
		if (repoRow) { openRepository(repoRow.getAttribute("data-repo")); return; }
		var checkInRow = event.target.closest("[data-sha]");
		if (checkInRow) { loadDiff("commit", checkInRow.getAttribute("data-sha")); return; }
	});
	byId("refreshButton").addEventListener("click", loadRepositories);
	byId("backButton").addEventListener("click", loadRepositories);
	byId("repoFilterInput").addEventListener("input", renderRepositories);
	byId("worktreeButton").addEventListener("click", function () { loadDiff("worktree", ""); });
	byId("contextSelect").addEventListener("change", function () { byId("diffFiles").innerHTML = '<div class="empty">Select a check-in or worktree again to reload context.</div>'; });
	loadRepositories();
})();
