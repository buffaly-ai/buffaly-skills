

// ensure we're in a browser context and the global object exists
if (typeof window === "undefined" || typeof window.WikiServiceValidatorsFields !== "object") {
	var WikiServiceValidatorsFields = {};
} else {
	// reuse the existing object created by an earlier script
	var WikiServiceValidatorsFields = window.WikiServiceValidatorsFields;
}
	


if (!WikiServiceValidatorsFields.hasOwnProperty("request")) {
	WikiServiceValidatorsFields.request = {Validators : [Validators.Object], InvalidMessage: "Invalid request"};
}
	

	
class WikiServiceService {
    constructor({ baseUrl = "/api/buffaly.agent.wiki/wiki-service", authToken = null } = {}) {
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


    GetArticle(request, Callback) {
        return this.GetArticleObject({ request:request }, Callback);
    }

    GetArticleObject(oObject, Callback) {
        this._validate(oObject, WikiServiceValidators.GetArticle, this.GetArticle.onValidationError);

        var pageUrl = this.Url + "/get-article";
        return this._invoke(
            pageUrl,
            "GetArticle",
            { request: oObject.request },
            this.GetArticle,
            Callback
        );
    }

    async GetArticleAsync(request) {
        return await ObjectUtil.Promisify(
            this,
            this.GetArticle,
            [ request ]
        );
    }

    async GetArticleObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.GetArticleObject,
            [ oObject ]
        );
    }

    ListArticles(request, Callback) {
        return this.ListArticlesObject({ request:request }, Callback);
    }

    ListArticlesObject(oObject, Callback) {
        this._validate(oObject, WikiServiceValidators.ListArticles, this.ListArticles.onValidationError);

        var pageUrl = this.Url + "/list-articles";
        return this._invoke(
            pageUrl,
            "ListArticles",
            { request: oObject.request },
            this.ListArticles,
            Callback
        );
    }

    async ListArticlesAsync(request) {
        return await ObjectUtil.Promisify(
            this,
            this.ListArticles,
            [ request ]
        );
    }

    async ListArticlesObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.ListArticlesObject,
            [ oObject ]
        );
    }

    ResolveArticleRoute(request, Callback) {
        return this.ResolveArticleRouteObject({ request:request }, Callback);
    }

    ResolveArticleRouteObject(oObject, Callback) {
        this._validate(oObject, WikiServiceValidators.ResolveArticleRoute, this.ResolveArticleRoute.onValidationError);

        var pageUrl = this.Url + "/resolve-article-route";
        return this._invoke(
            pageUrl,
            "ResolveArticleRoute",
            { request: oObject.request },
            this.ResolveArticleRoute,
            Callback
        );
    }

    async ResolveArticleRouteAsync(request) {
        return await ObjectUtil.Promisify(
            this,
            this.ResolveArticleRoute,
            [ request ]
        );
    }

    async ResolveArticleRouteObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.ResolveArticleRouteObject,
            [ oObject ]
        );
    }

    SaveArticle(request, Callback) {
        return this.SaveArticleObject({ request:request }, Callback);
    }

    SaveArticleObject(oObject, Callback) {
        this._validate(oObject, WikiServiceValidators.SaveArticle, this.SaveArticle.onValidationError);

        var pageUrl = this.Url + "/save-article";
        return this._invoke(
            pageUrl,
            "SaveArticle",
            { request: oObject.request },
            this.SaveArticle,
            Callback
        );
    }

    async SaveArticleAsync(request) {
        return await ObjectUtil.Promisify(
            this,
            this.SaveArticle,
            [ request ]
        );
    }

    async SaveArticleObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.SaveArticleObject,
            [ oObject ]
        );
    }

    Search(request, Callback) {
        return this.SearchObject({ request:request }, Callback);
    }

    SearchObject(oObject, Callback) {
        this._validate(oObject, WikiServiceValidators.Search, this.Search.onValidationError);

        var pageUrl = this.Url + "/search";
        return this._invoke(
            pageUrl,
            "Search",
            { request: oObject.request },
            this.Search,
            Callback
        );
    }

    async SearchAsync(request) {
        return await ObjectUtil.Promisify(
            this,
            this.Search,
            [ request ]
        );
    }

    async SearchObjectAsync(oObject) {
        return await ObjectUtil.Promisify(
            this,
            this.SearchObject,
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

var WikiServiceValidators = {
    

    GetArticle : {
            request : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid request"} 
    },

    ListArticles : {
            request : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid request"} 
    },

    ResolveArticleRoute : {
            request : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid request"} 
    },

    SaveArticle : {
            request : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid request"} 
    },

    Search : {
            request : {Validators: [Validators.MakeRequired(Validators.Object)], InvalidMessage: "Invalid request"} 
    }
};

if (typeof WikiService === "undefined")
{
	// Create a global instance for backward compatibility with original usage
	var WikiService = new WikiServiceService();
}
    