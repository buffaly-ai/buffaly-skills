// Purpose: Format the WebProperty editor binding row and compact its embedded agent chrome.
(function () {
	"use strict";

	var stylesheet = document.createElement("link");
	stylesheet.rel = "stylesheet";
	stylesheet.href = "/web-modules/FeedingFrenzy.WebPropertyEditorAgent/js/web-property-editor-timeline.css?v=20260711.1";
	document.head.appendChild(stylesheet);

	function parseBindingPayload(context) {
		var text = String(context.node && (context.node.contentText || context.node.rawContent) || "").trim();
		if (!text || text.charAt(0) !== "{") return null;
		var payload;
		try { payload = JSON.parse(text); } catch (_) { return null; }
		return payload.AgentMode === "WebPropertyEditor" && payload.BindingStatus ? payload : null;
	}

	function createStatus(label, enabled) {
		var item = document.createElement("span");
		item.className = "ff-web-property-binding__capability";
		item.textContent = label + ": " + (enabled === true || enabled === "true" ? "On" : "Off");
		return item;
	}

	function renderBindingStrip(context, payload) {
		var root = context.shell.root;
		var strip = document.createElement("div");
		var title = document.createElement("strong");
		strip.className = "ff-web-property-binding";
		title.textContent = payload.BoundWebsite === true || payload.BoundWebsite === "true" ? "Website editor connected" : "Website editor ready";
		strip.appendChild(title);
		strip.appendChild(createStatus("Preview", payload.PreviewEnabled));
		strip.appendChild(createStatus("Publish", payload.PublishEnabled));
		root.replaceChildren(strip);
		root.classList.add("ff-web-property-binding-card");
		root.setAttribute("aria-label", title.textContent);
	}

	function register(environment, context) {
		if (!context || context.agentName !== "web-property-editor-agent") return;
		if (context.embedded) document.body.classList.add("ff-web-property-editor-embedded");
		window.BuffalyTimelineCardRenderCore.registerDecorator(environment, {
			id: "feeding-frenzy.web-property-binding",
			phase: "module",
			priority: 10,
			appliesTo: function (cardContext) { return !!parseBindingPayload(cardContext); },
			decorate: function (cardContext) { renderBindingStrip(cardContext, parseBindingPayload(cardContext)); }
		});
	}

	window.BuffalyTimelineCardModuleExtensions = window.BuffalyTimelineCardModuleExtensions || [];
	window.BuffalyTimelineCardModuleExtensions.push({ id: "feeding-frenzy.web-property-editor", register: register });
}());
