/**
 * KCS Utility Module: MasterPage
 * ------------------------------------------------------------
 * Glue code that bootstraps the admin master page: message banners,
 * input adorners, validation scaffolding, and menu behaviours. When a
 * page loads this script wires the shared `UserMessages` instance and
 * enriches controls via ControlUtil helpers so the layout feels
 * consistent everywhere.
 *
 * Key responsibilities
 *  - Instantiates UserMessages and persists queued toast/banner state.
 *  - Applies money/date masks and validation to inputs via SetupInputs.
 *  - Exposes helpers like `BindJsToCss` so feature pages can re-run the
 *    control wiring after injecting HTML (modal loads, Ajax panels, etc.).
 *
 * Usage example – re-run bindings after inserting partial markup:
 * ```js
 * JsonMethod.call("/Invoices.aspx", "RenderPreview", args, function(html) {
 *     _$("previewHost").setHtml(html);
 *     BindJsToCss("previewHost");
 * });
 * ```
 *
 * Usage example – queue a toast that survives navigation:
 * ```js
 * UserMessages.QueueSuccess("Invoice saved successfully.");
 * UserMessages.Save(); // persists into session storage until next page load
 * ```
 */
var UserMessages = null;

Page.AddOnload(function () {
	UserMessages = new UserMessagesClass();
	UserMessages.MessagesContainerID = "divMessages";
	UserMessages.OnFulfillMessage = UserMessages_ToastrFulfill;
	UserMessages.DisplayAll();
});

Page.AddOnUnload(function () {
	if (null != UserMessages)
		UserMessages.Save();
});


function BindJsToCss(oParent) {
	oParent = ControlUtil.GetControl(oParent || document.body);
	SetupInputs(oParent);
}


// Ensures search terms entered into a grid's search box are highlighted in the rendered rows
// so users can immediately spot matching values. Many grid pages call this helper to wire the
// highlighting into JsonWsGrid callbacks.
function ApplySearchHighlight(oGrid) {
	if (!ObjectUtil.HasValue(oGrid))
		return;

	//var fOnDataReceived = oGrid.OnDataReceived;

	//oGrid.OnDataReceived = function (oRes) {
	//	if (ObjectUtil.HasValue(fOnDataReceived))
	//		oRes = fOnDataReceived.apply(oGrid, arguments);

	//	let sSearch = oGrid.GetSearchData();
	//	if (!StringUtil.IsEmpty(sSearch) && sSearch.length >= 3) {
	//		// Create a regular expression that matches the search string but not within HTML tags
	//		const regex = new RegExp(`(?!<[^>]*)${sSearch}(?![^<]*>)`, 'gi');
	//		oRes = oRes.replace(regex, "<span class='SearchFound'>$&</span>");
	//	}
	//	return oRes;
	//};
}


function SetupInputs(oParent) {
	oParent = _$(oParent || document.body);

	ControlUtil.GetChildren(oParent, ".InputMoney").forEach(function (oInput) {
		oInput.maxlength = 10;
		ControlUtil.AddEvent(oInput, "blur", function () { FormatMoney(oInput); });
		oInput.setValue = function (val) {
			this.value = StringToMoney(val);
		};
		oInput.getValue = function () {
			return CleanDouble(this.value);
		};
		oInput.setValue(oInput.value);
	});

	ControlUtil.GetChildren(oParent, ".InputDecimal").forEach(function (oInput) {
		ControlUtil.AddEvent(oInput, "blur", function () { oInput.value = StringToDecimal(oInput.value); });
		oInput.setValue = function (val) {
			this.value = StringToDecimal(val);
		};
		oInput.getValue = function () {
			return CleanDouble(this.value);
		};
		oInput.setValue(oInput.value);
	});

	ControlUtil.GetChildren(oParent, ".InputInteger").forEach(function (oInput) {
		ControlUtil.AddEvent(oInput, "blur", function () { oInput.value = StringToInteger(oInput.value); });
		oInput.setValue = function (val) {
			this.value = StringToInteger(val);
		};
		oInput.getValue = function () {
			return CleanInt(this.value);
		};
		oInput.setValue(oInput.value);
	});


	ControlUtil.GetChildren(oParent, ".InputPercent").forEach(function (oInput) {
		var oWrapper = $$$(["div", { 'class': "input-group" },
			["span", { "class": "input-group-addon" }, "%"]
		]);

		oInput.parentNode.insertBefore(oWrapper, oInput);
		oWrapper.prepend(oInput);

		oInput.maxlength = 7;
		ControlUtil.AddEvent(oInput, "blur", function () { FormatPercent(oInput); });
	});

	ControlUtil.GetChildren(oParent, ".InputPhone").forEach(function (oInput) {
		oInput.maxlength = 255;
		ControlUtil.AddEvent(oInput, "blur", function () { FormatPhone(oInput) });
	});

	ControlUtil.GetChildren(oParent, ".Year").forEach(function (oYear) {
		oYear.innerText = new Date().getFullYear();
	});

	ControlUtil.GetChildren(oParent, ".modal").forEach(function (oModal) {
		if (!oModal.hasAttribute("data-bs-backdrop")) {
			oModal.setAttribute("data-bs-backdrop", "static");
		}
		Page.Modals[oModal.id] = new ModalControl(oModal.id);
	});

	ControlUtil.GetChildren(oParent, "input[list]").forEach(function (oDdl) {
		ControlUtil.AddEvent(oDdl, "focus", Master_EditableDdlFocus);
		ControlUtil.AddEvent(oDdl, "blur", Master_EditableDdlBlur);
	});

	ControlUtil.GetChildren(oParent, ".InputData").forEach(x => CreateJsonEditor(x));

	ControlUtil.GetChildren(oParent, ".DisplayMarkdown").forEach(x => {
		if (!x.innerHTML.trim()) return;

		if (ShouldSkipMarkdownFormatting(x)) {
			return;
		}

		// Safe to convert Markdown → HTML
		x.innerHTML = marked.parse(x.innerHTML.trim());
	});

	ControlUtil.GetChildren(oParent, ".RoundedNumber").forEach(OnFormatRoundedNumber);

	ControlUtil.GetChildren(oParent, ".InputMarkdown").forEach(x => {

		let sPreview = x.getAttribute("data-preview");
		let previewElement = null;
		if (!StringUtil.IsEmpty(sPreview)) {
			previewElement = _$(sPreview);

			if (previewElement) {
				const htmlContent = marked.parse(ControlUtil.GetValue(x));
				previewElement.innerHTML = htmlContent;
			}
		}

		let oEditor = CodeMirror.fromTextArea(x, {
			mode: "markdown", // Markdown editing mode
			indentWithTabs: true,
			smartIndent: true,
			lineNumbers: true,
			matchBrackets: true,
			lineWrapping: true // Enable line wrapping
		});

		// Update Preview on Blur
		oEditor.on('blur', () => {
			const markdownContent = oEditor.getValue();
			ControlUtil.SetValue(x, markdownContent);

			if (previewElement) {
				const htmlContent = marked.parse(markdownContent);
				previewElement.innerHTML = htmlContent;
			}
		});

		// Optional: Sync with external changes
		ControlUtil.AddChange(x, function () {
			oEditor.setValue(ControlUtil.GetValue(x));
			if (previewElement) {
				const htmlContent = marked.parse(ControlUtil.GetValue(x));
				previewElement.innerHTML = htmlContent;
			}
		});
	});

	ControlUtil.GetChildren(oParent, ".InputJavascript").forEach(x => {


		let oEditor = CodeMirror.fromTextArea(x, {
			mode: "javascript",
			indentWithTabs: true,
			smartIndent: true,
			lineNumbers: true,
			matchBrackets: true,
			lineWrapping: true // Enable line wrapping
		});

		// Update Preview on Blur
		oEditor.on('blur', () => {
			const sContent = oEditor.getValue();
			ControlUtil.SetValue(x, sContent);
		});

		// Optional: Sync with external changes
		ControlUtil.AddChange(x, function () {
			oEditor.setValue(ControlUtil.GetValue(x));
		});
	});

	ControlUtil.GetChildren(oParent, ".InputkScript").forEach(x => {

		CodeMirror.defineMode("kscript", function (config) {
			return CodeMirror.multiplexingMode(
				CodeMirror.getMode(config, "htmlmixed"),
				{
					open: "<" + "%", close: "%" + ">",
					mode: CodeMirror.getMode(config, "text/plain"),
					delimStyle: "delimit"
				}
			);
		});

		let oEditor = CodeMirror.fromTextArea(x, {
			mode: "kscript",
			indentWithTabs: true,
			smartIndent: true,
			lineNumbers: true,
			matchBrackets: true,
			lineWrapping: true // Enable line wrapping
		});

		// Update Preview on Blur
		oEditor.on('blur', () => {
			const sContent = oEditor.getValue();
			ControlUtil.SetValue(x, sContent);
		});

		// Optional: Sync with external changes
		ControlUtil.AddChange(x, function () {
			oEditor.setValue(ControlUtil.GetValue(x));
		});

		x.Editor = oEditor;
	});

	ControlUtil.GetControl(oParent).querySelectorAll(".CollapsedDisplay").forEach(function (el) {
		OnFormatCollapsedDisplay(el);
	});
}

function CreateJsonEditor(oInput) {
	if (typeof CodeMirror !== 'undefined') {
		var oEditor = CodeMirror.fromTextArea(oInput, {
			lineNumbers: true,
			mode: 'application/ld+json',
			indentWithTabs: true,
			indentUnit: 4,
			tabSize: 4,
			lineWrapping: true,
		});

		function formatJson(jsonString) {
			try {
				if (!StringUtil.IsEmpty(jsonString)) {
					const parsedJson = JSON.parse(jsonString);
					const formattedJson = JSON.stringify(parsedJson, null, 4);
					jsonString = formattedJson;
				}
			} catch (e) {
				console.error('Invalid JSON:', e);
			}
			return jsonString;
		}

		// Function to format and set editor value
		function formatAndSetEditorValue(jsonString) {
			const formattedJson = formatJson(jsonString);
			oEditor.setValue(formattedJson);
		}

		// Initial formatting
		formatAndSetEditorValue(oInput.value);

		// Format JSON on input change (e.g., programmatic updates)
		ControlUtil.AddChange(oInput, function () {
			const formattedJson = formatJson(oInput.value);
			oEditor.setValue(formattedJson);
		});

		// Validate and format JSON when the editor loses focus
		oEditor.on('blur', function () {
			const formattedJson = formatJson(oEditor.getValue());
			oInput.value = formattedJson;
			oEditor.setValue(formattedJson);
		});

		return oEditor;
	}
}
function Master_EditableDdlFocus(evt) {

	let ctrl = evt.target;
	let sValue = ctrl.value;
	if (!StringUtil.IsEmpty(sValue))
		ctrl.setAttribute('placeholder', sValue);
	ctrl.value = ''

}


function Master_EditableDdlBlur(evt) {

	let ctrl = evt.target;
	let sValue = ctrl.value;
	if (StringUtil.IsEmpty(sValue))
		ctrl.value = ctrl.getAttribute('placeholder');
}


class ModalControl {

	ContentElementID = '';
	DisableBackground = true;
	BackdropOverride = undefined;

	constructor(sID) {
		this.ContentElementID = sID;
		this._InitializeBackdropSettings();
	}

	IsVisible = false;


	ShowContent(e) {
		var oBackdrop = this.BackdropOverride;
		if (typeof oBackdrop === 'undefined') {
			oBackdrop = this.DisableBackground ? "static" : true;
		}
		jQuery("#" + this.ContentElementID).modal({
			backdrop: oBackdrop,
			keyboard: true
		}
		);

		jQuery("#" + this.ContentElementID).modal("show");

		_$(this.ContentElementID).getElements(".ModalFocus").forEach(TryFocus);
		this.IsVisible = true;
		return false;
	}

	HideContent() {
		if (window.jQuery && jQuery.fn.modal)
			jQuery("#" + this.ContentElementID).modal('hide');
		this.IsVisible = false;
		return false;
	}
}

ModalControl.NormalizeBackdropValue = function (value) {
	if (null == value) {
		return value;
	}

	if (typeof value === 'string') {
		var strValue = value.trim().toLowerCase();
		if (strValue === 'false' || strValue === 'no' || strValue === 'none' || strValue === '0') {
			return false;
		}
		if (strValue === 'true' || strValue === 'yes' || strValue === '1') {
			return true;
		}
		if (strValue === 'static') {
			return 'static';
		}
	}

	return value;
};

ModalControl.prototype._InitializeBackdropSettings = function () {
	var oModalElement = document.getElementById(this.ContentElementID);
	if (!oModalElement) {
		return;
	}

	var sBackdropAttribute = oModalElement.getAttribute("data-bs-backdrop");
	if (null == sBackdropAttribute || sBackdropAttribute === '') {
		sBackdropAttribute = 'static';
		oModalElement.setAttribute("data-bs-backdrop", "static");
	}

	var oNormalizedBackdrop = ModalControl.NormalizeBackdropValue(sBackdropAttribute);

	if (oNormalizedBackdrop === false || oNormalizedBackdrop === true) {
		this.BackdropOverride = oNormalizedBackdrop;
		this.DisableBackground = false;
	}
	else if (oNormalizedBackdrop === 'static') {
		this.BackdropOverride = undefined;
		this.DisableBackground = true;
	}
	else if (typeof oNormalizedBackdrop !== 'undefined' && oNormalizedBackdrop !== null) {
		this.BackdropOverride = oNormalizedBackdrop;
		this.DisableBackground = false;
	}
};

const MasterPage = {

	m_bOnloadRun: false,
	m_Onloads: [],

	//Use this method if a script should be loaded after the MasterPage's js is loaded (which is later than Page.AddOnload)
	AddOnload: function (oVar) {
		if (MasterPage.m_bOnloadRun) { //Scripts loaded after page load should still run correctly
			if (Globals.ReportErrors) {
				try {
					oVar();
				}
				catch (err) {
					Page.LogError(err);
				}
			}
			else
				oVar();
		}
		else {
			MasterPage.m_Onloads.push(oVar);
		}
	},

	_RunOnLoads: function () {
		MasterPage.m_Onloads.forEach(function (oVar) {
			MasterPage.m_bOnloadRun = true;
			if (Globals.ReportErrors) {
				try {
					oVar();
				}
				catch (err) {
					Page.LogError(err);
				}
			}
			else
				oVar();
		});
	}
}

//Added to alleviate simple errors
MasterPage.AddOnLoad = MasterPage.AddOnload;


function Master_Load(e) {
	//trace("Master_Load Starting");
	SetupLoginPopup();
	BindJsToCss();
	AddAltToGrids();

	if (typeof Page.LocalStorage === 'undefined') {
		Page.LocalStorage = new LocalStorage();
		Page.LocalStorage.GetValue = function (sKey) {
			return Page.LocalStorage.get(UrlUtil.GetUrlWithoutParams(document.location.href) + sKey);
		}
		Page.LocalStorage.SetValue = function (sKey, oValue) {
			Page.LocalStorage.set(UrlUtil.GetUrlWithoutParams(document.location.href) + sKey, oValue);
		}
	}

	var bShowQuickHelp = Page.LocalStorage.get("ShowQuickHelp");

	if (bShowQuickHelp && typeof ShowQuickHelp !== 'undefined')
		ShowQuickHelp();
	//trace("Master_Load Stopping");

	MasterPage._RunOnLoads();
}

/**
 * Striping helper for
 *   • table-based “Grid” layouts
 *   • div-based “Inputs” layouts (rows of .row)
 *
 * New in this revision
 *   • Removes margin-bottom from .row (replaced by padding)
 *   • Adds Bootstrap 5 borders so each Inputs row looks like a table row
 *   • Background colour spans full width (label + editor column)
 */
function AddAltToGrids() {

	const grids = document.querySelectorAll(".Grid, .Inputs");

	grids.forEach(function (grid) {

		/* ───────────────────── tables ───────────────────── */
		if (grid.tagName.toLowerCase() === "table") {

			let stripe = true;

			grid.querySelectorAll(":scope > tbody > tr, :scope > tr")
				.forEach(function (tr) {

					if (tr.classList.contains("Hidden")) return;

					tr.classList.remove("Alt", "table-light");
					tr.classList.toggle("table-light", stripe);

					stripe = !stripe;
				});
			return;
		}

		/* ──────────────── div-based Inputs ──────────────── */
		const rows = grid.querySelectorAll(":scope > .row");
		if (rows.length === 0) return;

		let stripe = false;

		rows.forEach(function (row, idx) {

			if (row.classList.contains("Hidden")) return;

			/* layout tweaks: remove mb-3, add uniform padding */
			row.classList.remove("mb-3");
			row.classList.add("py-1");

			/* borders: full-width top/bottom like a table row */
			row.classList.remove("border-top", "border-bottom");
			if (idx === 0) row.classList.add("border-top");
			if (idx < rows.length - 1) row.classList.add("border-bottom");

			/* clear previous stripe, then apply */
			row.classList.remove("Alt", "bg-light", "table-light");
			Array.from(row.children).forEach(function (child) {
				child.classList.remove("bg-light", "table-light");
			});

			if (stripe) {
				row.classList.add("bg-light");
				Array.from(row.children).forEach(function (child) {
					child.classList.add("bg-light");
				});
			}

			stripe = !stripe;
		});
	});
}



Page.AddOnLoad(Master_Load);

function TryFocus(oCtrl) {
	if (oCtrl && ObjectUtil.HasValue(oCtrl.focus))
		oCtrl.focus();
}


Page.AddOnload(function () {
	$$(".Focus").forEach(TryFocus);
});

function EnsureSessionExpiredModal() {
	var oModal = document.getElementById("divSessionExpired");

	if (!oModal) {
		const sMarkup = `
                        <div class="modal fade" id="divSessionExpired" tabindex="-1" role="dialog" aria-labelledby="sessionExpiredTitle" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
                                <div class="modal-dialog modal-dialog-centered" role="document">
                                        <div class="modal-content">
                                                <div class="modal-header">
                                                        <h5 class="modal-title" id="sessionExpiredTitle">Session Expired</h5>
                                                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                </div>
                                <div class="modal-body">
                                        <p>Your session has expired. Please sign in again to continue.</p>
                                        <div class="mb-3">
                                                <label for="txtLoginPopup_Email" class="form-label">Email</label>
                                                <input type="email" class="form-control" id="txtLoginPopup_Email" data-bind="Login" autocomplete="username" />
                                        </div>
                                        <div class="mb-0">
                                                <label for="txtLoginPopup_Password" class="form-label">Password</label>
                                                <input type="password" class="form-control" id="txtLoginPopup_Password" data-bind="Password" autocomplete="current-password" />
                                        </div>
                                                </div>
                                                <div class="modal-footer">
                                                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                                        <button type="button" class="btn btn-primary" id="txtLoginPopup_Submit">Sign In</button>
                                                </div>
                                        </div>
                                </div>
                        </div>`;

		document.body.insertAdjacentHTML('beforeend', sMarkup);
		oModal = document.getElementById("divSessionExpired");
		if (oModal) {
			BindJsToCss(oModal);
		}
	}

	if (oModal && !document.getElementById("txtLoginPopup_Submit")) {
		var oFooter = oModal.querySelector(".modal-footer");
		if (!oFooter) {
			oFooter = document.createElement("div");
			oFooter.className = "modal-footer";
			oModal.appendChild(oFooter);
		}

		var oLoginButton = document.createElement("button");
		oLoginButton.type = "button";
		oLoginButton.className = "btn btn-primary";
		oLoginButton.id = "txtLoginPopup_Submit";
		oLoginButton.innerText = "Sign In";
		oFooter.appendChild(oLoginButton);
	}

	if (oModal && !oModal.querySelector("[data-bind='Login'], [kcs\\:FieldName='Login']")) {
		var oBody = oModal.querySelector(".modal-body");
		if (!oBody) {
			oBody = document.createElement("div");
			oBody.className = "modal-body";
			oModal.appendChild(oBody);
		}

		oBody.insertAdjacentHTML('beforeend', `
                        <div class="mb-3">
                                <label for="txtLoginPopup_Email" class="form-label">Email</label>
                                <input type="email" class="form-control" id="txtLoginPopup_Email" data-bind="Login" autocomplete="username" />
                        </div>
                `);
	}

	if (oModal && !oModal.querySelector("[data-bind='Password'], [kcs\\:FieldName='Password']")) {
		var oBody2 = oModal.querySelector(".modal-body");
		if (!oBody2) {
			oBody2 = document.createElement("div");
			oBody2.className = "modal-body";
			oModal.appendChild(oBody2);
		}

		oBody2.insertAdjacentHTML('beforeend', `
                        <div class="mb-0">
                                <label for="txtLoginPopup_Password" class="form-label">Password</label>
                                <input type="password" class="form-control" id="txtLoginPopup_Password" data-bind="Password" autocomplete="current-password" />
                        </div>
                `);
	}

	if (oModal) {
		var oPasswordInput = oModal.querySelector("#txtLoginPopup_Password");
		if (oPasswordInput && !oPasswordInput.closest("form")) {
			var oBody3 = oModal.querySelector(".modal-body");
			if (oBody3) {
				var oLoginForm = document.createElement("form");
				oLoginForm.id = "frmLoginPopup";
				oLoginForm.setAttribute("autocomplete", "on");
				oLoginForm.setAttribute("onsubmit", "return false;");

				while (oBody3.firstChild) {
					oLoginForm.appendChild(oBody3.firstChild);
				}

				oBody3.appendChild(oLoginForm);
			}
		}
	}
}

function EnsureJsonMethodGlobalHandlersPolyfill() {
	if (typeof JsonMethod === 'undefined' || null === JsonMethod) {
		return;
	}

	if (typeof JsonMethod.setGlobalHandlers === 'function') {
		return;
	}

	if (JsonMethod.__setGlobalHandlersPolyfillApplied) {
		return;
	}

	JsonMethod.__setGlobalHandlersPolyfillApplied = true;

	var oGlobalHandlers = {
		onError: null,
		onSessionExpired: null
	};

	var fOriginalCallWithInitializer = JsonMethod.callWithInitializer;
	if (typeof fOriginalCallWithInitializer === 'function') {
		JsonMethod.callWithInitializer = function (oInitializer) {
			oInitializer = oInitializer || {};

			if (!oInitializer.onErrorReceived && typeof oGlobalHandlers.onError === 'function') {
				oInitializer.onErrorReceived = oGlobalHandlers.onError;
			}

			if (!oInitializer.onSessionExpired && typeof oGlobalHandlers.onSessionExpired === 'function') {
				oInitializer.onSessionExpired = oGlobalHandlers.onSessionExpired;
			}

			return fOriginalCallWithInitializer.call(JsonMethod, oInitializer);
		};
	}

	JsonMethod.setGlobalHandlers = function (handlers) {
		oGlobalHandlers.onError = null;
		oGlobalHandlers.onSessionExpired = null;

		if (handlers) {
			if (typeof handlers.onError === 'function') {
				oGlobalHandlers.onError = handlers.onError;
			}

			if (typeof handlers.onSessionExpired === 'function') {
				oGlobalHandlers.onSessionExpired = handlers.onSessionExpired;
			}
		}
	};
}

function SetupLoginPopup() {
	EnsureSessionExpiredModal();

	EnsureJsonMethodGlobalHandlersPolyfill();

	Page.HandleSessionExpired = function (fOnLogin) {
		EnsureSessionExpiredModal();
		ControlUtil.AddClick("txtLoginPopup_Submit", function () {
			OnLoginPopup(fOnLogin)
		});
		jQuery("#divSessionExpired").modal('show');
	}

	JsonMethod.setGlobalHandlers({
		onSessionExpired: function (retryCallback) {
			if (typeof Page !== 'undefined' && typeof Page.HandleSessionExpired === 'function') {
				Page.HandleSessionExpired(function () {
					if (typeof retryCallback === 'function') {
						retryCallback();
					}
				});
			}
			else if (typeof retryCallback === 'function') {
				retryCallback();
			}
		},

		onError: function (errorObj) {
			Page.HandleUnexpectedError(errorObj);
		}
	});
}

function OnLoginPopup(fOnLogin) {
	let oObj = BlindUnbind("divSessionExpired");

	JsonMethod.call("/JsonWs/Buffaly.Business.Authentication.ashx", "Login", { Email: oObj.Login, Password: oObj.Password },
		function (oRes) {
			if (oRes.IsAuthorized) {
				jQuery("#divSessionExpired").modal('hide');
				if (fOnLogin)
					fOnLogin();
			}
			else {
				alert("Login attempt failed");
			}
		});
}


function IsInteger(s) {
	var valid = false;
	if (null != s && !StringUtil.IsEmpty(s) && !isNaN(s)) {
		valid = parseInt(s, 10) == s;
	}
	return valid;
}


function IsValidQuantity(Quantity, mAx, min, allowPartial) {
	if (isNaN(Quantity) || parseInt(Quantity, 10) > mAx || parseInt(Quantity, 10) < min) {
		return false;
	}

	if (!allowPartial && !IsInteger(Quantity)) {
		return false;
	}
	return true;
}


Page.HandleValidationErrors = function (err) {
	if (err.Error == "Invalid data") {

		console.log("Validation Errors:");
		console.log(err);

		let bFirst = true;
		for (let i in err.Data.ExtendedValidationErrors) {

			let oParent;
			if (err.Data.ParentElementID)
				oParent = _$(err.Data.ParentElementID);
			else
				oParent = _$(document.body);

			let oInputs = ControlUtil.GetChildren(oParent, "[data-bind='" + i + "'], [kcs\\:FieldName='" + i + "']");
			if (oInputs.length > 0) {
				let oInput = oInputs[0];
				if (ControlUtil.HasClass(oInput, "Hidden") || oInput.style.display == "none")
					oInput = oInput.parentNode;

				ControlUtil.AddClass(oInput, "input_error");
				if (null != oInput.setCustomValidity) {
					oInput.setCustomValidity(err.Data.Validators[i].InvalidMessage);
					oInput.reportValidity();
				}

				/*oInput.tooltip=new mBox.Tooltip({
					content: '<p style="color: #457699; font-size:14px">Invalid Input</p><p style="margin-top:10px">'+err.Data.Validators[i].InvalidMessage+'</p>',
					attach: oInput,
					width: 300,
					position: { x: 'right', y: 'center' },
					offset: { x: 10 },
					pointer: ['top', 15],
					setStyles: {
						content: { fontSize: 13, lineHeight: 18, padding: '13px 15px' }
					},
					closeOnBodyClick: true
				});*/
			}
		}

		let sMessages = ["Please correct validation errors to continue."];
		err.Data.ValidationErrors.forEach(function (sError) {
			if (!sMessages.includes(sError)) {
				sMessages.push(sError);
			}
		});

		sMessages.forEach(x => {
			UserMessages.DisplayNow(x, "Error");
		});


	}
	else
		throw err;
}

Page.ClearValidationErrors = function () {
	UserMessages.ClearDiv();
	$$(".input_error").forEach(function (oInput) {
		ControlUtil.RemoveClass(oInput, "input_error");
		if (ObjectUtil.HasValue(oInput.tooltip)) {
			oInput.tooltip.close();
			oInput.tooltip.block = true;
		}
	});
}




Page.AddOnload(function () {
	if (jQuery('.datetimepicker').datetimepicker)
		jQuery('.datetimepicker').datetimepicker();
});



function OnFormatRoundedNumber(el) {
	if (!el)
		return;

	var sDecimals = el.getAttribute("data-decimals");
	var iDecimals = 1;

	if (!StringUtil.IsEmpty(sDecimals)) {
		var iCandidate = parseInt(sDecimals, 10);
		if (!isNaN(iCandidate))
			iDecimals = iCandidate;
	}

	var sText = ControlUtil.GetText(el);
	if (StringUtil.IsEmpty(sText))
		return;

	var fValue = parseFloat(sText);
	if (isNaN(fValue))
		return;

	if (iDecimals < 0)
		iDecimals = 0;

	var sFormatted = fValue.toFixed(iDecimals);

	if (0 === iDecimals)
		sFormatted = Math.round(fValue).toString();

	el.textContent = sFormatted;
}


function OnFormatDate(sParent) {

	let date = null;
	let actualdate = null;

	if (sParent != undefined || sParent != null) {
		ControlUtil.GetChildren(sParent, ".Date").forEach(GetDateTimeLocal);
		ControlUtil.GetChildren(sParent, ".DateOnly").forEach(GetDateLocal);
	}
	else {
		$$(".Date").forEach(GetDateTimeLocal);
		$$(".DateOnly").forEach(GetDateLocal);
		$$(".DateOnlyFriendly").forEach(GetDateLocalFriendly);
	}

};

function GetDateLocalFriendly(oDate) {
	let actualdate = ControlUtil.GetText(oDate);

	if (!StringUtil.IsEmpty(actualdate)) {
		let date = DateUtil.UTCToLocal(actualdate);

		let TittleDate = DateUtil.IsDateOnly(date) ? moment(date).format('MMMM D, YYYY').toLocaleString() : moment(date).format('MMMM D, YYYY h:mm:ss A').toLocaleString() + " EST ";
		let InnerDate = moment(date).format('MMMM D, YYYY').toLocaleString();

		oDate.title = TittleDate;
		oDate.innerHTML = InnerDate;
	}

	return oDate;
}
function GetDateTimeLocal(oDate) {
	let actualdate = ControlUtil.GetText(oDate);

	if (!StringUtil.IsEmpty(actualdate)) {
		date = DateUtil.UTCToLocal(actualdate);

		let TittleDate = moment(date).format('M/D/YYYY h:mm:ss A').toLocaleString() + " EST ";
		let InnerDate = moment(date).format('M/D/YYYY h:mm A').toLocaleString();

		oDate.title = TittleDate;
		oDate.innerHTML = InnerDate;
	}

	return oDate;
}

function GetDateLocal(oDate) {
	let actualdate = ControlUtil.GetText(oDate);

	if (!StringUtil.IsEmpty(actualdate)) {

		date = DateUtil.UTCToLocal(actualdate);

		let TittleDate = DateUtil.IsDateOnly(date) ? moment(date).format('M/D/YYYY').toLocaleString() : moment(date).format('M/D/YYYY h:mm:ss A').toLocaleString() + " EST ";
		let InnerDate = moment(date).format('M/D/YYYY').toLocaleString();

		if (StringUtil.IsEmpty(oDate.title))
			oDate.title = TittleDate;
		oDate.innerHTML = InnerDate;
	}

	return oDate;
}

function OnFormatGrid(ctrl, oGrid) {
	if (null == ctrl || null == ControlUtil.GetControl(ctrl))
		return;

	OnFormatDate(ctrl)
	ControlUtil.GetControl(ctrl).querySelectorAll("table.Grid").forEach(x => {
		ControlUtil.RemoveClass(x, "table-striped");
		ControlUtil.AddClass(x, "table table-striped-even table-bordered datatables dataTable");
	});
	ControlUtil.GetControl(ctrl).querySelectorAll('[data-bs-toggle="tooltip"]').forEach(x => {
		new bootstrap.Tooltip(x);
	});

	ControlUtil.GetControl(ctrl).querySelectorAll(".RoundedNumber").forEach(function (el) {
		OnFormatRoundedNumber(el);
	});

	ControlUtil.GetControl(ctrl).querySelectorAll(".CollapsedDisplay").forEach(function (el) {
		OnFormatCollapsedDisplay(el);
	});

	ControlUtil.GetControl(ctrl).querySelectorAll('.DisplayMarkdown').forEach(function (el) {
		if (ShouldSkipMarkdownFormatting(el)) {
			return;
		}

		el.innerHTML = marked.parse(el.textContent.trim());
	});
	ControlUtil.GetControl(ctrl).querySelectorAll('.MarkdownDisplay').forEach(function (el) {
		if (ShouldSkipMarkdownFormatting(el)) {
			return;
		}

		el.innerHTML = marked.parse(el.textContent.trim());
	});

	if (oGrid) {
		let sSearch = oGrid.GetSearchData();
		ctrl = _$(ctrl);
		if (!StringUtil.IsEmpty(sSearch) && sSearch.length >= 3) {
			// Create a regular expression that matches the search string but not within HTML tags
			const regex = new RegExp(`(?!<[^>]*)${sSearch}(?![^<]*>)`, 'gi');
			ctrl.innerHTML = ctrl.innerHTML.replace(regex, "<span class='SearchFound'>$&</span>");
		}
	}


}

function ShouldSkipMarkdownFormatting(el) {
	// Detect pre-existing HTML so we do not clobber deliberate markup such as consent cards.
	if (!el || !el.childNodes) {
		return true;
	}

	for (var i = 0; i < el.childNodes.length; i++) {
		if (el.childNodes[i].nodeType === 1) {
			return true;
		}
	}

	// Empty strings should not be sent through the Markdown parser.
	var text = el.textContent;
	return !text || text.trim().length === 0;
}
function OnFormatCollapsedDisplay(el) {
	const ctrl = ControlUtil.GetControl(el);
	if (!ctrl) return;

	// Use a small delay to ensure CSS (like line-clamp) is applied before measuring.
	requestAnimationFrame(() => {
		const isOverflowing = ctrl.scrollHeight > ctrl.clientHeight;

		if (isOverflowing) {
			// Ensure indicator exists only if text overflows so users can expand/collapse long notes.
			let indicator = ctrl.querySelector(".CollapsedIndicator");
			if (!indicator) {
				indicator = document.createElement("div");
				indicator.className = "CollapsedIndicator";
				indicator.textContent = "Read more…";
				ctrl.appendChild(indicator);
			}

			// Toggle expansion so "Read more..." can be collapsed back down.
			if (!ctrl.getAttribute("data-collapsed-bound")) {
				ctrl.setAttribute("data-collapsed-bound", "true");
				ctrl.addEventListener("mousedown", (e) => {
					e.stopPropagation();
					toggleCollapsedDisplay(ctrl);
				});
			}
		}
	});
}
function toggleCollapsedDisplay(ctrl) {
	if (!ctrl) return;
	var indicator = ctrl.querySelector(".CollapsedIndicator");
	ctrl.classList.toggle("expanded");
	if (indicator) {
		indicator.classList.toggle("hidden");
	}
}


Page.Grids.addEvent('grid-inserted', function (oGrid) {
	oGrid.addEvent("complete", function () {
		ControlUtil.GetChildren(oGrid.ContentControlID, "table.Grid").forEach(table => {
			// Always apply base Bootstrap table classes
			ControlUtil.AddClass(table, "table table-bordered datatables dataTable");

			// Only add 'table-striped' if the table does NOT have the 'no-stripe' class
			if (!table.classList.contains("no-stripe")) {
				ControlUtil.AddClass(table, "table-striped");
			}
			 else { ControlUtil.RemoveClass(table, "table-striped"); }
		});
	});
});


StringUtil.NormalizeCase = function (str) {
	if (StringUtil.IsEmpty(str) || ObjectUtil.GetType(str) != "string")
		return "";
	return str.toLowerCase().replace(/\b\w/g, function (char) {
		return char.toUpperCase();
	});
}


if (!Page.Tabs) {
	Page.Tabs = {};
};

function SaveTab(id) {
	if (Page.Tabs[id] && Page.Tabs[id].OnLoad) {
		Object.keys(Page.Tabs).forEach(key => {
			Page.Tabs[key].IsActive = false;
		});

		Page.Tabs[id].IsActive = true;
		Page.Tabs[id].OnLoad();
	}

	new LocalStorage().set(UrlUtil.GetUrlWithoutParams(document.location.href) + ".activetab", id)
}

function ShowTab(sTabName) {
	var strSelector = 'a[href="#' + sTabName + '"]';
	var oTrigger = document.querySelector(strSelector);

	// Helper to scroll the trigger into view even if the tab was already active
	function scrollToTrigger(el) {
		if (!el || !el.scrollIntoView) return;
		try {
			el.scrollIntoView({
				behavior: "smooth",
				block: "start"
			});
		} catch (err) {
			// Fallback for older browsers
			el.scrollIntoView(true);
		}
	}

	if (oTrigger && typeof bootstrap !== "undefined" && bootstrap.Tab) {
		// Always get or create the tab instance, then show, then scroll
		var oTab = bootstrap.Tab.getOrCreateInstance(oTrigger);
		oTab.show();
		scrollToTrigger(oTrigger);
	} else {
		var arrTriggers = $$('a[href="#' + sTabName + '"]');
		if (arrTriggers && arrTriggers.length > 0) {
			arrTriggers.forEach(function (el) {
				el.click();
				scrollToTrigger(el);
			});
		}
	}
}


function RestoreActiveTab() {
	var activeId = new LocalStorage().get(UrlUtil.GetUrlWithoutParams(document.location.href) + ".activetab");
	let bActivated = false;

	if (activeId) {
		$$(".nav-tabs .nav-link").forEach(x => ControlUtil.RemoveClass(x, "active"));
		$$(".tab-content > .tab-pane").forEach(x => ControlUtil.RemoveClass(x, "active"));

		const tabPane = _$(activeId);
		const tabLink = $$(`.nav-tabs .nav-link[href="#${activeId}"]`)[0];

		if (tabPane && tabLink) {
			ControlUtil.AddClass(tabPane, "active");
			ControlUtil.AddClass(tabLink, "active");
			bActivated = true;

			SaveTab(activeId);
		}
	}

	if (!bActivated) {
		let lstTabs = $$(".tab-content > .tab-pane");
		if (lstTabs && lstTabs.length > 0) {
			SaveTab(lstTabs[0].id);
		}
	}
}


// Apply follow-up date status colors for reminder alerts.
function ApplyReminderFollowupColors() {
	try {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		$$(".js-reminder-followup").forEach(el => {
			if (StringUtil.IsEmpty(el.getAttribute("data-followup-date")))
				return;

			const followUpDate = DateUtil.ParseFollowUpDate(el.getAttribute("data-followup-date"));
			const followUpDay = new Date(followUpDate.getFullYear(), followUpDate.getMonth(), followUpDate.getDate());
			let statusClass = "reminder-followup-today";

			if (followUpDay.getTime() > today.getTime())
				statusClass = "reminder-followup-future";

			if (followUpDay.getTime() < today.getTime())
				statusClass = "reminder-followup-past";

			el.classList.add(statusClass);
		});
	} catch (err) {
		Page.HandleUnexpectedError(err);
	}
}
