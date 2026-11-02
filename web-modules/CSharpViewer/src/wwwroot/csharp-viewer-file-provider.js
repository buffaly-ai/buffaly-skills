(function () {
  "use strict";
  function registerProviders() {
  const registry = window.BuffalyFilePresentationProviders;
  if (!registry || typeof registry.register !== "function") throw new Error("CSharpViewer requires the shell file-presentation registry.");
  const preferenceKey = "buffaly.csharp-viewer.default";
  function selectedViewer() {
    const value = window.localStorage.getItem(preferenceKey) || "source";
    if (!["source", "repository"].includes(value)) throw new Error("The saved C# viewer selection is invalid.");
    return value;
  }
  function preferredLaunch(context) {
    const query = new URLSearchParams({ path: context.Path, viewer: selectedViewer() });
    if (context.RootId) { query.set("root", context.RootId); query.set("project", context.ProjectPath || ""); }
    if (context.SessionKey) query.set("sessionKey", context.SessionKey);
    else if (/^artifacts\//.test(context.Path)) query.set("sessionKey", new URLSearchParams(window.location.search).get("sessionKey") || "");
    const artifact = context.Path.replace(/\\/g, "/").match(/\/data\/sessions\/([^/]+)\/(artifacts\/.+\.cs)$/i);
    if (artifact) { query.set("sessionKey", artifact[1]); query.set("path", artifact[2]); }
    if (context.Line != null) query.set("line", context.Line);
    if (context.EndLine != null) query.set("endLine", context.EndLine);
    return { Url: "/api/web-modules/CSharpViewer/open?" + query.toString() };
  }
  registry.register({ id: "csharp-viewer-preference", priority: 5, canOpen: context => context.Extension === ".cs", buildLaunch: preferredLaunch });
  function updateLinks() {
    document.querySelectorAll('a[href]').forEach(anchor => {
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== "/api/web-modules/CSharpViewer/open") return;
      url.searchParams.set("viewer", selectedViewer());
      anchor.setAttribute("href", url.pathname + url.search);
    });
  }
  window.addEventListener("storage", event => { if (event.key === preferenceKey) { updateLinks(); document.querySelectorAll('[data-csharp-viewer-default]').forEach(select => { select.value = selectedViewer(); }); } });
  if (window.BuffalyAgentNextExtensions) window.BuffalyAgentNextExtensions.register({
    id: "csharp-viewer-default", slot: "sessionHeader.context", priority: 30,
    mount(context) {
      const label = document.createElement("label");
      label.append(document.createTextNode("C# viewer "));
      const select = document.createElement("select");
      select.className = "ops-v2-session-filter-select";
      select.setAttribute("data-csharp-viewer-default", "");
      select.setAttribute("aria-label", "Default C# viewer");
      for (const [value, text] of [["source", "Source Viewer"], ["repository", "Repository Viewer"]]) {
        const option = document.createElement("option"); option.value = value; option.textContent = text; select.append(option);
      }
      select.value = selectedViewer();
      select.addEventListener("change", () => { window.localStorage.setItem(preferenceKey, select.value); updateLinks(); });
      label.append(select); context.slotElement.append(label);
      return { dispose() { label.remove(); } };
    }
  });
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
  }
  // Installed extensions are parser-loaded before the deferred core bundle. Register
  // after that bundle has run, or immediately when the registry already exists.
  if (window.BuffalyFilePresentationProviders) registerProviders();
  else if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", registerProviders, { once: true });
  else registerProviders();
})();
