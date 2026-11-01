
    	    	
var EmailSyncAccountsValidatorsFields = {
	
		AccountKey : {Validators : [Validators.String], InvalidMessage: "Invalid Account key. " + ValidatorDescriptions.Length(1, 255) }	
}
		
class EmailSyncAccountsService {
    constructor({ baseUrl = "/api/buffaly.emaildispatch/email-sync-accounts", authToken = null } = {}) {
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


    GetAccounts(Callback) {
        return this.GetAccountsObject({  }, Callback);
    }

    GetAccountsObject(oObject, Callback) {
        this._validate(oObject, EmailSyncAccountsValidators.GetAccounts, this.GetAccounts.onValidationError);

        var pageUrl = this.Url + "/get-accounts";
        return this._invoke(
            pageUrl,
            "GetAccounts",
            {  },
            this.GetAccounts,
            Callback
        );
    }

    async GetAccountsAsync() {
        return await ObjectUtil.Promisify(
            this,
            this.GetAccounts,
            [  ]
        );
    }

    async GetAccountsObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetAccountsObject,
            [ oObject ]
        );
    }

    Synchronize(AccountKey, Callback) {
        return this.SynchronizeObject({ AccountKey:AccountKey }, Callback);
    }

    SynchronizeObject(oObject, Callback) {
        this._validate(oObject, EmailSyncAccountsValidators.Synchronize, this.Synchronize.onValidationError);

        var pageUrl = this.Url + "/synchronize";
        return this._invoke(
            pageUrl,
            "Synchronize",
            { AccountKey: oObject.AccountKey },
            this.Synchronize,
            Callback
        );
    }

    async SynchronizeAsync(AccountKey) {
        return await ObjectUtil.Promisify(
            this,
            this.Synchronize,
            [ AccountKey ]
        );
    }

    async SynchronizeObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.SynchronizeObject,
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

var EmailSyncAccountsValidators = {
    

    GetAccounts : {
    },

    Synchronize : {
            AccountKey : {Validators: [Validators.Text], InvalidMessage: "Invalid AccountKey"} 
    }
};

if (typeof EmailSyncAccounts === "undefined")
{
	// Create a global instance for backward compatibility with original usage
	var EmailSyncAccounts = new EmailSyncAccountsService();
}
    