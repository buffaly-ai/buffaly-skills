class WorkspacesService {
  constructor({ baseUrl = `${window.GSW_BASE || ''}/api/generalskillworkbench.web.services/workspaces` } = {}) { this.Url = baseUrl; }
  async invoke(method, body = {}) {
    const response = await fetch(`${this.Url}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store'
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.Error || payload.error || `Workspace request failed (${response.status}).`);
    return payload;
  }
  ListWorkspaces() { return this.invoke('list-workspaces'); }
  GetWorkspace(WorkspaceKey) { return this.invoke('get-workspace', { WorkspaceKey }); }
  ListRecentRuns(WorkspaceKey, MaxCount = 12) { return this.invoke('list-recent-runs', { WorkspaceKey, MaxCount }); }
  GetDashboard(WorkspaceKey, MaxRuns = 50, MaxArtifacts = 200) { return this.invoke('get-dashboard', { WorkspaceKey, MaxRuns, MaxArtifacts }); }
}
