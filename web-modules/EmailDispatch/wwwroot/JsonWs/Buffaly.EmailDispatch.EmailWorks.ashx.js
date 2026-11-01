
    	    	
var EmailWorksValidatorsFields = {
	
		MessageKey : {Validators : [Validators.String], InvalidMessage: "Invalid . " + ValidatorDescriptions.Length(1, 255) },
		ExpectedProposalRevision : {Validators : [Validators.String], InvalidMessage: "Invalid ExpectedProposalRevision. " + ValidatorDescriptions.Length(1, 255) },
		ExpectedPolicyRevision : {Validators : [Validators.String], InvalidMessage: "Invalid ExpectedPolicyRevision. " + ValidatorDescriptions.Length(1, 255) },
		Disposition : {Validators : [Validators.String], InvalidMessage: "Invalid Disposition. " + ValidatorDescriptions.Length(1, 255) },
		NodeId : {Validators : [Validators.String], InvalidMessage: "Invalid NodeId. " + ValidatorDescriptions.Length(1, 255) },
		AccountKey : {Validators : [Validators.String], InvalidMessage: "Invalid AccountKey. " + ValidatorDescriptions.Length(1, 255) },
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

    PrepareSuggestion(WorkKey, Callback) {
        return this.PrepareSuggestionObject({ WorkKey:WorkKey }, Callback);
    }

    PrepareSuggestionObject(oObject, Callback) {
        this._validate(oObject, EmailWorksValidators.PrepareSuggestion, this.PrepareSuggestion.onValidationError);

        var pageUrl = this.Url + "/prepare-suggestion";
        return this._invoke(
            pageUrl,
            "PrepareSuggestion",
            { WorkKey: oObject.WorkKey },
            this.PrepareSuggestion,
            Callback
        );
    }

    async PrepareSuggestionAsync(WorkKey) {
        return await ObjectUtil.Promisify(
            this,
            this.PrepareSuggestion,
            [ WorkKey ]
        );
    }

    async PrepareSuggestionObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.PrepareSuggestionObject,
            [ oObject ]
        );
    }

    ProcessCaptured(AccountKey, Callback) {
        return this.ProcessCapturedObject({ AccountKey:AccountKey }, Callback);
    }

    ProcessCapturedObject(oObject, Callback) {
        this._validate(oObject, EmailWorksValidators.ProcessCaptured, this.ProcessCaptured.onValidationError);

        var pageUrl = this.Url + "/process-captured";
        return this._invoke(
            pageUrl,
            "ProcessCaptured",
            { AccountKey: oObject.AccountKey },
            this.ProcessCaptured,
            Callback
        );
    }

    async ProcessCapturedAsync(AccountKey) {
        return await ObjectUtil.Promisify(
            this,
            this.ProcessCaptured,
            [ AccountKey ]
        );
    }

    async ProcessCapturedObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.ProcessCapturedObject,
            [ oObject ]
        );
    }

    SelectRoutingNode(WorkKey, ExpectedProposalRevision, NodeId, Callback) {
        return this.SelectRoutingNodeObject({ WorkKey:WorkKey,ExpectedProposalRevision:ExpectedProposalRevision,NodeId:NodeId }, Callback);
    }

    SelectRoutingNodeObject(oObject, Callback) {
        this._validate(oObject, EmailWorksValidators.SelectRoutingNode, this.SelectRoutingNode.onValidationError);

        var pageUrl = this.Url + "/select-routing-node";
        return this._invoke(
            pageUrl,
            "SelectRoutingNode",
            { WorkKey: oObject.WorkKey,ExpectedProposalRevision: oObject.ExpectedProposalRevision,NodeId: oObject.NodeId },
            this.SelectRoutingNode,
            Callback
        );
    }

    async SelectRoutingNodeAsync(WorkKey,ExpectedProposalRevision,NodeId) {
        return await ObjectUtil.Promisify(
            this,
            this.SelectRoutingNode,
            [ WorkKey,ExpectedProposalRevision,NodeId ]
        );
    }

    async SelectRoutingNodeObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.SelectRoutingNodeObject,
            [ oObject ]
        );
    }

    SendApproved(WorkKey, ExpectedPolicyRevision, ExpectedProposalRevision, Callback) {
        return this.SendApprovedObject({ WorkKey:WorkKey,ExpectedPolicyRevision:ExpectedPolicyRevision,ExpectedProposalRevision:ExpectedProposalRevision }, Callback);
    }

    SendApprovedObject(oObject, Callback) {
        this._validate(oObject, EmailWorksValidators.SendApproved, this.SendApproved.onValidationError);

        var pageUrl = this.Url + "/send-approved";
        return this._invoke(
            pageUrl,
            "SendApproved",
            { WorkKey: oObject.WorkKey,ExpectedPolicyRevision: oObject.ExpectedPolicyRevision,ExpectedProposalRevision: oObject.ExpectedProposalRevision },
            this.SendApproved,
            Callback
        );
    }

    async SendApprovedAsync(WorkKey,ExpectedPolicyRevision,ExpectedProposalRevision) {
        return await ObjectUtil.Promisify(
            this,
            this.SendApproved,
            [ WorkKey,ExpectedPolicyRevision,ExpectedProposalRevision ]
        );
    }

    async SendApprovedObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.SendApprovedObject,
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
    

    GetDelivery : {
            MessageKey : {Validators: [Validators.Text], InvalidMessage: "Invalid MessageKey"} 
    },

    GetReviewSummary : {
    },

    PrepareSuggestion : {
            WorkKey : {Validators: [Validators.Text], InvalidMessage: "Invalid WorkKey"} 
    },

    ProcessCaptured : {
            AccountKey : {Validators: [Validators.Text], InvalidMessage: "Invalid AccountKey"} 
    },

    SelectRoutingNode : {
            WorkKey : {Validators: [Validators.Text], InvalidMessage: "Invalid WorkKey"} ,
            ExpectedProposalRevision : {Validators: [Validators.Text], InvalidMessage: "Invalid ExpectedProposalRevision"} ,
            NodeId : {Validators: [Validators.Text], InvalidMessage: "Invalid NodeId"} 
    },

    SendApproved : {
            WorkKey : {Validators: [Validators.Text], InvalidMessage: "Invalid WorkKey"} ,
            ExpectedPolicyRevision : {Validators: [Validators.Text], InvalidMessage: "Invalid ExpectedPolicyRevision"} ,
            ExpectedProposalRevision : {Validators: [Validators.Text], InvalidMessage: "Invalid ExpectedProposalRevision"} 
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
    