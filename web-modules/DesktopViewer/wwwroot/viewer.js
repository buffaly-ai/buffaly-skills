(function () {
	"use strict";

	const sourceSelect = document.getElementById("sourceSelect");
	const windowSelect = document.getElementById("windowSelect");
	const refreshWindowsButton = document.getElementById("refreshWindowsButton");
	const startButton = document.getElementById("startButton");
	const stopButton = document.getElementById("stopButton");
	const fpsInput = document.getElementById("fpsInput");
	const maxWidthInput = document.getElementById("maxWidthInput");
	const maxHeightInput = document.getElementById("maxHeightInput");
	const fitSelect = document.getElementById("fitSelect");
	const statusText = document.getElementById("statusText");
	const frameText = document.getElementById("frameText");
	const canvas = document.getElementById("viewerCanvas");
	const emptyState = document.getElementById("emptyState");
	const context = canvas.getContext("2d");

	let windows = [];
	let timerId = 0;
	let running = false;
	let captureInFlight = false;
	let frameCount = 0;
	let startedAt = 0;

	function setStatus(message, isError) {
		statusText.textContent = message;
		statusText.style.color = isError ? "#ff9c9c" : "#b9c6d8";
	}

	async function fetchJson(url, options) {
		const response = await fetch(url, options || {});
		const text = await response.text();
		if (!response.ok) {
			throw new Error(text || ("HTTP " + response.status));
		}
		return text ? JSON.parse(text) : null;
	}

	async function fetchApi(url, options) {
		const envelope = await fetchJson(url, options);
		if (!envelope || (envelope.success !== true && envelope.Success !== true)) {
			throw new Error((envelope && (envelope.error || envelope.Error)) || "Remote DesktopViewer API call failed.");
		}
		return envelope.result || envelope.Result;
	}

	function requireNumber(input, name) {
		const value = Number(input.value);
		if (!Number.isFinite(value) || value <= 0) {
			throw new Error(name + " must be a positive number.");
		}
		return Math.round(value);
	}

	async function loadWindows() {
		setStatus("Loading remote windows...", false);
		windows = await fetchApi("/web-modules/DesktopViewer/api/windows");
		windowSelect.innerHTML = "";
		if (!windows || windows.length === 0) {
			const option = document.createElement("option");
			option.value = "";
			option.textContent = "No visible remote application windows found";
			windowSelect.appendChild(option);
			setStatus("No visible remote application windows found. Entire desktop can still be streamed.", false);
			return;
		}
		windows.forEach(function (item, index) {
			const option = document.createElement("option");
			option.value = String(index);
			option.textContent = readProperty(item, "ProcessName") + " - " + readProperty(item, "WindowTitle");
			windowSelect.appendChild(option);
		});
		setStatus("Loaded " + windows.length + " visible remote windows.", false);
	}

	function readProperty(value, pascalName) {
		if (!value) {
			return "";
		}
		const camelName = pascalName.charAt(0).toLowerCase() + pascalName.slice(1);
		return value[pascalName] || value[camelName] || "";
	}

	function updateSourceState() {
		windowSelect.disabled = sourceSelect.value !== "window" || running;
		refreshWindowsButton.disabled = running;
	}

	function resizeCanvasToDisplay() {
		const rect = canvas.getBoundingClientRect();
		const width = Math.max(1, Math.round(rect.width * window.devicePixelRatio));
		const height = Math.max(1, Math.round(rect.height * window.devicePixelRatio));
		if (canvas.width !== width || canvas.height !== height) {
			canvas.width = width;
			canvas.height = height;
		}
	}

	function calculateDrawRect(sourceWidth, sourceHeight, targetWidth, targetHeight) {
		if (fitSelect.value === "fill") {
			return { left: 0, top: 0, width: targetWidth, height: targetHeight };
		}
		if (fitSelect.value === "actual") {
			return {
				left: Math.round((targetWidth - sourceWidth) / 2),
				top: Math.round((targetHeight - sourceHeight) / 2),
				width: sourceWidth,
				height: sourceHeight
			};
		}
		if (fitSelect.value === "width") {
			const scale = targetWidth / sourceWidth;
			return { left: 0, top: 0, width: targetWidth, height: Math.max(1, Math.round(sourceHeight * scale)) };
		}
		const scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
		const width = Math.max(1, Math.round(sourceWidth * scale));
		const height = Math.max(1, Math.round(sourceHeight * scale));
		return {
			left: Math.round((targetWidth - width) / 2),
			top: 0,
			width,
			height
		};
	}

	function drawFrame(frame) {
		const imageBase64 = readProperty(frame, "ImageBase64");
		if (!frame || !imageBase64) {
			throw new Error("Remote frame payload did not include ImageBase64.");
		}
		const image = new Image();
		image.onload = function () {
			resizeCanvasToDisplay();
			context.clearRect(0, 0, canvas.width, canvas.height);
			const drawRect = calculateDrawRect(image.width, image.height, canvas.width, canvas.height);
			context.drawImage(image, drawRect.left, drawRect.top, drawRect.width, drawRect.height);
			emptyState.hidden = true;
			frameCount += 1;
			const elapsedSeconds = Math.max(0.001, (performance.now() - startedAt) / 1000);
			frameText.textContent = "Frames: " + frameCount + " | Remote: " + readProperty(frame, "Width") + "x" + readProperty(frame, "Height") + " | Render: " + (frameCount / elapsedSeconds).toFixed(1) + " fps";
		};
		image.src = "data:" + (readProperty(frame, "ImageMimeType") || "image/png") + ";base64," + imageBase64;
	}

	async function captureFrame() {
		if (!running || captureInFlight) {
			return;
		}
		captureInFlight = true;
		try {
			let frame;
			if (sourceSelect.value === "screen") {
				frame = await fetchApi("/web-modules/DesktopViewer/api/frame/screen", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ MaxWidth: requireNumber(maxWidthInput, "Max width"), MaxHeight: requireNumber(maxHeightInput, "Max height") })
				});
			} else {
				const selected = windows[Number(windowSelect.value)];
				if (!selected) {
					throw new Error("Select a remote application window.");
				}
				frame = await fetchApi("/web-modules/DesktopViewer/api/frame/window", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						ProcessName: readProperty(selected, "ProcessName"),
						WindowTitleContains: readProperty(selected, "WindowTitle"),
						MaxWidth: requireNumber(maxWidthInput, "Max width"),
						MaxHeight: requireNumber(maxHeightInput, "Max height")
					})
				});
			}
			drawFrame(frame);
			setStatus("Streaming remote " + (sourceSelect.value === "screen" ? "desktop" : "application window") + ".", false);
		} catch (error) {
			setStatus(error && error.message ? error.message : String(error), true);
		} finally {
			captureInFlight = false;
		}
	}

	function start() {
		if (running) {
			return;
		}
		try {
			frameCount = 0;
			startedAt = performance.now();
			frameText.textContent = "";
			running = true;
			startButton.disabled = true;
			stopButton.disabled = false;
			sourceSelect.disabled = true;
			windowSelect.disabled = true;
			refreshWindowsButton.disabled = true;
			fpsInput.disabled = true;
			maxWidthInput.disabled = true;
			maxHeightInput.disabled = true;
			const fps = Math.min(10, Math.max(1, requireNumber(fpsInput, "FPS")));
			const intervalMs = Math.max(100, Math.round(1000 / fps));
			setStatus("Starting remote stream...", false);
			void captureFrame();
			timerId = window.setInterval(function () { void captureFrame(); }, intervalMs);
		} catch (error) {
			stop();
			setStatus(error && error.message ? error.message : String(error), true);
		}
	}

	function stop() {
		running = false;
		if (timerId) {
			window.clearInterval(timerId);
			timerId = 0;
		}
		startButton.disabled = false;
		stopButton.disabled = true;
		sourceSelect.disabled = false;
		fpsInput.disabled = false;
		maxWidthInput.disabled = false;
		maxHeightInput.disabled = false;
		updateSourceState();
		setStatus("Stopped.", false);
	}

	sourceSelect.addEventListener("change", updateSourceState);
	refreshWindowsButton.addEventListener("click", function () { void loadWindows(); });
	startButton.addEventListener("click", start);
	stopButton.addEventListener("click", stop);
	fitSelect.addEventListener("change", resizeCanvasToDisplay);
	window.addEventListener("resize", resizeCanvasToDisplay);
	window.addEventListener("beforeunload", stop);

	resizeCanvasToDisplay();
	updateSourceState();
	void loadWindows();
}());
