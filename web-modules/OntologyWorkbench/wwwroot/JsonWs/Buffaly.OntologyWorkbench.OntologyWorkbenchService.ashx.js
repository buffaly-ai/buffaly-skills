class OntologyWorkbenchServiceService {
  constructor({ baseUrl = "/api/buffaly.ontologyworkbench/ontology-workbench-service", authToken = null } = {}) { this.Url = baseUrl; this.AuthToken = authToken; }
  ExtractAndBind(request, Callback) { return this._invoke("extract-and-bind", "ExtractAndBind", request, Callback); }
  async ExtractAndBindAsync(request) { return await ObjectUtil.Promisify(this, this.ExtractAndBind, [request]); }
  _invoke(kebab, methodName, request, Callback) {
    const pageUrl = this.Url + "/" + kebab;
    const initializer = { Page: pageUrl, Method: methodName, Params: { request: request }, Serialize: {}, onDataReceived: Callback ? function (result) { Callback(result); } : null, onErrorReceived: (Page.HandleUnexpectedError ? Page.HandleUnexpectedError : null) };
    if (this.AuthToken) initializer.AuthToken = this.AuthToken;
    if (Callback) JsonMethod.callWithInitializer(initializer); else return JsonMethod.callSync(pageUrl, methodName, { request: request }, {});
  }
}
if (typeof OntologyWorkbenchService === "undefined") { var OntologyWorkbenchService = new OntologyWorkbenchServiceService(); }
