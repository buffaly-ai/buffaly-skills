
    	    	
var EmailObservationsValidatorsFields = {
	
		ParentId : {Validators : [Validators.String], InvalidMessage: "Invalid ParentId. " + ValidatorDescriptions.Length(1, 255) },
		ParentNodeId : {Validators : [Validators.String], InvalidMessage: "Invalid ParentNodeId. " + ValidatorDescriptions.Length(1, 255) },
		SessionKey : {Validators : [Validators.String], InvalidMessage: "Invalid SessionKey. " + ValidatorDescriptions.Length(1, 255) },
		Name : {Validators : [Validators.String], InvalidMessage: "Invalid Name. " + ValidatorDescriptions.Length(1, 255) },
		EntityName : {Validators : [Validators.String], InvalidMessage: "Invalid EntityName. " + ValidatorDescriptions.Length(1, 255) },
		State : {Validators : [Validators.String], InvalidMessage: "Invalid State. " + ValidatorDescriptions.Length(1, 255) },
		NodeId : {Validators : [Validators.String], InvalidMessage: "Invalid NodeId. " + ValidatorDescriptions.Length(1, 255) },
		ChildId : {Validators : [Validators.String], InvalidMessage: "Invalid ChildId. " + ValidatorDescriptions.Length(1, 255) },
		ExpectedRevision : {Validators : [Validators.String], InvalidMessage: "Invalid ExpectedRevision. " + ValidatorDescriptions.Length(1, 255) },
		ObservationKey : {Validators : [Validators.String], InvalidMessage: "Invalid . " + ValidatorDescriptions.Length(1, 255) },
		Source : {Validators : [Validators.String], InvalidMessage: "Invalid Source. " + ValidatorDescriptions.Length(1, 255) },
		SkipRows : {Validators : [Validators.Integer], InvalidMessage: "Invalid SkipRows. " + ValidatorDescriptions.Integer() },
		Search : {Validators : [Validators.String], InvalidMessage: "Invalid Search. " + ValidatorDescriptions.Length(1, 255) },
		AccountKey : {Validators : [Validators.String], InvalidMessage: "Invalid . " + ValidatorDescriptions.Length(1, 255) },
		NumRows : {Validators : [Validators.Integer], InvalidMessage: "Invalid NumRows. " + ValidatorDescriptions.Integer() },
		Context : {Validators : [Validators.String], InvalidMessage: "Invalid Context. " + ValidatorDescriptions.Length(1, 255) }	
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


    AddPolicyChild(ParentId, ExpectedRevision, ChildId, EntityName, Callback) {
        return this.AddPolicyChildObject({ ParentId:ParentId,ExpectedRevision:ExpectedRevision,ChildId:ChildId,EntityName:EntityName }, Callback);
    }

    AddPolicyChildObject(oObject, Callback) {
        this._validate(oObject, EmailObservationsValidators.AddPolicyChild, this.AddPolicyChild.onValidationError);

        var pageUrl = this.Url + "/add-policy-child";
        return this._invoke(
            pageUrl,
            "AddPolicyChild",
            { ParentId: oObject.ParentId,ExpectedRevision: oObject.ExpectedRevision,ChildId: oObject.ChildId,EntityName: oObject.EntityName },
            this.AddPolicyChild,
            Callback
        );
    }

    async AddPolicyChildAsync(ParentId,ExpectedRevision,ChildId,EntityName) {
        return await ObjectUtil.Promisify(
            this,
            this.AddPolicyChild,
            [ ParentId,ExpectedRevision,ChildId,EntityName ]
        );
    }

    async AddPolicyChildObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.AddPolicyChildObject,
            [ oObject ]
        );
    }

    FindDestinations(Search, SkipRows, NumRows, Callback) {
        return this.FindDestinationsObject({ Search:Search,SkipRows:SkipRows,NumRows:NumRows }, Callback);
    }

    FindDestinationsObject(oObject, Callback) {
        this._validate(oObject, EmailObservationsValidators.FindDestinations, this.FindDestinations.onValidationError);

        var pageUrl = this.Url + "/find-destinations";
        return this._invoke(
            pageUrl,
            "FindDestinations",
            { Search: oObject.Search,SkipRows: oObject.SkipRows,NumRows: oObject.NumRows },
            this.FindDestinations,
            Callback
        );
    }

    async FindDestinationsAsync(Search,SkipRows,NumRows) {
        return await ObjectUtil.Promisify(
            this,
            this.FindDestinations,
            [ Search,SkipRows,NumRows ]
        );
    }

    async FindDestinationsObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.FindDestinationsObject,
            [ oObject ]
        );
    }

    FindPolicyNodes(Search, SkipRows, NumRows, Callback) {
        return this.FindPolicyNodesObject({ Search:Search,SkipRows:SkipRows,NumRows:NumRows }, Callback);
    }

    FindPolicyNodesObject(oObject, Callback) {
        this._validate(oObject, EmailObservationsValidators.FindPolicyNodes, this.FindPolicyNodes.onValidationError);

        var pageUrl = this.Url + "/find-policy-nodes";
        return this._invoke(
            pageUrl,
            "FindPolicyNodes",
            { Search: oObject.Search,SkipRows: oObject.SkipRows,NumRows: oObject.NumRows },
            this.FindPolicyNodes,
            Callback
        );
    }

    async FindPolicyNodesAsync(Search,SkipRows,NumRows) {
        return await ObjectUtil.Promisify(
            this,
            this.FindPolicyNodes,
            [ Search,SkipRows,NumRows ]
        );
    }

    async FindPolicyNodesObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.FindPolicyNodesObject,
            [ oObject ]
        );
    }

    FindTreeNodes(Search, ParentNodeId, SkipRows, NumRows, Callback) {
        return this.FindTreeNodesObject({ Search:Search,ParentNodeId:ParentNodeId,SkipRows:SkipRows,NumRows:NumRows }, Callback);
    }

    FindTreeNodesObject(oObject, Callback) {
        this._validate(oObject, EmailObservationsValidators.FindTreeNodes, this.FindTreeNodes.onValidationError);

        var pageUrl = this.Url + "/find-tree-nodes";
        return this._invoke(
            pageUrl,
            "FindTreeNodes",
            { Search: oObject.Search,ParentNodeId: oObject.ParentNodeId,SkipRows: oObject.SkipRows,NumRows: oObject.NumRows },
            this.FindTreeNodes,
            Callback
        );
    }

    async FindTreeNodesAsync(Search,ParentNodeId,SkipRows,NumRows) {
        return await ObjectUtil.Promisify(
            this,
            this.FindTreeNodes,
            [ Search,ParentNodeId,SkipRows,NumRows ]
        );
    }

    async FindTreeNodesObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.FindTreeNodesObject,
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

    GetPolicyNode(NodeId, Callback) {
        return this.GetPolicyNodeObject({ NodeId:NodeId }, Callback);
    }

    GetPolicyNodeObject(oObject, Callback) {
        this._validate(oObject, EmailObservationsValidators.GetPolicyNode, this.GetPolicyNode.onValidationError);

        var pageUrl = this.Url + "/get-policy-node";
        return this._invoke(
            pageUrl,
            "GetPolicyNode",
            { NodeId: oObject.NodeId },
            this.GetPolicyNode,
            Callback
        );
    }

    async GetPolicyNodeAsync(NodeId) {
        return await ObjectUtil.Promisify(
            this,
            this.GetPolicyNode,
            [ NodeId ]
        );
    }

    async GetPolicyNodeObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetPolicyNodeObject,
            [ oObject ]
        );
    }

    GetPolicyRoot(Callback) {
        return this.GetPolicyRootObject({  }, Callback);
    }

    GetPolicyRootObject(oObject, Callback) {
        this._validate(oObject, EmailObservationsValidators.GetPolicyRoot, this.GetPolicyRoot.onValidationError);

        var pageUrl = this.Url + "/get-policy-root";
        return this._invoke(
            pageUrl,
            "GetPolicyRoot",
            {  },
            this.GetPolicyRoot,
            Callback
        );
    }

    async GetPolicyRootAsync() {
        return await ObjectUtil.Promisify(
            this,
            this.GetPolicyRoot,
            [  ]
        );
    }

    async GetPolicyRootObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetPolicyRootObject,
            [ oObject ]
        );
    }

    GetProgram(Callback) {
        return this.GetProgramObject({  }, Callback);
    }

    GetProgramObject(oObject, Callback) {
        this._validate(oObject, EmailObservationsValidators.GetProgram, this.GetProgram.onValidationError);

        var pageUrl = this.Url + "/get-program";
        return this._invoke(
            pageUrl,
            "GetProgram",
            {  },
            this.GetProgram,
            Callback
        );
    }

    async GetProgramAsync() {
        return await ObjectUtil.Promisify(
            this,
            this.GetProgram,
            [  ]
        );
    }

    async GetProgramObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetProgramObject,
            [ oObject ]
        );
    }

    GetTreeNode(NodeId, Callback) {
        return this.GetTreeNodeObject({ NodeId:NodeId }, Callback);
    }

    GetTreeNodeObject(oObject, Callback) {
        this._validate(oObject, EmailObservationsValidators.GetTreeNode, this.GetTreeNode.onValidationError);

        var pageUrl = this.Url + "/get-tree-node";
        return this._invoke(
            pageUrl,
            "GetTreeNode",
            { NodeId: oObject.NodeId },
            this.GetTreeNode,
            Callback
        );
    }

    async GetTreeNodeAsync(NodeId) {
        return await ObjectUtil.Promisify(
            this,
            this.GetTreeNode,
            [ NodeId ]
        );
    }

    async GetTreeNodeObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetTreeNodeObject,
            [ oObject ]
        );
    }

    SavePolicyNode(NodeId, ExpectedRevision, Source, Callback) {
        return this.SavePolicyNodeObject({ NodeId:NodeId,ExpectedRevision:ExpectedRevision,Source:Source }, Callback);
    }

    SavePolicyNodeObject(oObject, Callback) {
        this._validate(oObject, EmailObservationsValidators.SavePolicyNode, this.SavePolicyNode.onValidationError);

        var pageUrl = this.Url + "/save-policy-node";
        return this._invoke(
            pageUrl,
            "SavePolicyNode",
            { NodeId: oObject.NodeId,ExpectedRevision: oObject.ExpectedRevision,Source: oObject.Source },
            this.SavePolicyNode,
            Callback
        );
    }

    async SavePolicyNodeAsync(NodeId,ExpectedRevision,Source) {
        return await ObjectUtil.Promisify(
            this,
            this.SavePolicyNode,
            [ NodeId,ExpectedRevision,Source ]
        );
    }

    async SavePolicyNodeObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.SavePolicyNodeObject,
            [ oObject ]
        );
    }

    SaveTreeContext(NodeId, ExpectedRevision, Name, Context, Callback) {
        return this.SaveTreeContextObject({ NodeId:NodeId,ExpectedRevision:ExpectedRevision,Name:Name,Context:Context }, Callback);
    }

    SaveTreeContextObject(oObject, Callback) {
        this._validate(oObject, EmailObservationsValidators.SaveTreeContext, this.SaveTreeContext.onValidationError);

        var pageUrl = this.Url + "/save-tree-context";
        return this._invoke(
            pageUrl,
            "SaveTreeContext",
            { NodeId: oObject.NodeId,ExpectedRevision: oObject.ExpectedRevision,Name: oObject.Name,Context: oObject.Context },
            this.SaveTreeContext,
            Callback
        );
    }

    async SaveTreeContextAsync(NodeId,ExpectedRevision,Name,Context) {
        return await ObjectUtil.Promisify(
            this,
            this.SaveTreeContext,
            [ NodeId,ExpectedRevision,Name,Context ]
        );
    }

    async SaveTreeContextObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.SaveTreeContextObject,
            [ oObject ]
        );
    }

    SetWorkSession(NodeId, ExpectedRevision, SessionKey, Callback) {
        return this.SetWorkSessionObject({ NodeId:NodeId,ExpectedRevision:ExpectedRevision,SessionKey:SessionKey }, Callback);
    }

    SetWorkSessionObject(oObject, Callback) {
        this._validate(oObject, EmailObservationsValidators.SetWorkSession, this.SetWorkSession.onValidationError);

        var pageUrl = this.Url + "/set-work-session";
        return this._invoke(
            pageUrl,
            "SetWorkSession",
            { NodeId: oObject.NodeId,ExpectedRevision: oObject.ExpectedRevision,SessionKey: oObject.SessionKey },
            this.SetWorkSession,
            Callback
        );
    }

    async SetWorkSessionAsync(NodeId,ExpectedRevision,SessionKey) {
        return await ObjectUtil.Promisify(
            this,
            this.SetWorkSession,
            [ NodeId,ExpectedRevision,SessionKey ]
        );
    }

    async SetWorkSessionObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.SetWorkSessionObject,
            [ oObject ]
        );
    }

    TestPolicy(ObservationKey, Callback) {
        return this.TestPolicyObject({ ObservationKey:ObservationKey }, Callback);
    }

    TestPolicyObject(oObject, Callback) {
        this._validate(oObject, EmailObservationsValidators.TestPolicy, this.TestPolicy.onValidationError);

        var pageUrl = this.Url + "/test-policy";
        return this._invoke(
            pageUrl,
            "TestPolicy",
            { ObservationKey: oObject.ObservationKey },
            this.TestPolicy,
            Callback
        );
    }

    async TestPolicyAsync(ObservationKey) {
        return await ObjectUtil.Promisify(
            this,
            this.TestPolicy,
            [ ObservationKey ]
        );
    }

    async TestPolicyObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.TestPolicyObject,
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
    

    AddPolicyChild : {
            ParentId : {Validators: [Validators.Text], InvalidMessage: "Invalid ParentId"} ,
            ExpectedRevision : {Validators: [Validators.Text], InvalidMessage: "Invalid ExpectedRevision"} ,
            ChildId : {Validators: [Validators.Text], InvalidMessage: "Invalid ChildId"} ,
            EntityName : {Validators: [Validators.Text], InvalidMessage: "Invalid EntityName"} 
    },

    FindDestinations : {
            Search : {Validators: [Validators.Text], InvalidMessage: "Invalid Search"} ,
            SkipRows : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SkipRows"} ,
            NumRows : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid NumRows"} 
    },

    FindPolicyNodes : {
            Search : {Validators: [Validators.Text], InvalidMessage: "Invalid Search"} ,
            SkipRows : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SkipRows"} ,
            NumRows : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid NumRows"} 
    },

    FindTreeNodes : {
            Search : {Validators: [Validators.Text], InvalidMessage: "Invalid Search"} ,
            ParentNodeId : {Validators: [Validators.Text], InvalidMessage: "Invalid ParentNodeId"} ,
            SkipRows : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SkipRows"} ,
            NumRows : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid NumRows"} 
    },

    GetEmail : {
            ObservationKey : {Validators: [Validators.Text], InvalidMessage: "Invalid ObservationKey"} 
    },

    GetInbox : {
            AccountKey : {Validators: [Validators.Text], InvalidMessage: "Invalid AccountKey"} ,
            State : {Validators: [Validators.Text], InvalidMessage: "Invalid State"} ,
            Search : {Validators: [Validators.Text], InvalidMessage: "Invalid Search"} ,
            SkipRows : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SkipRows"} ,
            NumRows : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid NumRows"} 
    },

    GetPolicyNode : {
            NodeId : {Validators: [Validators.Text], InvalidMessage: "Invalid NodeId"} 
    },

    GetPolicyRoot : {
    },

    GetProgram : {
    },

    GetTreeNode : {
            NodeId : {Validators: [Validators.Text], InvalidMessage: "Invalid NodeId"} 
    },

    SavePolicyNode : {
            NodeId : {Validators: [Validators.Text], InvalidMessage: "Invalid NodeId"} ,
            ExpectedRevision : {Validators: [Validators.Text], InvalidMessage: "Invalid ExpectedRevision"} ,
            Source : {Validators: [Validators.Text], InvalidMessage: "Invalid Source"} 
    },

    SaveTreeContext : {
            NodeId : {Validators: [Validators.Text], InvalidMessage: "Invalid NodeId"} ,
            ExpectedRevision : {Validators: [Validators.Text], InvalidMessage: "Invalid ExpectedRevision"} ,
            Name : {Validators: [Validators.Text], InvalidMessage: "Invalid Name"} ,
            Context : {Validators: [Validators.Text], InvalidMessage: "Invalid Context"} 
    },

    SetWorkSession : {
            NodeId : {Validators: [Validators.Text], InvalidMessage: "Invalid NodeId"} ,
            ExpectedRevision : {Validators: [Validators.Text], InvalidMessage: "Invalid ExpectedRevision"} ,
            SessionKey : {Validators: [Validators.Text], InvalidMessage: "Invalid SessionKey"} 
    },

    TestPolicy : {
            ObservationKey : {Validators: [Validators.Text], InvalidMessage: "Invalid ObservationKey"} 
    }
};

if (typeof EmailObservations === "undefined")
{
	// Create a global instance for backward compatibility with original usage
	var EmailObservations = new EmailObservationsService();
}
    