(function () {
  "use strict";
  const registry = window.BuffalyFilePresentationProviders;
  if (!registry || typeof registry.register !== "function") return;
  function text(value) { return value == null ? "" : String(value).trim(); }
  function sessionLaunch(path) {
    const normalized = text(path).replace(/\\/g, "/");
    let sessionKey = "";
    let artifactPath = "";
    const absolute = normalized.match(/\/data\/sessions\/([^/]+)\/(artifacts\/.+\.cs)$/i);
    if (absolute) {
      sessionKey = absolute[1];
      artifactPath = absolute[2];
    } else if (/^artifacts\/[^/].*\.cs$/i.test(normalized)) {
      sessionKey = new URLSearchParams(window.location.search).get("sessionKey") || "";
      artifactPath = normalized;
    }
    if (!sessionKey || !artifactPath || artifactPath.split("/").some(segment => !segment || segment === "." || segment === "..")) return null;
    const query = new URLSearchParams({ sessionKey, file: artifactPath, version: "0.1.5" });
    return { Url: "/web-modules/CSharpViewer/?" + query.toString() };
  }
  registry.register({
    id: "csharp-viewer-session-artifact",
    priority: 20,
    canOpen: context => context.Extension === ".cs" && !!sessionLaunch(context.Path),
    buildLaunch: context => sessionLaunch(context.Path)
  });
})();