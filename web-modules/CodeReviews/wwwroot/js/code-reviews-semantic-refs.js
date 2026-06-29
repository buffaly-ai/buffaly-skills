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

	function triggerCodeReviewAgent(request, button) {
		button.disabled = true;
		button.textContent = "Reviewing...";
		call("TriggerCodeReviewAgent", request)
			.then(function (response) {
				const child = text(response && (response.ChildSessionKey || response.childSessionKey));
				button.textContent = child ? "Review queued: " + child : "Review queued";
				button.title = text(response && (response.Message || response.message)) || "Code review child session started.";
			})
			.catch(function (error) {
				button.disabled = false;
				button.textContent = "Review";
				button.title = "Code review trigger failed: " + errorMessage(error);
			});
	}

	function enhanceRenderedCommitLinks(root) {
		const scope = root && root.querySelectorAll ? root : document;
		scope.querySelectorAll("a.code-reviews-semantic-ref-git-commit:not([data-code-review-trigger-enhanced='true'])").forEach(function (anchor) {
			anchor.setAttribute("data-code-review-trigger-enhanced", "true");
			const button = document.createElement("button");
			button.type = "button";
			button.className = "code-reviews-trigger-agent-review";
			button.textContent = "Review";
			button.title = "Run Code Review Agent";
			button.addEventListener("click", function (event) {
				event.preventDefault();
				event.stopPropagation();
				triggerCodeReviewAgent(buildRequestFromAnchor(anchor), button);
			});
			anchor.insertAdjacentElement("afterend", button);
		});
	}

	function startCommitLinkEnhancer() {
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
