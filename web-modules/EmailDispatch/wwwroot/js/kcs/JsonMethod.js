/**
 * KCS Utility Module: JsonMethod
 * ------------------------------------------------------------
 * Centralised JSON web service client that mirrors the legacy
 * `JsonMethod.call(...)` signatures while layering modern fetch/XHR
 * plumbing, retry hooks, and global error wiring. Always route AJAX
 * calls through here so session-expiry handling and logging stay
 * consistent.
 *
 * Key helpers
 *  - JsonMethod.call(pageUrl, methodName, params, onData)
 *      Fire-and-forget async invocation that automatically serialises
 *      the payload and pipes responses into the provided callback.
 *  - JsonMethod.callSync(pageUrl, methodName, params, serializeConfig)
 *      Uses `XMLHttpRequest` for synchronous flows (rare; still used by
 *      existing pages that must block UI initialisation).
 *  - JsonMethod.setGlobalHandlers({ onError, onSessionExpired })
 *      Register portal-wide fallbacks so individual pages only override
 *      when they have bespoke UI.
 *
 * Usage example – async fetch with optimistic UI update:
 * ```js
 * JsonMethod.call("/Patients.aspx", "Save", formData, function(result) {
 *     UserMessages.ShowSuccess(result.Message);
 *     grid.refresh();
 * });
 * ```
 *
 * Usage example – wire session expiry banner once during bootstrap:
 * ```js
 * JsonMethod.setGlobalHandlers({
 *     onSessionExpired: function(retry) {
 *         UserMessages.ShowWarning("Your session timed out. Click to retry.");
 *         ControlUtil.AddClick(_$("btnRetry"), retry);
 *     }
 * });
 * ```
 */
var JsonMethod = {
	EncodeData: false,
	_requestIdCounter: 0,

	// Global fallback handlers if not specified at call-time
	_globalOnError: null,
	_globalOnSessionExpired: null,
	_authorizationFailure: null,
	_sessionAuthenticated: false,

	HandleAuthorizationStatus: function (status, initializer) {
		const path = window.location && window.location.pathname;
		if (!["/buffaly-agent", "/buffaly-agent.html", "/buffaly-agent-next.html"].includes(path)) return false;
		if (status !== 401 && status !== 403) {
			if (status >= 200 && status < 300 && (initializer.Page.includes("/buffaly-sessions-service/") || initializer.Page.includes("/buffaly-agent-turn-service/"))) {
				this._sessionAuthenticated = true;
				try { window.sessionStorage.removeItem("buffaly-login-recovery-attempted"); } catch (error) { /* Storage may be unavailable in an embedded view. */ }
			}
			return false;
		}
		if (this._authorizationFailure) return true;
		this._authorizationFailure = status;
		const params = new URLSearchParams(window.location.search);
		const embedded = window.self !== window.top || !!params.get("authToken") || !!initializer.AuthToken;
		const loginUrl = "/login?returnUrl=" + encodeURIComponent(window.location.pathname + window.location.search + window.location.hash);
		const draft = Array.from(document.querySelectorAll("textarea, [contenteditable='true']")).some(input => (input.value || input.textContent || "").trim());
		const banner = document.createElement("div");
		banner.id = "buffaly-authorization-error";
		banner.setAttribute("role", "alert");
		banner.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:100000;padding:16px;background:#fff3cd;color:#664d03;border-bottom:2px solid #997404";
		banner.textContent = status === 403 ? "You're signed in, but you don't have permission to access this." : embedded ? "Unauthorized: the supplied sign-in or access token was rejected. Reopen this view from its application." : "Your sign-in expired. Sign in again to continue. Your unsent draft remains on this page.";
		if (status === 401 && !embedded) {
			const link = document.createElement("a");
			link.href = loginUrl;
			link.textContent = " Sign in";
			// Keep drafts in the original page when login is opened.
			if (draft) { link.target = "_blank"; link.rel = "noopener"; }
			banner.appendChild(link);
		}
		document.body.appendChild(banner);
		if (status === 401 && !embedded && !draft && !this._sessionAuthenticated) {
			// A failed return from login must not create a redirect loop.
			let attempted = true;
			try {
				attempted = window.sessionStorage.getItem("buffaly-login-recovery-attempted") === "true";
				window.sessionStorage.setItem("buffaly-login-recovery-attempted", "true");
			} catch (error) { /* Show the sign-in link rather than looping without storage. */ }
			if (!attempted) window.location.assign(loginUrl);
		}
		return true;
	},

	// Mark operational service/transport failures so shared UI error reporting does not send
	// server/service failures back to the server as browser-originated JavaScript errors.
	MarkOperationalError: function (errorObj, category, context) {
		if (!errorObj || (typeof errorObj !== 'object' && typeof errorObj !== 'function')) {
			errorObj = { Error: errorObj };
		}

		try {
			errorObj.__buffalyErrorOrigin = 'service-operation';
			errorObj.__buffalyErrorReportToServer = false;
			errorObj.__buffalyErrorCategory = category || 'service-operation';
			if (context && typeof context === 'object') {
				errorObj.__buffalyErrorContext = context;
			}
		} catch (err) {
			// Error objects can be exotic; logging must never fail while preserving the original error.
		}

		return errorObj;
	},

	/**
	 * Set global error and session expired handlers.
	 * 
	 * @param {Object} handlers 
	 *  handlers.onError: function(errorObj) - called on general error if not provided in initializer
	 *  handlers.onSessionExpired: function(retryCallback) - called on session expired if not provided in initializer
	 */
	setGlobalHandlers: function (handlers) {
		if (handlers) {
			if (typeof handlers.onError === 'function') {
				this._globalOnError = handlers.onError;
			}
			if (typeof handlers.onSessionExpired === 'function') {
				this._globalOnSessionExpired = handlers.onSessionExpired;
			}
		}
	},

	call: function (sPage, sMethodName, oArgs, fCallBack) {
		// Maintains original signature
		this.callWithInitializer({
			Page: sPage,
			Method: sMethodName,
			Params: oArgs,
			onDataReceived: fCallBack
		});
	},

	callWithInitializer: function (oInitializer) {
		// Determine if call is async or sync based on presence of a callback
		var isAsync = (typeof oInitializer.onDataReceived === 'function');
		var requestID = this._getNextRequestId();

		if (isAsync) {
			this._sendRequest(oInitializer, true, requestID);
		} else {
			this._sendRequest(oInitializer, false, requestID);
		}
	},

	callSync: function (sPage, sMethodName, oArgs, oSerialize) {
		// Synchronous request using XMLHttpRequest
		var requestID = this._getNextRequestId();

		var oInitializer = {
			Page: sPage,
			Method: sMethodName,
			Params: oArgs,
			Serialize: oSerialize,
			// Note: no callbacks provided, so global or console error handling will apply
			onErrorReceived: null,
			onSessionExpired: null,
			onDataReceived: null,
			AuthToken: null
		};

		var headers = {
			'kcs-IsAjax': 'true',
			'kcs-Serialize': JSON.stringify(oInitializer.Serialize || {})
		};

		var bodyData = { Method: sMethodName, ...oArgs };

		if (oInitializer.AuthToken) {
			headers['Authorization'] = 'Bearer ' + oInitializer.AuthToken;
		}

		if (this.EncodeData) {
			bodyData = 'json=' + encodeURIComponent(JSON.stringify(bodyData));
			headers['Content-Type'] = 'application/x-www-form-urlencoded';
		} else {
			headers['Content-Type'] = 'application/json';
			bodyData = JSON.stringify(bodyData);
		}

		var xhr = new XMLHttpRequest();
		xhr.open("POST", sPage, false);
		for (const h in headers) {
			xhr.setRequestHeader(h, headers[h]);
		}

		try {
			xhr.send(bodyData);
		} catch (err) {
			this._handleGeneralError(oInitializer, this.MarkOperationalError({ Error: err }, 'transport-failure', { Page: sPage, Method: sMethodName }));
			return null;
		}

		return this._handleSyncResponse(xhr, oInitializer, requestID);
	},

	_handleSyncResponse: function (xhr, oInitializer, requestID) {
		var responseText = xhr.responseText;
		var parsed = this._tryParseResponse(responseText);

		if (parsed && parsed.Error) {
			if ((parsed.Error + '').toLowerCase() === "session expired") {
				// Session expired
				this._handleSessionExpired(oInitializer, () => {
					// Retry callback (though sync retry isn't typical, we provide mechanism anyway)
					this._sendRequest(oInitializer, false, requestID);
				});
				return null;
			} else {
				// General service error returned by the JsonWs endpoint.
				this._handleGeneralError(oInitializer, this.MarkOperationalError(parsed, 'server-jsonws-error', { Page: oInitializer.Page, Method: oInitializer.Method, RequestID: requestID }));
				return null;
			}
		}

		return parsed;
	},

	_getNextRequestId: function () {
		return this._requestIdCounter++;
	},

	_sendRequest: function (oInitializer, isAsync, requestID) {
		if (this._authorizationFailure) {
			this._handleGeneralError(oInitializer, this.MarkOperationalError({ Error: "Sign-in required or access denied." }, 'server-http-error', { Status: this._authorizationFailure }));
			return;
		}
		var headers = {
			'kcs-IsAjax': 'true'
		};

		var serialize = oInitializer.Serialize || {};
		headers['kcs-Serialize'] = JSON.stringify(serialize);

		var bodyData = { Method: oInitializer.Method, ...oInitializer.Params };

		if (this.EncodeData) {
			bodyData = 'json=' + encodeURIComponent(JSON.stringify(bodyData));
			headers['Content-Type'] = 'application/x-www-form-urlencoded';
		} else {
			headers['Content-Type'] = 'application/json';
			bodyData = JSON.stringify(bodyData);
		}

		if (oInitializer.AuthToken) {
			headers['Authorization'] = 'Bearer ' + oInitializer.AuthToken;
		}

		if (isAsync) {
			// Asynchronous request using fetch
			fetch(oInitializer.Page, {
				method: 'POST',
				headers: headers,
				body: bodyData
			})
				.then(response => {
					return response.text().then(responseText => ({ responseText: responseText, status: response.status, ok: response.ok }));
				})
				.then(responseInfo => {
					this._handleAsyncResponse(oInitializer, responseInfo.responseText, requestID, responseInfo.status, responseInfo.ok);
				})
				.catch(err => {
					// Network or transport failure during a JsonWs service invocation.
					this._handleGeneralError(oInitializer, this.MarkOperationalError({ Error: err }, 'transport-failure', { Page: oInitializer.Page, Method: oInitializer.Method, RequestID: requestID }));
				});

		} else {
			// Synchronous call via XMLHttpRequest
			var xhr = new XMLHttpRequest();
			xhr.open("POST", oInitializer.Page, false);
			for (let h in headers) {
				xhr.setRequestHeader(h, headers[h]);
			}

			try {
				xhr.send(bodyData);
			} catch (err) {
				if (err && err.Error)
					this._handleGeneralError(oInitializer, this.MarkOperationalError(err, 'transport-failure', { Page: oInitializer.Page, Method: oInitializer.Method, RequestID: requestID }));
				else 
					this._handleGeneralError(oInitializer, this.MarkOperationalError({ Error: err }, 'transport-failure', { Page: oInitializer.Page, Method: oInitializer.Method, RequestID: requestID }));
				return;
			}

			this._handleAsyncResponse(oInitializer, xhr.responseText, requestID, xhr.status);
		}
	},

	_handleAsyncResponse: function (oInitializer, responseText, requestID, status = 200, isHttpSuccess = true) {
		if (this.HandleAuthorizationStatus(status, oInitializer)) {
			this._handleGeneralError(oInitializer, this.MarkOperationalError({ Error: status === 403 ? "Access denied." : "Sign-in required." }, 'server-http-error', { Status: status, Page: oInitializer.Page }));
			return;
		}
		var parsed = this._tryParseResponse(responseText);

		if (parsed && parsed.Error) {
			if ((parsed.Error + '').toLowerCase() === "session expired") {
				this._handleSessionExpired(oInitializer, () => {
					// Retry
					this._sendRequest(oInitializer, (typeof oInitializer.onDataReceived === 'function'), requestID);
				});
			} else {
				this._handleGeneralError(oInitializer, this.MarkOperationalError(parsed, 'server-jsonws-error', { Page: oInitializer.Page, Method: oInitializer.Method, RequestID: requestID }));
			}
		} else if (isHttpSuccess === false) {
			this._handleGeneralError(oInitializer, this.MarkOperationalError({ Error: responseText || ("HTTP " + status) }, 'server-http-error', { Page: oInitializer.Page, Method: oInitializer.Method, RequestID: requestID, Status: status }));
		} else {
			// Success
			if (oInitializer.onDataReceived) {
				try {
					oInitializer.onDataReceived(parsed, requestID);
				} catch (err) {
					this._handleGeneralError(oInitializer, { Error: err });
				}
			}
		}
	},

	_tryParseResponse: function (responseText) {
		// Try parse as JSON
		try {
			var data = JSON.parse(responseText);
			//if (data !== null && (Array.isArray(data) || typeof data === 'object')) {
			//	return data;
			//} else {
			//	// If it's a primitive (string/number), return the raw text
			//	return responseText;
			//}
			return data;
		} catch (ex) {
			// Not valid JSON, return as text
			return responseText;
		}
	},

	_handleSessionExpired: function (oInitializer, retryCallback) {
		// If the user provided onSessionExpired, use it
		if (typeof oInitializer.onSessionExpired === 'function') {
			oInitializer.onSessionExpired(retryCallback);
		} else if (typeof this._globalOnSessionExpired === 'function') {
			this._globalOnSessionExpired(retryCallback);
		} else {
			// No handler provided, default behavior: log and do nothing
			console.warn("Session expired and no handler provided to handle it.");
		}
	},

	_handleGeneralError: function (oInitializer, errorObj) {
		if (typeof oInitializer.onErrorReceived === 'function') {
			oInitializer.onErrorReceived(errorObj);
		} else if (typeof this._globalOnError === 'function') {
			this._globalOnError(errorObj);
		} else {
			console.error("Unhandled Error:", errorObj);
		}
	}
};
