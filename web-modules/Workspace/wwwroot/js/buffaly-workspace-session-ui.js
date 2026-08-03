(function () {
	"use strict";

	const stylesheetHref = "/web-modules/Workspace/css/buffaly-workspace-session-ui.css?v=0.1.1";
	const viewStateBySessionKey = new Map();

	function getNextExtensions() {
		return window.BuffalyAgentNextExtensions;
	}

	function ensureStylesheet() {
		if (document.querySelector('link[data-bws-styles="true"]')) {
			return;
		}
		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = stylesheetHref;
		link.dataset.bwsStyles = "true";
		document.head.appendChild(link);
	}

	function createElement(tag, className, text) {
		const element = document.createElement(tag);
		if (className) {
			element.className = className;
		}
		if (text !== undefined) {
			element.textContent = text;
		}
		return element;
	}

	function cacheGet(key) {
		try {
			const raw = sessionStorage.getItem(key);
			return raw ? JSON.parse(raw) : null;
		} catch (_) {
			return null;
		}
	}

	function cacheSet(key, value) {
		try {
			sessionStorage.setItem(key, JSON.stringify({ storedUtc: new Date().toISOString(), value: value }));
		} catch (_) {
		}
	}

	function loadSummary(sessionKey, signal, onRefresh) {
		const cacheKey = "bws:current:" + sessionKey + ":v1";
		const cached = cacheGet(cacheKey);
		const request = fetch("/api/web-modules/Workspace/current?sessionKey=" + encodeURIComponent(sessionKey), {
			method: "GET",
			headers: { "Accept": "application/json" },
			cache: "no-store",
			signal: signal
		}).then(function (response) {
			if (!response.ok) {
				throw new Error("Workspace summary request failed with status " + response.status + ".");
			}
			return response.json();
		}).then(function (summary) {
			cacheSet(cacheKey, summary);
			if (cached && cached.value && !signal.aborted && typeof onRefresh === "function") {
				onRefresh(summary);
			}
			return summary;
		});
		if (cached && cached.value) {
			request.catch(function () { });
			return Promise.resolve(cached.value);
		}
		return request;
	}

	function getArtifactUrl(sessionKey, artifact) {
		return "/api/web-modules/Workspace/session-artifact?sessionKey=" + encodeURIComponent(sessionKey) + "&owningSessionKey=" + encodeURIComponent(artifact.owningSessionKey) + "&path=" + encodeURIComponent(artifact.relativePath);
	}

	function getWorkspaceUrl(summary, sessionKey) {
		return "/workspace/workbench.html?workspaceKey=" + encodeURIComponent(summary.workspaceKey) + "&sessionKey=" + encodeURIComponent(sessionKey);
	}

	function getFileTypeLabel(artifact) {
		const name = String(artifact && artifact.relativePath || "").toLowerCase();
		if (artifact && artifact.kind === "Directory") { return "DIR"; }
		if (/\.pdf$/.test(name)) { return "PDF"; }
		if (/\.(html?|url)$/.test(name)) { return "WEB"; }
		if (/\.md$/.test(name)) { return "MD"; }
		if (/\.(png|jpe?g|webp|gif|svg)$/.test(name)) { return "IMG"; }
		if (/\.zip$/.test(name)) { return "ZIP"; }
		if (/\.json$/.test(name)) { return "JSON"; }
		if (/\.txt$/.test(name)) { return "TXT"; }
		return "FILE";
	}

	function moveArtifact(sessionKey, artifact, destinationPath, signal) {
		return fetch("/api/web-modules/Workspace/move-session-artifact", { method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" }, signal: signal, body: JSON.stringify({ sessionKey: sessionKey, owningSessionKey: artifact.owningSessionKey, sourcePath: artifact.relativePath, destinationPath: destinationPath }) }).then(function (response) {
			if (!response.ok) { return response.text().then(function (message) { throw new Error(message || "Workspace artifact move failed with status " + response.status + "."); }); }
			return response.json();
		});
	}

	function renderItem(icon, name, detail, actionText, action) {
		const item = createElement("div", "bws-item");
		item.appendChild(createElement("span", "bws-item-icon", icon));
		const copy = createElement("span", "bws-item-copy");
		copy.appendChild(createElement("strong", "bws-item-name", name));
		copy.appendChild(createElement("small", "bws-item-detail", detail));
		item.appendChild(copy);
		if (actionText) {
			const actionElement = action && action.href ? createElement("a", "bws-item-action", actionText) : createElement("button", "bws-item-action", actionText);
			if (action && action.href) {
				actionElement.href = action.href;
				actionElement.target = "_blank";
				actionElement.rel = "noopener noreferrer";
			} else {
				actionElement.type = "button";
				actionElement.addEventListener("click", action);
			}
			item.appendChild(actionElement);
		}
		return item;
	}

	function openActionPanel(drawer, action) {
		let panel = drawer.querySelector(".bws-action-panel");
		if (!panel) { panel = createElement("section", "bws-action-panel"); drawer.prepend(panel); }
		panel.replaceChildren();
		const close = createElement("button", "bws-action-panel-close", "×"); close.type = "button"; close.setAttribute("aria-label", "Close action panel"); close.addEventListener("click", function () { panel.remove(); });
		panel.append(close, createElement("small", "bws-profile-label", "PROMPT ACTION"), createElement("h3", "", action.displayName), createElement("code", "", action.prototypeName));
		const templateLabel = createElement("label", "bws-field"); templateLabel.append(createElement("span", "", "Template")); const template = createElement("input"); template.value = action.templateName; templateLabel.append(template);
		const targetLabel = createElement("label", "bws-field"); targetLabel.append(createElement("span", "", "Organization or target")); const target = createElement("input"); target.placeholder = "Enter company, website, or lead"; targetLabel.append(target);
		const instructionsLabel = createElement("label", "bws-field"); instructionsLabel.append(createElement("span", "", "Instructions")); const instructions = createElement("textarea"); instructions.rows = 4; instructions.placeholder = "Add action-specific context"; instructionsLabel.append(instructions);
		const prepare = createElement("button", "bws-prepare-action", "Prepare action"); prepare.type = "button"; prepare.addEventListener("click", function () {
			const targetValue = target.value.trim();
			if (!targetValue) { target.focus(); return; }
			const instruction = "Use " + action.prototypeName + " for " + targetValue + ".\nTemplate: " + template.value.trim() + (instructions.value.trim() ? "\nInstructions: " + instructions.value.trim() : "");
			getNextExtensions().populateComposer(instruction);
			panel.remove();
		});
		panel.append(templateLabel, targetLabel, instructionsLabel, prepare);
		target.focus();
	}

	function mountWorkspace(context, summary, signal) {
		const root = createElement("span", "bws-root");
		const trigger = createElement("a", "bws-chip", "Workspace: " + summary.workspaceName);
		trigger.href = getWorkspaceUrl(summary, context.sessionKey);
		trigger.setAttribute("aria-label", "Open workspace " + summary.workspaceName);
		root.append(trigger);
		context.slotElement.replaceChildren(root);
		return root;
	}

	function mount(context) {
		ensureStylesheet();
		const abort = new AbortController();
		if (!context.sessionKey) {
			context.slotElement.replaceChildren();
			return { dispose: function () { abort.abort(); } };
		}
		function render(summary) {
			if (!summary.isAttached || abort.signal.aborted) {
				context.slotElement.replaceChildren();
				return;
			}
			mountWorkspace(context, summary, abort.signal);
		}
		loadSummary(context.sessionKey, abort.signal, render).then(function (summary) {
			render(summary);
		}).catch(function (error) {
			if (error.name !== "AbortError") {
				context.diagnostics.report({ Type: "workspace-summary-failed", Message: error.message });
			}
		});
		return {
			dispose: function () {
				abort.abort();
				context.slotElement.replaceChildren();
			}
		};
	}

	const extensions = getNextExtensions();
	if (!extensions || typeof extensions.register !== "function") {
		return;
	}

	extensions.register({
		id: "workspace.current-session",
		slot: "sessionHeader.context",
		mount: mount
	});
})();

