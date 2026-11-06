
    	    	
var EmailObservationsValidatorsFields = {
	
		ThreadId : {Validators : [Validators.String], InvalidMessage: "Invalid . " + ValidatorDescriptions.Length(1, 255) },
		WorkSession : {Validators : [Validators.String], InvalidMessage: "Invalid WorkSession. " + ValidatorDescriptions.Length(1, 255) },
		Anchor : {Validators : [Validators.String], InvalidMessage: "Invalid Anchor. " + ValidatorDescriptions.Length(1, 255) },
		State : {Validators : [Validators.String], InvalidMessage: "Invalid State. " + ValidatorDescriptions.Length(1, 255) },
		Rule : {Validators : [Validators.String], InvalidMessage: "Invalid Rule. " + ValidatorDescriptions.Length(1, 255) },
		ObservationKey : {Validators : [Validators.String], InvalidMessage: "Invalid . " + ValidatorDescriptions.Length(1, 255) },
		PrototypeName : {Validators : [Validators.String], InvalidMessage: "Invalid PrototypeName. " + ValidatorDescriptions.Length(1, 255) },
		ExpectedRulesRevision : {Validators : [Validators.String], InvalidMessage: "Invalid ExpectedRulesRevision. " + ValidatorDescriptions.Length(1, 255) },
		MessageId : {Validators : [Validators.String], InvalidMessage: "Invalid . " + ValidatorDescriptions.Length(1, 255) },
		PageToken : {Validators : [Validators.String], InvalidMessage: "Invalid PageToken. " + ValidatorDescriptions.Length(1, 255) },
		SkipRows : {Validators : [Validators.Integer], InvalidMessage: "Invalid SkipRows. " + ValidatorDescriptions.Integer() },
		Search : {Validators : [Validators.String], InvalidMessage: "Invalid Search. " + ValidatorDescriptions.Length(1, 255) },
		Outcome : {Validators : [Validators.String], InvalidMessage: "Invalid Outcome. " + ValidatorDescriptions.Length(1, 255) },
		AccountKey : {Validators : [Validators.String], InvalidMessage: "Invalid . " + ValidatorDescriptions.Length(1, 255) },
		Processor : {Validators : [Validators.String], InvalidMessage: "Invalid Processor. " + ValidatorDescriptions.Length(1, 255) },
		NumRows : {Validators : [Validators.Integer], InvalidMessage: "Invalid NumRows. " + ValidatorDescriptions.Integer() }	
}
		
class EmailObservationsService {
    constructor({ baseUrl = "/api/buffaly.emaildispatch/email-observations", authToken = null } = {}) {
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


    ArchiveConversation(AccountKey, ThreadId, Callback) {
        return this.ArchiveConversationObject({ AccountKey:AccountKey,ThreadId:ThreadId }, Callback);
    }

    ArchiveConversationObject(oObject, Callback) {
        this._validate(oObject, EmailObservationsValidators.ArchiveConversation, this.ArchiveConversation.onValidationError);

        var pageUrl = this.Url + "/archive-conversation";
        return this._invoke(
            pageUrl,
            "ArchiveConversation",
            { AccountKey: oObject.AccountKey,ThreadId: oObject.ThreadId },
            this.ArchiveConversation,
            Callback
        );
    }

    async ArchiveConversationAsync(AccountKey,ThreadId) {
        return await ObjectUtil.Promisify(
            this,
            this.ArchiveConversation,
            [ AccountKey,ThreadId ]
        );
    }

    async ArchiveConversationObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.ArchiveConversationObject,
            [ oObject ]
        );
    }

    ClearRule(PrototypeName, ExpectedRulesRevision, Callback) {
        return this.ClearRuleObject({ PrototypeName:PrototypeName,ExpectedRulesRevision:ExpectedRulesRevision }, Callback);
    }

    ClearRuleObject(oObject, Callback) {
        this._validate(oObject, EmailObservationsValidators.ClearRule, this.ClearRule.onValidationError);

        var pageUrl = this.Url + "/clear-rule";
        return this._invoke(
            pageUrl,
            "ClearRule",
            { PrototypeName: oObject.PrototypeName,ExpectedRulesRevision: oObject.ExpectedRulesRevision },
            this.ClearRule,
            Callback
        );
    }

    async ClearRuleAsync(PrototypeName,ExpectedRulesRevision) {
        return await ObjectUtil.Promisify(
            this,
            this.ClearRule,
            [ PrototypeName,ExpectedRulesRevision ]
        );
    }

    async ClearRuleObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.ClearRuleObject,
            [ oObject ]
        );
    }

    GetConversation(AccountKey, ThreadId, SkipRows, NumRows, Callback) {
        return this.GetConversationObject({ AccountKey:AccountKey,ThreadId:ThreadId,SkipRows:SkipRows,NumRows:NumRows }, Callback);
    }

    GetConversationObject(oObject, Callback) {
        this._validate(oObject, EmailObservationsValidators.GetConversation, this.GetConversation.onValidationError);

        var pageUrl = this.Url + "/get-conversation";
        return this._invoke(
            pageUrl,
            "GetConversation",
            { AccountKey: oObject.AccountKey,ThreadId: oObject.ThreadId,SkipRows: oObject.SkipRows,NumRows: oObject.NumRows },
            this.GetConversation,
            Callback
        );
    }

    async GetConversationAsync(AccountKey,ThreadId,SkipRows,NumRows) {
        return await ObjectUtil.Promisify(
            this,
            this.GetConversation,
            [ AccountKey,ThreadId,SkipRows,NumRows ]
        );
    }

    async GetConversationObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetConversationObject,
            [ oObject ]
        );
    }

    GetConversationBody(AccountKey, ThreadId, MessageId, Callback) {
        return this.GetConversationBodyObject({ AccountKey:AccountKey,ThreadId:ThreadId,MessageId:MessageId }, Callback);
    }

    GetConversationBodyObject(oObject, Callback) {
        this._validate(oObject, EmailObservationsValidators.GetConversationBody, this.GetConversationBody.onValidationError);

        var pageUrl = this.Url + "/get-conversation-body";
        return this._invoke(
            pageUrl,
            "GetConversationBody",
            { AccountKey: oObject.AccountKey,ThreadId: oObject.ThreadId,MessageId: oObject.MessageId },
            this.GetConversationBody,
            Callback
        );
    }

    async GetConversationBodyAsync(AccountKey,ThreadId,MessageId) {
        return await ObjectUtil.Promisify(
            this,
            this.GetConversationBody,
            [ AccountKey,ThreadId,MessageId ]
        );
    }

    async GetConversationBodyObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetConversationBodyObject,
            [ oObject ]
        );
    }

    GetConversations(AccountKey, Search, PageToken, NumRows, State, Callback) {
        return this.GetConversationsObject({ AccountKey:AccountKey,Search:Search,PageToken:PageToken,NumRows:NumRows,State:State }, Callback);
    }

    GetConversationsObject(oObject, Callback) {
        this._validate(oObject, EmailObservationsValidators.GetConversations, this.GetConversations.onValidationError);

        var pageUrl = this.Url + "/get-conversations";
        return this._invoke(
            pageUrl,
            "GetConversations",
            { AccountKey: oObject.AccountKey,Search: oObject.Search,PageToken: oObject.PageToken,NumRows: oObject.NumRows,State: oObject.State },
            this.GetConversations,
            Callback
        );
    }

    async GetConversationsAsync(AccountKey,Search,PageToken,NumRows,State) {
        return await ObjectUtil.Promisify(
            this,
            this.GetConversations,
            [ AccountKey,Search,PageToken,NumRows,State ]
        );
    }

    async GetConversationsObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetConversationsObject,
            [ oObject ]
        );
    }

    GetEmail(ObservationKey, Callback) {
        return this.GetEmailObject({ ObservationKey:ObservationKey }, Callback);
    }

    GetEmailObject(oObject, Callback) {
        this._validate(oObject, EmailObservationsValidators.GetEmail, this.GetEmail.onValidationError);

        var pageUrl = this.Url + "/get-email";
        return this._invoke(
            pageUrl,
            "GetEmail",
            { ObservationKey: oObject.ObservationKey },
            this.GetEmail,
            Callback
        );
    }

    async GetEmailAsync(ObservationKey) {
        return await ObjectUtil.Promisify(
            this,
            this.GetEmail,
            [ ObservationKey ]
        );
    }

    async GetEmailObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetEmailObject,
            [ oObject ]
        );
    }

    GetFormattedBody(ObservationKey, Callback) {
        return this.GetFormattedBodyObject({ ObservationKey:ObservationKey }, Callback);
    }

    GetFormattedBodyObject(oObject, Callback) {
        this._validate(oObject, EmailObservationsValidators.GetFormattedBody, this.GetFormattedBody.onValidationError);

        var pageUrl = this.Url + "/get-formatted-body";
        return this._invoke(
            pageUrl,
            "GetFormattedBody",
            { ObservationKey: oObject.ObservationKey },
            this.GetFormattedBody,
            Callback
        );
    }

    async GetFormattedBodyAsync(ObservationKey) {
        return await ObjectUtil.Promisify(
            this,
            this.GetFormattedBody,
            [ ObservationKey ]
        );
    }

    async GetFormattedBodyObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetFormattedBodyObject,
            [ oObject ]
        );
    }

    GetInbox(AccountKey, State, Search, SkipRows, NumRows, Callback) {
        return this.GetInboxObject({ AccountKey:AccountKey,State:State,Search:Search,SkipRows:SkipRows,NumRows:NumRows }, Callback);
    }

    GetInboxObject(oObject, Callback) {
        this._validate(oObject, EmailObservationsValidators.GetInbox, this.GetInbox.onValidationError);

        var pageUrl = this.Url + "/get-inbox";
        return this._invoke(
            pageUrl,
            "GetInbox",
            { AccountKey: oObject.AccountKey,State: oObject.State,Search: oObject.Search,SkipRows: oObject.SkipRows,NumRows: oObject.NumRows },
            this.GetInbox,
            Callback
        );
    }

    async GetInboxAsync(AccountKey,State,Search,SkipRows,NumRows) {
        return await ObjectUtil.Promisify(
            this,
            this.GetInbox,
            [ AccountKey,State,Search,SkipRows,NumRows ]
        );
    }

    async GetInboxObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetInboxObject,
            [ oObject ]
        );
    }

    GetRecentSessions(Search, SkipRows, NumRows, Callback) {
        return this.GetRecentSessionsObject({ Search:Search,SkipRows:SkipRows,NumRows:NumRows }, Callback);
    }

    GetRecentSessionsObject(oObject, Callback) {
        this._validate(oObject, EmailObservationsValidators.GetRecentSessions, this.GetRecentSessions.onValidationError);

        var pageUrl = this.Url + "/get-recent-sessions";
        return this._invoke(
            pageUrl,
            "GetRecentSessions",
            { Search: oObject.Search,SkipRows: oObject.SkipRows,NumRows: oObject.NumRows },
            this.GetRecentSessions,
            Callback
        );
    }

    async GetRecentSessionsAsync(Search,SkipRows,NumRows) {
        return await ObjectUtil.Promisify(
            this,
            this.GetRecentSessions,
            [ Search,SkipRows,NumRows ]
        );
    }

    async GetRecentSessionsObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetRecentSessionsObject,
            [ oObject ]
        );
    }

    GetRuleNode(PrototypeName, Callback) {
        return this.GetRuleNodeObject({ PrototypeName:PrototypeName }, Callback);
    }

    GetRuleNodeObject(oObject, Callback) {
        this._validate(oObject, EmailObservationsValidators.GetRuleNode, this.GetRuleNode.onValidationError);

        var pageUrl = this.Url + "/get-rule-node";
        return this._invoke(
            pageUrl,
            "GetRuleNode",
            { PrototypeName: oObject.PrototypeName },
            this.GetRuleNode,
            Callback
        );
    }

    async GetRuleNodeAsync(PrototypeName) {
        return await ObjectUtil.Promisify(
            this,
            this.GetRuleNode,
            [ PrototypeName ]
        );
    }

    async GetRuleNodeObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetRuleNodeObject,
            [ oObject ]
        );
    }

    GetRuleNodes(Search, SkipRows, NumRows, Callback) {
        return this.GetRuleNodesObject({ Search:Search,SkipRows:SkipRows,NumRows:NumRows }, Callback);
    }

    GetRuleNodesObject(oObject, Callback) {
        this._validate(oObject, EmailObservationsValidators.GetRuleNodes, this.GetRuleNodes.onValidationError);

        var pageUrl = this.Url + "/get-rule-nodes";
        return this._invoke(
            pageUrl,
            "GetRuleNodes",
            { Search: oObject.Search,SkipRows: oObject.SkipRows,NumRows: oObject.NumRows },
            this.GetRuleNodes,
            Callback
        );
    }

    async GetRuleNodesAsync(Search,SkipRows,NumRows) {
        return await ObjectUtil.Promisify(
            this,
            this.GetRuleNodes,
            [ Search,SkipRows,NumRows ]
        );
    }

    async GetRuleNodesObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetRuleNodesObject,
            [ oObject ]
        );
    }

    SaveRuleNode(PrototypeName, ExpectedRulesRevision, Rule, Outcome, Processor, WorkSession, Anchor, Callback) {
        return this.SaveRuleNodeObject({ PrototypeName:PrototypeName,ExpectedRulesRevision:ExpectedRulesRevision,Rule:Rule,Outcome:Outcome,Processor:Processor,WorkSession:WorkSession,Anchor:Anchor }, Callback);
    }

    SaveRuleNodeObject(oObject, Callback) {
        this._validate(oObject, EmailObservationsValidators.SaveRuleNode, this.SaveRuleNode.onValidationError);

        var pageUrl = this.Url + "/save-rule-node";
        return this._invoke(
            pageUrl,
            "SaveRuleNode",
            { PrototypeName: oObject.PrototypeName,ExpectedRulesRevision: oObject.ExpectedRulesRevision,Rule: oObject.Rule,Outcome: oObject.Outcome,Processor: oObject.Processor,WorkSession: oObject.WorkSession,Anchor: oObject.Anchor },
            this.SaveRuleNode,
            Callback
        );
    }

    async SaveRuleNodeAsync(PrototypeName,ExpectedRulesRevision,Rule,Outcome,Processor,WorkSession,Anchor) {
        return await ObjectUtil.Promisify(
            this,
            this.SaveRuleNode,
            [ PrototypeName,ExpectedRulesRevision,Rule,Outcome,Processor,WorkSession,Anchor ]
        );
    }

    async SaveRuleNodeObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.SaveRuleNodeObject,
            [ oObject ]
        );
    }

    TestRules(ObservationKey, Callback) {
        return this.TestRulesObject({ ObservationKey:ObservationKey }, Callback);
    }

    TestRulesObject(oObject, Callback) {
        this._validate(oObject, EmailObservationsValidators.TestRules, this.TestRules.onValidationError);

        var pageUrl = this.Url + "/test-rules";
        return this._invoke(
            pageUrl,
            "TestRules",
            { ObservationKey: oObject.ObservationKey },
            this.TestRules,
            Callback
        );
    }

    async TestRulesAsync(ObservationKey) {
        return await ObjectUtil.Promisify(
            this,
            this.TestRules,
            [ ObservationKey ]
        );
    }

    async TestRulesObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.TestRulesObject,
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

var EmailObservationsValidators = {
    

    ArchiveConversation : {
            AccountKey : {Validators: [Validators.Text], InvalidMessage: "Invalid AccountKey"} ,
            ThreadId : {Validators: [Validators.Text], InvalidMessage: "Invalid ThreadId"} 
    },

    ClearRule : {
            PrototypeName : {Validators: [Validators.Text], InvalidMessage: "Invalid PrototypeName"} ,
            ExpectedRulesRevision : {Validators: [Validators.Text], InvalidMessage: "Invalid ExpectedRulesRevision"} 
    },

    GetConversation : {
            AccountKey : {Validators: [Validators.Text], InvalidMessage: "Invalid AccountKey"} ,
            ThreadId : {Validators: [Validators.Text], InvalidMessage: "Invalid ThreadId"} ,
            SkipRows : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SkipRows"} ,
            NumRows : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid NumRows"} 
    },

    GetConversationBody : {
            AccountKey : {Validators: [Validators.Text], InvalidMessage: "Invalid AccountKey"} ,
            ThreadId : {Validators: [Validators.Text], InvalidMessage: "Invalid ThreadId"} ,
            MessageId : {Validators: [Validators.Text], InvalidMessage: "Invalid MessageId"} 
    },

    GetConversations : {
            AccountKey : {Validators: [Validators.Text], InvalidMessage: "Invalid AccountKey"} ,
            Search : {Validators: [Validators.Text], InvalidMessage: "Invalid Search"} ,
            PageToken : {Validators: [Validators.Text], InvalidMessage: "Invalid PageToken"} ,
            NumRows : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid NumRows"} ,
            State : {Validators: [Validators.Text], InvalidMessage: "Invalid State"} 
    },

    GetEmail : {
            ObservationKey : {Validators: [Validators.Text], InvalidMessage: "Invalid ObservationKey"} 
    },

    GetFormattedBody : {
            ObservationKey : {Validators: [Validators.Text], InvalidMessage: "Invalid ObservationKey"} 
    },

    GetInbox : {
            AccountKey : {Validators: [Validators.Text], InvalidMessage: "Invalid AccountKey"} ,
            State : {Validators: [Validators.Text], InvalidMessage: "Invalid State"} ,
            Search : {Validators: [Validators.Text], InvalidMessage: "Invalid Search"} ,
            SkipRows : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SkipRows"} ,
            NumRows : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid NumRows"} 
    },

    GetRecentSessions : {
            Search : {Validators: [Validators.Text], InvalidMessage: "Invalid Search"} ,
            SkipRows : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SkipRows"} ,
            NumRows : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid NumRows"} 
    },

    GetRuleNode : {
            PrototypeName : {Validators: [Validators.Text], InvalidMessage: "Invalid PrototypeName"} 
    },

    GetRuleNodes : {
            Search : {Validators: [Validators.Text], InvalidMessage: "Invalid Search"} ,
            SkipRows : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SkipRows"} ,
            NumRows : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid NumRows"} 
    },

    SaveRuleNode : {
            PrototypeName : {Validators: [Validators.Text], InvalidMessage: "Invalid PrototypeName"} ,
            ExpectedRulesRevision : {Validators: [Validators.Text], InvalidMessage: "Invalid ExpectedRulesRevision"} ,
            Rule : {Validators: [Validators.Text], InvalidMessage: "Invalid Rule"} ,
            Outcome : {Validators: [Validators.Text], InvalidMessage: "Invalid Outcome"} ,
            Processor : {Validators: [Validators.Text], InvalidMessage: "Invalid Processor"} ,
            WorkSession : {Validators: [Validators.Text], InvalidMessage: "Invalid WorkSession"} ,
            Anchor : {Validators: [Validators.Text], InvalidMessage: "Invalid Anchor"} 
    },

    TestRules : {
            ObservationKey : {Validators: [Validators.Text], InvalidMessage: "Invalid ObservationKey"} 
    }
};

if (typeof EmailObservations === "undefined")
{
	// Create a global instance for backward compatibility with original usage
	var EmailObservations = new EmailObservationsService();
}
    