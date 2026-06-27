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
}());
