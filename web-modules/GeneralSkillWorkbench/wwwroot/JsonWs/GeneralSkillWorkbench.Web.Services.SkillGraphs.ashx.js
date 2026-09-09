class SkillGraphsService {
    constructor({ baseUrl = `${window.GSW_BASE || ''}/api/generalskillworkbench.web.services/skill-graphs`, authToken = null } = {}) { this.Url = baseUrl; this.AuthToken = authToken; }
    async _post(path, body) {
        const headers = { 'content-type': 'application/json' };
        if (this.AuthToken) headers.Authorization = this.AuthToken;
        const r = await fetch(this.Url + path, { method: 'POST', cache: 'no-store', headers, body: JSON.stringify(body||{}) });
        const text = await r.text();
        let data = null; try { data = text ? JSON.parse(text) : null; } catch { data = { Error: text }; }
        if (!r.ok) throw new Error(data?.Error || data?.error || data?.detail || data?.title || data?.Code || data?.code || ('Request failed: ' + r.status));
        return data;
    }
    Resolve(RootSkill, Inputs, OptionalPrerequisites) { return this._post('/resolve', { RootSkill:RootSkill, Inputs:Inputs, OptionalPrerequisites:OptionalPrerequisites }); }
    Revalidate(ExpectedFingerprint, RootSkill, Inputs, OptionalPrerequisites) { return this._post('/revalidate', { ExpectedFingerprint:ExpectedFingerprint, RootSkill:RootSkill, Inputs:Inputs, OptionalPrerequisites:OptionalPrerequisites }); }
}
window.SkillGraphsService = SkillGraphsService;

