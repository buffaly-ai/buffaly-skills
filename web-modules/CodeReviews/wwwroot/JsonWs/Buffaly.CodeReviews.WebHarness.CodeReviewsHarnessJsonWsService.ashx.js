class CodeReviewsHarnessJsonWsServiceService {
  constructor({ baseUrl = "/api/buffaly.codereviews.webharness/code-reviews-harness-json-ws-service", authToken = null } = {}) {
    this.Url = baseUrl;
    this.AuthToken = authToken;
  }
  GetAgentTargetSettings(request, Callback, ErrorCallback) { return this._invokeWrap("get-agent-target-settings", "GetAgentTargetSettings", request, Callback, ErrorCallback); }
  async GetAgentTargetSettingsAsync(request) { return await this.GetAgentTargetSettings(request || {}); }
  SaveAgentTargetSettings(request, Callback, ErrorCallback) { return this._invokeWrap("save-agent-target-settings", "SaveAgentTargetSettings", request, Callback, ErrorCallback); }
  async SaveAgentTargetSettingsAsync(request) { return await this.SaveAgentTargetSettings(request); }
  GetRecentAgentSessions(request, Callback, ErrorCallback) { return this._invokeWrap("get-recent-agent-sessions", "GetRecentAgentSessions", request, Callback, ErrorCallback); }
  async GetRecentAgentSessionsAsync(request) { return await this.GetRecentAgentSessions(request); }
  QueueAgentInput(request, Callback, ErrorCallback) { return this._invokeWrap("queue-agent-input", "QueueAgentInput", request, Callback, ErrorCallback); }
  async QueueAgentInputAsync(request) { return await this.QueueAgentInput(request); }
  GetRepositoryActivity(request, Callback, ErrorCallback) { return this._invokeWrap("get-repository-activity", "GetRepositoryActivity", request, Callback, ErrorCallback); }
  async GetRepositoryActivityAsync(request) { return await this.GetRepositoryActivity(request); }
  GetWorktreeStatuses(request, Callback, ErrorCallback) { return this._invokeWrap("get-worktree-statuses", "GetWorktreeStatuses", request, Callback, ErrorCallback); }
  async GetWorktreeStatusesAsync(request) { return await this.GetWorktreeStatuses(request); }
  GetCheckIns(request, Callback, ErrorCallback) { return this._invokeWrap("get-check-ins", "GetCheckIns", request, Callback, ErrorCallback); }
  async GetCheckInsAsync(request) { return await this.GetCheckIns(request); }
  SetCheckInReviewed(request, Callback, ErrorCallback) { return this._invokeWrap("set-check-in-reviewed", "SetCheckInReviewed", request, Callback, ErrorCallback); }
  async SetCheckInReviewedAsync(request) { return await this.SetCheckInReviewed(request); }
  GetCommitReview(request, Callback, ErrorCallback) { return this._invokeWrap("get-commit-review", "GetCommitReview", request, Callback, ErrorCallback); }
  async GetCommitReviewAsync(request) { return await this.GetCommitReview(request); }
  SubmitCommitReviewText(request, Callback, ErrorCallback) { return this._invokeWrap("submit-commit-review-text", "SubmitCommitReviewText", request, Callback, ErrorCallback); }
  async SubmitCommitReviewTextAsync(request) { return await this.SubmitCommitReviewText(request); }
  PushRepository(request, Callback, ErrorCallback) { return this._invokeWrap("push-repository", "PushRepository", request, Callback, ErrorCallback); }
  async PushRepositoryAsync(request) { return await this.PushRepository(request); }
  GetDiffSnapshot(request, Callback, ErrorCallback) { return this._invokeWrap("get-diff-snapshot", "GetDiffSnapshot", request, Callback, ErrorCallback); }
  async GetDiffSnapshotAsync(request) { return await this.GetDiffSnapshot(request); }
  TriggerCodeReviewAgent(request, Callback, ErrorCallback) { return this._invokeWrap("trigger-code-review-agent", "TriggerCodeReviewAgent", request, Callback, ErrorCallback); }
  async TriggerCodeReviewAgentAsync(request) { return await this.TriggerCodeReviewAgent(request); }
  GetFileContent(request, Callback, ErrorCallback) { return this._invokeWrap("get-file-content", "GetFileContent", request, Callback, ErrorCallback); }
  async GetFileContentAsync(request) { return await this.GetFileContent(request); }
  _invokeWrap(kebab, methodName, request, Callback, ErrorCallback) {
    return this._invoke(this.Url + "/" + kebab, methodName, { request: request || {} }, { Serialize: {} }, Callback, ErrorCallback);
  }
  _invoke(pageUrl, methodName, params, methodConfig, Callback, ErrorCallback) {
    var headers = { "Content-Type": "application/json" };
    if (this.AuthToken) headers.Authorization = "Bearer " + this.AuthToken;
    var promise = fetch(pageUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(params || {})
    }).then(function(response) {
      return response.text().then(function(body) {
        if (!response.ok) throw new Error(body || ("HTTP " + response.status));
        return body ? JSON.parse(body) : {};
      });
    });
    if (Callback) {
      promise.then(Callback).catch(function(error) {
        if (typeof ErrorCallback === "function") ErrorCallback(error);
        else if (window.Page && typeof window.Page.HandleUnexpectedError === "function") window.Page.HandleUnexpectedError(error);
        else throw error;
      });
      return;
    }
    return promise;
  }
}
if (typeof CodeReviewsHarnessJsonWsService === "undefined") { var CodeReviewsHarnessJsonWsService = new CodeReviewsHarnessJsonWsServiceService(); }
window.Buffaly = window.Buffaly || {};
window.Buffaly.CodeReviews = window.Buffaly.CodeReviews || {};
window.Buffaly.CodeReviews.WebHarness = window.Buffaly.CodeReviews.WebHarness || {};
window.Buffaly.CodeReviews.WebHarness.CodeReviewsHarnessJsonWsService = CodeReviewsHarnessJsonWsService;


