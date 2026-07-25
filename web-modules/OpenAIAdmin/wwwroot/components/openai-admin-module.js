const API = "/api/buffaly.openai-admin/openai-admin-service";
const OPERATIONS = ["completions","embeddings","images","audio_speeches","audio_transcriptions","moderations","vector_stores","code_interpreter_sessions","file_search_calls","web_search_calls"];
const SCREENS = Object.freeze({ usage: true, "project-usage": true });
const number = new Intl.NumberFormat("en-US"), compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }), money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
function escapeHtml(value) { return String(value == null ? "" : value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]); }
async function request(path, payload) {
  const response = await fetch(API + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), cache: "no-store" });
  const text = await response.text(); if (!text) throw new Error("OpenAI Administration returned an empty response.");
  let result; try { result = JSON.parse(text); } catch { throw new Error("OpenAI Administration returned invalid JSON."); }
  if (!response.ok || result.Error) throw new Error((result.Error && result.Error.Message) || "OpenAI Administration request failed with HTTP " + response.status + ".");
  return result;
}
function dateAtUtc(value) { return new Date(value + "T00:00:00.000Z"); }
function nextUtcDate(value) { const date = dateAtUtc(value); date.setUTCDate(date.getUTCDate() + 1); return date; }
function sum(rows, property) { return rows.reduce((total, row) => total + Number(row[property] || 0), 0); }
function group(rows, key, value) { const grouped = new Map(); for (const row of rows) { const name = key(row) || "Unattributed"; grouped.set(name, (grouped.get(name) || 0) + Number(value(row) || 0)); } return [...grouped].map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount); }
function family(lineItem) { const v = String(lineItem || "Unattributed").toLowerCase(); if (v.includes("image")) return "Images"; if (v.includes("audio") || v.includes("speech") || v.includes("transcription")) return "Audio"; if (v.includes("search")) return "Search"; if (v.includes("vector") || v.includes("storage")) return "Storage"; if (v.includes("code") || v.includes("container")) return "Code interpreter"; if (v.includes("embedding")) return "Embeddings"; if (v.includes("input") || v.includes("output") || v.includes("token") || v.includes("model")) return "Model inference"; return lineItem || "Unattributed"; }
function bars(items, format) { if (!items.length) return '<p class="empty">No activity in this window.</p>'; const max = Math.max(...items.map(x => x.amount), 1); return items.slice(0, 8).map(x => '<div class="bar-row"><span title="' + escapeHtml(x.name) + '">' + escapeHtml(x.name) + '</span><div><i style="width:' + Math.max(3, x.amount / max * 100) + '%"></i></div><strong>' + escapeHtml(format(x.amount)) + '</strong></div>').join(""); }

class OpenAiAdminModule extends HTMLElement {
  constructor() { super(); this._configuration = null; this._started = false; }
  configure(configuration) {
    if (this._started) throw new Error("OpenAI Administration module cannot be reconfigured after start().");
    const screen = configuration && configuration.screen, state = (configuration && configuration.state) || {};
    if (!Object.prototype.hasOwnProperty.call(SCREENS, screen)) throw new Error("Unsupported OpenAI Administration screen: " + screen);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(state.startDate || "") || !/^\d{4}-\d{2}-\d{2}$/.test(state.endDate || "")) throw new Error("startDate and endDate must use yyyy-MM-dd.");
    if (dateAtUtc(state.endDate) < dateAtUtc(state.startDate)) throw new Error("endDate must be on or after startDate.");
    if (screen === "project-usage" && !/^proj_[A-Za-z0-9_-]+$/.test(state.projectId || "")) throw new Error("An exact OpenAI project ID is required for project-usage.");
    this._configuration = { ...configuration, screen, state };
  }
  connectedCallback() { if (!this.childElementCount) { this.className = "openai-admin-component-host"; this.innerHTML = '<div class="openai-loading">Loading OpenAI usage...</div>'; } }
  async start() {
    if (!this._configuration) throw new Error("configure() must be called before start()."); if (this._started) return; this._started = true;
    try {
      const projects = await request("/list-projects", { Cursor: null, PageSize: 100 });
      const project = this._configuration.screen === "project-usage" ? (projects.Projects || []).find(x => x.Id === this._configuration.state.projectId) : null;
      if (this._configuration.screen === "project-usage" && !project) throw new Error("The requested OpenAI project was not found; organization usage was not loaded.");
      const state = this._configuration.state;
      const usage = await request("/get-usage-dashboard", { StartUtc: dateAtUtc(state.startDate).toISOString(), EndUtc: nextUtcDate(state.endDate).toISOString(), BucketWidth: "1d", Operations: OPERATIONS, GroupBy: ["project_id"], ProjectId: project ? project.Id : null, ApiKeyId: null, Model: null, ForceRefresh: true });
      this._render(usage, projects.Projects || [], project);
      this.dispatchEvent(new CustomEvent("buffaly-component-ready", { bubbles: true, detail: { moduleName: "OpenAIAdmin", screen: this._configuration.screen, projectId: project && project.Id } }));
    } catch (error) {
      this.innerHTML = '<style>' + OpenAiAdminModule.styles + '</style><section class="openai-error" role="alert"><strong>OpenAI usage unavailable</strong><p>' + escapeHtml(error.message) + '</p></section>';
      this.dispatchEvent(new CustomEvent("buffaly-component-error", { bubbles: true, detail: { moduleName: "OpenAIAdmin", screen: this._configuration.screen, message: error.message } }));
    }
  }
  dispose() { this.replaceChildren(); this._started = false; }
  _render(usage, projects, selectedProject) {
    const rows = usage.Dimensions || [], costs = usage.Costs || [], names = new Map(projects.map(x => [x.Id, x.Name]));
    const requests = sum(rows, "Requests"), input = sum(rows, "InputTokens"), cached = sum(rows, "CachedInputTokens"), output = sum(rows, "OutputTokens");
    const operations = group(rows, x => x.Operation, x => x.InputTokens + x.OutputTokens), projectActivity = group(rows, x => names.get(x.ProjectId) || x.ProjectId, x => x.InputTokens + x.OutputTokens), families = group(costs, x => family(x.LineItem), x => x.Amount);
    const errors = usage.SectionErrors || [], state = this._configuration.state;
    const warnings = errors.length ? '<section class="warnings"><strong>Partial provider data</strong>' + errors.map(x => '<p>' + escapeHtml(x.Message) + '</p>').join("") + '</section>' : "";
    this.innerHTML = '<style>' + OpenAiAdminModule.styles + '</style><article class="usage-card" data-screen="' + escapeHtml(this._configuration.screen) + '"' + (selectedProject ? ' data-project-id="' + escapeHtml(selectedProject.Id) + '"' : "") + '><header><div><span class="kicker">OpenAI Administration</span><h2>' + escapeHtml(selectedProject ? selectedProject.Name : "Organization usage") + '</h2><p>' + escapeHtml(state.startDate + " through " + state.endDate + " UTC") + '</p></div><span class="scope">' + escapeHtml(selectedProject ? "PROJECT" : "ORGANIZATION") + '</span></header><section class="metrics"><div class="accent"><span>Authoritative cost</span><strong>' + money.format(Number(usage.AuthoritativeCost || 0)) + '</strong><small>OpenAI Costs API</small></div><div><span>Requests</span><strong>' + number.format(requests) + '</strong><small>' + rows.length + ' dimensions</small></div><div><span>Input tokens</span><strong>' + compact.format(input) + '</strong><small>' + (input ? Math.round(cached / input * 100) : 0) + '% cached</small></div><div><span>Output tokens</span><strong>' + compact.format(output) + '</strong><small>Generated tokens</small></div></section>' + warnings + '<section class="charts"><div><h3>Usage by operation</h3>' + bars(operations, v => compact.format(v) + " tok") + '</div><div><h3>' + (selectedProject ? "Cost families" : "Project activity") + '</h3>' + bars(selectedProject ? families : projectActivity, selectedProject ? v => money.format(v) : v => compact.format(v) + " tok") + '</div></section><footer><span>Updated ' + escapeHtml(new Date(usage.RefreshedAtUtc || Date.now()).toLocaleString()) + '</span><span>Cached and uncached input remain separate in source data.</span></footer></article>';
  }
}
OpenAiAdminModule.styles = `
:host{display:block;font:14px/1.45 Inter,Segoe UI,sans-serif;color:#172033}.usage-card{background:#fff;border:1px solid #dce3ed;border-radius:16px;padding:22px;box-shadow:0 10px 30px rgba(23,32,51,.08)}header{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}h2{font-size:25px;margin:3px 0 2px}header p{margin:0;color:#667085}.kicker{font-size:11px;letter-spacing:.11em;text-transform:uppercase;color:#6557d9;font-weight:800}.scope{background:#eeebff;color:#5142be;border-radius:999px;padding:6px 10px;font-size:11px;font-weight:800}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:20px 0}.metrics>div{background:#f6f8fb;border:1px solid #e9edf3;border-radius:12px;padding:14px}.metrics .accent{background:#211a49;color:#fff}.metrics span,.metrics small{display:block}.metrics span{font-size:12px;font-weight:700}.metrics strong{display:block;font-size:23px;margin:6px 0}.metrics small{color:#748096}.metrics .accent small{color:#c9c3f5}.charts{display:grid;grid-template-columns:1fr 1fr;gap:16px}.charts>div{border:1px solid #e4e9f0;border-radius:12px;padding:15px}.charts h3{margin:0 0 13px;font-size:15px}.bar-row{display:grid;grid-template-columns:minmax(90px,1fr) 2fr auto;align-items:center;gap:10px;margin:9px 0}.bar-row>span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bar-row>div{height:8px;background:#edf0f5;border-radius:99px;overflow:hidden}.bar-row i{display:block;height:100%;background:linear-gradient(90deg,#6557d9,#35a7ff);border-radius:99px}.bar-row strong{font-size:12px}.warnings{border:1px solid #f2c66d;background:#fff8e7;border-radius:10px;padding:12px;margin-bottom:16px}.warnings p{margin:5px 0 0}.empty{color:#667085}.usage-card footer{display:flex;justify-content:space-between;gap:12px;color:#667085;font-size:12px;margin-top:18px;border-top:1px solid #edf0f5;padding-top:12px}.openai-loading,.openai-error{padding:24px;background:#fff;border:1px solid #dce3ed;border-radius:14px}.openai-error{border-color:#efb3b3;color:#8b1f1f}@media(max-width:820px){.metrics{grid-template-columns:1fr 1fr}.charts{grid-template-columns:1fr}.usage-card footer{display:block}.usage-card footer span{display:block;margin-top:4px}}@media(max-width:520px){.metrics{grid-template-columns:1fr}header{display:block}.scope{display:inline-block;margin-top:10px}}`;
if (!customElements.get("openai-admin-module")) customElements.define("openai-admin-module", OpenAiAdminModule);
export { OpenAiAdminModule };
