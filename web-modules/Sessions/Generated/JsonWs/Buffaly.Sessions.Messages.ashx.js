
    	    	
var MessagesValidatorsFields = {
	
		MessageKind : {Validators : [Validators.String], InvalidMessage: "Invalid Message kind. " + ValidatorDescriptions.Length(1, 255) },
		CallID : {Validators : [Validators.String], InvalidMessage: "Invalid Call ID. " + ValidatorDescriptions.Length(1, 255) },
		sessionKey : {Validators : [Validators.String], InvalidMessage: "Invalid sessionKey. " + ValidatorDescriptions.Length(1, 255) },
		MessageKey : {Validators : [Validators.String], InvalidMessage: "Invalid Message Key. " + ValidatorDescriptions.Length(1, 255) },
		ToolArguments : {Validators : [Validators.Data], InvalidMessage: "Invalid Tool Arguments. " + ValidatorDescriptions.Length(1) },
		Data : {Validators : [Validators.Data], InvalidMessage: "Invalid Data. " + ValidatorDescriptions.Length(1) },
		SortAscending : {Validators : [Validators.Boolean], InvalidMessage: "Invalid SortAscending. " + ValidatorDescriptions.Boolean() },
		TerminalOutcomeState : {Validators : [Validators.String], InvalidMessage: "Invalid Terminal outcome state. " + ValidatorDescriptions.Length(1, 255) },
		messageKey : {Validators : [Validators.String], InvalidMessage: "Invalid messageKey. " + ValidatorDescriptions.Length(1, 255) },
		SessionID : {Validators : [Validators.ID], InvalidMessage: "Invalid Session ID. " + ValidatorDescriptions.ID() },
		sessionId : {Validators : [Validators.Integer], InvalidMessage: "Invalid sessionId. " + ValidatorDescriptions.Integer() },
		TurnID : {Validators : [Validators.String], InvalidMessage: "Invalid Turn ID. " + ValidatorDescriptions.Length(1, 255) },
		ToolName : {Validators : [Validators.String], InvalidMessage: "Invalid Tool Name. " + ValidatorDescriptions.Length(1, 255) },
		IsCompacted : {Validators : [Validators.Boolean], InvalidMessage: "Invalid Is Compacted. " + ValidatorDescriptions.Boolean() },
		compactionEpochKey : {Validators : [Validators.String], InvalidMessage: "Invalid compactionEpochKey. " + ValidatorDescriptions.Length(1, 255) },
		CompactionEpochKey : {Validators : [Validators.String], InvalidMessage: "Invalid Compaction Epoch Key. " + ValidatorDescriptions.Length(1, 255) },
		Role : {Validators : [Validators.String], InvalidMessage: "Invalid Role. " + ValidatorDescriptions.Length(1, 255) },
		MessageID : {Validators : [Validators.ID], InvalidMessage: "Invalid Message ID. " + ValidatorDescriptions.ID() },
		SkipRows : {Validators : [Validators.Integer], InvalidMessage: "Invalid SkipRows. " + ValidatorDescriptions.Integer() },
		Content : {Validators : [Validators.Text], InvalidMessage: "Invalid Content. " + ValidatorDescriptions.Length(1, 4000) },
		SortColumn : {Validators : [Validators.String], InvalidMessage: "Invalid SortColumn. " + ValidatorDescriptions.Length(1, 255) },
		Search : {Validators : [Validators.String], InvalidMessage: "Invalid Search. " + ValidatorDescriptions.Length(1, 255) },
		SequenceNumber : {Validators : [Validators.Integer], InvalidMessage: "Invalid Sequence Number. " + ValidatorDescriptions.Integer() },
		CompactionEpoch : {Validators : [Validators.Integer], InvalidMessage: "Invalid Compaction Epoch. " + ValidatorDescriptions.Integer() },
		NumRows : {Validators : [Validators.Integer], InvalidMessage: "Invalid NumRows. " + ValidatorDescriptions.Integer() },
		SavedWorkResume : {Validators : [Validators.Boolean], InvalidMessage: "Invalid Saved work resume. " + ValidatorDescriptions.Boolean() },
		max : {Validators : [Validators.Integer], InvalidMessage: "Invalid max. " + ValidatorDescriptions.Integer() }	
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

    GetMessageByMessageKey(MessageKey, Callback) {
        return this.GetMessageByMessageKeyObject({ MessageKey:MessageKey }, Callback);
    }

    GetMessageByMessageKeyObject(oObject, Callback) {
        this._validate(oObject, MessagesValidators.GetMessageByMessageKey, this.GetMessageByMessageKey.onValidationError);

        var pageUrl = this.Url + "/get-message-by-message-key";
        return this._invoke(
            pageUrl,
            "GetMessageByMessageKey",
            { MessageKey: oObject.MessageKey },
            this.GetMessageByMessageKey,
            Callback
        );
    }

    async GetMessageByMessageKeyAsync(MessageKey) {
        return await ObjectUtil.Promisify(
            this,
            this.GetMessageByMessageKey,
            [ MessageKey ]
        );
    }

    async GetMessageByMessageKeyObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetMessageByMessageKeyObject,
            [ oObject ]
        );
    }

    GetMessagesBefore(sessionKey, messageKey, max, Callback) {
        return this.GetMessagesBeforeObject({ sessionKey:sessionKey,messageKey:messageKey,max:max }, Callback);
    }

    GetMessagesBeforeObject(oObject, Callback) {
        this._validate(oObject, MessagesValidators.GetMessagesBefore, this.GetMessagesBefore.onValidationError);

        var pageUrl = this.Url + "/get-messages-before";
        return this._invoke(
            pageUrl,
            "GetMessagesBefore",
            { sessionKey: oObject.sessionKey,messageKey: oObject.messageKey,max: oObject.max },
            this.GetMessagesBefore,
            Callback
        );
    }

    async GetMessagesBeforeAsync(sessionKey,messageKey,max) {
        return await ObjectUtil.Promisify(
            this,
            this.GetMessagesBefore,
            [ sessionKey,messageKey,max ]
        );
    }

    async GetMessagesBeforeObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetMessagesBeforeObject,
            [ oObject ]
        );
    }

    GetMessagesByCompactionEpochKey(CompactionEpochKey, Callback) {
        return this.GetMessagesByCompactionEpochKeyObject({ CompactionEpochKey:CompactionEpochKey }, Callback);
    }

    GetMessagesByCompactionEpochKeyObject(oObject, Callback) {
        this._validate(oObject, MessagesValidators.GetMessagesByCompactionEpochKey, this.GetMessagesByCompactionEpochKey.onValidationError);

        var pageUrl = this.Url + "/get-messages-by-compaction-epoch-key";
        return this._invoke(
            pageUrl,
            "GetMessagesByCompactionEpochKey",
            { CompactionEpochKey: oObject.CompactionEpochKey },
            this.GetMessagesByCompactionEpochKey,
            Callback
        );
    }

    async GetMessagesByCompactionEpochKeyAsync(CompactionEpochKey) {
        return await ObjectUtil.Promisify(
            this,
            this.GetMessagesByCompactionEpochKey,
            [ CompactionEpochKey ]
        );
    }

    async GetMessagesByCompactionEpochKeyObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetMessagesByCompactionEpochKeyObject,
            [ oObject ]
        );
    }

    GetMessagesByCompactionEpochKeySessionID(compactionEpochKey, sessionId, Callback) {
        return this.GetMessagesByCompactionEpochKeySessionIDObject({ compactionEpochKey:compactionEpochKey,sessionId:sessionId }, Callback);
    }

    GetMessagesByCompactionEpochKeySessionIDObject(oObject, Callback) {
        this._validate(oObject, MessagesValidators.GetMessagesByCompactionEpochKeySessionID, this.GetMessagesByCompactionEpochKeySessionID.onValidationError);

        var pageUrl = this.Url + "/get-messages-by-compaction-epoch-key-session-id";
        return this._invoke(
            pageUrl,
            "GetMessagesByCompactionEpochKeySessionID",
            { compactionEpochKey: oObject.compactionEpochKey,sessionId: oObject.sessionId },
            this.GetMessagesByCompactionEpochKeySessionID,
            Callback
        );
    }

    async GetMessagesByCompactionEpochKeySessionIDAsync(compactionEpochKey,sessionId) {
        return await ObjectUtil.Promisify(
            this,
            this.GetMessagesByCompactionEpochKeySessionID,
            [ compactionEpochKey,sessionId ]
        );
    }

    async GetMessagesByCompactionEpochKeySessionIDObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetMessagesByCompactionEpochKeySessionIDObject,
            [ oObject ]
        );
    }

    GetMessagesByMessageKey(MessageKey, Callback) {
        return this.GetMessagesByMessageKeyObject({ MessageKey:MessageKey }, Callback);
    }

    GetMessagesByMessageKeyObject(oObject, Callback) {
        this._validate(oObject, MessagesValidators.GetMessagesByMessageKey, this.GetMessagesByMessageKey.onValidationError);

        var pageUrl = this.Url + "/get-messages-by-message-key";
        return this._invoke(
            pageUrl,
            "GetMessagesByMessageKey",
            { MessageKey: oObject.MessageKey },
            this.GetMessagesByMessageKey,
            Callback
        );
    }

    async GetMessagesByMessageKeyAsync(MessageKey) {
        return await ObjectUtil.Promisify(
            this,
            this.GetMessagesByMessageKey,
            [ MessageKey ]
        );
    }

    async GetMessagesByMessageKeyObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetMessagesByMessageKeyObject,
            [ oObject ]
        );
    }

    GetMessagesBySessionID(SessionID, Callback) {
        return this.GetMessagesBySessionIDObject({ SessionID:SessionID }, Callback);
    }

    GetMessagesBySessionIDObject(oObject, Callback) {
        this._validate(oObject, MessagesValidators.GetMessagesBySessionID, this.GetMessagesBySessionID.onValidationError);

        var pageUrl = this.Url + "/get-messages-by-session-id";
        return this._invoke(
            pageUrl,
            "GetMessagesBySessionID",
            { SessionID: oObject.SessionID },
            this.GetMessagesBySessionID,
            Callback
        );
    }

    async GetMessagesBySessionIDAsync(SessionID) {
        return await ObjectUtil.Promisify(
            this,
            this.GetMessagesBySessionID,
            [ SessionID ]
        );
    }

    async GetMessagesBySessionIDObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetMessagesBySessionIDObject,
            [ oObject ]
        );
    }

    GetMessagesBySessionIDSp_PagingSp(SessionID, Search, SortColumn, SortAscending, SkipRows, NumRows, Callback) {
        return this.GetMessagesBySessionIDSp_PagingSpObject({ SessionID:SessionID,Search:Search,SortColumn:SortColumn,SortAscending:SortAscending,SkipRows:SkipRows,NumRows:NumRows }, Callback);
    }

    GetMessagesBySessionIDSp_PagingSpObject(oObject, Callback) {
        this._validate(oObject, MessagesValidators.GetMessagesBySessionIDSp_PagingSp, this.GetMessagesBySessionIDSp_PagingSp.onValidationError);

        var pageUrl = this.Url + "/get-messages-by-session-id-sp-_-paging-sp";
        return this._invoke(
            pageUrl,
            "GetMessagesBySessionIDSp_PagingSp",
            { SessionID: oObject.SessionID,Search: oObject.Search,SortColumn: oObject.SortColumn,SortAscending: oObject.SortAscending,SkipRows: oObject.SkipRows,NumRows: oObject.NumRows },
            this.GetMessagesBySessionIDSp_PagingSp,
            Callback
        );
    }

    async GetMessagesBySessionIDSp_PagingSpAsync(SessionID,Search,SortColumn,SortAscending,SkipRows,NumRows) {
        return await ObjectUtil.Promisify(
            this,
            this.GetMessagesBySessionIDSp_PagingSp,
            [ SessionID,Search,SortColumn,SortAscending,SkipRows,NumRows ]
        );
    }

    async GetMessagesBySessionIDSp_PagingSpObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetMessagesBySessionIDSp_PagingSpObject,
            [ oObject ]
        );
    }

    GetMessagesSince(sessionKey, messageKey, max, Callback) {
        return this.GetMessagesSinceObject({ sessionKey:sessionKey,messageKey:messageKey,max:max }, Callback);
    }

    GetMessagesSinceObject(oObject, Callback) {
        this._validate(oObject, MessagesValidators.GetMessagesSince, this.GetMessagesSince.onValidationError);

        var pageUrl = this.Url + "/get-messages-since";
        return this._invoke(
            pageUrl,
            "GetMessagesSince",
            { sessionKey: oObject.sessionKey,messageKey: oObject.messageKey,max: oObject.max },
            this.GetMessagesSince,
            Callback
        );
    }

    async GetMessagesSinceAsync(sessionKey,messageKey,max) {
        return await ObjectUtil.Promisify(
            this,
            this.GetMessagesSince,
            [ sessionKey,messageKey,max ]
        );
    }

    async GetMessagesSinceObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetMessagesSinceObject,
            [ oObject ]
        );
    }

    GetMessagesSp_PagingSp(Search, SortColumn, SortAscending, SkipRows, NumRows, Callback) {
        return this.GetMessagesSp_PagingSpObject({ Search:Search,SortColumn:SortColumn,SortAscending:SortAscending,SkipRows:SkipRows,NumRows:NumRows }, Callback);
    }

    GetMessagesSp_PagingSpObject(oObject, Callback) {
        this._validate(oObject, MessagesValidators.GetMessagesSp_PagingSp, this.GetMessagesSp_PagingSp.onValidationError);

        var pageUrl = this.Url + "/get-messages-sp-_-paging-sp";
        return this._invoke(
            pageUrl,
            "GetMessagesSp_PagingSp",
            { Search: oObject.Search,SortColumn: oObject.SortColumn,SortAscending: oObject.SortAscending,SkipRows: oObject.SkipRows,NumRows: oObject.NumRows },
            this.GetMessagesSp_PagingSp,
            Callback
        );
    }

    async GetMessagesSp_PagingSpAsync(Search,SortColumn,SortAscending,SkipRows,NumRows) {
        return await ObjectUtil.Promisify(
            this,
            this.GetMessagesSp_PagingSp,
            [ Search,SortColumn,SortAscending,SkipRows,NumRows ]
        );
    }

    async GetMessagesSp_PagingSpObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetMessagesSp_PagingSpObject,
            [ oObject ]
        );
    }

    InsertMessage(SessionID, SequenceNumber, Role, Content, ToolName, ToolArguments, CallID, Data, IsCompacted, CompactionEpoch, MessageKey, TurnID, CompactionEpochKey, MessageKind, TerminalOutcomeState, SavedWorkResume, Callback) {
        return this.InsertMessageObject({ SessionID:SessionID,SequenceNumber:SequenceNumber,Role:Role,Content:Content,ToolName:ToolName,ToolArguments:ToolArguments,CallID:CallID,Data:Data,IsCompacted:IsCompacted,CompactionEpoch:CompactionEpoch,MessageKey:MessageKey,TurnID:TurnID,CompactionEpochKey:CompactionEpochKey,MessageKind:MessageKind,TerminalOutcomeState:TerminalOutcomeState,SavedWorkResume:SavedWorkResume }, Callback);
    }

    InsertMessageObject(oObject, Callback) {
        this._validate(oObject, MessagesValidators.InsertMessage, this.InsertMessage.onValidationError);

        var pageUrl = this.Url + "/insert-message";
        return this._invoke(
            pageUrl,
            "InsertMessage",
            { SessionID: oObject.SessionID,SequenceNumber: oObject.SequenceNumber,Role: oObject.Role,Content: oObject.Content,ToolName: oObject.ToolName,ToolArguments: oObject.ToolArguments,CallID: oObject.CallID,Data: oObject.Data,IsCompacted: oObject.IsCompacted,CompactionEpoch: oObject.CompactionEpoch,MessageKey: oObject.MessageKey,TurnID: oObject.TurnID,CompactionEpochKey: oObject.CompactionEpochKey,MessageKind: oObject.MessageKind,TerminalOutcomeState: oObject.TerminalOutcomeState,SavedWorkResume: oObject.SavedWorkResume },
            this.InsertMessage,
            Callback
        );
    }

    async InsertMessageAsync(SessionID,SequenceNumber,Role,Content,ToolName,ToolArguments,CallID,Data,IsCompacted,CompactionEpoch,MessageKey,TurnID,CompactionEpochKey,MessageKind,TerminalOutcomeState,SavedWorkResume) {
        return await ObjectUtil.Promisify(
            this,
            this.InsertMessage,
            [ SessionID,SequenceNumber,Role,Content,ToolName,ToolArguments,CallID,Data,IsCompacted,CompactionEpoch,MessageKey,TurnID,CompactionEpochKey,MessageKind,TerminalOutcomeState,SavedWorkResume ]
        );
    }

    async InsertMessageObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.InsertMessageObject,
            [ oObject ]
        );
    }

    MarkMessageAsCompacted(MessageID, Callback) {
        return this.MarkMessageAsCompactedObject({ MessageID:MessageID }, Callback);
    }

    MarkMessageAsCompactedObject(oObject, Callback) {
        this._validate(oObject, MessagesValidators.MarkMessageAsCompacted, this.MarkMessageAsCompacted.onValidationError);

        var pageUrl = this.Url + "/mark-message-as-compacted";
        return this._invoke(
            pageUrl,
            "MarkMessageAsCompacted",
            { MessageID: oObject.MessageID },
            this.MarkMessageAsCompacted,
            Callback
        );
    }

    async MarkMessageAsCompactedAsync(MessageID) {
        return await ObjectUtil.Promisify(
            this,
            this.MarkMessageAsCompacted,
            [ MessageID ]
        );
    }

    async MarkMessageAsCompactedObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.MarkMessageAsCompactedObject,
            [ oObject ]
        );
    }

    MarkMessageAsNotCompacted(MessageID, Callback) {
        return this.MarkMessageAsNotCompactedObject({ MessageID:MessageID }, Callback);
    }

    MarkMessageAsNotCompactedObject(oObject, Callback) {
        this._validate(oObject, MessagesValidators.MarkMessageAsNotCompacted, this.MarkMessageAsNotCompacted.onValidationError);

        var pageUrl = this.Url + "/mark-message-as-not-compacted";
        return this._invoke(
            pageUrl,
            "MarkMessageAsNotCompacted",
            { MessageID: oObject.MessageID },
            this.MarkMessageAsNotCompacted,
            Callback
        );
    }

    async MarkMessageAsNotCompactedAsync(MessageID) {
        return await ObjectUtil.Promisify(
            this,
            this.MarkMessageAsNotCompacted,
            [ MessageID ]
        );
    }

    async MarkMessageAsNotCompactedObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.MarkMessageAsNotCompactedObject,
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

    UpdateMessage(MessageID, SessionID, SequenceNumber, Role, Content, ToolName, ToolArguments, CallID, Data, IsCompacted, CompactionEpoch, MessageKey, TurnID, CompactionEpochKey, MessageKind, TerminalOutcomeState, SavedWorkResume, Callback) {
        return this.UpdateMessageObject({ MessageID:MessageID,SessionID:SessionID,SequenceNumber:SequenceNumber,Role:Role,Content:Content,ToolName:ToolName,ToolArguments:ToolArguments,CallID:CallID,Data:Data,IsCompacted:IsCompacted,CompactionEpoch:CompactionEpoch,MessageKey:MessageKey,TurnID:TurnID,CompactionEpochKey:CompactionEpochKey,MessageKind:MessageKind,TerminalOutcomeState:TerminalOutcomeState,SavedWorkResume:SavedWorkResume }, Callback);
    }

    UpdateMessageObject(oObject, Callback) {
        this._validate(oObject, MessagesValidators.UpdateMessage, this.UpdateMessage.onValidationError);

        var pageUrl = this.Url + "/update-message";
        return this._invoke(
            pageUrl,
            "UpdateMessage",
            { MessageID: oObject.MessageID,SessionID: oObject.SessionID,SequenceNumber: oObject.SequenceNumber,Role: oObject.Role,Content: oObject.Content,ToolName: oObject.ToolName,ToolArguments: oObject.ToolArguments,CallID: oObject.CallID,Data: oObject.Data,IsCompacted: oObject.IsCompacted,CompactionEpoch: oObject.CompactionEpoch,MessageKey: oObject.MessageKey,TurnID: oObject.TurnID,CompactionEpochKey: oObject.CompactionEpochKey,MessageKind: oObject.MessageKind,TerminalOutcomeState: oObject.TerminalOutcomeState,SavedWorkResume: oObject.SavedWorkResume },
            this.UpdateMessage,
            Callback
        );
    }

    async UpdateMessageAsync(MessageID,SessionID,SequenceNumber,Role,Content,ToolName,ToolArguments,CallID,Data,IsCompacted,CompactionEpoch,MessageKey,TurnID,CompactionEpochKey,MessageKind,TerminalOutcomeState,SavedWorkResume) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateMessage,
            [ MessageID,SessionID,SequenceNumber,Role,Content,ToolName,ToolArguments,CallID,Data,IsCompacted,CompactionEpoch,MessageKey,TurnID,CompactionEpochKey,MessageKind,TerminalOutcomeState,SavedWorkResume ]
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

    GetMessageByMessageKey : {
            MessageKey : {Validators: [Validators.Text], InvalidMessage: "Invalid MessageKey"} 
    },

    GetMessagesBefore : {
            sessionKey : {Validators: [Validators.Text], InvalidMessage: "Invalid sessionKey"} ,
            messageKey : {Validators: [Validators.Text], InvalidMessage: "Invalid messageKey"} ,
            max : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid max"} 
    },

    GetMessagesByCompactionEpochKey : {
            CompactionEpochKey : {Validators: [Validators.Text], InvalidMessage: "Invalid CompactionEpochKey"} 
    },

    GetMessagesByCompactionEpochKeySessionID : {
            compactionEpochKey : {Validators: [Validators.Text], InvalidMessage: "Invalid compactionEpochKey"} ,
            sessionId : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid sessionId"} 
    },

    GetMessagesByMessageKey : {
            MessageKey : {Validators: [Validators.Text], InvalidMessage: "Invalid MessageKey"} 
    },

    GetMessagesBySessionID : {
            SessionID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionID"} 
    },

    GetMessagesBySessionIDSp_PagingSp : {
            SessionID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionID"} ,
            Search : {Validators: [Validators.Text], InvalidMessage: "Invalid Search"} ,
            SortColumn : {Validators: [Validators.Text], InvalidMessage: "Invalid SortColumn"} ,
            SortAscending : {Validators: [Validators.MakeRequired(Validators.Boolean)], InvalidMessage: "Invalid SortAscending"} ,
            SkipRows : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SkipRows"} ,
            NumRows : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid NumRows"} 
    },

    GetMessagesSince : {
            sessionKey : {Validators: [Validators.Text], InvalidMessage: "Invalid sessionKey"} ,
            messageKey : {Validators: [Validators.Text], InvalidMessage: "Invalid messageKey"} ,
            max : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid max"} 
    },

    GetMessagesSp_PagingSp : {
            Search : {Validators: [Validators.Text], InvalidMessage: "Invalid Search"} ,
            SortColumn : {Validators: [Validators.Text], InvalidMessage: "Invalid SortColumn"} ,
            SortAscending : {Validators: [Validators.MakeRequired(Validators.Boolean)], InvalidMessage: "Invalid SortAscending"} ,
            SkipRows : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SkipRows"} ,
            NumRows : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid NumRows"} 
    },

    InsertMessage : {
            SessionID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionID"} ,
            SequenceNumber : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SequenceNumber"} ,
            Role : {Validators: [Validators.Text], InvalidMessage: "Invalid Role"} ,
            Content : {Validators: [Validators.Text], InvalidMessage: "Invalid Content"} ,
            ToolName : {Validators: [Validators.Text], InvalidMessage: "Invalid ToolName"} ,
            ToolArguments : {Validators: [Validators.Text], InvalidMessage: "Invalid ToolArguments"} ,
            CallID : {Validators: [Validators.Text], InvalidMessage: "Invalid CallID"} ,
            Data : {Validators: [Validators.Text], InvalidMessage: "Invalid Data"} ,
            IsCompacted : {Validators: [Validators.MakeRequired(Validators.Boolean)], InvalidMessage: "Invalid IsCompacted"} ,
            CompactionEpoch : {Validators: [Validators.Integer], InvalidMessage: "Invalid CompactionEpoch"} ,
            MessageKey : {Validators: [Validators.Text], InvalidMessage: "Invalid MessageKey"} ,
            TurnID : {Validators: [Validators.Text], InvalidMessage: "Invalid TurnID"} ,
            CompactionEpochKey : {Validators: [Validators.Text], InvalidMessage: "Invalid CompactionEpochKey"} ,
            MessageKind : {Validators: [Validators.Text], InvalidMessage: "Invalid MessageKind"} ,
            TerminalOutcomeState : {Validators: [Validators.Text], InvalidMessage: "Invalid TerminalOutcomeState"} ,
            SavedWorkResume : {Validators: [Validators.Boolean], InvalidMessage: "Invalid SavedWorkResume"} 
    },

    MarkMessageAsCompacted : {
            MessageID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid MessageID"} 
    },

    MarkMessageAsNotCompacted : {
            MessageID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid MessageID"} 
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
            Data : {Validators: [Validators.Text], InvalidMessage: "Invalid Data"} ,
            IsCompacted : {Validators: [Validators.MakeRequired(Validators.Boolean)], InvalidMessage: "Invalid IsCompacted"} ,
            CompactionEpoch : {Validators: [Validators.Integer], InvalidMessage: "Invalid CompactionEpoch"} ,
            MessageKey : {Validators: [Validators.Text], InvalidMessage: "Invalid MessageKey"} ,
            TurnID : {Validators: [Validators.Text], InvalidMessage: "Invalid TurnID"} ,
            CompactionEpochKey : {Validators: [Validators.Text], InvalidMessage: "Invalid CompactionEpochKey"} ,
            MessageKind : {Validators: [Validators.Text], InvalidMessage: "Invalid MessageKind"} ,
            TerminalOutcomeState : {Validators: [Validators.Text], InvalidMessage: "Invalid TerminalOutcomeState"} ,
            SavedWorkResume : {Validators: [Validators.Boolean], InvalidMessage: "Invalid SavedWorkResume"} 
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
    