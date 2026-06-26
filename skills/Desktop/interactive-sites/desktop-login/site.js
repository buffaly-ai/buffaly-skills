const canvas = context.root.querySelector(".desktop-login-canvas");
const shell = context.root.querySelector(".desktop-login-shell");
const mobileKeyboardButton = context.root.querySelector("[data-mobile-keyboard]");
const mobileInputRow = context.root.querySelector(".desktop-login-mobile-input-row");
const mobileInput = context.root.querySelector(".desktop-login-mobile-input");
const mobileSendButton = context.root.querySelector("[data-mobile-send]");
const releaseInputButton = context.root.querySelector("[data-release-input]");
const mobileStatus = context.root.querySelector(".desktop-login-mobile-status");
const inputStatus = context.root.querySelector(".desktop-login-input-status");
const captureBadge = context.root.querySelector(".desktop-login-capture-badge");
const serviceType = "Buffaly.DesktopAutomation.DesktopInteractiveSiteService";
let currentFrame = null;
let pendingImage = null;
let currentDrawRect = null;
let lastPointerClickAt = 0;
let inputSequence = 0;
let isInputCaptured = false;

function resizeCanvasToDisplay() {
	const rect = canvas.getBoundingClientRect();
	const width = Math.max(1, Math.floor(rect.width));
	const height = Math.max(1, Math.floor(rect.height));
	if (canvas.width !== width || canvas.height !== height) {
		canvas.width = width;
		canvas.height = height;
	}
}

function calculateContainRect(frame, canvasWidth, canvasHeight) {
	const frameWidth = Math.max(1, Number(frame.Width) || 1);
	const frameHeight = Math.max(1, Number(frame.Height) || 1);
	const scale = Math.min(canvasWidth / frameWidth, canvasHeight / frameHeight);
	const width = Math.max(1, Math.round(frameWidth * scale));
	const height = Math.max(1, Math.round(frameHeight * scale));
	return {
		Left: Math.floor((canvasWidth - width) / 2),
		Top: Math.floor((canvasHeight - height) / 2),
		Width: width,
		Height: height
	};
}

function drawFrame(frame) {
	if (!frame || !frame.ImageBase64) {
		return;
	}
	currentFrame = frame;
	shell.classList.add("has-frame");
	const image = new Image();
	pendingImage = image;
	image.onload = function () {
		if (pendingImage !== image) {
			return;
		}
		resizeCanvasToDisplay();
		const ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		currentDrawRect = calculateContainRect(frame, canvas.width, canvas.height);
		ctx.drawImage(image, currentDrawRect.Left, currentDrawRect.Top, currentDrawRect.Width, currentDrawRect.Height);
	};
	image.src = "data:" + (frame.ImageMimeType || "image/png") + ";base64," + frame.ImageBase64;
}

function toDesktopPoint(event) {
	if (!currentFrame) {
		throw new Error("Desktop frame is not ready.");
	}
	if (!currentDrawRect) {
		throw new Error("Desktop frame layout is not ready.");
	}
	const rect = canvas.getBoundingClientRect();
	const scaleX = rect.width <= 0 ? 1 : canvas.width / rect.width;
	const scaleY = rect.height <= 0 ? 1 : canvas.height / rect.height;
	const canvasX = (event.clientX - rect.left) * scaleX;
	const canvasY = (event.clientY - rect.top) * scaleY;
	const relativeX = Math.max(0, Math.min(1, (canvasX - currentDrawRect.Left) / currentDrawRect.Width));
	const relativeY = Math.max(0, Math.min(1, (canvasY - currentDrawRect.Top) / currentDrawRect.Height));
	return {
		X: currentFrame.CaptureLeft + Math.round(relativeX * currentFrame.Width),
		Y: currentFrame.CaptureTop + Math.round(relativeY * currentFrame.Height)
	};
}

function buttonName(event) {
	if (event.button === 1) {
		return "middle";
	}
	if (event.button === 2) {
		return "right";
	}
	return "left";
}

function stopEvent(event) {
	if (event && typeof event.preventDefault === "function") {
		event.preventDefault();
	}
	if (event && typeof event.stopPropagation === "function") {
		event.stopPropagation();
	}
}

function isModifierOnlyKey(key) {
	return key === "Shift"
		|| key === "Control"
		|| key === "Alt"
		|| key === "Meta"
		|| key === "CapsLock"
		|| key === "OS";
}

function setMobileStatus(message) {
	if (mobileStatus) {
		mobileStatus.textContent = message || "";
	}
}

function setInputStatus(message, isError) {
	if (inputStatus) {
		inputStatus.textContent = message || "Input idle";
		inputStatus.classList.toggle("is-error", isError === true);
	}
	setMobileStatus(message || "");
}

function updateCaptureState(captured, message) {
	isInputCaptured = captured === true;
	shell.classList.toggle("is-capturing-input", isInputCaptured);
	if (captureBadge) {
		captureBadge.textContent = isInputCaptured ? "Input captured" : "Input not captured";
	}
	setInputStatus(message || (isInputCaptured
		? "Input captured: clicks and keyboard go to the remote window. Press Escape or Release input to stop."
		: "Input not captured: click the canvas once to capture remote input."), false);
}

function captureInput(message) {
	canvas.focus();
	updateCaptureState(true, message);
}

function releaseInput(message) {
	updateCaptureState(false, message);
	canvas.blur();
}

function handleError(error) {
	const message = error && error.message ? error.message : String(error || "Unknown error");
	setInputStatus("Error: " + message, true);
	if (window.console && window.console.error) {
		window.console.error("Desktop login site error", error);
	}
}

function reportAsync(promise, pendingMessage, successMessage) {
	setInputStatus(pendingMessage || "Sending...", false);
	return promise.then(function (value) {
		setInputStatus(successMessage || "Sent", false);
		return value;
	}).catch(handleError);
}

async function sendInput(input) {
	const sessionKey = context.SessionKey || "";
	if (!sessionKey) {
		throw new Error("Interactive site session key is missing; input cannot be routed.");
	}
	if (currentFrame) {
		if (currentFrame.TargetProcessName) {
			input.TargetProcessName = currentFrame.TargetProcessName;
		}
		if (currentFrame.TargetWindowTitleContains) {
			input.TargetWindowTitleContains = currentFrame.TargetWindowTitleContains;
		}
		if (currentFrame.TargetWindowHandle) {
			input.TargetWindowHandle = currentFrame.TargetWindowHandle;
		}
	}
	await context.api.invokeService(serviceType, "SubmitDesktopInputEvent", {
		sessionKey: sessionKey,
		messageKey: context.MessageKey,
		eventJson: JSON.stringify(input)
	});
}

canvas.addEventListener("pointerdown", function (event) {
	if (!currentFrame) {
		return;
	}
	stopEvent(event);
	if (!isInputCaptured) {
		captureInput("Input captured. Click again to send clicks; keyboard now goes to the remote window.");
		lastPointerClickAt = Date.now();
		return;
	}
	if (canvas.setPointerCapture && event.pointerId !== undefined) {
		try {
			canvas.setPointerCapture(event.pointerId);
		} catch {
			// Best effort; pointer capture is not available in every browser context.
		}
	}
	lastPointerClickAt = Date.now();
	const point = toDesktopPoint(event);
	inputSequence += 1;
	reportAsync(sendInput({
		EventType: "pointer-click",
		X: point.X,
		Y: point.Y,
		Button: buttonName(event)
	}), "Sending click #" + inputSequence + "...", "Click #" + inputSequence + " sent");
});

canvas.addEventListener("click", function (event) {
	if (!currentFrame) {
		return;
	}
	if (!isInputCaptured) {
		stopEvent(event);
		captureInput("Input captured. Click again to send clicks; keyboard now goes to the remote window.");
		return;
	}
	if (Date.now() - lastPointerClickAt < 750) {
		stopEvent(event);
		return;
	}
	const point = toDesktopPoint(event);
	inputSequence += 1;
	reportAsync(sendInput({
		EventType: "pointer-click",
		X: point.X,
		Y: point.Y,
		Button: buttonName(event)
	}), "Sending click #" + inputSequence + "...", "Click #" + inputSequence + " sent");
});

canvas.addEventListener("dblclick", function (event) {
	if (!currentFrame) {
		return;
	}
	if (!isInputCaptured) {
		stopEvent(event);
		captureInput("Input captured. Double-click again to send a remote double-click.");
		return;
	}
	const point = toDesktopPoint(event);
	inputSequence += 1;
	reportAsync(sendInput({
		EventType: "pointer-double-click",
		X: point.X,
		Y: point.Y,
		Button: buttonName(event)
	}), "Sending double-click #" + inputSequence + "...", "Double-click #" + inputSequence + " sent");
});

canvas.addEventListener("wheel", function (event) {
	if (!currentFrame) {
		return;
	}
	event.preventDefault();
	if (!isInputCaptured) {
		captureInput("Input captured. Scroll again to send wheel input to the remote window.");
		return;
	}
	const point = toDesktopPoint(event);
	inputSequence += 1;
	reportAsync(sendInput({
		EventType: "wheel",
		X: point.X,
		Y: point.Y,
		DeltaX: Math.round(event.deltaX / 120),
		DeltaY: Math.round(event.deltaY / 120)
	}), "Sending wheel #" + inputSequence + "...", "Wheel #" + inputSequence + " sent");
}, { passive: false });

canvas.addEventListener("keydown", function (event) {
	if (event.key === "Escape") {
		stopEvent(event);
		releaseInput("Input released. Click the canvas once to capture remote input again.");
		return;
	}
	if (!isInputCaptured) {
		return;
	}
	const key = event.key || "";
	if (!key || isModifierOnlyKey(key)) {
		return;
	}
	inputSequence += 1;
	if (key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
		event.preventDefault();
		reportAsync(sendInput({
			EventType: "text",
			Text: key
		}), "Sending key #" + inputSequence + "...", "Key #" + inputSequence + " sent");
		return;
	}
	const parts = [];
	if (event.ctrlKey) {
		parts.push("ctrl");
	}
	if (event.altKey) {
		parts.push("alt");
	}
	if (event.shiftKey && key.length !== 1) {
		parts.push("shift");
	}
	if (event.metaKey) {
		parts.push("win");
	}
	parts.push(key);
	event.preventDefault();
	reportAsync(sendInput({
		EventType: "key",
		Key: parts.join("+")
	}), "Sending key #" + inputSequence + "...", "Key #" + inputSequence + " sent");
});

canvas.addEventListener("focus", function () {
	if (!isInputCaptured) {
		setInputStatus("Canvas focused, but input is not captured yet. Click the canvas once to capture remote input.", false);
	}
});

canvas.addEventListener("blur", function () {
	if (isInputCaptured) {
		updateCaptureState(false, "Input released because the canvas lost focus.");
	} else {
		setInputStatus("Input not captured: click the canvas once to capture remote input.", false);
	}
});

if (releaseInputButton) {
	releaseInputButton.addEventListener("click", function (event) {
		stopEvent(event);
		releaseInput("Input released. Click the canvas once to capture remote input again.");
	});
}



async function sendMobileText() {
	const text = mobileInput ? mobileInput.value : "";
	if (!text) {
		return;
	}
	if (mobileInput) {
		mobileInput.value = "";
		mobileInput.focus();
	}
	inputSequence += 1;
	await sendInput({
		EventType: "text",
		Text: text
	});
}

if (mobileKeyboardButton && mobileInputRow && mobileInput) {
	mobileKeyboardButton.addEventListener("click", function () {
		mobileInputRow.hidden = !mobileInputRow.hidden;
		if (!mobileInputRow.hidden) {
			mobileInput.focus();
		}
	});
}

if (mobileSendButton) {
	mobileSendButton.addEventListener("click", function (event) {
		stopEvent(event);
		reportAsync(sendMobileText(), "Sending text...", "Text sent");
	});
}

if (mobileInputRow) {
	mobileInputRow.addEventListener("submit", function (event) {
		stopEvent(event);
		reportAsync(sendMobileText(), "Sending text...", "Text sent");
	});
}

if (mobileInput) {
	mobileInput.addEventListener("keydown", function (event) {
		if (event.key === "Enter") {
			stopEvent(event);
			reportAsync(sendMobileText(), "Sending text...", "Text sent");
		}
	});
}

context.root.addEventListener("buffaly:desktop-stream-frame", function (event) {
	drawFrame(event.detail);
});

context.root.querySelectorAll("[data-action]").forEach(function (button) {
	button.addEventListener("click", function () {
		reportAsync(context.api.exit({
			Action: button.getAttribute("data-action") || ""
		}), "Exiting...", "Exited");
	});
});

window.addEventListener("resize", function () {
	if (currentFrame) {
		drawFrame(currentFrame);
	}
});

updateCaptureState(false, "Input not captured: click the canvas once to capture remote input. Press Escape or Release input to stop capturing.");



