
    	    	
var EmailWorksValidatorsFields = {
	
		MessageKey : {Validators : [Validators.String], InvalidMessage: "Invalid . " + ValidatorDescriptions.Length(1, 255) },
		SessionKey : {Validators : [Validators.String], InvalidMessage: "Invalid SessionKey. " + ValidatorDescriptions.Length(1, 255) },
		Disposition : {Validators : [Validators.String], InvalidMessage: "Invalid Disposition. " + ValidatorDescriptions.Length(1, 255) },
		Note : {Validators : [Validators.String], InvalidMessage: "Invalid Note. " + ValidatorDescriptions.Length(1, 255) },
		ExpectedDecisionRevision : {Validators : [Validators.String], InvalidMessage: "Invalid ExpectedDecisionRevision. " + ValidatorDescriptions.Length(1, 255) },
		WorkKey : {Validators : [Validators.String], InvalidMessage: "Invalid . " + ValidatorDescriptions.Length(1, 255) }	
}
		
class EmailWorksService {
    constructor({ baseUrl = "/api/buffaly.emaildispatch/email-works", authToken = null } = {}) {
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


    AddDispatchNote(WorkKey, ExpectedDecisionRevision, Note, Callback) {
        return this.AddDispatchNoteObject({ WorkKey:WorkKey,ExpectedDecisionRevision:ExpectedDecisionRevision,Note:Note }, Callback);
    }

    AddDispatchNoteObject(oObject, Callback) {
        this._validate(oObject, EmailWorksValidators.AddDispatchNote, this.AddDispatchNote.onValidationError);

        var pageUrl = this.Url + "/add-dispatch-note";
        return this._invoke(
            pageUrl,
            "AddDispatchNote",
            { WorkKey: oObject.WorkKey,ExpectedDecisionRevision: oObject.ExpectedDecisionRevision,Note: oObject.Note },
            this.AddDispatchNote,
            Callback
        );
    }

    async AddDispatchNoteAsync(WorkKey,ExpectedDecisionRevision,Note) {
        return await ObjectUtil.Promisify(
            this,
            this.AddDispatchNote,
            [ WorkKey,ExpectedDecisionRevision,Note ]
        );
    }

    async AddDispatchNoteObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.AddDispatchNoteObject,
            [ oObject ]
        );
    }

    ConfirmDispatch(WorkKey, ExpectedDecisionRevision, Note, Callback) {
        return this.ConfirmDispatchObject({ WorkKey:WorkKey,ExpectedDecisionRevision:ExpectedDecisionRevision,Note:Note }, Callback);
    }

    ConfirmDispatchObject(oObject, Callback) {
        this._validate(oObject, EmailWorksValidators.ConfirmDispatch, this.ConfirmDispatch.onValidationError);

        var pageUrl = this.Url + "/confirm-dispatch";
        return this._invoke(
            pageUrl,
            "ConfirmDispatch",
            { WorkKey: oObject.WorkKey,ExpectedDecisionRevision: oObject.ExpectedDecisionRevision,Note: oObject.Note },
            this.ConfirmDispatch,
            Callback
        );
    }

    async ConfirmDispatchAsync(WorkKey,ExpectedDecisionRevision,Note) {
        return await ObjectUtil.Promisify(
            this,
            this.ConfirmDispatch,
            [ WorkKey,ExpectedDecisionRevision,Note ]
        );
    }

    async ConfirmDispatchObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.ConfirmDispatchObject,
            [ oObject ]
        );
    }

    GetDelivery(MessageKey, Callback) {
        return this.GetDeliveryObject({ MessageKey:MessageKey }, Callback);
    }

    GetDeliveryObject(oObject, Callback) {
        this._validate(oObject, EmailWorksValidators.GetDelivery, this.GetDelivery.onValidationError);

        var pageUrl = this.Url + "/get-delivery";
        return this._invoke(
            pageUrl,
            "GetDelivery",
            { MessageKey: oObject.MessageKey },
            this.GetDelivery,
            Callback
        );
    }

    async GetDeliveryAsync(MessageKey) {
        return await ObjectUtil.Promisify(
            this,
            this.GetDelivery,
            [ MessageKey ]
        );
    }

    async GetDeliveryObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetDeliveryObject,
            [ oObject ]
        );
    }

    GetReviewSummary(Callback) {
        return this.GetReviewSummaryObject({  }, Callback);
    }

    GetReviewSummaryObject(oObject, Callback) {
        this._validate(oObject, EmailWorksValidators.GetReviewSummary, this.GetReviewSummary.onValidationError);

        var pageUrl = this.Url + "/get-review-summary";
        return this._invoke(
            pageUrl,
            "GetReviewSummary",
            {  },
            this.GetReviewSummary,
            Callback
        );
    }

    async GetReviewSummaryAsync() {
        return await ObjectUtil.Promisify(
            this,
            this.GetReviewSummary,
            [  ]
        );
    }

    async GetReviewSummaryObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetReviewSummaryObject,
            [ oObject ]
        );
    }

    PickSession(WorkKey, ExpectedDecisionRevision, SessionKey, Note, Callback) {
        return this.PickSessionObject({ WorkKey:WorkKey,ExpectedDecisionRevision:ExpectedDecisionRevision,SessionKey:SessionKey,Note:Note }, Callback);
    }

    PickSessionObject(oObject, Callback) {
        this._validate(oObject, EmailWorksValidators.PickSession, this.PickSession.onValidationError);

        var pageUrl = this.Url + "/pick-session";
        return this._invoke(
            pageUrl,
            "PickSession",
            { WorkKey: oObject.WorkKey,ExpectedDecisionRevision: oObject.ExpectedDecisionRevision,SessionKey: oObject.SessionKey,Note: oObject.Note },
            this.PickSession,
            Callback
        );
    }

    async PickSessionAsync(WorkKey,ExpectedDecisionRevision,SessionKey,Note) {
        return await ObjectUtil.Promisify(
            this,
            this.PickSession,
            [ WorkKey,ExpectedDecisionRevision,SessionKey,Note ]
        );
    }

    async PickSessionObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.PickSessionObject,
            [ oObject ]
        );
    }

    RetryLearning(WorkKey, Callback) {
        return this.RetryLearningObject({ WorkKey:WorkKey }, Callback);
    }

    RetryLearningObject(oObject, Callback) {
        this._validate(oObject, EmailWorksValidators.RetryLearning, this.RetryLearning.onValidationError);

        var pageUrl = this.Url + "/retry-learning";
        return this._invoke(
            pageUrl,
            "RetryLearning",
            { WorkKey: oObject.WorkKey },
            this.RetryLearning,
            Callback
        );
    }

    async RetryLearningAsync(WorkKey) {
        return await ObjectUtil.Promisify(
            this,
            this.RetryLearning,
            [ WorkKey ]
        );
    }

    async RetryLearningObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.RetryLearningObject,
            [ oObject ]
        );
    }

    SetDisposition(WorkKey, Disposition, Callback) {
        return this.SetDispositionObject({ WorkKey:WorkKey,Disposition:Disposition }, Callback);
    }

    SetDispositionObject(oObject, Callback) {
        this._validate(oObject, EmailWorksValidators.SetDisposition, this.SetDisposition.onValidationError);

        var pageUrl = this.Url + "/set-disposition";
        return this._invoke(
            pageUrl,
            "SetDisposition",
            { WorkKey: oObject.WorkKey,Disposition: oObject.Disposition },
            this.SetDisposition,
            Callback
        );
    }

    async SetDispositionAsync(WorkKey,Disposition) {
        return await ObjectUtil.Promisify(
            this,
            this.SetDisposition,
            [ WorkKey,Disposition ]
        );
    }

    async SetDispositionObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.SetDispositionObject,
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

var EmailWorksValidators = {
    

    AddDispatchNote : {
            WorkKey : {Validators: [Validators.Text], InvalidMessage: "Invalid WorkKey"} ,
            ExpectedDecisionRevision : {Validators: [Validators.Text], InvalidMessage: "Invalid ExpectedDecisionRevision"} ,
            Note : {Validators: [Validators.Text], InvalidMessage: "Invalid Note"} 
    },

    ConfirmDispatch : {
            WorkKey : {Validators: [Validators.Text], InvalidMessage: "Invalid WorkKey"} ,
            ExpectedDecisionRevision : {Validators: [Validators.Text], InvalidMessage: "Invalid ExpectedDecisionRevision"} ,
            Note : {Validators: [Validators.Text], InvalidMessage: "Invalid Note"} 
    },

    GetDelivery : {
            MessageKey : {Validators: [Validators.Text], InvalidMessage: "Invalid MessageKey"} 
    },

    GetReviewSummary : {
    },

    PickSession : {
            WorkKey : {Validators: [Validators.Text], InvalidMessage: "Invalid WorkKey"} ,
            ExpectedDecisionRevision : {Validators: [Validators.Text], InvalidMessage: "Invalid ExpectedDecisionRevision"} ,
            SessionKey : {Validators: [Validators.Text], InvalidMessage: "Invalid SessionKey"} ,
            Note : {Validators: [Validators.Text], InvalidMessage: "Invalid Note"} 
    },

    RetryLearning : {
            WorkKey : {Validators: [Validators.Text], InvalidMessage: "Invalid WorkKey"} 
    },

    SetDisposition : {
            WorkKey : {Validators: [Validators.Text], InvalidMessage: "Invalid WorkKey"} ,
            Disposition : {Validators: [Validators.Text], InvalidMessage: "Invalid Disposition"} 
    }
};

if (typeof EmailWorks === "undefined")
{
	// Create a global instance for backward compatibility with original usage
	var EmailWorks = new EmailWorksService();
}
    