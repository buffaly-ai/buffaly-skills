if (typeof window === "undefined" || typeof window.HeartbeatServiceValidatorsFields !== "object") {
	var HeartbeatServiceValidatorsFields = {};
} else {
	var HeartbeatServiceValidatorsFields = window.HeartbeatServiceValidatorsFields;
}

if (!HeartbeatServiceValidatorsFields.hasOwnProperty("request")) {
	HeartbeatServiceValidatorsFields.request = { Validators: [Validators.Object], InvalidMessage: "Invalid request" };
}

class HeartbeatServiceService {
	constructor({ baseUrl = "/api/buffaly.agent.heartbeat/heartbeat-service", authToken = null } = {}) {
		this.Url = baseUrl;
		this.AuthToken = authToken;
	}

	Start(request, Callback) {
		return this._invoke(this.Url + "/start", "Start", { request: request }, Callback);
	}

	Stop(request, Callback) {
		return this._invoke(this.Url + "/stop", "Stop", { request: request }, Callback);
	}

	List(request, Callback) {
		return this._invoke(this.Url + "/list", "List", { request: request }, Callback);
	}

	Status(request, Callback) {
		return this._invoke(this.Url + "/status", "Status", { request: request }, Callback);
	}

	_invoke(pageUrl, methodName, params, Callback) {
		var initializer = {
			Page: pageUrl,
			Method: methodName,
			Params: params,
			onDataReceived: Callback ? function(oRes, iRequestID) { Callback(oRes); } : null,
			onErrorReceived: (Page.HandleUnexpectedError ? Page.HandleUnexpectedError : null)
		};

		if (this.AuthToken) {
			initializer.AuthToken = this.AuthToken;
		}

		if (Callback) {
			JsonMethod.callWithInitializer(initializer);
		} else {
			return JsonMethod.callSync(pageUrl, methodName, params, {});
		}
	}
}

if (typeof HeartbeatService === "undefined") {
	var HeartbeatService = new HeartbeatServiceService();
}
