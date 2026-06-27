class CodeReviewsHarnessJsonWsServiceService {
  constructor({ baseUrl = "/api/buffaly.codereviews.webharness/code-reviews-harness-json-ws-service", authToken = null } = {}) {
    this.Url = baseUrl;
    this.AuthToken = authToken;
  }
  GetAgentTargetSettings(request, Callback, ErrorCallback) { return this._invokeWrap("get-agent-target-settings", "GetAgentTargetSettings", request, Callback, ErrorCallback); }
  async GetAgentTargetSettingsAsync(request) { return await ObjectUtil.Promisify(this, this.GetAgentTargetSettings, [request || {}]); }
  SaveAgentTargetSettings(request, Callback, ErrorCallback) { return this._invokeWrap("save-agent-target-settings", "SaveAgentTargetSettings", request, Callback, ErrorCallback); }
  async SaveAgentTargetSettingsAsync(request) { return await ObjectUtil.Promisify(this, this.SaveAgentTargetSettings, [request]); }
  GetRecentAgentSessions(request, Callback, ErrorCallback) { return this._invokeWrap("get-recent-agent-sessions", "GetRecentAgentSessions", request, Callback, ErrorCallback); }
  async GetRecentAgentSessionsAsync(request) { return await ObjectUtil.Promisify(this, this.GetRecentAgentSessions, [request]); }
  QueueAgentInput(request, Callback, ErrorCallback) { return this._invokeWrap("queue-agent-input", "QueueAgentInput", request, Callback, ErrorCallback); }
  async QueueAgentInputAsync(request) { return await ObjectUtil.Promisify(this, this.QueueAgentInput, [request]); }
  GetRepositoryActivity(request, Callback, ErrorCallback) { return this._invokeWrap("get-repository-activity", "GetRepositoryActivity", request, Callback, ErrorCallback); }
  async GetRepositoryActivityAsync(request) { return await ObjectUtil.Promisify(this, this.GetRepositoryActivity, [request]); }
  GetWorktreeStatuses(request, Callback, ErrorCallback) { return this._invokeWrap("get-worktree-statuses", "GetWorktreeStatuses", request, Callback, ErrorCallback); }
  async GetWorktreeStatusesAsync(request) { return await ObjectUtil.Promisify(this, this.GetWorktreeStatuses, [request]); }
  GetCheckIns(request, Callback, ErrorCallback) { return this._invokeWrap("get-check-ins", "GetCheckIns", request, Callback, ErrorCallback); }
  async GetCheckInsAsync(request) { return await ObjectUtil.Promisify(this, this.GetCheckIns, [request]); }
  SetCheckInReviewed(request, Callback, ErrorCallback) { return this._invokeWrap("set-check-in-reviewed", "SetCheckInReviewed", request, Callback, ErrorCallback); }
  async SetCheckInReviewedAsync(request) { return await ObjectUtil.Promisify(this, this.SetCheckInReviewed, [request]); }
  PushRepository(request, Callback, ErrorCallback) { return this._invokeWrap("push-repository", "PushRepository", request, Callback, ErrorCallback); }
  async PushRepositoryAsync(request) { return await ObjectUtil.Promisify(this, this.PushRepository, [request]); }
  GetDiffSnapshot(request, Callback, ErrorCallback) { return this._invokeWrap("get-diff-snapshot", "GetDiffSnapshot", request, Callback, ErrorCallback); }
  async GetDiffSnapshotAsync(request) { return await ObjectUtil.Promisify(this, this.GetDiffSnapshot, [request]); }
  GetFileContent(request, Callback, ErrorCallback) { return this._invokeWrap("get-file-content", "GetFileContent", request, Callback, ErrorCallback); }
  async GetFileContentAsync(request) { return await ObjectUtil.Promisify(this, this.GetFileContent, [request]); }
  _invokeWrap(kebab, methodName, request, Callback, ErrorCallback) {
    return this._invoke(this.Url + "/" + kebab, methodName, { request: request || {} }, { Serialize: {} }, Callback, ErrorCallback);
  }
  _invoke(pageUrl, methodName, params, methodConfig, Callback, ErrorCallback) {
    var errorHandler = typeof ErrorCallback === "function"
      ? ErrorCallback
      : (window.Page && typeof window.Page.HandleUnexpectedError === "function" ? window.Page.HandleUnexpectedError : null);
    var initializer = {
      Page: pageUrl,
      Method: methodName,
      Params: params,
      Serialize: methodConfig.Serialize || {},
      onDataReceived: Callback ? function(oRes) { Callback(oRes); } : null,
      onErrorReceived: errorHandler
    };
    if (this.AuthToken) initializer.AuthToken = this.AuthToken;
    if (Callback) JsonMethod.callWithInitializer(initializer);
    else return JsonMethod.callSync(pageUrl, methodName, params, methodConfig.Serialize || {});
  }
}
if (typeof CodeReviewsHarnessJsonWsService === "undefined") { var CodeReviewsHarnessJsonWsService = new CodeReviewsHarnessJsonWsServiceService(); }
window.Buffaly = window.Buffaly || {};
window.Buffaly.CodeReviews = window.Buffaly.CodeReviews || {};
window.Buffaly.CodeReviews.WebHarness = window.Buffaly.CodeReviews.WebHarness || {};
window.Buffaly.CodeReviews.WebHarness.CodeReviewsHarnessJsonWsService = CodeReviewsHarnessJsonWsService;

