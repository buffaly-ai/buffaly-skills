'use strict';

const CDP = require('chrome-remote-interface');
const fs = require('fs');
const path = require('path');
const http = require('http');

const SESSION_STATE_PATH = '/tmp/buffaly-cdp-sessions.json';

// ─── Session State Management ───

function loadSessionState() {
    try {
        const data = fs.readFileSync(SESSION_STATE_PATH, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return { sessions: {} };
    }
}

function saveSessionState(state) {
    fs.writeFileSync(SESSION_STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
}

function getSession(cdpSessionId) {
    const state = loadSessionState();
    return state.sessions[cdpSessionId] || null;
}

function updateSession(cdpSessionId, updates) {
    const state = loadSessionState();
    if (!state.sessions[cdpSessionId]) return null;
    Object.assign(state.sessions[cdpSessionId], updates);
    saveSessionState(state);
    return state.sessions[cdpSessionId];
}

function deleteSession(cdpSessionId) {
    const state = loadSessionState();
    delete state.sessions[cdpSessionId];
    saveSessionState(state);
}

function generateSessionId() {
    return 'cdp_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
}

// ─── CDP Connection Helpers ───

async function getBrowserInfo(port) {
    return new Promise((resolve, reject) => {
        http.get(`http://127.0.0.1:${port}/json/version`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(new Error('Invalid /json/version response')); }
            });
        }).on('error', reject);
    });
}

async function getTabList(port) {
    return new Promise((resolve, reject) => {
        http.get(`http://127.0.0.1:${port}/json/list`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(new Error('Invalid /json/list response')); }
            });
        }).on('error', reject);
    });
}

async function connectToBrowser(port) {
    const info = await getBrowserInfo(port);
    const wsUrl = info.webSocketDebuggerUrl;
    if (!wsUrl) throw new Error('No webSocketDebuggerUrl found');
    const client = await CDP({ target: wsUrl });
    return { client, info };
}

async function connectToTab(port, targetId) {
    const client = await CDP({ target: targetId, port: port });
    
    // Re-apply active overrides if this targetId belongs to a session
    const state = loadSessionState();
    for (const [sid, s] of Object.entries(state.sessions)) {
        if (s.targetId === targetId && s.activeOverrides && Object.keys(s.activeOverrides).length > 0) {
            try { await reapplyOverrides(client, s.activeOverrides); } catch(e) { /* best effort */ }
            break;
        }
    }
    
    return client;
}

async function reapplyOverrides(client, overrides) {
    if (overrides.userAgent) {
        await client.Network.enable();
        await client.Network.setUserAgentOverride({ userAgent: overrides.userAgent });
    }
    if (overrides.deviceMetrics) {
        await client.Emulation.enable();
        await client.Emulation.setDeviceMetricsOverride(overrides.deviceMetrics);
    }
    if (overrides.geolocation) {
        await client.Emulation.enable();
        await client.Emulation.setGeolocationOverride(overrides.geolocation);
    }
    if (overrides.timezone) {
        await client.Emulation.enable();
        await client.Emulation.setTimezoneOverride({ timezoneId: overrides.timezone });
    }
    if (overrides.extraHeaders) {
        await client.Network.enable();
        await client.Network.setExtraHTTPHeaders({ headers: overrides.extraHeaders });
    }
    if (overrides.touchEmulation !== undefined) {
        await client.Emulation.enable();
        await client.Emulation.setTouchEmulationEnabled({ enabled: overrides.touchEmulation });
    }
    if (overrides.bypassCsp !== undefined) {
        await client.Page.setBypassCSP({ enabled: overrides.bypassCsp });
    }
    if (overrides.cacheDisabled !== undefined) {
        await client.Network.enable();
        await client.Network.setCacheDisabled({ cacheDisabled: overrides.cacheDisabled });
    }
}

// ─── CDP Action Handlers ───

const handlers = {};

// ── Session Management ──

handlers.openSession = async (params) => {
    const port = params.port || 9222;
    const url = params.url || 'about:blank';
    
    const { client: browserClient, info } = await connectToBrowser(port);
    
    // Create a new tab
    const { targetId } = await browserClient.Target.createTarget({ url: url });
    
    // Connect to the new tab
    const tabClient = await CDP({ target: targetId, port: port });
    
    // Enable required domains
    await tabClient.Page.enable();
    await tabClient.Runtime.enable();
    await tabClient.DOM.enable();
    // Input domain does not need enable() - it's always available
    
    // If URL was provided and isn't about:blank, navigate
    if (url && url !== 'about:blank') {
        const { frameId, loaderId, errorText } = await tabClient.Page.navigate({ url });
        if (errorText) throw new Error(`Navigation error: ${errorText}`);
        // Wait for load event
        await new Promise((resolve) => {
            const timeout = setTimeout(resolve, 15000);
            tabClient.Page.loadEventFired(() => { clearTimeout(timeout); resolve(); });
        });
    }
    
    // Get page title
    const { result } = await tabClient.Runtime.evaluate({ expression: 'document.title' });
    const title = result.value || '';
    
    // Get current URL
    const urlResult = await tabClient.Runtime.evaluate({ expression: 'window.location.href' });
    const tabUrl = urlResult.result.value || url;
    
    // Save session state
    const cdpSessionId = generateSessionId();
    const state = loadSessionState();
    state.sessions[cdpSessionId] = {
        targetId: targetId,
        port: port,
        wsUrl: info.webSocketDebuggerUrl,
        createdAt: new Date().toISOString(),
        ownedTabIds: [targetId],
        enabledDomains: ['Page', 'Runtime', 'DOM', 'Input'],
        activeOverrides: {}
    };
    saveSessionState(state);
    
    // Close the browser-level client (we only need the tab client)
    // But we need to keep the tab client alive — we'll reconnect each time
    // Actually, chrome-remote-interface connections are per-command here
    // We'll reconnect for each action
    
    await tabClient.close();
    await browserClient.close();
    
    return {
        cdpSessionId: cdpSessionId,
        tabId: targetId,
        tabUrl: tabUrl,
        port: port,
        title: title
    };
};

handlers.closeSession = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found: ' + params.cdpSessionId);
    
    // Reset overrides first
    if (session.activeOverrides && Object.keys(session.activeOverrides).length > 0) {
        try {
            const client = await connectToTab(session.port, session.targetId);
            await resetOverrides(client, session, params.cdpSessionId);
            await client.close();
        } catch (e) {
            // Best effort
        }
    }
    
    // Close the tab
    try {
        const { client: browserClient } = await connectToBrowser(session.port);
        await browserClient.Target.closeTarget({ targetId: session.targetId });
        await browserClient.close();
    } catch (e) {
        // Tab may already be closed
    }
    
    deleteSession(params.cdpSessionId);
    return { status: 'closed', cdpSessionId: params.cdpSessionId };
};

handlers.listSessions = async (params) => {
    const state = loadSessionState();
    const result = [];
    for (const [id, s] of Object.entries(state.sessions)) {
        result.push({ cdpSessionId: id, tabId: s.targetId, tabUrl: s.tabUrl || '', port: s.port });
    }
    return { sessions: result };
};

// ── Navigation ──

handlers.navigate = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        await client.Page.enable();
        const { frameId, loaderId, errorText } = await client.Page.navigate({ url: params.url });
        if (errorText) throw new Error(`Navigation error: ${errorText}`);
        await new Promise((resolve) => {
            const timeout = setTimeout(resolve, params.timeoutMs || 15000);
            client.Page.loadEventFired(() => { clearTimeout(timeout); resolve(); });
        });
        const titleResult = await client.Runtime.evaluate({ expression: 'document.title' });
        const urlResult = await client.Runtime.evaluate({ expression: 'window.location.href' });
        return { url: urlResult.result.value, title: titleResult.result.value, status: 'loaded' };
    } finally { await client.close(); }
};

handlers.getUrl = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        const { result } = await client.Runtime.evaluate({ expression: 'window.location.href' });
        return { url: result.value };
    } finally { await client.close(); }
};

handlers.getTitle = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        const { result } = await client.Runtime.evaluate({ expression: 'document.title' });
        return { title: result.value };
    } finally { await client.close(); }
};

handlers.goBack = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        await client.Runtime.evaluate({ expression: 'history.back()' });
        await new Promise(r => setTimeout(r, 1000));
        const { result } = await client.Runtime.evaluate({ expression: 'window.location.href' });
        return { url: result.value };
    } finally { await client.close(); }
};

handlers.goForward = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        await client.Runtime.evaluate({ expression: 'history.forward()' });
        await new Promise(r => setTimeout(r, 1000));
        const { result } = await client.Runtime.evaluate({ expression: 'window.location.href' });
        return { url: result.value };
    } finally { await client.close(); }
};

// ── DOM Interaction (Trusted Input) ──

async function waitForSelector(client, selector, timeoutMs) {
    const start = Date.now();
    while (Date.now() - start < (timeoutMs || 15000)) {
        const { result } = await client.Runtime.evaluate({
            expression: `(function() { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, visible: r.width > 0 && r.height > 0 }; })()`,
            returnByValue: true
        });
        if (result.value && result.value.visible) return result.value;
        await new Promise(r => setTimeout(r, 200));
    }
    return null;
}

handlers.click = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        const box = await waitForSelector(client, params.selector, params.timeoutMs || 15000);
        if (!box) throw new Error('Element not found: ' + params.selector);
        const x = Math.round(box.x + box.width / 2);
        const y = Math.round(box.y + box.height / 2);
        await client.Input.dispatchMouseEvent({ type: 'mouseMoved', x, y });
        await client.Input.dispatchMouseEvent({ type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
        await client.Input.dispatchMouseEvent({ type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
        return { clicked: true, selector: params.selector, x, y };
    } finally { await client.close(); }
};

handlers.type = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        const box = await waitForSelector(client, params.selector, params.timeoutMs || 15000);
        if (!box) throw new Error('Element not found: ' + params.selector);
        const x = Math.round(box.x + box.width / 2);
        const y = Math.round(box.y + box.height / 2);
        // Click to focus
        await client.Input.dispatchMouseEvent({ type: 'mouseMoved', x, y });
        await client.Input.dispatchMouseEvent({ type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
        await client.Input.dispatchMouseEvent({ type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
        // Clear if requested
        if (params.clearFirst !== false) {
            await client.Input.dispatchKeyEvent({ type: 'keyDown', key: 'a', modifiers: 2 }); // Ctrl+A
            await client.Input.dispatchKeyEvent({ type: 'keyDown', key: 'Backspace' });
            await client.Input.dispatchKeyEvent({ type: 'keyUp', key: 'Backspace' });
        }
        // Type text using trusted input
        await client.Input.insertText({ text: params.text });
        return { typed: true, selector: params.selector, length: params.text.length };
    } finally { await client.close(); }
};

handlers.pressKey = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        const key = params.key;
        const modifiers = params.modifiers || 0;
        await client.Input.dispatchKeyEvent({ type: 'keyDown', key, modifiers });
        await client.Input.dispatchKeyEvent({ type: 'keyUp', key, modifiers });
        return { pressed: true, key: key };
    } finally { await client.close(); }
};

handlers.pressSelectorKey = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        const box = await waitForSelector(client, params.selector, params.timeoutMs || 15000);
        if (!box) throw new Error('Element not found: ' + params.selector);
        const x = Math.round(box.x + box.width / 2);
        const y = Math.round(box.y + box.height / 2);
        await client.Input.dispatchMouseEvent({ type: 'mouseMoved', x, y });
        await client.Input.dispatchMouseEvent({ type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
        await client.Input.dispatchMouseEvent({ type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
        const key = params.key;
        await client.Input.dispatchKeyEvent({ type: 'keyDown', key });
        await client.Input.dispatchKeyEvent({ type: 'keyUp', key });
        return { pressed: true, selector: params.selector, key: key };
    } finally { await client.close(); }
};

handlers.hover = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        const box = await waitForSelector(client, params.selector, params.timeoutMs || 15000);
        if (!box) throw new Error('Element not found: ' + params.selector);
        const x = Math.round(box.x + box.width / 2);
        const y = Math.round(box.y + box.height / 2);
        await client.Input.dispatchMouseEvent({ type: 'mouseMoved', x, y });
        return { hovered: true, selector: params.selector };
    } finally { await client.close(); }
};

handlers.scroll = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        if (params.selector) {
            const box = await waitForSelector(client, params.selector, 5000);
            if (box) {
                const x = Math.round(box.x + box.width / 2);
                const y = Math.round(box.y + box.height / 2);
                await client.Input.dispatchMouseEvent({ type: 'mouseMoved', x, y });
            }
        } else {
            const scrollX = params.x || 0;
            const scrollY = params.y || 0;
            await client.Runtime.evaluate({ expression: `window.scrollBy(${scrollX}, ${scrollY})` });
        }
        const { result } = await client.Runtime.evaluate({ expression: 'JSON.stringify({x: window.scrollX, y: window.scrollY})', returnByValue: true });
        return { scrolled: true, x: result.value ? JSON.parse(result.value).x : 0, y: result.value ? JSON.parse(result.value).y : 0 };
    } finally { await client.close(); }
};

handlers.selectOption = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        const expr = `(function() { const sel = document.querySelector(${JSON.stringify(params.selector)}); if (!sel) return false; sel.value = ${JSON.stringify(params.value)}; sel.dispatchEvent(new Event('change', {bubbles: true})); return true; })()`;
        const { result } = await client.Runtime.evaluate({ expression: expr, returnByValue: true });
        if (!result.value) throw new Error('Select element not found: ' + params.selector);
        return { selected: true, selector: params.selector, value: params.value };
    } finally { await client.close(); }
};

// ── DOM Inspection (Read-Only) ──

handlers.getText = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        const box = await waitForSelector(client, params.selector, params.timeoutMs || 15000);
        if (!box) throw new Error('Element not found: ' + params.selector);
        const expr = `(document.querySelector(${JSON.stringify(params.selector)}) || {}).textContent || ''`;
        const { result } = await client.Runtime.evaluate({ expression: expr, returnByValue: true });
        return { text: (result.value || '').trim(), selector: params.selector };
    } finally { await client.close(); }
};

handlers.getAttribute = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        const box = await waitForSelector(client, params.selector, params.timeoutMs || 15000);
        if (!box) throw new Error('Element not found: ' + params.selector);
        const expr = `(document.querySelector(${JSON.stringify(params.selector)}) || {}).getAttribute(${JSON.stringify(params.attributeName)})`;
        const { result } = await client.Runtime.evaluate({ expression: expr, returnByValue: true });
        return { value: result.value, selector: params.selector, attribute: params.attributeName };
    } finally { await client.close(); }
};

handlers.checkExists = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        const expr = `document.querySelectorAll(${JSON.stringify(params.selector)}).length`;
        const { result } = await client.Runtime.evaluate({ expression: expr, returnByValue: true });
        const count = result.value || 0;
        return { exists: count > 0, selector: params.selector, count: count };
    } finally { await client.close(); }
};

handlers.waitForSelector = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        const start = Date.now();
        const timeout = params.timeoutMs || 30000;
        const state = params.state || 'visible';
        while (Date.now() - start < timeout) {
            const expr = `(function() { const els = document.querySelectorAll(${JSON.stringify(params.selector)}); if (els.length === 0) return { found: false, visible: false }; const el = els[0]; const r = el.getBoundingClientRect(); return { found: true, visible: r.width > 0 && r.height > 0 }; })()`;
            const { result } = await client.Runtime.evaluate({ expression: expr, returnByValue: true });
            if (result.value && result.value.found) {
                if (state === 'attached' || (state === 'visible' && result.value.visible)) {
                    return { found: true, selector: params.selector, state: state };
                }
            }
            await new Promise(r => setTimeout(r, 200));
        }
        return { found: false, selector: params.selector, state: state };
    } finally { await client.close(); }
};

handlers.getViewportSize = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        const { result } = await client.Runtime.evaluate({ expression: 'JSON.stringify({width: window.innerWidth, height: window.innerHeight})', returnByValue: true });
        const val = result.value ? JSON.parse(result.value) : { width: 0, height: 0 };
        return { width: val.width, height: val.height };
    } finally { await client.close(); }
};

// ── Capture ──

handlers.screenshot = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        const opts = { format: 'png' };
        if (params.fullPage) opts.captureBeyondViewport = true;
        const { data } = await client.Page.captureScreenshot(opts);
        const buffer = Buffer.from(data, 'base64');
        const savePath = params.savePath || params.filePath;
        if (savePath) {
            const dir = path.dirname(savePath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(savePath, buffer);
        }
        return { path: savePath || '', sizeBytes: buffer.length, width: 0, height: 0 };
    } finally { await client.close(); }
};

handlers.getConsoleEvents = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        // Enable console API
        await client.Runtime.enable();
        const events = [];
        const maxCount = params.maxCount || 100;
        client.Runtime.consoleAPICalled((entry) => {
            if (events.length < maxCount) {
                events.push({ type: entry.type, text: (entry.args || []).map(a => a.value || a.description || '').join(' ') });
            }
        });
        // Wait briefly to collect events
        await new Promise(r => setTimeout(r, 500));
        return { events: events };
    } finally { await client.close(); }
};

// ── Secret-Aware (Tier 1) ──

handlers.fillSecret = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        const box = await waitForSelector(client, params.selector, params.timeoutMs || 15000);
        if (!box) throw new Error('Element not found: ' + params.selector);
        const x = Math.round(box.x + box.width / 2);
        const y = Math.round(box.y + box.height / 2);
        await client.Input.dispatchMouseEvent({ type: 'mouseMoved', x, y });
        await client.Input.dispatchMouseEvent({ type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
        await client.Input.dispatchMouseEvent({ type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
        // Clear
        await client.Input.dispatchKeyEvent({ type: 'keyDown', key: 'a', modifiers: 2 });
        await client.Input.dispatchKeyEvent({ type: 'keyDown', key: 'Backspace' });
        await client.Input.dispatchKeyEvent({ type: 'keyUp', key: 'Backspace' });
        // Type secret using trusted input
        await client.Input.insertText({ text: params.secretValue });
        return { filled: true, selector: params.selector };
    } finally { await client.close(); }
};

handlers.fillPasswordSecret = async (params) => {
    const selector = params.selector || 'input[type=password]';
    return handlers.fillSecret({ ...params, selector });
};

// ── Tier 2: JavaScript Execution ──

handlers.runScript = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        const { result, exceptionDetails } = await client.Runtime.evaluate({
            expression: params.script,
            returnByValue: true,
            awaitPromise: true,
            timeout: params.timeoutMs || 15000
        });
        if (exceptionDetails) {
            return { result: exceptionDetails.text || 'Exception', type: 'error' };
        }
        return { result: result.value, type: result.type };
    } finally { await client.close(); }
};

handlers.runMutationScript = async (params) => {
    return handlers.runScript(params);
};

handlers.runAutomation = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        // Enable all domains for automation
        await client.Page.enable();
        await client.Runtime.enable();
        await client.DOM.enable();
        await client.Input.enable();
        try { await client.Network.enable(); } catch(e) {}
        try { await client.Emulation.enable(); } catch(e) {}
        
        // The script gets access to page, runtime, dom, input, network, emulation
        const fn = new Function('page', 'runtime', 'dom', 'input', 'network', 'emulation', 'args', params.script);
        const result = await fn(client.Page, client.Runtime, client.DOM, client.Input, client.Network, client.Emulation, JSON.parse(params.argsJson || '{}'));
        return { result: result };
    } finally { await client.close(); }
};

// ── Tier 2: File Upload ──

handlers.uploadFile = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        await client.DOM.enable();
        const { root } = await client.DOM.getDocument();
        const { nodeId } = await client.DOM.querySelector({ nodeId: root.nodeId, selector: params.selector });
        if (!nodeId) throw new Error('File input not found: ' + params.selector);
        await client.DOM.setFileInputFiles({ nodeId, files: [params.filePath] });
        const fileName = path.basename(params.filePath);
        return { uploaded: true, selector: params.selector, fileName: fileName };
    } finally { await client.close(); }
};

// ── Tier 2: Cookie Access ──

handlers.getCookies = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        await client.Network.enable();
        const { cookies } = await client.Network.getAllCookies();
        // Redact values — return names, domains, metadata only
        const redacted = cookies.map(c => ({
            name: c.name,
            domain: c.domain,
            path: c.path,
            expires: c.expires,
            secure: c.secure,
            httpOnly: c.httpOnly,
            sameSite: c.sameSite
        }));
        return { cookies: redacted, count: redacted.length };
    } finally { await client.close(); }
};

handlers.setCookie = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        await client.Network.enable();
        await client.Network.setCookie({
            name: params.name,
            value: params.value,
            domain: params.domain,
            path: params.path || '/',
            secure: params.secure || false,
            httpOnly: params.httpOnly || false
        });
        return { status: 'set', name: params.name, domain: params.domain };
    } finally { await client.close(); }
};

// ── Tier 2: Network Monitoring ──

handlers.getNetworkRequests = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        await client.Network.enable();
        const requests = [];
        const maxCount = params.maxCount || 100;
        client.Network.responseReceived((entry) => {
            if (requests.length < maxCount) {
                requests.push({
                    url: entry.response.url,
                    method: entry.response.method,
                    status: entry.response.status,
                    mimeType: entry.response.mimeType,
                    type: entry.type
                });
            }
        });
        // Wait briefly to collect
        await new Promise(r => setTimeout(r, 1000));
        return { requests: requests };
    } finally { await client.close(); }
};

// ── Tier 2: Tab Management ──

handlers.listTabs = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const tabs = await getTabList(session.port);
    const filtered = tabs.filter(t => t.type === 'page').map(t => ({
        tabId: t.id,
        title: t.title,
        url: t.url,
        type: t.type
    }));
    return { tabs: filtered };
};

handlers.createTab = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const { client: browserClient } = await connectToBrowser(session.port);
    try {
        const { targetId } = await browserClient.Target.createTarget({ url: params.url || 'about:blank' });
        // Track as owned tab
        const s = getSession(params.cdpSessionId);
        if (s) {
            s.ownedTabIds = s.ownedTabIds || [];
            s.ownedTabIds.push(targetId);
            updateSession(params.cdpSessionId, { ownedTabIds: s.ownedTabIds });
        }
        return { tabId: targetId, url: params.url || 'about:blank' };
    } finally { await browserClient.close(); }
};

handlers.closeTab = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const tabId = params.tabId;
    const force = params.force || false;
    // Ownership check
    const ownedTabs = session.ownedTabIds || [];
    if (!ownedTabs.includes(tabId) && !force) {
        throw new Error('Tab not owned by this skill. Pass force=true to close non-owned tabs.');
    }
    const { client: browserClient } = await connectToBrowser(session.port);
    try {
        await browserClient.Target.closeTarget({ targetId: tabId });
        // Remove from owned tabs
        const s = getSession(params.cdpSessionId);
        if (s && s.ownedTabIds) {
            s.ownedTabIds = s.ownedTabIds.filter(id => id !== tabId);
            updateSession(params.cdpSessionId, { ownedTabIds: s.ownedTabIds });
        }
        return { status: 'closed', tabId: tabId };
    } finally { await browserClient.close(); }
};

// ── Tier 2: Navigation — Cache Bypass ──

handlers.reload = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        await client.Page.reload({ ignoreCache: params.ignoreCache || false });
        await new Promise((resolve) => {
            const timeout = setTimeout(resolve, 10000);
            client.Page.loadEventFired(() => { clearTimeout(timeout); resolve(); });
        });
        return { status: 'reloaded' };
    } finally { await client.close(); }
};

// ── Tier 2: Page Content ──

handlers.getSelectorHtml = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        const box = await waitForSelector(client, params.selector, params.timeoutMs || 15000);
        if (!box) throw new Error('Element not found: ' + params.selector);
        const expr = `(document.querySelector(${JSON.stringify(params.selector)}) || {}).outerHTML || ''`;
        const { result } = await client.Runtime.evaluate({ expression: expr, returnByValue: true });
        return { html: result.value || '', selector: params.selector };
    } finally { await client.close(); }
};

handlers.getPageHtml = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        const expr = 'document.documentElement.outerHTML';
        const { result } = await client.Runtime.evaluate({ expression: expr, returnByValue: true });
        return { html: result.value || '' };
    } finally { await client.close(); }
};

// ── Tier 2: Browser Fingerprint Modification ──

async function enableNetworkIfNeeded(client) {
    try { await client.Network.enable(); } catch(e) {}
}

async function enableEmulationIfNeeded(client) {
    try { await client.Emulation.enable(); } catch(e) {}
}

handlers.setUserAgent = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        await enableNetworkIfNeeded(client);
        await client.Network.setUserAgentOverride({ userAgent: params.userAgent });
        // Track override
        const overrides = session.activeOverrides || {};
        overrides.userAgent = params.userAgent;
        updateSession(params.cdpSessionId, { activeOverrides: overrides });
        return { status: 'set', override: 'userAgent', value: params.userAgent };
    } finally { await client.close(); }
};

handlers.setDeviceMetrics = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        await enableEmulationIfNeeded(client);
        await client.Emulation.setDeviceMetricsOverride({
            width: params.width,
            height: params.height,
            deviceScaleFactor: params.deviceScaleFactor || 1,
            mobile: params.mobile || false
        });
        const overrides = session.activeOverrides || {};
        overrides.deviceMetrics = { width: params.width, height: params.height, deviceScaleFactor: params.deviceScaleFactor || 1, mobile: params.mobile || false };
        updateSession(params.cdpSessionId, { activeOverrides: overrides });
        return { status: 'set', override: 'deviceMetrics' };
    } finally { await client.close(); }
};

handlers.setGeolocation = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        await enableEmulationIfNeeded(client);
        const lat = parseFloat(params.latitude);
        const lng = parseFloat(params.longitude);
        await client.Emulation.setGeolocationOverride({
            latitude: lat,
            longitude: lng,
            accuracy: params.accuracy || 100
        });
        const overrides = session.activeOverrides || {};
        overrides.geolocation = { latitude: lat, longitude: lng, accuracy: params.accuracy || 100 };
        updateSession(params.cdpSessionId, { activeOverrides: overrides });
        return { status: 'set', override: 'geolocation' };
    } finally { await client.close(); }
};

handlers.setTimezone = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        await enableEmulationIfNeeded(client);
        await client.Emulation.setTimezoneOverride({ timezoneId: params.timezoneId });
        const overrides = session.activeOverrides || {};
        overrides.timezone = params.timezoneId;
        updateSession(params.cdpSessionId, { activeOverrides: overrides });
        return { status: 'set', override: 'timezone', value: params.timezoneId };
    } finally { await client.close(); }
};

handlers.setExtraHeaders = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        await enableNetworkIfNeeded(client);
        const headers = JSON.parse(params.headersJson || '{}');
        await client.Network.setExtraHTTPHeaders({ headers });
        const overrides = session.activeOverrides || {};
        overrides.extraHeaders = headers;
        updateSession(params.cdpSessionId, { activeOverrides: overrides });
        return { status: 'set', override: 'extraHeaders' };
    } finally { await client.close(); }
};

handlers.injectScriptOnLoad = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        const { identifier } = await client.Page.addScriptToEvaluateOnNewDocument({ source: params.script });
        const overrides = session.activeOverrides || {};
        if (!overrides.injectedScriptIds) overrides.injectedScriptIds = [];
        overrides.injectedScriptIds.push(identifier);
        updateSession(params.cdpSessionId, { activeOverrides: overrides });
        return { status: 'set', override: 'injectedScript', scriptId: identifier };
    } finally { await client.close(); }
};

handlers.setTouchEmulation = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        await enableEmulationIfNeeded(client);
        await client.Emulation.setTouchEmulationEnabled({ enabled: params.enabled !== false });
        const overrides = session.activeOverrides || {};
        overrides.touchEmulation = params.enabled !== false;
        updateSession(params.cdpSessionId, { activeOverrides: overrides });
        return { status: 'set', override: 'touchEmulation', enabled: params.enabled !== false };
    } finally { await client.close(); }
};

handlers.setBypassCsp = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        await client.Page.setBypassCSP({ enabled: params.enabled !== false });
        const overrides = session.activeOverrides || {};
        overrides.bypassCsp = params.enabled !== false;
        updateSession(params.cdpSessionId, { activeOverrides: overrides });
        return { status: 'set', override: 'bypassCsp', enabled: params.enabled !== false };
    } finally { await client.close(); }
};

handlers.setCacheDisabled = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        await enableNetworkIfNeeded(client);
        await client.Network.setCacheDisabled({ cacheDisabled: params.disabled !== false });
        const overrides = session.activeOverrides || {};
        overrides.cacheDisabled = params.disabled !== false;
        updateSession(params.cdpSessionId, { activeOverrides: overrides });
        return { status: 'set', override: 'cacheDisabled', disabled: params.disabled !== false };
    } finally { await client.close(); }
};

// ── Tier 2: Override Reset ──

async function resetOverrides(client, session, cdpSessionId) {
    const overrides = session.activeOverrides || {};
    const cleared = [];
    const previousValues = {};
    
    if (overrides.userAgent) {
        previousValues.userAgent = overrides.userAgent;
        await client.Network.setUserAgentOverride({ userAgent: '' });
        cleared.push('userAgent');
    }
    if (overrides.deviceMetrics) {
        previousValues.deviceMetrics = overrides.deviceMetrics;
        await client.Emulation.clearDeviceMetricsOverride();
        cleared.push('deviceMetrics');
    }
    if (overrides.geolocation) {
        previousValues.geolocation = overrides.geolocation;
        await client.Emulation.clearGeolocationOverride();
        cleared.push('geolocation');
    }
    if (overrides.timezone) {
        previousValues.timezone = overrides.timezone;
        await client.Emulation.setTimezoneOverride({ timezoneId: '' });
        cleared.push('timezone');
    }
    if (overrides.extraHeaders) {
        previousValues.extraHeaders = overrides.extraHeaders;
        await client.Network.setExtraHTTPHeaders({ headers: {} });
        cleared.push('extraHeaders');
    }
    if (overrides.injectedScriptIds && overrides.injectedScriptIds.length > 0) {
        previousValues.injectedScriptIds = overrides.injectedScriptIds;
        for (const scriptId of overrides.injectedScriptIds) {
            await client.Page.removeScriptToEvaluateOnNewDocument({ identifier: scriptId });
        }
        cleared.push('injectedScripts');
    }
    if (overrides.touchEmulation !== undefined) {
        previousValues.touchEmulation = overrides.touchEmulation;
        await client.Emulation.setTouchEmulationEnabled({ enabled: false });
        cleared.push('touchEmulation');
    }
    if (overrides.bypassCsp !== undefined) {
        previousValues.bypassCsp = overrides.bypassCsp;
        await client.Page.setBypassCSP({ enabled: false });
        cleared.push('bypassCsp');
    }
    if (overrides.cacheDisabled !== undefined) {
        previousValues.cacheDisabled = overrides.cacheDisabled;
        await client.Network.setCacheDisabled({ cacheDisabled: false });
        cleared.push('cacheDisabled');
    }
    
    // Clear override state - use the cdpSessionId passed in
    if (cdpSessionId) {
        updateSession(cdpSessionId, { activeOverrides: {} });
    }
    
    return { cleared, previousValues };
}

handlers.resetOverrides = async (params) => {
    const session = getSession(params.cdpSessionId);
    if (!session) throw new Error('Session not found');
    const client = await connectToTab(session.port, session.targetId);
    try {
        await enableNetworkIfNeeded(client);
        await enableEmulationIfNeeded(client);
        const result = await resetOverrides(client, session, params.cdpSessionId);
        return result;
    } finally { await client.close(); }
};

// ── Tier 2: Chrome Lifecycle ──

handlers.launchChrome = async (params) => {
    const { spawn } = require('child_process');
    const port = params.port || 9222;
    const profileDir = params.profileDir || (require('os').homedir() + '/.buffaly/chrome-debug-profile');
    
    // Ensure profile dir exists
    if (!fs.existsSync(profileDir)) {
        fs.mkdirSync(profileDir, { recursive: true });
    }
    
    const chromeCandidates = process.platform === 'win32'
        ? [
            path.join(process.env.PROGRAMFILES || '', 'Google/Chrome/Application/chrome.exe'),
            path.join(process.env['PROGRAMFILES(X86)'] || '', 'Google/Chrome/Application/chrome.exe'),
            path.join(process.env.LOCALAPPDATA || '', 'Google/Chrome/Application/chrome.exe')
        ]
        : process.platform === 'darwin'
            ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']
            : ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
    const chromePath = chromeCandidates.find(candidate => candidate && fs.existsSync(candidate));
    if (!chromePath) {
        throw new Error(`Chrome executable not found for platform ${process.platform}`);
    }
    const args = [
        `--remote-debugging-port=${port}`,
        `--user-data-dir=${profileDir}`,
        '--no-first-run',
        '--no-default-browser-check'
    ];
    
    const child = spawn(chromePath, args, { detached: true, stdio: 'ignore' });
    child.unref();
    
    // Wait for CDP endpoint
    let attempts = 0;
    while (attempts < 40) {
        try {
            const info = await getBrowserInfo(port);
            return { pid: child.pid, port, profileDir, browser: info.Browser };
        } catch (e) {
            await new Promise(r => setTimeout(r, 500));
            attempts++;
        }
    }
    throw new Error('Chrome did not start with CDP within 20 seconds');
};

handlers.checkChrome = async (params) => {
    const port = params.port || 9222;
    try {
        const info = await getBrowserInfo(port);
        return { active: true, browser: info.Browser, version: info['Protocol-Version'] || '', port };
    } catch (e) {
        return { active: false, port };
    }
};

handlers.closeChrome = async (params) => {
    const port = params.port || 9222;
    const { exec } = require('child_process');
    return new Promise((resolve) => {
        exec(`lsof -ti :${port} | xargs kill`, (error) => {
            if (error) {
                resolve({ status: 'no process found on port ' + port });
            } else {
                resolve({ status: 'killed', port });
            }
        });
    });
};

// ─── Main Entry Point ───

async function main() {
    // Map short action names (from ProtoScript) to handler names
    const actionAliases = {
        'open': 'openSession',
        'close': 'closeSession',
        'list_sessions': 'listSessions',
        'get_url': 'getUrl',
        'get_title': 'getTitle',
        'go_back': 'goBack',
        'go_forward': 'goForward',
        'press_key': 'pressKey',
        'press_selector_key': 'pressSelectorKey',
        'select_option': 'selectOption',
        'get_text': 'getText',
        'get_attribute': 'getAttribute',
        'check_exists': 'checkExists',
        'wait_for_selector': 'waitForSelector',
        'get_viewport': 'getViewportSize',
        'console_events': 'getConsoleEvents',
        'fill_secret': 'fillSecret',
        'fill_password_secret': 'fillPasswordSecret',
        'run_script': 'runScript',
        'run_mutation': 'runMutationScript',
        'run_automation': 'runAutomation',
        'upload_file': 'uploadFile',
        'get_cookies': 'getCookies',
        'set_cookie': 'setCookie',
        'get_network_requests': 'getNetworkRequests',
        'list_tabs': 'listTabs',
        'create_tab': 'createTab',
        'close_tab': 'closeTab',
        'get_selector_html': 'getSelectorHtml',
        'get_page_html': 'getPageHtml',
        'set_user_agent': 'setUserAgent',
        'set_device_metrics': 'setDeviceMetrics',
        'set_geolocation': 'setGeolocation',
        'set_timezone': 'setTimezone',
        'set_extra_headers': 'setExtraHeaders',
        'inject_script_on_load': 'injectScriptOnLoad',
        'set_touch_emulation': 'setTouchEmulation',
        'set_bypass_csp': 'setBypassCsp',
        'set_cache_disabled': 'setCacheDisabled',
        'reset_overrides': 'resetOverrides',
        'launch_chrome': 'launchChrome',
        'check_chrome': 'checkChrome',
        'close_chrome': 'closeChrome'
    };
    
    const commandJson = process.argv[2];
    if (!commandJson) {
        console.log(JSON.stringify({ ok: false, error: 'No command provided' }));
        process.exit(1);
    }
    
    let command;
    try {
        // Check if argv[2] is a file path (PowerShell writes JSON to temp file)
        if (fs.existsSync(commandJson) && !commandJson.startsWith('{')) {
            command = JSON.parse(fs.readFileSync(commandJson, 'utf8'));
        } else {
            command = JSON.parse(commandJson);
        }
    } catch (e) {
        console.log(JSON.stringify({ ok: false, error: 'Invalid JSON command: ' + e.message }));
        process.exit(1);
    }
    
    const actionName = actionAliases[command.action] || command.action;
    const handler = handlers[actionName];
    if (!handler) {
        console.log(JSON.stringify({ ok: false, error: 'Unknown action: ' + command.action }));
        process.exit(1);
    }
    
    try {
        // Pass the entire command object as params (ProtoScript sends params flat)
        const data = await handler(command);
        console.log(JSON.stringify({ ok: true, data }));
    } catch (e) {
        console.log(JSON.stringify({ ok: false, error: e.message }));
        process.exit(1);
    }
}

main().catch(e => {
    console.log(JSON.stringify({ ok: false, error: 'Fatal: ' + e.message }));
    process.exit(1);
});
