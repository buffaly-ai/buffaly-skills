class OntologyWorkbenchServiceService {
  constructor({ baseUrl = "/api/buffaly.ontologyworkbench/ontology-workbench-service", authToken = null } = {}) { this.Url = baseUrl; this.AuthToken = authToken; }
  ExtractAndBind(request, Callback) { return this._invoke("extract-and-bind", "ExtractAndBind", request, Callback); }
  async ExtractAndBindAsync(request) { return await ObjectUtil.Promisify(this, this.ExtractAndBind, [request]); }
  Organize(request, Callback) { return this._invoke("organize", "Organize", request, Callback); }
  async OrganizeAsync(request) { return await ObjectUtil.Promisify(this, this.Organize, [request]); }
  PrepareAll(request, Callback) { return this._invoke("prepare-all", "PrepareAll", request, Callback); }
  async PrepareAllAsync(request) { return await ObjectUtil.Promisify(this, this.PrepareAll, [request]); }
  CreateAnnotationDocument(request, Callback) { return this._invoke("create-annotation-document", "CreateAnnotationDocument", request, Callback); }
  async CreateAnnotationDocumentAsync(request) { return await ObjectUtil.Promisify(this, this.CreateAnnotationDocument, [request]); }
  RenderAnnotatedText(request, Callback) { return this._invoke("render-annotated-text", "RenderAnnotatedText", request, Callback); }
  async RenderAnnotatedTextAsync(request) { return await ObjectUtil.Promisify(this, this.RenderAnnotatedText, [request]); }
  ApplyAnnotationEdit(request, Callback) { return this._invoke("apply-annotation-edit", "ApplyAnnotationEdit", request, Callback); }
  async ApplyAnnotationEditAsync(request) { return await ObjectUtil.Promisify(this, this.ApplyAnnotationEdit, [request]); }
  ApplyGroundingProposal(request, Callback) { return this._invoke("apply-grounding-proposal", "ApplyGroundingProposal", request, Callback); }
  async ApplyGroundingProposalAsync(request) { return await ObjectUtil.Promisify(this, this.ApplyGroundingProposal, [request]); }
  ApplyOrganizationProposal(request, Callback) { return this._invoke("apply-organization-proposal", "ApplyOrganizationProposal", request, Callback); }
  async ApplyOrganizationProposalAsync(request) { return await ObjectUtil.Promisify(this, this.ApplyOrganizationProposal, [request]); }
  _invoke(kebab, methodName, request, Callback) {
    const pageUrl = this.Url + "/" + kebab;
    const initializer = { Page: pageUrl, Method: methodName, Params: { request: request }, Serialize: {}, onDataReceived: Callback ? function (result) { Callback(result); } : null, onErrorReceived: (Page.HandleUnexpectedError ? Page.HandleUnexpectedError : null) };
    if (this.AuthToken) initializer.AuthToken = this.AuthToken;
    if (Callback) JsonMethod.callWithInitializer(initializer); else return JsonMethod.callSync(pageUrl, methodName, { request: request }, {});
  }
}
if (typeof OntologyWorkbenchService === "undefined") { var OntologyWorkbenchService = new OntologyWorkbenchServiceService(); }
