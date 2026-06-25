

// ensure we're in a browser context and the global object exists
if (typeof window === "undefined" || typeof window.SkillDirectoryServiceValidatorsFields !== "object") {
	var SkillDirectoryServiceValidatorsFields = {};
} else {
	// reuse the existing object created by an earlier script
	var SkillDirectoryServiceValidatorsFields = window.SkillDirectoryServiceValidatorsFields;
}
	


if (!SkillDirectoryServiceValidatorsFields.hasOwnProperty("request")) {
	SkillDirectoryServiceValidatorsFields.request = {Validators : [Validators.Object], InvalidMessage: "Invalid request"};
}
	

	
class SkillDirectoryServiceService {
    constructor({ baseUrl = "/api/buffaly.agent.skillmanagement/skill-directory-service", authToken = null } = {}) {
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


    GetRemoteSkill(request, Callback) {
        return this.GetRemoteSkillObject({ request:request }, Callback);
    }

    GetRemoteSkillObject(oObject, Callback) {
        this._validate(oObject, SkillDirectoryServiceValidators.GetRemoteSkill, this.GetRemoteSkill.onValidationError);

        var pageUrl = this.Url + "/get-remote-skill";
        return this._invoke(
            pageUrl,
            "GetRemoteSkill",
            { request: oObject.request },
            this.GetRemoteSkill,
            Callback
        );
    }

    async GetRemoteSkillAsync(request) {
        return await ObjectUtil.Promisify(
            this,
            this.GetRemoteSkill,
            [ request ]
        );
    }

    async GetRemoteSkillObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetRemoteSkillObject,
            [ oObject ]
        );
    }

    InstallRemoteSkill(request, Callback) {
        return this.InstallRemoteSkillObject({ request:request }, Callback);
    }

    InstallRemoteSkillObject(oObject, Callback) {
        this._validate(oObject, SkillDirectoryServiceValidators.InstallRemoteSkill, this.InstallRemoteSkill.onValidationError);

        var pageUrl = this.Url + "/install-remote-skill";
        return this._invoke(
            pageUrl,
            "InstallRemoteSkill",
            { request: oObject.request },
            this.InstallRemoteSkill,
            Callback
        );
    }

    async InstallRemoteSkillAsync(request) {
        return await ObjectUtil.Promisify(
            this,
            this.InstallRemoteSkill,
            [ request ]
        );
    }

    async InstallRemoteSkillObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.InstallRemoteSkillObject,
            [ oObject ]
        );
    }

    PreviewRemoteSkillInstall(request, Callback) {
        return this.PreviewRemoteSkillInstallObject({ request:request }, Callback);
    }

    PreviewRemoteSkillInstallObject(oObject, Callback) {
        this._validate(oObject, SkillDirectoryServiceValidators.PreviewRemoteSkillInstall, this.PreviewRemoteSkillInstall.onValidationError);

        var pageUrl = this.Url + "/preview-remote-skill-install";
        return this._invoke(
            pageUrl,
            "PreviewRemoteSkillInstall",
            { request: oObject.request },
            this.PreviewRemoteSkillInstall,
            Callback
        );
    }

    async PreviewRemoteSkillInstallAsync(request) {
        return await ObjectUtil.Promisify(
            this,
            this.PreviewRemoteSkillInstall,
            [ request ]
        );
    }

    async PreviewRemoteSkillInstallObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.PreviewRemoteSkillInstallObject,
            [ oObject ]
        );
    }

    SearchRemoteSkills(request, Callback) {
        return this.SearchRemoteSkillsObject({ request:request }, Callback);
    }

    SearchRemoteSkillsObject(oObject, Callback) {
        this._validate(oObject, SkillDirectoryServiceValidators.SearchRemoteSkills, this.SearchRemoteSkills.onValidationError);

        var pageUrl = this.Url + "/search-remote-skills";
        return this._invoke(
            pageUrl,
            "SearchRemoteSkills",
            { request: oObject.request },
            this.SearchRemoteSkills,
            Callback
        );
    }

    async SearchRemoteSkillsAsync(request) {
        return await ObjectUtil.Promisify(
            this,
            this.SearchRemoteSkills,
            [ request ]
        );
    }

    async SearchRemoteSkillsObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.SearchRemoteSkillsObject,
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

var SkillDirectoryServiceValidators = {
    

    GetRemoteSkill : {
            request : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid request"} 
    },

    InstallRemoteSkill : {
            request : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid request"} 
    },

    PreviewRemoteSkillInstall : {
            request : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid request"} 
    },

    SearchRemoteSkills : {
            request : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid request"} 
    }
};

if (typeof SkillDirectoryService === "undefined")
{
	// Create a global instance for backward compatibility with original usage
	var SkillDirectoryService = new SkillDirectoryServiceService();
}
    
