var ExtensionPublishingServiceService = (function(){
  const baseUrl = "/api/buffaly.extensionpublishing.webmodule/extension-publishing-service";
  async function post(method, payload){
    const response = await fetch(baseUrl + "/" + method, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload || {})
    });
    const text = await response.text();
    if(!response.ok) throw new Error(text || ("HTTP " + response.status));
    return text ? JSON.parse(text) : null;
  }
  function Service(){}
  Service.prototype.GetPublishingCatalogObjectAsync = function(o){ return post("get-publishing-catalog", o); };
  Service.prototype.GetPublishingCatalogAsync = function(request){ return this.GetPublishingCatalogObjectAsync({request:request}); };
  Service.prototype.GetExtensionPublishStatusObjectAsync = function(o){ return post("get-extension-publish-status", o); };
  Service.prototype.BuildExtensionObjectAsync = function(o){ return post("build-extension", o); };
  Service.prototype.PreviewPublishExtensionObjectAsync = function(o){ return post("preview-publish-extension", o); };
  Service.prototype.PublishExtensionObjectAsync = function(o){ return post("publish-extension", o); };
  return Service;
})();
var ExtensionPublishingService = new ExtensionPublishingServiceService();
globalThis.ExtensionPublishingServiceService = ExtensionPublishingServiceService;
globalThis.ExtensionPublishingService = ExtensionPublishingService;
