(function () {
	"use strict";

	var serviceType = "Buffaly.Agent.ScheduledProcesses.Examples.UserInputCollectorService";
	var service = context.api.createServiceClient(serviceType);
	var initialState = context.InitialState || {};
	var form = context.root.querySelector("[data-secret-form]");
	var result = context.root.querySelector("[data-result]");
	var statusPill = context.root.querySelector("[data-status-pill]");
	var saveButton = form.querySelector("button[type='submit']");
	var keyInput = form.elements.Key;
	var labelInput = form.elements.Label;
	var valueInput = form.elements.Value;
	var keyLabel = context.root.querySelector("[data-key-label]");
	var keyHelp = context.root.querySelector("[data-key-help]");
	var siteTitle = context.root.querySelector("[data-site-title]");
	var visibilityButton = context.root.querySelector("[data-toggle-visibility]");
	var hasSaved = false;

	function text(value) {
		return String(value || "").trim();
	}

	function setStatus(statusText, mode) {
		statusPill.textContent = statusText;
		statusPill.classList.remove("saved", "error");
		if (mode) {
			statusPill.classList.add(mode);
		}
	}

	function showResult(resultText, isError) {
		result.hidden = false;
		result.textContent = resultText;
		result.classList.toggle("error", !!isError);
	}

	function getField(name) {
		return form.elements[name].value.trim();
	}

	function clearSecretValue() {
		valueInput.value = "";
	}

	function hasUnsavedSecretValue() {
		return text(valueInput.value).length > 0;
	}

	function confirmDiscardIfNeeded() {
		if (!hasUnsavedSecretValue()) {
			return true;
		}
		return window.confirm("You entered a private value that has not been saved. Close without saving it?");
	}

	function applyInitialState() {
		var requestedTitle = text(initialState.Title || initialState.DisplayTitle);
		if (requestedTitle) {
			siteTitle.textContent = requestedTitle;
		}
		var requestedKey = text(initialState.SecretKey || initialState.Key);
		var requestedLabel = text(initialState.Label);
		if (requestedKey) {
			keyInput.value = requestedKey;
			keyLabel.textContent = "Secret key";
			keyHelp.textContent = "Buffaly supplied the requested non-secret key name as an editable default. If it already exists, saving will update the stored private value.";
			if (requestedLabel) {
				labelInput.value = requestedLabel;
			}
			valueInput.focus();
			setStatus("Waiting for private value", null);
			return;
		}
		keyInput.focus();
	}

	form.addEventListener("submit", async function (event) {
		event.preventDefault();
		if (!form.reportValidity()) {
			return;
		}

		var request = {
			Key: getField("Key"),
			Label: getField("Label"),
			Value: getField("Value")
		};

		saveButton.disabled = true;
		setStatus("Saving securely...", null);
		showResult("Saving or updating the secret in UserSecrets secure storage...", false);
		try {
			var response = await service.invokeAsync("SaveSecret", { request: request });
			clearSecretValue();
			hasSaved = true;
			setStatus("Saved", "saved");
			showResult("Saved secret for key: " + response.Key + ". The private value was not returned to Buffaly chat or the model.", false);
		} catch (error) {
			setStatus("Error", "error");
			showResult(error && error.message ? error.message : String(error), true);
		} finally {
			saveButton.disabled = false;
		}
	});

	context.root.querySelector("[data-clear]").addEventListener("click", function () {
		clearSecretValue();
		if (!hasSaved) {
			result.hidden = true;
			setStatus("Ready", null);
		}
	});

	function toggleSecretVisibility(event) {
		event.preventDefault();
		event.stopPropagation();
		var showing = visibilityButton.getAttribute("data-visible") === "true";
		valueInput.setAttribute("type", showing ? "password" : "text");
		visibilityButton.setAttribute("data-visible", showing ? "false" : "true");
		visibilityButton.textContent = showing ? "👁" : "🙈";
		visibilityButton.setAttribute("aria-label", showing ? "Show private value" : "Hide private value");
		visibilityButton.setAttribute("title", showing ? "Show private value" : "Hide private value");
		valueInput.focus();
	}

	visibilityButton.addEventListener("pointerdown", function (event) {
		event.preventDefault();
		event.stopPropagation();
	});

	context.root.addEventListener("click", function (event) {
		if (event.target && event.target.closest && event.target.closest("[data-toggle-visibility]")) {
			toggleSecretVisibility(event);
		}
	});

	context.root.querySelector("[data-cancel]").addEventListener("click", function () {
		if (!confirmDiscardIfNeeded()) {
			return;
		}
		context.api.exit({ Action: "cancelled", Saved: hasSaved, Key: getField("Key") });
	});

	context.root.querySelector("[data-exit]").addEventListener("click", function () {
		if (!hasSaved) {
			showResult("Save the secret first, or click Cancel to close without saving.", true);
			setStatus("Save or cancel", "error");
			return;
		}
		context.api.exit({ Action: "done", Saved: true, Key: getField("Key") });
	});

	applyInitialState();
}());
