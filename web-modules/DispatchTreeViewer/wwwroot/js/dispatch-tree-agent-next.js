(function () {
  "use strict";
  const api = window.BuffalyAgentNextExtensions;
  if (!api) return;
  let styleLoaded = false;

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
    link.href = "/web-modules/DispatchTreeViewer/css/dispatch-tree.css?v=0.7.0";
    document.head.appendChild(link);
  }

  api.registerFileSource({
    id: "dispatch-tree-viewer",
    label: "Ontology Tree",
    priority: 50,
    placement: "special-files",
    load: function (context) {
      return [{
        Name: "Ontology Tree",
        Description: "Browse the live ontology from any root",
        Icon: "bi-diagram-2",
        Url: "#dtv-ontology-open:" + encodeURIComponent(context.sessionKey || "")
      }];
    }
  });

  // ── Ontology Tree Viewer (general ontology, lazy-loaded, paginated) ──

  var ontologyState = { rootName: "", loadedNodes: new Map(), expandedNodes: new Set(), childrenCache: new Map(), selectedNode: null, filterText: "" };

 function readOntologyTree(rootName, after, sessionKey) {
   var args = JSON.stringify({ rootName: rootName, after: after || "" });
   return BuffalyAgentService.RunProtoScriptMethodAsync(sessionKey || "", "buffaly-agent", "ToReadOntologyTree", "Execute", args)
     .then(function (resultText) { return JSON.parse(resultText); });
 }

 function readOntologyChildren(rootName, parentName, after, sessionKey) {
   var args = JSON.stringify({ rootName: rootName, parentName: parentName, after: after || "" });
   return BuffalyAgentService.RunProtoScriptMethodAsync(sessionKey || "", "buffaly-agent", "ToReadOntologyChildren", "Execute", args)
     .then(function (resultText) { return JSON.parse(resultText); });
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

    var isFullscreen = false;
    var headerActions = element("div", "dtv-header-actions");
    var fullscreenBtn = element("button", "dtv-btn", "Fullscreen");
    var closeBtn = element("button", "dtv-btn", "Close");
    fullscreenBtn.type = "button";
    closeBtn.type = "button";
    fullscreenBtn.onclick = function () {
      isFullscreen = !isFullscreen;
      panel.classList.toggle("dtv-fullscreen", isFullscreen);
      fullscreenBtn.textContent = isFullscreen ? "Exit Fullscreen" : "Fullscreen";
    };
    closeBtn.onclick = function () { shade.remove(); };
    headerActions.append(fullscreenBtn, closeBtn);
    header.appendChild(headerActions);

    var rootBar = element("div", "dtv-root-bar");
    var rootLabel = element("label", "dtv-root-label", "Ontology root");
    rootLabel.setAttribute("for", "dtv-root-input");
    var rootInput = element("input", "dtv-root-input");
    rootInput.type = "text";
    rootInput.value = ontologyState.rootName;
    rootInput.placeholder = "Enter a prototype name and press Enter";
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

  document.addEventListener("click", function (event) {
    var target = event.target;
    while (target && target.tagName !== "A") target = target.parentElement;
    if (!target || !target.href) return;
    if (target.getAttribute("href").indexOf("#dtv-ontology-open:") === 0) {
      event.preventDefault();
      var sk = decodeURIComponent(target.getAttribute("href").substring("#dtv-ontology-open:".length));
      openOntologyViewer("DispatchMemoryRoot", sk);
    }
  });
})();
