

// ensure we're in a browser context and the global object exists
if (typeof window === "undefined" || typeof window.DashboardAdminValidatorsFields !== "object") {
	var DashboardAdminValidatorsFields = {};
} else {
	// reuse the existing object created by an earlier script
	var DashboardAdminValidatorsFields = window.DashboardAdminValidatorsFields;
}



if (!DashboardAdminValidatorsFields.hasOwnProperty("EndDate")) {
	DashboardAdminValidatorsFields.EndDate = {Validators : [Validators.Text], InvalidMessage: "Invalid EndDate"};
}

if (!DashboardAdminValidatorsFields.hasOwnProperty("StartDate")) {
	DashboardAdminValidatorsFields.StartDate = {Validators : [Validators.Text], InvalidMessage: "Invalid StartDate"};
}



class DashboardAdminService {
    constructor({ baseUrl = "/api/buffaly.sessions.web/dashboard-admin", authToken = null } = {}) {
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


    GetBootstrap(Callback) {
        return this.GetBootstrapObject({  }, Callback);
    }

    GetBootstrapObject(oObject, Callback) {
        this._validate(oObject, DashboardAdminValidators.GetBootstrap, this.GetBootstrap.onValidationError);

        var pageUrl = this.Url + "/get-bootstrap";
        return this._invoke(
            pageUrl,
            "GetBootstrap",
            {  },
            this.GetBootstrap,
            Callback
        );
    }

    async GetBootstrapAsync() {
        return await ObjectUtil.Promisify(
            this,
            this.GetBootstrap,
            [  ]
        );
    }

    async GetBootstrapObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetBootstrapObject,
            [ oObject ]
        );
    }

    GetDashboard(Callback) {
        return this.GetDashboardObject({  }, Callback);
    }

    GetDashboardObject(oObject, Callback) {
        this._validate(oObject, DashboardAdminValidators.GetDashboard, this.GetDashboard.onValidationError);

        var pageUrl = this.Url + "/get-dashboard";
        return this._invoke(
            pageUrl,
            "GetDashboard",
            {  },
            this.GetDashboard,
            Callback
        );
    }

    async GetDashboardAsync() {
        return await ObjectUtil.Promisify(
            this,
            this.GetDashboard,
            [  ]
        );
    }

    async GetDashboardObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetDashboardObject,
            [ oObject ]
        );
    }

    GetLifetime(Callback) {
        return this.GetLifetimeObject({  }, Callback);
    }

    GetLifetimeObject(oObject, Callback) {
        this._validate(oObject, DashboardAdminValidators.GetLifetime, this.GetLifetime.onValidationError);

        var pageUrl = this.Url + "/get-lifetime";
        return this._invoke(
            pageUrl,
            "GetLifetime",
            {  },
            this.GetLifetime,
            Callback
        );
    }

    async GetLifetimeAsync() {
        return await ObjectUtil.Promisify(
            this,
            this.GetLifetime,
            [  ]
        );
    }

    async GetLifetimeObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetLifetimeObject,
            [ oObject ]
        );
    }

    GetRange(StartDate, EndDate, Callback) {
        return this.GetRangeObject({ StartDate:StartDate,EndDate:EndDate }, Callback);
    }

    GetRangeObject(oObject, Callback) {
        this._validate(oObject, DashboardAdminValidators.GetRange, this.GetRange.onValidationError);

        var pageUrl = this.Url + "/get-range";
        return this._invoke(
            pageUrl,
            "GetRange",
            { StartDate: oObject.StartDate,EndDate: oObject.EndDate },
            this.GetRange,
            Callback
        );
    }

    async GetRangeAsync(StartDate,EndDate) {
        return await ObjectUtil.Promisify(
            this,
            this.GetRange,
            [ StartDate,EndDate ]
        );
    }

    async GetRangeObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetRangeObject,
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
            onErrorReceived: (methodConfig.onErrorReceived != null ? methodConfig.onErrorReceived : (Page.HandleUnexpectedError ? Page.HandleUnexpectedError : null))
        };

        if (this.AuthToken) initializer.AuthToken = this.AuthToken;

        if (Callback) {
            JsonMethod.callWithInitializer(initializer);
        } else {
            return JsonMethod.callSync(pageUrl, methodName, params, methodConfig.Serialize || {});
        }
    }
}

var DashboardAdminValidators = {


    GetBootstrap : {
    },

    GetDashboard : {
    },

    GetLifetime : {
    },

    GetRange : {
            StartDate : {Validators: [Validators.Text], InvalidMessage: "Invalid StartDate"} ,
            EndDate : {Validators: [Validators.Text], InvalidMessage: "Invalid EndDate"}
    }
};

if (typeof DashboardAdmin === "undefined")
{
	// Create a global instance for backward compatibility with original usage
	var DashboardAdmin = new DashboardAdminService();
}

