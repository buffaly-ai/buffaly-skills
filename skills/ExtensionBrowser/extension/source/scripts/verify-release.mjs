import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, '.output/chrome-mv3/manifest.json'), 'utf8'));
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const background = fs.readFileSync(path.join(root, '.output/chrome-mv3/background.js'), 'utf8');
const sidepanel = fs.readFileSync(path.join(root, '.output/chrome-mv3/chunks', fs.readdirSync(path.join(root, '.output/chrome-mv3/chunks')).find((file) => file.startsWith('sidepanel-'))), 'utf8');
const backgroundSource = fs.readFileSync(path.join(root, 'entrypoints/background.ts'), 'utf8');
const sidepanelSource = fs.readFileSync(path.join(root, 'entrypoints/sidepanel/App.tsx'), 'utf8');
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

check(manifest.manifest_version === 3, 'manifest_version must be 3');
check(manifest.name === 'Buffaly Browser Agent', 'release name is incorrect');
check(manifest.version === pkg.version, 'package and manifest versions differ');
check(manifest.background?.service_worker === 'background.js', 'background service worker is missing');
check(background.includes('__callTool'), 'background service worker bridge hook is missing');
check(manifest.side_panel?.default_path === 'sidepanel.html', 'side panel is missing');
check(manifest.content_scripts?.length === 1, 'content script declaration is missing');
for (const permission of ['sidePanel', 'storage', 'identity', 'tabs', 'scripting', 'activeTab', 'debugger']) {
  check(manifest.permissions.includes(permission), `required permission is missing: ${permission}`);
}
check(!sidepanel.includes('BuffalyExtensionConnection'), 'side panel must not receive the credential-bearing installation connection');
check(!sidepanel.includes('BuffalyActiveConversation'), 'side panel must not persist conversation or navigation authority');
check(background.includes('BuffalyActiveConversationBinding'), 'service worker active binding pointer storage contract is missing');
check(sidepanel.includes('presentation') && sidepanel.includes('sidepanel'), 'side panel compact presentation route is missing');
check(sidepanel.includes('navigationToken'), 'side panel one-time navigation-token bootstrap is missing');
check(sidepanelSource.includes('BuffalyPanelMode') && sidepanelSource.includes('mode-${panelMode}') && sidepanelSource.includes("type PanelMode = 'chat' | 'agent'"), 'persistent Chat and Agent presentation modes are missing');
check(sidepanelSource.includes('aria-label="Side panel views"') && sidepanelSource.includes("hidden={panelMode !== 'chat'}") && sidepanelSource.includes("hidden={panelMode !== 'agent'}"), 'Chat and Agent must render as exclusive full-panel tabs without unmounting either panel');
check(sidepanelSource.includes("inert={panelMode !== 'chat' ? true : undefined}") && sidepanelSource.includes("inert={panelMode !== 'agent' ? true : undefined}"), 'inactive Chat and Agent panels must be inert');
check(!sidepanelSource.includes("panelMode === 'chat' ? <section"), 'tab switching must not unmount and remount the single-use-token conversation iframe');
check(!sidepanelSource.includes('aria-label="Workspace views"') && !sidepanelSource.includes("type View = 'work' | 'activity'"), 'nested Chat and Activity split navigation must not return');
check(sidepanelSource.includes('open_buffaly_conversation_tab'), 'bound conversation full-tab pop-out control is missing');
check(backgroundSource.includes('open_buffaly_conversation_tab') && backgroundSource.includes("chrome.tabs.create({ url: url.toString(), active: true })"), 'service-worker-owned bound conversation pop-out is missing');
check(backgroundSource.includes("url.searchParams.set('presentation', 'standard')"), 'full-tab pop-out must explicitly request the standard conversation presentation');
check(backgroundSource.includes("url.searchParams.set('navigationToken', navigation.NavigationToken)") && !backgroundSource.includes("url.searchParams.set('sessionKey'"), 'pop-out must use a fresh one-time navigation token instead of a session key');
check(!sidepanel.includes('sessionKey') && !sidepanel.includes('SessionKey'), 'side panel must not navigate with a durable session key');
check(background.includes('extension_handshake'), 'installation WebSocket channel handshake is missing');
check(background.includes('channel_heartbeat'), 'installation WebSocket channel heartbeat is missing');
check(background.includes('tool_completion'), 'bound tool completion contract is missing');
for (const size of [16, 48, 128]) {
  const file = path.join(root, `.output/chrome-mv3/icon/${size}.png`);
  check(fs.existsSync(file) && fs.statSync(file).size > 80, `icon/${size}.png is missing or still a placeholder`);
}
const zip = path.join(root, `.output/buffaly-browser-agent-${pkg.version}-chrome.zip`);
check(fs.existsSync(zip) && fs.statSync(zip).size > 1000, 'versioned release archive is missing');
if (fs.existsSync(path.join(root, '.git'))) {
  const tracked = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' }).split('\n');
  check(!tracked.some((file) => file.startsWith('dev/')), 'development scratch files are tracked');
} else {
  check(!fs.existsSync(path.join(root, 'dev')), 'development scratch directory is present in exported source');
}

if (failures.length) {
  console.error(failures.map((failure) => `FAIL: ${failure}`).join('\n'));
  process.exit(1);
}
console.log(`Release verification passed for ${manifest.name} ${manifest.version}`);
