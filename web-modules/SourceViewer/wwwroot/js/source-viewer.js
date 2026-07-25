(function () {
	"use strict";
	const query = new URLSearchParams(window.location.search);
	const requestedPath = (query.get("path") || "").trim();
	const requestedLanguage = (query.get("language") || "text").trim().toLowerCase();
	const languages = Object.freeze({
		javascript: Object.freeze({ mode: "javascript", kind: "JS" }),
		csharp: Object.freeze({ mode: "text/x-csharp", kind: "C#" }),
		text: Object.freeze({ mode: null, kind: "TXT" })
	});
	const language = languages[requestedLanguage] || languages.text;
	const title = document.getElementById("title");
	const path = document.getElementById("path");
	const kind = document.getElementById("kind");
	const status = document.getElementById("status");
	const copy = document.getElementById("copy");
	const close = document.getElementById("close");
	let editor = null;

	function fail(message) { status.textContent = message; status.classList.add("error"); }

	async function load() {
		if (!requestedPath) { fail("A source file path is required."); return; }
		path.textContent = requestedPath;
		kind.textContent = language.kind;
		try {
			const response = await fetch("/api/buffaly.source-viewer/source-file?path=" + encodeURIComponent(requestedPath), { credentials: "same-origin" });
			if (!response.ok) {
				const body = await response.json().catch(() => null);
				throw new Error(body && body.message ? body.message : "Source file request failed (" + response.status + ").");
			}
			const model = await response.json();
			title.textContent = model.name;
			path.textContent = model.path;
			document.title = model.name + " — Source Viewer";
			editor = CodeMirror.fromTextArea(document.getElementById("source"), { mode: language.mode, lineNumbers: true, readOnly: true, lineWrapping: false });
			editor.setValue(model.text);
			copy.disabled = false;
			status.textContent = model.length.toLocaleString() + " bytes · Read only";
		} catch (error) { fail(error.message); }
	}

	copy.addEventListener("click", async function () { if (!editor) return; await navigator.clipboard.writeText(editor.getValue()); status.textContent = "Copied source."; });
	close.addEventListener("click", function () { window.close(); });
	window.addEventListener("unload", function () { editor = null; }, { once: true });
	void load();
})();
