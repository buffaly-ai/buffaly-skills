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
    link.href = "/web-modules/DispatchTreeViewer/css/dispatch-tree.css?v=0.1.0";
    document.head.appendChild(link);
  }

  function mount(context) {
    ensureStyle();
    const abortController = new AbortController();
    const host = element("span", "dtv-host");
    let disposed = false;
    let response = null;
    let selectedNodeId = "";
    let filterText = "";
    context.slotElement.appendChild(host);

    function load(reopen) {
      return fetch("/api/web-modules/DispatchTreeViewer/tree?sessionKey=" + encodeURIComponent(context.sessionKey), { signal: abortController.signal })
        .then(function (result) {
          if (!result.ok) throw new Error("Routing tree request failed (" + result.status + ").");
          return result.json();
        })
        .then(function (value) {
          if (disposed || context.sessionKey !== value.sessionKey) return;
          if (!value.providers || value.providers.length === 0) {
            response = null;
            host.replaceChildren();
            return;
          }
          response = value;
          renderChip();
          if (reopen) openViewer();
        })
        .catch(function (error) {
          if (error.name !== "AbortError") context.diagnostics.report({ Type: "tree-load-failed", Message: error.message });
        });
    }

    function renderChip() {
      host.replaceChildren();
      const button = element("button", "dtv-chip", "Routing Tree");
      button.type = "button";
      button.addEventListener("click", openViewer);
      host.appendChild(button);
    }

    function openViewer() {
      if (!response) return;
      const provider = response.providers[0];
      selectedNodeId = selectedNodeId || provider.rootNodeId;
      const shade = element("div", "dtv-shade");
      const panel = element("section", "dtv-panel");
      const header = element("header", "dtv-header");
      const search = element("input", "dtv-search");
      const body = element("div", "dtv-body");
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-label", provider.displayName);
      header.appendChild(element("h2", "", provider.displayName));
      const refresh = element("button", "", "Refresh");
      refresh.onclick = function () { shade.remove(); load(true); };
      const close = element("button", "", "Close");
      close.onclick = function () { shade.remove(); };
      header.append(refresh, close);
      search.placeholder = "Filter labels, prototypes, destinations, semantic terms, or evidence";
      search.value = filterText;
      search.addEventListener("input", function () { filterText = search.value.toLowerCase(); renderBody(); });
      panel.append(header, search, body);
      shade.appendChild(panel);
      document.body.appendChild(shade);
      shade.addEventListener("click", function (event) { if (event.target === shade) shade.remove(); });

      function renderBody() {
        body.replaceChildren();
        const tree = element("div", "dtv-tree");
        const details = element("div", "dtv-details");
        const byParent = new Map();
        provider.nodes.forEach(function (node) {
          const key = node.parentNodeId || "";
          if (!byParent.has(key)) byParent.set(key, []);
          byParent.get(key).push(node);
        });
        function matches(node) {
          const text = [node.label, node.prototypeName, node.destination && node.destination.value]
            .concat((node.semanticTerms || []).map(function (term) { return term.category + " " + term.text; }))
            .concat(node.evidence || []).join(" ").toLowerCase();
          return !filterText || text.includes(filterText);
        }
        function hasMatch(node) { return matches(node) || (byParent.get(node.nodeId) || []).some(hasMatch); }
        function addChildren(parentId, container, depth) {
          (byParent.get(parentId) || []).sort(function (a, b) { return a.label.localeCompare(b.label); }).forEach(function (node) {
            if (!hasMatch(node)) return;
            const row = element("button", "dtv-node" + (node.nodeId === selectedNodeId ? " is-selected" : ""));
            row.type = "button";
            row.style.paddingLeft = (10 + depth * 18) + "px";
            row.textContent = node.label + (node.destination && node.destination.value ? " → " + node.destination.value : "");
            row.onclick = function () { selectedNodeId = node.nodeId; renderBody(); };
            container.appendChild(row);
            addChildren(node.nodeId, container, depth + 1);
          });
        }
        addChildren("", tree, 0);
        const selected = provider.nodes.find(function (node) { return node.nodeId === selectedNodeId; });
        if (selected) {
          details.append(element("h3", "", selected.label), element("code", "dtv-prototype", selected.prototypeName));
          if (selected.contextSummary) details.appendChild(element("p", "", selected.contextSummary));
          if (selected.destination && selected.destination.value) details.appendChild(element("p", "", "Destination (" + selected.destination.propertyName + "): " + selected.destination.value));
          const tags = element("div", "dtv-tags");
          (selected.semanticTerms || []).forEach(function (term) { tags.appendChild(element("span", "dtv-tag", term.category + ": " + term.text)); });
          details.appendChild(tags);
          details.append(element("h4", "", "Raw prototype"), element("pre", "dtv-raw", selected.rawPrototype || "Raw source unavailable."));
          if (selected.sourceRelativePath) details.appendChild(element("small", "", selected.sourceRelativePath));
        }
        body.append(tree, details);
      }
      renderBody();
    }

    load(false);
    return { dispose: function () { disposed = true; abortController.abort(); host.remove(); } };
  }

  api.register({ id: "dispatch-tree-viewer", slot: "sessionHeader.context", mount: mount });
})();
