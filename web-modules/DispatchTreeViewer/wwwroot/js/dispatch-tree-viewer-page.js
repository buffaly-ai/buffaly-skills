(function () {
  "use strict";
  var params = new URLSearchParams(location.search);
  var sessionKey = params.get("sessionKey") || "";
  var providerIndex = parseInt(params.get("provider") || "0", 10) || 0;
  var host = document.getElementById("viewerHost");
  if (!sessionKey) { host.querySelector(".dtv-error").textContent = "Missing sessionKey parameter."; return; }

  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function formatProtoScript(raw) {
    if (!raw) return "";
    var pre = element("pre", "dtv-raw cm-s-default");
    CodeMirror.runMode(raw, "text/x-protoscript", pre);
    return pre;
  }

  fetch("/api/web-modules/DispatchTreeViewer/tree?sessionKey=" + encodeURIComponent(sessionKey))
    .then(function (result) {
      if (!result.ok) throw new Error("Tree request failed (" + result.status + ").");
      return result.json();
    })
    .then(function (value) {
      if (!value || !value.providers || value.providers.length === 0) {
        host.querySelector(".dtv-error").textContent = "No dispatch tree data found for session: " + sessionKey;
        return;
      }
      var provider = value.providers[providerIndex] || value.providers[0];
      if (!provider) { host.querySelector(".dtv-error").textContent = "No provider found."; return; }
      host.replaceChildren();
      var selectedNodeId = provider.rootNodeId;
      var filterText = "";

      var panel = element("section", "dtv-panel");
      var header = element("header", "dtv-header");
      var search = element("input", "dtv-search");
      var body = element("div", "dtv-body");
      panel.setAttribute("role", "main");
      panel.setAttribute("aria-label", provider.displayName);
      header.appendChild(element("h2", "dtv-title", provider.displayName));
      var headerIcon = element("span", "dtv-title-icon");
      headerIcon.innerHTML = "&#128218;";
      header.insertBefore(headerIcon, header.firstChild);
      var headerActions = element("div", "dtv-header-actions");
      var refreshBtn = element("button", "dtv-btn", "Refresh");
      var closeBtn = element("button", "dtv-btn", "Close");
      refreshBtn.type = "button";
      closeBtn.type = "button";
      refreshBtn.onclick = function () { location.reload(); };
      closeBtn.onclick = function () { window.close(); };
      headerActions.append(refreshBtn, closeBtn);
      header.append(headerActions);
      search.placeholder = "Filter labels, prototypes, destinations, semantic terms, or evidence";
      search.addEventListener("input", function () { filterText = search.value.toLowerCase(); renderBody(); });
      panel.append(header, search, body);
      host.appendChild(panel);

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
          var formatted = formatProtoScript(selected.rawPrototype || "Raw source unavailable.");
          rawSec.appendChild(formatted);
          card.appendChild(rawSec);
          if (selected.sourceRelativePath) card.appendChild(element("small", "dtv-source-path", selected.sourceRelativePath));
          detailsCol.appendChild(card);
        }
        body.append(treeCol, detailsCol);
      }
      renderBody();
    })
    .catch(function (error) {
      host.querySelector(".dtv-error").textContent = error.message || "Failed to load dispatch tree.";
    });
})();