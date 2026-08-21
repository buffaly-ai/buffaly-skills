if (typeof window === "undefined" || typeof window.OpenRouterCloudServiceValidatorsFields !== "object") {
	var OpenRouterCloudServiceValidatorsFields = {};
} else {
	var OpenRouterCloudServiceValidatorsFields = window.OpenRouterCloudServiceValidatorsFields;
}

if (!OpenRouterCloudServiceValidatorsFields.hasOwnProperty("apiKeySecretName")) {
	OpenRouterCloudServiceValidatorsFields.apiKeySecretName = { Validators: [Validators.Text], InvalidMessage: "Invalid API key secret name" };
}

class OpenRouterCloudServiceService {
	constructor({ baseUrl = "/api/buffaly.provider.openrouter.web/open-router-cloud-service", authToken = null } = {}) {
		this.Url = baseUrl;
		this.AuthToken = authToken;
	}

	GetCloudModels(apiKeySecretName, Callback) {
		return this.GetCloudModelsObject({ apiKeySecretName: apiKeySecretName || "" }, Callback);
	}

	GetCloudModelsObject(oObject, Callback) {
		this._validate(oObject, OpenRouterCloudServiceValidators.GetCloudModels, this.GetCloudModels.onValidationError);
		return this._invoke(this.Url + "/get-cloud-models", "GetCloudModels", { apiKeySecretName: oObject.apiKeySecretName || "" }, this.GetCloudModels, Callback);
	}

	async GetCloudModelsAsync(apiKeySecretName) {
		return await ObjectUtil.Promisify(this, this.GetCloudModels, [apiKeySecretName || ""]);
	}

	ValidateApiKey(apiKey, Callback) {
		return this.ValidateApiKeyObject({ apiKey: apiKey || "" }, Callback);
	}

	ValidateApiKeyObject(oObject, Callback) {
		this._validate(oObject, OpenRouterCloudServiceValidators.ValidateApiKey, this.ValidateApiKey.onValidationError);
		return this._invoke(this.Url + "/validate-api-key", "ValidateApiKey", { apiKey: oObject.apiKey || "" }, this.ValidateApiKey, Callback);
	}

	async ValidateApiKeyAsync(apiKey) {
		return await ObjectUtil.Promisify(this, this.ValidateApiKey, [apiKey || ""]);
	}

	GetDefaultEndpoint(Callback) {
		return this.GetDefaultEndpointObject({}, Callback);
	}

	GetDefaultEndpointObject(oObject, Callback) {
		this._validate(oObject, OpenRouterCloudServiceValidators.GetDefaultEndpoint, this.GetDefaultEndpoint.onValidationError);
		return this._invoke(this.Url + "/get-default-endpoint", "GetDefaultEndpoint", {}, this.GetDefaultEndpoint, Callback);
	}

	async GetDefaultEndpointAsync() {
		return await ObjectUtil.Promisify(this, this.GetDefaultEndpoint, []);
	}

	_validate(oObject, validators, onValidationError) {
		if (!validators) return;
		for (var key in validators) {
			if (!validators.hasOwnProperty(key)) continue;
			var validator = validators[key];
			var isValid = true;
			for (var i = 0; i < validator.Validators.length; i++) {
				if (!validator.Validators[i](oObject[key])) {
					isValid = false;
					break;
				}
			}
			if (!isValid) {
				if (onValidationError) onValidationError(validator.InvalidMessage);
				throw new Error(validator.InvalidMessage);
			}
		}
	}

	_invoke(pageUrl, methodName, params, methodConfig, Callback) {
		var initializer = {
			Page: pageUrl,
			Method: methodName,
			Params: params,
			Serialize: methodConfig.Serialize || {},
			onDataReceived: Callback ? function(oRes, iRequestID) { Callback(oRes); } : null,
			onErrorReceived: (methodConfig.onErrorReceived != null ? methodConfig.onErrorReceived : (Page.HandleUnexpectedError ? Page.HandleUnexpectedError : null))
		};

		if (this.AuthToken) initializer.AuthToken = this.AuthToken;

		if (Callback) {
			JsonMethod.callWithInitializer(initializer);
		} else {
			return JsonMethod.callSync(pageUrl, methodName, params, methodConfig.Serialize || {});
		}
	}
}

var OpenRouterCloudServiceValidators = {
	GetCloudModels: {
		apiKeySecretName: { Validators: [Validators.Text], InvalidMessage: "Invalid API key secret name" }
	},
	ValidateApiKey: {
		apiKey: { Validators: [Validators.MakeRequired(Validators.Text)], InvalidMessage: "Invalid API key" }
	},
	GetDefaultEndpoint: {
	}
};

if (typeof OpenRouterCloudService === "undefined") {
	var OpenRouterCloudService = new OpenRouterCloudServiceService();
}
