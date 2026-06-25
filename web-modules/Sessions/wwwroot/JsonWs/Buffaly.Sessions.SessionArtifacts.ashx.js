
    	    	
var SessionArtifactsValidatorsFields = {
	
		SessionID : {Validators : [Validators.ID], InvalidMessage: "Invalid Session ID. " + ValidatorDescriptions.ID() },
		Data : {Validators : [Validators.Data], InvalidMessage: "Invalid Data. " + ValidatorDescriptions.Length(1) },
		SourceMessageID : {Validators : [Validators.ID], InvalidMessage: "Invalid Source Message ID. " + ValidatorDescriptions.ID() },
		ContentData : {Validators : [Validators.Data], InvalidMessage: "Invalid Content Data. " + ValidatorDescriptions.Length(1) },
		FilePath : {Validators : [Validators.String], InvalidMessage: "Invalid File Path. " + ValidatorDescriptions.Length(1, 255) },
		MimeType : {Validators : [Validators.String], InvalidMessage: "Invalid Mime Type. " + ValidatorDescriptions.Length(1, 255) },
		ArtifactName : {Validators : [Validators.String], InvalidMessage: "Invalid Artifact Name. " + ValidatorDescriptions.Length(1, 255) },
		Summary : {Validators : [Validators.Text], InvalidMessage: "Invalid Summary. " + ValidatorDescriptions.Length(1, 4000) },
		SessionArtifactID : {Validators : [Validators.ID], InvalidMessage: "Invalid Session Artifact ID. " + ValidatorDescriptions.ID() },
		ArtifactType : {Validators : [Validators.String], InvalidMessage: "Invalid Artifact Type. " + ValidatorDescriptions.Length(1, 255) }	
}
		
class SessionArtifactsService {
    constructor({ baseUrl = "/api/buffaly.sessions/session-artifacts", authToken = null } = {}) {
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


    CopySessionArtifact(SessionArtifactID, Callback) {
        return this.CopySessionArtifactObject({ SessionArtifactID:SessionArtifactID }, Callback);
    }

    CopySessionArtifactObject(oObject, Callback) {
        this._validate(oObject, SessionArtifactsValidators.CopySessionArtifact, this.CopySessionArtifact.onValidationError);

        var pageUrl = this.Url + "/copy-session-artifact";
        return this._invoke(
            pageUrl,
            "CopySessionArtifact",
            { SessionArtifactID: oObject.SessionArtifactID },
            this.CopySessionArtifact,
            Callback
        );
    }

    async CopySessionArtifactAsync(SessionArtifactID) {
        return await ObjectUtil.Promisify(
            this,
            this.CopySessionArtifact,
            [ SessionArtifactID ]
        );
    }

    async CopySessionArtifactObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.CopySessionArtifactObject,
            [ oObject ]
        );
    }

    ExportSessionArtifact(SessionArtifactID, Callback) {
        return this.ExportSessionArtifactObject({ SessionArtifactID:SessionArtifactID }, Callback);
    }

    ExportSessionArtifactObject(oObject, Callback) {
        this._validate(oObject, SessionArtifactsValidators.ExportSessionArtifact, this.ExportSessionArtifact.onValidationError);

        var pageUrl = this.Url + "/export-session-artifact";
        return this._invoke(
            pageUrl,
            "ExportSessionArtifact",
            { SessionArtifactID: oObject.SessionArtifactID },
            this.ExportSessionArtifact,
            Callback
        );
    }

    async ExportSessionArtifactAsync(SessionArtifactID) {
        return await ObjectUtil.Promisify(
            this,
            this.ExportSessionArtifact,
            [ SessionArtifactID ]
        );
    }

    async ExportSessionArtifactObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.ExportSessionArtifactObject,
            [ oObject ]
        );
    }

    GetSessionArtifact(SessionArtifactID, Callback) {
        return this.GetSessionArtifactObject({ SessionArtifactID:SessionArtifactID }, Callback);
    }

    GetSessionArtifactObject(oObject, Callback) {
        this._validate(oObject, SessionArtifactsValidators.GetSessionArtifact, this.GetSessionArtifact.onValidationError);

        var pageUrl = this.Url + "/get-session-artifact";
        return this._invoke(
            pageUrl,
            "GetSessionArtifact",
            { SessionArtifactID: oObject.SessionArtifactID },
            this.GetSessionArtifact,
            Callback
        );
    }

    async GetSessionArtifactAsync(SessionArtifactID) {
        return await ObjectUtil.Promisify(
            this,
            this.GetSessionArtifact,
            [ SessionArtifactID ]
        );
    }

    async GetSessionArtifactObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetSessionArtifactObject,
            [ oObject ]
        );
    }

    GetSessionArtifacts(Callback) {
        return this.GetSessionArtifactsObject({  }, Callback);
    }

    GetSessionArtifactsObject(oObject, Callback) {
        this._validate(oObject, SessionArtifactsValidators.GetSessionArtifacts, this.GetSessionArtifacts.onValidationError);

        var pageUrl = this.Url + "/get-session-artifacts";
        return this._invoke(
            pageUrl,
            "GetSessionArtifacts",
            {  },
            this.GetSessionArtifacts,
            Callback
        );
    }

    async GetSessionArtifactsAsync() {
        return await ObjectUtil.Promisify(
            this,
            this.GetSessionArtifacts,
            [  ]
        );
    }

    async GetSessionArtifactsObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetSessionArtifactsObject,
            [ oObject ]
        );
    }

    InsertSessionArtifact(SessionID, SourceMessageID, ArtifactType, ArtifactName, FilePath, Summary, ContentData, MimeType, Data, Callback) {
        return this.InsertSessionArtifactObject({ SessionID:SessionID,SourceMessageID:SourceMessageID,ArtifactType:ArtifactType,ArtifactName:ArtifactName,FilePath:FilePath,Summary:Summary,ContentData:ContentData,MimeType:MimeType,Data:Data }, Callback);
    }

    InsertSessionArtifactObject(oObject, Callback) {
        this._validate(oObject, SessionArtifactsValidators.InsertSessionArtifact, this.InsertSessionArtifact.onValidationError);

        var pageUrl = this.Url + "/insert-session-artifact";
        return this._invoke(
            pageUrl,
            "InsertSessionArtifact",
            { SessionID: oObject.SessionID,SourceMessageID: oObject.SourceMessageID,ArtifactType: oObject.ArtifactType,ArtifactName: oObject.ArtifactName,FilePath: oObject.FilePath,Summary: oObject.Summary,ContentData: oObject.ContentData,MimeType: oObject.MimeType,Data: oObject.Data },
            this.InsertSessionArtifact,
            Callback
        );
    }

    async InsertSessionArtifactAsync(SessionID,SourceMessageID,ArtifactType,ArtifactName,FilePath,Summary,ContentData,MimeType,Data) {
        return await ObjectUtil.Promisify(
            this,
            this.InsertSessionArtifact,
            [ SessionID,SourceMessageID,ArtifactType,ArtifactName,FilePath,Summary,ContentData,MimeType,Data ]
        );
    }

    async InsertSessionArtifactObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.InsertSessionArtifactObject,
            [ oObject ]
        );
    }

    RemoveSessionArtifact(SessionArtifactID, Callback) {
        return this.RemoveSessionArtifactObject({ SessionArtifactID:SessionArtifactID }, Callback);
    }

    RemoveSessionArtifactObject(oObject, Callback) {
        this._validate(oObject, SessionArtifactsValidators.RemoveSessionArtifact, this.RemoveSessionArtifact.onValidationError);

        var pageUrl = this.Url + "/remove-session-artifact";
        return this._invoke(
            pageUrl,
            "RemoveSessionArtifact",
            { SessionArtifactID: oObject.SessionArtifactID },
            this.RemoveSessionArtifact,
            Callback
        );
    }

    async RemoveSessionArtifactAsync(SessionArtifactID) {
        return await ObjectUtil.Promisify(
            this,
            this.RemoveSessionArtifact,
            [ SessionArtifactID ]
        );
    }

    async RemoveSessionArtifactObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.RemoveSessionArtifactObject,
            [ oObject ]
        );
    }

    UpdateSessionArtifact(SessionArtifactID, SessionID, SourceMessageID, ArtifactType, ArtifactName, FilePath, Summary, ContentData, MimeType, Data, Callback) {
        return this.UpdateSessionArtifactObject({ SessionArtifactID:SessionArtifactID,SessionID:SessionID,SourceMessageID:SourceMessageID,ArtifactType:ArtifactType,ArtifactName:ArtifactName,FilePath:FilePath,Summary:Summary,ContentData:ContentData,MimeType:MimeType,Data:Data }, Callback);
    }

    UpdateSessionArtifactObject(oObject, Callback) {
        this._validate(oObject, SessionArtifactsValidators.UpdateSessionArtifact, this.UpdateSessionArtifact.onValidationError);

        var pageUrl = this.Url + "/update-session-artifact";
        return this._invoke(
            pageUrl,
            "UpdateSessionArtifact",
            { SessionArtifactID: oObject.SessionArtifactID,SessionID: oObject.SessionID,SourceMessageID: oObject.SourceMessageID,ArtifactType: oObject.ArtifactType,ArtifactName: oObject.ArtifactName,FilePath: oObject.FilePath,Summary: oObject.Summary,ContentData: oObject.ContentData,MimeType: oObject.MimeType,Data: oObject.Data },
            this.UpdateSessionArtifact,
            Callback
        );
    }

    async UpdateSessionArtifactAsync(SessionArtifactID,SessionID,SourceMessageID,ArtifactType,ArtifactName,FilePath,Summary,ContentData,MimeType,Data) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateSessionArtifact,
            [ SessionArtifactID,SessionID,SourceMessageID,ArtifactType,ArtifactName,FilePath,Summary,ContentData,MimeType,Data ]
        );
    }

    async UpdateSessionArtifactObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateSessionArtifactObject,
            [ oObject ]
        );
    }

    UpdateSessionArtifactContentData(SessionArtifactID, ContentData, Callback) {
        return this.UpdateSessionArtifactContentDataObject({ SessionArtifactID:SessionArtifactID,ContentData:ContentData }, Callback);
    }

    UpdateSessionArtifactContentDataObject(oObject, Callback) {
        this._validate(oObject, SessionArtifactsValidators.UpdateSessionArtifactContentData, this.UpdateSessionArtifactContentData.onValidationError);

        var pageUrl = this.Url + "/update-session-artifact-content-data";
        return this._invoke(
            pageUrl,
            "UpdateSessionArtifactContentData",
            { SessionArtifactID: oObject.SessionArtifactID,ContentData: oObject.ContentData },
            this.UpdateSessionArtifactContentData,
            Callback
        );
    }

    async UpdateSessionArtifactContentDataAsync(SessionArtifactID,ContentData) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateSessionArtifactContentData,
            [ SessionArtifactID,ContentData ]
        );
    }

    async UpdateSessionArtifactContentDataObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateSessionArtifactContentDataObject,
            [ oObject ]
        );
    }

    UpdateSessionArtifactData(SessionArtifactID, Data, Callback) {
        return this.UpdateSessionArtifactDataObject({ SessionArtifactID:SessionArtifactID,Data:Data }, Callback);
    }

    UpdateSessionArtifactDataObject(oObject, Callback) {
        this._validate(oObject, SessionArtifactsValidators.UpdateSessionArtifactData, this.UpdateSessionArtifactData.onValidationError);

        var pageUrl = this.Url + "/update-session-artifact-data";
        return this._invoke(
            pageUrl,
            "UpdateSessionArtifactData",
            { SessionArtifactID: oObject.SessionArtifactID,Data: oObject.Data },
            this.UpdateSessionArtifactData,
            Callback
        );
    }

    async UpdateSessionArtifactDataAsync(SessionArtifactID,Data) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateSessionArtifactData,
            [ SessionArtifactID,Data ]
        );
    }

    async UpdateSessionArtifactDataObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateSessionArtifactDataObject,
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

var SessionArtifactsValidators = {
    

    CopySessionArtifact : {
            SessionArtifactID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionArtifactID"} 
    },

    ExportSessionArtifact : {
            SessionArtifactID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionArtifactID"} 
    },

    GetSessionArtifact : {
            SessionArtifactID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionArtifactID"} 
    },

    GetSessionArtifacts : {
    },

    InsertSessionArtifact : {
            SessionID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionID"} ,
            SourceMessageID : {Validators: [Validators.Integer], InvalidMessage: "Invalid SourceMessageID"} ,
            ArtifactType : {Validators: [Validators.Text], InvalidMessage: "Invalid ArtifactType"} ,
            ArtifactName : {Validators: [Validators.Text], InvalidMessage: "Invalid ArtifactName"} ,
            FilePath : {Validators: [Validators.Text], InvalidMessage: "Invalid FilePath"} ,
            Summary : {Validators: [Validators.Text], InvalidMessage: "Invalid Summary"} ,
            ContentData : {Validators: [Validators.Text], InvalidMessage: "Invalid ContentData"} ,
            MimeType : {Validators: [Validators.Text], InvalidMessage: "Invalid MimeType"} ,
            Data : {Validators: [Validators.Text], InvalidMessage: "Invalid Data"} 
    },

    RemoveSessionArtifact : {
            SessionArtifactID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionArtifactID"} 
    },

    UpdateSessionArtifact : {
            SessionArtifactID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionArtifactID"} ,
            SessionID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionID"} ,
            SourceMessageID : {Validators: [Validators.Integer], InvalidMessage: "Invalid SourceMessageID"} ,
            ArtifactType : {Validators: [Validators.Text], InvalidMessage: "Invalid ArtifactType"} ,
            ArtifactName : {Validators: [Validators.Text], InvalidMessage: "Invalid ArtifactName"} ,
            FilePath : {Validators: [Validators.Text], InvalidMessage: "Invalid FilePath"} ,
            Summary : {Validators: [Validators.Text], InvalidMessage: "Invalid Summary"} ,
            ContentData : {Validators: [Validators.Text], InvalidMessage: "Invalid ContentData"} ,
            MimeType : {Validators: [Validators.Text], InvalidMessage: "Invalid MimeType"} ,
            Data : {Validators: [Validators.Text], InvalidMessage: "Invalid Data"} 
    },

    UpdateSessionArtifactContentData : {
            SessionArtifactID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionArtifactID"} ,
            ContentData : {Validators: [Validators.Text], InvalidMessage: "Invalid ContentData"} 
    },

    UpdateSessionArtifactData : {
            SessionArtifactID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionArtifactID"} ,
            Data : {Validators: [Validators.Text], InvalidMessage: "Invalid Data"} 
    }
};

if (typeof SessionArtifacts === "undefined")
{
	// Create a global instance for backward compatibility with original usage
	var SessionArtifacts = new SessionArtifactsService();
}
    