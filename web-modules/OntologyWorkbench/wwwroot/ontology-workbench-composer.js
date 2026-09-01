(function () {
    "use strict";

    const config = (window.BuffalyWebModuleConfig && window.BuffalyWebModuleConfig.OntologyWorkbench) || {};
    const launcherUrl = "/web-modules/OntologyWorkbench/launch.html";

    function requireComposer() {
        const composer = document.getElementById("txtOpsV2Prompt");
        if (!(composer instanceof window.HTMLTextAreaElement)) {
            throw new Error("Buffaly composer is unavailable.");
        }
        return composer;
    }

    function requireSessionKey() {
        const context = window.BuffalyAgentSessionContext;
        const sessionKey = context && typeof context.getActiveSessionKey === "function"
            ? String(context.getActiveSessionKey() || "")
            : "";
        if (!sessionKey.trim()) {
            throw new Error("Open a Buffaly session before using Ontology Workbench.");
        }
        return sessionKey;
    }

    function openWorkbench() {
        const composer = requireComposer();
        const message = composer.value;
        if (!message.trim()) {
            throw new Error("Type a message before using Ontology Workbench.");
        }

        const workbenchSessionKey = requireSessionKey() + " - Ontology Workbench";
        const url = new URL(launcherUrl, window.location.origin);
        url.searchParams.set("sessionKey", workbenchSessionKey);
        url.searchParams.set("message", message);
        window.open(url.toString(), "_blank", "noopener");
    }

    function extractProtoScriptSymbolName(href) {
        try {
            const url = new URL(String(href || "").trim());
            if (url.protocol.toLowerCase() !== "buffaly:") {
                return "";
            }
            if (String(url.hostname || "").toLowerCase() !== "protoscript") {
                return "";
            }
            if (String(url.pathname || "").toLowerCase().indexOf("/symbol") !== 0) {
                return "";
            }
            const queryName = String(url.searchParams.get("name") || "").trim();
            if (!queryName) {
                return "";
            }
            const hash = String(url.hash || "").trim();
            return hash && hash.charAt(0) === "#" ? queryName + hash : queryName;
        } catch {
            return "";
        }
    }

    function findProtoScriptSymbolAnchor(target) {
        const anchor = target instanceof Element ? target.closest("a[href^=\"buffaly://\"]") : null;
        if (!(anchor instanceof window.HTMLAnchorElement)) {
            return null;
        }
        return extractProtoScriptSymbolName(anchor.getAttribute("href")) ? anchor : null;
    }

    function openPrototypeViewer(prototypeName) {
        const symbol = String(prototypeName || "").trim();
        if (!symbol) {
            return false;
        }
        const url = new URL(launcherUrl, window.location.origin);
        url.searchParams.set("prototypeName", symbol);
        const context = window.BuffalyAgentSessionContext;
        const sessionKey = context && typeof context.getActiveSessionKey === "function"
            ? String(context.getActiveSessionKey() || "").trim()
            : "";
        if (sessionKey) {
            url.searchParams.set("sessionKey", sessionKey);
        }
        window.open(url.toString(), "_blank", "noopener");
        return true;
    }

    function interceptProtoScriptSymbolClicks() {
        document.addEventListener("pointerdown", function (evt) {
            if (!findProtoScriptSymbolAnchor(evt.target)) {
                return;
            }
            evt.stopImmediatePropagation();
        }, true);
        document.addEventListener("click", function (evt) {
            const anchor = findProtoScriptSymbolAnchor(evt.target);
            if (!anchor) {
                return;
            }
            evt.preventDefault();
            evt.stopImmediatePropagation();
            openPrototypeViewer(extractProtoScriptSymbolName(anchor.getAttribute("href")));
        }, true);
    }

    function mount() {
        if (document.getElementById("btnOntologyWorkbenchComposer")) {
            return;
        }
        const actions = document.querySelector(".ops-v2-composer-actions");
        const center = actions && actions.querySelector(".ops-v2-composer-actions-center");
        if (!actions || !center) {
            return;
        }
        const button = document.createElement("button");
        button.id = "btnOntologyWorkbenchComposer";
        button.type = "button";
        button.className = "ops-v2-upload-btn ontology-workbench-composer-btn";
        button.title = "Open composer text in Ontology Workbench";
        button.setAttribute("aria-label", button.title);
        button.innerHTML = '<i class="bi bi-diagram-3" aria-hidden="true"></i><span class="visually-hidden">Ontology Workbench</span>';
        button.style.color = "#7c3aed";
        button.style.marginRight = "0.45rem";
        button.addEventListener("click", function () {
            try {
                openWorkbench();
            } catch (error) {
                button.title = error.message;
                window.alert(error.message);
            }
        });
        actions.insertBefore(button, center);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", mount, { once: true });
    } else {
        mount();
    }
    interceptProtoScriptSymbolClicks();
}());
