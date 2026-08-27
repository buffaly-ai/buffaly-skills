if (typeof window === "undefined" || typeof window.OllamaCloudServiceValidatorsFields !== "object") {
	var OllamaCloudServiceValidatorsFields = {};
} else {
	var OllamaCloudServiceValidatorsFields = window.OllamaCloudServiceValidatorsFields;
}

if (!OllamaCloudServiceValidatorsFields.hasOwnProperty("apiKeySecretName")) {
	OllamaCloudServiceValidatorsFields.apiKeySecretName = { Validators: [Validators.Text], InvalidMessage: "Invalid API key secret name" };
}

class OllamaCloudServiceService {
	constructor({ baseUrl = "/api/buffaly.provider.ollama.web/ollama-cloud-service", authToken = null } = {}) {
		this.Url = baseUrl;
		this.AuthToken = authToken;
	}

	GetCloudModels(apiKeySecretName, Callback) {
		return this.GetCloudModelsObject({ apiKeySecretName: apiKeySecretName || "" }, Callback);
	}

	GetCloudModelsObject(oObject, Callback) {
		this._validate(oObject, OllamaCloudServiceValidators.GetCloudModels, this.GetCloudModels.onValidationError);
		return this._invoke(this.Url + "/get-cloud-models", "GetCloudModels", { apiKeySecretName: oObject.apiKeySecretName || "" }, this.GetCloudModels, Callback);
	}

	async GetCloudModelsAsync(apiKeySecretName) {
		return await ObjectUtil.Promisify(this, this.GetCloudModels, [apiKeySecretName || ""]);
	}

	ValidateApiKey(apiKey, Callback) {
		return this.ValidateApiKeyObject({ apiKey: apiKey || "" }, Callback);
	}

	ValidateApiKeyObject(oObject, Callback) {
		this._validate(oObject, OllamaCloudServiceValidators.ValidateApiKey, this.ValidateApiKey.onValidationError);
		return this._invoke(this.Url + "/validate-api-key", "ValidateApiKey", { apiKey: oObject.apiKey || "" }, this.ValidateApiKey, Callback);
	}

	async ValidateApiKeyAsync(apiKey) {
		return await ObjectUtil.Promisify(this, this.ValidateApiKey, [apiKey || ""]);
	}

	GetDefaultEndpoint(Callback) {
		return this.GetDefaultEndpointObject({}, Callback);
	}

	GetDefaultEndpointObject(oObject, Callback) {
		this._validate(oObject, OllamaCloudServiceValidators.GetDefaultEndpoint, this.GetDefaultEndpoint.onValidationError);
		return this._invoke(this.Url + "/get-default-endpoint", "GetDefaultEndpoint", {}, this.GetDefaultEndpoint, Callback);
	}

	async GetDefaultEndpointAsync() {
		return await ObjectUtil.Promisify(this, this.GetDefaultEndpoint, []);
	}

	GetAccountStatus(credentialProfileId, modelName, Callback) {
		return this.GetAccountStatusObject({ credentialProfileId: credentialProfileId || "", modelName: modelName || "" }, Callback);
	}

	GetAccountStatusObject(oObject, Callback) {
		this._validate(oObject, OllamaCloudServiceValidators.GetAccountStatus, this.GetAccountStatus.onValidationError);
		return this._invoke(this.Url + "/get-account-status", "GetAccountStatus", { credentialProfileId: oObject.credentialProfileId || "", modelName: oObject.modelName || "" }, this.GetAccountStatus, Callback);
	}

	async GetAccountStatusAsync(credentialProfileId, modelName) {
		return await ObjectUtil.Promisify(this, this.GetAccountStatus, [credentialProfileId || "", modelName || ""]);
	}

	GetUsageStatus(credentialProfileId, modelName, Callback) {
		return this.GetUsageStatusObject({ credentialProfileId: credentialProfileId || "", modelName: modelName || "" }, Callback);
	}

	GetUsageStatusObject(oObject, Callback) {
		this._validate(oObject, OllamaCloudServiceValidators.GetUsageStatus, this.GetUsageStatus.onValidationError);
		return this._invoke(this.Url + "/get-usage-status", "GetUsageStatus", { credentialProfileId: oObject.credentialProfileId || "", modelName: oObject.modelName || "" }, this.GetUsageStatus, Callback);
	}

	async GetUsageStatusAsync(credentialProfileId, modelName) {
		return await ObjectUtil.Promisify(this, this.GetUsageStatus, [credentialProfileId || "", modelName || ""]);
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

var OllamaCloudServiceValidators = {
	GetCloudModels: {
		apiKeySecretName: { Validators: [Validators.Text], InvalidMessage: "Invalid API key secret name" }
	},
	ValidateApiKey: {
		apiKey: { Validators: [Validators.MakeRequired(Validators.Text)], InvalidMessage: "Invalid API key" }
	},
	GetDefaultEndpoint: {
	}
	,
	GetAccountStatus: {
	},
	GetUsageStatus: {
	}
};

if (typeof OllamaCloudService === "undefined") {
	var OllamaCloudService = new OllamaCloudServiceService();
}
