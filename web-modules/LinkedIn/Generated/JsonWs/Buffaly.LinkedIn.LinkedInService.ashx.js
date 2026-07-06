class LinkedInServiceService {
	constructor({ baseUrl = "/api/buffaly.linkedin/linked-in-service", authToken = null } = {}) {
		this.Url = baseUrl;
		this.AuthToken = authToken;
	}
	GetAccountStatus(Callback) { return this._invoke(this.Url + "/get-account-status", "GetAccountStatus", {}, this.GetAccountStatus, Callback); }
	async GetAccountStatusAsync() { return await ObjectUtil.Promisify(this, this.GetAccountStatus, []); }
	GetLlmInfo(Callback) { return this._invoke(this.Url + "/get-llm-info", "GetLlmInfo", {}, this.GetLlmInfo, Callback); }
	async GetLlmInfoAsync() { return await ObjectUtil.Promisify(this, this.GetLlmInfo, []); }
	ImportExistingToken(tokenJsonPath, Callback) { return this._invoke(this.Url + "/import-existing-token", "ImportExistingToken", { tokenJsonPath: tokenJsonPath }, this.ImportExistingToken, Callback); }
	async ImportExistingTokenAsync(tokenJsonPath) { return await ObjectUtil.Promisify(this, this.ImportExistingToken, [tokenJsonPath]); }
	ListDrafts(status, Callback) { return this._invoke(this.Url + "/list-drafts", "ListDrafts", { status: status }, this.ListDrafts, Callback); }
	async ListDraftsAsync(status) { return await ObjectUtil.Promisify(this, this.ListDrafts, [status]); }
	_invoke(pageUrl, methodName, params, methodConfig, Callback) {
		var initializer = { Page: pageUrl, Method: methodName, Params: params, Serialize: {}, onDataReceived: Callback ? function(oRes) { Callback(oRes); } : null, onErrorReceived: (Page.HandleUnexpectedError ? Page.HandleUnexpectedError : null) };
		if (this.AuthToken) initializer.AuthToken = this.AuthToken;
		if (Callback) JsonMethod.callWithInitializer(initializer); else return JsonMethod.callSync(pageUrl, methodName, params, {});
	}
}
var LinkedInServiceValidators = {
	ImportExistingToken : { tokenJsonPath:{Validators:[Validators.Text],InvalidMessage:"Invalid tokenJsonPath",IsOptional:false} },
	ListDrafts : { status:{Validators:[Validators.Text],InvalidMessage:"Invalid status",IsOptional:true} }
};
