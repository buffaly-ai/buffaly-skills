class BrowserWorkbenchJsonWsServiceService {
  constructor({ baseUrl = "/api/buffaly.browser.webharness/browser-workbench-json-ws-service", authToken = null } = {}) {
    this.Url = baseUrl;
    this.AuthToken = authToken;
  }
  _validate(oObject, validatorSchema, onValidationErrorCallback) {
    if (oObject == null) oObject = {};
    if (oObject.IsValidated == null || !oObject.IsValidated) {
      if (!Validators.Validate(oObject, validatorSchema)) {
        var oError = { Error: "Invalid data", Data: oObject };
        if (onValidationErrorCallback != null) onValidationErrorCallback(oError);
        else if (Page.HandleValidationErrors) Page.HandleValidationErrors(oError);
        throw "Invalid data";
      }
    }
  }
  GetConfig(request, Callback) { return this._invokeWrap("get-config", "GetConfig", request, BrowserWorkbenchJsonWsServiceValidators.GetConfig, Callback); }
  async GetConfigAsync(request) { return await ObjectUtil.Promisify(this, this.GetConfig, [request]); }
  ListRuns(request, Callback) { return this._invokeWrap("list-runs", "ListRuns", request, BrowserWorkbenchJsonWsServiceValidators.ListRuns, Callback); }
  async ListRunsAsync(request) { return await ObjectUtil.Promisify(this, this.ListRuns, [request]); }
  GetRun(request, Callback) { return this._invokeWrap("get-run", "GetRun", request, BrowserWorkbenchJsonWsServiceValidators.GetRun, Callback); }
  async GetRunAsync(request) { return await ObjectUtil.Promisify(this, this.GetRun, [request]); }
  StartRun(request, Callback) { return this._invokeWrap("start-run", "StartRun", request, BrowserWorkbenchJsonWsServiceValidators.StartRun, Callback); }
  async StartRunAsync(request) { return await ObjectUtil.Promisify(this, this.StartRun, [request]); }
  InterruptRun(request, Callback) { return this._invokeWrap("interrupt-run", "InterruptRun", request, BrowserWorkbenchJsonWsServiceValidators.InterruptRun, Callback); }
  async InterruptRunAsync(request) { return await ObjectUtil.Promisify(this, this.InterruptRun, [request]); }
  _invokeWrap(kebab, methodName, request, validator, Callback) {
    this._validate(request, validator, null);
    return this._invoke(this.Url + "/" + kebab, methodName, { request: request }, { Serialize: {} }, Callback);
  }
  _invoke(pageUrl, methodName, params, methodConfig, Callback) {
    var initializer = { Page: pageUrl, Method: methodName, Params: params, Serialize: methodConfig.Serialize || {}, onDataReceived: Callback ? function(oRes) { Callback(oRes); } : null, onErrorReceived: (Page.HandleUnexpectedError ? Page.HandleUnexpectedError : null) };
    if (this.AuthToken) initializer.AuthToken = this.AuthToken;
    if (Callback) JsonMethod.callWithInitializer(initializer); else return JsonMethod.callSync(pageUrl, methodName, params, methodConfig.Serialize || {});
  }
}
var BrowserWorkbenchJsonWsServiceValidators = {
  GetConfig: { Reserved:{Validators:[Validators.Text],InvalidMessage:"Invalid Reserved",IsOptional:true} },
  ListRuns: { Reserved:{Validators:[Validators.Text],InvalidMessage:"Invalid Reserved",IsOptional:true} },
  GetRun: { RunId:{Validators:[Validators.Text],InvalidMessage:"Invalid RunId"} },
  StartRun: { Instruction:{Validators:[Validators.Text],InvalidMessage:"Invalid Instruction"}, Model:{Validators:[Validators.Text],InvalidMessage:"Invalid Model",IsOptional:true}, ProfileName:{Validators:[Validators.Text],InvalidMessage:"Invalid ProfileName",IsOptional:true}, MaxSteps:{Validators:[Validators.Integer],InvalidMessage:"Invalid MaxSteps",IsOptional:true} },
  InterruptRun: { RunId:{Validators:[Validators.Text],InvalidMessage:"Invalid RunId"} }
};
if (typeof BrowserWorkbenchJsonWsService === "undefined") { var BrowserWorkbenchJsonWsService = new BrowserWorkbenchJsonWsServiceService(); }
