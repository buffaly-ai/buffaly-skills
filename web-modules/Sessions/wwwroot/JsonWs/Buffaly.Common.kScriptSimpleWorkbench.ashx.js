

//To override these validators, define them in another file and include that file before this one
if (typeof(window) == "undefined" || !ObjectUtil.HasValue(window["kScriptSimpleWorkbenchValidatorsFields"])) {
	var kScriptSimpleWorkbenchValidatorsFields = { };
}

if (!ObjectUtil.HasValue(kScriptSimpleWorkbenchValidatorsFields.kScript)) {
	kScriptSimpleWorkbenchValidatorsFields.kScript = {Validators : [Validators.Text], InvalidMessage: "Invalid kScript"};
}
if (!ObjectUtil.HasValue(kScriptSimpleWorkbenchValidatorsFields.Handler)) {
	kScriptSimpleWorkbenchValidatorsFields.Handler = {Validators : [Validators.Text], InvalidMessage: "Invalid Handler"};
}

		
var kScriptSimpleWorkbench = {	
	Url : "/JsonWs/Buffaly.Common.kScriptSimpleWorkbench.ashx"

	,
	Evaluate : function(kScript, Handler, Callback) {
        return kScriptSimpleWorkbench.EvaluateObject({ kScript : kScript,Handler : Handler}, Callback);
    },

	EvaluateObject : function(oObject, Callback) {
        if (!ObjectUtil.HasValue(oObject.IsValidated) || !oObject.IsValidated)
        {
            if (!Validators.Validate(oObject, kScriptSimpleWorkbenchValidators.Evaluate)) {
				var oError = { Error: "Invalid data", Data: oObject };
				if (ObjectUtil.HasValue(kScriptSimpleWorkbench.Evaluate.onValidationError))
					kScriptSimpleWorkbench.Evaluate.onValidationError(oError)
					
				else if (Page.HandleValidationErrors)
					Page.HandleValidationErrors(oError);	
								
				throw "Invalid data";
            }
        }
        
        if (Callback)
        {
            JsonMethod.callWithInitializer({Page: kScriptSimpleWorkbench.Url, 
					Method : "Evaluate", 
					Params : { kScript : oObject.kScript,Handler : oObject.Handler}, 
					Serialize : kScriptSimpleWorkbench.Evaluate.Serialize || {},
					onDataReceived : Callback, 
					onErrorReceived : (ObjectUtil.HasValue(kScriptSimpleWorkbench.Evaluate.onErrorReceived) ? kScriptSimpleWorkbench.Evaluate.onErrorReceived : Page.HandleUnexpectedError) });
        }
        else
            return JsonMethod.callSync(kScriptSimpleWorkbench.Url, "Evaluate", { kScript : oObject.kScript,Handler : oObject.Handler}, kScriptSimpleWorkbench.Evaluate.Serialize || {});
    },
	Reset : function(Handler, Callback) {
        return kScriptSimpleWorkbench.ResetObject({ Handler : Handler}, Callback);
    },

	ResetObject : function(oObject, Callback) {
        if (!ObjectUtil.HasValue(oObject.IsValidated) || !oObject.IsValidated)
        {
            if (!Validators.Validate(oObject, kScriptSimpleWorkbenchValidators.Reset)) {
				var oError = { Error: "Invalid data", Data: oObject };
				if (ObjectUtil.HasValue(kScriptSimpleWorkbench.Reset.onValidationError))
					kScriptSimpleWorkbench.Reset.onValidationError(oError)
					
				else if (Page.HandleValidationErrors)
					Page.HandleValidationErrors(oError);	
								
				throw "Invalid data";
            }
        }
        
        if (Callback)
        {
            JsonMethod.callWithInitializer({Page: kScriptSimpleWorkbench.Url, 
					Method : "Reset", 
					Params : { Handler : oObject.Handler}, 
					Serialize : kScriptSimpleWorkbench.Reset.Serialize || {},
					onDataReceived : Callback, 
					onErrorReceived : (ObjectUtil.HasValue(kScriptSimpleWorkbench.Reset.onErrorReceived) ? kScriptSimpleWorkbench.Reset.onErrorReceived : Page.HandleUnexpectedError) });
        }
        else
            return JsonMethod.callSync(kScriptSimpleWorkbench.Url, "Reset", { Handler : oObject.Handler}, kScriptSimpleWorkbench.Reset.Serialize || {});
    }
};

var kScriptSimpleWorkbenchValidators = {
	

	Evaluate : {
			kScript : kScriptSimpleWorkbenchValidatorsFields.kScript,
			Handler : kScriptSimpleWorkbenchValidatorsFields.Handler	
	},

	Reset : {
			Handler : kScriptSimpleWorkbenchValidatorsFields.Handler	
	}
};

    