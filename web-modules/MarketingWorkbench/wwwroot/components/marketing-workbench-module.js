export class MarketingWorkbenchModule extends HTMLElement {
  constructor() { super(); this._configuration = null; this._started = false; this._abort = null; }
  configure(configuration) {
    if (this._started) throw new Error('Dispose before reconfiguring Marketing Workbench.');
    if (!configuration || configuration.screen !== 'workspace') throw new Error('Unsupported Marketing Workbench screen.');
    this._configuration = configuration;
  }
  async start() {
    if (!this._configuration) throw new Error('configure() is required before start().');
    if (this._started) return;
    this._started = true;
    this._abort = new AbortController();
    const signal = this._abort.signal;
    this.replaceChildren();
    const panel = document.createElement('section');
    panel.style.cssText = 'display:flex;flex-direction:column;height:100%;min-height:600px;background:#f5f7fb;color:#172435;font:14px system-ui';
    const header = document.createElement('header');
    header.style.cssText = 'padding:16px;display:flex;flex-wrap:wrap;align-items:center;gap:16px';
    const title = document.createElement('strong'); title.textContent = 'Marketing Workbench';
    const status = document.createElement('span'); status.textContent = 'Reading workbench connection...'; status.setAttribute('role', 'status');
    header.append(title, status); panel.append(header); this.append(panel);
    try {
      const response = await fetch('/api/buffaly.marketing-workbench/connection', { signal, cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Workbench connection unavailable.');
      const url = new URL(result.workspaceUrl);
      if (location.protocol === 'https:' && url.protocol !== 'https:') throw new Error('An HTTPS Buffaly page requires an HTTPS workbench URL.');
      if (signal.aborted) return;
      const open = document.createElement('a'); open.href = url.href; open.target = '_blank'; open.rel = 'noopener noreferrer'; open.textContent = 'Open in new tab';
      header.append(open);
      status.textContent = 'Separately hosted workspace. If embedding is blocked, open in a new tab.';
      const frame = document.createElement('iframe'); frame.title = 'Marketing workspace'; frame.src = url.href;
      frame.style.cssText = 'flex:1;width:100%;min-height:540px;border:0;background:white';
      // A load event is not proof of remote application readiness; retain the external-open option.
      panel.append(frame);
    } catch (error) {
      if (signal.aborted) return;
      status.textContent = error.message;
      this.dispatchEvent(new CustomEvent('buffaly-component-error', { bubbles: true, detail: { moduleName: 'MarketingWorkbench', screen: 'workspace', message: error.message } }));
    }
  }
  navigate(screen, state) {
    if (screen !== 'workspace') throw new Error('Unsupported Marketing Workbench screen.');
  }
  dispose() { this._abort?.abort(); this._abort = null; this.replaceChildren(); this._started = false; }
  disconnectedCallback() { this.dispose(); }
}
if (!customElements.get('marketing-workbench-module')) customElements.define('marketing-workbench-module', MarketingWorkbenchModule);
