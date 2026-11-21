
    	    	
var SessionsValidatorsFields = {
	
		jsonObject : {Validators : [Validators.Object], InvalidMessage: "Invalid jsonObject. " + ValidatorDescriptions.Object() },
		AgentName : {Validators : [Validators.String], InvalidMessage: "Invalid Agent Name. " + ValidatorDescriptions.Length(1, 255) },
		reasoningLevel : {Validators : [Validators.String], InvalidMessage: "Invalid reasoningLevel. " + ValidatorDescriptions.Length(1, 255) },
		sessionName : {Validators : [Validators.String], InvalidMessage: "Invalid sessionName. " + ValidatorDescriptions.Length(1, 255) },
		sessionKey : {Validators : [Validators.String], InvalidMessage: "Invalid sessionKey. " + ValidatorDescriptions.Length(1, 255) },
		provider : {Validators : [Validators.String], InvalidMessage: "Invalid provider. " + ValidatorDescriptions.Length(1, 255) },
		PromptContext : {Validators : [Validators.Text], InvalidMessage: "Invalid Prompt Context. " + ValidatorDescriptions.Length(1, 4000) },
		ParentSessionID : {Validators : [Validators.ID], InvalidMessage: "Invalid Parent Session ID. " + ValidatorDescriptions.ID() },
		Transport : {Validators : [Validators.String], InvalidMessage: "Invalid Transport. " + ValidatorDescriptions.Length(1, 255) },
		SessionKind : {Validators : [Validators.String], InvalidMessage: "Invalid Session kind. " + ValidatorDescriptions.Length(1, 255) },
		modelName : {Validators : [Validators.String], InvalidMessage: "Invalid modelName. " + ValidatorDescriptions.Length(1, 255) },
		parentSessionKey : {Validators : [Validators.String], InvalidMessage: "Invalid parentSessionKey. " + ValidatorDescriptions.Length(1, 255) },
		IsArchived : {Validators : [Validators.Boolean], InvalidMessage: "Invalid Is Archived. " + ValidatorDescriptions.Boolean() },
		SessionName : {Validators : [Validators.String], InvalidMessage: "Invalid Session Name. " + ValidatorDescriptions.Length(1, 255) },
		ReasoningLevel : {Validators : [Validators.String], InvalidMessage: "Invalid Reasoning Level. " + ValidatorDescriptions.Length(1, 255) },
		ProjectName : {Validators : [Validators.String], InvalidMessage: "Invalid Project Name. " + ValidatorDescriptions.Length(1, 255) },
		SkipRows : {Validators : [Validators.Integer], InvalidMessage: "Invalid SkipRows. " + ValidatorDescriptions.Integer() },
		SortAscending : {Validators : [Validators.Boolean], InvalidMessage: "Invalid SortAscending. " + ValidatorDescriptions.Boolean() },
		transport : {Validators : [Validators.String], InvalidMessage: "Invalid transport. " + ValidatorDescriptions.Length(1, 255) },
		SessionKey : {Validators : [Validators.String], InvalidMessage: "Invalid Session Key. " + ValidatorDescriptions.Length(1, 255) },
		Provider : {Validators : [Validators.String], InvalidMessage: "Invalid Provider. " + ValidatorDescriptions.Length(1, 255) },
		Search : {Validators : [Validators.String], InvalidMessage: "Invalid Search. " + ValidatorDescriptions.Length(1, 255) },
		State : {Validators : [Validators.String], InvalidMessage: "Invalid State. " + ValidatorDescriptions.Length(1, 255) },
		Data : {Validators : [Validators.Data], InvalidMessage: "Invalid Data. " + ValidatorDescriptions.Length(1) },
		ModelName : {Validators : [Validators.String], InvalidMessage: "Invalid Model Name. " + ValidatorDescriptions.Length(1, 255) },
		SessionID : {Validators : [Validators.ID], InvalidMessage: "Invalid Session ID. " + ValidatorDescriptions.ID() },
		NumRows : {Validators : [Validators.Integer], InvalidMessage: "Invalid NumRows. " + ValidatorDescriptions.Integer() },
		ProjectFilePath : {Validators : [Validators.String], InvalidMessage: "Invalid Project File Path. " + ValidatorDescriptions.Length(1, 255) },
		SortColumn : {Validators : [Validators.String], InvalidMessage: "Invalid SortColumn. " + ValidatorDescriptions.Length(1, 255) }	
}
		
class SessionsService {
    constructor({ baseUrl = "/api/buffaly.sessions/sessions", authToken = null } = {}) {
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


    ArchiveSessionBySessionKey(sessionKey, Callback) {
        return this.ArchiveSessionBySessionKeyObject({ sessionKey:sessionKey }, Callback);
    }

    ArchiveSessionBySessionKeyObject(oObject, Callback) {
        this._validate(oObject, SessionsValidators.ArchiveSessionBySessionKey, this.ArchiveSessionBySessionKey.onValidationError);

        var pageUrl = this.Url + "/archive-session-by-session-key";
        return this._invoke(
            pageUrl,
            "ArchiveSessionBySessionKey",
            { sessionKey: oObject.sessionKey },
            this.ArchiveSessionBySessionKey,
            Callback
        );
    }

    async ArchiveSessionBySessionKeyAsync(sessionKey) {
        return await ObjectUtil.Promisify(
            this,
            this.ArchiveSessionBySessionKey,
            [ sessionKey ]
        );
    }

    async ArchiveSessionBySessionKeyObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.ArchiveSessionBySessionKeyObject,
            [ oObject ]
        );
    }

    ClearParentSessionKeyBySessionKey(sessionKey, Callback) {
        return this.ClearParentSessionKeyBySessionKeyObject({ sessionKey:sessionKey }, Callback);
    }

    ClearParentSessionKeyBySessionKeyObject(oObject, Callback) {
        this._validate(oObject, SessionsValidators.ClearParentSessionKeyBySessionKey, this.ClearParentSessionKeyBySessionKey.onValidationError);

        var pageUrl = this.Url + "/clear-parent-session-key-by-session-key";
        return this._invoke(
            pageUrl,
            "ClearParentSessionKeyBySessionKey",
            { sessionKey: oObject.sessionKey },
            this.ClearParentSessionKeyBySessionKey,
            Callback
        );
    }

    async ClearParentSessionKeyBySessionKeyAsync(sessionKey) {
        return await ObjectUtil.Promisify(
            this,
            this.ClearParentSessionKeyBySessionKey,
            [ sessionKey ]
        );
    }

    async ClearParentSessionKeyBySessionKeyObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.ClearParentSessionKeyBySessionKeyObject,
            [ oObject ]
        );
    }

    CopySession(SessionID, Callback) {
        return this.CopySessionObject({ SessionID:SessionID }, Callback);
    }

    CopySessionObject(oObject, Callback) {
        this._validate(oObject, SessionsValidators.CopySession, this.CopySession.onValidationError);

        var pageUrl = this.Url + "/copy-session";
        return this._invoke(
            pageUrl,
            "CopySession",
            { SessionID: oObject.SessionID },
            this.CopySession,
            Callback
        );
    }

    async CopySessionAsync(SessionID) {
        return await ObjectUtil.Promisify(
            this,
            this.CopySession,
            [ SessionID ]
        );
    }

    async CopySessionObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.CopySessionObject,
            [ oObject ]
        );
    }

    ExportSession(SessionID, Callback) {
        return this.ExportSessionObject({ SessionID:SessionID }, Callback);
    }

    ExportSessionObject(oObject, Callback) {
        this._validate(oObject, SessionsValidators.ExportSession, this.ExportSession.onValidationError);

        var pageUrl = this.Url + "/export-session";
        return this._invoke(
            pageUrl,
            "ExportSession",
            { SessionID: oObject.SessionID },
            this.ExportSession,
            Callback
        );
    }

    async ExportSessionAsync(SessionID) {
        return await ObjectUtil.Promisify(
            this,
            this.ExportSession,
            [ SessionID ]
        );
    }

    async ExportSessionObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.ExportSessionObject,
            [ oObject ]
        );
    }

    GetSession(SessionID, Callback) {
        return this.GetSessionObject({ SessionID:SessionID }, Callback);
    }

    GetSessionObject(oObject, Callback) {
        this._validate(oObject, SessionsValidators.GetSession, this.GetSession.onValidationError);

        var pageUrl = this.Url + "/get-session";
        return this._invoke(
            pageUrl,
            "GetSession",
            { SessionID: oObject.SessionID },
            this.GetSession,
            Callback
        );
    }

    async GetSessionAsync(SessionID) {
        return await ObjectUtil.Promisify(
            this,
            this.GetSession,
            [ SessionID ]
        );
    }

    async GetSessionObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetSessionObject,
            [ oObject ]
        );
    }

    GetSessionBySessionKey(SessionKey, Callback) {
        return this.GetSessionBySessionKeyObject({ SessionKey:SessionKey }, Callback);
    }

    GetSessionBySessionKeyObject(oObject, Callback) {
        this._validate(oObject, SessionsValidators.GetSessionBySessionKey, this.GetSessionBySessionKey.onValidationError);

        var pageUrl = this.Url + "/get-session-by-session-key";
        return this._invoke(
            pageUrl,
            "GetSessionBySessionKey",
            { SessionKey: oObject.SessionKey },
            this.GetSessionBySessionKey,
            Callback
        );
    }

    async GetSessionBySessionKeyAsync(SessionKey) {
        return await ObjectUtil.Promisify(
            this,
            this.GetSessionBySessionKey,
            [ SessionKey ]
        );
    }

    async GetSessionBySessionKeyObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetSessionBySessionKeyObject,
            [ oObject ]
        );
    }

    GetSessionsByParentSessionID(ParentSessionID, Callback) {
        return this.GetSessionsByParentSessionIDObject({ ParentSessionID:ParentSessionID }, Callback);
    }

    GetSessionsByParentSessionIDObject(oObject, Callback) {
        this._validate(oObject, SessionsValidators.GetSessionsByParentSessionID, this.GetSessionsByParentSessionID.onValidationError);

        var pageUrl = this.Url + "/get-sessions-by-parent-session-id";
        return this._invoke(
            pageUrl,
            "GetSessionsByParentSessionID",
            { ParentSessionID: oObject.ParentSessionID },
            this.GetSessionsByParentSessionID,
            Callback
        );
    }

    async GetSessionsByParentSessionIDAsync(ParentSessionID) {
        return await ObjectUtil.Promisify(
            this,
            this.GetSessionsByParentSessionID,
            [ ParentSessionID ]
        );
    }

    async GetSessionsByParentSessionIDObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetSessionsByParentSessionIDObject,
            [ oObject ]
        );
    }

    GetSessionsByParentSessionIDSp_PagingSp(ParentSessionID, Search, SortColumn, SortAscending, SkipRows, NumRows, Callback) {
        return this.GetSessionsByParentSessionIDSp_PagingSpObject({ ParentSessionID:ParentSessionID,Search:Search,SortColumn:SortColumn,SortAscending:SortAscending,SkipRows:SkipRows,NumRows:NumRows }, Callback);
    }

    GetSessionsByParentSessionIDSp_PagingSpObject(oObject, Callback) {
        this._validate(oObject, SessionsValidators.GetSessionsByParentSessionIDSp_PagingSp, this.GetSessionsByParentSessionIDSp_PagingSp.onValidationError);

        var pageUrl = this.Url + "/get-sessions-by-parent-session-id-sp-_-paging-sp";
        return this._invoke(
            pageUrl,
            "GetSessionsByParentSessionIDSp_PagingSp",
            { ParentSessionID: oObject.ParentSessionID,Search: oObject.Search,SortColumn: oObject.SortColumn,SortAscending: oObject.SortAscending,SkipRows: oObject.SkipRows,NumRows: oObject.NumRows },
            this.GetSessionsByParentSessionIDSp_PagingSp,
            Callback
        );
    }

    async GetSessionsByParentSessionIDSp_PagingSpAsync(ParentSessionID,Search,SortColumn,SortAscending,SkipRows,NumRows) {
        return await ObjectUtil.Promisify(
            this,
            this.GetSessionsByParentSessionIDSp_PagingSp,
            [ ParentSessionID,Search,SortColumn,SortAscending,SkipRows,NumRows ]
        );
    }

    async GetSessionsByParentSessionIDSp_PagingSpObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetSessionsByParentSessionIDSp_PagingSpObject,
            [ oObject ]
        );
    }

    GetSessionsSp_PagingSp(Search, SortColumn, SortAscending, SkipRows, NumRows, Callback) {
        return this.GetSessionsSp_PagingSpObject({ Search:Search,SortColumn:SortColumn,SortAscending:SortAscending,SkipRows:SkipRows,NumRows:NumRows }, Callback);
    }

    GetSessionsSp_PagingSpObject(oObject, Callback) {
        this._validate(oObject, SessionsValidators.GetSessionsSp_PagingSp, this.GetSessionsSp_PagingSp.onValidationError);

        var pageUrl = this.Url + "/get-sessions-sp-_-paging-sp";
        return this._invoke(
            pageUrl,
            "GetSessionsSp_PagingSp",
            { Search: oObject.Search,SortColumn: oObject.SortColumn,SortAscending: oObject.SortAscending,SkipRows: oObject.SkipRows,NumRows: oObject.NumRows },
            this.GetSessionsSp_PagingSp,
            Callback
        );
    }

    async GetSessionsSp_PagingSpAsync(Search,SortColumn,SortAscending,SkipRows,NumRows) {
        return await ObjectUtil.Promisify(
            this,
            this.GetSessionsSp_PagingSp,
            [ Search,SortColumn,SortAscending,SkipRows,NumRows ]
        );
    }

    async GetSessionsSp_PagingSpObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetSessionsSp_PagingSpObject,
            [ oObject ]
        );
    }

    ImportSession(jsonObject, Callback) {
        return this.ImportSessionObject({ jsonObject:jsonObject }, Callback);
    }

    ImportSessionObject(oObject, Callback) {
        this._validate(oObject, SessionsValidators.ImportSession, this.ImportSession.onValidationError);

        var pageUrl = this.Url + "/import-session";
        return this._invoke(
            pageUrl,
            "ImportSession",
            { jsonObject: oObject.jsonObject },
            this.ImportSession,
            Callback
        );
    }

    async ImportSessionAsync(jsonObject) {
        return await ObjectUtil.Promisify(
            this,
            this.ImportSession,
            [ jsonObject ]
        );
    }

    async ImportSessionObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.ImportSessionObject,
            [ oObject ]
        );
    }

    InsertSession(SessionKey, AgentName, ProjectName, ProjectFilePath, Provider, ModelName, ReasoningLevel, PromptContext, Data, SessionName, ParentSessionID, IsArchived, State, SessionKind, Transport, Callback) {
        return this.InsertSessionObject({ SessionKey:SessionKey,AgentName:AgentName,ProjectName:ProjectName,ProjectFilePath:ProjectFilePath,Provider:Provider,ModelName:ModelName,ReasoningLevel:ReasoningLevel,PromptContext:PromptContext,Data:Data,SessionName:SessionName,ParentSessionID:ParentSessionID,IsArchived:IsArchived,State:State,SessionKind:SessionKind,Transport:Transport }, Callback);
    }

    InsertSessionObject(oObject, Callback) {
        this._validate(oObject, SessionsValidators.InsertSession, this.InsertSession.onValidationError);

        var pageUrl = this.Url + "/insert-session";
        return this._invoke(
            pageUrl,
            "InsertSession",
            { SessionKey: oObject.SessionKey,AgentName: oObject.AgentName,ProjectName: oObject.ProjectName,ProjectFilePath: oObject.ProjectFilePath,Provider: oObject.Provider,ModelName: oObject.ModelName,ReasoningLevel: oObject.ReasoningLevel,PromptContext: oObject.PromptContext,Data: oObject.Data,SessionName: oObject.SessionName,ParentSessionID: oObject.ParentSessionID,IsArchived: oObject.IsArchived,State: oObject.State,SessionKind: oObject.SessionKind,Transport: oObject.Transport },
            this.InsertSession,
            Callback
        );
    }

    async InsertSessionAsync(SessionKey,AgentName,ProjectName,ProjectFilePath,Provider,ModelName,ReasoningLevel,PromptContext,Data,SessionName,ParentSessionID,IsArchived,State,SessionKind,Transport) {
        return await ObjectUtil.Promisify(
            this,
            this.InsertSession,
            [ SessionKey,AgentName,ProjectName,ProjectFilePath,Provider,ModelName,ReasoningLevel,PromptContext,Data,SessionName,ParentSessionID,IsArchived,State,SessionKind,Transport ]
        );
    }

    async InsertSessionObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.InsertSessionObject,
            [ oObject ]
        );
    }

    MarkSessionAsArchived(SessionID, Callback) {
        return this.MarkSessionAsArchivedObject({ SessionID:SessionID }, Callback);
    }

    MarkSessionAsArchivedObject(oObject, Callback) {
        this._validate(oObject, SessionsValidators.MarkSessionAsArchived, this.MarkSessionAsArchived.onValidationError);

        var pageUrl = this.Url + "/mark-session-as-archived";
        return this._invoke(
            pageUrl,
            "MarkSessionAsArchived",
            { SessionID: oObject.SessionID },
            this.MarkSessionAsArchived,
            Callback
        );
    }

    async MarkSessionAsArchivedAsync(SessionID) {
        return await ObjectUtil.Promisify(
            this,
            this.MarkSessionAsArchived,
            [ SessionID ]
        );
    }

    async MarkSessionAsArchivedObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.MarkSessionAsArchivedObject,
            [ oObject ]
        );
    }

    MarkSessionAsNotArchived(SessionID, Callback) {
        return this.MarkSessionAsNotArchivedObject({ SessionID:SessionID }, Callback);
    }

    MarkSessionAsNotArchivedObject(oObject, Callback) {
        this._validate(oObject, SessionsValidators.MarkSessionAsNotArchived, this.MarkSessionAsNotArchived.onValidationError);

        var pageUrl = this.Url + "/mark-session-as-not-archived";
        return this._invoke(
            pageUrl,
            "MarkSessionAsNotArchived",
            { SessionID: oObject.SessionID },
            this.MarkSessionAsNotArchived,
            Callback
        );
    }

    async MarkSessionAsNotArchivedAsync(SessionID) {
        return await ObjectUtil.Promisify(
            this,
            this.MarkSessionAsNotArchived,
            [ SessionID ]
        );
    }

    async MarkSessionAsNotArchivedObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.MarkSessionAsNotArchivedObject,
            [ oObject ]
        );
    }

    RemoveSession(SessionID, Callback) {
        return this.RemoveSessionObject({ SessionID:SessionID }, Callback);
    }

    RemoveSessionObject(oObject, Callback) {
        this._validate(oObject, SessionsValidators.RemoveSession, this.RemoveSession.onValidationError);

        var pageUrl = this.Url + "/remove-session";
        return this._invoke(
            pageUrl,
            "RemoveSession",
            { SessionID: oObject.SessionID },
            this.RemoveSession,
            Callback
        );
    }

    async RemoveSessionAsync(SessionID) {
        return await ObjectUtil.Promisify(
            this,
            this.RemoveSession,
            [ SessionID ]
        );
    }

    async RemoveSessionObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.RemoveSessionObject,
            [ oObject ]
        );
    }

    RenameSessionBySessionKey(sessionKey, sessionName, Callback) {
        return this.RenameSessionBySessionKeyObject({ sessionKey:sessionKey,sessionName:sessionName }, Callback);
    }

    RenameSessionBySessionKeyObject(oObject, Callback) {
        this._validate(oObject, SessionsValidators.RenameSessionBySessionKey, this.RenameSessionBySessionKey.onValidationError);

        var pageUrl = this.Url + "/rename-session-by-session-key";
        return this._invoke(
            pageUrl,
            "RenameSessionBySessionKey",
            { sessionKey: oObject.sessionKey,sessionName: oObject.sessionName },
            this.RenameSessionBySessionKey,
            Callback
        );
    }

    async RenameSessionBySessionKeyAsync(sessionKey,sessionName) {
        return await ObjectUtil.Promisify(
            this,
            this.RenameSessionBySessionKey,
            [ sessionKey,sessionName ]
        );
    }

    async RenameSessionBySessionKeyObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.RenameSessionBySessionKeyObject,
            [ oObject ]
        );
    }

    Sessions_GetAll_Sp_CountSp(Search, Callback) {
        return this.Sessions_GetAll_Sp_CountSpObject({ Search:Search }, Callback);
    }

    Sessions_GetAll_Sp_CountSpObject(oObject, Callback) {
        this._validate(oObject, SessionsValidators.Sessions_GetAll_Sp_CountSp, this.Sessions_GetAll_Sp_CountSp.onValidationError);

        var pageUrl = this.Url + "/sessions-_-get-all-_-sp-_-count-sp";
        return this._invoke(
            pageUrl,
            "Sessions_GetAll_Sp_CountSp",
            { Search: oObject.Search },
            this.Sessions_GetAll_Sp_CountSp,
            Callback
        );
    }

    async Sessions_GetAll_Sp_CountSpAsync(Search) {
        return await ObjectUtil.Promisify(
            this,
            this.Sessions_GetAll_Sp_CountSp,
            [ Search ]
        );
    }

    async Sessions_GetAll_Sp_CountSpObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.Sessions_GetAll_Sp_CountSpObject,
            [ oObject ]
        );
    }

    Sessions_GetAll_Sp_PagingSp(Search, SortColumn, SortAscending, SkipRows, NumRows, Callback) {
        return this.Sessions_GetAll_Sp_PagingSpObject({ Search:Search,SortColumn:SortColumn,SortAscending:SortAscending,SkipRows:SkipRows,NumRows:NumRows }, Callback);
    }

    Sessions_GetAll_Sp_PagingSpObject(oObject, Callback) {
        this._validate(oObject, SessionsValidators.Sessions_GetAll_Sp_PagingSp, this.Sessions_GetAll_Sp_PagingSp.onValidationError);

        var pageUrl = this.Url + "/sessions-_-get-all-_-sp-_-paging-sp";
        return this._invoke(
            pageUrl,
            "Sessions_GetAll_Sp_PagingSp",
            { Search: oObject.Search,SortColumn: oObject.SortColumn,SortAscending: oObject.SortAscending,SkipRows: oObject.SkipRows,NumRows: oObject.NumRows },
            this.Sessions_GetAll_Sp_PagingSp,
            Callback
        );
    }

    async Sessions_GetAll_Sp_PagingSpAsync(Search,SortColumn,SortAscending,SkipRows,NumRows) {
        return await ObjectUtil.Promisify(
            this,
            this.Sessions_GetAll_Sp_PagingSp,
            [ Search,SortColumn,SortAscending,SkipRows,NumRows ]
        );
    }

    async Sessions_GetAll_Sp_PagingSpObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.Sessions_GetAll_Sp_PagingSpObject,
            [ oObject ]
        );
    }

    Sessions_GetArchivedSp_Sp_CountSp(Search, Callback) {
        return this.Sessions_GetArchivedSp_Sp_CountSpObject({ Search:Search }, Callback);
    }

    Sessions_GetArchivedSp_Sp_CountSpObject(oObject, Callback) {
        this._validate(oObject, SessionsValidators.Sessions_GetArchivedSp_Sp_CountSp, this.Sessions_GetArchivedSp_Sp_CountSp.onValidationError);

        var pageUrl = this.Url + "/sessions-_-get-archived-sp-_-sp-_-count-sp";
        return this._invoke(
            pageUrl,
            "Sessions_GetArchivedSp_Sp_CountSp",
            { Search: oObject.Search },
            this.Sessions_GetArchivedSp_Sp_CountSp,
            Callback
        );
    }

    async Sessions_GetArchivedSp_Sp_CountSpAsync(Search) {
        return await ObjectUtil.Promisify(
            this,
            this.Sessions_GetArchivedSp_Sp_CountSp,
            [ Search ]
        );
    }

    async Sessions_GetArchivedSp_Sp_CountSpObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.Sessions_GetArchivedSp_Sp_CountSpObject,
            [ oObject ]
        );
    }

    Sessions_GetArchivedSp_Sp_PagingSp(Search, SortColumn, SortAscending, SkipRows, NumRows, Callback) {
        return this.Sessions_GetArchivedSp_Sp_PagingSpObject({ Search:Search,SortColumn:SortColumn,SortAscending:SortAscending,SkipRows:SkipRows,NumRows:NumRows }, Callback);
    }

    Sessions_GetArchivedSp_Sp_PagingSpObject(oObject, Callback) {
        this._validate(oObject, SessionsValidators.Sessions_GetArchivedSp_Sp_PagingSp, this.Sessions_GetArchivedSp_Sp_PagingSp.onValidationError);

        var pageUrl = this.Url + "/sessions-_-get-archived-sp-_-sp-_-paging-sp";
        return this._invoke(
            pageUrl,
            "Sessions_GetArchivedSp_Sp_PagingSp",
            { Search: oObject.Search,SortColumn: oObject.SortColumn,SortAscending: oObject.SortAscending,SkipRows: oObject.SkipRows,NumRows: oObject.NumRows },
            this.Sessions_GetArchivedSp_Sp_PagingSp,
            Callback
        );
    }

    async Sessions_GetArchivedSp_Sp_PagingSpAsync(Search,SortColumn,SortAscending,SkipRows,NumRows) {
        return await ObjectUtil.Promisify(
            this,
            this.Sessions_GetArchivedSp_Sp_PagingSp,
            [ Search,SortColumn,SortAscending,SkipRows,NumRows ]
        );
    }

    async Sessions_GetArchivedSp_Sp_PagingSpObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.Sessions_GetArchivedSp_Sp_PagingSpObject,
            [ oObject ]
        );
    }

    SetParentSessionKeyBySessionKey(sessionKey, parentSessionKey, Callback) {
        return this.SetParentSessionKeyBySessionKeyObject({ sessionKey:sessionKey,parentSessionKey:parentSessionKey }, Callback);
    }

    SetParentSessionKeyBySessionKeyObject(oObject, Callback) {
        this._validate(oObject, SessionsValidators.SetParentSessionKeyBySessionKey, this.SetParentSessionKeyBySessionKey.onValidationError);

        var pageUrl = this.Url + "/set-parent-session-key-by-session-key";
        return this._invoke(
            pageUrl,
            "SetParentSessionKeyBySessionKey",
            { sessionKey: oObject.sessionKey,parentSessionKey: oObject.parentSessionKey },
            this.SetParentSessionKeyBySessionKey,
            Callback
        );
    }

    async SetParentSessionKeyBySessionKeyAsync(sessionKey,parentSessionKey) {
        return await ObjectUtil.Promisify(
            this,
            this.SetParentSessionKeyBySessionKey,
            [ sessionKey,parentSessionKey ]
        );
    }

    async SetParentSessionKeyBySessionKeyObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.SetParentSessionKeyBySessionKeyObject,
            [ oObject ]
        );
    }

    UnarchiveSessionBySessionKey(sessionKey, Callback) {
        return this.UnarchiveSessionBySessionKeyObject({ sessionKey:sessionKey }, Callback);
    }

    UnarchiveSessionBySessionKeyObject(oObject, Callback) {
        this._validate(oObject, SessionsValidators.UnarchiveSessionBySessionKey, this.UnarchiveSessionBySessionKey.onValidationError);

        var pageUrl = this.Url + "/unarchive-session-by-session-key";
        return this._invoke(
            pageUrl,
            "UnarchiveSessionBySessionKey",
            { sessionKey: oObject.sessionKey },
            this.UnarchiveSessionBySessionKey,
            Callback
        );
    }

    async UnarchiveSessionBySessionKeyAsync(sessionKey) {
        return await ObjectUtil.Promisify(
            this,
            this.UnarchiveSessionBySessionKey,
            [ sessionKey ]
        );
    }

    async UnarchiveSessionBySessionKeyObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.UnarchiveSessionBySessionKeyObject,
            [ oObject ]
        );
    }

    UpdateSession(SessionID, SessionKey, AgentName, ProjectName, ProjectFilePath, Provider, ModelName, ReasoningLevel, PromptContext, Data, SessionName, ParentSessionID, IsArchived, Callback) {
        return this.UpdateSessionObject({ SessionID:SessionID,SessionKey:SessionKey,AgentName:AgentName,ProjectName:ProjectName,ProjectFilePath:ProjectFilePath,Provider:Provider,ModelName:ModelName,ReasoningLevel:ReasoningLevel,PromptContext:PromptContext,Data:Data,SessionName:SessionName,ParentSessionID:ParentSessionID,IsArchived:IsArchived }, Callback);
    }

    UpdateSessionObject(oObject, Callback) {
        this._validate(oObject, SessionsValidators.UpdateSession, this.UpdateSession.onValidationError);

        var pageUrl = this.Url + "/update-session";
        return this._invoke(
            pageUrl,
            "UpdateSession",
            { SessionID: oObject.SessionID,SessionKey: oObject.SessionKey,AgentName: oObject.AgentName,ProjectName: oObject.ProjectName,ProjectFilePath: oObject.ProjectFilePath,Provider: oObject.Provider,ModelName: oObject.ModelName,ReasoningLevel: oObject.ReasoningLevel,PromptContext: oObject.PromptContext,Data: oObject.Data,SessionName: oObject.SessionName,ParentSessionID: oObject.ParentSessionID,IsArchived: oObject.IsArchived },
            this.UpdateSession,
            Callback
        );
    }

    async UpdateSessionAsync(SessionID,SessionKey,AgentName,ProjectName,ProjectFilePath,Provider,ModelName,ReasoningLevel,PromptContext,Data,SessionName,ParentSessionID,IsArchived) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateSession,
            [ SessionID,SessionKey,AgentName,ProjectName,ProjectFilePath,Provider,ModelName,ReasoningLevel,PromptContext,Data,SessionName,ParentSessionID,IsArchived ]
        );
    }

    async UpdateSessionObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateSessionObject,
            [ oObject ]
        );
    }

    UpdateSessionData(SessionID, Data, Callback) {
        return this.UpdateSessionDataObject({ SessionID:SessionID,Data:Data }, Callback);
    }

    UpdateSessionDataObject(oObject, Callback) {
        this._validate(oObject, SessionsValidators.UpdateSessionData, this.UpdateSessionData.onValidationError);

        var pageUrl = this.Url + "/update-session-data";
        return this._invoke(
            pageUrl,
            "UpdateSessionData",
            { SessionID: oObject.SessionID,Data: oObject.Data },
            this.UpdateSessionData,
            Callback
        );
    }

    async UpdateSessionDataAsync(SessionID,Data) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateSessionData,
            [ SessionID,Data ]
        );
    }

    async UpdateSessionDataObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateSessionDataObject,
            [ oObject ]
        );
    }

    UpdateSessionFromAdmin(SessionID, SessionKey, AgentName, ProjectName, ProjectFilePath, Provider, ModelName, ReasoningLevel, PromptContext, Data, IsArchived, Callback) {
        return this.UpdateSessionFromAdminObject({ SessionID:SessionID,SessionKey:SessionKey,AgentName:AgentName,ProjectName:ProjectName,ProjectFilePath:ProjectFilePath,Provider:Provider,ModelName:ModelName,ReasoningLevel:ReasoningLevel,PromptContext:PromptContext,Data:Data,IsArchived:IsArchived }, Callback);
    }

    UpdateSessionFromAdminObject(oObject, Callback) {
        this._validate(oObject, SessionsValidators.UpdateSessionFromAdmin, this.UpdateSessionFromAdmin.onValidationError);

        var pageUrl = this.Url + "/update-session-from-admin";
        return this._invoke(
            pageUrl,
            "UpdateSessionFromAdmin",
            { SessionID: oObject.SessionID,SessionKey: oObject.SessionKey,AgentName: oObject.AgentName,ProjectName: oObject.ProjectName,ProjectFilePath: oObject.ProjectFilePath,Provider: oObject.Provider,ModelName: oObject.ModelName,ReasoningLevel: oObject.ReasoningLevel,PromptContext: oObject.PromptContext,Data: oObject.Data,IsArchived: oObject.IsArchived },
            this.UpdateSessionFromAdmin,
            Callback
        );
    }

    async UpdateSessionFromAdminAsync(SessionID,SessionKey,AgentName,ProjectName,ProjectFilePath,Provider,ModelName,ReasoningLevel,PromptContext,Data,IsArchived) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateSessionFromAdmin,
            [ SessionID,SessionKey,AgentName,ProjectName,ProjectFilePath,Provider,ModelName,ReasoningLevel,PromptContext,Data,IsArchived ]
        );
    }

    async UpdateSessionFromAdminObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateSessionFromAdminObject,
            [ oObject ]
        );
    }

    UpdateSessionNameBySessionKey(sessionKey, sessionName, Callback) {
        return this.UpdateSessionNameBySessionKeyObject({ sessionKey:sessionKey,sessionName:sessionName }, Callback);
    }

    UpdateSessionNameBySessionKeyObject(oObject, Callback) {
        this._validate(oObject, SessionsValidators.UpdateSessionNameBySessionKey, this.UpdateSessionNameBySessionKey.onValidationError);

        var pageUrl = this.Url + "/update-session-name-by-session-key";
        return this._invoke(
            pageUrl,
            "UpdateSessionNameBySessionKey",
            { sessionKey: oObject.sessionKey,sessionName: oObject.sessionName },
            this.UpdateSessionNameBySessionKey,
            Callback
        );
    }

    async UpdateSessionNameBySessionKeyAsync(sessionKey,sessionName) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateSessionNameBySessionKey,
            [ sessionKey,sessionName ]
        );
    }

    async UpdateSessionNameBySessionKeyObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateSessionNameBySessionKeyObject,
            [ oObject ]
        );
    }

    UpdateSessionProviderSelectionBySessionKey(sessionKey, provider, modelName, reasoningLevel, transport, Callback) {
        return this.UpdateSessionProviderSelectionBySessionKeyObject({ sessionKey:sessionKey,provider:provider,modelName:modelName,reasoningLevel:reasoningLevel,transport:transport }, Callback);
    }

    UpdateSessionProviderSelectionBySessionKeyObject(oObject, Callback) {
        this._validate(oObject, SessionsValidators.UpdateSessionProviderSelectionBySessionKey, this.UpdateSessionProviderSelectionBySessionKey.onValidationError);

        var pageUrl = this.Url + "/update-session-provider-selection-by-session-key";
        return this._invoke(
            pageUrl,
            "UpdateSessionProviderSelectionBySessionKey",
            { sessionKey: oObject.sessionKey,provider: oObject.provider,modelName: oObject.modelName,reasoningLevel: oObject.reasoningLevel,transport: oObject.transport },
            this.UpdateSessionProviderSelectionBySessionKey,
            Callback
        );
    }

    async UpdateSessionProviderSelectionBySessionKeyAsync(sessionKey,provider,modelName,reasoningLevel,transport) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateSessionProviderSelectionBySessionKey,
            [ sessionKey,provider,modelName,reasoningLevel,transport ]
        );
    }

    async UpdateSessionProviderSelectionBySessionKeyObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateSessionProviderSelectionBySessionKeyObject,
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

var SessionsValidators = {
    

    ArchiveSessionBySessionKey : {
            sessionKey : {Validators: [Validators.Text], InvalidMessage: "Invalid sessionKey"} 
    },

    ClearParentSessionKeyBySessionKey : {
            sessionKey : {Validators: [Validators.Text], InvalidMessage: "Invalid sessionKey"} 
    },

    CopySession : {
            SessionID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionID"} 
    },

    ExportSession : {
            SessionID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionID"} 
    },

    GetSession : {
            SessionID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionID"} 
    },

    GetSessionBySessionKey : {
            SessionKey : {Validators: [Validators.Text], InvalidMessage: "Invalid SessionKey"} 
    },

    GetSessionsByParentSessionID : {
            ParentSessionID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid ParentSessionID"} 
    },

    GetSessionsByParentSessionIDSp_PagingSp : {
            ParentSessionID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid ParentSessionID"} ,
            Search : {Validators: [Validators.Text], InvalidMessage: "Invalid Search"} ,
            SortColumn : {Validators: [Validators.Text], InvalidMessage: "Invalid SortColumn"} ,
            SortAscending : {Validators: [Validators.MakeRequired(Validators.Boolean)], InvalidMessage: "Invalid SortAscending"} ,
            SkipRows : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SkipRows"} ,
            NumRows : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid NumRows"} 
    },

    GetSessionsSp_PagingSp : {
            Search : {Validators: [Validators.Text], InvalidMessage: "Invalid Search"} ,
            SortColumn : {Validators: [Validators.Text], InvalidMessage: "Invalid SortColumn"} ,
            SortAscending : {Validators: [Validators.MakeRequired(Validators.Boolean)], InvalidMessage: "Invalid SortAscending"} ,
            SkipRows : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SkipRows"} ,
            NumRows : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid NumRows"} 
    },

    ImportSession : {
            jsonObject : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid jsonObject"} 
    },

    InsertSession : {
            SessionKey : {Validators: [Validators.Text], InvalidMessage: "Invalid SessionKey"} ,
            AgentName : {Validators: [Validators.Text], InvalidMessage: "Invalid AgentName"} ,
            ProjectName : {Validators: [Validators.Text], InvalidMessage: "Invalid ProjectName"} ,
            ProjectFilePath : {Validators: [Validators.Text], InvalidMessage: "Invalid ProjectFilePath"} ,
            Provider : {Validators: [Validators.Text], InvalidMessage: "Invalid Provider"} ,
            ModelName : {Validators: [Validators.Text], InvalidMessage: "Invalid ModelName"} ,
            ReasoningLevel : {Validators: [Validators.Text], InvalidMessage: "Invalid ReasoningLevel"} ,
            PromptContext : {Validators: [Validators.Text], InvalidMessage: "Invalid PromptContext"} ,
            Data : {Validators: [Validators.Text], InvalidMessage: "Invalid Data"} ,
            SessionName : {Validators: [Validators.Text], InvalidMessage: "Invalid SessionName"} ,
            ParentSessionID : {Validators: [Validators.Integer], InvalidMessage: "Invalid ParentSessionID"} ,
            IsArchived : {Validators: [Validators.MakeRequired(Validators.Boolean)], InvalidMessage: "Invalid IsArchived"} ,
            State : {Validators: [Validators.Text], InvalidMessage: "Invalid State"} ,
            SessionKind : {Validators: [Validators.Text], InvalidMessage: "Invalid SessionKind"} ,
            Transport : {Validators: [Validators.Text], InvalidMessage: "Invalid Transport"} 
    },

    MarkSessionAsArchived : {
            SessionID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionID"} 
    },

    MarkSessionAsNotArchived : {
            SessionID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionID"} 
    },

    RemoveSession : {
            SessionID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionID"} 
    },

    RenameSessionBySessionKey : {
            sessionKey : {Validators: [Validators.Text], InvalidMessage: "Invalid sessionKey"} ,
            sessionName : {Validators: [Validators.Text], InvalidMessage: "Invalid sessionName"} 
    },

    Sessions_GetAll_Sp_CountSp : {
            Search : {Validators: [Validators.Text], InvalidMessage: "Invalid Search"} 
    },

    Sessions_GetAll_Sp_PagingSp : {
            Search : {Validators: [Validators.Text], InvalidMessage: "Invalid Search"} ,
            SortColumn : {Validators: [Validators.Text], InvalidMessage: "Invalid SortColumn"} ,
            SortAscending : {Validators: [Validators.MakeRequired(Validators.Boolean)], InvalidMessage: "Invalid SortAscending"} ,
            SkipRows : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SkipRows"} ,
            NumRows : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid NumRows"} 
    },

    Sessions_GetArchivedSp_Sp_CountSp : {
            Search : {Validators: [Validators.Text], InvalidMessage: "Invalid Search"} 
    },

    Sessions_GetArchivedSp_Sp_PagingSp : {
            Search : {Validators: [Validators.Text], InvalidMessage: "Invalid Search"} ,
            SortColumn : {Validators: [Validators.Text], InvalidMessage: "Invalid SortColumn"} ,
            SortAscending : {Validators: [Validators.MakeRequired(Validators.Boolean)], InvalidMessage: "Invalid SortAscending"} ,
            SkipRows : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SkipRows"} ,
            NumRows : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid NumRows"} 
    },

    SetParentSessionKeyBySessionKey : {
            sessionKey : {Validators: [Validators.Text], InvalidMessage: "Invalid sessionKey"} ,
            parentSessionKey : {Validators: [Validators.Text], InvalidMessage: "Invalid parentSessionKey"} 
    },

    UnarchiveSessionBySessionKey : {
            sessionKey : {Validators: [Validators.Text], InvalidMessage: "Invalid sessionKey"} 
    },

    UpdateSession : {
            SessionID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionID"} ,
            SessionKey : {Validators: [Validators.Text], InvalidMessage: "Invalid SessionKey"} ,
            AgentName : {Validators: [Validators.Text], InvalidMessage: "Invalid AgentName"} ,
            ProjectName : {Validators: [Validators.Text], InvalidMessage: "Invalid ProjectName"} ,
            ProjectFilePath : {Validators: [Validators.Text], InvalidMessage: "Invalid ProjectFilePath"} ,
            Provider : {Validators: [Validators.Text], InvalidMessage: "Invalid Provider"} ,
            ModelName : {Validators: [Validators.Text], InvalidMessage: "Invalid ModelName"} ,
            ReasoningLevel : {Validators: [Validators.Text], InvalidMessage: "Invalid ReasoningLevel"} ,
            PromptContext : {Validators: [Validators.Text], InvalidMessage: "Invalid PromptContext"} ,
            Data : {Validators: [Validators.Text], InvalidMessage: "Invalid Data"} ,
            SessionName : {Validators: [Validators.Text], InvalidMessage: "Invalid SessionName"} ,
            ParentSessionID : {Validators: [Validators.Integer], InvalidMessage: "Invalid ParentSessionID"} ,
            IsArchived : {Validators: [Validators.MakeRequired(Validators.Boolean)], InvalidMessage: "Invalid IsArchived"} 
    },

    UpdateSessionData : {
            SessionID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionID"} ,
            Data : {Validators: [Validators.Text], InvalidMessage: "Invalid Data"} 
    },

    UpdateSessionFromAdmin : {
            SessionID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SessionID"} ,
            SessionKey : {Validators: [Validators.Text], InvalidMessage: "Invalid SessionKey"} ,
            AgentName : {Validators: [Validators.Text], InvalidMessage: "Invalid AgentName"} ,
            ProjectName : {Validators: [Validators.Text], InvalidMessage: "Invalid ProjectName"} ,
            ProjectFilePath : {Validators: [Validators.Text], InvalidMessage: "Invalid ProjectFilePath"} ,
            Provider : {Validators: [Validators.Text], InvalidMessage: "Invalid Provider"} ,
            ModelName : {Validators: [Validators.Text], InvalidMessage: "Invalid ModelName"} ,
            ReasoningLevel : {Validators: [Validators.Text], InvalidMessage: "Invalid ReasoningLevel"} ,
            PromptContext : {Validators: [Validators.Text], InvalidMessage: "Invalid PromptContext"} ,
            Data : {Validators: [Validators.Text], InvalidMessage: "Invalid Data"} ,
            IsArchived : {Validators: [Validators.MakeRequired(Validators.Boolean)], InvalidMessage: "Invalid IsArchived"} 
    },

    UpdateSessionNameBySessionKey : {
            sessionKey : {Validators: [Validators.Text], InvalidMessage: "Invalid sessionKey"} ,
            sessionName : {Validators: [Validators.Text], InvalidMessage: "Invalid sessionName"} 
    },

    UpdateSessionProviderSelectionBySessionKey : {
            sessionKey : {Validators: [Validators.Text], InvalidMessage: "Invalid sessionKey"} ,
            provider : {Validators: [Validators.Text], InvalidMessage: "Invalid provider"} ,
            modelName : {Validators: [Validators.Text], InvalidMessage: "Invalid modelName"} ,
            reasoningLevel : {Validators: [Validators.Text], InvalidMessage: "Invalid reasoningLevel"} ,
            transport : {Validators: [Validators.Text], InvalidMessage: "Invalid transport"} 
    }
};

if (typeof Sessions === "undefined")
{
	// Create a global instance for backward compatibility with original usage
	var Sessions = new SessionsService();
}
    