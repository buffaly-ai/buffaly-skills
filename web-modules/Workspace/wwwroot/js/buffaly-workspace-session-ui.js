(function () {
	"use strict";

	const stylesheetHref = "/web-modules/Workspace/css/buffaly-workspace-session-ui.css?v=0.1.1";
	const identityBySessionKey = new Map();

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

	function getWorkspaceUrl(workspaceKey, sessionKey) {
		return "/workspace/workbench.html?workspaceKey=" + encodeURIComponent(workspaceKey) + "&sessionKey=" + encodeURIComponent(sessionKey);
	}

	function loadIdentity(sessionKey, signal) {
		if (identityBySessionKey.has(sessionKey)) {
			return Promise.resolve(identityBySessionKey.get(sessionKey));
		}
		return fetch("/api/web-modules/Workspace/identity?sessionKey=" + encodeURIComponent(sessionKey), {
			headers: { "Accept": "application/json" },
			cache: "no-store",
			signal: signal
		}).then(function (response) {
			if (!response.ok) {
				throw new Error("Workspace identity request failed with status " + response.status + ".");
			}
			return response.json();
		}).then(function (identity) {
			identityBySessionKey.set(sessionKey, identity);
			return identity;
		});
	}

	function mountWorkspace(context, identity) {
		const root = createElement("span", "bws-root");
		const trigger = createElement("a", "bws-chip", "Workspace");
		trigger.href = getWorkspaceUrl(identity.workspaceKey, context.sessionKey);
		trigger.setAttribute("aria-label", "Open workspace");
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
		context.slotElement.replaceChildren();
		loadIdentity(context.sessionKey, abort.signal).then(function (identity) {
			if (abort.signal.aborted || !identity.isAttached) {
				return;
			}
			mountWorkspace(context, identity);
		}).catch(function (error) {
			if (error.name !== "AbortError") {
				context.diagnostics.report({ Type: "workspace-identity-failed", Message: error.message });
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

