import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';

// Real Chrome fixture: full production function, no debugger and no mocked DOM.
const source = fs.readFileSync(process.env.DOM_SOURCE_FILE || new URL('../lib/injected-dom-ops.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText.replace('export function injectedDomOperation', 'function injectedDomOperation');
const tests = () => {
  let checks = 0;
  const failures = [];
  const call = (operation, args) => injectedDomOperation({ operation, args });
  const assert = (condition, detail) => { checks++; if (!condition) throw Error(detail); };
  const run = (name, body, test) => {
    document.body.innerHTML = body;
    try { test(); } catch (e) { failures.push(`${name}: ${e.message}`); }
  };
  const success = (operation, selector, args = {}) => {
    const r = call(operation, { selector, ...args });
    assert(r.ok, `${operation} ${selector}: ${JSON.stringify(r)}`); return r;
  };
  const rejects = (operation, selector, code, args = {}) => {
    const r = call(operation, { selector, ...args });
    assert(!r.ok && r.code === code, `${operation} ${selector}: ${JSON.stringify(r)}`);
  };
  const shadow = (markup) => {
    const host = document.querySelector('#host');
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = markup;
    return root;
  };
  run('visibility override', '<div style="visibility:hidden"><input id="restored" style="visibility:visible"><input id="inherited"></div>', () => {
    success('click', '#restored'); success('hover', '#restored');
    success('type_text', '#restored', { text: 'visible child' });
    assert(document.querySelector('#restored').value === 'visible child', 'readback');
    rejects('click', '#inherited', 'ELEMENT_NOT_INTERACTABLE');
    rejects('type_text', '#inherited', 'ELEMENT_NOT_VISIBLE', { text: 'no' });
  });
  run('single shadow focus', '<div id="host"></div>', () => {
    const root = shadow('<input id="singleShadow">');
    success('type_text', '#singleShadow', { text: 'focused' });
    assert(root.activeElement === root.querySelector('input') && root.querySelector('input').value === 'focused', 'deep focus and readback');
  });
  run('nested shadow focus and input', '<div id="host"></div>', () => {
    const root = shadow('<div id="nested"></div>');
    const inner = root.querySelector('#nested').attachShadow({ mode: 'open' });
    inner.innerHTML = '<input id="shadowInput"><div id="editable" contenteditable="true">old</div>';
    success('type_text', '#shadowInput', { text: 'one' });
    success('type_text', '#shadowInput', { text: 'two', mode: 'append' });
    assert(inner.querySelector('input').value === 'onetwo', 'nested readback');
    success('type_text', '#editable', { text: 'plain' });
    assert(inner.querySelector('#editable').textContent === 'plain', 'editable readback');
  });
  run('SVG activation', '<svg width="100" height="60"><rect id="svgTarget" width="100" height="60" fill="blue"/></svg>', () => {
    let clicks = 0;
    document.querySelector('#svgTarget').addEventListener('click', () => clicks++);
    const r = success('click', '#svgTarget');
    assert(clicks === 1 && r.data.synthetic && !r.data.verified, 'exactly one synthetic click, not verified success');
  });
  run('disabled fieldset and first legend', '<fieldset disabled><legend><input id="allowed"></legend><input id="blocked"><legend><input id="secondLegend"></legend></fieldset>', () => {
    let clicks = 0;
    document.querySelector('#blocked').addEventListener('click', () => clicks++);
    rejects('click', '#blocked', 'ELEMENT_DISABLED');
    rejects('type_text', '#blocked', 'ELEMENT_DISABLED', { text: 'no' });
    rejects('click', '#secondLegend', 'ELEMENT_DISABLED');
    assert(clicks === 0 && document.querySelector('#blocked').value === '', 'disabled remains unchanged');
    success('type_text', '#allowed', { text: 'allowed' });
  });
  run('shadow overlay', '<div id="host"></div>', () => {
    const root = shadow('<div style="position:relative;width:180px;height:60px"><button id="shadowButton" style="width:180px;height:60px">click</button><div id="overlay" style="position:absolute;inset:0;background:white"></div></div>');
    let clicks = 0; root.querySelector('button').addEventListener('click', () => clicks++);
    rejects('click', '#shadowButton', 'ELEMENT_OBSTRUCTED');
    rejects('hover', '#shadowButton', 'ELEMENT_OBSTRUCTED');
    assert(clicks === 0, 'covered target untouched');
    root.querySelector('#overlay').remove();
    success('click', '#shadowButton'); assert(clicks === 1, 'uncovered target works');
  });
  run('shadow ancestor opacity', '<div id="host" style="opacity:0"></div>', () => {
    shadow('<input id="shadowHidden">');
    rejects('click', '#shadowHidden', 'ELEMENT_NOT_INTERACTABLE');
    rejects('type_text', '#shadowHidden', 'ELEMENT_NOT_VISIBLE', { text: 'no' });
  });
  run('slotted target hit test', '<div id="host"><button id="slotted" slot="action">button</button></div>', () => {
    shadow('<slot name="action"></slot>');
    let n = 0; document.querySelector('#slotted').addEventListener('click', () => n++);
    success('click', '#slotted'); assert(n === 1, 'slotted activation');
  });
  run('slotted ancestor opacity', '<div id="host"><input id="slotted" slot="action"></div>', () => {
    shadow('<div style="opacity:0"><slot name="action"></slot></div>');
    rejects('click', '#slotted', 'ELEMENT_NOT_INTERACTABLE');
  });
  run('hover shadow propagation', '<div id="host"></div>', () => {
    shadow('<button id="hovered">hover</button>');
    let target;
    document.querySelector('#host').addEventListener('mouseover', e => { target = e.target; });
    success('hover', '#hovered'); assert(target === document.querySelector('#host'), 'composed hover reaches host');
  });
  run('inert ancestry', '<div inert><button id="inertButton">no</button><input id="inertInput"></div>', () => {
    let n = 0; document.querySelector('button').addEventListener('click', () => n++);
    assert(!call('click', { selector: '#inertButton' }).ok, 'inert click rejected');
    assert(!call('type_text', { selector: '#inertInput', text: 'no' }).ok, 'inert input rejected');
    assert(n === 0 && document.querySelector('input').value === '', 'inert unchanged');
  });
  run('select disabled fieldset', '<fieldset disabled><select id="select"><option value="a">A</option><option value="b">B</option></select></fieldset>', () => {
    rejects('select_option', '#select', 'ELEMENT_DISABLED', { value: 'b' });
    assert(document.querySelector('select').value === 'a', 'disabled selection unchanged');
  });
  run('select disabled option', '<select id="select"><option value="a">A</option><option value="b" disabled>B</option><optgroup disabled><option value="c">C</option></optgroup></select>', () => {
    rejects('select_option', '#select', 'OPTION_DISABLED', { value: 'b' });
    rejects('select_option', '#select', 'OPTION_DISABLED', { value: 'c' });
    assert(document.querySelector('select').value === 'a', 'disabled options unchanged');
  });
  run('select hidden', '<select id="select" style="display:none"><option value="a">A</option><option value="b">B</option></select>', () => {
    rejects('select_option', '#select', 'ELEMENT_NOT_VISIBLE', { value: 'b' });
    assert(document.querySelector('select').value === 'a', 'hidden unchanged');
  });
  run('select covered', '<div style="position:relative;width:200px"><select id="select"><option value="a">A</option><option value="b">B</option></select><div style="position:absolute;inset:0;background:white"></div></div>', () => {
    rejects('select_option', '#select', 'ELEMENT_OBSTRUCTED', { value: 'b' });
    assert(document.querySelector('select').value === 'a', 'covered unchanged');
  });
  run('shadow select events', '<div id="host"></div>', () => {
    const root = shadow('<select id="select"><option value="a">A</option><option value="b">B</option></select>');
    let input = 0;
    document.querySelector('#host').addEventListener('input', () => input++);
    success('select_option', '#select', { value: 'b' });
    assert(root.querySelector('select').value === 'b' && input === 1, 'native composed input reaches host');
  });
  run('shadow keyboard active focus', '<div id="host"></div>', () => {
    const root = shadow('<input id="keyInput">');
    const input = root.querySelector('input'); input.focus();
    let local = 0, outer = 0;
    input.addEventListener('keydown', () => local++);
    document.querySelector('#host').addEventListener('keydown', () => outer++);
    const r = call('press_key', { key: 'Escape' });
    assert(r.ok && local === 1 && outer === 1, 'active shadow control and composed host both receive key');
    assert(input.value === '' && !r.data.verifiedNativeAction, 'no invented native default');
  });
  run('keyboard disabled target', '<input id="disabledKey" disabled>', () => {
    let events = 0;
    document.querySelector('input').addEventListener('keydown', () => events++);
    rejects('press_key', '#disabledKey', 'ELEMENT_DISABLED', { key: 'Enter' });
    assert(events === 0, 'disabled keyboard handler not invoked');
  });
  run('keyboard explicit shadow propagation', '<div id="host"></div>', () => {
    shadow('<input id="explicitKey" readonly>');
    let keys = 0; document.querySelector('#host').addEventListener('keydown', () => keys++);
    success('press_key', '#explicitKey', { key: 'Escape' });
    assert(keys === 1, 'readonly focusable input can receive keys through shadow host');
  });
  run('keyboard nonfocusable target', '<div id="noFocus">plain</div>', () => {
    let keys = 0; document.querySelector('#noFocus').addEventListener('keydown', () => keys++);
    rejects('press_key', '#noFocus', 'FOCUS_FAILED', { key: 'Enter' });
    assert(keys === 0, 'nonfocused target does not receive fabricated key');
  });
  run('ordinary select and cancellation readback', '<select id="select"><option value="a">A</option><option value="b">B</option></select>', () => {
    success('select_option', '#select', { value: 'b' });
    const select = document.querySelector('select');
    select.addEventListener('input', () => { select.value = 'a'; });
    rejects('select_option', '#select', 'READBACK_MISMATCH', { value: 'b' });
  });
  const result = document.createElement('pre'); result.id = 'result';
  result.textContent = JSON.stringify({ checks, failures }); document.body.replaceChildren(result);
};
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'buffaly-dom-matrix-'));
try {
  const file = path.join(directory, 'test.html');
  fs.writeFileSync(file, `<!doctype html><style>input,button,select,[contenteditable]{min-width:120px;min-height:28px;margin:8px}body{margin:20px}</style><body><script>${js}\n(${tests.toString()})();</script>`);
  const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
  const r = spawnSync(chrome, ['--headless=new', '--disable-gpu', '--no-first-run', `--user-data-dir=${directory}/profile`, '--window-size=1280,1000', '--dump-dom', `file:///${file.replaceAll('\\', '/')}`], { encoding: 'utf8', timeout: 60000, maxBuffer: 1024 * 1024 });
  const match = r.stdout?.match(/<pre id="result">([^<]+)<\/pre>/);
  if (r.error || r.status !== 0 || !match) throw Error(`Chrome matrix failed to run: ${r.error || r.stderr || r.stdout}`);
  const result = JSON.parse(match[1].replaceAll('&gt;', '>').replaceAll('&lt;', '<').replaceAll('&amp;', '&'));
  console.log(JSON.stringify(result, null, 2));
  if (result.failures.length) process.exitCode = 1;
} finally { fs.rmSync(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); }
