(function () {
  "use strict";
  if (!context || !context.root || !context.api) throw new Error("Interactive site context is required.");
  var config = window.GoogleAdsInteractiveSiteConfig || {};
  var status = context.root.querySelector("[data-role='status']");
  var host = context.root.querySelector("[data-role='module-host']");
  var title = context.root.querySelector("[data-role='title']");
  title.textContent = config.Title || "Google Ads";
  context.root.querySelector("[data-action='close']").addEventListener("click", function () {
    void context.api.exit({ Action: "done", SiteInstanceId: context.SiteInstanceId, Screen: config.Screen });
  });
  var loaderScript = document.createElement("script");
  loaderScript.src = "/js/web-modules/buffaly-web-module-loader.js";
  loaderScript.onload = function () {
    window.BuffalyWebModuleLoader.mount({
      host: host,
      moduleName: "GoogleAds",
      screen: config.Screen,
      interactive: true,
      component: config.Component,
      state: config.State || {}
    }).then(function () { status.hidden = true; }).catch(function (error) { status.textContent = error.message || String(error); });
  };
  loaderScript.onerror = function () { status.textContent = "The shared web module loader could not be loaded."; };
  document.head.appendChild(loaderScript);
}());