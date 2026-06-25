if (typeof window === "undefined" || typeof window.PackageDirectoryServiceValidatorsFields !== "object") {
	var PackageDirectoryServiceValidatorsFields = {};
} else {
	var PackageDirectoryServiceValidatorsFields = window.PackageDirectoryServiceValidatorsFields;
}

if (!PackageDirectoryServiceValidatorsFields.hasOwnProperty("request")) {
	PackageDirectoryServiceValidatorsFields.request = {Validators : [Validators.Object], InvalidMessage: "Invalid request"};
}

class PackageDirectoryServiceService {
	constructor({ baseUrl = "/api/buffaly.agent.skillmanagement/package-directory-service", authToken = null } = {}) {
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

	ListPackages(request, Callback) { return this.ListPackagesObject({ request:request }, Callback); }
	ListPackagesObject(oObject, Callback) {
		this._validate(oObject, PackageDirectoryServiceValidators.ListPackages, this.ListPackages.onValidationError);
		return this._invoke(this.Url + "/list-packages", "ListPackages", { request: oObject.request }, this.ListPackages, Callback);
	}
	async ListPackagesAsync(request) { return await ObjectUtil.Promisify(this, this.ListPackages, [ request ]); }
	async ListPackagesObjectAsync(oObject) { return await ObjectUtil.Promisify(this, this.ListPackagesObject, [ oObject ]); }

	PreviewPackageInstall(request, Callback) { return this.PreviewPackageInstallObject({ request:request }, Callback); }
	PreviewPackageInstallObject(oObject, Callback) {
		this._validate(oObject, PackageDirectoryServiceValidators.PreviewPackageInstall, this.PreviewPackageInstall.onValidationError);
		return this._invoke(this.Url + "/preview-package-install", "PreviewPackageInstall", { request: oObject.request }, this.PreviewPackageInstall, Callback);
	}
	async PreviewPackageInstallAsync(request) { return await ObjectUtil.Promisify(this, this.PreviewPackageInstall, [ request ]); }
	async PreviewPackageInstallObjectAsync(oObject) { return await ObjectUtil.Promisify(this, this.PreviewPackageInstallObject, [ oObject ]); }

	InstallPackage(request, Callback) { return this.InstallPackageObject({ request:request }, Callback); }
	InstallPackageObject(oObject, Callback) {
		this._validate(oObject, PackageDirectoryServiceValidators.InstallPackage, this.InstallPackage.onValidationError);
		return this._invoke(this.Url + "/install-package", "InstallPackage", { request: oObject.request }, this.InstallPackage, Callback);
	}
	async InstallPackageAsync(request) { return await ObjectUtil.Promisify(this, this.InstallPackage, [ request ]); }
	async InstallPackageObjectAsync(oObject) { return await ObjectUtil.Promisify(this, this.InstallPackageObject, [ oObject ]); }

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
		if (Callback)
			JsonMethod.callWithInitializer(initializer);
		else
			return JsonMethod.callSync(pageUrl, methodName, params, methodConfig.Serialize || {});
	}
}

var PackageDirectoryServiceValidators = {
	InstallPackage : { request : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid request"} },
	ListPackages : { request : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid request"} },
	PreviewPackageInstall : { request : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid request"} }
};

if (typeof PackageDirectoryService === "undefined") {
	var PackageDirectoryService = new PackageDirectoryServiceService();
}
