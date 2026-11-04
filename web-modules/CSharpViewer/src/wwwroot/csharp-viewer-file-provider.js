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
    const artifactIdentityPath = context.Path.replace(/\\/g, "/");
    const query = new URLSearchParams({ path: context.Path, viewer: selectedViewer() });
    if (context.RootId) { query.set("root", context.RootId); query.set("project", context.ProjectPath || ""); }
    if (context.SessionKey) query.set("sessionKey", context.SessionKey);
    else if (/^artifacts\//.test(artifactIdentityPath)) query.set("sessionKey", new URLSearchParams(window.location.search).get("sessionKey") || "");
    const artifact = artifactIdentityPath.match(/\/data\/sessions\/([^/]+)\/(artifacts\/.+\.cs)$/i);
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
  let openPicker = null;
  function closePicker(restoreFocus) {
    if (!openPicker) return;
    const picker = openPicker; openPicker = null;
    picker.menu.classList.remove("show"); picker.trigger.setAttribute("aria-expanded", "false");
    if (restoreFocus) picker.trigger.focus();
  }
  function refreshPickers() {
    document.querySelectorAll('[data-csharp-viewer-choice]').forEach(button => {
      const checked = button.dataset.csharpViewerChoice === selectedViewer();
      button.setAttribute("aria-checked", String(checked));
      const label = (button.dataset.csharpViewerChoice === "source" ? "Source Viewer" : "Repository Viewer") + (checked ? " (default)" : "");
      if (button.textContent !== label) button.textContent = label;
    });
  }
  function attachPickers() {
    const timeline = document.getElementById("opsV2Messages");
    if (!timeline) return;
    timeline.querySelectorAll('a[href]').forEach(anchor => {
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== "/api/web-modules/CSharpViewer/open" || anchor.parentElement?.hasAttribute("data-csharp-viewer-picker")) return;
      const wrapper = document.createElement("span");
      wrapper.className = "dropdown d-inline-flex align-items-center";
      wrapper.setAttribute("data-csharp-viewer-picker", "");
      anchor.replaceWith(wrapper); wrapper.append(anchor);
      const trigger = document.createElement("button");
      trigger.type = "button"; trigger.className = "btn btn-link dropdown-toggle p-1 px-2 border-0";
      trigger.title = "Choose default viewer";
      trigger.setAttribute("aria-label", "Default viewer for " + anchor.textContent.trim());
      trigger.setAttribute("aria-haspopup", "menu"); trigger.setAttribute("aria-expanded", "false");
      const menu = document.createElement("span");
      menu.className = "dropdown-menu top-100 start-0"; menu.setAttribute("role", "menu"); menu.setAttribute("aria-label", "Default C# viewer");
      const choices = ["source", "repository"].map(value => {
        const button = document.createElement("button"); button.type = "button"; button.className = "dropdown-item";
        button.dataset.csharpViewerChoice = value; button.setAttribute("role", "menuitemradio"); button.tabIndex = -1;
        button.addEventListener("click", () => { window.localStorage.setItem(preferenceKey, value); updateLinks(); refreshPickers(); closePicker(true); });
        menu.append(button); return button;
      });
      const picker = { trigger, menu };
      function showPicker() { closePicker(false); openPicker = picker; refreshPickers(); menu.classList.add("show"); trigger.setAttribute("aria-expanded", "true"); choices.find(button => button.dataset.csharpViewerChoice === selectedViewer()).focus(); }
      trigger.addEventListener("click", () => { if (openPicker === picker) closePicker(false); else showPicker(); });
      trigger.addEventListener("keydown", event => { if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); showPicker(); } });
      menu.addEventListener("keydown", event => {
        if (event.key === "Escape") { event.preventDefault(); closePicker(true); }
        else if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); const current = choices.indexOf(document.activeElement); choices[(current + (event.key === "ArrowDown" ? 1 : choices.length - 1)) % choices.length].focus(); }
        else if (event.key === "Tab") closePicker(false);
      });
      wrapper.append(trigger, menu);
    });
    refreshPickers();
  }
  window.addEventListener("storage", event => { if (event.key === preferenceKey) { updateLinks(); refreshPickers(); } });
  document.addEventListener("click", event => { if (openPicker && !openPicker.trigger.parentElement.contains(event.target)) closePicker(false); });
  const timeline = document.getElementById("opsV2Messages");
  if (timeline) {
    attachPickers(); const observer = new MutationObserver(attachPickers);
    function observeTimeline() { observer.observe(timeline, { childList: true, subtree: true, attributes: true, attributeFilter: ["href"] }); }
    observeTimeline();
    window.addEventListener("pagehide", () => { observer.disconnect(); closePicker(false); });
    // BFCache restores this realm without rerunning startup. Reuse the single
    // observer and refresh defaults that may have changed while this page slept.
    window.addEventListener("pageshow", event => {
      if (!event.persisted) return;
      updateLinks(); attachPickers(); observeTimeline();
    });
  }
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
