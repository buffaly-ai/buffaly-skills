if (typeof window === "undefined" || typeof window.SkillPublishingServiceValidatorsFields !== "object") {
	var SkillPublishingServiceValidatorsFields = {};
} else {
	var SkillPublishingServiceValidatorsFields = window.SkillPublishingServiceValidatorsFields;
}

if (!SkillPublishingServiceValidatorsFields.hasOwnProperty("request")) {
	SkillPublishingServiceValidatorsFields.request = {Validators : [Validators.Object], InvalidMessage: "Invalid request"};
}

class SkillPublishingServiceService {
    constructor({ baseUrl = "/api/buffaly.agent.skillmanagement/skill-publishing-service", authToken = null } = {}) {
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

    PreviewPublishSkillToBuffalySkillRepository(request, Callback) {
        return this.PreviewPublishSkillToBuffalySkillRepositoryObject({ request:request }, Callback);
    }

    PreviewPublishSkillToBuffalySkillRepositoryObject(oObject, Callback) {
        this._validate(oObject, SkillPublishingServiceValidators.PreviewPublishSkillToBuffalySkillRepository, this.PreviewPublishSkillToBuffalySkillRepository.onValidationError);
        var pageUrl = this.Url + "/preview-publish-skill-to-buffaly-skill-repository";
        return this._invoke(pageUrl, "PreviewPublishSkillToBuffalySkillRepository", { request: oObject.request }, this.PreviewPublishSkillToBuffalySkillRepository, Callback);
    }

    async PreviewPublishSkillToBuffalySkillRepositoryAsync(request) {
        return await ObjectUtil.Promisify(this, this.PreviewPublishSkillToBuffalySkillRepository, [ request ]);
    }

    PublishSkillToBuffalySkillRepository(request, Callback) {
        return this.PublishSkillToBuffalySkillRepositoryObject({ request:request }, Callback);
    }

    PublishSkillToBuffalySkillRepositoryObject(oObject, Callback) {
        this._validate(oObject, SkillPublishingServiceValidators.PublishSkillToBuffalySkillRepository, this.PublishSkillToBuffalySkillRepository.onValidationError);
        var pageUrl = this.Url + "/publish-skill-to-buffaly-skill-repository";
        return this._invoke(pageUrl, "PublishSkillToBuffalySkillRepository", { request: oObject.request }, this.PublishSkillToBuffalySkillRepository, Callback);
    }

    async PublishSkillToBuffalySkillRepositoryAsync(request) {
        return await ObjectUtil.Promisify(this, this.PublishSkillToBuffalySkillRepository, [ request ]);
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
        if (Callback) JsonMethod.callWithInitializer(initializer); else return JsonMethod.callSync(pageUrl, methodName, params, methodConfig.Serialize || {});
    }
}

var SkillPublishingServiceValidators = {
    PreviewPublishSkillToBuffalySkillRepository : { request : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid request"} },
    PublishSkillToBuffalySkillRepository : { request : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid request"} }
};

if (typeof SkillPublishingService === "undefined") {
	var SkillPublishingService = new SkillPublishingServiceService();
}
