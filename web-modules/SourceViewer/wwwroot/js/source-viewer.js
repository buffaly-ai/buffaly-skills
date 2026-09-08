(function () {
	"use strict";
	const query = new URLSearchParams(window.location.search);
	const requestedPath = (query.get("path") || "").trim();
	const navigationRoot = (query.get("root") || requestedPath).trim();
	const downloadUrl = (query.get("download") || "").trim();
	const title = document.getElementById("title");
	const path = document.getElementById("path");
	const kind = document.getElementById("kind");
	const status = document.getElementById("status");
	const copy = document.getElementById("copy");
	const preview = document.getElementById("preview");
	const download = document.getElementById("download");
	const close = document.getElementById("close");
	const directory = document.getElementById("directory");
	const editorHost = document.querySelector(".source-viewer__editor");
	const previewHost = document.getElementById("preview-host");
	const previewFrame = document.getElementById("preview-frame");
	let editor = null;
	let sourceText = null;
	let previewing = false;

	function fail(message) { status.textContent = message; status.classList.add("error"); }
	function addScript(name) { return new Promise((resolve, reject) => { const script = document.createElement("script"); script.src = "vendor/codemirror/mode/" + name + "/" + name + ".js?v=2"; script.onload = resolve; script.onerror = () => reject(new Error("Could not load Source Viewer syntax mode: " + name)); document.head.appendChild(script); }); }
	async function loadLanguage(language) { for (const asset of language.assets) await addScript(asset); }
	function targetUrl(targetPath) { const url = new URL(location.href); url.search = ""; url.searchParams.set("path", targetPath); url.searchParams.set("root", navigationRoot); return url.href; }
	function genericFileUrl(targetPath) { return "buffaly://file/open?path=" + encodeURIComponent(targetPath); }
	function childPath(folderPath, name) { return folderPath.replace(/[\\\/]$/, "") + (folderPath.includes("\\") ? "\\" : "/") + name; }
	function navigateDirectory(targetPath) { location.assign(targetUrl(targetPath)); }
	function openFile(targetPath) { if (window.BuffalySourceLanguage.detect(targetPath).id !== "text" || /\.txt$/i.test(targetPath)) location.assign(targetUrl(targetPath)); else location.assign(genericFileUrl(targetPath)); }

	function renderDirectory(model) {
		const folder = model.directory;
		title.textContent = folder.name;
		path.textContent = folder.path;
		kind.textContent = "DIR";
		kind.title = "Directory";
		document.title = folder.name + " - Source Viewer";
		copy.hidden = true;
		editorHost.hidden = true;
		directory.hidden = false;
		if (folder.canGoUp) {
			const up = document.createElement("button");
			up.type = "button"; up.className = "source-viewer__entry source-viewer__entry--up"; up.textContent = "..  Up";
			up.addEventListener("click", () => navigateDirectory(folder.parentPath));
			directory.appendChild(up);
		}
		for (const entry of folder.entries) {
			const targetPath = childPath(folder.path, entry.name);
			const canOpen = entry.kind !== "locked";
			const row = document.createElement("button");
			row.type = "button";
			row.className = "source-viewer__entry";
			row.disabled = !canOpen;
			const marker = entry.kind === "directory" ? "DIR" : entry.kind === "file" ? "FILE" : "LOCKED";
			row.innerHTML = '<span class="source-viewer__entry-kind"></span><span class="source-viewer__entry-name"></span>';
			row.querySelector(".source-viewer__entry-kind").textContent = marker;
			row.querySelector(".source-viewer__entry-name").textContent = entry.name;
			if (!canOpen) row.title = "Entry navigation is disabled.";
			else row.addEventListener("click", () => entry.kind === "directory" ? navigateDirectory(targetPath) : openFile(targetPath));
			directory.appendChild(row);
		}
		if (!folder.entries.length) {
			const empty = document.createElement("p"); empty.className = "source-viewer__empty"; empty.textContent = "This directory is empty."; directory.appendChild(empty);
		}
		status.textContent = folder.totalCount.toLocaleString() + " items" + (folder.truncated ? " | Showing first 500" : "") + " | Directory";
	}

	async function renderFile(model) {
		const file = model.file;
		const language = window.BuffalySourceLanguage.detect(file.path);
		await loadLanguage(language);
		title.textContent = file.name; path.textContent = file.path; kind.textContent = language.label; kind.title = language.name;
		document.title = file.name + " - Source Viewer";
		if (downloadUrl) { download.href = downloadUrl; download.hidden = false; }
		editor = CodeMirror.fromTextArea(document.getElementById("source"), { mode: language.mode, lineNumbers: true, readOnly: true, lineWrapping: false });
		sourceText = file.text; editor.setValue(sourceText); copy.disabled = false;
		if (/\.html?$/i.test(file.path)) preview.hidden = false;
		status.textContent = file.length.toLocaleString() + " bytes | " + language.name + " | Read only";
	}

	function togglePreview() {
		if (!editor || preview.hidden) return;
		previewing = !previewing;
		editorHost.hidden = previewing;
		previewHost.hidden = !previewing;
		preview.textContent = previewing ? "Source" : "Preview";
		preview.setAttribute("aria-pressed", previewing ? "true" : "false");
		if (previewing && !previewFrame.src) previewFrame.src = "/api/buffaly.source-viewer/html-preview?path=" + encodeURIComponent(requestedPath);
		status.textContent = previewing ? "Rendered HTML preview | Isolated" : sourceText.length.toLocaleString() + " characters | HTML | Read only";
	}

	async function load() {
		if (!requestedPath) { fail("A source path is required."); return; }
		path.textContent = requestedPath;
		try {
			const url = "/api/buffaly.source-viewer/source-target?path=" + encodeURIComponent(requestedPath) + "&root=" + encodeURIComponent(navigationRoot);
			const response = await fetch(url, { credentials: "same-origin", cache: "no-store" });
			const body = await response.json().catch(() => null);
			if (!response.ok) throw new Error(body && body.message ? body.message : "Source target request failed (" + response.status + ").");
			if (body.kind === "directory") renderDirectory(body); else await renderFile(body);
		} catch (error) { fail(error.message); }
	}

	copy.addEventListener("click", async function () { if (sourceText === null) return; await navigator.clipboard.writeText(sourceText); status.textContent = "Copied source."; });
	preview.addEventListener("click", togglePreview);
	close.addEventListener("click", function () { window.close(); });
	window.addEventListener("unload", function () { previewFrame.src = "about:blank"; editor = null; sourceText = null; }, { once: true });
	void load();
})();
