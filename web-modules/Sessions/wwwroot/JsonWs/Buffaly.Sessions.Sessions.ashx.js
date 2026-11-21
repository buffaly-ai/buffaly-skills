
    	    	
var SessionsValidatorsFields = {
	
		SessionID : {Validators : [Validators.ID], InvalidMessage: "Invalid Session ID. " + ValidatorDescriptions.ID() },
		ProjectName : {Validators : [Validators.String], InvalidMessage: "Invalid ProjectName. " + ValidatorDescriptions.Length(1, 255) },
		PromptContext : {Validators : [Validators.String], InvalidMessage: "Invalid PromptContext. " + ValidatorDescriptions.Length(1, 255) },
		Data : {Validators : [Validators.Text], InvalidMessage: "Invalid Data. " + ValidatorDescriptions.Length(1, 4000) },
		Provider : {Validators : [Validators.String], InvalidMessage: "Invalid Provider. " + ValidatorDescriptions.Length(1, 255) },
		ReasoningLevel : {Validators : [Validators.String], InvalidMessage: "Invalid ReasoningLevel. " + ValidatorDescriptions.Length(1, 255) },
		AgentName : {Validators : [Validators.String], InvalidMessage: "Invalid AgentName. " + ValidatorDescriptions.Length(1, 255) },
		ProjectFilePath : {Validators : [Validators.String], InvalidMessage: "Invalid ProjectFilePath. " + ValidatorDescriptions.Length(1, 255) },
		jsonObject : {Validators : [Validators.Object], InvalidMessage: "Invalid jsonObject. " + ValidatorDescriptions.Object() },
		SessionKey : {Validators : [Validators.String], InvalidMessage: "Invalid Session Key. " + ValidatorDescriptions.Length(1, 255) },
		ModelName : {Validators : [Validators.String], InvalidMessage: "Invalid ModelName. " + ValidatorDescriptions.Length(1, 255) }	
}
		
class SessionsService {
    constructor({ baseUrl = "/api/buffaly.sessions/sessions", authToken = null } = {}) {
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


    CopySession(SessionID, Callback) {
        return this.CopySessionObject({ SessionID:SessionID }, Callback);
    }

    CopySessionObject(oObject, Callback) {
        this._validate(oObject, SessionsValidators.CopySession, this.CopySession.onValidationError);

        var pageUrl = this.Url + "/copy-session";
        return this._invoke(
            pageUrl,
            "CopySession",
            { SessionID: oObject.SessionID },
            this.CopySession,
            Callback
        );
    }

    async CopySessionAsync(SessionID) {
        return await ObjectUtil.Promisify(
            this,
            this.CopySession,
            [ SessionID ]
        );
    }

    async CopySessionObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.CopySessionObject,
            [ oObject ]
        );
    }

    ExportSession(SessionID, Callback) {
        return this.ExportSessionObject({ SessionID:SessionID }, Callback);
    }

    ExportSessionObject(oObject, Callback) {
        this._validate(oObject, SessionsValidators.ExportSession, this.ExportSession.onValidationError);

        var pageUrl = this.Url + "/export-session";
        return this._invoke(
            pageUrl,
            "ExportSession",
            { SessionID: oObject.SessionID },
            this.ExportSession,
            Callback
        );
    }

    async ExportSessionAsync(SessionID) {
        return await ObjectUtil.Promisify(
            this,
            this.ExportSession,
            [ SessionID ]
        );
    }

    async ExportSessionObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.ExportSessionObject,
            [ oObject ]
        );
    }

    GetSession(SessionID, Callback) {
        return this.GetSessionObject({ SessionID:SessionID }, Callback);
    }

    GetSessionObject(oObject, Callback) {
        this._validate(oObject, SessionsValidators.GetSession, this.GetSession.onValidationError);

        var pageUrl = this.Url + "/get-session";
        return this._invoke(
            pageUrl,
            "GetSession",
            { SessionID: oObject.SessionID },
            this.GetSession,
            Callback
        );
    }

    async GetSessionAsync(SessionID) {
        return await ObjectUtil.Promisify(
            this,
            this.GetSession,
            [ SessionID ]
        );
    }

    async GetSessionObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetSessionObject,
            [ oObject ]
        );
    }

    GetSessionBySessionKey(SessionKey, Callback) {
        return this.GetSessionBySessionKeyObject({ SessionKey:SessionKey }, Callback);
    }

    GetSessionBySessionKeyObject(oObject, Callback) {
        this._validate(oObject, SessionsValidators.GetSessionBySessionKey, this.GetSessionBySessionKey.onValidationError);

        var pageUrl = this.Url + "/get-session-by-session-key";
        return this._invoke(
            pageUrl,
            "GetSessionBySessionKey",
            { SessionKey: oObject.SessionKey },
            this.GetSessionBySessionKey,
            Callback
        );
    }

    async GetSessionBySessionKeyAsync(SessionKey) {
        return await ObjectUtil.Promisify(
            this,
            this.GetSessionBySessionKey,
            [ SessionKey ]
        );
    }

    async GetSessionBySessionKeyObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetSessionBySessionKeyObject,
            [ oObject ]
        );
    }

    GetSessions(Callback) {
        return this.GetSessionsObject({  }, Callback);
    }

    GetSessionsObject(oObject, Callback) {
        this._validate(oObject, SessionsValidators.GetSessions, this.GetSessions.onValidationError);

        var pageUrl = this.Url + "/get-sessions";
        return this._invoke(
            pageUrl,
            "GetSessions",
            {  },
            this.GetSessions,
            Callback
        );
    }

    async GetSessionsAsync() {
        return await ObjectUtil.Promisify(
            this,
            this.GetSessions,
            [  ]
        );
    }

    async GetSessionsObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetSessionsObject,
            [ oObject ]
        );
    }

    ImportSession(jsonObject, Callback) {
        return this.ImportSessionObject({ jsonObject:jsonObject }, Callback);
    }

    ImportSessionObject(oObject, Callback) {
        this._validate(oObject, SessionsValidators.ImportSession, this.ImportSession.onValidationError);

        var pageUrl = this.Url + "/import-session";
        return this._invoke(
            pageUrl,
            "ImportSession",
            { jsonObject: oObject.jsonObject },
            this.ImportSession,
            Callback
        );
    }

    async ImportSessionAsync(jsonObject) {
        return await ObjectUtil.Promisify(
            this,
            this.ImportSession,
            [ jsonObject ]
        );
    }

    async ImportSessionObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.ImportSessionObject,
            [ oObject ]
        );
    }

    InsertSession(SessionKey, AgentName, ProjectName, ProjectFilePath, Provider, ModelName, ReasoningLevel, PromptContext, Data, Callback) {
        return this.InsertSessionObject({ SessionKey:SessionKey,AgentName:AgentName,ProjectName:ProjectName,ProjectFilePath:ProjectFilePath,Provider:Provider,ModelName:ModelName,ReasoningLevel:ReasoningLevel,PromptContext:PromptContext,Data:Data }, Callback);
    }

    InsertSessionObject(oObject, Callback) {
        this._validate(oObject, SessionsValidators.InsertSession, this.InsertSession.onValidationError);

        var pageUrl = this.Url + "/insert-session";
        return this._invoke(
            pageUrl,
            "InsertSession",
            { SessionKey: oObject.SessionKey,AgentName: oObject.AgentName,ProjectName: oObject.ProjectName,ProjectFilePath: oObject.ProjectFilePath,Provider: oObject.Provider,ModelName: oObject.ModelName,ReasoningLevel: oObject.ReasoningLevel,PromptContext: oObject.PromptContext,Data: oObject.Data },
            this.InsertSession,
            Callback
        );
    }

    async InsertSessionAsync(SessionKey,AgentName,ProjectName,ProjectFilePath,Provider,ModelName,ReasoningLevel,PromptContext,Data) {
        return await ObjectUtil.Promisify(
            this,
            this.InsertSession,
            [ SessionKey,AgentName,ProjectName,ProjectFilePath,Provider,ModelName,ReasoningLevel,PromptContext,Data ]
        );
    }

    async InsertSessionObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.InsertSessionObject,
            [ oObject ]
        );
    }

    RemoveSession(SessionID, Callback) {
        return this.RemoveSessionObject({ SessionID:SessionID }, Callback);
    }

    RemoveSessionObject(oObject, Callback) {
        this._validate(oObject, SessionsValidators.RemoveSession, this.RemoveSession.onValidationError);

        var pageUrl = this.Url + "/remove-session";
        return this._invoke(
            pageUrl,
            "RemoveSession",
            { SessionID: oObject.SessionID },
            this.RemoveSession,
            Callback
        );
    }

    async RemoveSessionAsync(SessionID) {
        return await ObjectUtil.Promisify(
            this,
            this.RemoveSession,
            [ SessionID ]
        );
    }

    async RemoveSessionObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.RemoveSessionObject,
            [ oObject ]
        );
    }

    UpdateSession(SessionID, SessionKey, AgentName, ProjectName, ProjectFilePath, Provider, ModelName, ReasoningLevel, PromptContext, Data, Callback) {
        return this.UpdateSessionObject({ SessionID:SessionID,SessionKey:SessionKey,AgentName:AgentName,ProjectName:ProjectName,ProjectFilePath:ProjectFilePath,Provider:Provider,ModelName:ModelName,ReasoningLevel:ReasoningLevel,PromptContext:PromptContext,Data:Data }, Callback);
    }

    UpdateSessionObject(oObject, Callback) {
        this._validate(oObject, SessionsValidators.UpdateSession, this.UpdateSession.onValidationError);

        var pageUrl = this.Url + "/update-session";
        return this._invoke(
            pageUrl,
            "UpdateSession",
            { SessionID: oObject.SessionID,SessionKey: oObject.SessionKey,AgentName: oObject.AgentName,ProjectName: oObject.ProjectName,ProjectFilePath: oObject.ProjectFilePath,Provider: oObject.Provider,ModelName: oObject.ModelName,ReasoningLevel: oObject.ReasoningLevel,PromptContext: oObject.PromptContext,Data: oObject.Data },
            this.UpdateSession,
            Callback
        );
    }

    async UpdateSessionAsync(SessionID,SessionKey,AgentName,ProjectName,ProjectFilePath,Provider,ModelName,ReasoningLevel,PromptContext,Data) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateSession,
            [ SessionID,SessionKey,AgentName,ProjectName,ProjectFilePath,Provider,ModelName,ReasoningLevel,PromptContext,Data ]
        );
    }

    async UpdateSessionObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateSessionObject,
            [ oObject ]
        );
    }

    UpdateSessionData(SessionID, Data, Callback) {
        return this.UpdateSessionDataObject({ SessionID:SessionID,Data:Data }, Callback);
    }

    UpdateSessionDataObject(oObject, Callback) {
        this._validate(oObject, SessionsValidators.UpdateSessionData, this.UpdateSessionData.onValidationError);

        var pageUrl = this.Url + "/update-session-data";
        return this._invoke(
            pageUrl,
            "UpdateSessionData",
            { SessionID: oObject.SessionID,Data: oObject.Data },
            this.UpdateSessionData,
            Callback
        );
    }

    async UpdateSessionDataAsync(SessionID,Data) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateSessionData,
            [ SessionID,Data ]
        );
    }

    async UpdateSessionDataObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateSessionDataObject,
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

var SessionsValidators = {
    

    CopySession : {
            SessionID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionID"} 
    },

    ExportSession : {
            SessionID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionID"} 
    },

    GetSession : {
            SessionID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionID"} 
    },

    GetSessionBySessionKey : {
            SessionKey : {Validators: [Validators.Text], InvalidMessage: "Invalid SessionKey"} 
    },

    GetSessions : {
    },

    ImportSession : {
            jsonObject : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid jsonObject"} 
    },

    InsertSession : {
            SessionKey : {Validators: [Validators.Text], InvalidMessage: "Invalid SessionKey"} ,
            AgentName : {Validators: [Validators.Text], InvalidMessage: "Invalid AgentName"} ,
            ProjectName : {Validators: [Validators.Text], InvalidMessage: "Invalid ProjectName"} ,
            ProjectFilePath : {Validators: [Validators.Text], InvalidMessage: "Invalid ProjectFilePath"} ,
            Provider : {Validators: [Validators.Text], InvalidMessage: "Invalid Provider"} ,
            ModelName : {Validators: [Validators.Text], InvalidMessage: "Invalid ModelName"} ,
            ReasoningLevel : {Validators: [Validators.Text], InvalidMessage: "Invalid ReasoningLevel"} ,
            PromptContext : {Validators: [Validators.Text], InvalidMessage: "Invalid PromptContext"} ,
            Data : {Validators: [Validators.Text], InvalidMessage: "Invalid Data"} 
    },

    RemoveSession : {
            SessionID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionID"} 
    },

    UpdateSession : {
            SessionID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionID"} ,
            SessionKey : {Validators: [Validators.Text], InvalidMessage: "Invalid SessionKey"} ,
            AgentName : {Validators: [Validators.Text], InvalidMessage: "Invalid AgentName"} ,
            ProjectName : {Validators: [Validators.Text], InvalidMessage: "Invalid ProjectName"} ,
            ProjectFilePath : {Validators: [Validators.Text], InvalidMessage: "Invalid ProjectFilePath"} ,
            Provider : {Validators: [Validators.Text], InvalidMessage: "Invalid Provider"} ,
            ModelName : {Validators: [Validators.Text], InvalidMessage: "Invalid ModelName"} ,
            ReasoningLevel : {Validators: [Validators.Text], InvalidMessage: "Invalid ReasoningLevel"} ,
            PromptContext : {Validators: [Validators.Text], InvalidMessage: "Invalid PromptContext"} ,
            Data : {Validators: [Validators.Text], InvalidMessage: "Invalid Data"} 
    },

    UpdateSessionData : {
            SessionID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionID"} ,
            Data : {Validators: [Validators.Text], InvalidMessage: "Invalid Data"} 
    }
};

if (typeof Sessions === "undefined")
{
	// Create a global instance for backward compatibility with original usage
	var Sessions = new SessionsService();
}
    