/**
 * KCS Utility Module: UserMessages
 * ------------------------------------------------------------
 * Toast/banner broker that buffers messages between server round-trips
 * and surfaces them with consistent styling. The master page initialises
 * this class once, then individual pages queue notifications without
 * worrying about persistence or DOM wiring.
 *
 * Key helpers
 *  - UserMessages.DisplayNow(text, cssClass, isBlocking)
 *      Immediately render a message using the configured fulfilment handler.
 *  - UserMessages.QueueSuccess(text) via project helpers
 *      (most pages expose sugar methods that call Display/Save for you).
 *  - UserMessages.Save() / Load()
 *      Persist pending messages into LocalStorage across navigations.
 *
 * Usage example – queue a banner before redirecting:
 * ```js
 * UserMessages.Display("Settings saved", "Success");
 * UserMessages.Save();
 * window.location = "/Dashboard.aspx";
 * ```
 *
 * Usage example – override fulfilment to use custom toast library:
 * ```js
 * UserMessages.OnFulfillMessage = function(msg) {
 *     toastr[msg.Class.toLowerCase()]?.(msg.Message) || toastr.info(msg.Message);
 * };
 * ```
 */
class UserMessagesClass
{
	_Messages = [];
	_LocalStorage = null;
	_MessagesContainer = null;

	_ErrorNotify = null;

	MessagesContainerID = null;

	MaxMessages = 10;
	_CurrentMessageCount = 0;

	GetMessagesContainer() {
		if (null == this._MessagesContainer)
			this._MessagesContainer = $(this.MessagesContainerID);

		return this._MessagesContainer;
	}

	constructor() {
		this._LocalStorage = new LocalStorage2();
		this.Load();
	}

	GetPending() {
		return this._Messages;
	}

	Display(sMessage, sClass, bIsBlocking) {

		if (this._CurrentMessageCount++ >= this.MaxMessages) { 
			console.log("Max messages reached, not displaying message: " + sMessage);
			return;
		}

		this._Messages.push({
			Message: sMessage,
			Class: ObjectUtil.HasValue(sClass)? sClass:"Message",
			IsBlocking: bIsBlocking
		});
	}

	DisplayAll() {

		this._Messages.forEach(function (oMessage) {
			this.OnFulfillMessage(oMessage);
		}.bind(this));

		this.Clear();
	}

	DisplayNow(sMessage, sClass, bIsBlocking) {
		this.Display(sMessage, sClass, bIsBlocking);
		this.DisplayAll();
	}

	Clear() {
		this._Messages = [];
	}

	ClearDiv() {
		this._Messages = [];
		if (null != this._MessagesContainer)
			this._MessagesContainer.innerHTML = '';
	}

	Save() {
		this._LocalStorage.set("UserMessages", this._Messages);
	}

	Load() {
		var oData = this._LocalStorage.get("UserMessages");
		if (null != oData) {
			this._Messages = oData;
		}
	}

	OnFulfillMessage(oMessage) {
		
	}
}


function UserMessages_ConsoleFulfill(oMessage) {
	console.log(oMessage.Class + " : " + oMessage.Message);
}

function UserMessages_PNotifyFulfill(oMessage) {
	(function ($) {
		$.pnotify({
			title: oMessage.Class,
			text: oMessage.Message,
			history: false,
			type: oMessage.Class.toLowerCase(),
			nonblock: (oMessage.IsBlocking == true ? false : true)
		});
	})(jQuery);
}


function UserMessages_ToastrFulfill(oMessage) {
	(function ($) {

		/*─── reset ───*/
		if (typeof $.toast === 'function' && $('.jq-toast-wrap').length) {
			try { $.toast().reset('all'); } catch (_) { /* ignore */ }
		}

		/*─── prepare ───*/
		let icon = 'info';
		let loaderBg = '#3b98b5';

		if (StringUtil.EqualNoCase(oMessage.Class, 'Error')) {
			icon = 'danger'; loaderBg = '#bf441d';
		} else if (StringUtil.EqualNoCase(oMessage.Class, 'Success')) {
			icon = 'success'; loaderBg = '#5ba035';
		}

		/*─── display ───*/
		if (typeof $.toast === 'function') {
			$.toast({
				heading: oMessage.Class,
				text: oMessage.Message,
				position: 'top-right',
				loaderBg: loaderBg,
				icon: icon,
				hideAfter: 7000,
				stack: 1,
				showHideTransition: 'slide'
			});
		} else {
			UserMessages_ConsoleFulfill(oMessage);   // fallback
		}

	})(jQuery);
}
