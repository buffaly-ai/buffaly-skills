
    	    	
var MessagesValidatorsFields = {
	
		SessionID : {Validators : [Validators.Integer], InvalidMessage: "Invalid SessionID. " + ValidatorDescriptions.Integer() },
		MessageID : {Validators : [Validators.ID], InvalidMessage: "Invalid Message ID. " + ValidatorDescriptions.ID() },
		Data : {Validators : [Validators.Data], InvalidMessage: "Invalid Data. " + ValidatorDescriptions.Length(1) },
		SequenceNumber : {Validators : [Validators.Integer], InvalidMessage: "Invalid SequenceNumber. " + ValidatorDescriptions.Integer() },
		Role : {Validators : [Validators.String], InvalidMessage: "Invalid Role. " + ValidatorDescriptions.Length(1, 255) },
		CallID : {Validators : [Validators.String], InvalidMessage: "Invalid CallID. " + ValidatorDescriptions.Length(1, 255) },
		Content : {Validators : [Validators.String], InvalidMessage: "Invalid Content. " + ValidatorDescriptions.Length(1, 255) },
		ToolName : {Validators : [Validators.String], InvalidMessage: "Invalid ToolName. " + ValidatorDescriptions.Length(1, 255) },
		ToolArguments : {Validators : [Validators.String], InvalidMessage: "Invalid ToolArguments. " + ValidatorDescriptions.Length(1, 255) }	
}
		
class MessagesService {
    constructor({ baseUrl = "/api/buffaly.sessions/messages", authToken = null } = {}) {
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


    CopyMessage(MessageID, Callback) {
        return this.CopyMessageObject({ MessageID:MessageID }, Callback);
    }

    CopyMessageObject(oObject, Callback) {
        this._validate(oObject, MessagesValidators.CopyMessage, this.CopyMessage.onValidationError);

        var pageUrl = this.Url + "/copy-message";
        return this._invoke(
            pageUrl,
            "CopyMessage",
            { MessageID: oObject.MessageID },
            this.CopyMessage,
            Callback
        );
    }

    async CopyMessageAsync(MessageID) {
        return await ObjectUtil.Promisify(
            this,
            this.CopyMessage,
            [ MessageID ]
        );
    }

    async CopyMessageObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.CopyMessageObject,
            [ oObject ]
        );
    }

    ExportMessage(MessageID, Callback) {
        return this.ExportMessageObject({ MessageID:MessageID }, Callback);
    }

    ExportMessageObject(oObject, Callback) {
        this._validate(oObject, MessagesValidators.ExportMessage, this.ExportMessage.onValidationError);

        var pageUrl = this.Url + "/export-message";
        return this._invoke(
            pageUrl,
            "ExportMessage",
            { MessageID: oObject.MessageID },
            this.ExportMessage,
            Callback
        );
    }

    async ExportMessageAsync(MessageID) {
        return await ObjectUtil.Promisify(
            this,
            this.ExportMessage,
            [ MessageID ]
        );
    }

    async ExportMessageObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.ExportMessageObject,
            [ oObject ]
        );
    }

    GetMessage(MessageID, Callback) {
        return this.GetMessageObject({ MessageID:MessageID }, Callback);
    }

    GetMessageObject(oObject, Callback) {
        this._validate(oObject, MessagesValidators.GetMessage, this.GetMessage.onValidationError);

        var pageUrl = this.Url + "/get-message";
        return this._invoke(
            pageUrl,
            "GetMessage",
            { MessageID: oObject.MessageID },
            this.GetMessage,
            Callback
        );
    }

    async GetMessageAsync(MessageID) {
        return await ObjectUtil.Promisify(
            this,
            this.GetMessage,
            [ MessageID ]
        );
    }

    async GetMessageObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetMessageObject,
            [ oObject ]
        );
    }

    GetMessages(Callback) {
        return this.GetMessagesObject({  }, Callback);
    }

    GetMessagesObject(oObject, Callback) {
        this._validate(oObject, MessagesValidators.GetMessages, this.GetMessages.onValidationError);

        var pageUrl = this.Url + "/get-messages";
        return this._invoke(
            pageUrl,
            "GetMessages",
            {  },
            this.GetMessages,
            Callback
        );
    }

    async GetMessagesAsync() {
        return await ObjectUtil.Promisify(
            this,
            this.GetMessages,
            [  ]
        );
    }

    async GetMessagesObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetMessagesObject,
            [ oObject ]
        );
    }

    InsertMessage(SessionID, SequenceNumber, Role, Content, ToolName, ToolArguments, CallID, Data, Callback) {
        return this.InsertMessageObject({ SessionID:SessionID,SequenceNumber:SequenceNumber,Role:Role,Content:Content,ToolName:ToolName,ToolArguments:ToolArguments,CallID:CallID,Data:Data }, Callback);
    }

    InsertMessageObject(oObject, Callback) {
        this._validate(oObject, MessagesValidators.InsertMessage, this.InsertMessage.onValidationError);

        var pageUrl = this.Url + "/insert-message";
        return this._invoke(
            pageUrl,
            "InsertMessage",
            { SessionID: oObject.SessionID,SequenceNumber: oObject.SequenceNumber,Role: oObject.Role,Content: oObject.Content,ToolName: oObject.ToolName,ToolArguments: oObject.ToolArguments,CallID: oObject.CallID,Data: oObject.Data },
            this.InsertMessage,
            Callback
        );
    }

    async InsertMessageAsync(SessionID,SequenceNumber,Role,Content,ToolName,ToolArguments,CallID,Data) {
        return await ObjectUtil.Promisify(
            this,
            this.InsertMessage,
            [ SessionID,SequenceNumber,Role,Content,ToolName,ToolArguments,CallID,Data ]
        );
    }

    async InsertMessageObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.InsertMessageObject,
            [ oObject ]
        );
    }

    RemoveMessage(MessageID, Callback) {
        return this.RemoveMessageObject({ MessageID:MessageID }, Callback);
    }

    RemoveMessageObject(oObject, Callback) {
        this._validate(oObject, MessagesValidators.RemoveMessage, this.RemoveMessage.onValidationError);

        var pageUrl = this.Url + "/remove-message";
        return this._invoke(
            pageUrl,
            "RemoveMessage",
            { MessageID: oObject.MessageID },
            this.RemoveMessage,
            Callback
        );
    }

    async RemoveMessageAsync(MessageID) {
        return await ObjectUtil.Promisify(
            this,
            this.RemoveMessage,
            [ MessageID ]
        );
    }

    async RemoveMessageObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.RemoveMessageObject,
            [ oObject ]
        );
    }

    UpdateMessage(MessageID, SessionID, SequenceNumber, Role, Content, ToolName, ToolArguments, CallID, Data, Callback) {
        return this.UpdateMessageObject({ MessageID:MessageID,SessionID:SessionID,SequenceNumber:SequenceNumber,Role:Role,Content:Content,ToolName:ToolName,ToolArguments:ToolArguments,CallID:CallID,Data:Data }, Callback);
    }

    UpdateMessageObject(oObject, Callback) {
        this._validate(oObject, MessagesValidators.UpdateMessage, this.UpdateMessage.onValidationError);

        var pageUrl = this.Url + "/update-message";
        return this._invoke(
            pageUrl,
            "UpdateMessage",
            { MessageID: oObject.MessageID,SessionID: oObject.SessionID,SequenceNumber: oObject.SequenceNumber,Role: oObject.Role,Content: oObject.Content,ToolName: oObject.ToolName,ToolArguments: oObject.ToolArguments,CallID: oObject.CallID,Data: oObject.Data },
            this.UpdateMessage,
            Callback
        );
    }

    async UpdateMessageAsync(MessageID,SessionID,SequenceNumber,Role,Content,ToolName,ToolArguments,CallID,Data) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateMessage,
            [ MessageID,SessionID,SequenceNumber,Role,Content,ToolName,ToolArguments,CallID,Data ]
        );
    }

    async UpdateMessageObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateMessageObject,
            [ oObject ]
        );
    }

    UpdateMessageData(MessageID, Data, Callback) {
        return this.UpdateMessageDataObject({ MessageID:MessageID,Data:Data }, Callback);
    }

    UpdateMessageDataObject(oObject, Callback) {
        this._validate(oObject, MessagesValidators.UpdateMessageData, this.UpdateMessageData.onValidationError);

        var pageUrl = this.Url + "/update-message-data";
        return this._invoke(
            pageUrl,
            "UpdateMessageData",
            { MessageID: oObject.MessageID,Data: oObject.Data },
            this.UpdateMessageData,
            Callback
        );
    }

    async UpdateMessageDataAsync(MessageID,Data) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateMessageData,
            [ MessageID,Data ]
        );
    }

    async UpdateMessageDataObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateMessageDataObject,
            [ oObject ]
        );
    }

    UpdateMessageToolArguments(MessageID, ToolArguments, Callback) {
        return this.UpdateMessageToolArgumentsObject({ MessageID:MessageID,ToolArguments:ToolArguments }, Callback);
    }

    UpdateMessageToolArgumentsObject(oObject, Callback) {
        this._validate(oObject, MessagesValidators.UpdateMessageToolArguments, this.UpdateMessageToolArguments.onValidationError);

        var pageUrl = this.Url + "/update-message-tool-arguments";
        return this._invoke(
            pageUrl,
            "UpdateMessageToolArguments",
            { MessageID: oObject.MessageID,ToolArguments: oObject.ToolArguments },
            this.UpdateMessageToolArguments,
            Callback
        );
    }

    async UpdateMessageToolArgumentsAsync(MessageID,ToolArguments) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateMessageToolArguments,
            [ MessageID,ToolArguments ]
        );
    }

    async UpdateMessageToolArgumentsObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateMessageToolArgumentsObject,
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

var MessagesValidators = {
    

    CopyMessage : {
            MessageID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid MessageID"} 
    },

    ExportMessage : {
            MessageID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid MessageID"} 
    },

    GetMessage : {
            MessageID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid MessageID"} 
    },

    GetMessages : {
    },

    InsertMessage : {
            SessionID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionID"} ,
            SequenceNumber : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SequenceNumber"} ,
            Role : {Validators: [Validators.Text], InvalidMessage: "Invalid Role"} ,
            Content : {Validators: [Validators.Text], InvalidMessage: "Invalid Content"} ,
            ToolName : {Validators: [Validators.Text], InvalidMessage: "Invalid ToolName"} ,
            ToolArguments : {Validators: [Validators.Text], InvalidMessage: "Invalid ToolArguments"} ,
            CallID : {Validators: [Validators.Text], InvalidMessage: "Invalid CallID"} ,
            Data : {Validators: [Validators.Text], InvalidMessage: "Invalid Data"} 
    },

    RemoveMessage : {
            MessageID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid MessageID"} 
    },

    UpdateMessage : {
            MessageID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid MessageID"} ,
            SessionID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionID"} ,
            SequenceNumber : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SequenceNumber"} ,
            Role : {Validators: [Validators.Text], InvalidMessage: "Invalid Role"} ,
            Content : {Validators: [Validators.Text], InvalidMessage: "Invalid Content"} ,
            ToolName : {Validators: [Validators.Text], InvalidMessage: "Invalid ToolName"} ,
            ToolArguments : {Validators: [Validators.Text], InvalidMessage: "Invalid ToolArguments"} ,
            CallID : {Validators: [Validators.Text], InvalidMessage: "Invalid CallID"} ,
            Data : {Validators: [Validators.Text], InvalidMessage: "Invalid Data"} 
    },

    UpdateMessageData : {
            MessageID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid MessageID"} ,
            Data : {Validators: [Validators.Text], InvalidMessage: "Invalid Data"} 
    },

    UpdateMessageToolArguments : {
            MessageID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid MessageID"} ,
            ToolArguments : {Validators: [Validators.Text], InvalidMessage: "Invalid ToolArguments"} 
    }
};

if (typeof Messages === "undefined")
{
	// Create a global instance for backward compatibility with original usage
	var Messages = new MessagesService();
}
    