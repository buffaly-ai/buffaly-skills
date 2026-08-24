const API = "/api/buffaly.source-viewer/source-file";
const BASE = "/web-modules/SourceViewer/";
const SCREENS = Object.freeze({ file: true });
let assetsPromise;
const modePromises = new Map();

function escapeHtml(value) { return String(value == null ? "" : value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]); }
function addStyle(href) { if ([...document.styleSheets].some(x => x.href === new URL(href, location.href).href)) return; const link = document.createElement("link"); link.rel = "stylesheet"; link.href = href; document.head.appendChild(link); }
function addScript(src, ready) { return new Promise((resolve, reject) => { const absolute = new URL(src, location.href).href; const existing = [...document.scripts].find(x => x.src === absolute); if (existing) { if (!ready || ready()) resolve(); else { existing.addEventListener("load", resolve, { once: true }); existing.addEventListener("error", reject, { once: true }); } return; } const script = document.createElement("script"); script.src = src; script.onload = resolve; script.onerror = () => reject(new Error("Could not load Source Viewer asset: " + src)); document.head.appendChild(script); }); }
async function loadCoreAssets() { if (!assetsPromise) { addStyle(BASE + "vendor/codemirror/lib/codemirror.css"); assetsPromise = addScript(BASE + "vendor/codemirror/lib/codemirror.js", () => Boolean(window.CodeMirror)).then(() => addScript(BASE + "js/source-language.js", () => Boolean(window.BuffalySourceLanguage))); } await assetsPromise; }
async function loadLanguageAssets(language) { for (const asset of language.assets) { if (!modePromises.has(asset)) modePromises.set(asset, addScript(BASE + "vendor/codemirror/mode/" + asset + "/" + asset + ".js")); await modePromises.get(asset); } }
async function readSource(path) { const response = await fetch(API + "?path=" + encodeURIComponent(path), { credentials: "same-origin", cache: "no-store" }); const text = await response.text(); let result = null; try { result = text ? JSON.parse(text) : null; } catch { throw new Error("Source Viewer returned invalid JSON."); } if (!response.ok) throw new Error(result && result.message ? result.message : "Source file request failed (" + response.status + ")."); return result; }

class SourceViewerModule extends HTMLElement {
  constructor() { super(); this._configuration = null; this._started = false; this._editor = null; }
  configure(configuration) {
    if (this._started) throw new Error("Source Viewer cannot be reconfigured after start().");
    const screen = configuration && configuration.screen, state = (configuration && configuration.state) || {};
    if (!Object.prototype.hasOwnProperty.call(SCREENS, screen)) throw new Error("Unsupported Source Viewer screen: " + screen);
    if (!state.path || typeof state.path !== "string") throw new Error("An exact source file path is required.");
    if (!Number.isInteger(state.line) || state.line < 0) throw new Error("line must be a non-negative integer.");
    if (typeof state.highlight !== "string" || state.highlight.length > 200) throw new Error("highlight is invalid.");
    this._configuration = { ...configuration, screen, state };
  }
  connectedCallback() { if (!this.childElementCount) { this.className = "source-viewer-component-host"; this.innerHTML = '<div class="sv-loading">Loading source file...</div>'; } }
  async start() {
    if (!this._configuration) throw new Error("configure() must be called before start()."); if (this._started) return; this._started = true;
    try { const state = this._configuration.state; await loadCoreAssets(); const model = await readSource(state.path); const language = window.BuffalySourceLanguage.detect(model.path); await loadLanguageAssets(language); this._render(model, language); this._focus(model.text); this.dispatchEvent(new CustomEvent("buffaly-component-ready", { bubbles: true, detail: { moduleName: "SourceViewer", screen: "file", path: model.path, language: language.id } })); }
    catch (error) { this.innerHTML = '<style>' + SourceViewerModule.styles + '</style><section class="sv-error" role="alert"><strong>Source file unavailable</strong><p>' + escapeHtml(error.message) + '</p></section>'; this.dispatchEvent(new CustomEvent("buffaly-component-error", { bubbles: true, detail: { moduleName: "SourceViewer", screen: "file", message: error.message } })); }
  }
  dispose() { if (this._editor) this._editor.toTextArea(); this._editor = null; this.replaceChildren(); this._started = false; }
  _render(model, language) {
    this.innerHTML = '<style>' + SourceViewerModule.styles + '</style><article class="sv-card"><header><div><span class="sv-kicker">Source Viewer</span><h2>' + escapeHtml(model.name) + '</h2><p title="' + escapeHtml(model.path) + '">' + escapeHtml(model.path) + '</p></div><span class="sv-kind" title="' + escapeHtml(language.name) + '">' + escapeHtml(language.label) + '</span></header><div class="sv-editor"><textarea></textarea></div><footer><span>' + Number(model.length).toLocaleString() + ' bytes</span><span>' + escapeHtml(language.name) + '</span><span>Read only</span><span class="sv-location"></span></footer></article>';
    const textarea = this.querySelector("textarea"); textarea.value = model.text;
    this._editor = window.CodeMirror.fromTextArea(textarea, { mode: language.mode, lineNumbers: true, readOnly: true, lineWrapping: false, viewportMargin: 30 });
  }
  _focus(text) {
    const state = this._configuration.state, lines = text.split(/\r?\n/); let line = state.line > 0 ? Math.min(state.line - 1, Math.max(lines.length - 1, 0)) : 0, start = 0, end = 0;
    if (state.highlight) { const joined = lines.join("\n"), index = joined.indexOf(state.highlight); if (index >= 0) { const before = joined.slice(0, index).split("\n"); line = before.length - 1; start = before[before.length - 1].length; end = start + state.highlight.length; this._editor.markText({ line, ch: start }, { line, ch: end }, { className: "sv-highlight" }); } }
    this._editor.setCursor({ line, ch: start }); this._editor.scrollIntoView({ from: { line, ch: start }, to: { line, ch: end } }, 100); this.querySelector(".sv-location").textContent = "Line " + (line + 1) + (state.highlight ? " - highlighted" : ""); this._editor.refresh();
  }
}
SourceViewerModule.styles = `:host{display:block;font:14px/1.45 Inter,Segoe UI,sans-serif;color:#172033}.sv-card{height:min(620px,calc(100vh - 46px));display:grid;grid-template-rows:auto 1fr auto;background:#fff;border:1px solid #dce3ed;border-radius:14px;overflow:hidden;box-shadow:0 10px 30px rgba(23,32,51,.08)}header{display:flex;justify-content:space-between;gap:16px;padding:16px 18px;border-bottom:1px solid #e8ecf2}h2{font-size:20px;margin:2px 0}header p{margin:0;max-width:900px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#667085}.sv-kicker{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#6557d9;font-weight:800}.sv-kind{background:#eeebff;color:#5142be;border-radius:999px;padding:6px 10px;height:max-content;font-size:11px;font-weight:800}.sv-editor,.sv-editor .CodeMirror{min-height:0;height:100%}.sv-editor .CodeMirror{font:13px/1.55 Consolas,Cascadia Code,monospace;background:#fbfcfe}.sv-editor .sv-highlight{background:#ffe27a;color:#291f00;border-radius:2px}.sv-card footer{display:flex;gap:18px;padding:9px 18px;border-top:1px solid #e8ecf2;color:#667085;font-size:12px}.sv-location{margin-left:auto}.sv-loading,.sv-error{padding:24px;background:#fff;border:1px solid #dce3ed;border-radius:14px}.sv-error{border-color:#efb3b3;color:#8b1f1f}@media(prefers-color-scheme:dark){:host{color:#e5e7eb}.sv-card,.sv-loading,.sv-error{background:#111827;border-color:#374151}.sv-editor .CodeMirror{background:#0f172a;color:#e5e7eb}.sv-card header,.sv-card footer{border-color:#374151}header p,.sv-card footer{color:#9ca3af}.sv-kind{background:#312e81;color:#ddd6fe}}`;
if (!customElements.get("source-viewer-module")) customElements.define("source-viewer-module", SourceViewerModule);
export { SourceViewerModule };
