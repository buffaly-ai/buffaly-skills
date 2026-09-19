(function () {
	"use strict";

	let requestId = 0;

	function text(value) { return value === null || value === undefined ? "" : String(value); }
	function isEmpty(value) { return text(value).trim().length === 0; }
	function byId(id) { return document.getElementById(id); }

	function ensureStyles() {
		if (byId("realtimeVoiceModuleStyles")) return;
		const link = document.createElement("link");
		link.id = "realtimeVoiceModuleStyles";
		link.rel = "stylesheet";
		link.href = "/web-modules/RealtimeVoice/css/realtime-voice.css?v=20260812.1";
		document.head.appendChild(link);
	}

	function getActiveSessionKey() {
		if (window.BuffalyAgentSessionContext && typeof window.BuffalyAgentSessionContext.getActiveSessionKey === "function") return text(window.BuffalyAgentSessionContext.getActiveSessionKey({})).trim();
		return text(window.__buffalyAgentActiveSessionKey).trim();
	}

	function setVoiceButtonRunning(isRunning) {
		const button = byId("realtimeVoiceVoiceButton");
		if (!button) return;
		button.classList.toggle("running", !!isRunning);
		button.title = isRunning ? "Close realtime voice" : "Talk about this session";
	}

	const hostProtocolVersion = 1;
	let activeFrame = null;
	let frameReady = false;
	let stopTimer = null;
	let compactStopRequested = false;

	function postFrameCommand(type, reason) {
		if (!activeFrame?.contentWindow) return;
		activeFrame.contentWindow.postMessage({ type, protocolVersion: hostProtocolVersion, reason: reason || "" }, window.location.origin);
	}

	function normalizeOrbState(lifecycle) {
		const value = text(lifecycle).trim().toLowerCase();
		if (value === "requesting microphone" || value === "allocating buffaly session") return "starting";
		if (value === "connecting buffaly" || value === "connecting realtime") return "connecting";
		return value || "starting";
	}

	function setCompactState(lifecycle) {
		const controls = byId("realtimeVoiceCompactControls");
		const orb = byId("realtimeVoiceCompactOrb");
		if (!controls || !orb) return;
		const state = normalizeOrbState(lifecycle);
		controls.dataset.state = state;
		orb.setAttribute("aria-label", "Realtime voice: " + state.replace(/-/g, " "));
		if (state === "stopped" && compactStopRequested) finishCompactStop();
	}

	function finishCompactStop() {
		if (stopTimer) window.clearTimeout(stopTimer);
		stopTimer = null;
		byId("realtimeVoiceRealtimePlugin")?.remove();
		byId("realtimeVoiceCompactControls")?.remove();
		activeFrame = null;
		frameReady = false;
		compactStopRequested = false;
		setVoiceButtonRunning(false);
		const button = byId("realtimeVoiceVoiceButton");
		if (button) button.hidden = false;
	}

	function stopBoundRealtimeVoice(reason) {
		const controls = byId("realtimeVoiceCompactControls");
		if (controls?.dataset.state === "stopping") return;
		const stop = byId("realtimeVoiceCompactStop");
		if (stop) stop.disabled = true;
		compactStopRequested = true;
		setCompactState("stopping");
		if (frameReady) postFrameCommand("RealtimeVoice.Host.Stop", reason || "user-stop");
		if (stopTimer) window.clearTimeout(stopTimer);
		stopTimer = window.setTimeout(finishCompactStop, 5000);
	}

	function toggleDiagnostics() {
		const host = byId("realtimeVoiceRealtimePlugin");
		const button = byId("realtimeVoiceCompactDiagnostics");
		if (!host || !button) return;
		const visible = host.classList.toggle("diagnostics-visible");
		host.classList.toggle("diagnostics-collapsed", !visible);
		button.setAttribute("aria-expanded", visible ? "true" : "false");
		button.title = visible ? "Hide realtime voice diagnostics" : "Open realtime voice diagnostics";
	}

	function hideDiagnostics() {
		const host = byId("realtimeVoiceRealtimePlugin");
		const button = byId("realtimeVoiceCompactDiagnostics");
		if (!host) return;
		host.classList.remove("diagnostics-visible");
		host.classList.add("diagnostics-collapsed");
		if (button) {
			button.setAttribute("aria-expanded", "false");
			button.title = "Open realtime voice diagnostics";
		}
	}

	function receiveFrameMessage(event) {
		if (event.origin !== window.location.origin || !activeFrame || event.source !== activeFrame.contentWindow) return;
		const message = event.data || {};
		if (message.protocolVersion !== hostProtocolVersion) return;
		if (message.type === "RealtimeVoice.Frame.Ready") {
			if (frameReady) return;
			frameReady = true;
			postFrameCommand(compactStopRequested ? "RealtimeVoice.Host.Stop" : "RealtimeVoice.Host.Start", compactStopRequested ? "stopped-before-ready" : "");
		} else if (message.type === "RealtimeVoice.Frame.StopRequested") {
			compactStopRequested = true;
		} else if (message.type === "RealtimeVoice.Frame.State") {
			setCompactState(message.lifecycle);
		}
	}

	function showUnavailable(message) {
		const form = byId("opsV2PromptForm");
		if (!form) return;
		let panel = byId("realtimeVoiceModulePanel");
		if (!panel) { panel=document.createElement("div"); panel.id="realtimeVoiceModulePanel"; panel.className="realtime-voice-card error"; form.appendChild(panel); }
		panel.textContent = message;
	}

	function runBoundRealtimeVoice() {
		const sessionKey = getActiveSessionKey();
		if (isEmpty(sessionKey)) { showUnavailable("Bound Realtime Voice requires an active session."); return; }
		const existing = byId("realtimeVoiceRealtimePlugin");
		if (existing) return;
		const host = document.createElement("section");
		host.id = "realtimeVoiceRealtimePlugin";
		host.className = "realtime-voice-realtime-plugin diagnostics-collapsed";
		host.dataset.boundSessionKey = sessionKey;
		const frame = document.createElement("iframe");
		frame.title = "Realtime voice for the active Buffaly session";
		frame.allow = "microphone; autoplay; clipboard-write";
		frame.src = "/web-modules/RealtimeVoice/realtime-voice.html?Embed=1&HostControlled=1&BoundSessionKey=" + encodeURIComponent(sessionKey) + "&BoundSessionName=" + encodeURIComponent(document.title || "current Buffaly session");
		host.appendChild(frame);
		const diagnosticsClose = document.createElement("button");
		diagnosticsClose.id = "realtimeVoiceDiagnosticsClose";
		diagnosticsClose.className = "realtime-voice-diagnostics-close";
		diagnosticsClose.type = "button";
		diagnosticsClose.title = "Close realtime voice diagnostics";
		diagnosticsClose.setAttribute("aria-label", "Close realtime voice diagnostics");
		diagnosticsClose.textContent = "Close diagnostics";
		diagnosticsClose.addEventListener("click", hideDiagnostics);
		host.appendChild(diagnosticsClose);
		const form = byId("opsV2PromptForm");
		(form && form.parentNode ? form.parentNode : document.body).insertBefore(host, form || null);
		const controls = document.createElement("div");
		controls.id = "realtimeVoiceCompactControls";
		controls.className = "realtime-voice-compact-controls";
		controls.dataset.state = "starting";
		controls.innerHTML = "<span id=\"realtimeVoiceCompactOrb\" class=\"realtime-voice-compact-orb\" role=\"status\" aria-live=\"polite\" aria-label=\"Realtime voice: starting\"></span><button id=\"realtimeVoiceCompactStop\" class=\"realtime-voice-compact-stop\" type=\"button\">Stop</button><button id=\"realtimeVoiceCompactDiagnostics\" class=\"realtime-voice-compact-diagnostics\" type=\"button\" title=\"Open realtime voice diagnostics\" aria-label=\"Open realtime voice diagnostics\" aria-expanded=\"false\">?</button>";
		byId("realtimeVoiceVoiceButton")?.parentNode?.appendChild(controls);
		controls.querySelector("#realtimeVoiceCompactStop").addEventListener("click", () => stopBoundRealtimeVoice("user-stop"));
		controls.querySelector("#realtimeVoiceCompactDiagnostics").addEventListener("click", toggleDiagnostics);
		activeFrame = frame;
		frameReady = false;
		const button = byId("realtimeVoiceVoiceButton");
		if (button) button.hidden = true;
		setVoiceButtonRunning(true);
	}

	function closeBoundRealtimeVoice() {
		if (byId("realtimeVoiceRealtimePlugin")) stopBoundRealtimeVoice("host-close");
	}

	function closeIfSessionChanged() {
		const host = byId("realtimeVoiceRealtimePlugin");
		if (host && host.dataset.boundSessionKey !== getActiveSessionKey()) closeBoundRealtimeVoice();
	}
	function injectButton() {
		ensureStyles();
		if (byId("realtimeVoiceVoiceButton")) return true;
		const actions = document.querySelector(".ops-v2-composer-actions");
		if (!actions) return false;
		actions.classList.add("realtime-voice-actions-host");
		let left = actions.querySelector(".realtime-voice-actions-left");
		if (!left) {
			left = document.createElement("div");
			left.className = "realtime-voice-actions-left";
			actions.insertBefore(left, actions.firstChild);
		}
		const voiceButton = document.createElement("button");
		voiceButton.id = "realtimeVoiceVoiceButton";
		voiceButton.className = "realtime-voice-button realtime-voice-voice-button";
		voiceButton.type = "button";
		voiceButton.title = "Talk about this session";
		voiceButton.setAttribute("aria-label", "Talk about this session");
		voiceButton.innerHTML = "<span aria-hidden=\"true\">⚡</span>";
		voiceButton.addEventListener("click", function (event) { event.preventDefault(); runBoundRealtimeVoice(); });
		left.appendChild(voiceButton);
		return true;
	}

	function routeGlobalNavigation() {
		if (window.BuffalyNavigationData && Array.isArray(window.BuffalyNavigationData.sections)) {
			for (const section of window.BuffalyNavigationData.sections) {
				for (const item of (section.items || [])) {
					if (item.title === "Realtime Agent Voice") item.href = "/web-modules/RealtimeVoice/realtime-voice.html";
				}
			}
		}
		for (const anchor of document.querySelectorAll('a[href="/buffaly-agent-realtime-voice.html"]')) {
			anchor.href = "/web-modules/RealtimeVoice/realtime-voice.html";
		}
	}

	function init() {
		routeGlobalNavigation();
		window.setInterval(routeGlobalNavigation, 1000);
		window.setInterval(closeIfSessionChanged, 500);
		if (injectButton()) return;
		let attempts = 0;
		const timer = window.setInterval(function () {
			attempts += 1;
			if (injectButton() || attempts > 40) window.clearInterval(timer);
		}, 250);
	}

	window.addEventListener("message", receiveFrameMessage);
	window.addEventListener("beforeunload", () => { if (frameReady) postFrameCommand("RealtimeVoice.Host.Stop", "page-unload"); });
	if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
	else init();
}());
