(function () {
	"use strict";
	const els = {
		sessionKey: document.getElementById("sessionKey"), agentName: document.getElementById("agentName"),
		badge: document.getElementById("connectionBadge"), info: document.getElementById("infoOutput"),
		editor: document.getElementById("ledgerEditor"), error: document.getElementById("error"),
		bind: document.getElementById("bindButton"), infoButton: document.getElementById("infoButton"),
		initialize: document.getElementById("initializeButton"), getLedger: document.getElementById("getLedgerButton"), replace: document.getElementById("replaceButton")
	};
	let bound = false;

	function setBusy(text) { els.badge.className = "badge busy"; els.badge.textContent = text; els.error.hidden = true; }
	function setBound() { bound = true; els.badge.className = "badge bound"; els.badge.textContent = "Bound"; [els.infoButton, els.initialize, els.getLedger, els.replace, els.editor].forEach(x => x.disabled = false); }
	function fail(error) { bound = false; els.badge.className = "badge idle"; els.badge.textContent = "Error"; els.error.textContent = error && error.message ? error.message : String(error); els.error.hidden = false; }
	function binding() { return { sessionKey: els.sessionKey.value.trim(), agentName: els.agentName.value.trim() }; }
	async function invoke(prototypeName, args) {
		const value = binding();
		if (!value.sessionKey) throw new Error("Session key is required.");
		const result = await BuffalyAgentService.RunProtoScriptMethodAsync(value.sessionKey, value.agentName, prototypeName, "Execute", JSON.stringify(args || {}));
		if (typeof result !== "string" || result.length === 0) throw new Error(prototypeName + " returned an empty result.");
		return result;
	}
	async function loadInfo() {
		setBusy("Reading identity");
		const text = await invoke("ToGetSessionWorkCoordinatorInfo", {});
		const info = JSON.parse(text);
		if (info.CoordinatorSkill !== "ActionLearningCoordinatorSkill") throw new Error("The bound runtime is not ActionLearningCoordinatorSkill.");
		els.info.textContent = JSON.stringify(info, null, 2);
		setBound();
	}
	els.bind.addEventListener("click", async function () {
		try {
			setBusy("Creating agent");
			const value = binding();
			await BuffalyAgentService.CreateAgentFromProjectObjectAsync({ sessionKey:value.sessionKey, projectName:"OpsAgent", agentName:value.agentName, initialization:null });
			await loadInfo();
		} catch (error) { fail(error); }
	});
	els.infoButton.addEventListener("click", async function () { try { await loadInfo(); } catch (error) { fail(error); } });
	els.initialize.addEventListener("click", async function () { try { setBusy("Initializing"); els.editor.value = JSON.stringify(JSON.parse(await invoke("ToInitializeSessionWorkLedger", {})), null, 2); setBound(); } catch (error) { fail(error); } });
	els.getLedger.addEventListener("click", async function () { try { setBusy("Reading ledger"); els.editor.value = JSON.stringify(JSON.parse(await invoke("ToGetSessionWorkLedger", {})), null, 2); setBound(); } catch (error) { fail(error); } });
	els.replace.addEventListener("click", async function () { try { setBusy("Replacing ledger"); const ledgerJson = JSON.stringify(JSON.parse(els.editor.value)); await invoke("ToReplaceSessionWorkLedger", { ledgerJson }); els.editor.value = JSON.stringify(JSON.parse(await invoke("ToGetSessionWorkLedger", {})), null, 2); setBound(); } catch (error) { fail(error); } });
}());