
    	    	
var EmailDeliveriesValidatorsFields = {
		
}
		
class EmailDeliveriesService {
    constructor({ baseUrl = "/api/buffaly.emaildispatch/email-deliveries", authToken = null } = {}) {
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

var EmailDeliveriesValidators = {
    
};

if (typeof EmailDeliveries === "undefined")
{
	// Create a global instance for backward compatibility with original usage
	var EmailDeliveries = new EmailDeliveriesService();
}
    