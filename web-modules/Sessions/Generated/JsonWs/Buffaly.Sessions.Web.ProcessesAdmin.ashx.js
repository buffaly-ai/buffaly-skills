if (typeof window === "undefined" || typeof window.ProcessesAdminValidatorsFields !== "object") {
	var ProcessesAdminValidatorsFields = {};
} else {
	var ProcessesAdminValidatorsFields = window.ProcessesAdminValidatorsFields;
}
if (!ProcessesAdminValidatorsFields.hasOwnProperty("ProcessID")) ProcessesAdminValidatorsFields.ProcessID = {Validators : [Validators.Text], InvalidMessage: "Invalid ProcessID"};
class ProcessesAdminService {
    constructor({ baseUrl = "/api/buffaly.sessions.web/processes-admin", authToken = null } = {}) { this.Url = baseUrl; this.AuthToken = authToken; }
    _validate(oObject, validatorSchema, onValidationErrorCallback) { if (oObject.IsValidated == null || !oObject.IsValidated) { if (!Validators.Validate(oObject, validatorSchema)) { var oError = { Error: "Invalid data", Data: oObject }; if (onValidationErrorCallback != null) onValidationErrorCallback(oError); else if (Page.HandleValidationErrors) Page.HandleValidationErrors(oError); throw "Invalid data"; } } }
    GetGridHtml(Search,SortColumn,SortAscending,SkipRows,NumRows,Callback){ return this.GetGridHtmlObject({ Search,SortColumn,SortAscending,SkipRows,NumRows }, Callback); }
    GetGridHtmlObject(oObject, Callback){ this._validate(oObject, ProcessesAdminValidators.GetGridHtml, this.GetGridHtml.onValidationError); return this._invoke(this.Url + "/get-grid-html", "GetGridHtml", oObject, this.GetGridHtml, Callback); }
    GetGridCount(Search,SortColumn,SortAscending,SkipRows,NumRows,Callback){ return this.GetGridCountObject({ Search,SortColumn,SortAscending,SkipRows,NumRows }, Callback); }
    GetGridCountObject(oObject, Callback){ this._validate(oObject, ProcessesAdminValidators.GetGridCount, this.GetGridCount.onValidationError); return this._invoke(this.Url + "/get-grid-count", "GetGridCount", oObject, this.GetGridCount, Callback); }
    GetDetails(ProcessID, Callback){ return this.GetDetailsObject({ ProcessID }, Callback); }
    GetDetailsObject(oObject, Callback){ this._validate(oObject, ProcessesAdminValidators.GetDetails, this.GetDetails.onValidationError); return this._invoke(this.Url + "/get-details", "GetDetails", oObject, this.GetDetails, Callback); }
    GetEdit(ProcessID, Callback){ return this.GetEditObject({ ProcessID }, Callback); }
    GetEditObject(oObject, Callback){ this._validate(oObject, ProcessesAdminValidators.GetEdit, this.GetEdit.onValidationError); return this._invoke(this.Url + "/get-edit", "GetEdit", oObject, this.GetEdit, Callback); }
    GetInsert(Callback){ return this.GetInsertObject({}, Callback); }
    GetInsertObject(oObject, Callback){ return this._invoke(this.Url + "/get-insert", "GetInsert", oObject, this.GetInsert, Callback); }
    _invoke(pageUrl, methodName, params, methodConfig, Callback){ var initializer = { Page:pageUrl, Method:methodName, Params:params, Serialize:methodConfig.Serialize || {}, onDataReceived:Callback ? function(oRes){ Callback(oRes); } : null, onErrorReceived:(methodConfig.onErrorReceived != null ? methodConfig.onErrorReceived : (Page.HandleUnexpectedError ? Page.HandleUnexpectedError : null)) }; if (this.AuthToken) initializer.AuthToken = this.AuthToken; if (Callback) JsonMethod.callWithInitializer(initializer); else return JsonMethod.callSync(pageUrl, methodName, params, methodConfig.Serialize || {}); }}
var ProcessesAdminValidators = { GetGridHtml : { Search:{Validators:[Validators.Text]}, SortColumn:{Validators:[Validators.Text]}, SortAscending:{Validators:[Validators.Boolean]}, SkipRows:{Validators:[Validators.Integer]}, NumRows:{Validators:[Validators.Integer]} }, GetGridCount : { Search:{Validators:[Validators.Text]}, SortColumn:{Validators:[Validators.Text]}, SortAscending:{Validators:[Validators.Boolean]}, SkipRows:{Validators:[Validators.Integer]}, NumRows:{Validators:[Validators.Integer]} }, GetDetails : { ProcessID:ProcessesAdminValidatorsFields.ProcessID }, GetEdit : { ProcessID:ProcessesAdminValidatorsFields.ProcessID } };
var ProcessesAdmin = new ProcessesAdminService();
