(function (root) {
	"use strict";
	const DEFINITIONS = Object.freeze({
		html: Object.freeze({ label: "HTML", name: "HTML", mode: "text/html", assets: ["xml", "javascript", "css", "htmlmixed"] }),
		css: Object.freeze({ label: "CSS", name: "CSS", mode: "text/css", assets: ["css"] }),
		javascript: Object.freeze({ label: "JS", name: "JavaScript", mode: "javascript", assets: ["javascript"] }),
		typescript: Object.freeze({ label: "TS", name: "TypeScript", mode: Object.freeze({ name: "javascript", typescript: true }), assets: ["javascript"] }),
		json: Object.freeze({ label: "JSON", name: "JSON", mode: Object.freeze({ name: "javascript", json: true }), assets: ["javascript"] }),
		csharp: Object.freeze({ label: "C#", name: "C#", mode: "text/x-csharp", assets: ["clike"] }),
		protoscript: Object.freeze({ label: "PTS", name: "ProtoScript", mode: "text/x-protoscript", assets: ["clike", "protoscript"] }),
		xml: Object.freeze({ label: "XML", name: "XML", mode: "application/xml", assets: ["xml"] }),
		sql: Object.freeze({ label: "SQL", name: "SQL", mode: "text/x-sql", assets: ["sql"] }),
		shell: Object.freeze({ label: "SH", name: "Shell", mode: "text/x-sh", assets: ["shell"] }),
		powershell: Object.freeze({ label: "PS", name: "PowerShell", mode: "application/x-powershell", assets: ["powershell"] }),
		text: Object.freeze({ label: "TXT", name: "Plain text", mode: null, assets: [] })
	});
	const EXTENSIONS = Object.freeze({
		".html": "html", ".htm": "html", ".css": "css",
		".js": "javascript", ".mjs": "javascript", ".cjs": "javascript", ".jsx": "javascript",
		".ts": "typescript", ".tsx": "typescript", ".json": "json",
		".cs": "csharp", ".pts": "protoscript", ".xml": "xml",
		".sql": "sql", ".sh": "shell", ".bash": "shell",
		".ps1": "powershell", ".psm1": "powershell", ".psd1": "powershell",
		".txt": "text"
	});
	function extension(path) {
		const name = String(path || "").replace(/\\/g, "/").split("/").pop() || "";
		const index = name.lastIndexOf(".");
		return index > 0 ? name.slice(index).toLowerCase() : "";
	}
	function detect(path) {
		const id = EXTENSIONS[extension(path)] || "text";
		return Object.freeze({ id, ...DEFINITIONS[id] });
	}
	root.BuffalySourceLanguage = Object.freeze({ detect, definitions: DEFINITIONS, extensions: EXTENSIONS });
})(window);
