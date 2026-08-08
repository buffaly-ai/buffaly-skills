(function () {
	"use strict";

	const stylesheetHref = "/web-modules/Workspace/css/buffaly-workspace-session-ui.css?v=0.1.1";

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

	function getWorkspaceUrl(sessionKey) {
		return "/workspace/workbench.html?sessionKey=" + encodeURIComponent(sessionKey);
	}

	function mountWorkspace(context) {
		const root = createElement("span", "bws-root");
		const trigger = createElement("a", "bws-chip", "Workspace");
		trigger.href = getWorkspaceUrl(context.sessionKey);
		trigger.setAttribute("aria-label", "Open workspace");
		root.append(trigger);
		context.slotElement.replaceChildren(root);
		return root;
	}

	function mount(context) {
		ensureStylesheet();
		if (!context.sessionKey) {
			context.slotElement.replaceChildren();
			return { dispose: function () {} };
		}
		mountWorkspace(context);
		return {
			dispose: function () {
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

