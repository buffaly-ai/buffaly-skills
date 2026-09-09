const runsApi = new RunsService();
const app = document.getElementById('app');
const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const renameRun = async (runKey, revision, currentName) => {
  const name = prompt('Rename run:', currentName || runKey);
  if (!name || !name.trim() || name.trim() === (currentName || '')) return;
  try {
    await runsApi.RenameRun(runKey, revision, name.trim());
    const result = await runsApi.ListRuns();
    render(result.items || []);
  } catch (error) {
    alert('Rename failed: ' + (error.message || error));
  }
};
const fmt = value => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? esc(value) : esc(date.toLocaleString());
};
const status = value => String(value || 'pending').replace(/_/g, ' ');
const statusOf = item => item.activeOperationType || item.batchStatus || item.initializationStatus || 'created';
const pillClass = value => {
  const key = String(value || '');
  if (['complete', 'completed', 'passed'].includes(key)) return 'complete';
  if (['running', 'prime', 'step', 'pause_requested'].includes(key)) return 'running';
  if (['blocked', 'failed'].includes(key)) return 'blocked';
  if (['pending', 'stale', 'created', 'attached', 'paused'].includes(key)) return 'pending';
  return key;
};
const render = items => {
  if (!items.length) {
    app.className = '';
    app.innerHTML = `<section class="setup-shell"><section class="setup-hero"><div><span class="setup-eyebrow">Runs</span><h1>Existing runs</h1><p>Open any existing run without interrupting another. Newest updates first.</p></div><a class="button primary" href="/">New Run</a></section><section class="setup-card"><div class="empty-state">No runs yet. Create one from New Run. Existing workflow pages are unchanged.</div></section></section>`;
    return;
  }
  app.className = '';
  app.innerHTML = `<section class="setup-shell"><section class="setup-hero"><div><span class="setup-eyebrow">Runs</span><h1>Existing runs</h1><p>Open any existing run without interrupting another. Newest updates first.</p></div><a class="button primary" href="/">New Run</a></section><section class="setup-card"><div class="setup-card-head"><div><span class="setup-number">${esc(items.length)}</span><div><h2>${esc(items.length)} run${items.length === 1 ? '' : 's'}</h2><p>Bound workflow pages stay on their own run keys.</p></div></div></div><div class="markdown"><table><thead><tr><th>Run</th><th>Skill</th><th>Status</th><th>Session</th><th>Updated</th></tr></thead><tbody>${items.map(item => {
    const key = item.runKey || '';
    const skill = item.rootDisplayName || item.rootSkill || '';
    const session = item.sessionKey || '';
    const current = statusOf(item);
    const name = item.displayName || key;
    return `<tr><td><a href="/?run=${encodeURIComponent(key)}">${esc(name)}</a><div><small>${esc(key)}</small> <a href="#" data-rename="${esc(key)}" data-revision="${item.revision}" data-name="${esc(item.displayName || '')}" title="Rename">✏️</a></div></td><td>${esc(skill)}<div>${esc(item.rootSkill || '')}</div></td><td><span class="status-pill ${esc(pillClass(current))}">${esc(status(current))}</span> ${esc(item.completedNodeCount ?? 0)}/${esc(item.nodeCount ?? 0)}</td><td>${esc(session)}</td><td>${fmt(item.updatedAtUtc)}</td></tr>`;
  }).join('')}</tbody></table></div></section></section>`;
  app.querySelectorAll('[data-rename]').forEach(a => a.onclick = async (e) => { e.preventDefault(); renameRun(a.dataset.rename, parseInt(a.dataset.revision), a.dataset.name); });
};
(async () => {
  try {
    const result = await runsApi.ListRuns();
    render(result.items || []);
  } catch (error) {
    app.className = '';
    app.innerHTML = `<section class="setup-shell"><section class="setup-hero"><div><span class="setup-eyebrow">Runs</span><h1>Existing runs</h1><p>Open any existing run without interrupting another.</p></div><a class="button primary" href="/">New Run</a></section><section class="setup-card"><div class="error-banner"><b>Unable to load runs</b><p>${esc(error.message)}</p></div></section></section>`;
  }
})();
