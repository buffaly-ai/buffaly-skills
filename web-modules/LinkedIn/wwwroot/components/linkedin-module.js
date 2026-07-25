const SCREENS = Object.freeze({ "published-post": true, "draft-preview": true });
const API = "/api/buffaly.linkedin/linked-in-service";

function escapeHtml(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

async function request(path, payload) {
  const response = await fetch(API + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const text = await response.text();
  if (!text) throw new Error("LinkedIn returned an empty response.");
  let result;
  try { result = JSON.parse(text); } catch { throw new Error("LinkedIn returned invalid JSON."); }
  if (!response.ok || result.error) throw new Error(result.error || "LinkedIn request failed with HTTP " + response.status + ".");
  return result;
}

class LinkedInModule extends HTMLElement {
  constructor() {
    super();
    this._configuration = null;
    this._started = false;
  }

  configure(configuration) {
    if (this._started) throw new Error("LinkedIn module cannot be reconfigured after start().");
    const screen = configuration && configuration.screen;
    if (!Object.prototype.hasOwnProperty.call(SCREENS, screen)) throw new Error("Unsupported LinkedIn screen: " + screen);
    const state = configuration.state || {};
    if (screen === "published-post" && (!state.postUrn || typeof state.postUrn !== "string")) throw new Error("postUrn is required for LinkedIn published-post.");
    if (screen === "draft-preview" && (!state.draftId || typeof state.draftId !== "string")) throw new Error("draftId is required for LinkedIn draft-preview.");
    this._configuration = { ...configuration, screen, state };
  }

  connectedCallback() {
    if (this.childElementCount) return;
    this.className = "linkedin-component-host";
    this.innerHTML = '<div class="linkedin-component-loading">Loading LinkedIn preview...</div>';
  }

  async start() {
    if (!this._configuration) throw new Error("configure() must be called before start().");
    if (this._started) return;
    this._started = true;
    try {
      const record = this._configuration.screen === "published-post"
        ? await request("/get-published-post", { postUrn: this._configuration.state.postUrn })
        : await request("/get-draft", { draftId: this._configuration.state.draftId });
      this._render(record);
      this.dispatchEvent(new CustomEvent("buffaly-component-ready", { bubbles: true, detail: { moduleName: "LinkedIn", screen: this._configuration.screen, recordId: this._recordId() } }));
    } catch (error) {
      this.innerHTML = '<section class="linkedin-component-error" role="alert"><strong>LinkedIn preview unavailable</strong><p>' + escapeHtml(error.message) + '</p></section>';
      this.dispatchEvent(new CustomEvent("buffaly-component-error", { bubbles: true, detail: { moduleName: "LinkedIn", screen: this._configuration.screen, recordId: this._recordId(), message: error.message } }));
    }
  }

  dispose() {
    this.replaceChildren();
    this._started = false;
  }

  _recordId() {
    return this._configuration.state.postUrn || this._configuration.state.draftId;
  }

  _render(record) {
    const published = this._configuration.screen === "published-post";
    const id = published ? record.postUrn : record.id;
    if (id !== this._recordId()) throw new Error("LinkedIn returned a different record than requested.");
    const text = published ? record.textDigest : record.text;
    const title = published ? "Published post" : (record.name || "Draft preview");
    const dateLabel = published ? "Published" : "Updated";
    const dateValue = published ? record.publishedAt : record.updatedAt;
    const media = !published && record.mediaType && record.mediaType !== "none"
      ? '<div class="linkedin-component-media"><strong>' + escapeHtml(record.mediaType) + '</strong>' + (record.title ? '<span>' + escapeHtml(record.title) + '</span>' : '') + (record.description ? '<p>' + escapeHtml(record.description) + '</p>' : '') + '</div>' : '';
    const url = published && record.url ? '<a class="linkedin-component-link" href="' + escapeHtml(record.url) + '" target="_blank" rel="noopener noreferrer">Open on LinkedIn</a>' : '';
    this.innerHTML = '<style>' + LinkedInModule.styles + '</style><article class="linkedin-component-card" data-record-id="' + escapeHtml(id) + '">' +
      '<header><div><span class="linkedin-component-kicker">LinkedIn</span><h2>' + escapeHtml(title) + '</h2></div><span class="linkedin-component-status">' + escapeHtml(published ? "PUBLISHED" : record.status) + '</span></header>' +
      '<dl><div><dt>Record</dt><dd>' + escapeHtml(id) + '</dd></div><div><dt>Visibility</dt><dd>' + escapeHtml(record.visibility || "") + '</dd></div><div><dt>' + dateLabel + '</dt><dd>' + escapeHtml(dateValue ? new Date(dateValue).toLocaleString() : "") + '</dd></div></dl>' +
      '<section class="linkedin-component-post"><div class="linkedin-component-avatar">in</div><div><strong>' + escapeHtml(published ? (record.publishedBy || "LinkedIn") : "Draft") + '</strong><p>' + escapeHtml(text || "(No post text)").replace(/\n/g, "<br>") + '</p>' + media + '</div></section>' + url + '</article>';
  }
}

LinkedInModule.styles = `
:host{display:block;font:14px/1.45 Inter,Segoe UI,sans-serif;color:#17233c}.linkedin-component-card{background:#fff;border:1px solid #dbe3ef;border-radius:16px;padding:22px;box-shadow:0 10px 30px rgba(23,35,60,.08)}header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}h2{margin:3px 0 0;font-size:24px}.linkedin-component-kicker{text-transform:uppercase;letter-spacing:.1em;color:#0a66c2;font-size:12px;font-weight:800}.linkedin-component-status{background:#e8f3ff;color:#075aab;border-radius:999px;padding:6px 10px;font-size:12px;font-weight:800}dl{display:grid;grid-template-columns:2fr 1fr 1fr;gap:12px;margin:20px 0}dl div{background:#f5f7fb;border-radius:10px;padding:10px}dt{font-size:11px;text-transform:uppercase;color:#667085;font-weight:700}dd{margin:4px 0 0;overflow-wrap:anywhere}.linkedin-component-post{display:grid;grid-template-columns:44px 1fr;gap:12px;border:1px solid #e1e6ef;border-radius:12px;padding:16px}.linkedin-component-avatar{width:44px;height:44px;border-radius:7px;background:#0a66c2;color:#fff;display:grid;place-items:center;font-size:20px;font-weight:800}.linkedin-component-post p{font-size:16px;white-space:normal;margin:10px 0 0}.linkedin-component-media{margin-top:14px;padding:14px;background:#f5f7fb;border-radius:10px}.linkedin-component-media span{display:block;margin-top:4px}.linkedin-component-link{display:inline-block;margin-top:16px;color:#0a66c2;font-weight:700}.linkedin-component-loading,.linkedin-component-error{padding:24px;background:#fff;border:1px solid #dbe3ef;border-radius:14px}.linkedin-component-error{border-color:#efb3b3;color:#8b1f1f}@media(max-width:700px){dl{grid-template-columns:1fr}header{align-items:flex-start}}`;

if (!customElements.get("linkedin-module")) customElements.define("linkedin-module", LinkedInModule);
export { LinkedInModule };
