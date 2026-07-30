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
const serverSource = fs.readFileSync(path.join(root, 'lib/buffaly-servers.ts'), 'utf8');
const toolRouterSource = fs.readFileSync(path.join(root, 'lib/tool-router.ts'), 'utf8');
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const forbiddenLegacyResume = ['resume', 'Conversation'].join('');
const forbiddenReplacementCreate = ['replacement = await ', 'createConversation'].join('');
const forbiddenReuseCreate = ["createConversation(connection, '", "ReuseCurrent'"].join('');
const forbiddenCombinedLookup = ['conversation', 'Identity'].join('');
const forbiddenSessionKeyFallback = ['SessionKey', ' ||'].join('');
const forbiddenLegacyBindingFallback = ['SessionBindingId', ' ||'].join('');
const forbiddenActiveSessionKeyFallback = ['ActiveSessionKey: server.ActiveSessionKey', ' ||'].join('');

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
check(!manifest.permissions.includes('audioCapture'), 'invalid extension permission must not be present: audioCapture');
check(!manifest.permissions.includes('contentSettings'), 'obsolete microphone-recovery permission must not be present: contentSettings');
check(!backgroundSource.includes("new URL('/web-modules/ExtensionBrowser/microphone'"), 'ineffective server-origin microphone setup flow must not return');
check(!backgroundSource.includes("secondaryPattern: `${chrome.runtime.getURL('/')}*`"), 'microphone grant must not use an invalid chrome-extension secondary pattern');
check(sidepanelSource.includes('allow="clipboard-read; clipboard-write; microphone"'), 'trusted conversation iframe must delegate microphone permission to the Buffaly server origin');
check(sidepanelSource.includes('TabId: page.tabId'), 'current-page UserState snapshot must preserve the active tab ID');
check(backgroundSource.includes("canonicalServerOrigin(String(request.origin || '').trim())") && backgroundSource.includes("Promise.resolve().then(async () =>"), 'Save server must validate input inside its asynchronous response path');
check(sidepanelSource.includes("void refreshServers().catch"), 'Save server completion must not block on server health inspection');
check(backgroundSource.includes("data: { Server:") && sidepanelSource.includes("setServersStatus((current) =>"), 'Save server must update the selector immediately from its persisted summary');
check(backgroundSource.includes("request.type === 'remove_buffaly_server'") && sidepanelSource.includes('Manage selected server') && sidepanelSource.includes('Server settings') && sidepanelSource.includes('Save changes'), 'saved-server management UI and worker contract are missing');
check(backgroundSource.includes('const sameOrigin = existing?.Origin === origin') && backgroundSource.includes('Connection: sameOrigin ?'), 'changing a saved server origin must not transfer its credential or conversation authority');
check(toolRouterSource.includes('chrome.windows.update(tab.windowId, { focused: true })'), 'switch_tab must focus the selected tab window before follow-up bound tools run');
check(!toolRouterSource.includes('content script failed and debugger not attached'), 'ordinary page-text failures must not instruct the user to attach debugger');
check(toolRouterSource.includes("chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' })"), 'bound screenshot must capture the visible tab without debugger access');
check(!toolRouterSource.includes("error: 'Debugger not attached. Call attach_debugger first.'"), 'ordinary screenshot must not require or recommend debugger attachment');
check(toolRouterSource.includes("code: 'FULL_PAGE_SCREENSHOT_UNSUPPORTED'") && toolRouterSource.includes("Buffaly\\'s standard screenshot capability"), 'full-page screenshot requests must refer to Buffaly standard screenshot capability without debugger escalation');
const savedServerReply = backgroundSource.indexOf("sendResponse({ ok: true, data: { Server:");
const backgroundChannelRestart = backgroundSource.indexOf('void startInstallationChannel().catch', savedServerReply);
check(savedServerReply >= 0 && backgroundChannelRestart > savedServerReply, 'Save server must acknowledge persisted state before restarting an authorized channel');
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
const sidepanelStyleSource = fs.readFileSync(path.join(root, 'entrypoints/sidepanel/style.css'), 'utf8');
check(sidepanelSource.includes('list_extension_browser_instances') && sidepanelStyleSource.includes('browser-instance-status'), 'side panel must show ExtensionBrowser instance routing status');
check(background.includes('extension_handshake'), 'installation WebSocket channel handshake is missing');
check(background.includes('channel_heartbeat'), 'installation WebSocket channel heartbeat is missing');
check(background.includes('tool_completion'), 'bound tool completion contract is missing');
check(backgroundSource.includes("list_extension_browser_instances"), 'instance-routing worker instance list message is missing');
check(!backgroundSource.includes("set_session_browser_instance_default") && !backgroundSource.includes("setSessionBrowserInstanceDefault"), 'extension client must not expose direct session default mutation; durable open attaches the default');
check(!backgroundSource.includes("SessionBindingId: bootstrap") && !backgroundSource.includes("ConversationSlotId: bootstrap"), 'durable conversation records must not synthesize legacy binding identifiers');
check(fs.readFileSync(path.join(root, 'lib/buffaly-connection.ts'), 'utf8').includes("/web-modules/ExtensionBrowser/api/conversations/navigation-token"), 'durable navigation token requests must use the conversation SessionKey API');
check(fs.readFileSync(path.join(root, 'lib/buffaly-connection.ts'), 'utf8').includes('issueLegacyNavigationToken') && backgroundSource.includes('async function ensureDurableConversation') && backgroundSource.includes('issueConversationNavigationToken(connection, prepared.SessionKey)'), 'pop-out must normalize legacy records to durable SessionKey records before minting the durable navigation-token endpoint');
const popoutBlock = backgroundSource.slice(backgroundSource.indexOf("request.type === 'open_buffaly_conversation_tab'"), backgroundSource.indexOf("request.type === 'create_buffaly_conversation'"));
check(!popoutBlock.includes('issueLegacyNavigationToken'), 'pop-out must not call the legacy navigation-token endpoint');
check(!backgroundSource.includes(forbiddenLegacyResume), 'new normal service-worker flow must not call the legacy resume helper');
check(fs.readFileSync(path.join(root, 'lib/buffaly-servers.ts'), 'utf8').includes('if (isLegacyConversation(binding)) conversationsByBindingId'), 'durable conversations must not enter the legacy binding-id map');
check(backgroundSource.includes('migrateLegacyConversation(connection, binding.SessionBindingId)') && backgroundSource.includes('openDurableConversation(connection, prepared.SessionKey, browserContextId)') && backgroundSource.indexOf('migrateLegacyConversation(connection, binding.SessionBindingId)') < backgroundSource.indexOf('openDurableConversation(connection, prepared.SessionKey, browserContextId)') && backgroundSource.includes('refusing to create a replacement automatically'), 'background restore/select must migrate legacy pointers before durable open and reject silent replacement creates');
check(backgroundSource.includes('async function ensureDurableConversation') && backgroundSource.includes('await ensureDurableConversation(connection, binding, browserContextId)'), 'bootstrap/select/popout must share the migrate-or-return-durable helper');
check(!backgroundSource.includes(forbiddenReplacementCreate) && !backgroundSource.includes(forbiddenReuseCreate), 'background restore/select must not silently create replacement conversations');
check(!backgroundSource.includes(forbiddenCombinedLookup) && !serverSource.includes(forbiddenCombinedLookup), 'extension client must not use a combined binding/session identity helper for durable opens or maps');
check(backgroundSource.includes('function requestConversationSelectionId') && !backgroundSource.includes(forbiddenSessionKeyFallback) && !backgroundSource.includes(forbiddenLegacyBindingFallback), 'selection must accept compatibility ids without a chained binding-id-as-session-key fallback');
check(fs.readFileSync(path.join(root, 'entrypoints/sidepanel/App.tsx'), 'utf8').includes('`session:${conversation.SessionKey}`') && fs.readFileSync(path.join(root, 'entrypoints/sidepanel/App.tsx'), 'utf8').includes('`legacy:${conversation.SessionBindingId}`'), 'sidepanel selection values must distinguish durable sessions from legacy binding ids');
check(!serverSource.includes(forbiddenActiveSessionKeyFallback), 'server summaries must not expose legacy binding ids through ActiveSessionKey fallbacks');
check(serverSource.includes('conversationStorageIdentity') && serverSource.includes("selectionId.startsWith('session:')") && serverSource.includes("selectionId.startsWith('legacy:')"), 'storage must keep lookup identity separate from durable SessionKey and parse typed selection ids');
check(serverSource.includes('if (sessionKey) conversationsBySessionKey[sessionKey] = binding'), 'session-key map must only be populated with an actual SessionKey');
check(serverSource.includes('delete conversationsByBindingId[replacedLegacyBinding.SessionBindingId]') && serverSource.includes('candidate.SessionBindingId === replacedLegacyBinding.SessionBindingId'), 'migrating a legacy conversation must remove its legacy binding and old context entries');
check(!serverSource.includes('BuffalyInstanceRoutingMigrationVersion:') && !serverSource.includes('BuffalyInstanceRoutingMigrationVersion ='), 'loadServers must not claim full migration version while legacy entries can remain');
check(serverSource.includes('return { ...binding, BrowserContextId: binding.BrowserContextId || browserContextId };'), 'selection lookup must not persist legacy records before migration/open');
check(backgroundSource.includes("createDurableConversation") && backgroundSource.includes("openDurableConversation") && backgroundSource.includes("SessionKey"), 'durable session-key conversation API paths are missing');
const connectionSource = fs.readFileSync(path.join(root, 'lib/buffaly-connection.ts'), 'utf8');
const migrateLegacyFunction = connectionSource.slice(connectionSource.indexOf('export async function migrateLegacyConversation'), connectionSource.indexOf('export async function createDurableConversation'));
check(migrateLegacyFunction.includes('SessionBindingId: string') && migrateLegacyFunction.includes('/web-modules/ExtensionBrowser/api/migrations/session-binding') && migrateLegacyFunction.includes('InstallationCredential') && migrateLegacyFunction.includes('DisplayName: migrated.DisplayName'), 'migrateLegacyConversation must accept only a legacy SessionBindingId and return server-authoritative durable conversation data');
const openDurableFunction = connectionSource.slice(connectionSource.indexOf('export async function openDurableConversation'), connectionSource.indexOf('export async function createConversation'));
check(!openDurableFunction.includes('DisplayName: displayName') && !openDurableFunction.includes('DisplayName: request.DisplayName'), 'conversation open client must not send non-authoritative DisplayName');
check(!/JSON\.stringify\([\s\S]{0,180}DisplayName/.test(openDurableFunction), 'conversation open client must not send ignored DisplayName in the request body');
check(connectionSource.includes('interface LegacyConversationBinding') && !connectionSource.includes('SessionKey?: string') && !connectionSource.includes('SessionKey: binding.SessionKey'), 'legacy saved conversation records must not carry durable SessionKey values');
check(fs.readFileSync(path.join(root, 'lib/buffaly-connection.ts'), 'utf8').includes('RoutingKey'), 'instance routing key frame support is missing');
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
