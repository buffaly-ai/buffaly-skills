(function () {
  "use strict";
  const registry = window.BuffalyFilePresentationProviders;
  if (!registry || typeof registry.register !== "function") return;
  function text(value) { return value == null ? "" : String(value).trim(); }
  function sessionLaunch(context) {
    const normalized = text(context.Path).replace(/\\/g, "/");
    let sessionKey = "";
    let artifactPath = "";
    const absolute = normalized.match(/\/data\/sessions\/([^/]+)\/(artifacts\/.+\.cs)$/i);
    if (absolute) {
      sessionKey = absolute[1];
      artifactPath = absolute[2];
    } else if (/^artifacts\/[^/].*\.cs$/i.test(normalized)) {
      sessionKey = context.SessionKey || new URLSearchParams(window.location.search).get("sessionKey") || "";
      artifactPath = normalized;
    }
    if (!sessionKey || !artifactPath || artifactPath.split("/").some(segment => !segment || segment === "." || segment === "..")) return null;
    const query = new URLSearchParams({ sessionKey, file: artifactPath });
    if (context.Line != null) query.set("line", context.Line);
    if (context.EndLine != null) query.set("endLine", context.EndLine);
    return { Url: "/web-modules/CSharpViewer/?" + query.toString() };
  }
  // Project links must carry the existing root ID and project-relative file contract; never guess from a basename.
  function projectLaunch(context) {
    if (!context.RootId) return null;
    const path = text(context.Path).replace(/\\/g, "/");
    const project = text(context.ProjectPath).replace(/\\/g, "/");
    function relative(value) { return !/^(?:\/|[a-z]:)/i.test(value) && !value.split("/").some(part => part === "." || part === ".." || /[\u0000-\u001f\u007f]/.test(part)); }
    if (!path || !relative(path) || !relative(project)) throw new Error("Project links require contained relative paths.");
    const query = new URLSearchParams({ root: context.RootId, project, file: path });
    if (context.Line != null) query.set("line", context.Line);
    if (context.EndLine != null) query.set("endLine", context.EndLine);
    return { Url: "/web-modules/CSharpViewer/?" + query.toString() };
  }
  registry.register({
    id: "csharp-viewer-session-artifact",
    priority: 20,
    canOpen: context => context.Extension === ".cs" && !!sessionLaunch(context),
    buildLaunch: sessionLaunch
  });
  registry.register({ id: "csharp-viewer-project", priority: 21,
    canOpen: context => !!context.RootId, buildLaunch: projectLaunch });
})();
