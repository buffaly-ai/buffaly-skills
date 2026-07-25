window.CodeReviews = (function () {
	function byId(id) { return document.getElementById(id); }
	function text(value) { return value === null || value === undefined ? "" : String(value); }
	function escapeHtml(value) { return text(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;"); }
	function log(message) { var node = byId("statusLog"); if (node) node.textContent = message; }
	function query(name) { return new URLSearchParams(window.location.search || "").get(name) || ""; }
	function encode(value) { return encodeURIComponent(text(value)); }
	function decode(value) { return decodeURIComponent(text(value).replace(/\+/g, "%20")); }
	function normalizePath(value) { return text(value).replace(/\\+/g, "\\").replace(/([^:])\/\/+/g, "$1/"); }
	function fileName(path) { var normalized = text(path).replace(/\\/g, "/"); var parts = normalized.split("/"); return parts[parts.length - 1] || normalized; }
	function normalizeDateValue(value) {
		if (!value) return "";
		if (typeof value === "string") return value;
		if (value.DateTime) return value.DateTime;
		if (value.UtcDateTime) return value.UtcDateTime;
		if (value.LocalDateTime) return value.LocalDateTime;
		if (value.Value) return normalizeDateValue(value.Value);
		if (value.dateTime) return value.dateTime;
		return "";
	}
	function formatWhen(value) {
		var raw = normalizeDateValue(value);
		if (!raw) return "unknown";
		var date = new Date(raw);
		return isNaN(date.getTime()) ? text(raw) : date.toLocaleString();
	}
	function service() {
		return window.Buffaly && window.Buffaly.CodeReviews && window.Buffaly.CodeReviews.WebHarness && window.Buffaly.CodeReviews.WebHarness.CodeReviewsHarnessJsonWsService;
	}
	function call(methodName, request) {
		var api = service();
		if (!api || typeof api[methodName] !== "function") return Promise.reject(new Error("JsonWs stub is not loaded: " + methodName));
		return new Promise(function (resolve, reject) {
			try { api[methodName](request, resolve, reject); } catch (error) { reject(error); }
		});
	}
	function errorMessage(error) {
		if (!error) return "Unknown error";
		if (typeof error === "string") return error;
		try { return error.Message || error.message || error.Error || error.error || JSON.stringify(error) || String(error); }
		catch (_) { return String(error); }
	}
	function diffLineClass(line) {
		if (line.indexOf("+") === 0 && line.indexOf("+++") !== 0) return "add";
		if (line.indexOf("-") === 0 && line.indexOf("---") !== 0) return "remove";
		if (line.indexOf("@@") === 0 || line.indexOf("diff ") === 0 || line.indexOf("index ") === 0 || line.indexOf("---") === 0 || line.indexOf("+++") === 0) return "header";
		return "context";
	}
	function codeMirrorModeForPath(path) {
		var lower = text(path).toLowerCase();
		if (/\.(cs|java|cpp|c|h|hpp)$/.test(lower)) return "text/x-csharp";
		if (/\.(js|json|csproj|props|targets)$/.test(lower)) return "javascript";
		if (/\.(html|htm|xml|config|cshtml)$/.test(lower)) return "xml";
		if (/\.(css|scss|less)$/.test(lower)) return "css";
		if (/\.(md|markdown|pts|pts\.md)$/.test(lower)) return "markdown";
		return "diff";
	}
	function enhanceCodeBlocks(root, onEditorCreated) {
		if (!window.CodeMirror || !root) return;
		Array.prototype.forEach.call(root.querySelectorAll("textarea.code-review-code"), function (textarea) {
			if (textarea.dataset.enhanced === "true") return;
			textarea.dataset.enhanced = "true";
			var editor = window.CodeMirror.fromTextArea(textarea, {
				mode: textarea.getAttribute("data-mode") || "diff",
				readOnly: true,
				lineNumbers: true,
				viewportMargin: Infinity,
				lineWrapping: false
			});
			highlightDiffEditorLines(editor);
			if (typeof onEditorCreated === "function") onEditorCreated(textarea, editor);
		});
	}
	function highlightDiffEditorLines(editor) {
		if (!editor || typeof editor.lineCount !== "function") return;
		for (var i = 0; i < editor.lineCount(); i += 1) {
			var line = editor.getLine(i) || "";
			if (line.indexOf("+") === 0 && line.indexOf("+++") !== 0) editor.addLineClass(i, "background", "diff-line-added");
			else if (line.indexOf("-") === 0 && line.indexOf("---") !== 0) editor.addLineClass(i, "background", "diff-line-removed");
			else if (line.indexOf("@@") === 0) editor.addLineClass(i, "background", "diff-line-hunk");
			else if (line.indexOf("diff ") === 0 || line.indexOf("index ") === 0 || line.indexOf("+++") === 0 || line.indexOf("---") === 0) editor.addLineClass(i, "background", "diff-line-meta");
		}
	}
	function renderBuildFooter(info) {
		var footer = document.getElementById("codeReviewsBuildFooter");
		if (!footer) {
			footer = document.createElement("footer");
			footer.id = "codeReviewsBuildFooter";
			footer.className = "build-footer";
			document.body.appendChild(footer);
		}
		var buildId = text(info && (info.BuildId || info.buildId));
		var buildTime = info && (info.BuildTimeUtc || info.buildTimeUtc);
		footer.textContent = buildId ? "CodeReviews build " + buildId + " | " + formatWhen(buildTime) : "CodeReviews build unavailable";
	}
	function loadBuildFooter() {
		fetch("/build-info.json", { cache: "no-store" })
			.then(function (response) { if (!response.ok) throw new Error("HTTP " + response.status); return response.json(); })
			.then(renderBuildFooter)
			.catch(function () { renderBuildFooter(null); });
	}
	if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", loadBuildFooter); else loadBuildFooter();
	return { byId: byId, text: text, escapeHtml: escapeHtml, log: log, query: query, encode: encode, decode: decode, normalizePath: normalizePath, fileName: fileName, formatWhen: formatWhen, call: call, errorMessage: errorMessage, diffLineClass: diffLineClass, codeMirrorModeForPath: codeMirrorModeForPath, enhanceCodeBlocks: enhanceCodeBlocks, highlightDiffEditorLines: highlightDiffEditorLines };
})();
