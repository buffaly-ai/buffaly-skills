(function () {
	"use strict";

	const stylesheetHref = "/web-modules/Workspace/css/buffaly-workspace-session-ui.css?v=0.1.0";

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

	function renderItem(icon, name, detail, actionText, action) {
		const item = createElement("div", "bws-item");
		item.appendChild(createElement("span", "bws-item-icon", icon));
		const copy = createElement("span", "bws-item-copy");
		copy.appendChild(createElement("strong", "bws-item-name", name));
		copy.appendChild(createElement("small", "bws-item-detail", detail));
		item.appendChild(copy);
		const button = createElement("button", "bws-item-action", actionText);
		button.type = "button";
		button.addEventListener("click", action);
		item.appendChild(button);
		return item;
	}

	function mountWorkspace(context, summary) {
		const root = createElement("span", "bws-root");
		const trigger = createElement("button", "bws-chip", "Workspace: " + summary.workspaceName);
		trigger.type = "button";
		trigger.setAttribute("aria-expanded", "false");
		trigger.setAttribute("aria-haspopup", "dialog");
		const drawer = createElement("section", "bws-drawer");
		drawer.hidden = true;
		drawer.setAttribute("aria-label", summary.workspaceName + " workspace");
		const heading = createElement("div", "bws-heading");
		heading.appendChild(createElement("strong", "bws-title", summary.workspaceName));
		heading.appendChild(createElement("small", "bws-subtitle", summary.sessions.length + " linked sessions"));
		const close = createElement("button", "bws-close", "×");
		close.type = "button";
		close.setAttribute("aria-label", "Close workspace drawer");
		heading.appendChild(close);
		drawer.appendChild(heading);

		const tabs = createElement("div", "bws-tabs");
		const filesTab = createElement("button", "bws-tab is-active", "Shared files " + summary.artifacts.length);
		const sessionsTab = createElement("button", "bws-tab", "Sessions " + summary.sessions.length);
		filesTab.type = sessionsTab.type = "button";
		tabs.append(filesTab, sessionsTab);
		drawer.appendChild(tabs);
		const files = createElement("div", "bws-list");
		const sessions = createElement("div", "bws-list");
		sessions.hidden = true;

		summary.artifacts.forEach(function (artifact) {
			files.appendChild(renderItem(artifact.kind === "Directory" ? "📁" : "📄", artifact.relativePath, artifact.kind === "Directory" ? "Shared folder" : artifact.length + " bytes", "Open", function () {
				window.dispatchEvent(new CustomEvent("buffaly:workspace-artifact-open", { detail: artifact }));
			}));
		});
		if (summary.artifacts.length === 0) {
			files.appendChild(createElement("div", "bws-empty", "No shared artifacts yet."));
		}

		summary.sessions.forEach(function (session) {
			sessions.appendChild(renderItem("💬", session.sessionKey, session.isCurrent ? "Current session" : "Linked session", session.isCurrent ? "Current" : "Open", function () {
				if (!session.isCurrent) {
					window.location.href = "/buffaly-agent-next.html?sessionKey=" + encodeURIComponent(session.sessionKey);
				}
			}));
		});

		drawer.append(files, sessions);
		root.append(trigger, drawer);
		context.slotElement.replaceChildren(root);

		function setOpen(open) {
			drawer.hidden = !open;
			trigger.setAttribute("aria-expanded", open ? "true" : "false");
			if (open) {
				close.focus();
			}
		}

		function select(filesSelected) {
			files.hidden = !filesSelected;
			sessions.hidden = filesSelected;
			filesTab.classList.toggle("is-active", filesSelected);
			sessionsTab.classList.toggle("is-active", !filesSelected);
		}

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
			mountWorkspace(context, summary);
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

	window.BuffalyAgentNextExtensions.register({
		id: "workspace.current-session",
		slot: "sessionHeader.context",
		mount: mount
	});
})();
