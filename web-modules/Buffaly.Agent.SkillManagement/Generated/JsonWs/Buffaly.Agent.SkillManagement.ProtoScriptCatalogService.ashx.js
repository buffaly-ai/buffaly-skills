// ensure we're in a browser context and the global object exists
if (typeof window === "undefined" || typeof window.ProtoScriptCatalogServiceValidatorsFields !== "object") {
	var ProtoScriptCatalogServiceValidatorsFields = {};
} else {
	var ProtoScriptCatalogServiceValidatorsFields = window.ProtoScriptCatalogServiceValidatorsFields;
}

if (!ProtoScriptCatalogServiceValidatorsFields.hasOwnProperty("projectName")) {
	ProtoScriptCatalogServiceValidatorsFields.projectName = {Validators : [Validators.Text], InvalidMessage: "Invalid projectName"};
}

if (!ProtoScriptCatalogServiceValidatorsFields.hasOwnProperty("prototypeName")) {
	ProtoScriptCatalogServiceValidatorsFields.prototypeName = {Validators : [Validators.Text], InvalidMessage: "Invalid prototypeName"};
}

if (!ProtoScriptCatalogServiceValidatorsFields.hasOwnProperty("rootPrototypeName")) {
	ProtoScriptCatalogServiceValidatorsFields.rootPrototypeName = {Validators : [Validators.Text], InvalidMessage: "Invalid rootPrototypeName"};
}

class ProtoScriptCatalogServiceService {
	constructor({ baseUrl = "/api/buffaly.agent.skillmanagement/proto-script-catalog-service", authToken = null } = {}) {
		this.Url = baseUrl;
		this.AuthToken = authToken;
	}

	_validate(oObject, validatorSchema, onValidationErrorCallback) {
		if (oObject.IsValidated == null || !oObject.IsValidated) {
			if (!Validators.Validate(oObject, validatorSchema)) {
				var oError = { Error: "Invalid data", Data: oObject };
				if (onValidationErrorCallback != null)
					onValidationErrorCallback(oError)
				else if (Page.HandleValidationErrors)
					Page.HandleValidationErrors(oError);
				throw "Invalid data";
			}
		}
	}

	GetCatalogSnapshot(projectName, Callback) {
		return this.GetCatalogSnapshotObject({ projectName:projectName }, Callback);
	}

	GetCatalogSnapshotObject(oObject, Callback) {
		this._validate(oObject, ProtoScriptCatalogServiceValidators.GetCatalogSnapshot, this.GetCatalogSnapshot.onValidationError);
		var pageUrl = this.Url + "/get-catalog-snapshot";
		return this._invoke(pageUrl, "GetCatalogSnapshot", { projectName: oObject.projectName }, this.GetCatalogSnapshot, Callback);
	}

	async GetCatalogSnapshotAsync(projectName) {
		return await ObjectUtil.Promisify(this, this.GetCatalogSnapshot, [ projectName ]);
	}

	async GetCatalogSnapshotObjectAsync(oObject) {
		return await ObjectUtil.Promisify(this, this.GetCatalogSnapshotObject, [ oObject ]);
	}

	GetSourcePreview(projectName, prototypeName, Callback) {
		return this.GetSourcePreviewObject({ projectName:projectName, prototypeName:prototypeName }, Callback);
	}

	GetSourcePreviewObject(oObject, Callback) {
		this._validate(oObject, ProtoScriptCatalogServiceValidators.GetSourcePreview, this.GetSourcePreview.onValidationError);
		var pageUrl = this.Url + "/get-source-preview";
		return this._invoke(pageUrl, "GetSourcePreview", { projectName: oObject.projectName, prototypeName: oObject.prototypeName }, this.GetSourcePreview, Callback);
	}

	async GetSourcePreviewAsync(projectName, prototypeName) {
		return await ObjectUtil.Promisify(this, this.GetSourcePreview, [ projectName, prototypeName ]);
	}

	async GetSourcePreviewObjectAsync(oObject) {
		return await ObjectUtil.Promisify(this, this.GetSourcePreviewObject, [ oObject ]);
	}

	GetObjectCatalogJson(projectName, rootPrototypeName, Callback) {
		return this.GetObjectCatalogJsonObject({ projectName:projectName, rootPrototypeName:rootPrototypeName }, Callback);
	}

	GetObjectCatalogJsonObject(oObject, Callback) {
		this._validate(oObject, ProtoScriptCatalogServiceValidators.GetObjectCatalogJson, this.GetObjectCatalogJson.onValidationError);
		var pageUrl = this.Url + "/get-object-catalog-json";
		return this._invoke(pageUrl, "GetObjectCatalogJson", { projectName: oObject.projectName, rootPrototypeName: oObject.rootPrototypeName }, this.GetObjectCatalogJson, Callback);
	}

	async GetObjectCatalogJsonAsync(projectName, rootPrototypeName) {
		return await ObjectUtil.Promisify(this, this.GetObjectCatalogJson, [ projectName, rootPrototypeName ]);
	}

	async GetObjectCatalogJsonObjectAsync(oObject) {
		return await ObjectUtil.Promisify(this, this.GetObjectCatalogJsonObject, [ oObject ]);
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
		if (Callback) JsonMethod.callWithInitializer(initializer);
		else return JsonMethod.callSync(pageUrl, methodName, params, methodConfig.Serialize || {});
	}
}

var ProtoScriptCatalogServiceValidators = {
	GetCatalogSnapshot : { projectName : {Validators: [Validators.Text], InvalidMessage: "Invalid projectName"} },
	GetSourcePreview : { projectName : {Validators: [Validators.Text], InvalidMessage: "Invalid projectName"}, prototypeName : {Validators: [Validators.Text], InvalidMessage: "Invalid prototypeName"} },
	GetObjectCatalogJson : { projectName : {Validators: [Validators.Text], InvalidMessage: "Invalid projectName"}, rootPrototypeName : {Validators: [Validators.Text], InvalidMessage: "Invalid rootPrototypeName"} }
};

if (typeof ProtoScriptCatalogService === "undefined") {
	var ProtoScriptCatalogService = new ProtoScriptCatalogServiceService();
}
