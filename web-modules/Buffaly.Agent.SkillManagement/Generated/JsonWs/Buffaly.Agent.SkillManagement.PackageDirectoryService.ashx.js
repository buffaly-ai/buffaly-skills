

// ensure we're in a browser context and the global object exists
if (typeof window === "undefined" || typeof window.PackageDirectoryServiceValidatorsFields !== "object") {
	var PackageDirectoryServiceValidatorsFields = {};
} else {
	// reuse the existing object created by an earlier script
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


    BackfillSkillReceipts(request, Callback) {
        return this.BackfillSkillReceiptsObject({ request:request }, Callback);
    }

    BackfillSkillReceiptsObject(oObject, Callback) {
        this._validate(oObject, PackageDirectoryServiceValidators.BackfillSkillReceipts, this.BackfillSkillReceipts.onValidationError);

        var pageUrl = this.Url + "/backfill-skill-receipts";
        return this._invoke(
            pageUrl,
            "BackfillSkillReceipts",
            { request: oObject.request },
            this.BackfillSkillReceipts,
            Callback
        );
    }

    async BackfillSkillReceiptsAsync(request) {
        return await ObjectUtil.Promisify(
            this,
            this.BackfillSkillReceipts,
            [ request ]
        );
    }

    async BackfillSkillReceiptsObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.BackfillSkillReceiptsObject,
            [ oObject ]
        );
    }

    InstallPackage(request, Callback) {
        return this.InstallPackageObject({ request:request }, Callback);
    }

    InstallPackageObject(oObject, Callback) {
        this._validate(oObject, PackageDirectoryServiceValidators.InstallPackage, this.InstallPackage.onValidationError);

        var pageUrl = this.Url + "/install-package";
        return this._invoke(
            pageUrl,
            "InstallPackage",
            { request: oObject.request },
            this.InstallPackage,
            Callback
        );
    }

    async InstallPackageAsync(request) {
        return await ObjectUtil.Promisify(
            this,
            this.InstallPackage,
            [ request ]
        );
    }

    async InstallPackageObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.InstallPackageObject,
            [ oObject ]
        );
    }

    InstallProfileLock(request, Callback) {
        return this.InstallProfileLockObject({ request:request }, Callback);
    }

    InstallProfileLockObject(oObject, Callback) {
        this._validate(oObject, PackageDirectoryServiceValidators.InstallProfileLock, this.InstallProfileLock.onValidationError);

        var pageUrl = this.Url + "/install-profile-lock";
        return this._invoke(
            pageUrl,
            "InstallProfileLock",
            { request: oObject.request },
            this.InstallProfileLock,
            Callback
        );
    }

    async InstallProfileLockAsync(request) {
        return await ObjectUtil.Promisify(
            this,
            this.InstallProfileLock,
            [ request ]
        );
    }

    async InstallProfileLockObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.InstallProfileLockObject,
            [ oObject ]
        );
    }

    ListPackages(request, Callback) {
        return this.ListPackagesObject({ request:request }, Callback);
    }

    ListPackagesObject(oObject, Callback) {
        this._validate(oObject, PackageDirectoryServiceValidators.ListPackages, this.ListPackages.onValidationError);

        var pageUrl = this.Url + "/list-packages";
        return this._invoke(
            pageUrl,
            "ListPackages",
            { request: oObject.request },
            this.ListPackages,
            Callback
        );
    }

    async ListPackagesAsync(request) {
        return await ObjectUtil.Promisify(
            this,
            this.ListPackages,
            [ request ]
        );
    }

    async ListPackagesObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.ListPackagesObject,
            [ oObject ]
        );
    }

    ListPackageSources(Callback) {
        return this.ListPackageSourcesObject({  }, Callback);
    }

    ListPackageSourcesObject(oObject, Callback) {
        this._validate(oObject, PackageDirectoryServiceValidators.ListPackageSources, this.ListPackageSources.onValidationError);

        var pageUrl = this.Url + "/list-package-sources";
        return this._invoke(
            pageUrl,
            "ListPackageSources",
            {  },
            this.ListPackageSources,
            Callback
        );
    }

    async ListPackageSourcesAsync() {
        return await ObjectUtil.Promisify(
            this,
            this.ListPackageSources,
            [  ]
        );
    }

    async ListPackageSourcesObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.ListPackageSourcesObject,
            [ oObject ]
        );
    }

    PreviewAllPackageUpdates(request, Callback) {
        return this.PreviewAllPackageUpdatesObject({ request:request }, Callback);
    }

    PreviewAllPackageUpdatesObject(oObject, Callback) {
        this._validate(oObject, PackageDirectoryServiceValidators.PreviewAllPackageUpdates, this.PreviewAllPackageUpdates.onValidationError);

        var pageUrl = this.Url + "/preview-all-package-updates";
        return this._invoke(
            pageUrl,
            "PreviewAllPackageUpdates",
            { request: oObject.request },
            this.PreviewAllPackageUpdates,
            Callback
        );
    }

    async PreviewAllPackageUpdatesAsync(request) {
        return await ObjectUtil.Promisify(
            this,
            this.PreviewAllPackageUpdates,
            [ request ]
        );
    }

    async PreviewAllPackageUpdatesObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.PreviewAllPackageUpdatesObject,
            [ oObject ]
        );
    }

    PreviewInstanceExtensionProfile(request, Callback) {
        return this.PreviewInstanceExtensionProfileObject({ request:request }, Callback);
    }

    PreviewInstanceExtensionProfileObject(oObject, Callback) {
        this._validate(oObject, PackageDirectoryServiceValidators.PreviewInstanceExtensionProfile, this.PreviewInstanceExtensionProfile.onValidationError);

        var pageUrl = this.Url + "/preview-instance-extension-profile";
        return this._invoke(
            pageUrl,
            "PreviewInstanceExtensionProfile",
            { request: oObject.request },
            this.PreviewInstanceExtensionProfile,
            Callback
        );
    }

    async PreviewInstanceExtensionProfileAsync(request) {
        return await ObjectUtil.Promisify(
            this,
            this.PreviewInstanceExtensionProfile,
            [ request ]
        );
    }

    async PreviewInstanceExtensionProfileObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.PreviewInstanceExtensionProfileObject,
            [ oObject ]
        );
    }

    PreviewPackageInstall(request, Callback) {
        return this.PreviewPackageInstallObject({ request:request }, Callback);
    }

    PreviewPackageInstallObject(oObject, Callback) {
        this._validate(oObject, PackageDirectoryServiceValidators.PreviewPackageInstall, this.PreviewPackageInstall.onValidationError);

        var pageUrl = this.Url + "/preview-package-install";
        return this._invoke(
            pageUrl,
            "PreviewPackageInstall",
            { request: oObject.request },
            this.PreviewPackageInstall,
            Callback
        );
    }

    async PreviewPackageInstallAsync(request) {
        return await ObjectUtil.Promisify(
            this,
            this.PreviewPackageInstall,
            [ request ]
        );
    }

    async PreviewPackageInstallObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.PreviewPackageInstallObject,
            [ oObject ]
        );
    }

    RepairPackageActivation(request, Callback) {
        return this.RepairPackageActivationObject({ request:request }, Callback);
    }

    RepairPackageActivationObject(oObject, Callback) {
        this._validate(oObject, PackageDirectoryServiceValidators.RepairPackageActivation, this.RepairPackageActivation.onValidationError);

        var pageUrl = this.Url + "/repair-package-activation";
        return this._invoke(
            pageUrl,
            "RepairPackageActivation",
            { request: oObject.request },
            this.RepairPackageActivation,
            Callback
        );
    }

    async RepairPackageActivationAsync(request) {
        return await ObjectUtil.Promisify(
            this,
            this.RepairPackageActivation,
            [ request ]
        );
    }

    async RepairPackageActivationObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.RepairPackageActivationObject,
            [ oObject ]
        );
    }

    UpdateAllPackages(request, Callback) {
        return this.UpdateAllPackagesObject({ request:request }, Callback);
    }

    UpdateAllPackagesObject(oObject, Callback) {
        this._validate(oObject, PackageDirectoryServiceValidators.UpdateAllPackages, this.UpdateAllPackages.onValidationError);

        var pageUrl = this.Url + "/update-all-packages";
        return this._invoke(
            pageUrl,
            "UpdateAllPackages",
            { request: oObject.request },
            this.UpdateAllPackages,
            Callback
        );
    }

    async UpdateAllPackagesAsync(request) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateAllPackages,
            [ request ]
        );
    }

    async UpdateAllPackagesObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateAllPackagesObject,
            [ oObject ]
        );
    }

    UpdateInstanceExtensionProfile(request, Callback) {
        return this.UpdateInstanceExtensionProfileObject({ request:request }, Callback);
    }

    UpdateInstanceExtensionProfileObject(oObject, Callback) {
        this._validate(oObject, PackageDirectoryServiceValidators.UpdateInstanceExtensionProfile, this.UpdateInstanceExtensionProfile.onValidationError);

        var pageUrl = this.Url + "/update-instance-extension-profile";
        return this._invoke(
            pageUrl,
            "UpdateInstanceExtensionProfile",
            { request: oObject.request },
            this.UpdateInstanceExtensionProfile,
            Callback
        );
    }

    async UpdateInstanceExtensionProfileAsync(request) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateInstanceExtensionProfile,
            [ request ]
        );
    }

    async UpdateInstanceExtensionProfileObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateInstanceExtensionProfileObject,
            [ oObject ]
        );
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

var PackageDirectoryServiceValidators = {
    

    BackfillSkillReceipts : {
            request : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid request"} 
    },

    InstallPackage : {
            request : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid request"} 
    },

    InstallProfileLock : {
            request : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid request"} 
    },

    ListPackages : {
            request : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid request"} 
    },

    ListPackageSources : {
    },

    PreviewAllPackageUpdates : {
            request : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid request"} 
    },

    PreviewInstanceExtensionProfile : {
            request : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid request"} 
    },

    PreviewPackageInstall : {
            request : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid request"} 
    },

    RepairPackageActivation : {
            request : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid request"} 
    },

    UpdateAllPackages : {
            request : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid request"} 
    },

    UpdateInstanceExtensionProfile : {
            request : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid request"} 
    }
};

if (typeof PackageDirectoryService === "undefined")
{
	// Create a global instance for backward compatibility with original usage
	var PackageDirectoryService = new PackageDirectoryServiceService();
}
    