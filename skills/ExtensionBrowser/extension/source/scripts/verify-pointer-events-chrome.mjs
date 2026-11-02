import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';

// Execute the complete production function in real Chrome, not extracted mocked helpers.
const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'buffaly-dom-test-'));
let source = fs.readFileSync(new URL('../lib/injected-dom-ops.ts', import.meta.url), 'utf8');
const baseline = process.argv.includes('--baseline');
if (baseline) source = source.replace("(current === el && style.pointerEvents === 'none')", "style.pointerEvents === 'none'");
const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText.replace('export function injectedDomOperation', 'function injectedDomOperation');
const tests = () => {
  let count = 0;
  const assert = (condition, detail) => { if (!condition) throw Error(detail); count++; };
  const call = (operation, args) => injectedDomOperation({ operation, args });
  const rejects = (selector, code, operation = 'click') => {
    const r = call(operation, { selector, text: 'blocked' });
    assert(!r.ok && r.code === code, `${selector} ${operation}: ${JSON.stringify(r)}`);
  };
  const parent = document.querySelector('#portal');
  const input = document.querySelector('#restored');
  assert(getComputedStyle(parent).pointerEvents === 'none', 'real parent style');
  assert(getComputedStyle(input).pointerEvents === 'auto', 'real child override');
  assert(call('click', { selector: '#restored' }).ok, 'restored click');
  assert(call('hover', { selector: '#restored' }).ok, 'restored hover');
  const typed = call('type_text', { selector: '#restored', text: 'recipient-fixture' });
  assert(typed.ok && input.value === 'recipient-fixture', 'restored native input and readback');
  assert(call('type_text', { selector: '#ordinary', text: 'ordinary' }).ok, 'ordinary input');
  assert(call('type_text', { selector: '#fixed', text: 'fixed' }).ok, 'fixed input');
  rejects('#inherited', 'ELEMENT_NOT_INTERACTABLE');
  rejects('#none', 'ELEMENT_NOT_INTERACTABLE');
  rejects('#none', 'ELEMENT_NOT_INTERACTABLE', 'hover');
  rejects('#none', 'ELEMENT_NOT_INTERACTABLE', 'type_text');
  rejects('#disabled', 'ELEMENT_DISABLED');
  rejects('#readonly', 'ELEMENT_READONLY', 'type_text');
  rejects('#hidden', 'ELEMENT_NOT_VISIBLE');
  rejects('#zero', 'ELEMENT_NOT_VISIBLE');
  rejects('#hiddenParent input', 'ELEMENT_NOT_VISIBLE');
  rejects('#transparent input', 'ELEMENT_NOT_INTERACTABLE');
  rejects('#covered', 'ELEMENT_OBSTRUCTED');
  const observed = call('find_elements', { query: '#ordinary' });
  assert(observed.ok, 'observe ref');
  const ref = observed.data.elements[0].elementId;
  assert(call('click', { elementId: ref }).ok, 'actionable ref');
  document.querySelector('#ordinary').remove();
  assert(!call('click', { elementId: ref }).ok, 'disconnected ref rejected');
  const stale = injectedDomOperation({ operation: 'click', args: { selector: '#restored' }, expectedDocumentToken: 'wrong-document' });
  assert(!stale.ok, 'document token rejected');
  const events = [];
  const button = document.querySelector('#lifecycle');
  for (const name of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) button.addEventListener(name, () => events.push(name));
  assert(call('click', { selector: '#lifecycle' }).ok, 'button lifecycle');
  assert(events.join(',') === 'pointerdown,mousedown,pointerup,mouseup,click', `lifecycle order ${events}`);
  // Four-field controlled input and cancel fixture protects the earlier form mechanics.
  for (let i = 1; i <= 4; i++) assert(call('type_text', { selector: `#ns${i}`, text: `ns${i}.example.test` }).ok, `field ${i}`);
  document.querySelector('#cancel').addEventListener('click', () => document.querySelector('#form').remove());
  assert(call('click', { selector: '#cancel' }).ok && !document.querySelector('#form'), 'cancel fixture');
  document.body.innerHTML = `<pre>PASS ${count} real Chrome DOM checks</pre>`;
};
try {
  const html = `<!doctype html><style>input,button{display:block;margin:8px;width:240px;height:26px}#portal{pointer-events:none}#restored{pointer-events:auto}#fixed{position:fixed;right:20px;top:20px}#hiddenParent{display:none}#transparent{opacity:0}#zero{width:0;height:0;padding:0;border:0}#cover{position:absolute;inset:0;z-index:4;background:white}</style><div id="portal"><input id="restored"><input id="inherited"></div><input id="ordinary"><input id="none" style="pointer-events:none"><input id="fixed"><input id="disabled" disabled><input id="readonly" readonly><input id="hidden" type="hidden"><input id="zero"><div id="hiddenParent"><input></div><div id="transparent"><input></div><div style="position:relative;width:280px"><input id="covered"><div id="cover"></div></div><button id="lifecycle">click</button><div id="form"><input id="ns1"><input id="ns2"><input id="ns3"><input id="ns4"><button id="cancel">Cancel</button></div><script>${js}\ntry { (${tests.toString()})(); } catch(e) {document.body.innerHTML='<pre>FAIL '+e.message+'</pre>';}</script>`;
  const file = path.join(directory, 'test.html'); fs.writeFileSync(file, html);
  const result = spawnSync(chrome, ['--headless=new', '--disable-gpu', '--no-first-run', `--user-data-dir=${directory}/profile`, '--window-size=1280,1600', '--dump-dom', `file:///${file.replaceAll('\\', '/')}`], { encoding: 'utf8', timeout: 60000, maxBuffer: 1024 * 1024 });
  const match = result.stdout?.match(/<pre>(PASS \d+ real Chrome DOM checks)<\/pre>/);
  if (baseline) {
    if (!result.stdout?.includes('<pre>FAIL restored click</pre>')) throw Error('Baseline did not reproduce the ancestor pointer-events rejection.');
    console.log('PASS baseline: original all-ancestor guard rejects restored click in Chrome');
  } else {
    if (!match) throw Error(`Chrome regression failed: ${result.error || result.stdout}\n${result.stderr}`);
    console.log(match[1]);
  }
} finally { fs.rmSync(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); }
