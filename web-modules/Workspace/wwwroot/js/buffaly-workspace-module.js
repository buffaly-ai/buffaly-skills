(function () {
	"use strict";
	function esc(value) { return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
	function qs(name) { return new URL(location.href).searchParams.get(name) || ""; }
	function workspaceUrl(key, sessionKey) { return "/workspace/workbench.html?workspaceKey=" + encodeURIComponent(key) + (sessionKey ? "&sessionKey=" + encodeURIComponent(sessionKey) : ""); }
	function agentUrl(sessionKey) { return "/buffaly-agent-next.html?sessionKey=" + encodeURIComponent(sessionKey); }
	function artifactUrl(sessionKey, item) { return "/api/web-modules/Workspace/session-artifact?sessionKey=" + encodeURIComponent(sessionKey) + "&owningSessionKey=" + encodeURIComponent(item.owningSessionKey) + "&path=" + encodeURIComponent(item.relativePath); }
	function fileIcon(item) { const name = String(item && item.relativePath || "").toLowerCase(); const kind = String(item && item.kind || "").toLowerCase(); if (kind === "directory") return "📁 DIR"; if (/\.pdf$/.test(name)) return "📕 PDF"; if (/\.(html?|url)$/.test(name)) return "🌐 WEB"; if (/\.md$/.test(name)) return "📝 MD"; if (/\.(png|jpe?g|webp|gif|svg)$/.test(name)) return "🖼️ IMG"; if (/\.zip$/.test(name)) return "🗜️ ZIP"; if (/\.json$/.test(name)) return "▣ JSON"; if (/\.txt$/.test(name)) return "📄 TXT"; return "📄 FILE"; }
	function fileName(path) { return String(path || "").split(/[\\/]/).pop() || path; }
	function renderIndex() {
		const list = document.getElementById("workspace-list");
		if (!list) return;
		fetch("/api/web-modules/Workspace/list", { headers: { Accept: "application/json" } }).then(function (response) {
			if (!response.ok) throw new Error("Workspace list failed with status " + response.status);
			return response.json();
		}).then(function (data) {
			const workspaces = data.workspaces || [];
			if (!workspaces.length) { list.innerHTML = '<div class="bws-module-empty">No workspaces found.</div>'; return; }
			list.innerHTML = workspaces.map(function (workspace) {
				return '<article class="bws-workspace-row"><div><strong>' + esc(workspace.workspaceName) + '</strong><small>' + esc(workspace.workspaceKey) + ' · ' + esc(workspace.sessionCount) + ' sessions</small></div><a class="bws-module-button" href="' + esc(workspaceUrl(workspace.workspaceKey, "")) + '">Open</a></article>';
			}).join("");
		}).catch(function (error) { list.innerHTML = '<div class="bws-module-empty">' + esc(error.message) + '</div>'; });
	}
	function renderWorkbench() {
		const root = document.getElementById("workspace-page-root");
		if (!root) return;
		const workspaceKey = qs("workspaceKey"), sessionKey = qs("sessionKey");
		if (!workspaceKey) { root.innerHTML = '<div class="bws-module-empty">Missing workspaceKey.</div>'; return; }
		fetch("/api/web-modules/Workspace/summary?workspaceKey=" + encodeURIComponent(workspaceKey) + "&sessionKey=" + encodeURIComponent(sessionKey), { headers: { Accept: "application/json" } }).then(function (response) {
			if (!response.ok) throw new Error("Workspace summary failed with status " + response.status);
			return response.json();
		}).then(function (summary) {
			const anchor = sessionKey || (summary.sessions && summary.sessions[0] && summary.sessions[0].sessionKey) || "";
			const files = (summary.artifacts || []).slice().sort(function (a, b) { return String(b.updatedUtc).localeCompare(String(a.updatedUtc)); }).slice(0, 80);
			root.innerHTML = '<header class="bws-module-hero"><a href="/workspace/">← All workspaces</a><small>WORKSPACE</small><h1>' + esc(summary.workspaceName) + '</h1><p>' + esc(summary.sessions.length) + ' sessions · ' + esc(summary.artifacts.length) + ' artifacts</p></header><section class="bws-module-grid"><article class="bws-module-card"><h2>Recent files</h2><div class="bws-module-files">' + files.map(function (item) { return '<div class="bws-module-file"><span class="bws-module-type">' + esc(fileIcon(item)) + '</span><div><strong>' + esc(fileName(item.relativePath)) + '</strong><small>' + esc(item.owningSessionKey) + ' · ' + esc(item.relativePath) + '</small></div>' + (item.kind === "Directory" || !anchor ? '' : '<a class="bws-module-button" target="_blank" rel="noopener" href="' + esc(artifactUrl(anchor, item)) + '">Open</a>') + '</div>'; }).join("") + '</div></article><article class="bws-module-card"><h2>Sessions</h2><div class="bws-module-list">' + (summary.sessions || []).map(function (session) { return '<article class="bws-workspace-row"><div><strong>' + esc(session.sessionKey) + '</strong><small>' + (session.isCurrent ? 'Current / selected' : 'Included via workspace root tree') + '</small></div><a class="bws-module-button" href="' + esc(agentUrl(session.sessionKey)) + '">Open session</a></article>'; }).join("") + '</div></article></section>';
		}).catch(function (error) { root.innerHTML = '<div class="bws-module-empty">' + esc(error.message) + '</div>'; });
	}
	renderIndex();
	renderWorkbench();
})();
