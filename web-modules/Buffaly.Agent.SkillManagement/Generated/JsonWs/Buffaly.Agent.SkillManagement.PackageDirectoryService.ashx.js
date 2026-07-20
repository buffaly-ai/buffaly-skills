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

	ListPackageSources(Callback) { return this.ListPackageSourcesObject({}, Callback); }
	ListPackageSourcesObject(oObject, Callback) {
		this._validate(oObject, PackageDirectoryServiceValidators.ListPackageSources, this.ListPackageSources.onValidationError);
		return this._invoke(this.Url + "/list-package-sources", "ListPackageSources", {}, this.ListPackageSources, Callback);
	}
	async ListPackageSourcesAsync() { return await ObjectUtil.Promisify(this, this.ListPackageSources, []); }
	async ListPackageSourcesObjectAsync(oObject) { return await ObjectUtil.Promisify(this, this.ListPackageSourcesObject, [ oObject ]); }

	PreviewInstanceExtensionProfile(request, Callback) { return this.PreviewInstanceExtensionProfileObject({ request:request }, Callback); }
	PreviewInstanceExtensionProfileObject(oObject, Callback) {
		this._validate(oObject, PackageDirectoryServiceValidators.PreviewInstanceExtensionProfile, this.PreviewInstanceExtensionProfile.onValidationError);
		return this._invoke(this.Url + "/preview-instance-extension-profile", "PreviewInstanceExtensionProfile", { request: oObject.request }, this.PreviewInstanceExtensionProfile, Callback);
	}
	async PreviewInstanceExtensionProfileAsync(request) { return await ObjectUtil.Promisify(this, this.PreviewInstanceExtensionProfile, [ request ]); }
	async PreviewInstanceExtensionProfileObjectAsync(oObject) { return await ObjectUtil.Promisify(this, this.PreviewInstanceExtensionProfileObject, [ oObject ]); }

	UpdateInstanceExtensionProfile(request, Callback) { return this.UpdateInstanceExtensionProfileObject({ request:request }, Callback); }
	UpdateInstanceExtensionProfileObject(oObject, Callback) {
		this._validate(oObject, PackageDirectoryServiceValidators.UpdateInstanceExtensionProfile, this.UpdateInstanceExtensionProfile.onValidationError);
		return this._invoke(this.Url + "/update-instance-extension-profile", "UpdateInstanceExtensionProfile", { request: oObject.request }, this.UpdateInstanceExtensionProfile, Callback);
	}
	async UpdateInstanceExtensionProfileAsync(request) { return await ObjectUtil.Promisify(this, this.UpdateInstanceExtensionProfile, [ request ]); }
	async UpdateInstanceExtensionProfileObjectAsync(oObject) { return await ObjectUtil.Promisify(this, this.UpdateInstanceExtensionProfileObject, [ oObject ]); }

	InstallProfileLock(request, Callback) { return this.InstallProfileLockObject({ request:request }, Callback); }
	InstallProfileLockObject(oObject, Callback) {
		this._validate(oObject, PackageDirectoryServiceValidators.InstallProfileLock, this.InstallProfileLock.onValidationError);
		return this._invoke(this.Url + "/install-profile-lock", "InstallProfileLock", { request: oObject.request }, this.InstallProfileLock, Callback);
	}
	async InstallProfileLockAsync(request) { return await ObjectUtil.Promisify(this, this.InstallProfileLock, [ request ]); }
	async InstallProfileLockObjectAsync(oObject) { return await ObjectUtil.Promisify(this, this.InstallProfileLockObject, [ oObject ]); }

	BackfillSkillReceipts(request, Callback) { return this.BackfillSkillReceiptsObject({ request:request }, Callback); }
	BackfillSkillReceiptsObject(oObject, Callback) {
		this._validate(oObject, PackageDirectoryServiceValidators.BackfillSkillReceipts, this.BackfillSkillReceipts.onValidationError);
		return this._invoke(this.Url + "/backfill-skill-receipts", "BackfillSkillReceipts", { request: oObject.request }, this.BackfillSkillReceipts, Callback);
	}
	async BackfillSkillReceiptsAsync(request) { return await ObjectUtil.Promisify(this, this.BackfillSkillReceipts, [ request ]); }
	async BackfillSkillReceiptsObjectAsync(oObject) { return await ObjectUtil.Promisify(this, this.BackfillSkillReceiptsObject, [ oObject ]); }

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

	RepairPackageActivation(request, Callback) { return this.RepairPackageActivationObject({ request:request }, Callback); }
	RepairPackageActivationObject(oObject, Callback) {
		this._validate(oObject, PackageDirectoryServiceValidators.RepairPackageActivation, this.RepairPackageActivation.onValidationError);
		return this._invoke(this.Url + "/repair-package-activation", "RepairPackageActivation", { request: oObject.request }, this.RepairPackageActivation, Callback);
	}
	async RepairPackageActivationAsync(request) { return await ObjectUtil.Promisify(this, this.RepairPackageActivation, [ request ]); }
	async RepairPackageActivationObjectAsync(oObject) { return await ObjectUtil.Promisify(this, this.RepairPackageActivationObject, [ oObject ]); }

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
	BackfillSkillReceipts : { request : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid request"} },
	InstallPackage : { request : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid request"} },
	InstallProfileLock : { request : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid request"} },
	ListPackageSources : {},
	ListPackages : { request : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid request"} },
	PreviewInstanceExtensionProfile : { request : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid request"} },
	PreviewPackageInstall : { request : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid request"} },
	RepairPackageActivation : { request : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid request"} },
	UpdateInstanceExtensionProfile : { request : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid request"} }
};

if (typeof PackageDirectoryService === "undefined") {
	var PackageDirectoryService = new PackageDirectoryServiceService();
}
