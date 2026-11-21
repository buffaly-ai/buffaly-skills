

// ensure we're in a browser context and the global object exists
if (typeof window === "undefined" || typeof window.SessionsAdminValidatorsFields !== "object") {
	var SessionsAdminValidatorsFields = {};
} else {
	// reuse the existing object created by an earlier script
	var SessionsAdminValidatorsFields = window.SessionsAdminValidatorsFields;
}
	


if (!SessionsAdminValidatorsFields.hasOwnProperty("ProjectName")) {
	SessionsAdminValidatorsFields.ProjectName = {Validators : [Validators.Text], InvalidMessage: "Invalid ProjectName"};
}
	
if (!SessionsAdminValidatorsFields.hasOwnProperty("FieldName")) {
	SessionsAdminValidatorsFields.FieldName = {Validators : [Validators.Text], InvalidMessage: "Invalid FieldName"};
}
	
if (!SessionsAdminValidatorsFields.hasOwnProperty("Data")) {
	SessionsAdminValidatorsFields.Data = {Validators : [Validators.Text], InvalidMessage: "Invalid Data"};
}
	
if (!SessionsAdminValidatorsFields.hasOwnProperty("SortAscending")) {
	SessionsAdminValidatorsFields.SortAscending = {Validators : [Validators.Text], InvalidMessage: "Invalid SortAscending"};
}
	
if (!SessionsAdminValidatorsFields.hasOwnProperty("Provider")) {
	SessionsAdminValidatorsFields.Provider = {Validators : [Validators.Text], InvalidMessage: "Invalid Provider"};
}
	
if (!SessionsAdminValidatorsFields.hasOwnProperty("SessionKey")) {
	SessionsAdminValidatorsFields.SessionKey = {Validators : [Validators.Text], InvalidMessage: "Invalid SessionKey"};
}
	
if (!SessionsAdminValidatorsFields.hasOwnProperty("PromptContext")) {
	SessionsAdminValidatorsFields.PromptContext = {Validators : [Validators.Text], InvalidMessage: "Invalid PromptContext"};
}
	
if (!SessionsAdminValidatorsFields.hasOwnProperty("Name")) {
	SessionsAdminValidatorsFields.Name = {Validators : [Validators.Text], InvalidMessage: "Invalid Name"};
}
	
if (!SessionsAdminValidatorsFields.hasOwnProperty("Value")) {
	SessionsAdminValidatorsFields.Value = {Validators : [Validators.Text], InvalidMessage: "Invalid Value"};
}
	
if (!SessionsAdminValidatorsFields.hasOwnProperty("SessionID")) {
	SessionsAdminValidatorsFields.SessionID = {Validators : [Validators.Integer], InvalidMessage: "Invalid SessionID"};
}
	
if (!SessionsAdminValidatorsFields.hasOwnProperty("IsArchived")) {
	SessionsAdminValidatorsFields.IsArchived = {Validators : [Validators.Boolean], InvalidMessage: "Invalid IsArchived"};
}
	
if (!SessionsAdminValidatorsFields.hasOwnProperty("Sessions")) {
	SessionsAdminValidatorsFields.Sessions = {Validators : [Validators.Text], InvalidMessage: "Invalid Sessions"};
}
	
if (!SessionsAdminValidatorsFields.hasOwnProperty("ExpectedProcessID")) {
	SessionsAdminValidatorsFields.ExpectedProcessID = {Validators : [Validators.Integer], InvalidMessage: "Invalid ExpectedProcessID"};
}
	
if (!SessionsAdminValidatorsFields.hasOwnProperty("SkipRows")) {
	SessionsAdminValidatorsFields.SkipRows = {Validators : [Validators.Text], InvalidMessage: "Invalid SkipRows"};
}
	
if (!SessionsAdminValidatorsFields.hasOwnProperty("AgentName")) {
	SessionsAdminValidatorsFields.AgentName = {Validators : [Validators.Text], InvalidMessage: "Invalid AgentName"};
}
	
if (!SessionsAdminValidatorsFields.hasOwnProperty("ModelName")) {
	SessionsAdminValidatorsFields.ModelName = {Validators : [Validators.Text], InvalidMessage: "Invalid ModelName"};
}
	
if (!SessionsAdminValidatorsFields.hasOwnProperty("SortColumn")) {
	SessionsAdminValidatorsFields.SortColumn = {Validators : [Validators.Text], InvalidMessage: "Invalid SortColumn"};
}
	
if (!SessionsAdminValidatorsFields.hasOwnProperty("Search")) {
	SessionsAdminValidatorsFields.Search = {Validators : [Validators.Text], InvalidMessage: "Invalid Search"};
}
	
if (!SessionsAdminValidatorsFields.hasOwnProperty("RequestID")) {
	SessionsAdminValidatorsFields.RequestID = {Validators : [Validators.Text], InvalidMessage: "Invalid RequestID"};
}
	
if (!SessionsAdminValidatorsFields.hasOwnProperty("ReasoningLevel")) {
	SessionsAdminValidatorsFields.ReasoningLevel = {Validators : [Validators.Text], InvalidMessage: "Invalid ReasoningLevel"};
}
	
if (!SessionsAdminValidatorsFields.hasOwnProperty("NumRows")) {
	SessionsAdminValidatorsFields.NumRows = {Validators : [Validators.Text], InvalidMessage: "Invalid NumRows"};
}
	
if (!SessionsAdminValidatorsFields.hasOwnProperty("TimeZoneID")) {
	SessionsAdminValidatorsFields.TimeZoneID = {Validators : [Validators.Text], InvalidMessage: "Invalid TimeZoneID"};
}
	
if (!SessionsAdminValidatorsFields.hasOwnProperty("LocalDateTime")) {
	SessionsAdminValidatorsFields.LocalDateTime = {Validators : [Validators.Text], InvalidMessage: "Invalid LocalDateTime"};
}
	
if (!SessionsAdminValidatorsFields.hasOwnProperty("DelayMinutes")) {
	SessionsAdminValidatorsFields.DelayMinutes = {Validators : [Validators.Integer], InvalidMessage: "Invalid DelayMinutes"};
}
	
if (!SessionsAdminValidatorsFields.hasOwnProperty("PreOptions")) {
	SessionsAdminValidatorsFields.PreOptions = {Validators : [Validators.Text], InvalidMessage: "Invalid PreOptions"};
}
	
if (!SessionsAdminValidatorsFields.hasOwnProperty("ProjectFilePath")) {
	SessionsAdminValidatorsFields.ProjectFilePath = {Validators : [Validators.Text], InvalidMessage: "Invalid ProjectFilePath"};
}
	

	
class SessionsAdminService {
    constructor({ baseUrl = "/api/buffaly.sessions.web/sessions-admin", authToken = null } = {}) {
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


    CancelSessionSnooze(SessionKey, ExpectedProcessID, Callback) {
        return this.CancelSessionSnoozeObject({ SessionKey:SessionKey,ExpectedProcessID:ExpectedProcessID }, Callback);
    }

    CancelSessionSnoozeObject(oObject, Callback) {
        this._validate(oObject, SessionsAdminValidators.CancelSessionSnooze, this.CancelSessionSnooze.onValidationError);

        var pageUrl = this.Url + "/cancel-session-snooze";
        return this._invoke(
            pageUrl,
            "CancelSessionSnooze",
            { SessionKey: oObject.SessionKey,ExpectedProcessID: oObject.ExpectedProcessID },
            this.CancelSessionSnooze,
            Callback
        );
    }

    async CancelSessionSnoozeAsync(SessionKey,ExpectedProcessID) {
        return await ObjectUtil.Promisify(
            this,
            this.CancelSessionSnooze,
            [ SessionKey,ExpectedProcessID ]
        );
    }

    async CancelSessionSnoozeObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.CancelSessionSnoozeObject,
            [ oObject ]
        );
    }

    ChangeSessionSnooze(SessionKey, RequestID, ExpectedProcessID, DelayMinutes, LocalDateTime, TimeZoneID, Callback) {
        return this.ChangeSessionSnoozeObject({ SessionKey:SessionKey,RequestID:RequestID,ExpectedProcessID:ExpectedProcessID,DelayMinutes:DelayMinutes,LocalDateTime:LocalDateTime,TimeZoneID:TimeZoneID }, Callback);
    }

    ChangeSessionSnoozeObject(oObject, Callback) {
        this._validate(oObject, SessionsAdminValidators.ChangeSessionSnooze, this.ChangeSessionSnooze.onValidationError);

        var pageUrl = this.Url + "/change-session-snooze";
        return this._invoke(
            pageUrl,
            "ChangeSessionSnooze",
            { SessionKey: oObject.SessionKey,RequestID: oObject.RequestID,ExpectedProcessID: oObject.ExpectedProcessID,DelayMinutes: oObject.DelayMinutes,LocalDateTime: oObject.LocalDateTime,TimeZoneID: oObject.TimeZoneID },
            this.ChangeSessionSnooze,
            Callback
        );
    }

    async ChangeSessionSnoozeAsync(SessionKey,RequestID,ExpectedProcessID,DelayMinutes,LocalDateTime,TimeZoneID) {
        return await ObjectUtil.Promisify(
            this,
            this.ChangeSessionSnooze,
            [ SessionKey,RequestID,ExpectedProcessID,DelayMinutes,LocalDateTime,TimeZoneID ]
        );
    }

    async ChangeSessionSnoozeObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.ChangeSessionSnoozeObject,
            [ oObject ]
        );
    }

    GetDetails(SessionID, Callback) {
        return this.GetDetailsObject({ SessionID:SessionID }, Callback);
    }

    GetDetailsObject(oObject, Callback) {
        this._validate(oObject, SessionsAdminValidators.GetDetails, this.GetDetails.onValidationError);

        var pageUrl = this.Url + "/get-details";
        return this._invoke(
            pageUrl,
            "GetDetails",
            { SessionID: oObject.SessionID },
            this.GetDetails,
            Callback
        );
    }

    async GetDetailsAsync(SessionID) {
        return await ObjectUtil.Promisify(
            this,
            this.GetDetails,
            [ SessionID ]
        );
    }

    async GetDetailsObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetDetailsObject,
            [ oObject ]
        );
    }

    GetDropDown(Name, Value, FieldName, PreOptions, Callback) {
        return this.GetDropDownObject({ Name:Name,Value:Value,FieldName:FieldName,PreOptions:PreOptions }, Callback);
    }

    GetDropDownObject(oObject, Callback) {
        this._validate(oObject, SessionsAdminValidators.GetDropDown, this.GetDropDown.onValidationError);

        var pageUrl = this.Url + "/get-drop-down";
        return this._invoke(
            pageUrl,
            "GetDropDown",
            { Name: oObject.Name,Value: oObject.Value,FieldName: oObject.FieldName,PreOptions: oObject.PreOptions },
            this.GetDropDown,
            Callback
        );
    }

    async GetDropDownAsync(Name,Value,FieldName,PreOptions) {
        return await ObjectUtil.Promisify(
            this,
            this.GetDropDown,
            [ Name,Value,FieldName,PreOptions ]
        );
    }

    async GetDropDownObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetDropDownObject,
            [ oObject ]
        );
    }

    GetDropDownWithNull(Callback) {
        return this.GetDropDownWithNullObject({  }, Callback);
    }

    GetDropDownWithNullObject(oObject, Callback) {
        this._validate(oObject, SessionsAdminValidators.GetDropDownWithNull, this.GetDropDownWithNull.onValidationError);

        var pageUrl = this.Url + "/get-drop-down-with-null";
        return this._invoke(
            pageUrl,
            "GetDropDownWithNull",
            {  },
            this.GetDropDownWithNull,
            Callback
        );
    }

    async GetDropDownWithNullAsync() {
        return await ObjectUtil.Promisify(
            this,
            this.GetDropDownWithNull,
            [  ]
        );
    }

    async GetDropDownWithNullObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetDropDownWithNullObject,
            [ oObject ]
        );
    }

    GetEdit(SessionID, Callback) {
        return this.GetEditObject({ SessionID:SessionID }, Callback);
    }

    GetEditObject(oObject, Callback) {
        this._validate(oObject, SessionsAdminValidators.GetEdit, this.GetEdit.onValidationError);

        var pageUrl = this.Url + "/get-edit";
        return this._invoke(
            pageUrl,
            "GetEdit",
            { SessionID: oObject.SessionID },
            this.GetEdit,
            Callback
        );
    }

    async GetEditAsync(SessionID) {
        return await ObjectUtil.Promisify(
            this,
            this.GetEdit,
            [ SessionID ]
        );
    }

    async GetEditObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetEditObject,
            [ oObject ]
        );
    }

    GetGridCount(Search, Callback) {
        return this.GetGridCountObject({ Search:Search }, Callback);
    }

    GetGridCountObject(oObject, Callback) {
        this._validate(oObject, SessionsAdminValidators.GetGridCount, this.GetGridCount.onValidationError);

        var pageUrl = this.Url + "/get-grid-count";
        return this._invoke(
            pageUrl,
            "GetGridCount",
            { Search: oObject.Search },
            this.GetGridCount,
            Callback
        );
    }

    async GetGridCountAsync(Search) {
        return await ObjectUtil.Promisify(
            this,
            this.GetGridCount,
            [ Search ]
        );
    }

    async GetGridCountObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetGridCountObject,
            [ oObject ]
        );
    }

    GetGridHtml(Search, SortColumn, SortAscending, SkipRows, NumRows, Callback) {
        return this.GetGridHtmlObject({ Search:Search,SortColumn:SortColumn,SortAscending:SortAscending,SkipRows:SkipRows,NumRows:NumRows }, Callback);
    }

    GetGridHtmlObject(oObject, Callback) {
        this._validate(oObject, SessionsAdminValidators.GetGridHtml, this.GetGridHtml.onValidationError);

        var pageUrl = this.Url + "/get-grid-html";
        return this._invoke(
            pageUrl,
            "GetGridHtml",
            { Search: oObject.Search,SortColumn: oObject.SortColumn,SortAscending: oObject.SortAscending,SkipRows: oObject.SkipRows,NumRows: oObject.NumRows },
            this.GetGridHtml,
            Callback
        );
    }

    async GetGridHtmlAsync(Search,SortColumn,SortAscending,SkipRows,NumRows) {
        return await ObjectUtil.Promisify(
            this,
            this.GetGridHtml,
            [ Search,SortColumn,SortAscending,SkipRows,NumRows ]
        );
    }

    async GetGridHtmlObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetGridHtmlObject,
            [ oObject ]
        );
    }

    GetGridHtmlInternal(Sessions, Callback) {
        return this.GetGridHtmlInternalObject({ Sessions:Sessions }, Callback);
    }

    GetGridHtmlInternalObject(oObject, Callback) {
        this._validate(oObject, SessionsAdminValidators.GetGridHtmlInternal, this.GetGridHtmlInternal.onValidationError);

        var pageUrl = this.Url + "/get-grid-html-internal";
        return this._invoke(
            pageUrl,
            "GetGridHtmlInternal",
            { Sessions: oObject.Sessions },
            this.GetGridHtmlInternal,
            Callback
        );
    }

    async GetGridHtmlInternalAsync(Sessions) {
        return await ObjectUtil.Promisify(
            this,
            this.GetGridHtmlInternal,
            [ Sessions ]
        );
    }

    async GetGridHtmlInternalObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetGridHtmlInternalObject,
            [ oObject ]
        );
    }

    GetInsert(Callback) {
        return this.GetInsertObject({  }, Callback);
    }

    GetInsertObject(oObject, Callback) {
        this._validate(oObject, SessionsAdminValidators.GetInsert, this.GetInsert.onValidationError);

        var pageUrl = this.Url + "/get-insert";
        return this._invoke(
            pageUrl,
            "GetInsert",
            {  },
            this.GetInsert,
            Callback
        );
    }

    async GetInsertAsync() {
        return await ObjectUtil.Promisify(
            this,
            this.GetInsert,
            [  ]
        );
    }

    async GetInsertObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetInsertObject,
            [ oObject ]
        );
    }

    GetSessionSnooze(SessionKey, RequestID, Callback) {
        return this.GetSessionSnoozeObject({ SessionKey:SessionKey,RequestID:RequestID }, Callback);
    }

    GetSessionSnoozeObject(oObject, Callback) {
        this._validate(oObject, SessionsAdminValidators.GetSessionSnooze, this.GetSessionSnooze.onValidationError);

        var pageUrl = this.Url + "/get-session-snooze";
        return this._invoke(
            pageUrl,
            "GetSessionSnooze",
            { SessionKey: oObject.SessionKey,RequestID: oObject.RequestID },
            this.GetSessionSnooze,
            Callback
        );
    }

    async GetSessionSnoozeAsync(SessionKey,RequestID) {
        return await ObjectUtil.Promisify(
            this,
            this.GetSessionSnooze,
            [ SessionKey,RequestID ]
        );
    }

    async GetSessionSnoozeObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetSessionSnoozeObject,
            [ oObject ]
        );
    }

    GetSessionSnoozeAvailable(Callback) {
        return this.GetSessionSnoozeAvailableObject({  }, Callback);
    }

    GetSessionSnoozeAvailableObject(oObject, Callback) {
        this._validate(oObject, SessionsAdminValidators.GetSessionSnoozeAvailable, this.GetSessionSnoozeAvailable.onValidationError);

        var pageUrl = this.Url + "/get-session-snooze-available";
        return this._invoke(
            pageUrl,
            "GetSessionSnoozeAvailable",
            {  },
            this.GetSessionSnoozeAvailable,
            Callback
        );
    }

    async GetSessionSnoozeAvailableAsync() {
        return await ObjectUtil.Promisify(
            this,
            this.GetSessionSnoozeAvailable,
            [  ]
        );
    }

    async GetSessionSnoozeAvailableObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetSessionSnoozeAvailableObject,
            [ oObject ]
        );
    }

    Initialize(Callback) {
        return this.InitializeObject({  }, Callback);
    }

    InitializeObject(oObject, Callback) {
        this._validate(oObject, SessionsAdminValidators.Initialize, this.Initialize.onValidationError);

        var pageUrl = this.Url + "/initialize";
        return this._invoke(
            pageUrl,
            "Initialize",
            {  },
            this.Initialize,
            Callback
        );
    }

    async InitializeAsync() {
        return await ObjectUtil.Promisify(
            this,
            this.Initialize,
            [  ]
        );
    }

    async InitializeObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.InitializeObject,
            [ oObject ]
        );
    }

    ScheduleSessionSnooze(SessionKey, RequestID, DelayMinutes, LocalDateTime, TimeZoneID, Callback) {
        return this.ScheduleSessionSnoozeObject({ SessionKey:SessionKey,RequestID:RequestID,DelayMinutes:DelayMinutes,LocalDateTime:LocalDateTime,TimeZoneID:TimeZoneID }, Callback);
    }

    ScheduleSessionSnoozeObject(oObject, Callback) {
        this._validate(oObject, SessionsAdminValidators.ScheduleSessionSnooze, this.ScheduleSessionSnooze.onValidationError);

        var pageUrl = this.Url + "/schedule-session-snooze";
        return this._invoke(
            pageUrl,
            "ScheduleSessionSnooze",
            { SessionKey: oObject.SessionKey,RequestID: oObject.RequestID,DelayMinutes: oObject.DelayMinutes,LocalDateTime: oObject.LocalDateTime,TimeZoneID: oObject.TimeZoneID },
            this.ScheduleSessionSnooze,
            Callback
        );
    }

    async ScheduleSessionSnoozeAsync(SessionKey,RequestID,DelayMinutes,LocalDateTime,TimeZoneID) {
        return await ObjectUtil.Promisify(
            this,
            this.ScheduleSessionSnooze,
            [ SessionKey,RequestID,DelayMinutes,LocalDateTime,TimeZoneID ]
        );
    }

    async ScheduleSessionSnoozeObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.ScheduleSessionSnoozeObject,
            [ oObject ]
        );
    }

    UpdateSessionFromAdmin(SessionID, SessionKey, AgentName, ProjectName, ProjectFilePath, Provider, ModelName, ReasoningLevel, PromptContext, Data, IsArchived, Callback) {
        return this.UpdateSessionFromAdminObject({ SessionID:SessionID,SessionKey:SessionKey,AgentName:AgentName,ProjectName:ProjectName,ProjectFilePath:ProjectFilePath,Provider:Provider,ModelName:ModelName,ReasoningLevel:ReasoningLevel,PromptContext:PromptContext,Data:Data,IsArchived:IsArchived }, Callback);
    }

    UpdateSessionFromAdminObject(oObject, Callback) {
        this._validate(oObject, SessionsAdminValidators.UpdateSessionFromAdmin, this.UpdateSessionFromAdmin.onValidationError);

        var pageUrl = this.Url + "/update-session-from-admin";
        return this._invoke(
            pageUrl,
            "UpdateSessionFromAdmin",
            { SessionID: oObject.SessionID,SessionKey: oObject.SessionKey,AgentName: oObject.AgentName,ProjectName: oObject.ProjectName,ProjectFilePath: oObject.ProjectFilePath,Provider: oObject.Provider,ModelName: oObject.ModelName,ReasoningLevel: oObject.ReasoningLevel,PromptContext: oObject.PromptContext,Data: oObject.Data,IsArchived: oObject.IsArchived },
            this.UpdateSessionFromAdmin,
            Callback
        );
    }

    async UpdateSessionFromAdminAsync(SessionID,SessionKey,AgentName,ProjectName,ProjectFilePath,Provider,ModelName,ReasoningLevel,PromptContext,Data,IsArchived) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateSessionFromAdmin,
            [ SessionID,SessionKey,AgentName,ProjectName,ProjectFilePath,Provider,ModelName,ReasoningLevel,PromptContext,Data,IsArchived ]
        );
    }

    async UpdateSessionFromAdminObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateSessionFromAdminObject,
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
            onErrorReceived: (Callback && Callback.onErrorReceived ? Callback.onErrorReceived : (methodConfig.onErrorReceived != null ? methodConfig.onErrorReceived : (Page.HandleUnexpectedError ? Page.HandleUnexpectedError : null)))
        };

        if (this.AuthToken) initializer.AuthToken = this.AuthToken;

        if (Callback) {
            JsonMethod.callWithInitializer(initializer);
        } else {
            return JsonMethod.callSync(pageUrl, methodName, params, methodConfig.Serialize || {});
        }
    }
}

var SessionsAdminValidators = {
    

    CancelSessionSnooze : {
            SessionKey : {Validators: [Validators.Text], InvalidMessage: "Invalid SessionKey"} ,
            ExpectedProcessID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid ExpectedProcessID"} 
    },

    ChangeSessionSnooze : {
            SessionKey : {Validators: [Validators.Text], InvalidMessage: "Invalid SessionKey"} ,
            RequestID : {Validators: [Validators.Text], InvalidMessage: "Invalid RequestID"} ,
            ExpectedProcessID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid ExpectedProcessID"} ,
            DelayMinutes : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid DelayMinutes"} ,
            LocalDateTime : {Validators: [Validators.Text], InvalidMessage: "Invalid LocalDateTime"} ,
            TimeZoneID : {Validators: [Validators.Text], InvalidMessage: "Invalid TimeZoneID"} 
    },

    GetDetails : {
            SessionID : {Validators: [Validators.Text], InvalidMessage: "Invalid SessionID"} 
    },

    GetDropDown : {
            Name : {Validators: [Validators.Text], InvalidMessage: "Invalid Name"} ,
            Value : {Validators: [Validators.Text], InvalidMessage: "Invalid Value"} ,
            FieldName : {Validators: [Validators.Text], InvalidMessage: "Invalid FieldName"} ,
            PreOptions : {Validators: [Validators.Text], InvalidMessage: "Invalid PreOptions"} 
    },

    GetDropDownWithNull : {
    },

    GetEdit : {
            SessionID : {Validators: [Validators.Text], InvalidMessage: "Invalid SessionID"} 
    },

    GetGridCount : {
            Search : {Validators: [Validators.Text], InvalidMessage: "Invalid Search"} 
    },

    GetGridHtml : {
            Search : {Validators: [Validators.Text], InvalidMessage: "Invalid Search"} ,
            SortColumn : {Validators: [Validators.Text], InvalidMessage: "Invalid SortColumn"} ,
            SortAscending : {Validators: [Validators.Text], InvalidMessage: "Invalid SortAscending"} ,
            SkipRows : {Validators: [Validators.Text], InvalidMessage: "Invalid SkipRows"} ,
            NumRows : {Validators: [Validators.Text], InvalidMessage: "Invalid NumRows"} 
    },

    GetGridHtmlInternal : {
            Sessions : {Validators: [Validators.Text], InvalidMessage: "Invalid Sessions"} 
    },

    GetInsert : {
    },

    GetSessionSnooze : {
            SessionKey : {Validators: [Validators.Text], InvalidMessage: "Invalid SessionKey"} ,
            RequestID : {Validators: [Validators.Text], InvalidMessage: "Invalid RequestID"} 
    },

    GetSessionSnoozeAvailable : {
    },

    Initialize : {
    },

    ScheduleSessionSnooze : {
            SessionKey : {Validators: [Validators.Text], InvalidMessage: "Invalid SessionKey"} ,
            RequestID : {Validators: [Validators.Text], InvalidMessage: "Invalid RequestID"} ,
            DelayMinutes : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid DelayMinutes"} ,
            LocalDateTime : {Validators: [Validators.Text], InvalidMessage: "Invalid LocalDateTime"} ,
            TimeZoneID : {Validators: [Validators.Text], InvalidMessage: "Invalid TimeZoneID"} 
    },

    UpdateSessionFromAdmin : {
            SessionID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionID"} ,
            SessionKey : {Validators: [Validators.Text], InvalidMessage: "Invalid SessionKey"} ,
            AgentName : {Validators: [Validators.Text], InvalidMessage: "Invalid AgentName"} ,
            ProjectName : {Validators: [Validators.Text], InvalidMessage: "Invalid ProjectName"} ,
            ProjectFilePath : {Validators: [Validators.Text], InvalidMessage: "Invalid ProjectFilePath"} ,
            Provider : {Validators: [Validators.Text], InvalidMessage: "Invalid Provider"} ,
            ModelName : {Validators: [Validators.Text], InvalidMessage: "Invalid ModelName"} ,
            ReasoningLevel : {Validators: [Validators.Text], InvalidMessage: "Invalid ReasoningLevel"} ,
            PromptContext : {Validators: [Validators.Text], InvalidMessage: "Invalid PromptContext"} ,
            Data : {Validators: [Validators.Text], InvalidMessage: "Invalid Data"} ,
            IsArchived : {Validators: [Validators.MakeRequired(Validators.Boolean)], InvalidMessage: "Invalid IsArchived"} 
    }
};

if (typeof SessionsAdmin === "undefined")
{
	// Create a global instance for backward compatibility with original usage
	var SessionsAdmin = new SessionsAdminService();
}
    