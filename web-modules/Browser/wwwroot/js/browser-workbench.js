(() => {
  const state = { activeRunId: '', pollTimer: 0 };

  const el = {
    apiStatus: document.getElementById('apiStatus'),
    instruction: document.getElementById('instructionInput'),
    model: document.getElementById('modelInput'),
    profile: document.getElementById('profileInput'),
    maxSteps: document.getElementById('maxStepsInput'),
    headless: document.getElementById('headlessInput'),
    start: document.getElementById('startButton'),
    interrupt: document.getElementById('interruptButton'),
    refresh: document.getElementById('refreshButton'),
    runId: document.getElementById('runIdText'),
    runStatus: document.getElementById('runStatusText'),
    outputRoot: document.getElementById('outputRootText'),
    stdout: document.getElementById('stdoutLog'),
    stderr: document.getElementById('stderrLog'),
    files: document.getElementById('fileList'),
    latestScreenshot: document.getElementById('latestScreenshot'),
    screenshotStage: document.getElementById('screenshotStage'),
    runs: document.getElementById('runList')
  };

  async function api(path, options) {
    const response = await fetch(resolveAppUrl(path), Object.assign({ headers: { 'Content-Type': 'application/json' } }, options || {}));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  }

  function resolveAppUrl(path) {
    return new URL(String(path || '').replace(/^\//, ''), document.baseURI).toString();
  }

  function setStatus(text, kind) {
    el.apiStatus.textContent = text;
    el.apiStatus.className = 'status-pill ' + (kind || '');
  }

  function isActive(status) {
    return status === 'starting' || status === 'running' || status === 'interrupting';
  }

  async function loadConfig() {
    const config = await api('/api/config');
    el.outputRoot.textContent = config.outputRoot || '';
    el.model.value = config.defaultModel || 'disabled';
    el.headless.checked = config.defaultHeadless !== false;
    setStatus(config.disabledReason || 'Browser Workbench runner removed', 'warning');
    el.start.disabled = true;
  }

  async function startRun() {
    el.stderr.textContent = 'The autonomous Browser Workbench runner has been removed. Use BrowserSessionSkill primitives and ToRunPlaywrightScript instead.';
    el.start.disabled = true;
    return;

    const instruction = (el.instruction.value || '').trim();
    if (!instruction) {
      el.stdout.textContent = 'Enter an instruction first.';
      return;
    }

    el.start.disabled = true;
    el.interrupt.disabled = false;
    try {
      const run = await api('/api/runs/start', {
        method: 'POST',
        body: JSON.stringify({
          instruction,
          model: '',
          profileName: (el.profile.value || '').trim() || 'default',
          maxSteps: Number(el.maxSteps.value || 40),
          headless: el.headless.checked
        })
      });
      state.activeRunId = run.runId;
      renderRun(run);
      startPolling();
      await loadRuns();
    } catch (error) {
      el.stderr.textContent = String(error);
    } finally {
      el.start.disabled = false;
    }
  }

  async function interruptRun() {
    if (!state.activeRunId) return;
    el.interrupt.disabled = true;
    try {
      await api(`/api/runs/${encodeURIComponent(state.activeRunId)}/interrupt`, { method: 'POST', body: '{}' });
      await refreshRun();
    } catch (error) {
      el.stderr.textContent = String(error);
    }
  }

  async function refreshRun() {
    if (!state.activeRunId) {
      await loadRuns();
      return;
    }
    const run = await api(`/api/runs/${encodeURIComponent(state.activeRunId)}`);
    renderRun(run);
    if (!isActive(run.status)) stopPolling();
    await loadRuns();
  }

  async function loadRuns() {
    const runs = await api('/api/runs');
    renderRuns(runs || []);
  }

  function renderRun(run) {
    el.runId.textContent = run.runId || 'None';
    el.runStatus.textContent = run.status || 'Unknown';
    el.stdout.textContent = run.stdout || 'No output yet.';
    el.stderr.textContent = run.stderr || 'No errors.';
    el.interrupt.disabled = !run.runId || !isActive(run.status);
    el.start.disabled = isActive(run.status);
    renderFiles(run.files || []);
  }

  function renderFiles(files) {
    if (!files.length) {
      el.files.textContent = 'No files yet.';
      clearScreenshot();
      return;
    }

    const list = document.createElement('div');
    for (const file of files) {
      const row = document.createElement('a');
      row.href = resolveAppUrl(file.url);
      row.target = '_blank';
      row.className = 'file-row';
      row.innerHTML = `<strong>${escapeHtml(file.relativePath)}</strong><span>${formatBytes(file.length)}</span>`;
      list.appendChild(row);
    }
    el.files.replaceChildren(list);

    const latestScreenshot = files.find(file => /\.png$/i.test(file.name));
    if (latestScreenshot) {
      el.latestScreenshot.src = resolveAppUrl(latestScreenshot.url) + '?v=' + Date.now();
      el.screenshotStage.classList.add('has-image');
    } else {
      clearScreenshot();
    }
  }

  function renderRuns(runs) {
    if (!runs.length) {
      el.runs.textContent = 'No runs yet.';
      return;
    }

    const list = document.createElement('div');
    for (const run of runs) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'run-row';
      button.innerHTML = `<strong>${escapeHtml(run.status || '')}</strong><span>${escapeHtml(run.runId || '')}</span><small>${escapeHtml(run.instruction || '')}</small>`;
      button.addEventListener('click', () => {
        state.activeRunId = run.runId;
        renderRun(run);
        if (isActive(run.status)) startPolling();
      });
      list.appendChild(button);
    }
    el.runs.replaceChildren(list);
  }

  function clearScreenshot() {
    el.latestScreenshot.removeAttribute('src');
    el.screenshotStage.classList.remove('has-image');
  }

  function startPolling() {
    stopPolling();
    state.pollTimer = window.setInterval(() => refreshRun().catch(error => {
      el.stderr.textContent = String(error);
      stopPolling();
    }), 1500);
  }

  function stopPolling() {
    if (state.pollTimer) {
      window.clearInterval(state.pollTimer);
      state.pollTimer = 0;
    }
  }

  function formatBytes(bytes) {
    const value = Number(bytes || 0);
    if (value < 1024) return `${value} B`;
    if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
    return `${(value / 1024 / 1024).toFixed(2)} MB`;
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, ch => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[ch]));
  }

  el.start.addEventListener('click', startRun);
  el.interrupt.addEventListener('click', interruptRun);
  el.refresh.addEventListener('click', () => refreshRun().catch(error => { el.stderr.textContent = String(error); }));

  loadConfig()
    .then(loadRuns)
    .catch(error => {
      setStatus('Config failed', 'error');
      el.stderr.textContent = String(error);
    });
})();
