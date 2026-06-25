
    	    	
var SessionSubscriptionsValidatorsFields = {
	
		SessionID : {Validators : [Validators.ID], InvalidMessage: "Invalid Session ID. " + ValidatorDescriptions.ID() },
		Data : {Validators : [Validators.Data], InvalidMessage: "Invalid Data. " + ValidatorDescriptions.Length(1) },
		SessionSubscriptionID : {Validators : [Validators.ID], InvalidMessage: "Invalid Session Subscription ID. " + ValidatorDescriptions.ID() },
		ExpirationUtc : {Validators : [Validators.Date], InvalidMessage: "Invalid Expiration UTC. " + ValidatorDescriptions.Date() },
		CallbackUrl : {Validators : [Validators.Url], InvalidMessage: "Invalid Callback URL. " + ValidatorDescriptions.Length(1,512) },
		DeliveryMode : {Validators : [Validators.String], InvalidMessage: "Invalid Delivery Mode. " + ValidatorDescriptions.Length(1, 255) },
		IsEnabled : {Validators : [Validators.Boolean], InvalidMessage: "Invalid Enabled. " + ValidatorDescriptions.Boolean() },
		SubscriberSessionKey : {Validators : [Validators.String], InvalidMessage: "Invalid Subscriber Session Key. " + ValidatorDescriptions.Length(1, 255) },
		SubscriptionIdentity : {Validators : [Validators.String], InvalidMessage: "Invalid Subscription Identity. " + ValidatorDescriptions.Length(1, 255) },
		EventType : {Validators : [Validators.String], InvalidMessage: "Invalid Event Type. " + ValidatorDescriptions.Length(1, 255) },
		jsonObject : {Validators : [Validators.Object], InvalidMessage: "Invalid jsonObject. " + ValidatorDescriptions.Object() }	
}
		
class SessionSubscriptionsService {
    constructor({ baseUrl = "/api/buffaly.sessions/session-subscriptions", authToken = null } = {}) {
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


    CopySessionSubscription(SessionSubscriptionID, Callback) {
        return this.CopySessionSubscriptionObject({ SessionSubscriptionID:SessionSubscriptionID }, Callback);
    }

    CopySessionSubscriptionObject(oObject, Callback) {
        this._validate(oObject, SessionSubscriptionsValidators.CopySessionSubscription, this.CopySessionSubscription.onValidationError);

        var pageUrl = this.Url + "/copy-session-subscription";
        return this._invoke(
            pageUrl,
            "CopySessionSubscription",
            { SessionSubscriptionID: oObject.SessionSubscriptionID },
            this.CopySessionSubscription,
            Callback
        );
    }

    async CopySessionSubscriptionAsync(SessionSubscriptionID) {
        return await ObjectUtil.Promisify(
            this,
            this.CopySessionSubscription,
            [ SessionSubscriptionID ]
        );
    }

    async CopySessionSubscriptionObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.CopySessionSubscriptionObject,
            [ oObject ]
        );
    }

    ExportSessionSubscription(SessionSubscriptionID, Callback) {
        return this.ExportSessionSubscriptionObject({ SessionSubscriptionID:SessionSubscriptionID }, Callback);
    }

    ExportSessionSubscriptionObject(oObject, Callback) {
        this._validate(oObject, SessionSubscriptionsValidators.ExportSessionSubscription, this.ExportSessionSubscription.onValidationError);

        var pageUrl = this.Url + "/export-session-subscription";
        return this._invoke(
            pageUrl,
            "ExportSessionSubscription",
            { SessionSubscriptionID: oObject.SessionSubscriptionID },
            this.ExportSessionSubscription,
            Callback
        );
    }

    async ExportSessionSubscriptionAsync(SessionSubscriptionID) {
        return await ObjectUtil.Promisify(
            this,
            this.ExportSessionSubscription,
            [ SessionSubscriptionID ]
        );
    }

    async ExportSessionSubscriptionObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.ExportSessionSubscriptionObject,
            [ oObject ]
        );
    }

    GetSessionSubscription(SessionSubscriptionID, Callback) {
        return this.GetSessionSubscriptionObject({ SessionSubscriptionID:SessionSubscriptionID }, Callback);
    }

    GetSessionSubscriptionObject(oObject, Callback) {
        this._validate(oObject, SessionSubscriptionsValidators.GetSessionSubscription, this.GetSessionSubscription.onValidationError);

        var pageUrl = this.Url + "/get-session-subscription";
        return this._invoke(
            pageUrl,
            "GetSessionSubscription",
            { SessionSubscriptionID: oObject.SessionSubscriptionID },
            this.GetSessionSubscription,
            Callback
        );
    }

    async GetSessionSubscriptionAsync(SessionSubscriptionID) {
        return await ObjectUtil.Promisify(
            this,
            this.GetSessionSubscription,
            [ SessionSubscriptionID ]
        );
    }

    async GetSessionSubscriptionObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetSessionSubscriptionObject,
            [ oObject ]
        );
    }

    GetSessionSubscriptionBySubscriptionIdentity(SubscriptionIdentity, Callback) {
        return this.GetSessionSubscriptionBySubscriptionIdentityObject({ SubscriptionIdentity:SubscriptionIdentity }, Callback);
    }

    GetSessionSubscriptionBySubscriptionIdentityObject(oObject, Callback) {
        this._validate(oObject, SessionSubscriptionsValidators.GetSessionSubscriptionBySubscriptionIdentity, this.GetSessionSubscriptionBySubscriptionIdentity.onValidationError);

        var pageUrl = this.Url + "/get-session-subscription-by-subscription-identity";
        return this._invoke(
            pageUrl,
            "GetSessionSubscriptionBySubscriptionIdentity",
            { SubscriptionIdentity: oObject.SubscriptionIdentity },
            this.GetSessionSubscriptionBySubscriptionIdentity,
            Callback
        );
    }

    async GetSessionSubscriptionBySubscriptionIdentityAsync(SubscriptionIdentity) {
        return await ObjectUtil.Promisify(
            this,
            this.GetSessionSubscriptionBySubscriptionIdentity,
            [ SubscriptionIdentity ]
        );
    }

    async GetSessionSubscriptionBySubscriptionIdentityObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetSessionSubscriptionBySubscriptionIdentityObject,
            [ oObject ]
        );
    }

    GetSessionSubscriptions(Callback) {
        return this.GetSessionSubscriptionsObject({  }, Callback);
    }

    GetSessionSubscriptionsObject(oObject, Callback) {
        this._validate(oObject, SessionSubscriptionsValidators.GetSessionSubscriptions, this.GetSessionSubscriptions.onValidationError);

        var pageUrl = this.Url + "/get-session-subscriptions";
        return this._invoke(
            pageUrl,
            "GetSessionSubscriptions",
            {  },
            this.GetSessionSubscriptions,
            Callback
        );
    }

    async GetSessionSubscriptionsAsync() {
        return await ObjectUtil.Promisify(
            this,
            this.GetSessionSubscriptions,
            [  ]
        );
    }

    async GetSessionSubscriptionsObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetSessionSubscriptionsObject,
            [ oObject ]
        );
    }

    ImportSessionSubscription(jsonObject, Callback) {
        return this.ImportSessionSubscriptionObject({ jsonObject:jsonObject }, Callback);
    }

    ImportSessionSubscriptionObject(oObject, Callback) {
        this._validate(oObject, SessionSubscriptionsValidators.ImportSessionSubscription, this.ImportSessionSubscription.onValidationError);

        var pageUrl = this.Url + "/import-session-subscription";
        return this._invoke(
            pageUrl,
            "ImportSessionSubscription",
            { jsonObject: oObject.jsonObject },
            this.ImportSessionSubscription,
            Callback
        );
    }

    async ImportSessionSubscriptionAsync(jsonObject) {
        return await ObjectUtil.Promisify(
            this,
            this.ImportSessionSubscription,
            [ jsonObject ]
        );
    }

    async ImportSessionSubscriptionObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.ImportSessionSubscriptionObject,
            [ oObject ]
        );
    }

    InsertSessionSubscription(SubscriptionIdentity, SessionID, SubscriberSessionKey, EventType, DeliveryMode, CallbackUrl, IsEnabled, ExpirationUtc, Data, Callback) {
        return this.InsertSessionSubscriptionObject({ SubscriptionIdentity:SubscriptionIdentity,SessionID:SessionID,SubscriberSessionKey:SubscriberSessionKey,EventType:EventType,DeliveryMode:DeliveryMode,CallbackUrl:CallbackUrl,IsEnabled:IsEnabled,ExpirationUtc:ExpirationUtc,Data:Data }, Callback);
    }

    InsertSessionSubscriptionObject(oObject, Callback) {
        this._validate(oObject, SessionSubscriptionsValidators.InsertSessionSubscription, this.InsertSessionSubscription.onValidationError);

        var pageUrl = this.Url + "/insert-session-subscription";
        return this._invoke(
            pageUrl,
            "InsertSessionSubscription",
            { SubscriptionIdentity: oObject.SubscriptionIdentity,SessionID: oObject.SessionID,SubscriberSessionKey: oObject.SubscriberSessionKey,EventType: oObject.EventType,DeliveryMode: oObject.DeliveryMode,CallbackUrl: oObject.CallbackUrl,IsEnabled: oObject.IsEnabled,ExpirationUtc: oObject.ExpirationUtc,Data: oObject.Data },
            this.InsertSessionSubscription,
            Callback
        );
    }

    async InsertSessionSubscriptionAsync(SubscriptionIdentity,SessionID,SubscriberSessionKey,EventType,DeliveryMode,CallbackUrl,IsEnabled,ExpirationUtc,Data) {
        return await ObjectUtil.Promisify(
            this,
            this.InsertSessionSubscription,
            [ SubscriptionIdentity,SessionID,SubscriberSessionKey,EventType,DeliveryMode,CallbackUrl,IsEnabled,ExpirationUtc,Data ]
        );
    }

    async InsertSessionSubscriptionObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.InsertSessionSubscriptionObject,
            [ oObject ]
        );
    }

    MarkSessionSubscriptionAsEnabled(SessionSubscriptionID, Callback) {
        return this.MarkSessionSubscriptionAsEnabledObject({ SessionSubscriptionID:SessionSubscriptionID }, Callback);
    }

    MarkSessionSubscriptionAsEnabledObject(oObject, Callback) {
        this._validate(oObject, SessionSubscriptionsValidators.MarkSessionSubscriptionAsEnabled, this.MarkSessionSubscriptionAsEnabled.onValidationError);

        var pageUrl = this.Url + "/mark-session-subscription-as-enabled";
        return this._invoke(
            pageUrl,
            "MarkSessionSubscriptionAsEnabled",
            { SessionSubscriptionID: oObject.SessionSubscriptionID },
            this.MarkSessionSubscriptionAsEnabled,
            Callback
        );
    }

    async MarkSessionSubscriptionAsEnabledAsync(SessionSubscriptionID) {
        return await ObjectUtil.Promisify(
            this,
            this.MarkSessionSubscriptionAsEnabled,
            [ SessionSubscriptionID ]
        );
    }

    async MarkSessionSubscriptionAsEnabledObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.MarkSessionSubscriptionAsEnabledObject,
            [ oObject ]
        );
    }

    MarkSessionSubscriptionAsNotEnabled(SessionSubscriptionID, Callback) {
        return this.MarkSessionSubscriptionAsNotEnabledObject({ SessionSubscriptionID:SessionSubscriptionID }, Callback);
    }

    MarkSessionSubscriptionAsNotEnabledObject(oObject, Callback) {
        this._validate(oObject, SessionSubscriptionsValidators.MarkSessionSubscriptionAsNotEnabled, this.MarkSessionSubscriptionAsNotEnabled.onValidationError);

        var pageUrl = this.Url + "/mark-session-subscription-as-not-enabled";
        return this._invoke(
            pageUrl,
            "MarkSessionSubscriptionAsNotEnabled",
            { SessionSubscriptionID: oObject.SessionSubscriptionID },
            this.MarkSessionSubscriptionAsNotEnabled,
            Callback
        );
    }

    async MarkSessionSubscriptionAsNotEnabledAsync(SessionSubscriptionID) {
        return await ObjectUtil.Promisify(
            this,
            this.MarkSessionSubscriptionAsNotEnabled,
            [ SessionSubscriptionID ]
        );
    }

    async MarkSessionSubscriptionAsNotEnabledObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.MarkSessionSubscriptionAsNotEnabledObject,
            [ oObject ]
        );
    }

    RemoveSessionSubscription(SessionSubscriptionID, Callback) {
        return this.RemoveSessionSubscriptionObject({ SessionSubscriptionID:SessionSubscriptionID }, Callback);
    }

    RemoveSessionSubscriptionObject(oObject, Callback) {
        this._validate(oObject, SessionSubscriptionsValidators.RemoveSessionSubscription, this.RemoveSessionSubscription.onValidationError);

        var pageUrl = this.Url + "/remove-session-subscription";
        return this._invoke(
            pageUrl,
            "RemoveSessionSubscription",
            { SessionSubscriptionID: oObject.SessionSubscriptionID },
            this.RemoveSessionSubscription,
            Callback
        );
    }

    async RemoveSessionSubscriptionAsync(SessionSubscriptionID) {
        return await ObjectUtil.Promisify(
            this,
            this.RemoveSessionSubscription,
            [ SessionSubscriptionID ]
        );
    }

    async RemoveSessionSubscriptionObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.RemoveSessionSubscriptionObject,
            [ oObject ]
        );
    }

    UpdateSessionSubscription(SessionSubscriptionID, SubscriptionIdentity, SessionID, SubscriberSessionKey, EventType, DeliveryMode, CallbackUrl, IsEnabled, ExpirationUtc, Data, Callback) {
        return this.UpdateSessionSubscriptionObject({ SessionSubscriptionID:SessionSubscriptionID,SubscriptionIdentity:SubscriptionIdentity,SessionID:SessionID,SubscriberSessionKey:SubscriberSessionKey,EventType:EventType,DeliveryMode:DeliveryMode,CallbackUrl:CallbackUrl,IsEnabled:IsEnabled,ExpirationUtc:ExpirationUtc,Data:Data }, Callback);
    }

    UpdateSessionSubscriptionObject(oObject, Callback) {
        this._validate(oObject, SessionSubscriptionsValidators.UpdateSessionSubscription, this.UpdateSessionSubscription.onValidationError);

        var pageUrl = this.Url + "/update-session-subscription";
        return this._invoke(
            pageUrl,
            "UpdateSessionSubscription",
            { SessionSubscriptionID: oObject.SessionSubscriptionID,SubscriptionIdentity: oObject.SubscriptionIdentity,SessionID: oObject.SessionID,SubscriberSessionKey: oObject.SubscriberSessionKey,EventType: oObject.EventType,DeliveryMode: oObject.DeliveryMode,CallbackUrl: oObject.CallbackUrl,IsEnabled: oObject.IsEnabled,ExpirationUtc: oObject.ExpirationUtc,Data: oObject.Data },
            this.UpdateSessionSubscription,
            Callback
        );
    }

    async UpdateSessionSubscriptionAsync(SessionSubscriptionID,SubscriptionIdentity,SessionID,SubscriberSessionKey,EventType,DeliveryMode,CallbackUrl,IsEnabled,ExpirationUtc,Data) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateSessionSubscription,
            [ SessionSubscriptionID,SubscriptionIdentity,SessionID,SubscriberSessionKey,EventType,DeliveryMode,CallbackUrl,IsEnabled,ExpirationUtc,Data ]
        );
    }

    async UpdateSessionSubscriptionObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateSessionSubscriptionObject,
            [ oObject ]
        );
    }

    UpdateSessionSubscriptionData(SessionSubscriptionID, Data, Callback) {
        return this.UpdateSessionSubscriptionDataObject({ SessionSubscriptionID:SessionSubscriptionID,Data:Data }, Callback);
    }

    UpdateSessionSubscriptionDataObject(oObject, Callback) {
        this._validate(oObject, SessionSubscriptionsValidators.UpdateSessionSubscriptionData, this.UpdateSessionSubscriptionData.onValidationError);

        var pageUrl = this.Url + "/update-session-subscription-data";
        return this._invoke(
            pageUrl,
            "UpdateSessionSubscriptionData",
            { SessionSubscriptionID: oObject.SessionSubscriptionID,Data: oObject.Data },
            this.UpdateSessionSubscriptionData,
            Callback
        );
    }

    async UpdateSessionSubscriptionDataAsync(SessionSubscriptionID,Data) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateSessionSubscriptionData,
            [ SessionSubscriptionID,Data ]
        );
    }

    async UpdateSessionSubscriptionDataObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateSessionSubscriptionDataObject,
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

var SessionSubscriptionsValidators = {
    

    CopySessionSubscription : {
            SessionSubscriptionID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionSubscriptionID"} 
    },

    ExportSessionSubscription : {
            SessionSubscriptionID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionSubscriptionID"} 
    },

    GetSessionSubscription : {
            SessionSubscriptionID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionSubscriptionID"} 
    },

    GetSessionSubscriptionBySubscriptionIdentity : {
            SubscriptionIdentity : {Validators: [Validators.Text], InvalidMessage: "Invalid SubscriptionIdentity"} 
    },

    GetSessionSubscriptions : {
    },

    ImportSessionSubscription : {
            jsonObject : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid jsonObject"} 
    },

    InsertSessionSubscription : {
            SubscriptionIdentity : {Validators: [Validators.Text], InvalidMessage: "Invalid SubscriptionIdentity"} ,
            SessionID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionID"} ,
            SubscriberSessionKey : {Validators: [Validators.Text], InvalidMessage: "Invalid SubscriberSessionKey"} ,
            EventType : {Validators: [Validators.Text], InvalidMessage: "Invalid EventType"} ,
            DeliveryMode : {Validators: [Validators.Text], InvalidMessage: "Invalid DeliveryMode"} ,
            CallbackUrl : {Validators: [Validators.Text], InvalidMessage: "Invalid CallbackUrl"} ,
            IsEnabled : {Validators: [Validators.MakeRequired(Validators.Boolean)], InvalidMessage: "Invalid IsEnabled"} ,
            ExpirationUtc : {Validators: [Validators.Date], InvalidMessage: "Invalid ExpirationUtc"} ,
            Data : {Validators: [Validators.Text], InvalidMessage: "Invalid Data"} 
    },

    MarkSessionSubscriptionAsEnabled : {
            SessionSubscriptionID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionSubscriptionID"} 
    },

    MarkSessionSubscriptionAsNotEnabled : {
            SessionSubscriptionID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionSubscriptionID"} 
    },

    RemoveSessionSubscription : {
            SessionSubscriptionID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionSubscriptionID"} 
    },

    UpdateSessionSubscription : {
            SessionSubscriptionID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionSubscriptionID"} ,
            SubscriptionIdentity : {Validators: [Validators.Text], InvalidMessage: "Invalid SubscriptionIdentity"} ,
            SessionID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionID"} ,
            SubscriberSessionKey : {Validators: [Validators.Text], InvalidMessage: "Invalid SubscriberSessionKey"} ,
            EventType : {Validators: [Validators.Text], InvalidMessage: "Invalid EventType"} ,
            DeliveryMode : {Validators: [Validators.Text], InvalidMessage: "Invalid DeliveryMode"} ,
            CallbackUrl : {Validators: [Validators.Text], InvalidMessage: "Invalid CallbackUrl"} ,
            IsEnabled : {Validators: [Validators.MakeRequired(Validators.Boolean)], InvalidMessage: "Invalid IsEnabled"} ,
            ExpirationUtc : {Validators: [Validators.Date], InvalidMessage: "Invalid ExpirationUtc"} ,
            Data : {Validators: [Validators.Text], InvalidMessage: "Invalid Data"} 
    },

    UpdateSessionSubscriptionData : {
            SessionSubscriptionID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionSubscriptionID"} ,
            Data : {Validators: [Validators.Text], InvalidMessage: "Invalid Data"} 
    }
};

if (typeof SessionSubscriptions === "undefined")
{
	// Create a global instance for backward compatibility with original usage
	var SessionSubscriptions = new SessionSubscriptionsService();
}
    