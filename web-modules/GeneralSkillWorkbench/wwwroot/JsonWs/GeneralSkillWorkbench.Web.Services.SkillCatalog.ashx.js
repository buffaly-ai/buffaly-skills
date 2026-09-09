class SkillCatalogService {
    constructor({ baseUrl = `${window.GSW_BASE || ''}/api/generalskillworkbench.web.services/skill-catalog`, authToken = null } = {}) { this.Url = baseUrl; this.AuthToken = authToken; }
    async _post(path, body) {
        const headers = { 'content-type': 'application/json' };
        if (this.AuthToken) headers.Authorization = this.AuthToken;
        const r = await fetch(this.Url + path, { method: 'POST', cache: 'no-store', headers, body: JSON.stringify(body||{}) });
        const text = await r.text();
        let data = null; try { data = text ? JSON.parse(text) : null; } catch { data = { Error: text }; }
        if (!r.ok) throw new Error(data?.Error || data?.error || data?.detail || data?.title || data?.Code || data?.code || ('Request failed: ' + r.status));
        return data;
    }
    SearchSkills(Query, Adapter) { return this._post('/search-skills', { Query:Query, Adapter:Adapter }); }
    GetSkill(CanonicalPrototype) { return this._post('/get-skill', { CanonicalPrototype:CanonicalPrototype }); }
}
window.SkillCatalogService = SkillCatalogService;

