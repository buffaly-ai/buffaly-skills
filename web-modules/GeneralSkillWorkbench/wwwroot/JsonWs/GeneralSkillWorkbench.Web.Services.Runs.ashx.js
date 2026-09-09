class RunsService {
    constructor({ baseUrl = `${window.GSW_BASE || ''}/api/generalskillworkbench.web.services/runs`, authToken = null } = {}) { this.Url = baseUrl; this.AuthToken = authToken; }
    async _post(path, body) {
        const headers = { 'content-type': 'application/json' };
        if (this.AuthToken) headers.Authorization = this.AuthToken;
        const r = await fetch(this.Url + path, { method: 'POST', cache: 'no-store', headers, body: JSON.stringify(body||{}) });
        const text = await r.text();
        let data = null; try { data = text ? JSON.parse(text) : null; } catch { data = { Error: text }; }
        if (!r.ok) throw new Error(data?.Error || data?.error || data?.detail || data?.title || data?.Code || data?.code || ('Request failed: ' + r.status));
        return data;
    }
    MaterializeFromGraph(ResolutionId, ExpectedFingerprint, RunKey, DisplayName, SessionKey, Metadata) { return this._post('/materialize-from-graph', { ResolutionId:ResolutionId, ExpectedFingerprint:ExpectedFingerprint, RunKey:RunKey, DisplayName:DisplayName, SessionKey:SessionKey, Metadata:Metadata }); }
   GetRun(RunKey) { return this._post('/get-run', { RunKey:RunKey }); }
    RenameRun(RunKey, ExpectedRevision, DisplayName) { return this._post('/rename-run', { RunKey:RunKey, ExpectedRevision:ExpectedRevision, DisplayName:DisplayName }); }
   ReloadSkillWorkflow(RunKey, NodeKey, ExpectedRevision) { return this._post('/reload-skill-workflow', { RunKey:RunKey, NodeKey:NodeKey, ExpectedRevision:ExpectedRevision }); }
    ExportRun(RunKey) { return this._post('/export-run', { RunKey:RunKey }); }
    ImportRun(Run) { return this._post('/import-run', { Run:Run }); }
    ListLegacyRuns() { return this._post('/list-legacy-runs', {  }); }
    ListRuns() { return this._post('/list-runs', {  }); }
    GetNodePrompt(RunKey, NodeKey) { return this._post('/get-node-prompt', { RunKey:RunKey, NodeKey:NodeKey }); }
    GetStatus(RunKey) { return this._post('/get-status', { RunKey:RunKey }); }
    AddSkill(RunKey, ExpectedRevision, ActionPrototype) { return this._post('/add-skill', { RunKey:RunKey, ExpectedRevision:ExpectedRevision, ActionPrototype:ActionPrototype }); }
    AttachSession(RunKey, ExpectedRevision, SessionKey) { return this._post('/attach-session', { RunKey:RunKey, ExpectedRevision:ExpectedRevision, SessionKey:SessionKey }); }
    Prime(RunKey, ExpectedRevision, IdempotencyKey) { return this._post('/prime', { RunKey:RunKey, ExpectedRevision:ExpectedRevision, IdempotencyKey:IdempotencyKey }); }
    ValidateFinal(RunKey, ExpectedRevision, IdempotencyKey) { return this._post('/validate-final', { RunKey:RunKey, ExpectedRevision:ExpectedRevision, IdempotencyKey:IdempotencyKey }); }
    RunStep(RunKey, NodeKey, StepKey, ExpectedRevision, IdempotencyKey, RerunGuidance, AcceptResult) { return this._post('/run-step', { RunKey:RunKey, NodeKey:NodeKey, StepKey:StepKey, ExpectedRevision:ExpectedRevision, IdempotencyKey:IdempotencyKey, RerunGuidance:RerunGuidance, AcceptResult:AcceptResult }); }
    ValidateStepResult(RunKey, NodeKey, StepKey, ExpectedRevision, Result) { return this._post('/validate-step-result', { RunKey:RunKey, NodeKey:NodeKey, StepKey:StepKey, ExpectedRevision:ExpectedRevision, Result:Result }); }
    StartBatch(RunKey, ExpectedRevision, IdempotencyKey) { return this._post('/start-batch', { RunKey:RunKey, ExpectedRevision:ExpectedRevision, IdempotencyKey:IdempotencyKey }); }
    PauseBatch(RunKey, ExpectedRevision, IdempotencyKey) { return this._post('/pause-batch', { RunKey:RunKey, ExpectedRevision:ExpectedRevision, IdempotencyKey:IdempotencyKey }); }
    ResumeBatch(RunKey, ExpectedRevision, IdempotencyKey) { return this._post('/resume-batch', { RunKey:RunKey, ExpectedRevision:ExpectedRevision, IdempotencyKey:IdempotencyKey }); }
    StopBatch(RunKey, ExpectedRevision, OperationId, Reason) { return this._post('/stop-batch', { RunKey:RunKey, ExpectedRevision:ExpectedRevision, OperationId:OperationId, Reason:Reason }); }
    FailActiveOperation(RunKey, OperationId, ExpectedRevision, Reason) { return this._post('/fail-active-operation', { RunKey:RunKey, OperationId:OperationId, ExpectedRevision:ExpectedRevision, Reason:Reason }); }
    GetSkillDeepLink(CanonicalPrototype) { return this._post('/get-skill-deep-link', { CanonicalPrototype:CanonicalPrototype }); }
    GetRunDeepLink(RunKey) { return this._post('/get-run-deep-link', { RunKey:RunKey }); }
}
window.RunsService = RunsService;

