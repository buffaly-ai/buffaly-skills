class ConnectionsService {
    constructor({ baseUrl = `${window.GSW_BASE || ''}/api/generalskillworkbench.web.services/connections`, authToken = null } = {}) { this.Url = baseUrl; this.AuthToken = authToken; }
    async _post(path, body) {
        const headers = { 'content-type': 'application/json' };
        if (this.AuthToken) headers.Authorization = this.AuthToken;
        const r = await fetch(this.Url + path, { method: 'POST', cache: 'no-store', headers, body: JSON.stringify(body||{}) });
        const text = await r.text();
        let data = null; try { data = text ? JSON.parse(text) : null; } catch { data = { Error: text }; }
        if (!r.ok) throw new Error(data?.Error || data?.detail || data?.title || ('Request failed: ' + r.status));
        return data;
    }
    GetConnection() { return this._post('/get-connection', {  }); }
    TestConnection(Candidate) { return this._post('/test-connection', { Candidate:Candidate }); }
    SaveConnection(Candidate, ExpectedRevision) { return this._post('/save-connection', { Candidate:Candidate, ExpectedRevision:ExpectedRevision }); }
}
window.ConnectionsService = ConnectionsService;
