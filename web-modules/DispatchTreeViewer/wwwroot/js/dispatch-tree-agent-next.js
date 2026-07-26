(function () {
  "use strict";
  const api = window.BuffalyAgentNextExtensions;
  if (!api) return;
  let styleLoaded = false;
  const treeRequests = new Map();
  let cachedResponse = null;
  let cachedSessionKey = "";
  let loadInFlightKey = "";
  let cachedFileItems = null;
  let cachedFileItemsKey = "";

  function readTree(sessionKey, forceRefresh) {
    if (forceRefresh) treeRequests.delete(sessionKey);
    if (!treeRequests.has(sessionKey)) {
      let request = fetch("/api/web-modules/DispatchTreeViewer/tree?sessionKey=" + encodeURIComponent(sessionKey))
        .then(function (result) {
          if (!result.ok) throw new Error("Routing tree request failed (" + result.status + ").");
          return result.json();
        });
      request = request.finally(function () {
        if (treeRequests.get(sessionKey) === request) treeRequests.delete(sessionKey);
      });
      treeRequests.set(sessionKey, request);
    }
    return treeRequests.get(sessionKey);
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function ensureStyle() {
    if (styleLoaded) return;
    styleLoaded = true;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/web-modules/DispatchTreeViewer/css/dispatch-tree.css?v=0.6.0";
    document.head.appendChild(link);
  }

  function loadFileSourceItems(context) {
    if (cachedFileItems && cachedFileItemsKey === context.sessionKey) return cachedFileItems;
    if (loadInFlightKey === context.sessionKey) return null;
    loadInFlightKey = context.sessionKey;
    return readTree(context.sessionKey, false)
      .then(function (value) {
        if (!value || !value.providers || value.providers.length === 0) return null;
        cachedResponse = value;
        cachedSessionKey = context.sessionKey;
        cachedFileItems = value.providers.map(function (provider, index) {
          return {
            Name: provider.displayName || ("Routing Tree " + (index + 1)),
            Description: "View routing tree",
            Icon: "bi-diagram-3",
            Url: "/web-modules/DispatchTreeViewer/dispatch-tree-viewer.html?sessionKey=" + encodeURIComponent(context.sessionKey) + "&provider=" + index
          };
        });
        cachedFileItemsKey = context.sessionKey;
        return cachedFileItems;
     })
      .catch(function () { return null; })
      .finally(function () { if (loadInFlightKey === context.sessionKey) loadInFlightKey = ""; });
 }

  function openViewer(providerIndex) {
    if (!cachedResponse) return;
    const provider = cachedResponse.providers[providerIndex] || cachedResponse.providers[0];
    if (!provider) return;
    ensureStyle();
    var selectedNodeId = provider.rootNodeId;
    var filterText = "";
    var isFullscreen = false;

    var shade = element("div", "dtv-shade");
    var panel = element("section", "dtv-panel");
    var header = element("header", "dtv-header");
    var search = element("input", "dtv-search");
    var body = element("div", "dtv-body");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", provider.displayName);
    header.appendChild(element("h2", "dtv-title", provider.displayName));
    var headerIcon = element("span", "dtv-title-icon");
    headerIcon.innerHTML = "&#128218;";
    header.insertBefore(headerIcon, header.firstChild);

    var headerActions = element("div", "dtv-header-actions");
    var refreshBtn = element("button", "dtv-btn", "Refresh");
    var fullscreenBtn = element("button", "dtv-btn", "Fullscreen");
    var closeBtn = element("button", "dtv-btn", "Close");
    refreshBtn.type = "button";
    fullscreenBtn.type = "button";
    closeBtn.type = "button";
    refreshBtn.onclick = function () { shade.remove(); refreshAndReopen(providerIndex); };
    fullscreenBtn.onclick = function () { toggleFullscreen(); };
    closeBtn.onclick = function () { shade.remove(); };
    headerActions.append(refreshBtn, fullscreenBtn, closeBtn);
    header.append(headerActions);
    search.placeholder = "Filter labels, prototypes, destinations, semantic terms, or evidence";
    search.addEventListener("input", function () { filterText = search.value.toLowerCase(); renderBody(); });
    panel.append(header, search, body);
    shade.appendChild(panel);
    document.body.appendChild(shade);
    shade.addEventListener("click", function (event) { if (event.target === shade) shade.remove(); });

    function toggleFullscreen() {
      isFullscreen = !isFullscreen;
      if (isFullscreen) {
        panel.classList.add("dtv-fullscreen");
        fullscreenBtn.textContent = "Exit Fullscreen";
      } else {
        panel.classList.remove("dtv-fullscreen");
        fullscreenBtn.textContent = "Fullscreen";
      }
    }

    function renderBody() {
      body.replaceChildren();
      var treeCol = element("div", "dtv-tree");
      var detailsCol = element("div", "dtv-details");
      var byParent = new Map();
      provider.nodes.forEach(function (node) {
        var key = node.parentNodeId || "";
        if (!byParent.has(key)) byParent.set(key, []);
        byParent.get(key).push(node);
      });
      function matches(node) {
        var text = [node.label, node.prototypeName, node.destination && node.destination.value]
          .concat((node.semanticTerms || []).map(function (term) { return term.category + " " + term.text; }))
          .concat(node.evidence || []).join(" ").toLowerCase();
        return !filterText || text.includes(filterText);
      }
      function hasMatch(node) { return matches(node) || (byParent.get(node.nodeId) || []).some(hasMatch); }
      function buildTree(parentId, depth) {
        var children = (byParent.get(parentId) || []).sort(function (a, b) { return a.label.localeCompare(b.label); });
        if (children.length === 0) return null;
        var ul = element("ul", "dtv-branch" + (depth === 0 ? " dtv-branch-root" : ""));
        for (var i = 0; i < children.length; i++) {
          var node = children[i];
          if (!hasMatch(node)) continue;
          var li = element("li", "dtv-leaf");
          var row = element("button", "dtv-node" + (node.nodeId === selectedNodeId ? " is-selected" : ""));
          row.type = "button";
          if ((byParent.get(node.nodeId) || []).length > 0) row.classList.add("dtv-node-branch");
          row.textContent = node.label + (node.destination && node.destination.value ? " \u2192 " + node.destination.value : "");
          row.onclick = function () { selectedNodeId = node.nodeId; renderBody(); };
          li.appendChild(row);
          var subTree = buildTree(node.nodeId, depth + 1);
          if (subTree) li.appendChild(subTree);
          ul.appendChild(li);
        }
        return ul;
      }
      var treeRoot = buildTree("", 0);
      if (treeRoot) treeCol.appendChild(treeRoot);
      var selected = provider.nodes.find(function (node) { return node.nodeId === selectedNodeId; });
      if (selected) {
        var card = element("div", "dtv-detail-card");
        card.appendChild(element("h3", "dtv-node-label", selected.label));
        card.appendChild(element("code", "dtv-prototype", selected.prototypeName));
        if (selected.contextSummary) card.appendChild(element("p", "dtv-context", selected.contextSummary));
        if (selected.destination && selected.destination.value) {
          var dest = element("div", "dtv-destination-row");
          dest.appendChild(element("span", "dtv-destination-label", "Destination (" + selected.destination.propertyName + ")"));
          dest.appendChild(element("span", "dtv-destination-value", selected.destination.value));
          card.appendChild(dest);
        }
        if (selected.semanticTerms && selected.semanticTerms.length > 0) {
          var tags = element("div", "dtv-tags");
          for (var t = 0; t < selected.semanticTerms.length; t++) tags.appendChild(element("span", "dtv-tag", selected.semanticTerms[t].category + ": " + selected.semanticTerms[t].text));
          card.appendChild(tags);
        }
        if (selected.evidence && selected.evidence.length > 0) {
          var evSec = element("div", "dtv-evidence-section");
          evSec.appendChild(element("h4", "dtv-section-heading", "Evidence"));
          for (var e = 0; e < selected.evidence.length; e++) evSec.appendChild(element("p", "dtv-evidence-item", selected.evidence[e]));
          card.appendChild(evSec);
        }
       var rawSec = element("div", "dtv-raw-section");
       rawSec.appendChild(element("h4", "dtv-section-heading", "Raw Prototype"));
       var rawPre = element("pre", "dtv-raw");
       var rawCode = element("code");
       rawCode.className = "language-pts";
       rawCode.textContent = selected.rawPrototype || "Raw source unavailable.";
       rawPre.appendChild(rawCode);
       rawSec.appendChild(rawPre);
       if (window.BuffalyMarkdownCodeBlocks && typeof window.BuffalyMarkdownCodeBlocks.renderHighlightedMarkdownCodeBlocks === "function") {
         window.BuffalyMarkdownCodeBlocks.renderHighlightedMarkdownCodeBlocks(rawSec);
       }
       card.appendChild(rawSec);
        if (selected.sourceRelativePath) card.appendChild(element("small", "dtv-source-path", selected.sourceRelativePath));
        detailsCol.appendChild(card);
      }
      body.append(treeCol, detailsCol);
    }
    renderBody();
  }

  function refreshAndReopen(providerIndex) {
    if (!cachedSessionKey) return;
    readTree(cachedSessionKey, true)
      .then(function (value) {
        if (!value || !value.providers || value.providers.length === 0) return;
        cachedResponse = value;
        openViewer(providerIndex);
      })
      .catch(function () {});
  }

  function handleFileSourceClick(event) {
    var target = event.target;
    while (target && target.tagName !== "A") target = target.parentElement;
    if (!target || !target.href) return;
    if (target.getAttribute("href").indexOf("#dtv-open:") !== 0) return;
    event.preventDefault();
    var index = parseInt(target.getAttribute("href").substring("#dtv-open:".length), 10) || 0;
    openViewer(index);
  }

  

  api.registerFileSource({
    id: "dispatch-tree-viewer",
    label: "Routing Tree",
    priority: 50,
    placement: "special-files",
    load: function (context) { return loadFileSourceItems(context); }
  });
})();
