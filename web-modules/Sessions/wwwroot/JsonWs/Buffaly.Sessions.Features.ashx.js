
    	    	
var FeaturesValidatorsFields = {
	
		Data : {Validators : [Validators.Data], InvalidMessage: "Invalid Data. " + ValidatorDescriptions.Length(1) },
		Settings : {Validators : [Validators.Data], InvalidMessage: "Invalid Settings. " + ValidatorDescriptions.Length(1) },
		NumRows : {Validators : [Validators.Integer], InvalidMessage: "Invalid NumRows. " + ValidatorDescriptions.Integer() },
		Search : {Validators : [Validators.String], InvalidMessage: "Invalid Search. " + ValidatorDescriptions.Length(1, 255) },
		SortColumn : {Validators : [Validators.String], InvalidMessage: "Invalid SortColumn. " + ValidatorDescriptions.Length(1, 255) },
		SortAscending : {Validators : [Validators.Boolean], InvalidMessage: "Invalid SortAscending. " + ValidatorDescriptions.Boolean() },
		jsonObject : {Validators : [Validators.Object], InvalidMessage: "Invalid jsonObject. " + ValidatorDescriptions.Object() },
		Version : {Validators : [Validators.String], InvalidMessage: "Invalid Version. " + ValidatorDescriptions.Length(1, 255) },
		FeatureID : {Validators : [Validators.ID], InvalidMessage: "Invalid Feature ID. " + ValidatorDescriptions.ID() },
		FeatureName : {Validators : [Validators.String], InvalidMessage: "Invalid Feature Name. " + ValidatorDescriptions.Length(1, 255) },
		IsEnabled : {Validators : [Validators.Boolean], InvalidMessage: "Invalid Enabled. " + ValidatorDescriptions.Boolean() },
		SettingsAssembly : {Validators : [Validators.String], InvalidMessage: "Invalid Settings Assembly. " + ValidatorDescriptions.Length(1, 255) },
		SettingsClass : {Validators : [Validators.String], InvalidMessage: "Invalid Settings Class. " + ValidatorDescriptions.Length(1, 255) },
		SkipRows : {Validators : [Validators.Integer], InvalidMessage: "Invalid SkipRows. " + ValidatorDescriptions.Integer() }	
}
		
class FeaturesService {
    constructor({ baseUrl = "/api/buffaly.sessions/features", authToken = null } = {}) {
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


    CopyFeature(FeatureID, Callback) {
        return this.CopyFeatureObject({ FeatureID:FeatureID }, Callback);
    }

    CopyFeatureObject(oObject, Callback) {
        this._validate(oObject, FeaturesValidators.CopyFeature, this.CopyFeature.onValidationError);

        var pageUrl = this.Url + "/copy-feature";
        return this._invoke(
            pageUrl,
            "CopyFeature",
            { FeatureID: oObject.FeatureID },
            this.CopyFeature,
            Callback
        );
    }

    async CopyFeatureAsync(FeatureID) {
        return await ObjectUtil.Promisify(
            this,
            this.CopyFeature,
            [ FeatureID ]
        );
    }

    async CopyFeatureObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.CopyFeatureObject,
            [ oObject ]
        );
    }

    ExportFeature(FeatureID, Callback) {
        return this.ExportFeatureObject({ FeatureID:FeatureID }, Callback);
    }

    ExportFeatureObject(oObject, Callback) {
        this._validate(oObject, FeaturesValidators.ExportFeature, this.ExportFeature.onValidationError);

        var pageUrl = this.Url + "/export-feature";
        return this._invoke(
            pageUrl,
            "ExportFeature",
            { FeatureID: oObject.FeatureID },
            this.ExportFeature,
            Callback
        );
    }

    async ExportFeatureAsync(FeatureID) {
        return await ObjectUtil.Promisify(
            this,
            this.ExportFeature,
            [ FeatureID ]
        );
    }

    async ExportFeatureObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.ExportFeatureObject,
            [ oObject ]
        );
    }

    GetFeature(FeatureID, Callback) {
        return this.GetFeatureObject({ FeatureID:FeatureID }, Callback);
    }

    GetFeatureObject(oObject, Callback) {
        this._validate(oObject, FeaturesValidators.GetFeature, this.GetFeature.onValidationError);

        var pageUrl = this.Url + "/get-feature";
        return this._invoke(
            pageUrl,
            "GetFeature",
            { FeatureID: oObject.FeatureID },
            this.GetFeature,
            Callback
        );
    }

    async GetFeatureAsync(FeatureID) {
        return await ObjectUtil.Promisify(
            this,
            this.GetFeature,
            [ FeatureID ]
        );
    }

    async GetFeatureObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetFeatureObject,
            [ oObject ]
        );
    }

    GetFeatureByFeatureName(FeatureName, Callback) {
        return this.GetFeatureByFeatureNameObject({ FeatureName:FeatureName }, Callback);
    }

    GetFeatureByFeatureNameObject(oObject, Callback) {
        this._validate(oObject, FeaturesValidators.GetFeatureByFeatureName, this.GetFeatureByFeatureName.onValidationError);

        var pageUrl = this.Url + "/get-feature-by-feature-name";
        return this._invoke(
            pageUrl,
            "GetFeatureByFeatureName",
            { FeatureName: oObject.FeatureName },
            this.GetFeatureByFeatureName,
            Callback
        );
    }

    async GetFeatureByFeatureNameAsync(FeatureName) {
        return await ObjectUtil.Promisify(
            this,
            this.GetFeatureByFeatureName,
            [ FeatureName ]
        );
    }

    async GetFeatureByFeatureNameObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetFeatureByFeatureNameObject,
            [ oObject ]
        );
    }

    GetFeatures(Callback) {
        return this.GetFeaturesObject({  }, Callback);
    }

    GetFeaturesObject(oObject, Callback) {
        this._validate(oObject, FeaturesValidators.GetFeatures, this.GetFeatures.onValidationError);

        var pageUrl = this.Url + "/get-features";
        return this._invoke(
            pageUrl,
            "GetFeatures",
            {  },
            this.GetFeatures,
            Callback
        );
    }

    async GetFeaturesAsync() {
        return await ObjectUtil.Promisify(
            this,
            this.GetFeatures,
            [  ]
        );
    }

    async GetFeaturesObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetFeaturesObject,
            [ oObject ]
        );
    }

    GetFeaturesSp_PagingSp(Search, SortColumn, SortAscending, SkipRows, NumRows, Callback) {
        return this.GetFeaturesSp_PagingSpObject({ Search:Search,SortColumn:SortColumn,SortAscending:SortAscending,SkipRows:SkipRows,NumRows:NumRows }, Callback);
    }

    GetFeaturesSp_PagingSpObject(oObject, Callback) {
        this._validate(oObject, FeaturesValidators.GetFeaturesSp_PagingSp, this.GetFeaturesSp_PagingSp.onValidationError);

        var pageUrl = this.Url + "/get-features-sp-_-paging-sp";
        return this._invoke(
            pageUrl,
            "GetFeaturesSp_PagingSp",
            { Search: oObject.Search,SortColumn: oObject.SortColumn,SortAscending: oObject.SortAscending,SkipRows: oObject.SkipRows,NumRows: oObject.NumRows },
            this.GetFeaturesSp_PagingSp,
            Callback
        );
    }

    async GetFeaturesSp_PagingSpAsync(Search,SortColumn,SortAscending,SkipRows,NumRows) {
        return await ObjectUtil.Promisify(
            this,
            this.GetFeaturesSp_PagingSp,
            [ Search,SortColumn,SortAscending,SkipRows,NumRows ]
        );
    }

    async GetFeaturesSp_PagingSpObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetFeaturesSp_PagingSpObject,
            [ oObject ]
        );
    }

    ImportFeature(jsonObject, Callback) {
        return this.ImportFeatureObject({ jsonObject:jsonObject }, Callback);
    }

    ImportFeatureObject(oObject, Callback) {
        this._validate(oObject, FeaturesValidators.ImportFeature, this.ImportFeature.onValidationError);

        var pageUrl = this.Url + "/import-feature";
        return this._invoke(
            pageUrl,
            "ImportFeature",
            { jsonObject: oObject.jsonObject },
            this.ImportFeature,
            Callback
        );
    }

    async ImportFeatureAsync(jsonObject) {
        return await ObjectUtil.Promisify(
            this,
            this.ImportFeature,
            [ jsonObject ]
        );
    }

    async ImportFeatureObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.ImportFeatureObject,
            [ oObject ]
        );
    }

    InsertFeature(FeatureName, Version, IsEnabled, SettingsAssembly, SettingsClass, Settings, Data, Callback) {
        return this.InsertFeatureObject({ FeatureName:FeatureName,Version:Version,IsEnabled:IsEnabled,SettingsAssembly:SettingsAssembly,SettingsClass:SettingsClass,Settings:Settings,Data:Data }, Callback);
    }

    InsertFeatureObject(oObject, Callback) {
        this._validate(oObject, FeaturesValidators.InsertFeature, this.InsertFeature.onValidationError);

        var pageUrl = this.Url + "/insert-feature";
        return this._invoke(
            pageUrl,
            "InsertFeature",
            { FeatureName: oObject.FeatureName,Version: oObject.Version,IsEnabled: oObject.IsEnabled,SettingsAssembly: oObject.SettingsAssembly,SettingsClass: oObject.SettingsClass,Settings: oObject.Settings,Data: oObject.Data },
            this.InsertFeature,
            Callback
        );
    }

    async InsertFeatureAsync(FeatureName,Version,IsEnabled,SettingsAssembly,SettingsClass,Settings,Data) {
        return await ObjectUtil.Promisify(
            this,
            this.InsertFeature,
            [ FeatureName,Version,IsEnabled,SettingsAssembly,SettingsClass,Settings,Data ]
        );
    }

    async InsertFeatureObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.InsertFeatureObject,
            [ oObject ]
        );
    }

    MarkFeatureAsEnabled(FeatureID, Callback) {
        return this.MarkFeatureAsEnabledObject({ FeatureID:FeatureID }, Callback);
    }

    MarkFeatureAsEnabledObject(oObject, Callback) {
        this._validate(oObject, FeaturesValidators.MarkFeatureAsEnabled, this.MarkFeatureAsEnabled.onValidationError);

        var pageUrl = this.Url + "/mark-feature-as-enabled";
        return this._invoke(
            pageUrl,
            "MarkFeatureAsEnabled",
            { FeatureID: oObject.FeatureID },
            this.MarkFeatureAsEnabled,
            Callback
        );
    }

    async MarkFeatureAsEnabledAsync(FeatureID) {
        return await ObjectUtil.Promisify(
            this,
            this.MarkFeatureAsEnabled,
            [ FeatureID ]
        );
    }

    async MarkFeatureAsEnabledObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.MarkFeatureAsEnabledObject,
            [ oObject ]
        );
    }

    MarkFeatureAsNotEnabled(FeatureID, Callback) {
        return this.MarkFeatureAsNotEnabledObject({ FeatureID:FeatureID }, Callback);
    }

    MarkFeatureAsNotEnabledObject(oObject, Callback) {
        this._validate(oObject, FeaturesValidators.MarkFeatureAsNotEnabled, this.MarkFeatureAsNotEnabled.onValidationError);

        var pageUrl = this.Url + "/mark-feature-as-not-enabled";
        return this._invoke(
            pageUrl,
            "MarkFeatureAsNotEnabled",
            { FeatureID: oObject.FeatureID },
            this.MarkFeatureAsNotEnabled,
            Callback
        );
    }

    async MarkFeatureAsNotEnabledAsync(FeatureID) {
        return await ObjectUtil.Promisify(
            this,
            this.MarkFeatureAsNotEnabled,
            [ FeatureID ]
        );
    }

    async MarkFeatureAsNotEnabledObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.MarkFeatureAsNotEnabledObject,
            [ oObject ]
        );
    }

    RemoveFeature(FeatureID, Callback) {
        return this.RemoveFeatureObject({ FeatureID:FeatureID }, Callback);
    }

    RemoveFeatureObject(oObject, Callback) {
        this._validate(oObject, FeaturesValidators.RemoveFeature, this.RemoveFeature.onValidationError);

        var pageUrl = this.Url + "/remove-feature";
        return this._invoke(
            pageUrl,
            "RemoveFeature",
            { FeatureID: oObject.FeatureID },
            this.RemoveFeature,
            Callback
        );
    }

    async RemoveFeatureAsync(FeatureID) {
        return await ObjectUtil.Promisify(
            this,
            this.RemoveFeature,
            [ FeatureID ]
        );
    }

    async RemoveFeatureObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.RemoveFeatureObject,
            [ oObject ]
        );
    }

    UpdateFeature(FeatureID, FeatureName, Version, IsEnabled, SettingsAssembly, SettingsClass, Settings, Data, Callback) {
        return this.UpdateFeatureObject({ FeatureID:FeatureID,FeatureName:FeatureName,Version:Version,IsEnabled:IsEnabled,SettingsAssembly:SettingsAssembly,SettingsClass:SettingsClass,Settings:Settings,Data:Data }, Callback);
    }

    UpdateFeatureObject(oObject, Callback) {
        this._validate(oObject, FeaturesValidators.UpdateFeature, this.UpdateFeature.onValidationError);

        var pageUrl = this.Url + "/update-feature";
        return this._invoke(
            pageUrl,
            "UpdateFeature",
            { FeatureID: oObject.FeatureID,FeatureName: oObject.FeatureName,Version: oObject.Version,IsEnabled: oObject.IsEnabled,SettingsAssembly: oObject.SettingsAssembly,SettingsClass: oObject.SettingsClass,Settings: oObject.Settings,Data: oObject.Data },
            this.UpdateFeature,
            Callback
        );
    }

    async UpdateFeatureAsync(FeatureID,FeatureName,Version,IsEnabled,SettingsAssembly,SettingsClass,Settings,Data) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateFeature,
            [ FeatureID,FeatureName,Version,IsEnabled,SettingsAssembly,SettingsClass,Settings,Data ]
        );
    }

    async UpdateFeatureObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateFeatureObject,
            [ oObject ]
        );
    }

    UpdateFeatureData(FeatureID, Data, Callback) {
        return this.UpdateFeatureDataObject({ FeatureID:FeatureID,Data:Data }, Callback);
    }

    UpdateFeatureDataObject(oObject, Callback) {
        this._validate(oObject, FeaturesValidators.UpdateFeatureData, this.UpdateFeatureData.onValidationError);

        var pageUrl = this.Url + "/update-feature-data";
        return this._invoke(
            pageUrl,
            "UpdateFeatureData",
            { FeatureID: oObject.FeatureID,Data: oObject.Data },
            this.UpdateFeatureData,
            Callback
        );
    }

    async UpdateFeatureDataAsync(FeatureID,Data) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateFeatureData,
            [ FeatureID,Data ]
        );
    }

    async UpdateFeatureDataObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateFeatureDataObject,
            [ oObject ]
        );
    }

    UpdateFeatureSettings(FeatureID, Settings, Callback) {
        return this.UpdateFeatureSettingsObject({ FeatureID:FeatureID,Settings:Settings }, Callback);
    }

    UpdateFeatureSettingsObject(oObject, Callback) {
        this._validate(oObject, FeaturesValidators.UpdateFeatureSettings, this.UpdateFeatureSettings.onValidationError);

        var pageUrl = this.Url + "/update-feature-settings";
        return this._invoke(
            pageUrl,
            "UpdateFeatureSettings",
            { FeatureID: oObject.FeatureID,Settings: oObject.Settings },
            this.UpdateFeatureSettings,
            Callback
        );
    }

    async UpdateFeatureSettingsAsync(FeatureID,Settings) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateFeatureSettings,
            [ FeatureID,Settings ]
        );
    }

    async UpdateFeatureSettingsObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.UpdateFeatureSettingsObject,
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

var FeaturesValidators = {
    

    CopyFeature : {
            FeatureID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid FeatureID"} 
    },

    ExportFeature : {
            FeatureID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid FeatureID"} 
    },

    GetFeature : {
            FeatureID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid FeatureID"} 
    },

    GetFeatureByFeatureName : {
            FeatureName : {Validators: [Validators.Text], InvalidMessage: "Invalid FeatureName"} 
    },

    GetFeatures : {
    },

    GetFeaturesSp_PagingSp : {
            Search : {Validators: [Validators.Text], InvalidMessage: "Invalid Search"} ,
            SortColumn : {Validators: [Validators.Text], InvalidMessage: "Invalid SortColumn"} ,
            SortAscending : {Validators: [Validators.MakeRequired(Validators.Boolean)], InvalidMessage: "Invalid SortAscending"} ,
            SkipRows : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid SkipRows"} ,
            NumRows : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid NumRows"} 
    },

    ImportFeature : {
            jsonObject : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid jsonObject"} 
    },

    InsertFeature : {
            FeatureName : {Validators: [Validators.Text], InvalidMessage: "Invalid FeatureName"} ,
            Version : {Validators: [Validators.Text], InvalidMessage: "Invalid Version"} ,
            IsEnabled : {Validators: [Validators.MakeRequired(Validators.Boolean)], InvalidMessage: "Invalid IsEnabled"} ,
            SettingsAssembly : {Validators: [Validators.Text], InvalidMessage: "Invalid SettingsAssembly"} ,
            SettingsClass : {Validators: [Validators.Text], InvalidMessage: "Invalid SettingsClass"} ,
            Settings : {Validators: [Validators.Text], InvalidMessage: "Invalid Settings"} ,
            Data : {Validators: [Validators.Text], InvalidMessage: "Invalid Data"} 
    },

    MarkFeatureAsEnabled : {
            FeatureID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid FeatureID"} 
    },

    MarkFeatureAsNotEnabled : {
            FeatureID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid FeatureID"} 
    },

    RemoveFeature : {
            FeatureID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid FeatureID"} 
    },

    UpdateFeature : {
            FeatureID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid FeatureID"} ,
            FeatureName : {Validators: [Validators.Text], InvalidMessage: "Invalid FeatureName"} ,
            Version : {Validators: [Validators.Text], InvalidMessage: "Invalid Version"} ,
            IsEnabled : {Validators: [Validators.MakeRequired(Validators.Boolean)], InvalidMessage: "Invalid IsEnabled"} ,
            SettingsAssembly : {Validators: [Validators.Text], InvalidMessage: "Invalid SettingsAssembly"} ,
            SettingsClass : {Validators: [Validators.Text], InvalidMessage: "Invalid SettingsClass"} ,
            Settings : {Validators: [Validators.Text], InvalidMessage: "Invalid Settings"} ,
            Data : {Validators: [Validators.Text], InvalidMessage: "Invalid Data"} 
    },

    UpdateFeatureData : {
            FeatureID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid FeatureID"} ,
            Data : {Validators: [Validators.Text], InvalidMessage: "Invalid Data"} 
    },

    UpdateFeatureSettings : {
            FeatureID : {Validators: [Validators.MakeRequired(Validators.Integer)], InvalidMessage: "Invalid FeatureID"} ,
            Settings : {Validators: [Validators.Text], InvalidMessage: "Invalid Settings"} 
    }
};

if (typeof Features === "undefined")
{
	// Create a global instance for backward compatibility with original usage
	var Features = new FeaturesService();
}
    