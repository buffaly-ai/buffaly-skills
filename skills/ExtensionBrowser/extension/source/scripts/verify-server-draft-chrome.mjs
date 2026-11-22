import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { build } from 'esbuild';

// Render production App in real Chrome. Only Chrome transport and the unused inbound
// tool executor are mocked; React state, handlers, effects and controls are real.
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'buffaly-server-draft-'));
const setup = () => {
  const event = { addListener() {}, removeListener() {} };
  window.fixture = {
    active: { ServerId: 'matt', Name: 'Matt.local', Origin: 'https://matt.example.test:10584' },
    reads: 0, saves: [], authorizations: [], periodic: null, release: null, defer: false,
  };
  const f = window.fixture;
  const status = () => ({ Servers: [{ ...f.active, Authorized: true, Conversations: [] }], ActiveServer: { ...f.active }, State: 'SignInRequired', Version: 'test', ChannelConnected: false, InstallationState: '', LastConnectedUtc: '', RegisteredExtensionVersion: 'test', ToolSchemaVersion: 1 });
  const interval = window.setInterval;
  window.setInterval = (fn, ms, ...args) => { if (ms === 10000) { f.periodic = fn; return 999; } return interval(fn, ms, ...args); };
  const sendMessage = (message, callback) => {
    let response;
    switch (message.type) {
      case 'get_buffaly_servers':
        f.reads++;
        if (f.defer) { f.defer = false; return new Promise(resolve => { f.release = () => resolve({ ok: true, data: status() }); }); }
        response = { ok: true, data: status() }; break;
      case 'list_extension_browser_instances': response = { ok: true, data: [] }; break;
      case 'get_buffaly_conversation_bootstrap': response = { ok: false }; break;
      case 'tool_call': response = { ok: true, data: { debuggerAttached: false, activeTab: null } }; break;
      case 'save_buffaly_server':
        f.saves.push(message); f.active = { ServerId: message.serverId || 'staging', Name: message.name, Origin: message.origin };
        response = { ok: true, data: { Server: { ...f.active, Authorized: false, Conversations: [] } } }; break;
      case 'authorize_buffaly_installation': f.authorizations.push(message); response = { ok: false, error: 'fixture authorization stop' }; break;
      default: throw Error(`Unexpected transport ${message.type}`);
    }
    callback?.(response); return Promise.resolve(response);
  };
  window.chrome = { runtime: { sendMessage, getURL: () => '', getManifest: () => ({ version: 'test' }), connect: () => ({ postMessage() {}, disconnect() {}, onMessage: event, onDisconnect: event }), onMessage: event }, windows: { getCurrent: async () => ({ id: 1 }) }, tabs: { onActivated: event, onUpdated: event }, storage: { local: { get: async () => ({}), set: async () => {} } } };
};
const tests = async () => {
  let checks = 0;
  const assert = (condition, message) => { if (!condition) throw Error(message); checks++; };
  const settle = () => new Promise(resolve => setTimeout(resolve, 30));
  const f = window.fixture;
  const button = (text) => [...document.querySelectorAll('button')].find(b => b.textContent === text);
  const input = (section, label) => [...document.querySelectorAll(`${section} label`)].find(el => el.firstChild.textContent === label).querySelector('input');
  const type = (el, value) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, value); el.dispatchEvent(new Event('input', { bubbles: true })); };
  const checkRefresh = () => document.querySelector('[aria-label="Check selected server"]').click();
  await settle(); await settle();
  assert(f.reads > 0 && f.periodic, 'initial status and real periodic callback installed');
  button('Add').click(); await settle();
  const draft = 'https://staging.example.test:58210';
  type(input('.add-server', 'Name'), 'Staging 58210'); type(input('.add-server', 'Origin'), draft); await settle();
  f.periodic(); await settle();
  assert(input('.add-server', 'Origin').value === draft, 'periodic refresh clobbered Add origin');
  assert(input('.add-server', 'Name').value === 'Staging 58210', 'periodic refresh clobbered Add name');
  checkRefresh(); await settle();
  assert(input('.add-server', 'Origin').value === draft, 'manual refresh clobbered Add origin');
  document.dispatchEvent(new Event('visibilitychange')); await settle();
  assert(input('.add-server', 'Origin').value === draft, 'visibility refresh clobbered Add origin');
  f.defer = true; checkRefresh(); await settle();
  type(input('.add-server', 'Origin'), draft + '/draft'); await settle(); f.release(); await settle();
  assert(input('.add-server', 'Origin').value === draft + '/draft', 'late refresh clobbered newer draft');
  type(input('.add-server', 'Origin'), draft); await settle(); button('Save server').click(); await settle(); await settle();
  assert(f.saves.length === 1 && f.saves[0].serverId === '' && f.saves[0].origin === draft && f.saves[0].name === 'Staging 58210', 'Add saved different values or edit identity');
  assert(!document.querySelector('.add-server'), 'successful Add closes draft');
  document.querySelector('[aria-label="Manage selected server"]').click(); await settle();
  assert(input('.settings-modal', 'Origin').value === draft, 'Settings initializes from active server');
  type(input('.settings-modal', 'Origin'), 'https://edited.example.test:58210'); type(input('.settings-modal', 'Name'), 'Edited staging'); await settle();
  f.periodic(); await settle();
  assert(input('.settings-modal', 'Origin').value === 'https://edited.example.test:58210', 'periodic refresh clobbered Settings origin');
  assert(input('.settings-modal', 'Name').value === 'Edited staging', 'periodic refresh clobbered Settings name');
  button('Cancel').click(); await settle();
  assert(f.saves.length === 1, 'Cancel must not save');
  document.querySelector('[aria-label="Manage selected server"]').click(); await settle();
  assert(input('.settings-modal', 'Origin').value === draft, 'reopen Settings discards canceled draft');
  type(input('.settings-modal', 'Origin'), 'https://edited.example.test:58210'); await settle(); button('Save changes').click(); await settle(); await settle();
  assert(f.saves.length === 2 && f.saves[1].serverId === 'staging' && f.saves[1].origin === 'https://edited.example.test:58210', 'Settings saves exact draft to active identity');
  button('Add').click(); await settle(); type(input('.add-server', 'Origin'), 'https://abandoned.example.test'); await settle(); button('Add').click(); await settle();
  // Status changes after a canceled draft must update authorization, not the draft.
  f.active = { ServerId: 'other', Name: 'Other server', Origin: 'https://other.example.test:10584' }; checkRefresh(); await settle();
  const authorize = document.querySelector('.connect-button');
  assert(!!authorize, 'ordinary authorization control available'); authorize.click(); await settle();
  assert(f.authorizations.length === 1 && f.authorizations[0].origin === f.active.Origin, 'authorization used abandoned draft instead of active origin');
  assert(f.authorizations[0].name === f.active.Name, 'authorization uses active server name');
  document.body.innerHTML = `<pre>PASS ${checks} real Chrome server draft checks</pre>`;
};
try {
  const result = await build({ stdin: { contents: "import React from 'react'; import {createRoot} from 'react-dom/client'; import App from './entrypoints/sidepanel/App'; createRoot(document.getElementById('root')).render(React.createElement(App));", resolveDir: path.resolve(new URL('..', import.meta.url).pathname.replace(/^\/(.:)/, '$1')), loader: 'tsx' }, bundle: true, write: false, format: 'iife', jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' }, plugins: [{ name: 'unused-executor', setup(b) { b.onResolve({ filter: /\/tool-router$/ }, () => ({ path: 'unused-executor', namespace: 'fixture' })); b.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: 'export function handleToolCall(){throw Error("unexpected inbound executor");}' })); } }] });
  const html = `<!doctype html><div id="root"></div><script>(${setup.toString()})();</script><script>${result.outputFiles[0].text.replaceAll('</script', '<\\/script')}</script><script>(${tests.toString()})().catch(e=>document.body.innerHTML='<pre>FAIL '+e.message+'</pre>');</script>`;
  const file = path.join(directory, 'test.html'); fs.writeFileSync(file, html);
  const chrome = spawnSync(process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-gpu', '--no-first-run', `--user-data-dir=${directory}/profile`, '--virtual-time-budget=8000', '--dump-dom', `file:///${file.replaceAll('\\', '/')}`], { encoding: 'utf8', timeout: 60000, maxBuffer: 2 * 1024 * 1024 });
  const pass = chrome.stdout?.match(/<pre>(PASS \d+ real Chrome server draft checks)<\/pre>/);
  if (!pass) throw Error(`Server draft regression: ${chrome.error || chrome.stdout}\n${chrome.stderr}`);
  console.log(pass[1]);
} finally { fs.rmSync(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); }
