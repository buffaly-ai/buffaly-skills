import type { ToolName, ToolResult } from './types';

const scope = { tabId: 'number', frameId: 'number', documentId: 'string', documentToken: 'string' } as const;
const target = { ...scope, selector: 'string', elementId: 'string' } as const;
type ArgType = 'string' | 'number' | 'boolean';
interface Contract { properties: Record<string, ArgType>; required?: string[]; target?: boolean }
// This table is both executable validation and the public get_status contract.
export const toolContracts: Record<ToolName, Contract> = {
  get_active_tab: { properties: {} }, get_status: { properties: {} }, list_tabs: { properties: {} },
  get_page_text: { properties: { tabId: 'number', maxLength: 'number' } },
  get_dom_snapshot: { properties: { ...scope, maxNodes: 'number' } },
  screenshot: { properties: { tabId: 'number', fullPage: 'boolean' } },
  find_elements: { properties: { ...scope, query: 'string', maxResults: 'number' }, required: ['query'] },
  navigate: { properties: { tabId: 'number', url: 'string' }, required: ['url'] },
  click: { properties: target, target: true },
  type_text: { properties: { ...target, text: 'string', clear: 'boolean', mode: 'string' }, required: ['text'], target: true },
  press_key: { properties: { ...target, key: 'string', modifiers: 'number', altKey: 'boolean', ctrlKey: 'boolean', metaKey: 'boolean', shiftKey: 'boolean' }, required: ['key'] },
  scroll: { properties: { tabId: 'number', direction: 'string', x: 'number', y: 'number' } },
  wait: { properties: { tabId: 'number', ms: 'number', selector: 'string', timeout: 'number' } },
  open_tab: { properties: { url: 'string' }, required: ['url'] },
  close_tab: { properties: { tabId: 'number' }, required: ['tabId'] },
  switch_tab: { properties: { tabId: 'number' }, required: ['tabId'] },
  attach_debugger: { properties: { tabId: 'number' } }, detach_debugger: { properties: { tabId: 'number' } },
  go_back: { properties: { tabId: 'number' } }, go_forward: { properties: { tabId: 'number' } },
  hover: { properties: target, target: true },
  select_option: { properties: { ...target, value: 'string' }, required: ['value'], target: true },
  get_attribute: { properties: { ...target, attributeName: 'string' }, required: ['attributeName'], target: true },
  check_exists: { properties: { ...scope, selector: 'string' }, required: ['selector'] },
  get_viewport: { properties: scope },
  console_events: { properties: { tabId: 'number', maxCount: 'number', clearAfterRead: 'boolean' } },
};

export function validateToolArguments(tool: string, args: Record<string, unknown>): ToolResult | undefined {
  if (!Object.hasOwn(toolContracts, tool)) return { ok: false, code: 'UNKNOWN_TOOL', error: `Unknown tool ${tool}. Call get_status for toolContracts.` };
  const contract = toolContracts[tool as ToolName];
  const fail = (code: string, error: string): ToolResult => ({ ok: false, code, error });
  for (const name of contract.required ?? []) {
    if (args[name] === undefined || (args[name] === '' && name !== 'text' && name !== 'value')) return fail(`${name.toUpperCase()}_REQUIRED`, `${tool} requires ${name}. Call get_status for toolContracts.`);
  }
  for (const [name, value] of Object.entries(args)) {
    if (name === '__boundWindowId' && Number.isInteger(value)) continue;
    if (!Object.hasOwn(contract.properties, name)) return fail('UNKNOWN_ARGUMENT', `${tool} does not accept ${name}. Allowed: ${Object.keys(contract.properties).join(', ')}.`);
    if (typeof value !== contract.properties[name] || (typeof value === 'number' && !Number.isFinite(value))) return fail('INVALID_ARGUMENT_TYPE', `${tool}.${name} must be ${contract.properties[name]}.`);
  }
  if (contract.target && !args.selector && !args.elementId) return fail('TARGET_REQUIRED', `${tool} requires selector or elementId from a fresh observation.`);
  for (const name of ['selector', 'query']) {
    if (typeof args[name] === 'string' && /^(text=|xpath=)/.test(args[name] as string)) return fail('INVALID_SELECTOR', `${name} requires CSS, not Playwright text= or xpath= syntax.`);
  }
  if (tool === 'wait' && args.ms === undefined && !args.selector) return fail('WAIT_TARGET_REQUIRED', 'wait requires ms or selector.');
  if (tool === 'scroll' && args.direction !== undefined && !['up', 'down', 'left', 'right'].includes(args.direction as string)) return fail('INVALID_DIRECTION', 'direction must be up, down, left or right.');
  return undefined;
}
