(function () {
    "use strict";

    const config = (window.BuffalyWebModuleConfig && window.BuffalyWebModuleConfig.OntologyWorkbench) || {};
    const harnessBaseUrl = String(config.HarnessBaseUrl || "").replace(/\/$/, "");

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

    async function dispatch(button) {
        if (!harnessBaseUrl) {
            throw new Error("Ontology Workbench HarnessBaseUrl is not configured.");
        }
        const composer = requireComposer();
        const message = composer.value;
        if (!message.trim()) {
            throw new Error("Type a message before using Ontology Workbench.");
        }

        button.disabled = true;
        button.classList.add("is-processing");
        button.title = "Ontology Workbench is extracting and binding this message";
        try {
            const response = await fetch(harnessBaseUrl + "/harness/api/dispatch-message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionKey: requireSessionKey(), message: message })
            });
            const text = await response.text();
            if (!response.ok) {
                throw new Error(text || ("Ontology Workbench returned HTTP " + response.status + "."));
            }
            const result = JSON.parse(text);
            if (!result.grammar || !result.childSessionKey) {
                throw new Error("Ontology Workbench returned an incomplete response.");
            }
            composer.value = result.grammar;
            composer.dispatchEvent(new window.Event("input", { bubbles: true }));
            composer.focus();
            composer.setSelectionRange(composer.value.length, composer.value.length);
            button.title = "Applied by " + result.childSessionKey;
        } finally {
            button.disabled = false;
            button.classList.remove("is-processing");
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
        button.title = "Extract and bind composer text in Ontology Workbench";
        button.setAttribute("aria-label", button.title);
        button.innerHTML = '<i class="bi bi-diagram-3" aria-hidden="true"></i><span class="visually-hidden">Ontology Workbench</span>';
        button.style.color = "#7c3aed";
        button.style.marginRight = "0.45rem";
        button.addEventListener("click", function () {
            dispatch(button).catch(function (error) {
                button.title = error.message;
                window.alert(error.message);
            });
        });
        actions.insertBefore(button, center);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", mount, { once: true });
    } else {
        mount();
    }
}());
