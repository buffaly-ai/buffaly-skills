

// ensure we're in a browser context and the global object exists
if (typeof window === "undefined" || typeof window.SessionsAdminValidatorsFields !== "object") {
	var SessionsAdminValidatorsFields = {};
} else {
	// reuse the existing object created by an earlier script
	var SessionsAdminValidatorsFields = window.SessionsAdminValidatorsFields;
}
	


if (!SessionsAdminValidatorsFields.hasOwnProperty("SessionID")) {
	SessionsAdminValidatorsFields.SessionID = {Validators : [Validators.Text], InvalidMessage: "Invalid SessionID"};
}
	
if (!SessionsAdminValidatorsFields.hasOwnProperty("SortAscending")) {
	SessionsAdminValidatorsFields.SortAscending = {Validators : [Validators.Text], InvalidMessage: "Invalid SortAscending"};
}
	
if (!SessionsAdminValidatorsFields.hasOwnProperty("NumRows")) {
	SessionsAdminValidatorsFields.NumRows = {Validators : [Validators.Text], InvalidMessage: "Invalid NumRows"};
}
	
if (!SessionsAdminValidatorsFields.hasOwnProperty("FieldName")) {
	SessionsAdminValidatorsFields.FieldName = {Validators : [Validators.Text], InvalidMessage: "Invalid FieldName"};
}
	
if (!SessionsAdminValidatorsFields.hasOwnProperty("Value")) {
	SessionsAdminValidatorsFields.Value = {Validators : [Validators.Text], InvalidMessage: "Invalid Value"};
}
	
if (!SessionsAdminValidatorsFields.hasOwnProperty("PreOptions")) {
	SessionsAdminValidatorsFields.PreOptions = {Validators : [Validators.Text], InvalidMessage: "Invalid PreOptions"};
}
	
if (!SessionsAdminValidatorsFields.hasOwnProperty("SkipRows")) {
	SessionsAdminValidatorsFields.SkipRows = {Validators : [Validators.Text], InvalidMessage: "Invalid SkipRows"};
}
	
if (!SessionsAdminValidatorsFields.hasOwnProperty("SortColumn")) {
	SessionsAdminValidatorsFields.SortColumn = {Validators : [Validators.Text], InvalidMessage: "Invalid SortColumn"};
}
	
if (!SessionsAdminValidatorsFields.hasOwnProperty("Name")) {
	SessionsAdminValidatorsFields.Name = {Validators : [Validators.Text], InvalidMessage: "Invalid Name"};
}
	
if (!SessionsAdminValidatorsFields.hasOwnProperty("Sessions")) {
	SessionsAdminValidatorsFields.Sessions = {Validators : [Validators.Text], InvalidMessage: "Invalid Sessions"};
}
	
if (!SessionsAdminValidatorsFields.hasOwnProperty("Search")) {
	SessionsAdminValidatorsFields.Search = {Validators : [Validators.Text], InvalidMessage: "Invalid Search"};
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

var SessionsAdminValidators = {
    

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

    Initialize : {
    }
};

if (typeof SessionsAdmin === "undefined")
{
	// Create a global instance for backward compatibility with original usage
	var SessionsAdmin = new SessionsAdminService();
}
    