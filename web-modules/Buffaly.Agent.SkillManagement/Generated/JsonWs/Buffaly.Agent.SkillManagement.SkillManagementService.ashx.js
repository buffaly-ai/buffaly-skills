

// ensure we're in a browser context and the global object exists
if (typeof window === "undefined" || typeof window.SkillManagementServiceValidatorsFields !== "object") {
	var SkillManagementServiceValidatorsFields = {};
} else {
	// reuse the existing object created by an earlier script
	var SkillManagementServiceValidatorsFields = window.SkillManagementServiceValidatorsFields;
}
	


if (!SkillManagementServiceValidatorsFields.hasOwnProperty("skillNames")) {
	SkillManagementServiceValidatorsFields.skillNames = {Validators : [Validators.Text], InvalidMessage: "Invalid skillNames"};
}
	
if (!SkillManagementServiceValidatorsFields.hasOwnProperty("skillName")) {
	SkillManagementServiceValidatorsFields.skillName = {Validators : [Validators.Text], InvalidMessage: "Invalid skillName"};
}
	

	
class SkillManagementServiceService {
    constructor({ baseUrl = "/api/buffaly.agent.skillmanagement/skill-management-service", authToken = null } = {}) {
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


    DisableSkill(skillName, Callback) {
        return this.DisableSkillObject({ skillName:skillName }, Callback);
    }

    DisableSkillObject(oObject, Callback) {
        this._validate(oObject, SkillManagementServiceValidators.DisableSkill, this.DisableSkill.onValidationError);

        var pageUrl = this.Url + "/disable-skill";
        return this._invoke(
            pageUrl,
            "DisableSkill",
            { skillName: oObject.skillName },
            this.DisableSkill,
            Callback
        );
    }

    async DisableSkillAsync(skillName) {
        return await ObjectUtil.Promisify(
            this,
            this.DisableSkill,
            [ skillName ]
        );
    }

    async DisableSkillObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.DisableSkillObject,
            [ oObject ]
        );
    }

    EnableSkill(skillName, Callback) {
        return this.EnableSkillObject({ skillName:skillName }, Callback);
    }

    EnableSkillObject(oObject, Callback) {
        this._validate(oObject, SkillManagementServiceValidators.EnableSkill, this.EnableSkill.onValidationError);

        var pageUrl = this.Url + "/enable-skill";
        return this._invoke(
            pageUrl,
            "EnableSkill",
            { skillName: oObject.skillName },
            this.EnableSkill,
            Callback
        );
    }

    async EnableSkillAsync(skillName) {
        return await ObjectUtil.Promisify(
            this,
            this.EnableSkill,
            [ skillName ]
        );
    }

    async EnableSkillObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.EnableSkillObject,
            [ oObject ]
        );
    }

    GetAllEnabledSkills(Callback) {
        return this.GetAllEnabledSkillsObject({  }, Callback);
    }

    GetAllEnabledSkillsObject(oObject, Callback) {
        this._validate(oObject, SkillManagementServiceValidators.GetAllEnabledSkills, this.GetAllEnabledSkills.onValidationError);

        var pageUrl = this.Url + "/get-all-enabled-skills";
        return this._invoke(
            pageUrl,
            "GetAllEnabledSkills",
            {  },
            this.GetAllEnabledSkills,
            Callback
        );
    }

    async GetAllEnabledSkillsAsync() {
        return await ObjectUtil.Promisify(
            this,
            this.GetAllEnabledSkills,
            [  ]
        );
    }

    async GetAllEnabledSkillsObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetAllEnabledSkillsObject,
            [ oObject ]
        );
    }

    GetAllInstalledSkills(Callback) {
        return this.GetAllInstalledSkillsObject({  }, Callback);
    }

    GetAllInstalledSkillsObject(oObject, Callback) {
        this._validate(oObject, SkillManagementServiceValidators.GetAllInstalledSkills, this.GetAllInstalledSkills.onValidationError);

        var pageUrl = this.Url + "/get-all-installed-skills";
        return this._invoke(
            pageUrl,
            "GetAllInstalledSkills",
            {  },
            this.GetAllInstalledSkills,
            Callback
        );
    }

    async GetAllInstalledSkillsAsync() {
        return await ObjectUtil.Promisify(
            this,
            this.GetAllInstalledSkills,
            [  ]
        );
    }

    async GetAllInstalledSkillsObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetAllInstalledSkillsObject,
            [ oObject ]
        );
    }

    SetEnabledSkills(skillNames, Callback) {
        return this.SetEnabledSkillsObject({ skillNames:skillNames }, Callback);
    }

    SetEnabledSkillsObject(oObject, Callback) {
        this._validate(oObject, SkillManagementServiceValidators.SetEnabledSkills, this.SetEnabledSkills.onValidationError);

        var pageUrl = this.Url + "/set-enabled-skills";
        return this._invoke(
            pageUrl,
            "SetEnabledSkills",
            { skillNames: oObject.skillNames },
            this.SetEnabledSkills,
            Callback
        );
    }

    async SetEnabledSkillsAsync(skillNames) {
        return await ObjectUtil.Promisify(
            this,
            this.SetEnabledSkills,
            [ skillNames ]
        );
    }

    async SetEnabledSkillsObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.SetEnabledSkillsObject,
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

var SkillManagementServiceValidators = {
    

    DisableSkill : {
            skillName : {Validators: [Validators.Text], InvalidMessage: "Invalid skillName"} 
    },

    EnableSkill : {
            skillName : {Validators: [Validators.Text], InvalidMessage: "Invalid skillName"} 
    },

    GetAllEnabledSkills : {
    },

    GetAllInstalledSkills : {
    },

    SetEnabledSkills : {
            skillNames : {Validators: [Validators.MakeRequired(Validators.Array([Validators.Text]))], InvalidMessage: "Invalid skillNames"} 
    }
};

if (typeof SkillManagementService === "undefined")
{
	// Create a global instance for backward compatibility with original usage
	var SkillManagementService = new SkillManagementServiceService();
}
    