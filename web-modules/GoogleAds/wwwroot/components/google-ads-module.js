const SCREEN_ROUTES = Object.freeze({
  workspace: "overview",
  performance: "overview",
  campaigns: "campaigns",
  "search-terms": "overview",
  creatives: "ads"
});

class GoogleAdsModule extends HTMLElement {
  constructor() {
    super();
    this._configuration = null;
    this._started = false;
    this._frame = null;
  }

  configure(configuration) {
    if (this._started) throw new Error("Google Ads module cannot be reconfigured after start().");
    const screen = configuration && configuration.screen;
    if (!Object.prototype.hasOwnProperty.call(SCREEN_ROUTES, screen)) throw new Error("Unsupported Google Ads screen: " + screen);
    this._configuration = { ...configuration, screen };
  }

  connectedCallback() {
    if (this.childElementCount) return;
    this.className = "google-ads-component-host";
    this.innerHTML = '<div class="google-ads-component-loading">Loading Google Ads…</div>';
  }

  async start() {
    if (!this._configuration) throw new Error("configure() must be called before start().");
    if (this._started) return;
    this._started = true;
    this._renderFrame();
  }

  navigate(screen, state) {
    if (!Object.prototype.hasOwnProperty.call(SCREEN_ROUTES, screen)) throw new Error("Unsupported Google Ads screen: " + screen);
    this._configuration = { ...this._configuration, screen, state: state || {} };
    if (this._frame) this._setFrameLocation();
  }

  dispose() {
    if (this._frame) this._frame.src = "about:blank";
    this.replaceChildren();
    this._frame = null;
    this._started = false;
  }

  _renderFrame() {
    const frame = document.createElement("iframe");
    frame.className = "google-ads-component-frame";
    frame.title = "Google Ads " + this._configuration.screen;
    frame.addEventListener("load", () => this._applyHostMode());
    this.replaceChildren(frame);
    this._frame = frame;
    this._setFrameLocation();
  }

  _setFrameLocation() {
    const route = SCREEN_ROUTES[this._configuration.screen];
    const parameters = new URLSearchParams({
      componentHost: this._configuration.interactive ? "interactive" : "page",
      screen: this._configuration.screen
    });
    const state = this._configuration.state || {};
    if (state.customerId) parameters.set("customerId", state.customerId);
    if (state.loginCustomerId) parameters.set("loginCustomerId", state.loginCustomerId);
    if (state.dateRangePreset) parameters.set("dateRangePreset", state.dateRangePreset);
    this._frame.src = "/web-modules/GoogleAds/workspace.html?" + parameters.toString() + "#" + route;
  }

  _applyHostMode() {
    if (!this._frame || !this._configuration.interactive) return;
    const document = this._frame.contentDocument;
    if (!document || document.getElementById("google-ads-interactive-host-style")) return;
    const style = document.createElement("style");
    style.id = "google-ads-interactive-host-style";
    style.textContent = [
      ".workspace-nav,[data-workspace-screen=\"drafts\"],[data-workspace-screen=\"create\"],#settingsPanel,#toggleSettings,.campaign-builder-section,.card-actions{display:none!important}",
      ".ads-app{max-width:none;padding:12px}.topbar{position:static}.topbar-actions{flex-wrap:wrap}",
      "body{background:#f5f7fb}"
    ].join("");
    document.head.appendChild(style);
  }
}

if (!customElements.get("google-ads-module")) customElements.define("google-ads-module", GoogleAdsModule);
export { GoogleAdsModule };