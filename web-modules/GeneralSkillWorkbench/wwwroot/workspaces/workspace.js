const api = new WorkspacesService();
const status = document.querySelector('#status');
const workbench = document.querySelector('#workbench');
const pathParts = location.pathname.split('/').filter(Boolean);
const workspaceKey = new URLSearchParams(location.search).get('key') || (pathParts[pathParts.lastIndexOf('workspaces') + 1] ?? '');
const base = window.GSW_BASE || '';
const moduleUrl = value => base && String(value || '').startsWith('/api/') ? base + value : value;
const usefulMedia = new Set(['application/pdf','text/html','text/markdown','text/plain','image/png','image/jpeg','image/webp','application/zip','text/csv']);
const historicalDeckMedia = new Set(['application/pdf','text/html','application/vnd.openxmlformats-officedocument.presentationml.presentation','application/vnd.ms-powerpoint']);

function typeFrom(item) {
  const media = String(item.mediaType || '').toLowerCase();
  const extension = String(item.fileName || '').split('.').pop()?.toUpperCase();
  if (media === 'text/html') return 'HTML';
  if (media === 'application/pdf') return 'PDF';
  if (media.startsWith('image/')) return extension || 'IMG';
  return extension || 'FILE';
}
function sizeText(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}
function whenText(value) {
  const elapsed = Date.now() - new Date(value).getTime();
  if (!Number.isFinite(elapsed)) return 'recent';
  if (elapsed < 3600000) return `${Math.max(1, Math.round(elapsed / 60000))} min ago`;
  if (elapsed < 86400000) return `${Math.round(elapsed / 3600000)} hr ago`;
  return `${Math.round(elapsed / 86400000)} days ago`;
}
function workflowUrl(workspace, workflow) {
  const url = new URL(`${base}/`, location.origin);
  url.searchParams.set('skill', workflow.actionPrototype);
  url.searchParams.set('returnWorkspace', workspace.workspaceKey);
  return workflow.runnable ? url.toString() : '';
}
function buildSkills(workspace) {
  return workspace.sections.flatMap(section => section.workflows.map(workflow => {
    const href = workflowUrl(workspace, workflow);
    return {
      id: workflow.actionPrototype,
      name: workflow.displayName,
      prototype: workflow.actionPrototype,
      category: section.displayName,
      description: workflow.runnable ? workflow.description : `${workflow.description} Unavailable: ${workflow.unavailableReason}`,
      href: href || '#',
      sourceHref: `${base}/workspaces/${encodeURIComponent(workspace.workspaceKey)}/skills/${encodeURIComponent(workflow.actionPrototype)}`,
      actions: href ? [[workflow.displayName, workflow.actionPrototype, workflow.description, href]] : []
    };
  }));
}
function buildFiles(artifacts) {
  return artifacts.map((artifact, index) => ({
    id: artifact.artifactId || `artifact-${index}`,
    name: artifact.fileName,
    type: typeFrom(artifact),
    size: sizeText(artifact.length),
    source: artifact.sessionKey,
    sourceLabel: artifact.runDisplayName,
    path: moduleUrl(artifact.url),
    when: whenText(artifact.updatedAtUtc),
    updated: new Date(artifact.updatedAtUtc).getTime(),
    updatedUtc: artifact.updatedAtUtc,
    pinned: index < 5 && usefulMedia.has(String(artifact.mediaType).toLowerCase()),
    reason: artifact.description || 'General Workbench deliverable',
    excerpt: artifact.description || `${artifact.actionPrototype} output`,
    href: moduleUrl(artifact.url)
  }));
}
function buildHistoricalDeckFiles(decks) {
  return decks.map((deck, index) => ({
    id: deck.deckId || `historical-deck-${index}`,
    name: deck.fileName,
    type: typeFrom(deck),
    size: sizeText(deck.length),
    source: deck.sessionKey || deck.sourceRootKey,
    sourceLabel: deck.inferredClient || deck.runKey || deck.sessionKey || deck.sourceType,
    path: moduleUrl(deck.previewMode === 'download' ? deck.downloadUrl : deck.url),
    when: whenText(deck.updatedAtUtc),
    updated: new Date(deck.updatedAtUtc).getTime(),
    updatedUtc: deck.updatedAtUtc,
    pinned: index < 12 && historicalDeckMedia.has(String(deck.mediaType).toLowerCase()),
    reason: deck.previewMode === 'download' ? 'Historical deck - download PowerPoint' : 'Historical deck - preview/open',
    excerpt: [deck.inferredClient, deck.workflowOrAction, deck.runKey || deck.sessionKey, deck.sourceType].filter(Boolean).join(' / '),
    href: moduleUrl(deck.previewMode === 'download' ? deck.downloadUrl : deck.url)
  }));
}
async function loadHistoricalDecks() {
  const historicalDeckIndex = await api.invoke('list-historical-decks', { WorkspaceKey: workspaceKey, MaxDecks: 500 });
  workbench.setHistoricalDecks(buildHistoricalDeckFiles(historicalDeckIndex.decks || []));
  return historicalDeckIndex;
}
function buildMarketingArtifactFiles(artifacts) {
  return artifacts.map((artifact, index) => ({
    id: artifact.artifactId || `marketing-artifact-${index}`,
    name: artifact.fileName,
    type: typeFrom(artifact),
    size: sizeText(artifact.length),
    source: artifact.sessionKey || artifact.sourceRootKey,
    sourceLabel: artifact.clientName || artifact.artifactType || artifact.sourceType,
    path: moduleUrl(artifact.previewMode === 'download' ? artifact.downloadUrl : artifact.url),
    when: whenText(artifact.updatedAtUtc),
    updated: new Date(artifact.updatedAtUtc).getTime(),
    updatedUtc: artifact.updatedAtUtc,
    pinned: false,
    reason: `Identified Marketing ${String(artifact.artifactType || 'artifact').replaceAll('_',' ')}`,
    excerpt: [artifact.clientName, artifact.artifactType, ...(artifact.characteristics || []), artifact.workflowOrAction, artifact.sessionKey].filter(Boolean).join(' / '),
    href: moduleUrl(artifact.previewMode === 'download' ? artifact.downloadUrl : artifact.url)
  }));
}
async function loadMarketingArtifacts(files) {
  const artifactIndex = await api.invoke('list-marketing-artifacts', { WorkspaceKey: workspaceKey, MaxArtifacts: 500 });
  if (artifactIndex.artifacts?.length) workbench.setFiles([...files, ...buildMarketingArtifactFiles(artifactIndex.artifacts)]);
  return artifactIndex;
}
async function syncHistoricalDecks() {
  const sync = await api.invoke('sync-historical-deck-library', { WorkspaceKey: workspaceKey, MaxCandidates: 500 });
  const index = await loadHistoricalDecks();
  return { ...sync, deckCount: index.decks?.length || 0 };
}
function buildSources(sources) {
  return sources.map(source => [source.sourceKey, source.displayName, source.sessionKey, source.artifactCount, source.status]);
}
function buildSourceCards(sources) {
  return sources.map(source => ({
    id: source.sourceKey,
    name: source.displayName,
    sessionKey: source.sessionKey,
    artifactCount: source.artifactCount,
    lastUpdatedUtc: source.updatedAtUtc,
    recentArtifacts: source.recentArtifacts.map(artifact => ({
      name: artifact.fileName,
      type: typeFrom(artifact),
      path: moduleUrl(artifact.url),
      href: moduleUrl(artifact.url),
      updatedUtc: artifact.updatedAtUtc,
      when: whenText(artifact.updatedAtUtc)
    }))
  }));
}
function renderIndex(workspaces) {
  document.title = 'Workspaces - General Skill Workbench';
  status.remove();
  workbench.outerHTML = `<main style="max-width:1000px;margin:0 auto;padding:48px"><h1>Workspaces</h1><p>Organized entry points into the shared workflow runner.</p>${workspaces.map(workspace => `<p><a href="${base}/workspaces/${encodeURIComponent(workspace.workspaceKey)}"><strong>${workspace.displayName}</strong></a><br>${workspace.description}</p>`).join('')}</main>`;
}

async function start() {
  try {
    if (!workspaceKey) return renderIndex(await api.ListWorkspaces());
    const dashboard = await api.GetDashboard(workspaceKey, 50, 200);
    const files = buildFiles(dashboard.artifacts);
    const skills = buildSkills(dashboard.workspace);
    window.WORKSPACE_WORKBENCH_DATA = {
      workspaceKey,
      files,
      historicalDecks: [],
      importantFiles: files.filter(file => file.pinned),
      pinnedFiles: files.filter(file => file.pinned),
      pins: files.filter(file => file.pinned),
      skills,
      actions: skills.flatMap(skill => skill.actions.map(([name, action, description, href]) => ({
        id: action,
        name,
        skill: skill.category,
        action,
        href,
        kind: 'Marketing workflow',
        updated: 'Package owned',
        description,
        fields: []
      }))),
      sourceRule: `A source appears when a persisted General Workbench run uses one of this workspace's ${skills.length} root skills and that run has an attached Buffaly session key. Runs are grouped by session key; the most recently updated run names the card.`,
      sources: buildSources(dashboard.sources),
      sessionSourceCards: buildSourceCards(dashboard.sources),
      generalWorkbenchUrl: `${base}/`
    };
    await import('./workspace-workbench.js');
    workbench.configure({workspace:{
      key: dashboard.workspace.workspaceKey,
      sessionKey: dashboard.runs[0]?.sessionKey || '',
      name: dashboard.workspace.displayName,
      description: 'Find marketing deliverables, historical decks, General Workbench runs, and trusted workflows.'
    }, onSyncDecks: syncHistoricalDecks});
    workbench.start();
    status.remove();
    loadHistoricalDecks()
      .catch(error => console.warn('Historical deck index failed to load', error));
    loadMarketingArtifacts(files)
      .catch(error => console.warn('Marketing artifact library failed to load', error));
  } catch (error) {
    console.error(error);
    status.textContent = `Marketing workspace failed: ${error?.message || error}`;
  }
}
start();

