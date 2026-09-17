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
        if (!window.BuffalyComposerOverflow || typeof window.BuffalyComposerOverflow.register !== "function") {
            return;
        }
        window.BuffalyComposerOverflow.register({
            id: "ontology-workbench",
            order: 20,
            label: "Open in Ontology Workbench",
            iconHtml: '<i class="bi bi-diagram-3" aria-hidden="true"></i>',
            isAvailable: function () { return !!document.getElementById("txtOpsV2Prompt"); },
            run: function () {
                try {
                    openWorkbench();
                } catch (error) {
                    window.alert(error.message);
                }
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", mount, { once: true });
    } else {
        mount();
    }
    interceptProtoScriptSymbolClicks();
}());
