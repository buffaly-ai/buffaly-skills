(function () {
	"use strict";

	if (!context || !context.root || !context.api) {
		throw new Error("Interactive site context is required.");
	}

	var config = window.ErrorLogDiagnosisSettingsSiteConfig || {};
	var processID = Number(config.ProcessID || 0);
	var serviceType = "Buffaly.Agent.ScheduledProcesses.Examples.ErrorLogDiagnosisSettingsService";
	var currentSettings = null;
	var settingsClient = null;
	var labels = {
		SessionKey: "Session key",
		AgentName: "Agent name",
		CreateChildSession: "Create child session",
		LogDirectory: "Log directory",
		FilePattern: "File pattern",
		PromptContext: "Prompt context",
		MaxInstructionCharacters: "Max instruction characters",
		MaxMatchingLines: "Max matching lines",
		MaxFilesPerRun: "Max files per run",
		MaxBytesPerFile: "Max bytes per file",
		MaxLineCharacters: "Max line characters",
		MaxAgentMessageCharacters: "Max agent message characters",
		ExcludeFileNameContains: "Excluded file-name text",
		HistoryDataSourcePath: "History data-source path",
		DispatchCooldownMinutes: "Dispatch cooldown minutes"
	};
	var displayOrder = [
		"SessionKey",
		"AgentName",
		"CreateChildSession",
		"LogDirectory",
		"FilePattern",
		"PromptContext",
		"MaxInstructionCharacters",
		"MaxMatchingLines",
		"MaxFilesPerRun",
		"MaxBytesPerFile",
		"MaxLineCharacters",
		"MaxAgentMessageCharacters",
		"ExcludeFileNameContains",
		"HistoryDataSourcePath",
		"DispatchCooldownMinutes"
	];
	var settingGroups = [
		{ Title: "Session routing", Fields: ["SessionKey", "AgentName", "CreateChildSession", "PromptContext"] },
		{ Title: "Log source", Fields: ["LogDirectory", "FilePattern", "ExcludeFileNameContains"] },
		{ Title: "Limits", Fields: ["MaxInstructionCharacters", "MaxMatchingLines", "MaxFilesPerRun", "MaxBytesPerFile", "MaxLineCharacters", "MaxAgentMessageCharacters"] },
		{ Title: "History and cooldown", Fields: ["HistoryDataSourcePath", "DispatchCooldownMinutes"] }
	];
	var numericFields = {
		MaxInstructionCharacters: true,
		MaxMatchingLines: true,
		MaxFilesPerRun: true,
		MaxBytesPerFile: true,
		MaxLineCharacters: true,
		MaxAgentMessageCharacters: true,
		DispatchCooldownMinutes: true
	};

	function text(value) {
		return value == null ? "" : String(value);
	}

	function setStatus(message, state) {
		var status = context.root.querySelector("[data-role='status']");
		if (!status) {
			return;
		}
		status.textContent = message;
		if (state) {
			status.setAttribute("data-state", state);
		} else {
			status.removeAttribute("data-state");
		}
	}

	function formatValue(value) {
		if (Array.isArray(value)) {
			return value.length ? value.join("\n") : "(none)";
		}
		if (typeof value === "boolean") {
			return value ? "Yes" : "No";
		}
		if (value == null || value === "") {
			return "(blank)";
		}
		return text(value);
	}

	function cloneSettings(settings) {
		return JSON.parse(JSON.stringify(settings || {}));
	}

	function setMode(mode) {
		var details = context.root.querySelector("[data-role='details']");
		var editor = context.root.querySelector("[data-role='editor']");
		var editButton = context.root.querySelector("[data-action='edit-settings']");
		var saveButton = context.root.querySelector("[data-action='save-settings']");
		var discardButton = context.root.querySelector("[data-action='discard-settings']");
		if (details) {
			details.hidden = mode !== "details";
		}
		if (editor) {
			editor.hidden = mode !== "edit";
		}
		if (editButton) {
			editButton.hidden = mode !== "details";
		}
		if (saveButton) {
			saveButton.hidden = mode !== "edit";
		}
		if (discardButton) {
			discardButton.hidden = mode !== "edit";
		}
	}

	function appendSettingRow(grid, settings, name) {
		var dt = document.createElement("dt");
		var dd = document.createElement("dd");
		dt.textContent = labels[name] || name;
		dd.textContent = formatValue(settings ? settings[name] : null);
		grid.appendChild(dt);
		grid.appendChild(dd);
	}

	function renderSettings(settings) {
		var grid = context.root.querySelector("[data-role='settings-grid']");
		if (!grid) {
			throw new Error("Settings details host is missing from the site HTML.");
		}
		grid.innerHTML = "";
		settingGroups.forEach(function (group) {
			var card = document.createElement("section");
			var title = document.createElement("h4");
			var list = document.createElement("dl");
			card.className = "eld-settings-card";
			title.textContent = group.Title;
			list.className = "eld-settings-grid";
			group.Fields.forEach(function (name) {
				appendSettingRow(list, settings, name);
			});
			card.appendChild(title);
			card.appendChild(list);
			grid.appendChild(card);
		});
		setMode("details");
		setStatus("Settings loaded for process " + processID + ".");
	}

	function bindEditForm(settings) {
		var form = context.root.querySelector("[data-role='settings-form']");
		if (!form) {
			throw new Error("Settings edit form is missing from the site HTML.");
		}
		displayOrder.forEach(function (name) {
			var field = form.querySelector("[data-bind='" + name + "']");
			if (!field) {
				return;
			}
			var value = settings ? settings[name] : null;
			if (field.type === "checkbox") {
				field.checked = value === true;
			} else if (name === "ExcludeFileNameContains") {
				field.value = Array.isArray(value) ? value.join("\n") : "";
			} else {
				field.value = value == null ? "" : text(value);
			}
		});
	}

	function unbindEditForm() {
		var form = context.root.querySelector("[data-role='settings-form']");
		var updated = cloneSettings(currentSettings);
		displayOrder.forEach(function (name) {
			var field = form.querySelector("[data-bind='" + name + "']");
			if (!field || field.disabled) {
				return;
			}
			if (field.type === "checkbox") {
				updated[name] = field.checked === true;
			} else if (name === "ExcludeFileNameContains") {
				updated[name] = field.value.split(/\r?\n/).map(function (line) { return line.trim(); }).filter(function (line) { return line.length > 0; });
			} else if (numericFields[name]) {
				updated[name] = field.value === "" ? 0 : Number(field.value);
			} else {
				updated[name] = field.value;
			}
		});
		return updated;
	}

	async function loadSettings() {
		if (!processID || processID <= 0) {
			throw new Error("A valid processID is required to load Error Log Diagnosis settings.");
		}
		setStatus("Loading settings for process " + processID + "...");
		settingsClient = context.api.createServiceClient(serviceType);
		currentSettings = await settingsClient.GetSettingsAsync(processID);
		renderSettings(currentSettings);
	}

	async function saveSettings() {
		if (!settingsClient) {
			throw new Error("Settings service client is not initialized.");
		}
		setStatus("Saving settings for process " + processID + "...");
		var updated = unbindEditForm();
		currentSettings = await settingsClient.SetSettingsAsync(processID, updated);
		renderSettings(currentSettings);
		setStatus("Settings saved for process " + processID + ". You can edit again or exit.");
	}

	// Use one delegated click handler so controls remain active when the focused host rerenders the mounted site.
	context.root.addEventListener("click", function (event) {
		var target = event.target;
		while (target && target !== context.root && !target.getAttribute("data-action")) {
			target = target.parentNode;
		}
		if (!target || target === context.root) {
			return;
		}
		var action = target.getAttribute("data-action");
		if (!action) {
			return;
		}
		if (event && typeof event.preventDefault === "function") {
			event.preventDefault();
		}

		if (action === "edit-settings") {
			bindEditForm(currentSettings);
			setMode("edit");
			setStatus("Editing local copy. Save writes immediately; discard returns to unchanged details.");
			return;
		}
		if (action === "save-settings") {
			saveSettings().catch(function (error) {
				setStatus(error && error.message ? error.message : text(error), "error");
			});
			return;
		}
		if (action === "discard-settings") {
			void unbindEditForm();
			renderSettings(currentSettings);
			setStatus("Discarded local edits. No settings were saved.");
			return;
		}
		if (action === "exit-site") {
			void context.api.exit({ Action: "done", SiteInstanceId: context.SiteInstanceId, ProcessID: processID });
		}
	});

	loadSettings().catch(function (error) {
		setStatus(error && error.message ? error.message : text(error), "error");
	});
}());
