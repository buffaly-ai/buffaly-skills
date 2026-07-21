(function () {
	"use strict";
	const els = {
		sessionKey: document.getElementById("sessionKey"), agentName: document.getElementById("agentName"),
		badge: document.getElementById("connectionBadge"), info: document.getElementById("infoOutput"),
		ledger: document.getElementById("ledgerOutput"), operation: document.getElementById("operationOutput"), sourceSessionKey: document.getElementById("sourceSessionKey"), error: document.getElementById("error"),
		bind: document.getElementById("bindButton"), infoButton: document.getElementById("infoButton"),
		initialize: document.getElementById("initializeButton"), getLedger: document.getElementById("getLedgerButton"), addEntry: document.getElementById("addEntryButton"), removeEntry: document.getElementById("removeEntryButton")
	};
	let bound = false;

	function setBusy(text) { els.badge.className = "badge busy"; els.badge.textContent = text; els.error.hidden = true; }
	function setBound() { bound = true; els.badge.className = "badge bound"; els.badge.textContent = "Bound"; [els.infoButton, els.initialize, els.getLedger, els.addEntry, els.removeEntry, els.sourceSessionKey].forEach(x => x.disabled = false); }
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
	function showLedger(value) { els.ledger.textContent = JSON.stringify(value, null, 2); }
	function requestedSourceSessionKey() { const value = els.sourceSessionKey.value.trim(); if (!value) throw new Error("Source session key is required."); return value; }
	async function mutate(prototypeName, busyLabel) {
		setBusy(busyLabel);
		const receipt = JSON.parse(await invoke(prototypeName, { sourceSessionKey: requestedSourceSessionKey() }));
		els.operation.textContent = JSON.stringify({ Outcome: receipt.Outcome, SourceSessionKey: receipt.SourceSessionKey }, null, 2);
		showLedger(receipt.Ledger);
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
	els.initialize.addEventListener("click", async function () { try { setBusy("Initializing"); showLedger(JSON.parse(await invoke("ToInitializeSessionWorkLedger", {}))); setBound(); } catch (error) { fail(error); } });
	els.getLedger.addEventListener("click", async function () { try { setBusy("Reading ledger"); showLedger(JSON.parse(await invoke("ToGetSessionWorkLedger", {}))); setBound(); } catch (error) { fail(error); } });
	els.addEntry.addEventListener("click", async function () { try { await mutate("ToAddSessionWorkEntry", "Adding session"); } catch (error) { fail(error); } });
	els.removeEntry.addEventListener("click", async function () { try { await mutate("ToRemoveSessionWorkEntry", "Removing session"); } catch (error) { fail(error); } });
}());
