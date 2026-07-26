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
    link.href = "/web-modules/DispatchTreeViewer/css/dispatch-tree.css?v=0.7.0";
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

  // ── Ontology Tree Viewer (general ontology, lazy-loaded, paginated) ──

  var ontologyState = { rootName: "", loadedNodes: new Map(), expandedNodes: new Set(), childrenCache: new Map(), selectedNode: null, filterText: "" };

  function readOntologyTree(rootName, after, sessionKey) {
    var url = "/api/web-modules/DispatchTreeViewer/ontology-tree?root=" + encodeURIComponent(rootName);
    if (sessionKey) url += "&sessionKey=" + encodeURIComponent(sessionKey);
    if (after) url += "&after=" + encodeURIComponent(after);
    return fetch(url).then(function (r) { if (!r.ok) throw new Error("Ontology tree request failed (" + r.status + ")."); return r.json(); });
  }

  function readOntologyChildren(rootName, parentName, after, sessionKey) {
    var url = "/api/web-modules/DispatchTreeViewer/ontology-tree/children?root=" + encodeURIComponent(rootName) + "&parent=" + encodeURIComponent(parentName);
    if (sessionKey) url += "&sessionKey=" + encodeURIComponent(sessionKey);
    if (after) url += "&after=" + encodeURIComponent(after);
    return fetch(url).then(function (r) { if (!r.ok) throw new Error("Children request failed (" + r.status + ")."); return r.json(); });
  }

  function openOntologyViewer(initialRoot, sessionKey) {
    ensureStyle();
    var sk = sessionKey || "";
    ontologyState = { rootName: initialRoot || "SkillEntity", sessionKey: sk, loadedNodes: new Map(), expandedNodes: new Set(), childrenCache: new Map(), selectedNode: null, filterText: "" };

    var shade = element("div", "dtv-shade");
    var panel = element("section", "dtv-panel");
    var header = element("header", "dtv-header");
    var body = element("div", "dtv-body");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Ontology Tree");
    header.appendChild(element("h2", "dtv-title", "Ontology Tree"));
    var headerIcon = element("span", "dtv-title-icon");
    headerIcon.innerHTML = "&#128202;";
    header.insertBefore(headerIcon, header.firstChild);

    var headerActions = element("div", "dtv-header-actions");
    var closeBtn = element("button", "dtv-btn", "Close");
    closeBtn.type = "button";
    closeBtn.onclick = function () { shade.remove(); };
    headerActions.appendChild(closeBtn);
    header.appendChild(headerActions);

    var rootBar = element("div", "dtv-root-bar");
    var rootLabel = element("label", "dtv-root-label", "Root:");
    rootLabel.setAttribute("for", "dtv-root-input");
    var rootInput = element("input", "dtv-root-input");
    rootInput.type = "text";
    rootInput.value = ontologyState.rootName;
    rootInput.placeholder = "Enter root prototype name...";
    rootInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        var newRoot = rootInput.value.trim();
        if (newRoot && newRoot !== ontologyState.rootName) {
          ontologyState.rootName = newRoot;
          ontologyState.loadedNodes = new Map();
          ontologyState.expandedNodes = new Set();
          ontologyState.childrenCache = new Map();
          ontologyState.selectedNode = null;
          loadAndRender();
        }
      }
    });
    rootBar.append(rootLabel, rootInput);

    var search = element("input", "dtv-search");
    search.placeholder = "Filter loaded nodes by label or prototype name";
    search.addEventListener("input", function () { ontologyState.filterText = search.value.toLowerCase(); renderOntologyBody(); });

    panel.append(header, rootBar, search, body);
    shade.appendChild(panel);
    document.body.appendChild(shade);
    shade.addEventListener("click", function (event) { if (event.target === shade) shade.remove(); });

    function loadAndRender() {
      body.replaceChildren();
      body.appendChild(element("p", "dtv-loading", "Loading " + ontologyState.rootName + "..."));
      readOntologyTree(ontologyState.rootName, null, ontologyState.sessionKey)
        .then(function (resp) {
          ontologyState.loadedNodes.set(resp.root.prototypeName, resp.root);
          ontologyState.expandedNodes.add(resp.root.prototypeName);
          ontologyState.childrenCache.set(resp.root.prototypeName, { children: resp.children, continuationToken: resp.continuationToken, hasMore: resp.hasMore, totalCount: resp.totalChildCount });
          resp.children.forEach(function (c) { ontologyState.loadedNodes.set(c.prototypeName, c); });
          ontologyState.selectedNode = resp.root.prototypeName;
          renderOntologyBody();
        })
        .catch(function (err) {
          body.replaceChildren();
          body.appendChild(element("p", "dtv-error", "Error: " + err.message));
        });
    }

    function renderOntologyBody() {
      body.replaceChildren();
      var treeCol = element("div", "dtv-tree");
      var detailsCol = element("div", "dtv-details");

      function buildNode(node, depth) {
        var li = element("li", "dtv-leaf");
        var row = element("button", "dtv-node" + (node.prototypeName === ontologyState.selectedNode ? " is-selected" : ""));
        row.type = "button";
        if (node.hasChildren) row.classList.add("dtv-node-branch");
        row.textContent = node.label;
        row.onclick = function () { ontologyState.selectedNode = node.prototypeName; renderOntologyBody(); };
        li.appendChild(row);

        if (node.hasChildren) {
          var expandBtn = element("button", "dtv-expand-btn");
          expandBtn.type = "button";
          var isExpanded = ontologyState.expandedNodes.has(node.prototypeName);
          expandBtn.textContent = isExpanded ? "\u25BC" : "\u25B6";
          expandBtn.onclick = function (e) {
            e.stopPropagation();
            if (isExpanded) {
              ontologyState.expandedNodes.delete(node.prototypeName);
            } else {
              ontologyState.expandedNodes.add(node.prototypeName);
              if (!ontologyState.childrenCache.has(node.prototypeName)) {
                expandBtn.textContent = "...";
                readOntologyChildren(ontologyState.rootName, node.prototypeName, null, ontologyState.sessionKey)
                  .then(function (resp) {
                    ontologyState.childrenCache.set(node.prototypeName, { children: resp.children, continuationToken: resp.continuationToken, hasMore: resp.hasMore, totalCount: resp.totalChildCount });
                    resp.children.forEach(function (c) { ontologyState.loadedNodes.set(c.prototypeName, c); });
                    renderOntologyBody();
                  })
                  .catch(function () { expandBtn.textContent = "!"; });
                return;
              }
            }
            renderOntologyBody();
          };
          li.insertBefore(expandBtn, row);
        }

        if (isExpanded && ontologyState.childrenCache.has(node.prototypeName)) {
          var cached = ontologyState.childrenCache.get(node.prototypeName);
          var ul = element("ul", "dtv-branch" + (depth === 0 ? " dtv-branch-root" : ""));
          cached.children.forEach(function (child) {
            if (ontologyState.filterText) {
              var text = (child.label + " " + child.prototypeName).toLowerCase();
              if (!text.includes(ontologyState.filterText)) return;
            }
            ul.appendChild(buildNode(child, depth + 1));
          });
          if (cached.hasMore) {
            var moreLi = element("li", "dtv-load-more-li");
            var moreBtn = element("button", "dtv-btn dtv-load-more-btn", "Load more...");
            moreBtn.type = "button";
            moreBtn.onclick = function () {
              moreBtn.textContent = "Loading...";
              readOntologyChildren(ontologyState.rootName, node.prototypeName, cached.continuationToken, ontologyState.sessionKey)
                .then(function (resp) {
                  cached.children = cached.children.concat(resp.children);
                  cached.continuationToken = resp.continuationToken;
                  cached.hasMore = resp.hasMore;
                  resp.children.forEach(function (c) { ontologyState.loadedNodes.set(c.prototypeName, c); });
                  renderOntologyBody();
                })
                .catch(function () { moreBtn.textContent = "Error"; });
            };
            moreLi.appendChild(moreBtn);
            ul.appendChild(moreLi);
          }
          li.appendChild(ul);
        }
        return li;
      }

      var root = ontologyState.loadedNodes.get(ontologyState.rootName);
      if (root) {
        var rootUl = element("ul", "dtv-branch dtv-branch-root");
        rootUl.appendChild(buildNode(root, 0));
        treeCol.appendChild(rootUl);
      }

      var selected = ontologyState.selectedNode ? ontologyState.loadedNodes.get(ontologyState.selectedNode) : null;
      if (selected) {
        var card = element("div", "dtv-detail-card");
        card.appendChild(element("h3", "dtv-node-label", selected.label));
        card.appendChild(element("code", "dtv-prototype", selected.prototypeName));
        if (selected.parentPrototypeName) card.appendChild(element("p", "dtv-context", "Parent: " + selected.parentPrototypeName));
        card.appendChild(element("p", "dtv-context", "Kind: " + selected.prototypeKind));
        if (selected.properties && Object.keys(selected.properties).length > 0) {
          var propSec = element("div", "dtv-evidence-section");
          propSec.appendChild(element("h4", "dtv-section-heading", "Properties"));
          var propTable = element("table", "dtv-prop-table");
          for (var key in selected.properties) {
            var tr = element("tr");
            tr.appendChild(element("th", "dtv-prop-key", key));
            tr.appendChild(element("td", "dtv-prop-val", selected.properties[key]));
            propTable.appendChild(tr);
          }
          propSec.appendChild(propTable);
          card.appendChild(propSec);
        }
        detailsCol.appendChild(card);
      }
      body.append(treeCol, detailsCol);
    }

    loadAndRender();
  }

  api.registerFileSource({
    id: "ontology-tree-viewer",
    label: "Ontology Tree",
    priority: 60,
    placement: "special-files",
    load: function (context) {
      return Promise.resolve([{
        Name: "Ontology Tree",
        Description: "Browse ontology hierarchy from any root",
        Icon: "bi-diagram-2",
        Url: "#dtv-ontology-open:" + (context.sessionKey || "")
      }]);
    }
  });

  document.addEventListener("click", function (event) {
    var target = event.target;
    while (target && target.tagName !== "A") target = target.parentElement;
    if (!target || !target.href) return;
    if (target.getAttribute("href").indexOf("#dtv-ontology-open:") === 0) {
      event.preventDefault();
      var sk = target.getAttribute("href").substring("#dtv-ontology-open:".length);
      openOntologyViewer("SkillEntity", sk);
    }
  });
})();
