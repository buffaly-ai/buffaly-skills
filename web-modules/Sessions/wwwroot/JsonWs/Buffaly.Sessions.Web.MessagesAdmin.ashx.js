

// ensure we're in a browser context and the global object exists
if (typeof window === "undefined" || typeof window.MessagesAdminValidatorsFields !== "object") {
	var MessagesAdminValidatorsFields = {};
} else {
	// reuse the existing object created by an earlier script
	var MessagesAdminValidatorsFields = window.MessagesAdminValidatorsFields;
}
	


if (!MessagesAdminValidatorsFields.hasOwnProperty("SessionID")) {
	MessagesAdminValidatorsFields.SessionID = {Validators : [Validators.Text], InvalidMessage: "Invalid SessionID"};
}
	
if (!MessagesAdminValidatorsFields.hasOwnProperty("MessageID")) {
	MessagesAdminValidatorsFields.MessageID = {Validators : [Validators.Text], InvalidMessage: "Invalid MessageID"};
}
	
if (!MessagesAdminValidatorsFields.hasOwnProperty("SortAscending")) {
	MessagesAdminValidatorsFields.SortAscending = {Validators : [Validators.Text], InvalidMessage: "Invalid SortAscending"};
}
	
if (!MessagesAdminValidatorsFields.hasOwnProperty("NumRows")) {
	MessagesAdminValidatorsFields.NumRows = {Validators : [Validators.Text], InvalidMessage: "Invalid NumRows"};
}
	
if (!MessagesAdminValidatorsFields.hasOwnProperty("FieldName")) {
	MessagesAdminValidatorsFields.FieldName = {Validators : [Validators.Text], InvalidMessage: "Invalid FieldName"};
}
	
if (!MessagesAdminValidatorsFields.hasOwnProperty("Value")) {
	MessagesAdminValidatorsFields.Value = {Validators : [Validators.Text], InvalidMessage: "Invalid Value"};
}
	
if (!MessagesAdminValidatorsFields.hasOwnProperty("PreOptions")) {
	MessagesAdminValidatorsFields.PreOptions = {Validators : [Validators.Text], InvalidMessage: "Invalid PreOptions"};
}
	
if (!MessagesAdminValidatorsFields.hasOwnProperty("SkipRows")) {
	MessagesAdminValidatorsFields.SkipRows = {Validators : [Validators.Text], InvalidMessage: "Invalid SkipRows"};
}
	
if (!MessagesAdminValidatorsFields.hasOwnProperty("SortColumn")) {
	MessagesAdminValidatorsFields.SortColumn = {Validators : [Validators.Text], InvalidMessage: "Invalid SortColumn"};
}
	
if (!MessagesAdminValidatorsFields.hasOwnProperty("Name")) {
	MessagesAdminValidatorsFields.Name = {Validators : [Validators.Text], InvalidMessage: "Invalid Name"};
}
	
if (!MessagesAdminValidatorsFields.hasOwnProperty("Messages")) {
	MessagesAdminValidatorsFields.Messages = {Validators : [Validators.Text], InvalidMessage: "Invalid Messages"};
}
	
if (!MessagesAdminValidatorsFields.hasOwnProperty("Search")) {
	MessagesAdminValidatorsFields.Search = {Validators : [Validators.Text], InvalidMessage: "Invalid Search"};
}
	

	
class MessagesAdminService {
    constructor({ baseUrl = "/api/buffaly.sessions.web/messages-admin", authToken = null } = {}) {
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


    GetDetails(MessageID, Callback) {
        return this.GetDetailsObject({ MessageID:MessageID }, Callback);
    }

    GetDetailsObject(oObject, Callback) {
        this._validate(oObject, MessagesAdminValidators.GetDetails, this.GetDetails.onValidationError);

        var pageUrl = this.Url + "/get-details";
        return this._invoke(
            pageUrl,
            "GetDetails",
            { MessageID: oObject.MessageID },
            this.GetDetails,
            Callback
        );
    }

    async GetDetailsAsync(MessageID) {
        return await ObjectUtil.Promisify(
            this,
            this.GetDetails,
            [ MessageID ]
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
        this._validate(oObject, MessagesAdminValidators.GetDropDown, this.GetDropDown.onValidationError);

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
        this._validate(oObject, MessagesAdminValidators.GetDropDownWithNull, this.GetDropDownWithNull.onValidationError);

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

    GetEdit(MessageID, Callback) {
        return this.GetEditObject({ MessageID:MessageID }, Callback);
    }

    GetEditObject(oObject, Callback) {
        this._validate(oObject, MessagesAdminValidators.GetEdit, this.GetEdit.onValidationError);

        var pageUrl = this.Url + "/get-edit";
        return this._invoke(
            pageUrl,
            "GetEdit",
            { MessageID: oObject.MessageID },
            this.GetEdit,
            Callback
        );
    }

    async GetEditAsync(MessageID) {
        return await ObjectUtil.Promisify(
            this,
            this.GetEdit,
            [ MessageID ]
        );
    }

    async GetEditObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetEditObject,
            [ oObject ]
        );
    }

    GetGridBySessionIDCount(SessionID, Search, Callback) {
        return this.GetGridBySessionIDCountObject({ SessionID:SessionID,Search:Search }, Callback);
    }

    GetGridBySessionIDCountObject(oObject, Callback) {
        this._validate(oObject, MessagesAdminValidators.GetGridBySessionIDCount, this.GetGridBySessionIDCount.onValidationError);

        var pageUrl = this.Url + "/get-grid-by-session-id-count";
        return this._invoke(
            pageUrl,
            "GetGridBySessionIDCount",
            { SessionID: oObject.SessionID,Search: oObject.Search },
            this.GetGridBySessionIDCount,
            Callback
        );
    }

    async GetGridBySessionIDCountAsync(SessionID,Search) {
        return await ObjectUtil.Promisify(
            this,
            this.GetGridBySessionIDCount,
            [ SessionID,Search ]
        );
    }

    async GetGridBySessionIDCountObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetGridBySessionIDCountObject,
            [ oObject ]
        );
    }

    GetGridBySessionIDHtml(SessionID, Search, SortColumn, SortAscending, SkipRows, NumRows, Callback) {
        return this.GetGridBySessionIDHtmlObject({ SessionID:SessionID,Search:Search,SortColumn:SortColumn,SortAscending:SortAscending,SkipRows:SkipRows,NumRows:NumRows }, Callback);
    }

    GetGridBySessionIDHtmlObject(oObject, Callback) {
        this._validate(oObject, MessagesAdminValidators.GetGridBySessionIDHtml, this.GetGridBySessionIDHtml.onValidationError);

        var pageUrl = this.Url + "/get-grid-by-session-id-html";
        return this._invoke(
            pageUrl,
            "GetGridBySessionIDHtml",
            { SessionID: oObject.SessionID,Search: oObject.Search,SortColumn: oObject.SortColumn,SortAscending: oObject.SortAscending,SkipRows: oObject.SkipRows,NumRows: oObject.NumRows },
            this.GetGridBySessionIDHtml,
            Callback
        );
    }

    async GetGridBySessionIDHtmlAsync(SessionID,Search,SortColumn,SortAscending,SkipRows,NumRows) {
        return await ObjectUtil.Promisify(
            this,
            this.GetGridBySessionIDHtml,
            [ SessionID,Search,SortColumn,SortAscending,SkipRows,NumRows ]
        );
    }

    async GetGridBySessionIDHtmlObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetGridBySessionIDHtmlObject,
            [ oObject ]
        );
    }

    GetGridCount(Search, Callback) {
        return this.GetGridCountObject({ Search:Search }, Callback);
    }

    GetGridCountObject(oObject, Callback) {
        this._validate(oObject, MessagesAdminValidators.GetGridCount, this.GetGridCount.onValidationError);

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
        this._validate(oObject, MessagesAdminValidators.GetGridHtml, this.GetGridHtml.onValidationError);

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

    GetGridHtmlInternal(Messages, Callback) {
        return this.GetGridHtmlInternalObject({ Messages:Messages }, Callback);
    }

    GetGridHtmlInternalObject(oObject, Callback) {
        this._validate(oObject, MessagesAdminValidators.GetGridHtmlInternal, this.GetGridHtmlInternal.onValidationError);

        var pageUrl = this.Url + "/get-grid-html-internal";
        return this._invoke(
            pageUrl,
            "GetGridHtmlInternal",
            { Messages: oObject.Messages },
            this.GetGridHtmlInternal,
            Callback
        );
    }

    async GetGridHtmlInternalAsync(Messages) {
        return await ObjectUtil.Promisify(
            this,
            this.GetGridHtmlInternal,
            [ Messages ]
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
        this._validate(oObject, MessagesAdminValidators.GetInsert, this.GetInsert.onValidationError);

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
        this._validate(oObject, MessagesAdminValidators.Initialize, this.Initialize.onValidationError);

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

var MessagesAdminValidators = {
    

    GetDetails : {
            MessageID : {Validators: [Validators.Text], InvalidMessage: "Invalid MessageID"} 
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
            MessageID : {Validators: [Validators.Text], InvalidMessage: "Invalid MessageID"} 
    },

    GetGridBySessionIDCount : {
            SessionID : {Validators: [Validators.Text], InvalidMessage: "Invalid SessionID"} ,
            Search : {Validators: [Validators.Text], InvalidMessage: "Invalid Search"} 
    },

    GetGridBySessionIDHtml : {
            SessionID : {Validators: [Validators.Text], InvalidMessage: "Invalid SessionID"} ,
            Search : {Validators: [Validators.Text], InvalidMessage: "Invalid Search"} ,
            SortColumn : {Validators: [Validators.Text], InvalidMessage: "Invalid SortColumn"} ,
            SortAscending : {Validators: [Validators.Text], InvalidMessage: "Invalid SortAscending"} ,
            SkipRows : {Validators: [Validators.Text], InvalidMessage: "Invalid SkipRows"} ,
            NumRows : {Validators: [Validators.Text], InvalidMessage: "Invalid NumRows"} 
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
            Messages : {Validators: [Validators.Text], InvalidMessage: "Invalid Messages"} 
    },

    GetInsert : {
    },

    Initialize : {
    }
};

if (typeof MessagesAdmin === "undefined")
{
	// Create a global instance for backward compatibility with original usage
	var MessagesAdmin = new MessagesAdminService();
}
    