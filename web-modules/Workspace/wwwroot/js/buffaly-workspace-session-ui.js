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

	function loadSummary(sessionKey, signal) {
		return fetch("/api/web-modules/Workspace/current?sessionKey=" + encodeURIComponent(sessionKey), {
			method: "GET",
			headers: { "Accept": "application/json" },
			signal: signal
		}).then(function (response) {
			if (!response.ok) {
				throw new Error("Workspace summary request failed with status " + response.status + ".");
			}
			return response.json();
		});
	}

	function getArtifactUrl(sessionKey, artifact) {
		return "/api/web-modules/Workspace/session-artifact?sessionKey=" + encodeURIComponent(sessionKey) + "&owningSessionKey=" + encodeURIComponent(artifact.owningSessionKey) + "&path=" + encodeURIComponent(artifact.relativePath);
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
		const viewState = viewStateBySessionKey.get(context.sessionKey) || { isOpen: false, selectedTab: "files" };
		const root = createElement("span", "bws-root");
		const trigger = createElement("button", "bws-chip", "Workspace: " + summary.workspaceName);
		trigger.type = "button";
		trigger.setAttribute("aria-expanded", viewState.isOpen ? "true" : "false");
		trigger.setAttribute("aria-haspopup", "dialog");
		const drawer = createElement("section", "bws-drawer");
		drawer.hidden = !viewState.isOpen;
		drawer.setAttribute("aria-label", summary.workspaceName + " workspace");
		const heading = createElement("div", "bws-heading");
		heading.appendChild(createElement("strong", "bws-title", summary.workspaceName));
		heading.appendChild(createElement("small", "bws-subtitle", summary.sessions.length + " linked sessions"));
		const close = createElement("button", "bws-close", "×");
		close.type = "button";
		close.setAttribute("aria-label", "Close workspace drawer");
		heading.appendChild(close);
		const openFiles = createElement("button", "bws-open-files", "Open Files drawer");
		openFiles.type = "button";
		openFiles.addEventListener("click", function () {
			const extensions = getNextExtensions();
			if (extensions && typeof extensions.openFilesDrawer === "function") {
				extensions.openFilesDrawer();
			}
		});
		heading.appendChild(openFiles);
		const openWorkspace = createElement("button", "bws-open-workspace", "Open workspace");
		openWorkspace.type = "button";
		openWorkspace.addEventListener("click", function () {
			window.BuffalyWorkspaceWorkbench.open(context.sessionKey, summary);
		});
		heading.appendChild(openWorkspace);
		drawer.appendChild(heading);

		if (summary.profile) {
			const profile = createElement("section", "bws-profile");
			profile.appendChild(createElement("small", "bws-profile-label", "PINNED SKILL"));
			profile.appendChild(createElement("strong", "bws-profile-name", summary.profile.pinnedSkillName));
			profile.appendChild(createElement("code", "bws-profile-prototype", summary.profile.pinnedSkillPrototype));
			const actions = createElement("div", "bws-actions");
			summary.profile.actions.forEach(function (action) {
				const button = createElement("button", "bws-action");
				button.type = "button";
				button.append(createElement("strong", "", action.displayName), createElement("small", "", action.prototypeName));
				button.addEventListener("click", function () { openActionPanel(drawer, action); });
				actions.appendChild(button);
			});
			profile.appendChild(actions);
			drawer.appendChild(profile);
		}

		const tabs = createElement("div", "bws-tabs");
		const filesTab = createElement("button", "bws-tab is-active", "Shared files " + summary.artifacts.length);
		const sessionsTab = createElement("button", "bws-tab", "Sessions " + summary.sessions.length);
		filesTab.type = sessionsTab.type = "button";
		tabs.append(filesTab, sessionsTab);
		drawer.appendChild(tabs);
		const files = createElement("div", "bws-list");
		const sessions = createElement("div", "bws-list");
		sessions.hidden = true;

		function renderArtifacts() {
			files.replaceChildren();
			summary.artifacts.forEach(function (artifact) {
			const isDirectory = artifact.kind === "Directory";
			const item = renderItem(getFileTypeLabel(artifact), artifact.relativePath, artifact.owningSessionKey + (isDirectory ? " · folder" : " · " + artifact.length + " bytes"), isDirectory ? "" : "Open", isDirectory ? null : { href: getArtifactUrl(context.sessionKey, artifact) });
			if (!isDirectory) {
				const move = createElement("button", "bws-item-move", "Move"); move.type = "button";
				move.addEventListener("click", function () {
					const destination = window.prompt("Move inside " + artifact.owningSessionKey + " artifacts to:", artifact.relativePath);
					if (!destination || destination === artifact.relativePath || !window.confirm("Move " + artifact.relativePath + " to " + destination + "?")) return;
					move.disabled = true;
					moveArtifact(context.sessionKey, artifact, destination, signal).then(function () { return loadSummary(context.sessionKey, signal); }).then(function (next) { summary = next; renderArtifacts(); }).catch(function (error) { window.alert(error.message); }).finally(function () { move.disabled = false; });
				});
				item.appendChild(move);
			}
			files.appendChild(item);
			});
			if (summary.artifacts.length === 0) files.appendChild(createElement("div", "bws-empty", "No shared artifacts yet."));
		}
		renderArtifacts();

		summary.sessions.forEach(function (session) {
			sessions.appendChild(renderItem("💬", session.sessionKey, session.isCurrent ? "Current session" : "Linked session", session.isCurrent ? "" : "Open", function () {
				if (!session.isCurrent) {
					window.location.href = "/buffaly-agent-next.html?sessionKey=" + encodeURIComponent(session.sessionKey);
				}
			}));
		});

		drawer.append(files, sessions);
		root.append(trigger, drawer);
		context.slotElement.replaceChildren(root);

		function setOpen(open) {
			viewState.isOpen = open;
			viewStateBySessionKey.set(context.sessionKey, viewState);
			drawer.hidden = !open;
			trigger.setAttribute("aria-expanded", open ? "true" : "false");
			if (open) {
				close.focus();
			}
		}

		function select(filesSelected) {
			viewState.selectedTab = filesSelected ? "files" : "sessions";
			viewStateBySessionKey.set(context.sessionKey, viewState);
			files.hidden = !filesSelected;
			sessions.hidden = filesSelected;
			filesTab.classList.toggle("is-active", filesSelected);
			sessionsTab.classList.toggle("is-active", !filesSelected);
		}

		select(viewState.selectedTab !== "sessions");
		trigger.addEventListener("click", function () { setOpen(drawer.hidden); });
		close.addEventListener("click", function () { setOpen(false); trigger.focus(); });
		filesTab.addEventListener("click", function () { select(true); });
		sessionsTab.addEventListener("click", function () { select(false); });
		return root;
	}

	function mount(context) {
		ensureStylesheet();
		const abort = new AbortController();
		if (!context.sessionKey) {
			context.slotElement.replaceChildren();
			return { dispose: function () { abort.abort(); } };
		}
		loadSummary(context.sessionKey, abort.signal).then(function (summary) {
			if (!summary.isAttached || abort.signal.aborted) {
				context.slotElement.replaceChildren();
				return;
			}
			if (new URL(window.location.href).searchParams.get("workspaceView") === "workbench") {
				window.BuffalyWorkspaceWorkbench.open(context.sessionKey, summary);
			}
			mountWorkspace(context, summary, abort.signal);
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
