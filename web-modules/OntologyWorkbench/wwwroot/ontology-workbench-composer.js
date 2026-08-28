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
        const opened = window.open(url.toString(), "_blank", "noopener");
        if (!opened) {
            throw new Error("The browser blocked the Ontology Workbench tab.");
        }
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
}());
