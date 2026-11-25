const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const root = path.resolve(__dirname, '../..');
const index = JSON.parse(fs.readFileSync(path.join(root, 'packages.index.json'), 'utf8'));
const editor = index.Packages.find(item => item.PackageId === 'FeedingFrenzy.WebPropertyEditorAgent');
test('retired Workspace cannot be selected from the canonical package catalog', () => {
  assert(!index.Packages.some(item => item.PackageId === 'Workspace'));
  assert(!fs.existsSync(path.join(root, 'web-modules/Workspace/web-module.json')));
  assert(!index.Packages.some(item => JSON.stringify(item.Dependencies || []).includes('"Workspace"')));
});
test('the published editor advertises zero ordinary-page scripts and contains no retired assets', () => {
  assert(editor);
  const manifest = JSON.parse(fs.readFileSync(path.join(root, editor.SourcePath, 'web-module.json'), 'utf8'));
  assert.deepEqual(manifest.Module.AgentScripts, []);
  for (const name of ['web-property-editor-context.js', 'web-property-editor-context.css']) {
    assert(!editor.Files.some(item => item.Path === name), name);
    assert(!fs.existsSync(path.join(root, editor.SourcePath, name)), name);
  }
});
test('editor backend and sealed role artifacts remain in the package', () => {
  for (const name of ['FeedingFrenzy.WebPropertyEditorAgent.Tools.dll', 'ProjectArtifacts/Skills/WebPropertyEditor/index.pts', 'Agents/web-property-editor-agent.agent.json']) assert(editor.Files.some(item => item.Path === name), name);
});
test('installer profiles do not select retired workspace packages', () => {
  for (const name of fs.readdirSync(path.join(root, 'profiles')).filter(name => name.endsWith('.json'))) {
    const profile = JSON.parse(fs.readFileSync(path.join(root, 'profiles', name), 'utf8'));
    for (const item of profile.Packages || []) assert(!['Workspace', 'MarketingWorkbench'].includes(item.PackageId), name);
  }
});
