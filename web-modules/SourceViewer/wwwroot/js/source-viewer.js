(function () {
	"use strict";
	const query = new URLSearchParams(window.location.search);
	const requestedPath = (query.get("path") || "").trim();
	const title = document.getElementById("title");
	const path = document.getElementById("path");
	const kind = document.getElementById("kind");
	const status = document.getElementById("status");
	const copy = document.getElementById("copy");
	const close = document.getElementById("close");
	let editor = null;

	function fail(message) { status.textContent = message; status.classList.add("error"); }
	function addScript(name) { return new Promise((resolve, reject) => { const script = document.createElement("script"); script.src = "vendor/codemirror/mode/" + name + "/" + name + ".js?v=2"; script.onload = resolve; script.onerror = () => reject(new Error("Could not load Source Viewer syntax mode: " + name)); document.head.appendChild(script); }); }
	async function loadLanguage(language) { for (const asset of language.assets) await addScript(asset); }

	async function load() {
		if (!requestedPath) { fail("A source file path is required."); return; }
		path.textContent = requestedPath;
		try {
			const response = await fetch("/api/buffaly.source-viewer/source-file?path=" + encodeURIComponent(requestedPath), { credentials: "same-origin" });
			if (!response.ok) {
				const body = await response.json().catch(() => null);
				throw new Error(body && body.message ? body.message : "Source file request failed (" + response.status + ").");
			}
			const model = await response.json();
			const language = window.BuffalySourceLanguage.detect(model.path);
			await loadLanguage(language);
			title.textContent = model.name;
			path.textContent = model.path;
			kind.textContent = language.label;
			kind.title = language.name;
			document.title = model.name + " - Source Viewer";
			editor = CodeMirror.fromTextArea(document.getElementById("source"), { mode: language.mode, lineNumbers: true, readOnly: true, lineWrapping: false });
			editor.setValue(model.text);
			copy.disabled = false;
			status.textContent = model.length.toLocaleString() + " bytes | " + language.name + " | Read only";
		} catch (error) { fail(error.message); }
	}

	copy.addEventListener("click", async function () { if (!editor) return; await navigator.clipboard.writeText(editor.getValue()); status.textContent = "Copied source."; });
	close.addEventListener("click", function () { window.close(); });
	window.addEventListener("unload", function () { editor = null; }, { once: true });
	void load();
})();
