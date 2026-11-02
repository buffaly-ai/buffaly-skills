// Purpose: Register CodeReviews-owned semantic inline ref formatters for Buffaly timeline messages.
(function () {
	"use strict";

	function text(value) {
		return value === null || value === undefined ? "" : String(value);
	}

	function isEmpty(value) {
		return text(value).trim().length === 0;
	}

	function isHexCommitSha(value) {
		return /^[0-9a-fA-F]+$/.test(text(value).trim());
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
			return Promise.reject(new Error("CodeReviews JsonWs client is not loaded from the web-module: " + methodName));
		}

		return new Promise(function (resolve, reject) {
			try { api[methodName](request, resolve, reject); } catch (error) { reject(error); }
		});
	}

	function errorMessage(error) {
		if (!error) return "Unknown error";
		if (typeof error === "string") {
			// JsonWs error callbacks may carry its canonical Error response as serialized text.
			try { const response = JSON.parse(error); if (typeof response.Error === "string") return response.Error; } catch (_) { }
			return error;
		}
		try { return error.Message || error.message || error.Error || error.error || JSON.stringify(error) || String(error); }
		catch (_) { return String(error); }
	}

	// This timeline is a task view, not the commit evidence view. Classify diagnostics,
	// but never interpolate them: even an otherwise readable reason may contain a receipt.
	function failureMessage(reason) {
		const diagnostic = text(reason);
		if (isEmpty(diagnostic)) return "The review failed without a recorded reason. Open the commit for details.";
		if (/Unsupported committed binary inspection format|Mandatory exact-blob binary evidence is unavailable|Required DLL inspection is unsupported/i.test(diagnostic))
			return "The reviewer cannot inspect a required file. Open the commit for details.";
		if (/Incomplete applicable guidance:|Incomplete review coverage:|Required .* evidence .* unavailable/i.test(diagnostic))
			return "The review could not finish reading required evidence. Open the commit for details.";
		if (/; method=create-child-session;|Cross-session create-child-session relay failed|No callable semantic programs were discovered/.test(diagnostic))
			return "The review agent could not start. Open the commit for details.";
		if (/WorkerRequestContext:|Cross-session .* relay failed/.test(diagnostic))
			return "The review service could not complete the request. Open the commit for details.";
		if (/timed out|timeout/i.test(diagnostic))
			return "The review request timed out. Open the commit for details.";
		if (/service unavailable/i.test(diagnostic))
			return "The review service is unavailable. Try again later.";
		return "The review failed. Open the commit for details.";
	}

	function buildRequestFromAnchor(anchor) {
		const url = new URL(anchor.href, window.location.href);
		const turnOwner = anchor.closest("[data-turn-key]");
		return {
			Environment: "Dev",
			SourceSessionKey: url.searchParams.get("sourceSessionKey") || getSourceSessionKey(),
			SourceTurnKey: turnOwner ? text(turnOwner.getAttribute("data-turn-key")).trim() : "",
			RepositoryName: url.searchParams.get("repo") || "",
			RepositoryPath: url.searchParams.get("path") || "",
			CommitSha: url.searchParams.get("sha") || "",
			CodeReviewUrl: url.pathname + url.search,
			ReviewMode: "Manual"
		};
	}

	function environmentName() {
		const moduleConfig = window.BuffalyWebModuleConfig && window.BuffalyWebModuleConfig.CodeReviews;
		return text(moduleConfig && moduleConfig.Environment).trim() || "Dev";
	}

	function setReviewButtonState(button, state, label, title) {
		button.setAttribute("data-code-review-state", state);
		button.innerHTML = '<i class="fas fa-search code-reviews-trigger-agent-review-icon" aria-hidden="true"></i><span class="code-reviews-trigger-agent-review-label"></span>';
		button.querySelector(".code-reviews-trigger-agent-review-label").textContent = label;
		button.title = title;
	}

	function setReviewStatus(button, state, message) {
		let status = button.reviewStatusElement;
		if (!status) {
			status = document.createElement("span");
			status.className = "code-reviews-trigger-agent-review-status";
			status.id = "code-review-status-" + (++reviewStatusSequence);
			status.setAttribute("role", "status");
			status.setAttribute("aria-live", "polite");
			button.insertAdjacentElement("afterend", status);
			button.reviewStatusElement = status;
			button.setAttribute("aria-describedby", status.id);
		}
		status.setAttribute("data-code-review-state", state);
		status.textContent = message;
		status.hidden = isEmpty(message);
	}
	let reviewStatusSequence = 0;

	// Trigger failures are persisted by the driver before its HTTP exception is returned.
	// Read that exact commit once; never retrigger or replace it with a sibling's error.
	function showTriggerFailure(request, button, error, attempt) {
		button.disabled = false;
		setReviewButtonState(button, "error", "Retry review", "Review could not start. Retry this commit.");
		setReviewStatus(button, "error", failureMessage(errorMessage(error)));
		return call("GetCommitReview", { RepositoryPath: request.RepositoryPath, CommitSha: request.CommitSha })
			.then(function (response) {
				const record = recordFromResponse(response);
				if (button.reviewTriggerAttempt === attempt && button.getAttribute("data-code-review-state") === "error" && reviewStatusFromRecord(record) === "Failed" && !isEmpty(record.FailureReason)) {
					setReviewStatus(button, "error", failureMessage(record.FailureReason));
				}
			})
			.catch(function (lookupError) {
				console.warn("CodeReviews trigger failure detail lookup failed", lookupError);
			});
	}

	function triggerCodeReviewAgent(request, button) {
		const attempt = (button.reviewTriggerAttempt || 0) + 1;
		button.reviewTriggerAttempt = attempt;
		button.disabled = true;
		setReviewButtonState(button, "loading", "Reviewing", "Starting Code Review Agent...");
		setReviewStatus(button, "loading", "Starting review agent...");
		call("TriggerCodeReviewAgent", request)
			.then(function (response) {
				const child = text(response && response.ChildSessionKey);
				setReviewButtonState(button, "queued", child ? "Queued " + child : "Queued", text(response && response.Message) || "Code review child session started.");
				setReviewStatus(button, "queued", child ? "Queued child session " + child : "Review agent queued.");
			})
			.catch(function (error) {
				return showTriggerFailure(request, button, error, attempt);
			});
	}

	function recordFromResponse(response) {
		return response && response.Record || null;
	}

	function triggerGlobalCodeReviewTurn(sourceSessionKey, sourceTurnKey, button) {
		button.disabled = true;
		setReviewButtonState(button, "loading", "Queueing global review", "Queueing the whole assistant turn to the global CodeReviews reviewer...");
		setReviewStatus(button, "loading", "Queueing grouped global review...");
		fetch(getCodeReviewsBaseUrl() + "/api/review-turn", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ SourceSessionKey: sourceSessionKey, TurnKey: sourceTurnKey })
		})
			.then(function (response) {
				return response.json().catch(function () { return {}; }).then(function (payload) {
					if (!response.ok) throw new Error(text(payload && payload.Error).trim() || "Global review trigger returned HTTP " + response.status + ".");
					return payload;
				});
			})
			.then(function (response) {
				if (typeof response.ReviewerSessionKey !== "string" || response.ReviewerSessionKey.length === 0)
					throw new Error("Global review response is missing ReviewerSessionKey.");
				if (!response.ShouldQueue) {
					button.disabled = false;
					setReviewButtonState(button, "idle", "Review whole turn globally", response.Message);
					setReviewStatus(button, "idle", response.Message);
					return;
				}
				setReviewButtonState(button, "queued", "Global review queued", response.Message);
				setReviewStatus(button, "queued", "Queued to " + response.ReviewerSessionKey + ".");
			})
			.catch(function (error) {
				button.disabled = false;
				const message = failureMessage(errorMessage(error));
				setReviewButtonState(button, "error", "Retry global review", message);
				setReviewStatus(button, "error", message);
			});
	}

	function ensureGlobalTurnReviewButton(anchor, individualButton) {
		const turnOwner = anchor.closest("[data-turn-key]");
		if (!turnOwner || turnOwner.getAttribute("data-code-review-global-trigger-enhanced") === "true") return;
		const sourceTurnKey = text(turnOwner.getAttribute("data-turn-key")).trim();
		const sourceSessionKey = getSourceSessionKey();
		if (isEmpty(sourceTurnKey) || isEmpty(sourceSessionKey)) return;
		turnOwner.setAttribute("data-code-review-global-trigger-enhanced", "true");
		const globalButton = document.createElement("button");
		globalButton.type = "button";
		globalButton.className = "code-reviews-trigger-agent-review code-reviews-trigger-global-turn-review";
		setReviewButtonState(globalButton, "ready", "Review whole turn globally", "Review every commit in this assistant message together using the global CodeReviews reviewer");
		globalButton.addEventListener("click", function (event) {
			event.preventDefault();
			event.stopPropagation();
			triggerGlobalCodeReviewTurn(sourceSessionKey, sourceTurnKey, globalButton);
		});
		individualButton.insertAdjacentElement("afterend", globalButton);
	}

	function reviewStatusFromRecord(record) {
		return text(record && record.Status).trim() || "NotReviewed";
	}

	function diffUrlForAnchor(anchor, showReview) {
		const url = new URL(anchor.href, window.location.href);
		if (showReview) url.searchParams.set("showReview", "1");
		return url.toString();
	}

	function applyReviewRecordToButton(button, record) {
		// An initial read must not overwrite a newer click outcome (or its failure detail).
		if (button.getAttribute("data-code-review-state") !== "ready") return;
		const status = reviewStatusFromRecord(record);
		button.disabled = false;
		setReviewStatus(button, "", "");
		if (status === "Running") {
			button.disabled = true;
			setReviewButtonState(button, "running", "Reviewing", "Code Review Agent is already reviewing this commit.");
			return;
		}

		if (status === "Reviewed") {
			setReviewButtonState(button, "reviewed", "Reviewed", "Open reviewed CodeReviews diff.");
			return;
		}

		if (status === "Failed") {
			const message = failureMessage(record.FailureReason);
			setReviewButtonState(button, "failed", "Review failed", message);
			setReviewStatus(button, "error", message);
			return;
		}

		setReviewButtonState(button, "ready", "Review commit only", "Review this commit separately");
	}

	function loadReviewButtonStatus(anchor, button) {
		const request = buildRequestFromAnchor(anchor);
		if (isEmpty(request.RepositoryPath) || isEmpty(request.CommitSha) || !isHexCommitSha(request.CommitSha)) return;
		call("GetCommitReview", { RepositoryPath: request.RepositoryPath, CommitSha: request.CommitSha })
			.then(function (response) {
				const record = recordFromResponse(response);
				applyReviewRecordToButton(button, record);
			})
			.catch(function (error) {
				console.warn("CodeReviews review status lookup failed", error);
				if (button.getAttribute("data-code-review-state") === "ready")
					setReviewButtonState(button, "ready", "Review commit only", "Review this commit separately");
			});
	}

	function enhanceRenderedCommitLinks(root) {
		const scope = root && root.querySelectorAll ? root : document;
		scope.querySelectorAll("a.code-reviews-semantic-ref-git-commit:not([data-code-review-trigger-enhanced='true'])").forEach(function (anchor) {
			anchor.setAttribute("data-code-review-trigger-enhanced", "true");
			const button = document.createElement("button");
			button.type = "button";
			button.className = "code-reviews-trigger-agent-review";
			setReviewButtonState(button, "ready", "Review commit only", "Review this commit separately");
			button.addEventListener("click", function (event) {
				event.preventDefault();
				event.stopPropagation();
				if (button.getAttribute("data-code-review-state") === "reviewed") {
					window.location.href = diffUrlForAnchor(anchor, true);
					return;
				}
				if (button.getAttribute("data-code-review-state") === "running") return;
				triggerCodeReviewAgent(buildRequestFromAnchor(anchor), button);
			});
			anchor.insertAdjacentElement("afterend", button);
			ensureGlobalTurnReviewButton(anchor, button);
			loadReviewButtonStatus(anchor, button);
		});
	}

	function installReviewButtonStyles() {
		if (document.getElementById("code-reviews-semantic-ref-styles")) return;
		const style = document.createElement("style");
		style.id = "code-reviews-semantic-ref-styles";
		style.textContent = "\n"
			+ ".code-reviews-trigger-agent-review{appearance:none;border:0;border-radius:999px;margin-left:.45rem;padding:.23rem .62rem .25rem .5rem;min-height:24px;display:inline-flex;align-items:center;gap:.32rem;vertical-align:baseline;font:inherit;color:#fff;background:linear-gradient(135deg,#7c3aed 0%,#2563eb 52%,#06b6d4 100%);box-shadow:0 5px 14px rgba(37,99,235,.24),inset 0 1px 0 rgba(255,255,255,.26);cursor:pointer;transition:transform .14s ease,box-shadow .14s ease,filter .14s ease;white-space:nowrap;}\n"
			+ ".code-reviews-trigger-agent-review:hover:not(:disabled){transform:translateY(-1px);filter:saturate(1.08);box-shadow:0 7px 18px rgba(37,99,235,.32),inset 0 1px 0 rgba(255,255,255,.32);}\n"
			+ ".code-reviews-trigger-agent-review:active:not(:disabled){transform:translateY(0);box-shadow:0 3px 10px rgba(37,99,235,.24),inset 0 1px 0 rgba(255,255,255,.22);}\n"
			+ ".code-reviews-trigger-agent-review:focus{outline:2px solid #2563eb;outline-offset:2px;}\n"
			+ ".code-reviews-trigger-agent-review:disabled{cursor:default;opacity:.92;}\n"
			+ ".code-reviews-trigger-agent-review-icon{display:inline-grid;place-items:center;width:1.05em;height:1.05em;border-radius:999px;background:rgba(255,255,255,.2);line-height:1;}\n"
			+ ".code-reviews-trigger-agent-review[data-code-review-state='loading'] .code-reviews-trigger-agent-review-icon{animation:codeReviewsReviewSpin .9s linear infinite;}\n"
			+ ".code-reviews-trigger-agent-review[data-code-review-state='queued'],.code-reviews-trigger-agent-review[data-code-review-state='reviewed']{background:linear-gradient(135deg,#16a34a 0%,#0d9488 100%);box-shadow:0 5px 14px rgba(13,148,136,.24),inset 0 1px 0 rgba(255,255,255,.24);}\n"
			+ ".code-reviews-trigger-agent-review[data-code-review-state='running']{background:linear-gradient(135deg,#2563eb 0%,#0891b2 100%);box-shadow:0 5px 14px rgba(37,99,235,.2),inset 0 1px 0 rgba(255,255,255,.24);}\n"
			+ ".code-reviews-trigger-agent-review[data-code-review-state='error'],.code-reviews-trigger-agent-review[data-code-review-state='failed']{background:linear-gradient(135deg,#f97316 0%,#dc2626 100%);box-shadow:0 5px 14px rgba(220,38,38,.22),inset 0 1px 0 rgba(255,255,255,.24);}\n"
			+ ".code-reviews-trigger-agent-review-status{display:block;margin:.35rem 0;padding:.35rem .5rem;border-radius:.35rem;font:inherit;background:#eef2ff;color:#3730a3;white-space:pre-wrap;overflow-wrap:anywhere;}\n"
			+ ".code-reviews-trigger-agent-review-status[hidden]{display:none;}\n"
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
		if (!parsed || isEmpty(parsed.repositoryPath) || isEmpty(parsed.commitSha) || !isHexCommitSha(parsed.commitSha)) {
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
