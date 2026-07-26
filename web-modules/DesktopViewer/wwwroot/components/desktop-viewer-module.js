const FRAME_API = "/web-modules/DesktopViewer/api/frame/window";

async function postFrame(state) {
	const response = await fetch(FRAME_API, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "same-origin",
		cache: "no-store",
		body: JSON.stringify({
			processName: state.ProcessName,
			windowTitleContains: state.WindowTitle
		})
	});
	const envelope = await response.json();
	if (!response.ok || envelope.success !== true) throw new Error(envelope.error || `Desktop frame request failed (${response.status}).`);
	return envelope.result;
}

class DesktopViewerModule extends HTMLElement {
	constructor() {
		super();
		this._configuration = null;
		this._started = false;
		this._disposed = false;
		this._timer = 0;
		this._captureInFlight = false;
		this._frameCount = 0;
	}

	configure(configuration) {
		if (this._started) throw new Error("Desktop Viewer cannot be reconfigured after start().");
		const screen = configuration && configuration.screen;
		const state = configuration && configuration.state;
		if (screen !== "window") throw new Error("Unsupported Desktop Viewer screen: " + screen);
		if (!state || typeof state.ProcessName !== "string" || !state.ProcessName.trim()) throw new Error("ProcessName is required.");
		if (typeof state.WindowTitle !== "string" || !state.WindowTitle.trim()) throw new Error("WindowTitle is required.");
		if (!Number.isInteger(state.FrameIntervalMs) || state.FrameIntervalMs < 100 || state.FrameIntervalMs > 5000) throw new Error("FrameIntervalMs is invalid.");
		this._configuration = { screen, state };
	}

	connectedCallback() {
		this._render();
	}

	_render() {
		if (this.childElementCount) return;
		this.innerHTML = `<style>${DesktopViewerModule.styles}</style><article class="dv-card"><section><canvas></canvas><div class="dv-empty">Waiting for the first frame...</div></section><footer><span class="dv-status">Starting stream...</span><span class="dv-frames"></span></footer></article>`;
	}

	async start() {
		if (!this._configuration) throw new Error("configure() must be called before start().");
		if (this._started) return;
		this._started = true;
		this._disposed = false;
		this._render();
		const state = this._configuration.state;
		await this._capture();
		if (!this._disposed) this._timer = window.setInterval(() => { void this._capture(); }, state.FrameIntervalMs);
	}

	dispose() {
		this._disposed = true;
		if (this._timer) window.clearInterval(this._timer);
		this._timer = 0;
		this.replaceChildren();
	}

	async _capture() {
		if (this._disposed || this._captureInFlight) return;
		this._captureInFlight = true;
		try {
			const frame = await postFrame(this._configuration.state);
			if (!frame || !frame.imageBase64) throw new Error("Desktop frame did not include imageBase64.");
			await this._draw(frame);
			this._frameCount += 1;
			this.querySelector(".dv-status").textContent = "Streaming selected window";
			this.querySelector(".dv-frames").textContent = `${this._frameCount} frames | ${frame.width}x${frame.height}`;
			if (this._frameCount === 1) this.dispatchEvent(new CustomEvent("buffaly-component-ready", { bubbles: true, detail: { moduleName: "DesktopViewer", screen: "window", processName: this._configuration.state.ProcessName, windowTitle: this._configuration.state.WindowTitle } }));
		} catch (error) {
			this.querySelector(".dv-status").textContent = error.message;
			this.querySelector(".dv-status").classList.add("dv-error");
			if (this._frameCount === 0) this.dispatchEvent(new CustomEvent("buffaly-component-error", { bubbles: true, detail: { moduleName: "DesktopViewer", screen: "window", message: error.message } }));
		} finally {
			this._captureInFlight = false;
		}
	}

	_draw(frame) {
		return new Promise((resolve, reject) => {
			const image = new Image();
			image.onload = () => {
				const canvas = this.querySelector("canvas");
				const shell = canvas.parentElement;
				const scale = Math.min(shell.clientWidth / image.width, shell.clientHeight / image.height);
				canvas.width = Math.max(1, Math.round(image.width * scale));
				canvas.height = Math.max(1, Math.round(image.height * scale));
				canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
				this.querySelector(".dv-empty").hidden = true;
				resolve();
			};
			image.onerror = () => reject(new Error("Desktop frame image could not be decoded."));
			image.src = `data:${frame.imageMimeType || "image/png"};base64,${frame.imageBase64}`;
		});
	}
}

DesktopViewerModule.styles = `:host{display:block;width:100%;height:100%;min-width:0;min-height:0;font:14px/1.4 Inter,Segoe UI,sans-serif;color:#e7edf7}.dv-card{width:100%;height:100%;min-width:0;min-height:0;display:grid;grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,1fr) auto;background:#0b0f16;overflow:hidden}section{position:relative;width:100%;height:100%;min-width:0;min-height:0;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#030507}canvas{display:block;max-width:100%;max-height:100%;background:#000}.dv-empty{position:absolute;inset:0;display:grid;place-items:center;color:#718096}.dv-empty[hidden]{display:none}footer{display:flex;justify-content:space-between;gap:12px;padding:5px 10px;border-top:1px solid #273244;background:#111722;color:#9bacbf;font-size:11px}.dv-error{color:#ff9c9c}`;

if (!customElements.get("desktop-viewer-module")) customElements.define("desktop-viewer-module", DesktopViewerModule);
export { DesktopViewerModule };
