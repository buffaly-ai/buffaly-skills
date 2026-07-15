(function () {
	"use strict";

	var extensionId = "feeding-frenzy.web-property-editor.context";
	var stylesheetId = "ff-web-property-editor-context-styles";
	var stylesheetHref = "/web-modules/FeedingFrenzy.WebPropertyEditorAgent/web-property-editor-context.css?v=20260715.1";

	window.BuffalyTimelineCardExtensions.register({
		id: extensionId,
		version: "1.0.0",
		source: "web-module",
		description: "Compact bound WebProperty editor initialization context.",
		activate: function (api) {
			if (!api.options || api.options.agentName !== "web-property-editor-agent") { return; }
			var stylesheet = installStylesheet();
			var actionPolicy = api.actionPolicies.register({
				id: extensionId + ".actions",
				priority: 100,
				allows: function (context) { return context.actionId !== "message.saveArtifact"; }
			});
			var identityDecorator = api.decorators.register({
				id: extensionId + ".identity",
				priority: 100,
				appliesTo: function (context) { return context.model && context.model.family === "message.assistant"; },
				decorate: function (context) {
					if (context.shell && context.shell.slots && context.shell.slots.title) {
						context.shell.slots.title.textContent = "Web Property Editor";
					}
				}
			});
			var registration = api.contentRenderers.register({
				id: extensionId + ".content",
				key: "message.user",
				priority: 80,
				appliesTo: isEditorInitializationNode,
				render: renderEditorInitialization
			});
			return { dispose: function () { registration.dispose(); identityDecorator.dispose(); actionPolicy.dispose(); if (stylesheet && stylesheet.parentNode) { stylesheet.parentNode.removeChild(stylesheet); } } };
		}
	});

	function installStylesheet() {
		if (document.getElementById(stylesheetId)) { return null; }
		var link = document.createElement("link");
		link.id = stylesheetId;
		link.rel = "stylesheet";
		link.href = stylesheetHref;
		document.head.appendChild(link);
		return link;
	}

	function readPayload(node) {
		var value;
		try { value = JSON.parse(node.contentText || ""); } catch (error) { return null; }
		if (!value || typeof value !== "object" || Array.isArray(value)) { return null; }
		if (value.AgentMode !== "WebPropertyEditor" || value.BoundWebsite !== "true" || value.BindingStatus !== "Initialized") { return null; }
		if (!isBooleanText(value.PreviewEnabled) || !isBooleanText(value.PublishEnabled)) { return null; }
		if (Object.keys(value).sort().join("|") !== "AgentMode|BindingStatus|BoundWebsite|PreviewEnabled|PublishEnabled") { return null; }
		return value;
	}

	function isBooleanText(value) { return value === "true" || value === "false"; }

	function isEditorInitializationNode(context) { return Boolean(readPayload(context.node || {})); }

	function renderEditorInitialization(context) {
		var body = context.shell && context.shell.slots ? context.shell.slots.body : null;
		var payload = readPayload(context.node || {});
		if (!body || !payload) { return; }
		var card = document.createElement("section");
		card.className = "ff-web-property-editor-context";
		card.setAttribute("aria-label", "Web Property editor status");
		var heading = document.createElement("strong");
		heading.className = "ff-web-property-editor-context__title";
		heading.textContent = "Website editor ready";
		var description = document.createElement("span");
		description.className = "ff-web-property-editor-context__description";
		description.textContent = "Securely bound to this WebProperty.";
		var statuses = document.createElement("span");
		statuses.className = "ff-web-property-editor-context__statuses";
		appendStatus(statuses, "Preview", payload.PreviewEnabled === "true");
		appendStatus(statuses, "Publishing", payload.PublishEnabled === "true");
		card.append(heading, description, statuses);
		body.replaceChildren(card);
		body.dataset.slotState = "populated";
	}

	function appendStatus(host, label, enabled) {
		var status = document.createElement("span");
		status.className = "ff-web-property-editor-context__status " + (enabled ? "is-ready" : "is-unavailable");
		status.textContent = label + (enabled ? " available" : " unavailable");
		host.appendChild(status);
	}
}());
