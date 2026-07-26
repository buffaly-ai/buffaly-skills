(function () {
  "use strict";

  function initialize(api) {
    if (window.__dispatchTreeViewerFileSourceRegistered) return;
    window.__dispatchTreeViewerFileSourceRegistered = true;
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
    link.href = "/web-modules/DispatchTreeViewer/css/dispatch-tree.css?v=0.7.5";
    document.head.appendChild(link);
  }

  function errorMessage(error) {
    if (!error) return "The Dispatch tree request failed without a diagnostic.";
    return error.message || error.Error || error.error || (typeof error === "string" ? error : "The Dispatch tree request failed.");
  }

  function withTimeout(promise, operation) {
    return Promise.race([
      promise,
      new Promise(function (_, reject) {
        window.setTimeout(function () { reject(new Error(operation + " timed out after 20 seconds.")); }, 20000);
      })
    ]);
  }

  function sessionGuidance(message) {
    return /HTTP 502|timed out|worker|session/i.test(message)
      ? "The session runtime could not be started or reached. Wait a moment and retry; if a turn is stuck, stop it first."
      : "Confirm that this dispatcher session has a DispatchMemoryRoot and try again.";
  }

  function ensureSessionRuntime(sessionKey) {
    if (!sessionKey) return Promise.reject(new Error("A session key is required to load the Dispatch tree."));
    return withTimeout(BuffalyAgentService.EnsureAgentAsync(sessionKey), "Starting the session runtime");
  }

  ensureStyle();

  api.registerFileSource({
    id: "dispatch-tree-viewer",
    label: "Dispatch Tree",
    priority: 50,
    placement: "special-files",
    load: function (context) {
      return [{
        Name: "Dispatch Tree",
        Description: "Open this session's live routing hierarchy",
        Icon: "bi-diagram-2",
        Url: "#dtv-ontology-open:" + encodeURIComponent(context.sessionKey || "")
      }];
    }
  });

  // ── Ontology Tree Viewer (general ontology, lazy-loaded, paginated) ──

  var ontologyState = { rootName: "", loadedNodes: new Map(), expandedNodes: new Set(), childrenCache: new Map(), selectedNode: null, filterText: "" };

 function readOntologyTree(rootName, after, sessionKey) {
   var args = JSON.stringify({ rootName: rootName, after: after || "" });
   return ensureSessionRuntime(sessionKey || "")
     .then(function () { return withTimeout(BuffalyAgentService.RunProtoScriptMethodAsync(sessionKey || "", "buffaly-agent", "ToReadOntologyTree", "Execute", args), "Loading the Dispatch tree"); })
     .then(function (resultText) { return JSON.parse(resultText); });
 }

 function readOntologyChildren(rootName, parentName, after, sessionKey) {
   var args = JSON.stringify({ rootName: rootName, parentName: parentName, after: after || "" });
   return withTimeout(BuffalyAgentService.RunProtoScriptMethodAsync(sessionKey || "", "buffaly-agent", "ToReadOntologyChildren", "Execute", args), "Loading Dispatch tree children")
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
    panel.setAttribute("aria-label", "Dispatch Tree");
    header.appendChild(element("h2", "dtv-title", "Dispatch Tree"));
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
          var errorPanel = element("div", "dtv-error");
          var message = errorMessage(err);
          errorPanel.appendChild(element("strong", "dtv-error-title", "Dispatch tree unavailable"));
          errorPanel.appendChild(element("p", "dtv-error-message", message));
          errorPanel.appendChild(element("p", "dtv-error-guidance", sessionGuidance(message)));
          var retry = element("button", "dtv-btn dtv-retry-btn", "Retry");
          retry.type = "button";
          retry.onclick = loadAndRender;
          errorPanel.appendChild(retry);
          body.appendChild(errorPanel);
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
                  .catch(function (err) {
                    expandBtn.textContent = "!";
                    expandBtn.title = errorMessage(err);
                  });
                return;
              }
            }
            renderOntologyBody();
          };
          li.insertBefore(expandBtn, row);
        }

        if (isExpanded && ontologyState.childrenCache.has(node.prototypeName)) {
          var cached = ontologyState.childrenCache.get(node.prototypeName);
          var ul = element("ul", "dtv-branch");
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
          var protoSec = element("div", "dtv-raw-section");
          protoSec.appendChild(element("h4", "dtv-section-heading", "ProtoScript"));
          var protoPre = element("pre", "dtv-raw");
          var protoCode = element("code");
          protoCode.className = "language-pts";
          protoCode.textContent = selected.protoScriptDisplay || "ProtoScript display unavailable.";
          protoPre.appendChild(protoCode);
          protoSec.appendChild(protoPre);
          if (window.BuffalyMarkdownCodeBlocks && typeof window.BuffalyMarkdownCodeBlocks.renderHighlightedMarkdownCodeBlocks === "function") {
            window.BuffalyMarkdownCodeBlocks.renderHighlightedMarkdownCodeBlocks(protoSec);
          }
          card.appendChild(protoSec);
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
  }

  function registerWhenHostIsReady() {
    if (window.BuffalyAgentNextExtensions) {
      initialize(window.BuffalyAgentNextExtensions);
      return;
    }

    var existing = document.querySelector('script[data-buffaly-next-extensions-loader="true"]');
    if (existing) {
      existing.addEventListener("load", function () { initialize(window.BuffalyAgentNextExtensions); }, { once: true });
      return;
    }

    var loader = document.createElement("script");
    loader.src = "/js/buffaly-agent-next-extensions.js?v=20260723.1";
    loader.async = false;
    loader.dataset.buffalyNextExtensionsLoader = "true";
    loader.addEventListener("load", function () {
      if (!window.BuffalyAgentNextExtensions) throw new Error("Buffaly Agent extension host did not initialize.");
      initialize(window.BuffalyAgentNextExtensions);
    }, { once: true });
    loader.addEventListener("error", function () {
      console.error("DispatchTreeViewer could not load the Buffaly Agent extension host.");
    }, { once: true });
    document.head.appendChild(loader);
  }

  registerWhenHostIsReady();
})();
