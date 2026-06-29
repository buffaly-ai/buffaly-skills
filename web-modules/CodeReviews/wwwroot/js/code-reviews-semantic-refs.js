// Purpose: Register CodeReviews-owned semantic inline ref formatters for Buffaly timeline messages.
(function () {
	"use strict";

	function text(value) {
		return value === null || value === undefined ? "" : String(value);
	}

	function isEmpty(value) {
		return text(value).trim().length === 0;
	}

	function encode(value) {
		return encodeURIComponent(text(value));
	}

	function splitGitCommitValue(value) {
		const raw = text(value).trim();
		const marker = raw.lastIndexOf("#");
		if (marker <= 0 || marker >= raw.length - 1) {
			return null;
		}

		return {
			repositoryPath: raw.substring(0, marker).trim(),
			commitSha: raw.substring(marker + 1).trim()
		};
	}

	function getRepositoryName(repositoryPath) {
		const parts = text(repositoryPath).replace(/\\/g, "/").split("/").filter(Boolean);
		return parts.length > 0 ? parts[parts.length - 1] : "repository";
	}

	function getCodeReviewsBaseUrl() {
		const moduleConfig = window.BuffalyWebModuleConfig && window.BuffalyWebModuleConfig.CodeReviews;
		const configured = text(moduleConfig && moduleConfig.CodeReviewsBaseUrl).trim();
		if (!isEmpty(configured)) {
			return configured.replace(/\/+$/, "");
		}

		return window.location.origin.replace(/\/+$/, "");
	}

	// Resolve the Buffaly source session currently rendering the commit ref so CodeReviews can target it by default.
	function getSourceSessionKey() {
		const sessionContext = window.BuffalyAgentSessionContext;
		if (!sessionContext || typeof sessionContext.getActiveSessionKey !== "function") {
			return "";
		}

		return text(sessionContext.getActiveSessionKey()).trim();
	}

	function service() {
		return window.Buffaly && window.Buffaly.CodeReviews && window.Buffaly.CodeReviews.WebHarness && window.Buffaly.CodeReviews.WebHarness.CodeReviewsHarnessJsonWsService;
	}

	function call(methodName, request) {
		const api = service();
		if (!api || typeof api[methodName] !== "function") {
			return Promise.reject(new Error("JsonWs stub is not loaded: " + methodName));
		}

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

	function buildRequestFromAnchor(anchor) {
		const url = new URL(anchor.href, window.location.href);
		return {
			Environment: "Dev",
			SourceSessionKey: url.searchParams.get("sourceSessionKey") || getSourceSessionKey(),
			RepositoryName: url.searchParams.get("repo") || "",
			RepositoryPath: url.searchParams.get("path") || "",
			CommitSha: url.searchParams.get("sha") || "",
			CodeReviewUrl: url.pathname + url.search,
			ReviewMode: "Manual"
		};
	}

	function setReviewButtonState(button, state, label, title) {
		button.setAttribute("data-code-review-state", state);
		button.innerHTML = '<span class="code-reviews-trigger-agent-review-icon" aria-hidden="true">&#x2726;</span><span class="code-reviews-trigger-agent-review-label"></span>';
		button.querySelector(".code-reviews-trigger-agent-review-label").textContent = label;
		button.title = title;
	}

	function setReviewStatus(button, state, message) {
		let status = button.nextElementSibling;
		if (!status || !status.classList || !status.classList.contains("code-reviews-trigger-agent-review-status")) {
			status = document.createElement("span");
			status.className = "code-reviews-trigger-agent-review-status";
			status.setAttribute("role", "status");
			status.setAttribute("aria-live", "polite");
			button.insertAdjacentElement("afterend", status);
		}
		status.setAttribute("data-code-review-state", state);
		status.textContent = message;
	}

	function triggerCodeReviewAgent(request, button) {
		button.disabled = true;
		setReviewButtonState(button, "loading", "Reviewing", "Starting Code Review Agent...");
		setReviewStatus(button, "loading", "Starting review agent...");
		call("TriggerCodeReviewAgent", request)
			.then(function (response) {
				const child = text(response && (response.ChildSessionKey || response.childSessionKey));
				setReviewButtonState(button, "queued", child ? "Queued " + child : "Queued", text(response && (response.Message || response.message)) || "Code review child session started.");
				setReviewStatus(button, "queued", child ? "Queued child session " + child : "Review agent queued.");
			})
			.catch(function (error) {
				button.disabled = false;
				setReviewButtonState(button, "error", "Retry review", "Code review trigger failed: " + errorMessage(error));
				setReviewStatus(button, "error", "Review trigger failed: " + errorMessage(error));
			});
	}

	function enhanceRenderedCommitLinks(root) {
		const scope = root && root.querySelectorAll ? root : document;
		scope.querySelectorAll("a.code-reviews-semantic-ref-git-commit:not([data-code-review-trigger-enhanced='true'])").forEach(function (anchor) {
			anchor.setAttribute("data-code-review-trigger-enhanced", "true");
			const button = document.createElement("button");
			button.type = "button";
			button.className = "code-reviews-trigger-agent-review";
			setReviewButtonState(button, "ready", "Review", "Run Code Review Agent");
			button.addEventListener("click", function (event) {
				event.preventDefault();
				event.stopPropagation();
				triggerCodeReviewAgent(buildRequestFromAnchor(anchor), button);
			});
			anchor.insertAdjacentElement("afterend", button);
		});
	}

	function installReviewButtonStyles() {
		if (document.getElementById("code-reviews-semantic-ref-styles")) return;
		const style = document.createElement("style");
		style.id = "code-reviews-semantic-ref-styles";
		style.textContent = "\n"
			+ ".code-reviews-trigger-agent-review{appearance:none;border:0;border-radius:999px;margin-left:.45rem;padding:.23rem .62rem .25rem .5rem;display:inline-flex;align-items:center;gap:.32rem;vertical-align:baseline;font:600 11px/1.2 system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#fff;background:linear-gradient(135deg,#7c3aed 0%,#2563eb 52%,#06b6d4 100%);box-shadow:0 5px 14px rgba(37,99,235,.24),inset 0 1px 0 rgba(255,255,255,.26);cursor:pointer;transition:transform .14s ease,box-shadow .14s ease,filter .14s ease;white-space:nowrap;}\n"
			+ ".code-reviews-trigger-agent-review:hover:not(:disabled){transform:translateY(-1px);filter:saturate(1.08);box-shadow:0 7px 18px rgba(37,99,235,.32),inset 0 1px 0 rgba(255,255,255,.32);}\n"
			+ ".code-reviews-trigger-agent-review:active:not(:disabled){transform:translateY(0);box-shadow:0 3px 10px rgba(37,99,235,.24),inset 0 1px 0 rgba(255,255,255,.22);}\n"
			+ ".code-reviews-trigger-agent-review:focus-visible{outline:2px solid rgba(6,182,212,.55);outline-offset:2px;}\n"
			+ ".code-reviews-trigger-agent-review:disabled{cursor:default;opacity:.92;}\n"
			+ ".code-reviews-trigger-agent-review-icon{display:inline-grid;place-items:center;width:1.05em;height:1.05em;border-radius:999px;background:rgba(255,255,255,.2);font-size:10px;line-height:1;}\n"
			+ ".code-reviews-trigger-agent-review[data-code-review-state='loading'] .code-reviews-trigger-agent-review-icon{animation:codeReviewsReviewSpin .9s linear infinite;}\n"
			+ ".code-reviews-trigger-agent-review[data-code-review-state='queued']{background:linear-gradient(135deg,#16a34a 0%,#0d9488 100%);box-shadow:0 5px 14px rgba(13,148,136,.24),inset 0 1px 0 rgba(255,255,255,.24);}\n"
			+ ".code-reviews-trigger-agent-review[data-code-review-state='error']{background:linear-gradient(135deg,#f97316 0%,#dc2626 100%);box-shadow:0 5px 14px rgba(220,38,38,.22),inset 0 1px 0 rgba(255,255,255,.24);}\n"
			+ ".code-reviews-trigger-agent-review-status{display:inline-flex;align-items:center;margin-left:.38rem;padding:.15rem .45rem;border-radius:999px;font:600 11px/1.2 system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#eef2ff;color:#3730a3;vertical-align:baseline;}\n"
			+ ".code-reviews-trigger-agent-review-status[data-code-review-state='queued']{background:#dcfce7;color:#166534;}\n"
			+ ".code-reviews-trigger-agent-review-status[data-code-review-state='error']{background:#fee2e2;color:#991b1b;}\n"
			+ "@keyframes codeReviewsReviewSpin{to{transform:rotate(360deg);}}\n";
		(document.head || document.documentElement).appendChild(style);
	}

	function startCommitLinkEnhancer() {
		installReviewButtonStyles();
		enhanceRenderedCommitLinks(document);
		if (typeof MutationObserver !== "function") return;
		const observer = new MutationObserver(function (mutations) {
			mutations.forEach(function (mutation) {
				mutation.addedNodes && mutation.addedNodes.forEach(function (node) {
					if (node && node.nodeType === 1) enhanceRenderedCommitLinks(node);
				});
			});
		});
		observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
	}

	window.BuffalySemanticRefFormatters = window.BuffalySemanticRefFormatters || {};
	window.BuffalySemanticRefFormatters["git-commit"] = function (ref) {
		const parsed = splitGitCommitValue(ref && ref.value);
		if (!parsed || isEmpty(parsed.repositoryPath) || isEmpty(parsed.commitSha)) {
			return null;
		}

		const repoName = getRepositoryName(parsed.repositoryPath);
		const shortSha = parsed.commitSha.substring(0, 7);
		const sourceSessionKey = getSourceSessionKey();
		const href = getCodeReviewsBaseUrl()
			+ "/diff.html?repo=" + encode(repoName)
			+ "&path=" + encode(parsed.repositoryPath)
			+ "&sha=" + encode(parsed.commitSha)
			+ "&mode=commit"
			+ (isEmpty(sourceSessionKey) ? "" : "&sourceSessionKey=" + encode(sourceSessionKey));

		return {
			href: href,
			text: text(ref && ref.label).trim() || shortSha,
			title: "Open commit in CodeReviews",
			className: "ops-v2-semantic-inline-ref-git-commit code-reviews-semantic-ref-git-commit"
		};
	};

	if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startCommitLinkEnhancer); else startCommitLinkEnhancer();
}());
