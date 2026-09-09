class PromptSkillsService {
    constructor({ baseUrl = `${window.GSW_BASE || ''}/api/generalskillworkbench.web.services/prompt-skills`, authToken = null } = {}) { this.Url = baseUrl; this.AuthToken = authToken; }
    async _post(path, body) {
        const headers = { 'content-type': 'application/json' };
        if (this.AuthToken) headers.Authorization = this.AuthToken;
        const r = await fetch(this.Url + path, { method: 'POST', cache: 'no-store', headers, body: JSON.stringify(body||{}) });
        const text = await r.text();
        let data = null; try { data = text ? JSON.parse(text) : null; } catch { data = { Error: text }; }
        if (!r.ok) throw new Error(data?.Error || data?.detail || data?.title || ('Request failed: ' + r.status));
        return data;
    }
    SearchPromptSkills(Query, Limit, Refresh) { return this._post('/search-prompt-skills', { Query:Query, Limit:Limit, Refresh:Refresh }); }
    GetPromptSkill(PrototypeName, Refresh) { return this._post('/get-prompt-skill', { PrototypeName:PrototypeName, Refresh:Refresh }); }
    ConnectSession(SessionKey) { return this._post('/connect-session', { SessionKey:SessionKey }); }
    PreparePromptSkill(SessionKey, PrototypeName) { return this._post('/prepare-prompt-skill', { SessionKey:SessionKey, PrototypeName:PrototypeName }); }
}
window.PromptSkillsService = PromptSkillsService;
