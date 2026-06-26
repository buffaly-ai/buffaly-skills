

// ensure we're in a browser context and the global object exists
if (typeof window === "undefined" || typeof window.ExtensionPublishingServiceValidatorsFields !== "object") {
	var ExtensionPublishingServiceValidatorsFields = {};
} else {
	// reuse the existing object created by an earlier script
	var ExtensionPublishingServiceValidatorsFields = window.ExtensionPublishingServiceValidatorsFields;
}
	


if (!ExtensionPublishingServiceValidatorsFields.hasOwnProperty("contentRootPath")) {
	ExtensionPublishingServiceValidatorsFields.contentRootPath = {Validators : [Validators.Text], InvalidMessage: "Invalid contentRootPath"};
}
	
if (!ExtensionPublishingServiceValidatorsFields.hasOwnProperty("request")) {
	ExtensionPublishingServiceValidatorsFields.request = {Validators : [Validators.Object], InvalidMessage: "Invalid request"};
}
	

	
class ExtensionPublishingServiceService {
    constructor({ baseUrl = "/api/buffaly.extensionpublishing.webmodule/extension-publishing-service", authToken = null } = {}) {
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


    BuildExtension(request, Callback) {
        return this.BuildExtensionObject({ request:request }, Callback);
    }

    BuildExtensionObject(oObject, Callback) {
        this._validate(oObject, ExtensionPublishingServiceValidators.BuildExtension, this.BuildExtension.onValidationError);

        var pageUrl = this.Url + "/build-extension";
        return this._invoke(
            pageUrl,
            "BuildExtension",
            { request: oObject.request },
            this.BuildExtension,
            Callback
        );
    }

    async BuildExtensionAsync(request) {
        return await ObjectUtil.Promisify(
            this,
            this.BuildExtension,
            [ request ]
        );
    }

    async BuildExtensionObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.BuildExtensionObject,
            [ oObject ]
        );
    }

    Configure(contentRootPath, Callback) {
        return this.ConfigureObject({ contentRootPath:contentRootPath }, Callback);
    }

    ConfigureObject(oObject, Callback) {
        this._validate(oObject, ExtensionPublishingServiceValidators.Configure, this.Configure.onValidationError);

        var pageUrl = this.Url + "/configure";
        return this._invoke(
            pageUrl,
            "Configure",
            { contentRootPath: oObject.contentRootPath },
            this.Configure,
            Callback
        );
    }

    async ConfigureAsync(contentRootPath) {
        return await ObjectUtil.Promisify(
            this,
            this.Configure,
            [ contentRootPath ]
        );
    }

    async ConfigureObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.ConfigureObject,
            [ oObject ]
        );
    }

    GetExtensionPublishStatus(request, Callback) {
        return this.GetExtensionPublishStatusObject({ request:request }, Callback);
    }

    GetExtensionPublishStatusObject(oObject, Callback) {
        this._validate(oObject, ExtensionPublishingServiceValidators.GetExtensionPublishStatus, this.GetExtensionPublishStatus.onValidationError);

        var pageUrl = this.Url + "/get-extension-publish-status";
        return this._invoke(
            pageUrl,
            "GetExtensionPublishStatus",
            { request: oObject.request },
            this.GetExtensionPublishStatus,
            Callback
        );
    }

    async GetExtensionPublishStatusAsync(request) {
        return await ObjectUtil.Promisify(
            this,
            this.GetExtensionPublishStatus,
            [ request ]
        );
    }

    async GetExtensionPublishStatusObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetExtensionPublishStatusObject,
            [ oObject ]
        );
    }

    GetPublishingCatalog(request, Callback) {
        return this.GetPublishingCatalogObject({ request:request }, Callback);
    }

    GetPublishingCatalogObject(oObject, Callback) {
        this._validate(oObject, ExtensionPublishingServiceValidators.GetPublishingCatalog, this.GetPublishingCatalog.onValidationError);

        var pageUrl = this.Url + "/get-publishing-catalog";
        return this._invoke(
            pageUrl,
            "GetPublishingCatalog",
            { request: oObject.request },
            this.GetPublishingCatalog,
            Callback
        );
    }

    async GetPublishingCatalogAsync(request) {
        return await ObjectUtil.Promisify(
            this,
            this.GetPublishingCatalog,
            [ request ]
        );
    }

    async GetPublishingCatalogObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetPublishingCatalogObject,
            [ oObject ]
        );
    }

    PreviewPublishExtension(request, Callback) {
        return this.PreviewPublishExtensionObject({ request:request }, Callback);
    }

    PreviewPublishExtensionObject(oObject, Callback) {
        this._validate(oObject, ExtensionPublishingServiceValidators.PreviewPublishExtension, this.PreviewPublishExtension.onValidationError);

        var pageUrl = this.Url + "/preview-publish-extension";
        return this._invoke(
            pageUrl,
            "PreviewPublishExtension",
            { request: oObject.request },
            this.PreviewPublishExtension,
            Callback
        );
    }

    async PreviewPublishExtensionAsync(request) {
        return await ObjectUtil.Promisify(
            this,
            this.PreviewPublishExtension,
            [ request ]
        );
    }

    async PreviewPublishExtensionObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.PreviewPublishExtensionObject,
            [ oObject ]
        );
    }

    PublishExtension(request, Callback) {
        return this.PublishExtensionObject({ request:request }, Callback);
    }

    PublishExtensionObject(oObject, Callback) {
        this._validate(oObject, ExtensionPublishingServiceValidators.PublishExtension, this.PublishExtension.onValidationError);

        var pageUrl = this.Url + "/publish-extension";
        return this._invoke(
            pageUrl,
            "PublishExtension",
            { request: oObject.request },
            this.PublishExtension,
            Callback
        );
    }

    async PublishExtensionAsync(request) {
        return await ObjectUtil.Promisify(
            this,
            this.PublishExtension,
            [ request ]
        );
    }

    async PublishExtensionObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.PublishExtensionObject,
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

var ExtensionPublishingServiceValidators = {
    

    BuildExtension : {
            request : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid request"} 
    },

    Configure : {
            contentRootPath : {Validators: [Validators.Text], InvalidMessage: "Invalid contentRootPath"} 
    },

    GetExtensionPublishStatus : {
            request : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid request"} 
    },

    GetPublishingCatalog : {
            request : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid request"} 
    },

    PreviewPublishExtension : {
            request : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid request"} 
    },

    PublishExtension : {
            request : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid request"} 
    }
};

if (typeof ExtensionPublishingService === "undefined")
{
	// Create a global instance for backward compatibility with original usage
	var ExtensionPublishingService = new ExtensionPublishingServiceService();
}
    