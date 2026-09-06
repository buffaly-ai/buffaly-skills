export type InjectedDomOperationName =
  | 'get_dom_snapshot'
  | 'find_elements'
  | 'click'
  | 'type_text'
  | 'press_key'
  | 'hover'
  | 'select_option'
  | 'get_attribute'
  | 'check_exists'
  | 'get_viewport';

export interface InjectedDomOperationRequest {
  operation: InjectedDomOperationName;
  args: Record<string, unknown>;
  expectedDocumentToken?: string;
}

export type InjectedDomOperationResult =
  | { ok: true; data: unknown; documentToken: string }
  | { ok: false; error: string; code: string; documentToken?: string };

interface RegisteredElement {
  token: string;
  refId: string;
  element: Element;
}

interface RegistryState {
  documentToken: string;
  nextId: number;
  byRefId: Map<string, RegisteredElement>;
  byElement: WeakMap<Element, string>;
}

type SearchRoot = Document | ShadowRoot;

const GLOBAL_KEY = '__buffalyInjectedDomOpsRegistry_v1__';
const REF_PREFIX = 'buffaly-dom-ref:v1:';

export function injectedDomOperation(request: InjectedDomOperationRequest): InjectedDomOperationResult {
  interface RegisteredElement {
    token: string;
    refId: string;
    element: Element;
  }

  interface RegistryState {
    documentToken: string;
    nextId: number;
    byRefId: Map<string, RegisteredElement>;
    byElement: WeakMap<Element, string>;
  }

  type SearchRoot = Document | ShadowRoot;

  const GLOBAL_KEY = '__buffalyInjectedDomOpsRegistry_v1__';
  const REF_PREFIX = 'buffaly-dom-ref:v1:';

  function getRegistry(): RegistryState {
    const global = globalThis as unknown as Record<string, RegistryState | undefined>;
    let state = global[GLOBAL_KEY];
    if (!state) {
      state = { documentToken: makeToken(), nextId: 1, byRefId: new Map<string, RegisteredElement>(), byElement: new WeakMap<Element, string>() };
      global[GLOBAL_KEY] = state;
    }
    return state;
  }

  function makeToken(): string {
    const cryptoObj = globalThis.crypto;
    if (cryptoObj && typeof cryptoObj.randomUUID === 'function') return cryptoObj.randomUUID();
    const random = cryptoObj?.getRandomValues ? Array.from(cryptoObj.getRandomValues(new Uint32Array(4)), (v) => v.toString(36)).join('') : Math.random().toString(36).slice(2);
    return `${Date.now().toString(36)}-${random}`;
  }

  function ok(registry: RegistryState, data: unknown): InjectedDomOperationResult {
    return { ok: true, data, documentToken: registry.documentToken };
  }

  function fail(code: string, error: string, documentToken?: string): InjectedDomOperationResult {
    return documentToken ? { ok: false, error, code, documentToken } : { ok: false, error, code };
  }

  function registerElement(registry: RegistryState, element: Element): string {
    const existing = registry.byElement.get(element);
    if (existing) return encodeRef(registry.documentToken, existing);
    const refId = String(registry.nextId++);
    registry.byElement.set(element, refId);
    registry.byRefId.set(refId, { token: registry.documentToken, refId, element });
    return encodeRef(registry.documentToken, refId);
  }

  function encodeRef(documentToken: string, refId: string): string {
    return `${REF_PREFIX}${encodeURIComponent(documentToken)}:${encodeURIComponent(refId)}`;
  }

  function decodeRef(ref: string): { documentToken: string; refId: string } | null {
    if (!ref.startsWith(REF_PREFIX)) return null;
    const rest = ref.slice(REF_PREFIX.length);
    const split = rest.indexOf(':');
    if (split <= 0 || split === rest.length - 1) return null;
    return { documentToken: decodeURIComponent(rest.slice(0, split)), refId: decodeURIComponent(rest.slice(split + 1)) };
  }
  function resolveElement(registry: RegistryState, args: Record<string, unknown>, required = true): { ok: true; element: Element; selector?: string; elementId?: string } | { ok: false; error: string; code: string } {
    const elementId = stringArg(args, 'elementId');
    if (elementId) {
      const decoded = decodeRef(elementId);
      if (!decoded) return { ok: false, error: 'elementId is not a Buffaly DOM reference from this extension.', code: 'INVALID_ELEMENT_REF' };
      if (decoded.documentToken !== registry.documentToken) return { ok: false, error: 'elementId belongs to a different document scope.', code: 'DOCUMENT_SCOPE_MISMATCH' };
      const entry = registry.byRefId.get(decoded.refId);
      if (!entry || entry.element.ownerDocument !== document) return { ok: false, error: 'elementId is no longer registered in this document.', code: 'STALE_ELEMENT_REF' };
      if (!entry.element.isConnected) return { ok: false, error: 'elementId refers to an element that is no longer connected.', code: 'STALE_ELEMENT_REF' };
      return { ok: true, element: entry.element, elementId };
    }

    const selector = stringArg(args, 'selector');
    if (!selector) return required ? { ok: false, error: 'Operation requires selector or elementId.', code: 'TARGET_REQUIRED' } : { ok: false, error: 'No target selector or elementId provided.', code: 'TARGET_REQUIRED' };
    const matches = querySelectorAllDeep(selector);
    if (matches.kind === 'invalid') return { ok: false, error: matches.error, code: 'INVALID_SELECTOR' };
    if (matches.elements.length === 0) return { ok: false, error: `No element matched selector: ${selector}`, code: 'ELEMENT_NOT_FOUND' };
    if (matches.elements.length > 1) return { ok: false, error: `Selector matched ${matches.elements.length} elements and is ambiguous: ${selector}`, code: 'MULTIPLE_ELEMENTS' };
    const element = matches.elements[0];
    if (!element.isConnected) return { ok: false, error: 'Matched element is no longer connected.', code: 'STALE_ELEMENT_REF' };
    return { ok: true, element, selector };
  }

  function querySelectorAllDeep(selector: string): { kind: 'ok'; elements: Element[] } | { kind: 'invalid'; error: string } {
    const roots: SearchRoot[] = [document];
    const results: Element[] = [];
    const seen = new Set<Element>();
    for (let i = 0; i < roots.length; i++) {
      const root = roots[i];
      let matched: Element[];
      try { matched = Array.from(root.querySelectorAll(selector)); } catch (error) { return { kind: 'invalid', error: error instanceof Error ? error.message : String(error) }; }
      for (const el of matched) if (!seen.has(el)) { seen.add(el); results.push(el); }
      for (const el of Array.from(root.querySelectorAll('*'))) {
        const shadow = el.shadowRoot;
        if (shadow && shadow.mode === 'open') roots.push(shadow);
      }
    }
    return { kind: 'ok', elements: results };
  }

  function interactiveElements(): Element[] {
    const selector = 'a, button, input, select, textarea, [role="button"], [role="link"], [role="checkbox"], [role="tab"], [tabindex], [onclick], [contenteditable=""], [contenteditable="true"]';
    const matches = querySelectorAllDeep(selector);
    return matches.kind === 'ok' ? matches.elements : [];
  }

  function getDomSnapshot(registry: RegistryState, args: Record<string, unknown>): unknown {
    const maxNodes = numberArg(args, 'maxNodes', 200);
    const elements = interactiveElements();
    return { url: window.location.href, title: document.title, documentToken: registry.documentToken, elements: elements.slice(0, maxNodes).map((el) => describeElement(registry, el)), truncated: elements.length > maxNodes };
  }

  function findElements(registry: RegistryState, args: Record<string, unknown>): InjectedDomOperationResult {
    const query = stringArg(args, 'query');
    if (!query) return fail('QUERY_REQUIRED', 'find_elements requires query.', registry.documentToken);
    const maxResults = numberArg(args, 'maxResults', 50);
    const matches = querySelectorAllDeep(query);
    if (matches.kind === 'invalid') return fail('INVALID_SELECTOR', matches.error, registry.documentToken);
    return ok(registry, { elements: matches.elements.slice(0, maxResults).map((el) => describeElement(registry, el)), query, documentToken: registry.documentToken, truncated: matches.elements.length > maxResults });
  }

  function describeElement(registry: RegistryState, el: Element): unknown {
    const rect = el.getBoundingClientRect();
    const ref = registerElement(registry, el);
    return { id: ref, elementId: ref, tag: el.tagName.toLowerCase(), role: el.getAttribute('role') || '', name: el.getAttribute('aria-label') || (el as HTMLInputElement).name || '', text: (el.textContent || '').trim().slice(0, 200), selector: uniqueSelector(el), bounds: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }, visible: rect.width > 0 && rect.height > 0, disabled: isDisabled(el), readOnly: isReadOnly(el), shadowRoot: rootLabel(el.getRootNode()) };
  }
  function uniqueSelector(el: Element): string {
    const root = el.getRootNode() as SearchRoot;
    const tag = el.tagName.toLowerCase();
    const id = el.getAttribute('id');
    if (id) {
      const escapedId = `#${cssEscape(id)}`;
      if (isUniqueInRoot(root, escapedId, el)) return escapedId;
      const exactId = `${tag}[id="${cssStringEscape(id)}"]`;
      if (isUniqueInRoot(root, exactId, el)) return exactId;
    }
    for (const attr of ['name', 'aria-label', 'role', 'type', 'value']) {
      const value = el.getAttribute(attr);
      if (!value) continue;
      const candidate = `${tag}[${attr}="${cssStringEscape(value)}"]`;
      if (isUniqueInRoot(root, candidate, el)) return candidate;
    }
    const parts: string[] = [];
    let current: Element | null = el;
    while (current) {
      const currentTag = current.tagName.toLowerCase();
      const parent: Element | null = current.parentElement;
      if (!parent) { parts.unshift(currentTag); break; }
      const currentTagName = current.tagName;
      const siblings = Array.from(parent.children).filter((s: Element) => s.tagName === currentTagName);
      parts.unshift(`${currentTag}:nth-of-type(${siblings.indexOf(current) + 1})`);
      const candidate = parts.join(' > ');
      if (isUniqueInRoot(root, candidate, el)) return candidate;
      current = parent;
    }
    return parts.join(' > ') || tag;
  }

  function isUniqueInRoot(root: SearchRoot, selector: string, el: Element): boolean {
    try {
      const matches = Array.from(root.querySelectorAll(selector));
      return matches.length === 1 && matches[0] === el;
    } catch { return false; }
  }

  function cssEscape(value: string): string {
    const cssObj = (globalThis as unknown as { CSS?: { escape?: (value: string) => string } }).CSS;
    if (cssObj?.escape) return cssObj.escape(value);
    return value.replace(/[^a-zA-Z0-9_-]/g, (ch) => `\\${ch.codePointAt(0)!.toString(16)} `);
  }

  function cssStringEscape(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\a ');
  }

  function rootLabel(root: Node): 'document' | 'open-shadow' | 'other' {
    if (root === document) return 'document';
    if (root instanceof ShadowRoot && root.mode === 'open') return 'open-shadow';
    return 'other';
  }

  function clickElement(registry: RegistryState, args: Record<string, unknown>): InjectedDomOperationResult {
    const resolved = resolveElement(registry, args);
    if (!resolved.ok) return fail(resolved.code, resolved.error, registry.documentToken);
    const el = resolved.element;
    const interactable = validateInteractable(el, 'click');
    if (!interactable.ok) return fail(interactable.code, interactable.error, registry.documentToken);
    const obstruction = obstructionAtCenter(el);
    if (obstruction) return fail('ELEMENT_OBSTRUCTED', obstruction, registry.documentToken);
    (el as HTMLElement).click();
    return ok(registry, { clicked: true, executed: true, verified: false, verification: 'DOM HTMLElement.click() dispatched; page task success is unverified.', selector: resolved.selector, elementId: resolved.elementId });
  }

  function hoverElement(registry: RegistryState, args: Record<string, unknown>): InjectedDomOperationResult {
    const resolved = resolveElement(registry, args);
    if (!resolved.ok) return fail(resolved.code, resolved.error, registry.documentToken);
    const el = resolved.element;
    const interactable = validateInteractable(el, 'hover');
    if (!interactable.ok) return fail(interactable.code, interactable.error, registry.documentToken);
    (el as HTMLElement).scrollIntoView({ block: 'center', inline: 'center' });
    const rect = el.getBoundingClientRect();
    const eventInit = { bubbles: true, cancelable: true, clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 };
    el.dispatchEvent(new MouseEvent('mousemove', eventInit));
    el.dispatchEvent(new MouseEvent('mouseover', eventInit));
    return ok(registry, { hovered: true, dispatched: true, verified: false, selector: resolved.selector, elementId: resolved.elementId });
  }
  function typeText(registry: RegistryState, args: Record<string, unknown>): InjectedDomOperationResult {
    const text = stringArg(args, 'text');
    if (text === undefined) return fail('TEXT_REQUIRED', 'type_text requires text.', registry.documentToken);
    const resolved = resolveElement(registry, args);
    if (!resolved.ok) return fail(resolved.code, resolved.error, registry.documentToken);
    const el = resolved.element;
    const mode = stringArg(args, 'mode') ?? (boolArg(args, 'clear', true) ? 'replace' : 'append');
    if (!['replace', 'append', 'clear'].includes(mode)) return fail('UNSUPPORTED_TYPE_MODE', `Unsupported type_text mode: ${mode}`, registry.documentToken);
    if (isDisabled(el)) return fail('ELEMENT_DISABLED', 'Target element is disabled.', registry.documentToken);
    if (isReadOnly(el)) return fail('ELEMENT_READONLY', 'Target element is read-only.', registry.documentToken);

    const replacement = mode === 'clear' ? '' : text;
    if (isTextInput(el)) {
      const input = el;
      input.focus();
      const prior = input.value;
      const next = mode === 'append' ? prior + replacement : replacement;
      setNativeValue(input, next);
      input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: mode === 'append' ? 'insertText' : 'insertReplacementText', data: replacement }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      if (input.value !== next) return fail('READBACK_MISMATCH', `Input readback mismatch after type_text. Expected ${JSON.stringify(next)} but found ${JSON.stringify(input.value)}.`, registry.documentToken);
      return ok(registry, { typed: true, mode, length: replacement.length, valueLength: input.value.length, selector: resolved.selector, elementId: resolved.elementId });
    }

    if (isContentEditable(el)) {
      const target = el as HTMLElement;
      target.focus();
      const prior = target.textContent ?? '';
      const next = mode === 'append' ? prior + replacement : replacement;
      target.textContent = next;
      target.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: mode === 'append' ? 'insertText' : 'insertReplacementText', data: replacement }));
      target.dispatchEvent(new Event('change', { bubbles: true }));
      if ((target.textContent ?? '') !== next) return fail('READBACK_MISMATCH', 'Contenteditable readback mismatch after type_text.', registry.documentToken);
      return ok(registry, { typed: true, mode, length: replacement.length, valueLength: next.length, selector: resolved.selector, elementId: resolved.elementId });
    }

    return fail('UNSUPPORTED_TARGET', `type_text does not support <${el.tagName.toLowerCase()}> targets.`, registry.documentToken);
  }

  function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement, value: string): void {
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
    if (!descriptor?.set) throw new Error('Native value setter is unavailable for this target.');
    descriptor.set.call(el, value);
  }

  function pressKey(registry: RegistryState, args: Record<string, unknown>): InjectedDomOperationResult {
    const key = stringArg(args, 'key');
    if (!key) return fail('KEY_REQUIRED', 'press_key requires key.', registry.documentToken);
    const target = resolveElement(registry, args, false);
    let eventTarget: Element | Document = document.activeElement || document;
    let selector: string | undefined;
    let elementId: string | undefined;
    if (target.ok) {
      eventTarget = target.element;
      selector = target.selector;
      elementId = target.elementId;
      (target.element as HTMLElement).focus?.();
    } else if (stringArg(args, 'selector') || stringArg(args, 'elementId')) {
      return fail(target.code, target.error, registry.documentToken);
    }
    const modifiers = modifiersFromArgs(args);
    const eventInit: KeyboardEventInit = { key, bubbles: true, cancelable: true, ...modifiers };
    eventTarget.dispatchEvent(new KeyboardEvent('keydown', eventInit));
    eventTarget.dispatchEvent(new KeyboardEvent('keyup', eventInit));
    return ok(registry, { pressed: true, key, dispatched: true, synthetic: true, verifiedNativeAction: false, selector, elementId, modifiers });
  }

  function selectOption(registry: RegistryState, args: Record<string, unknown>): InjectedDomOperationResult {
    const value = stringArg(args, 'value');
    if (value === undefined) return fail('VALUE_REQUIRED', 'select_option requires value.', registry.documentToken);
    const resolved = resolveElement(registry, args);
    if (!resolved.ok) return fail(resolved.code, resolved.error, registry.documentToken);
    const el = resolved.element;
    if (!(el instanceof HTMLSelectElement)) return fail('UNSUPPORTED_TARGET', `select_option requires a <select> target, got <${el.tagName.toLowerCase()}>.`, registry.documentToken);
    if (el.disabled) return fail('ELEMENT_DISABLED', 'Target select is disabled.', registry.documentToken);
    const option = Array.from(el.options).find((o) => o.value === value);
    if (!option) return fail('OPTION_NOT_FOUND', `No option with value ${JSON.stringify(value)} exists in the target select.`, registry.documentToken);
    el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    if (el.value !== value) return fail('READBACK_MISMATCH', `Select readback mismatch after select_option. Expected ${JSON.stringify(value)} but found ${JSON.stringify(el.value)}.`, registry.documentToken);
    return ok(registry, { selected: true, selector: resolved.selector, elementId: resolved.elementId, value });
  }
  function getAttribute(registry: RegistryState, args: Record<string, unknown>): InjectedDomOperationResult {
    const attributeName = stringArg(args, 'attributeName');
    if (!attributeName) return fail('ATTRIBUTE_REQUIRED', 'get_attribute requires attributeName.', registry.documentToken);
    const resolved = resolveElement(registry, args);
    if (!resolved.ok) return fail(resolved.code, resolved.error, registry.documentToken);
    return ok(registry, { value: resolved.element.getAttribute(attributeName), selector: resolved.selector, elementId: resolved.elementId, attribute: attributeName });
  }

  function checkExists(registry: RegistryState, args: Record<string, unknown>): InjectedDomOperationResult {
    const selector = stringArg(args, 'selector');
    if (!selector) return fail('SELECTOR_REQUIRED', 'check_exists requires selector.', registry.documentToken);
    const matches = querySelectorAllDeep(selector);
    if (matches.kind === 'invalid') return fail('INVALID_SELECTOR', matches.error, registry.documentToken);
    return ok(registry, { exists: matches.elements.length > 0, count: matches.elements.length, selector });
  }

  function getViewport(): unknown {
    return { width: window.innerWidth, height: window.innerHeight, scrollX: window.scrollX, scrollY: window.scrollY, devicePixelRatio: window.devicePixelRatio };
  }

  function validateInteractable(el: Element, operation: string): { ok: true } | { ok: false; code: string; error: string } {
    if (!(el instanceof HTMLElement) && !(el instanceof SVGElement)) return { ok: false, code: 'UNSUPPORTED_TARGET', error: `${operation} target is not an HTMLElement/SVGElement.` };
    if (isDisabled(el)) return { ok: false, code: 'ELEMENT_DISABLED', error: `Cannot ${operation} a disabled element.` };
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return { ok: false, code: 'ELEMENT_NOT_VISIBLE', error: `Cannot ${operation} an element with empty bounds.` };
    const style = window.getComputedStyle(el);
    if (style.visibility === 'hidden' || style.display === 'none' || style.pointerEvents === 'none') return { ok: false, code: 'ELEMENT_NOT_INTERACTABLE', error: `Cannot ${operation} an element that is hidden or pointer-events:none.` };
    return { ok: true };
  }

  function obstructionAtCenter(el: Element): string | null {
    (el as HTMLElement).scrollIntoView?.({ block: 'center', inline: 'center' });
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) return 'Element center is outside the viewport after scroll.';
    const top = document.elementFromPoint(x, y);
    if (!top) return 'No element is present at target center point.';
    if (top === el || el.contains(top)) return null;
    const root = el.getRootNode();
    if (root instanceof ShadowRoot && root.host === top) return null;
    return `Element center is obstructed by <${top.tagName.toLowerCase()}>.`;
  }

  function isDisabled(el: Element): boolean {
    return el instanceof HTMLButtonElement || el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement || el instanceof HTMLOptionElement ? el.disabled : el.getAttribute('aria-disabled') === 'true';
  }

  function isReadOnly(el: Element): boolean {
    return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement ? el.readOnly : el.getAttribute('aria-readonly') === 'true';
  }

  function isTextInput(el: Element): el is HTMLInputElement | HTMLTextAreaElement {
    if (el instanceof HTMLTextAreaElement) return true;
    if (!(el instanceof HTMLInputElement)) return false;
    return !['button', 'checkbox', 'color', 'file', 'hidden', 'image', 'radio', 'range', 'reset', 'submit'].includes(el.type);
  }

  function isContentEditable(el: Element): boolean {
    return el instanceof HTMLElement && el.isContentEditable;
  }

  function stringArg(args: Record<string, unknown>, key: string): string | undefined {
    const value = args[key];
    return typeof value === 'string' ? value : undefined;
  }

  function numberArg(args: Record<string, unknown>, key: string, fallback: number): number {
    const value = args[key];
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  }

  function boolArg(args: Record<string, unknown>, key: string, fallback: boolean): boolean {
    const value = args[key];
    return typeof value === 'boolean' ? value : fallback;
  }

  function modifiersFromArgs(args: Record<string, unknown>): Pick<KeyboardEventInit, 'altKey' | 'ctrlKey' | 'metaKey' | 'shiftKey'> {
    const mask = typeof args.modifiers === 'number' ? args.modifiers : 0;
    return { altKey: boolArg(args, 'altKey', Boolean(mask & 1)), ctrlKey: boolArg(args, 'ctrlKey', Boolean(mask & 2)), metaKey: boolArg(args, 'metaKey', Boolean(mask & 4)), shiftKey: boolArg(args, 'shiftKey', Boolean(mask & 8)) };
  }

  try {
    const registry = getRegistry();
    if (request.expectedDocumentToken && request.expectedDocumentToken !== registry.documentToken) {
      return fail('DOCUMENT_SCOPE_MISMATCH', `Injected document token ${registry.documentToken} does not match expected document token ${request.expectedDocumentToken}.`, registry.documentToken);
    }
    switch (request.operation) {
      case 'get_dom_snapshot': return ok(registry, getDomSnapshot(registry, request.args));
      case 'find_elements': return findElements(registry, request.args);
      case 'click': return clickElement(registry, request.args);
      case 'type_text': return typeText(registry, request.args);
      case 'press_key': return pressKey(registry, request.args);
      case 'hover': return hoverElement(registry, request.args);
      case 'select_option': return selectOption(registry, request.args);
      case 'get_attribute': return getAttribute(registry, request.args);
      case 'check_exists': return checkExists(registry, request.args);
      case 'get_viewport': return ok(registry, getViewport());
      default: return fail('UNSUPPORTED_OPERATION', `Unsupported injected DOM operation: ${String(request.operation)}`, registry.documentToken);
    }
  } catch (error) {
    return fail('EXCEPTION', error instanceof Error ? error.message : String(error));
  }
}
