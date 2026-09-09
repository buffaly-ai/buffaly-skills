(() => {
  'use strict';

  const api = {
    definitions: '/api/verified/definitions',
    models: '/api/verified/models',
    runs: '/api/verified/runs',
    run: (id) => `/api/verified/runs/${encodeURIComponent(id)}`,
    start: (id) => `/api/verified/runs/${encodeURIComponent(id)}/start`,
    cancel: (id) => `/api/verified/runs/${encodeURIComponent(id)}/cancel`,
    retry: (id, stepId) => `/api/verified/runs/${encodeURIComponent(id)}/steps/${encodeURIComponent(stepId)}/retry`,
    artifact: (id, relativePath) => `/api/verified/runs/${encodeURIComponent(id)}/files/${relativePath.split('/').map(encodeURIComponent).join('/')}`
  };

  const runStatuses = new Set(['created', 'running', 'cancelrequested', 'canceled', 'passed', 'failed', 'interrupted']);
  const stepStatuses = new Set(['pending', 'ready', 'running', 'passed', 'failed', 'blocked', 'invalidated', 'canceled', 'interrupted']);
  const pollingRunStatuses = new Set(['running', 'cancelrequested']);
  const retryableStepStatuses = new Set(['failed', 'blocked', 'interrupted', 'passed']);

  const storageKeys = {
    selectedDefinition: 'verifiedWorkbench.selectedDefinition',
    selectedStep: 'verifiedWorkbench.selectedStep',
    selectedRun: 'verifiedWorkbench.selectedRun',
    selectedTab: 'verifiedWorkbench.selectedTab',
    provider: 'verifiedWorkbench.provider',
    transport: 'verifiedWorkbench.transport',
    model: 'verifiedWorkbench.model',
    reasoning: 'verifiedWorkbench.reasoning'
  };

  const state = {
    definitions: [],
    models: [],
    runs: [],
    currentRun: null,
    selectedStepId: localStorage.getItem(storageKeys.selectedStep) || '',
    selectedTab: localStorage.getItem(storageKeys.selectedTab) || 'step',
    pollTimer: 0,
    runRequestVersion: 0,
    selectedRunId: '',
    commandBusy: false,
    setupRunId: '',
    lastFocusedId: ''
  };

  const els = {
    setupDisclosure: document.getElementById('setupDisclosure'),
    setupSummary: document.getElementById('setupSummary'),
    catalogStatus: document.getElementById('catalogStatus'),
    refreshCatalogButton: document.getElementById('refreshCatalogButton'),
    refreshRunsButton: document.getElementById('refreshRunsButton'),
    apiError: document.getElementById('apiError'),
    definitionSelect: document.getElementById('definitionSelect'),
    providerSelect: document.getElementById('providerSelect'),
    transportSelect: document.getElementById('transportSelect'),
    modelSelect: document.getElementById('modelSelect'),
    reasoningSelect: document.getElementById('reasoningSelect'),
    requestedIdentity: document.getElementById('requestedIdentity'),
    runRequestedIdentity: document.getElementById('runRequestedIdentity'),
    actualIdentity: document.getElementById('actualIdentity'),
    timingSummary: document.getElementById('timingSummary'),
    inputsEditor: document.getElementById('inputsEditor'),
    inputsHelp: document.getElementById('inputsHelp'),
    inputsError: document.getElementById('inputsError'),
    suggestedInputsBlock: document.getElementById('suggestedInputsBlock'),
    runButton: document.getElementById('runButton'),
    startButton: document.getElementById('startButton'),
    cancelButton: document.getElementById('cancelButton'),
    progressStrip: document.getElementById('progressStrip'),
    runHistory: document.getElementById('runHistory'),
    timeline: document.getElementById('timeline'),
    tabs: Array.from(document.querySelectorAll('[role="tab"]')),
    panels: {
      step: document.getElementById('panel-step'),
      results: document.getElementById('panel-results'),
      checks: document.getElementById('panel-checks'),
      artifacts: document.getElementById('panel-artifacts')
    }
  };

  function text(node, value) {
    node.textContent = value == null ? '—' : String(value);
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function el(tag, className, value) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) text(node, value);
    return node;
  }

  function requireStatus(value, supportedStatuses, context) {
    if (!supportedStatuses.has(value)) {
      throw new Error(`Unsupported ${context} status: ${String(value)}. Expected an exact lowercase API status.`);
    }
    return value;
  }

  function runStatus(run) {
    return run ? run.status : null;
  }

  function stepStatus(step) {
    return step ? step.status : null;
  }

  function shouldPollRun(run) {
    return pollingRunStatuses.has(runStatus(run));
  }

  function hasActiveStep(run) {
    return Boolean(run && Array.isArray(run.steps) && run.steps.some((step) => stepStatus(step) === 'running'));
  }

  function canRetryStep(run, step) {
    return Boolean(!state.commandBusy && run && step && step.rerunAllowed === true && !shouldPollRun(run) && !hasActiveStep(run) && retryableStepStatuses.has(stepStatus(step)));
  }

  function formatDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
  }

  function formatDuration(start, end) {
    if (!start) return 'Not started';
    const startMs = new Date(start).getTime();
    const endMs = end ? new Date(end).getTime() : Date.now();
    if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs < startMs) return 'Timing unavailable';
    const milliseconds = endMs - startMs;
    if (milliseconds < 1000) return `${milliseconds} ms`;
    if (milliseconds < 60000) return `${(milliseconds / 1000).toFixed(2)} s`;
    const total = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return minutes ? `${minutes}m ${seconds}s` : `${seconds}s`;
  }

  function setApiError(message) {
    if (!message) {
      els.apiError.classList.add('hidden');
      text(els.apiError, '');
      return;
    }
    text(els.apiError, message);
    els.apiError.classList.remove('hidden');
  }

  async function requestJson(url, options = {}) {
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}) },
      ...options
    });
    const bodyText = await response.text();
    let payload = null;
    if (bodyText) {
      try { payload = JSON.parse(bodyText); }
      catch { payload = bodyText; }
    }
    if (!response.ok) {
      const detail = payload && typeof payload === 'object' && payload.message ? payload.message : bodyText;
      throw new Error(`${response.status} ${response.statusText}${detail ? `: ${detail}` : ''}`);
    }
    return payload;
  }

  // The only run DTO boundary. Keep server-shape assumptions here instead of scattering casing fallbacks.
  function mapRun(dto) {
    if (!dto || typeof dto !== 'object' || Array.isArray(dto)) throw new Error('Expected a run DTO object.');
    if (typeof dto.id !== 'string' || !dto.id || typeof dto.workflowId !== 'string' || !dto.workflowId) {
      throw new Error('Run DTO requires nonempty id and workflowId strings.');
    }
    if (!Array.isArray(dto.steps) || !Array.isArray(dto.events)) throw new Error('Run DTO requires steps and events arrays.');
    return {
      id: dto.id,
      workflowId: dto.workflowId,
      status: requireStatus(dto.status, runStatuses, `run ${dto.id}`),
      createdAtUtc: dto.createdAtUtc,
      startedAtUtc: dto.startedAtUtc,
      completedAtUtc: dto.completedAtUtc,
      model: dto.model ?? null,
      actualModel: dto.actualModel ?? null,
      steps: Array.isArray(dto.steps) ? dto.steps.map((step) => ({
        id: step.id,
        title: step.title,
        status: requireStatus(step.status, stepStatuses, `step ${step.id}`),
        kind: step.kind,
        dependsOn: step.dependsOn,
        outputs: step.outputs,
        rerunAllowed: step.rerunAllowed === true,
        attempts: Array.isArray(step.attempts) ? step.attempts.map((attempt) => ({
          startedAtUtc: attempt.startedAtUtc,
          completedAtUtc: attempt.completedAtUtc,
          error: attempt.error,
          resultData: attempt.resultData,
          actualModel: attempt.actualModel,
          artifacts: Array.isArray(attempt.artifacts) ? attempt.artifacts.map((artifact) => ({
            relativePath: artifact.relativePath,
            sha256: artifact.sha256,
            mediaType: artifact.mediaType
          })) : [],
          checks: Array.isArray(attempt.checks) ? attempt.checks.map((check) => ({
            name: check.name,
            passed: check.passed,
            detail: check.detail
          })) : []
        })) : []
      })) : [],
      events: Array.isArray(dto.events) ? dto.events.map((event) => ({
        atUtc: event.atUtc,
        stepId: event.stepId,
        type: event.type,
        message: event.message
      })) : []
    };
  }

  function selectedDefinition() {
    return state.definitions.find((definition) => definition.id === els.definitionSelect.value) || null;
  }

  function selectedModel() {
    return state.models.find((model) => model.provider === els.providerSelect.value && model.transport === els.transportSelect.value && model.modelName === els.modelSelect.value) || null;
  }

  function updateRequestedIdentity() {
    const provider = els.providerSelect.value;
    const transport = els.transportSelect.value;
    const modelName = els.modelSelect.value;
    const reasoning = els.reasoningSelect.value;
    const choice = selectedModel();
    const unsupported = choice && Array.isArray(choice.reasoningLevels) && choice.reasoningLevels.length === 0;
    if (!provider || !transport || !modelName || !choice || (!unsupported && !reasoning)) {
      text(els.requestedIdentity, 'No model selected');
      return;
    }
    text(els.requestedIdentity, `${provider} / ${transport} / ${modelName} / ${unsupported ? 'Not supported' : reasoning}`);
  }

  function formatModelIdentity(model) {
    return ['provider', 'transport', 'modelName', 'reasoningLevel']
      .map((key) => `${key}: ${model[key] == null ? 'Not reported' : key === 'reasoningLevel' && model[key] === '' ? 'Not supported' : model[key]}`).join(' / ');
  }

  function updateRunRequestedIdentity() {
    const run = state.currentRun;
    text(els.runRequestedIdentity, !run ? 'No run selected' : run.model
      ? formatModelIdentity(run.model) : 'Requested model not reported');
  }

  function updateActualIdentity() {
    const run = state.currentRun;
    const model = run && run.actualModel;
    if (!model) {
      // Missing/unknown step kinds are not evidence of an operation-only run.
      const operationOnly = run && run.steps.length > 0 && run.steps.every((step) => step.kind === 'operation' || step.kind === 'review');
      text(els.actualIdentity, !run ? 'No run selected' : operationOnly
        ? 'No model execution required' : 'Actual model not reported yet');
      return;
    }
    text(els.actualIdentity, formatModelIdentity(model));
  }

  function updateTiming() {
    const run = state.currentRun;
    if (!run) {
      text(els.timingSummary, 'No timing yet');
      return;
    }
    const duration = run.startedAtUtc && !run.completedAtUtc && !shouldPollRun(run)
      ? 'Completion timing not reported' : formatDuration(run.startedAtUtc, run.completedAtUtc);
    text(els.timingSummary, `${duration} · created ${formatDate(run.createdAtUtc)}`);
  }

  function populateSelect(select, items, placeholder, getValue, getLabel) {
    clear(select);
    const first = document.createElement('option');
    first.value = '';
    text(first, placeholder);
    select.appendChild(first);
    items.forEach((item) => {
      const option = document.createElement('option');
      option.value = getValue(item);
      text(option, getLabel(item));
      select.appendChild(option);
    });
  }

  function renderDefinitions() {
    populateSelect(
      els.definitionSelect,
      state.definitions,
      'Choose a workflow',
      (definition) => definition.id,
      (definition) => `${definition.title || definition.id}${definition.version ? ` · ${definition.version}` : ''}`
    );
    const saved = localStorage.getItem(storageKeys.selectedDefinition);
    if (saved && state.definitions.some((definition) => definition.id === saved)) els.definitionSelect.value = saved;
    if (!els.definitionSelect.value && state.definitions.length === 1) els.definitionSelect.value = state.definitions[0].id;
    renderSuggestedInputs();
    renderProgress();
  }

  function renderModels() {
    const providers = [...new Set(state.models.map((model) => model.provider).filter(Boolean))];
    populateSelect(els.providerSelect, providers, 'Choose provider', (provider) => provider, (provider) => provider);
    const savedProvider = localStorage.getItem(storageKeys.provider);
    if (savedProvider && providers.includes(savedProvider)) els.providerSelect.value = savedProvider;
    renderTransports();
  }

  function renderTransports() {
    const provider = els.providerSelect.value;
    const transports = [...new Set(state.models.filter((model) => model.provider === provider).map((model) => model.transport).filter(Boolean))];
    populateSelect(els.transportSelect, transports, provider ? 'Choose transport' : 'Choose provider first', (transport) => transport, (transport) => transport);
    const savedTransport = localStorage.getItem(storageKeys.transport);
    if (savedTransport && transports.includes(savedTransport)) els.transportSelect.value = savedTransport;
    renderModelNames();
  }

  function renderModelNames() {
    const provider = els.providerSelect.value;
    const transport = els.transportSelect.value;
    const models = state.models.filter((model) => model.provider === provider && model.transport === transport);
    populateSelect(els.modelSelect, models, transport ? 'Choose model' : 'Choose transport first', (model) => model.modelName, (model) => model.modelName);
    const savedModel = localStorage.getItem(storageKeys.model);
    if (savedModel && models.some((model) => model.modelName === savedModel)) els.modelSelect.value = savedModel;
    renderReasoningLevels();
  }

  function renderReasoningLevels() {
    const model = selectedModel();
    const levels = model && Array.isArray(model.reasoningLevels) ? model.reasoningLevels : [];
    const unsupported = model && Array.isArray(model.reasoningLevels) && levels.length === 0;
    els.reasoningSelect.disabled = !model || Boolean(unsupported);
    els.reasoningSelect.required = Boolean(model && !unsupported);
    if (unsupported) {
      populateSelect(els.reasoningSelect, [], 'Not supported', (level) => level, (level) => level);
      els.reasoningSelect.value = '';
      localStorage.removeItem(storageKeys.reasoning);
      updateRequestedIdentity();
      return;
    }
    populateSelect(els.reasoningSelect, levels, model ? 'Choose reasoning' : 'Choose model first', (level) => level, (level) => level);
    const savedReasoning = localStorage.getItem(storageKeys.reasoning);
    if (savedReasoning && levels.includes(savedReasoning)) els.reasoningSelect.value = savedReasoning;
    updateRequestedIdentity();
  }

  function renderSuggestedInputs() {
    const definition = selectedDefinition();
    text(els.inputsHelp, definition && definition.inputDescription ? definition.inputDescription : 'Edit run inputs as a JSON object. Suggested inputs from the selected definition are shown only when provided by the API.');
    const suggested = definition && definition.suggestedInputs !== undefined ? definition.suggestedInputs : null;
    text(els.suggestedInputsBlock, suggested ? JSON.stringify(suggested, null, 2) : 'No suggested inputs reported by this definition.');
    if (!els.inputsEditor.value.trim() && suggested && typeof suggested === 'object' && !Array.isArray(suggested)) {
      els.inputsEditor.value = JSON.stringify(suggested, null, 2);
    }
  }

  function parseInputs() {
    const raw = els.inputsEditor.value.trim();
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Inputs must be a JSON object.');
      text(els.inputsError, '');
      return parsed;
    } catch (error) {
      text(els.inputsError, error.message);
      throw error;
    }
  }

  function requireModelSelection() {
    const provider = els.providerSelect.value;
    const transport = els.transportSelect.value;
    const modelName = els.modelSelect.value;
    const reasoningLevel = els.reasoningSelect.value;
    if (!provider || !transport || !modelName) throw new Error('Choose provider, transport, and model before running.');
    const choice = selectedModel();
    if (!choice || !Array.isArray(choice.reasoningLevels)) {
      throw new Error('The selected model identity is not in the current catalog. Refresh the catalog and select an exact choice.');
    }
    if (choice.reasoningLevels.length === 0) {
      if (reasoningLevel !== '') throw new Error('This model does not support reasoning levels. Refresh the model selection.');
    } else if (!reasoningLevel || !choice.reasoningLevels.includes(reasoningLevel)) {
      throw new Error('Choose an explicit reasoning level from the selected model catalog choices.');
    }
    return { provider, transport, modelName, reasoningLevel };
  }

  function renderProgress() {
    const focusedId = document.activeElement && document.activeElement.id;
    clear(els.progressStrip);
    const definition = selectedDefinition();
    const definitionSteps = definition && Array.isArray(definition.steps) ? definition.steps : [];
    const runSteps = state.currentRun ? state.currentRun.steps : [];
    const steps = state.currentRun ? runSteps : definitionSteps.map((step) => ({ ...step, status: null, attempts: [] }));

    if (!steps.length) {
      els.progressStrip.appendChild(el('div', 'empty', 'Choose a workflow definition to see steps.'));
      renderSelectedStep(null);
      return;
    }

    if (!state.selectedStepId || !steps.some((step) => step.id === state.selectedStepId)) {
      state.selectedStepId = steps[0].id;
      localStorage.setItem(storageKeys.selectedStep, state.selectedStepId);
    }

    steps.forEach((step, index) => {
      const status = stepStatus(step);
      const button = el('button', `step-pill ${status}`);
      button.type = 'button';
      button.id = `step-${step.id}`;
      const item = el('div');
      item.setAttribute('role', 'listitem');
      button.setAttribute('aria-current', step.id === state.selectedStepId ? 'step' : 'false');
      button.addEventListener('click', () => selectStep(step.id));
      button.appendChild(el('span', 'step-index', `Step ${index + 1}`));
      button.appendChild(el('span', 'step-title', step.title || step.id));
      button.appendChild(el('span', `status-pill ${status || 'neutral'}`, status || 'Not run'));
      const meta = el('span', 'step-meta');
      const depends = Array.isArray(step.dependsOn) && step.dependsOn.length ? `Depends: ${step.dependsOn.join(', ')}` : 'No dependencies reported';
      text(meta, depends);
      button.appendChild(meta);
      item.appendChild(button);
      els.progressStrip.appendChild(item);
    });

    renderSelectedStep(steps.find((step) => step.id === state.selectedStepId));
    state.lastFocusedId = focusedId || '';
    restoreFocusIfNeeded();
  }

  function selectStep(stepId) {
    state.selectedStepId = stepId;
    localStorage.setItem(storageKeys.selectedStep, stepId);
    renderProgress();
  }

  function latestAttempt(step) {
    return step && Array.isArray(step.attempts) && step.attempts.length ? step.attempts[step.attempts.length - 1] : null;
  }

  function renderSelectedStep(step) {
    renderStepPanel(step);
    renderResultsPanel(step);
    renderChecksPanel(step);
    renderArtifactsPanel(step);
  }

  function renderStepPanel(step) {
    const panel = els.panels.step;
    clear(panel);
    if (!step) { panel.appendChild(el('div', 'empty', 'No step selected.')); return; }
    const wrap = el('div', 'data-list');
    const summary = el('article', 'data-card');
    summary.appendChild(el('h3', '', step.title || step.id));
    summary.appendChild(el('p', '', `Status: ${stepStatus(step) || 'Not run'}`));
    const attempt = latestAttempt(step);
    if (attempt) {
      summary.appendChild(el('p', '', `Attempt ${step.attempts.length} · ${formatDuration(attempt.startedAtUtc, attempt.completedAtUtc)}`));
      if (attempt.error) summary.appendChild(el('p', 'inline-error', attempt.error));
      if (attempt.actualModel) summary.appendChild(el('p', '', `Verified execution: ${attempt.actualModel.modelName} · ${attempt.actualModel.reasoningLevel || 'No reasoning level'}`));
      if (attempt.resultData != null) renderResultEvidence(summary, attempt.resultData);
    }
    if (step.kind) summary.appendChild(el('p', '', `Kind: ${step.kind}`));
    if (Array.isArray(step.dependsOn) && step.dependsOn.length) summary.appendChild(el('p', '', `Depends on: ${step.dependsOn.join(', ')}`));
    if (Array.isArray(step.outputs) && step.outputs.length) {
      const declared = el('details');
      declared.appendChild(el('summary', '', `${step.outputs.length} declared outputs`));
      declared.appendChild(el('pre', '', step.outputs.map(output => output.relativePath).join('\n')));
      summary.appendChild(declared);
    }
    wrap.appendChild(summary);

    const retry = document.createElement('button');
    retry.id = 'retryStepButton';
    retry.type = 'button';
    retry.className = 'secondary';
    text(retry, 'Retry selected step');
    retry.disabled = !canRetryStep(state.currentRun, step);
    retry.addEventListener('click', () => retryStep(step.id));
    wrap.appendChild(retry);

    if (step.rerunAllowed !== true) {
      wrap.appendChild(el('p', 'step-meta', 'Retry requires the API to mark this step rerunAllowed=true.'));
    }
    panel.appendChild(wrap);
  }

  function renderResultEvidence(parent, data) {
    if (Array.isArray(data.corrections)) {
      parent.appendChild(el('h3', '', `${data.corrections.length} model response${data.corrections.length === 1 ? '' : 's'} · ${data.accepted ? 'Content accepted' : 'Not accepted'}`));
      data.corrections.forEach(round => {
        const card = el('article', 'data-card');
        card.appendChild(el('strong', '', `Round ${round.round} · ${round.accepted ? 'Passed' : 'Rejected'}`));
        const checks = round.validation && Array.isArray(round.validation.checks) ? round.validation.checks : [];
        checks.filter(check => !check.passed).forEach(check => card.appendChild(el('p', 'inline-error', `${check.kind}: ${check.message}`)));
        card.appendChild(el('p', 'step-meta', `Session: ${round.sessionKey}`));
        parent.appendChild(card);
      });
    }
    const details = el('details');
    details.appendChild(el('summary', '', 'Inspect complete evidence JSON'));
    details.appendChild(el('pre', '', JSON.stringify(data, null, 2)));
    parent.appendChild(details);
  }

  function renderResultsPanel(step) {
    const panel = els.panels.results;
    clear(panel);
    if (!step) { panel.appendChild(el('div', 'empty', 'No result state available.')); return; }
    const attempt = latestAttempt(step);
    if (!attempt) { panel.appendChild(el('div', 'empty', 'This step has no attempts yet.')); return; }
    panel.appendChild(el('p', '', `Elapsed: ${formatDuration(attempt.startedAtUtc, attempt.completedAtUtc)}`));
    if (attempt.error) panel.appendChild(el('p', 'inline-error', attempt.error));
    if (attempt.resultData != null) renderResultEvidence(panel, attempt.resultData);
  }

  function renderChecksPanel(step) {
    const panel = els.panels.checks;
    clear(panel);
    const attempt = latestAttempt(step);
    const checks = attempt ? attempt.checks : [];
    if (!checks || !checks.length) { panel.appendChild(el('div', 'empty', 'No checks reported for this step.')); return; }
    const list = el('div', 'data-list');
    checks.forEach((check) => {
      const card = el('article', 'data-card');
      const heading = el('h3');
      heading.appendChild(el('span', `badge ${check.passed ? 'passed' : 'failed'}`, check.passed ? 'Passed' : 'Failed'));
      heading.appendChild(document.createTextNode(` ${check.name || 'Unnamed check'}`));
      card.appendChild(heading);
      card.appendChild(el('p', '', check.detail || 'No detail reported.'));
      list.appendChild(card);
    });
    panel.appendChild(list);
  }

  function renderArtifactsPanel(step) {
    const panel = els.panels.artifacts;
    clear(panel);
    const attempt = latestAttempt(step);
    const artifacts = attempt ? attempt.artifacts : [];
    if (!artifacts || !artifacts.length) { panel.appendChild(el('div', 'empty', 'No artifacts reported for this step.')); return; }
    const grid = el('div', 'artifact-grid');
    artifacts.forEach((artifact) => {
      const link = document.createElement('a');
      link.className = 'artifact-link';
      link.href = state.currentRun ? api.artifact(state.currentRun.id, artifact.relativePath || '') : '#';
      link.target = '_blank';
      link.rel = 'noopener';
      link.appendChild(el('strong', '', artifact.relativePath || 'Artifact'));
      link.appendChild(el('span', '', artifact.mediaType || 'media type not reported'));
      if (artifact.sha256) link.appendChild(el('span', '', `SHA-256 ${artifact.sha256}`));
      grid.appendChild(link);
    });
    panel.appendChild(grid);
  }

  function renderRunHistory() {
    clear(els.runHistory);
    if (!state.runs.length) {
      els.runHistory.appendChild(el('div', 'empty', 'No runs yet.'));
      return;
    }
    state.runs.forEach((run) => {
      const status = runStatus(run);
      const button = el('button', `run-item ${state.currentRun && state.currentRun.id === run.id ? 'selected' : ''}`);
      button.type = 'button';
      button.id = `run-${run.id}`;
      button.disabled = state.commandBusy;
      button.addEventListener('click', async () => {
        try { await loadRun(run.id); }
        catch (error) { setApiError(error.message); }
      });
      button.appendChild(el('strong', '', run.id));
      button.appendChild(el('span', '', `${run.workflowId || 'workflow unknown'} · ${status} · ${formatDate(run.createdAtUtc)}`));
      els.runHistory.appendChild(button);
    });
  }

  function renderTimeline() {
    clear(els.timeline);
    const events = state.currentRun && Array.isArray(state.currentRun.events) ? state.currentRun.events : [];
    if (!events.length) {
      const item = document.createElement('li');
      item.appendChild(el('p', '', 'No timeline events reported.'));
      els.timeline.appendChild(item);
      return;
    }
    events.forEach((event) => {
      const item = document.createElement('li');
      const when = document.createElement('time');
      when.dateTime = event.atUtc || '';
      text(when, formatDate(event.atUtc));
      item.appendChild(when);
      item.appendChild(el('strong', '', [event.stepId, event.type].filter(Boolean).join(' · ') || 'Event'));
      item.appendChild(el('p', '', event.message || 'No message reported.'));
      els.timeline.appendChild(item);
    });
  }

  function renderTabs() {
    if (!Object.hasOwn(els.panels, state.selectedTab)) state.selectedTab = 'step';
    els.tabs.forEach((tab) => {
      const name = tab.id.replace('tab-', '');
      const active = name === state.selectedTab;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.tabIndex = active ? 0 : -1;
      els.panels[name].hidden = !active;
      els.panels[name].classList.toggle('active', active);
    });
  }

  function updateControls() {
    const hasRun = Boolean(state.currentRun);
    const status = runStatus(state.currentRun);
    els.startButton.disabled = state.commandBusy || !hasRun || status !== 'created' || hasActiveStep(state.currentRun);
    els.cancelButton.disabled = state.commandBusy || !hasRun || status !== 'running';
    els.runButton.disabled = state.commandBusy;
  }

  function renderAll() {
    const focusedId = document.activeElement && document.activeElement.id;
    const newRunSelection = state.currentRun && state.setupRunId !== state.currentRun.id;
    const moveSetupFocus = newRunSelection && els.setupDisclosure.contains(document.activeElement)
      && document.activeElement !== els.setupSummary;
    if (newRunSelection) {
      state.setupRunId = state.currentRun.id;
      els.setupDisclosure.open = false;
      text(els.setupSummary, 'New run setup — expand to configure another run');
    }
    updateRequestedIdentity();
    updateRunRequestedIdentity();
    updateActualIdentity();
    updateTiming();
    renderProgress();
    renderRunHistory();
    renderTimeline();
    renderTabs();
    updateControls();
    state.lastFocusedId = focusedId || '';
    restoreFocusIfNeeded();
    if (moveSetupFocus) els.setupSummary.focus();
    schedulePolling();
  }

  function schedulePolling() {
    window.clearTimeout(state.pollTimer);
    if (document.hidden || state.commandBusy || !shouldPollRun(state.currentRun)) return;
    const id = state.currentRun.id;
    state.pollTimer = window.setTimeout(async () => {
      try { await loadRun(id, { quiet: true }); }
      catch (error) {
        setApiError(`Polling failed: ${error.message}`);
        schedulePolling();
      }
    }, 2500);
  }

  async function loadCatalog() {
    setApiError('');
    text(els.catalogStatus, 'Loading catalog');
    els.catalogStatus.className = 'status-pill neutral';
    const [definitions, models] = await Promise.all([requestJson(api.definitions), requestJson(api.models)]);
    if (!Array.isArray(definitions) || !Array.isArray(models)) throw new Error('Definitions and model catalog must be JSON arrays.');
    // Parent owns catalog validation; UI only checks the submitted selection against these choices.
    state.definitions = definitions;
    state.models = models;
    renderDefinitions();
    renderModels();
    text(els.catalogStatus, `${state.definitions.length} workflows · ${state.models.length} models`);
    els.catalogStatus.className = 'status-pill passed';
  }

  async function loadRuns() {
    const payload = await requestJson(api.runs);
    if (!Array.isArray(payload)) throw new Error('Run list must be a JSON array.');
    state.runs = payload.map(mapRun);
    const linkedRun = new URL(window.location.href).searchParams.get('run');
    const savedRun = linkedRun || localStorage.getItem(storageKeys.selectedRun);
    if (!state.currentRun && savedRun) {
      const exists = state.runs.some((run) => run.id === savedRun);
      if (exists) await loadRun(savedRun, { quiet: true });
      else if (linkedRun) throw new Error('The linked run was not found. No other run was substituted.');
    }
    renderRunHistory();
  }

  async function loadRun(id, options = {}) {
    if (!id) return;
    if (options.quiet && state.selectedRunId && state.selectedRunId !== id) return;
    state.selectedRunId = id;
    const version = ++state.runRequestVersion;
    window.clearTimeout(state.pollTimer);
    if (!options.quiet) setApiError('');
    let run;
    try {
      run = mapRun(await requestJson(api.run(id)));
      if (run.id !== id) throw new Error('Run detail response id does not match the requested run.');
    } catch (error) {
      if (version !== state.runRequestVersion) return;
      state.selectedRunId = state.currentRun ? state.currentRun.id : '';
      schedulePolling();
      throw error;
    }
    if (version !== state.runRequestVersion) return;
    state.currentRun = run;
    const index = state.runs.findIndex((entry) => entry.id === run.id);
    if (index < 0) state.runs.unshift(run);
    else state.runs[index] = run;
    localStorage.setItem(storageKeys.selectedRun, run.id);
    const link = new URL(window.location.href);
    link.searchParams.set('run', run.id);
    window.history.replaceState(null, '', link);
    renderAll();
  }

  // Serialize mutations, invalidate older reads, and retain the known run if a command fails.
  async function performCommand(operation) {
    if (state.commandBusy) return;
    state.commandBusy = true;
    ++state.runRequestVersion;
    window.clearTimeout(state.pollTimer);
    setApiError('');
    renderAll();
    try { await operation(); }
    catch (error) { setApiError(error.message); }
    finally {
      state.commandBusy = false;
      renderAll();
    }
  }

  async function createRun() {
    await performCommand(async () => {
      const workflowId = els.definitionSelect.value;
      if (!workflowId) throw new Error('Choose a workflow definition before running.');
      const inputs = parseInputs();
      const model = requireModelSelection();
      const run = mapRun(await requestJson(api.runs, {
        method: 'POST',
        body: JSON.stringify({ workflowId, inputs, model })
      }));
      state.currentRun = run;
      state.selectedRunId = run.id;
      state.runs.unshift(run);
      localStorage.setItem(storageKeys.selectedRun, run.id);
      renderAll();
      if (run.status !== 'created') throw new Error('Create run must return created; no automatic start was sent.');
      await requestJson(api.start(run.id), { method: 'POST' });
      await loadRun(run.id, { quiet: true });
    });
  }

  async function startRun() {
    if (!state.currentRun || runStatus(state.currentRun) !== 'created' || hasActiveStep(state.currentRun)) return;
    const id = state.currentRun.id;
    await performCommand(async () => {
      await requestJson(api.start(id), { method: 'POST' });
      await loadRun(id, { quiet: true });
    });
  }

  async function cancelRun() {
    if (!state.currentRun || runStatus(state.currentRun) !== 'running') return;
    const id = state.currentRun.id;
    await performCommand(async () => {
      await requestJson(api.cancel(id), { method: 'POST' });
      await loadRun(id, { quiet: true });
    });
  }

  async function retryStep(stepId) {
    if (!state.currentRun || !stepId) return;
    const step = state.currentRun.steps.find((candidate) => candidate.id === stepId);
    if (!canRetryStep(state.currentRun, step)) return;
    const id = state.currentRun.id;
    await performCommand(async () => {
      await requestJson(api.retry(id, stepId), { method: 'POST' });
      await loadRun(id, { quiet: true });
    });
  }

  function restoreFocusIfNeeded() {
    if (!state.lastFocusedId) return;
    const target = document.getElementById(state.lastFocusedId);
    if (target && document.activeElement === document.body) target.focus();
  }

  function bindEvents() {
    document.addEventListener('focusin', (event) => {
      state.lastFocusedId = event.target && event.target.id ? event.target.id : '';
    });

    els.refreshCatalogButton.addEventListener('click', async () => {
      try { await loadCatalog(); }
      catch (error) {
        text(els.catalogStatus, 'Catalog error');
        els.catalogStatus.className = 'status-pill failed';
        setApiError(error.message);
      }
    });

    els.refreshRunsButton.addEventListener('click', async () => {
      try { setApiError(''); await loadRuns(); }
      catch (error) { setApiError(error.message); }
    });

    els.definitionSelect.addEventListener('change', () => {
      localStorage.setItem(storageKeys.selectedDefinition, els.definitionSelect.value);
      renderSuggestedInputs();
      renderProgress();
    });

    els.providerSelect.addEventListener('change', () => {
      localStorage.setItem(storageKeys.provider, els.providerSelect.value);
      localStorage.removeItem(storageKeys.transport);
      localStorage.removeItem(storageKeys.model);
      localStorage.removeItem(storageKeys.reasoning);
      renderTransports();
    });

    els.transportSelect.addEventListener('change', () => {
      localStorage.setItem(storageKeys.transport, els.transportSelect.value);
      localStorage.removeItem(storageKeys.model);
      localStorage.removeItem(storageKeys.reasoning);
      renderModelNames();
    });

    els.modelSelect.addEventListener('change', () => {
      localStorage.setItem(storageKeys.model, els.modelSelect.value);
      localStorage.removeItem(storageKeys.reasoning);
      renderReasoningLevels();
    });

    els.reasoningSelect.addEventListener('change', () => {
      localStorage.setItem(storageKeys.reasoning, els.reasoningSelect.value);
      updateRequestedIdentity();
    });

    els.inputsEditor.addEventListener('input', () => text(els.inputsError, ''));
    els.runButton.addEventListener('click', createRun);
    els.startButton.addEventListener('click', startRun);
    els.cancelButton.addEventListener('click', cancelRun);

    els.tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        state.selectedTab = tab.id.replace('tab-', '');
        localStorage.setItem(storageKeys.selectedTab, state.selectedTab);
        renderTabs();
      });
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        let nextIndex = index;
        if (event.key === 'ArrowRight') nextIndex = (index + 1) % els.tabs.length;
        if (event.key === 'ArrowLeft') nextIndex = (index - 1 + els.tabs.length) % els.tabs.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = els.tabs.length - 1;
        els.tabs[nextIndex].focus();
        els.tabs[nextIndex].click();
      });
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) window.clearTimeout(state.pollTimer);
      else schedulePolling();
    });
  }

  async function init() {
    bindEvents();
    renderTabs();
    try {
      await loadCatalog();
      await loadRuns();
      renderAll();
    } catch (error) {
      text(els.catalogStatus, 'API error');
      els.catalogStatus.className = 'status-pill failed';
      setApiError(error.message);
      renderAll();
    }
  }

  init();
})();
