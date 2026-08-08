(function () {
	"use strict";
	function esc(value) { return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
	function qs(name) { return new URL(location.href).searchParams.get(name) || ""; }
	function workspaceUrl(key, sessionKey) { return "/workspace/workbench.html?workspaceKey=" + encodeURIComponent(key) + (sessionKey ? "&sessionKey=" + encodeURIComponent(sessionKey) : ""); }
	function agentUrl(sessionKey) { return "/buffaly-agent-next.html?sessionKey=" + encodeURIComponent(sessionKey || ""); }
	function nameFrom(path) { return String(path || "").split(/[\\/]/).filter(Boolean).pop() || path || "artifact"; }
	function ext(path) { var match = String(path || "").toLowerCase().match(/\.[a-z0-9]+$/); return match ? match[0] : ""; }
	function typeFrom(path, kind) { if (kind === "Directory") return "DIR"; var e = ext(path); return e ? e.slice(1).toUpperCase() : "FILE"; }
	function sizeText(bytes) { if (!bytes) return ""; if (bytes < 1024) return bytes + " B"; if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"; return (bytes / 1048576).toFixed(1) + " MB"; }
	function whenText(updatedUtc) { if (!updatedUtc) return "recent"; var ms = Date.now() - new Date(updatedUtc).getTime(); if (ms < 3600000) return Math.max(1, Math.round(ms / 60000)) + " min ago"; if (ms < 86400000) return Math.round(ms / 3600000) + " hr ago"; return Math.round(ms / 86400000) + " days ago"; }
	function sourceLabel(sessionKey) { return String(sessionKey || "").replace(/ Worker$/, "").replace(/ Growth Proposal$/, " proposal"); }
	function reasonFor(item) { var p = String(item.relativePath || "").toLowerCase(); if (p.includes("proposal") || p.includes("deck")) return "Proposal deliverable"; if (p.includes("audit") || p.includes("analysis")) return "Audit evidence"; if (p.includes("report")) return "Validated report"; return "Workspace artifact"; }
	function artifactUrl(anchorSessionKey, item) { return "/api/web-modules/Workspace/session-artifact?sessionKey=" + encodeURIComponent(anchorSessionKey || "") + "&owningSessionKey=" + encodeURIComponent(item.owningSessionKey || "") + "&path=" + encodeURIComponent(item.relativePath || ""); }
	function cacheGet(key) { try { var raw = sessionStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch (_) { return null; } }
	function cacheSet(key, value) { try { sessionStorage.setItem(key, JSON.stringify({ storedUtc: new Date().toISOString(), value: value })); } catch (_) { } }
	function loadCachedJson(key, url, onData, onError) {
		var cached = cacheGet(key);
		var hadCached = !!(cached && cached.value);
		if (hadCached) onData(cached.value, true);
		fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" }).then(function (response) { if (!response.ok) throw new Error(url + " failed with status " + response.status); return response.json(); }).then(function (data) {
			cacheSet(key, data);
			onData(data, false);
		}).catch(function (error) { if (!hadCached && onError) onError(error); });
	}
	function isUseful(item) { return item.kind !== "Directory" && [".pdf", ".md", ".html", ".htm", ".url", ".pptx", ".ppt", ".docx", ".xlsx", ".csv", ".txt", ".png", ".jpg", ".jpeg", ".webp", ".zip", ".json"].indexOf(ext(item.relativePath)) >= 0; }
	function buildFile(anchorSessionKey, item, idPrefix, index, pinned) {
		return { id: idPrefix + "-" + index, name: nameFrom(item.relativePath), type: typeFrom(item.relativePath, item.kind), size: sizeText(item.length), source: item.owningSessionKey, sourceLabel: sourceLabel(item.owningSessionKey), path: item.relativePath, when: whenText(item.updatedUtc), updated: index, pinned: !!pinned, reason: pinned ? "Pinned workspace item" : reasonFor(item), excerpt: item.relativePath, href: artifactUrl(anchorSessionKey, item), updatedUtc: item.updatedUtc };
	}
	function buildFiles(summary, anchorSessionKey) {
		return (summary.artifacts || []).filter(isUseful).sort(function (a, b) { return String(b.updatedUtc || "").localeCompare(String(a.updatedUtc || "")); }).slice(0, 80).map(function (item, i) { return buildFile(anchorSessionKey, item, "live", i, false); });
	}
	function buildPins(summary, anchorSessionKey) {
		return (summary.pins || []).map(function (pin, i) {
			if (pin.type === "website") return { id: "pin-site-" + i, name: pin.title, type: "WEB", sourceLabel: pin.label || "Website", reason: pin.label || "Website", href: pin.url, pinned: true, kind: pin.kind || "website" };
			return buildFile(anchorSessionKey, pin, "pin", i, true);
		});
	}
	function buildSources(summary) {
		return (summary.sessions || []).map(function (s, i) { return ["source-" + i, sourceLabel(s.sessionKey), s.sessionKey, (summary.artifacts || []).filter(function (a) { return a.owningSessionKey === s.sessionKey; }).length, s.isCurrent ? "Primary" : "Available"]; });
	}
	function buildSessionSourceCards(summary, anchorSessionKey) {
		var bySession = new Map();
		(summary.sessions || []).forEach(function (s) { bySession.set(s.sessionKey, { id: s.sessionKey, name: sourceLabel(s.sessionKey), sessionKey: s.sessionKey, isCurrent: !!s.isCurrent, relationshipType: s.relationshipType || "", summary: s.summary || "", artifactCount: 0, lastUpdatedUtc: s.lastObservedUtc || s.createdUtc || null, recentArtifacts: [] }); });
		(summary.artifacts || []).filter(isUseful).forEach(function (a) {
			var key = a.owningSessionKey || "Unknown session";
			if (!bySession.has(key)) bySession.set(key, { id: key, name: sourceLabel(key), sessionKey: key, isCurrent: false, relationshipType: "", summary: "", artifactCount: 0, lastUpdatedUtc: null, recentArtifacts: [] });
			var source = bySession.get(key);
			source.artifactCount++;
			if (a.updatedUtc && (!source.lastUpdatedUtc || new Date(a.updatedUtc) > new Date(source.lastUpdatedUtc))) source.lastUpdatedUtc = a.updatedUtc;
			source.recentArtifacts.push({ name: nameFrom(a.relativePath), type: typeFrom(a.relativePath, a.kind), path: a.relativePath, href: artifactUrl(anchorSessionKey, a), updatedUtc: a.updatedUtc, when: whenText(a.updatedUtc) });
		});
		return Array.from(bySession.values()).map(function (s) { s.recentArtifacts = s.recentArtifacts.sort(function (a, b) { return new Date(b.updatedUtc || 0) - new Date(a.updatedUtc || 0); }).slice(0, 5); return s; }).sort(function (a, b) { return new Date(b.lastUpdatedUtc || 0) - new Date(a.lastUpdatedUtc || 0); });
	}
	function buildArtifactsBySession(summary, anchorSessionKey) {
		var groups = {};
		(summary.artifacts || []).filter(isUseful).forEach(function (a, i) {
			var key = a.owningSessionKey || "Unknown session";
			(groups[key] = groups[key] || []).push(buildFile(anchorSessionKey, a, "session-" + key.replace(/\W+/g, "-"), i, false));
		});
		Object.keys(groups).forEach(function (key) { groups[key].sort(function (a, b) { return String(b.updatedUtc || "").localeCompare(String(a.updatedUtc || "")); }); });
		return groups;
	}
	function buildSkills(summary) { return (summary.profile && summary.profile.pinnedSkillName) ? [{ id: "sales", name: summary.profile.pinnedSkillName, prototype: summary.profile.pinnedSkillPrototype || "", category: "Pinned parent skill", description: "Pinned workspace skill.", actions: [] }] : []; }
	function renderIndex() {
		var list = document.getElementById("workspace-list");
		if (!list) return;
		loadCachedJson("bws:index:list:v1", "/api/web-modules/Workspace/list", function (data, cached) {
			var workspaces = data.workspaces || [];
			if (!workspaces.length) { list.innerHTML = '<div class="bws-module-empty">No workspaces found.</div>'; return; }
			list.innerHTML = (cached ? '<div class="bws-module-cache-note">Showing cached workspaces while refreshing...</div>' : '') + workspaces.map(function (workspace) { return '<article class="bws-workspace-row"><div><strong>' + esc(workspace.workspaceName) + '</strong><small>' + esc(workspace.workspaceKey) + ' · ' + esc(workspace.sessionCount) + ' sessions</small></div><a class="bws-module-button" href="' + esc(workspaceUrl(workspace.workspaceKey, "")) + '">Open</a></article>'; }).join("");
		}, function (error) { list.innerHTML = '<div class="bws-module-empty">' + esc(error.message) + '</div>'; });
	}
	function renderWorkbench() {
		var root = document.getElementById("workspace-page-root");
		if (!root) return;
		var workspaceKey = qs("workspaceKey"), sessionKey = qs("sessionKey");
		if (!workspaceKey && !sessionKey) { root.innerHTML = '<div class="bws-module-empty">Missing workspaceKey or sessionKey.</div>'; return; }
		var summaryUrl = workspaceKey
			? "/api/web-modules/Workspace/summary?workspaceKey=" + encodeURIComponent(workspaceKey) + "&sessionKey=" + encodeURIComponent(sessionKey)
			: "/api/web-modules/Workspace/current?sessionKey=" + encodeURIComponent(sessionKey);
		var summaryCacheKey = workspaceKey
			? "bws:summary:" + workspaceKey + ":" + sessionKey + ":v1"
			: "bws:current:" + sessionKey + ":v1";
		loadCachedJson(summaryCacheKey, summaryUrl, function (summary) {
			if (!summary.isAttached && !workspaceKey) {
				root.innerHTML = '<div class="bws-module-empty">This session is not attached to a workspace.</div>';
				return;
			}
			if (!workspaceKey && summary.workspaceKey) {
				history.replaceState(null, "", workspaceUrl(summary.workspaceKey, sessionKey));
			}
			var anchor = sessionKey || summary.currentSessionKey || (summary.sessions && summary.sessions[0] && summary.sessions[0].sessionKey) || "";
			var pins = buildPins(summary, anchor);
			var files = pins.concat(buildFiles(summary, anchor));
			window.WORKSPACE_WORKBENCH_DATA = { workspaceKey: summary.workspaceKey, parentSessionKey: anchor, files: files, importantFiles: pins, pinnedFiles: pins, pins: pins, skills: buildSkills(summary), actions: [], sources: buildSources(summary), sessionSourceCards: buildSessionSourceCards(summary, anchor), artifactsBySession: buildArtifactsBySession(summary, anchor) };
			root.innerHTML = '<workspace-workbench id="workspace-workbench"></workspace-workbench>';
			var workbench = root.querySelector("workspace-workbench");
			workbench.configure({ workspace: { key: summary.workspaceKey, sessionKey: anchor, name: summary.workspaceName || summary.workspaceKey, description: "Find shared artifacts, pinned material, skills, and source sessions." } });
			workbench.start();
		}, function (error) { root.innerHTML = '<div class="bws-module-empty">' + esc(error.message) + '</div>'; });
	}
	renderIndex();
	renderWorkbench();
})();
