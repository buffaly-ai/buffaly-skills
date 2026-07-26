import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, '.output/chrome-mv3/manifest.json'), 'utf8'));
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const background = fs.readFileSync(path.join(root, '.output/chrome-mv3/background.js'), 'utf8');
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

check(manifest.manifest_version === 3, 'manifest_version must be 3');
check(manifest.name === 'Buffaly Browser Agent', 'release name is incorrect');
check(manifest.version === pkg.version, 'package and manifest versions differ');
check(manifest.background?.service_worker === 'background.js', 'background service worker is missing');
check(background.includes('__callTool'), 'background service worker bridge hook is missing');
check(manifest.side_panel?.default_path === 'sidepanel.html', 'side panel is missing');
check(manifest.content_scripts?.length === 1, 'content script declaration is missing');
check(!manifest.permissions.includes('storage'), 'unused storage permission is present');
for (const permission of ['sidePanel', 'tabs', 'scripting', 'activeTab', 'debugger']) {
  check(manifest.permissions.includes(permission), `required permission is missing: ${permission}`);
}
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
