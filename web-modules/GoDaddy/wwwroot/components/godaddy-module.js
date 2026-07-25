const SCREENS = Object.freeze({ domains: true, domain: true, dns: true });

class GoDaddyModule extends HTMLElement {
  constructor() {
    super();
    this._configuration = null;
    this._started = false;
    this._frame = null;
    this._onMessage = this._onMessage.bind(this);
  }

  configure(configuration) {
    if (this._started) throw new Error("GoDaddy module cannot be reconfigured after start().");
    const screen = configuration && configuration.screen;
    if (!Object.prototype.hasOwnProperty.call(SCREENS, screen)) throw new Error("Unsupported GoDaddy screen: " + screen);
    const state = configuration.state || {};
    if ((screen === "domain" || screen === "dns") && (!state.domain || typeof state.domain !== "string")) throw new Error("domain is required for GoDaddy " + screen);
    this._configuration = { ...configuration, screen, state };
  }

  connectedCallback() {
    if (this.childElementCount) return;
    this.className = "godaddy-component-host";
    this.innerHTML = '<div class="godaddy-component-loading">Loading GoDaddy...</div>';
  }

  async start() {
    if (!this._configuration) throw new Error("configure() must be called before start().");
    if (this._started) return;
    this._started = true;
    window.addEventListener("message", this._onMessage);
    const frame = document.createElement("iframe");
    frame.className = "godaddy-component-frame";
    frame.title = "GoDaddy " + this._configuration.screen;
    frame.addEventListener("load", () => this._applyInteractiveMode());
    this.replaceChildren(frame);
    this._frame = frame;
    const parameters = new URLSearchParams({ componentHost: this._configuration.interactive ? "interactive" : "page", screen: this._configuration.screen });
    if (this._configuration.state.domain) parameters.set("domain", this._configuration.state.domain);
    frame.src = "/web-modules/GoDaddy/index.html?" + parameters.toString();
  }

  dispose() {
    window.removeEventListener("message", this._onMessage);
    if (this._frame) this._frame.src = "about:blank";
    this.replaceChildren();
    this._frame = null;
    this._started = false;
  }

  _applyInteractiveMode() {
    if (!this._frame || !this._configuration.interactive) return;
    const document = this._frame.contentDocument;
    if (!document || document.getElementById("godaddy-interactive-host-style")) return;
    const style = document.createElement("style");
    style.id = "godaddy-interactive-host-style";
    style.textContent = [
      ".buffaly-app-strip,#settingsBtn,#transferInBtn,#addDnsBtn,#editNsBtn,#initiateTransferBtn,#checkTransferBtn,.godaddy-dns-actions,.godaddy-modal-overlay{display:none!important}",
      ".buffaly-page-shell{max-width:none;padding:12px}.buffaly-page-hero{margin-bottom:12px}",
      "body{background:#f5f7fb}"
    ].join("");
    document.head.appendChild(style);
  }

  _onMessage(event) {
    if (event.origin !== location.origin || !this._frame || event.source !== this._frame.contentWindow || !event.data) return;
    if (event.data.type !== "buffaly-view-ready" && event.data.type !== "buffaly-view-error") return;
    const type = event.data.type === "buffaly-view-ready" ? "buffaly-component-ready" : "buffaly-component-error";
    this.dispatchEvent(new CustomEvent(type, { bubbles: true, detail: { moduleName: "GoDaddy", screen: this._configuration.screen, domain: this._configuration.state.domain || "", message: event.data.message || "" } }));
  }
}

if (!customElements.get("godaddy-module")) customElements.define("godaddy-module", GoDaddyModule);
export { GoDaddyModule };
