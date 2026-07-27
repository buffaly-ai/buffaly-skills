import assert from 'node:assert/strict';
import fs from 'node:fs';

const connection = fs.readFileSync(new URL('../lib/buffaly-connection.ts', import.meta.url), 'utf8');
const background = fs.readFileSync(new URL('../entrypoints/background.ts', import.meta.url), 'utf8');
const panel = fs.readFileSync(new URL('../entrypoints/sidepanel/App.tsx', import.meta.url), 'utf8');

assert.match(connection, /chrome\.identity\.launchWebAuthFlow/, 'installation authorization must be extension-owned');
assert.match(connection, /InstallationCredential/, 'credential must be retained by the connection owner');
assert.match(connection, /if \(this\.connecting\) return this\.connecting/, 'channel connection attempts must be single-flight');
assert.match(connection, /addEventListener\('message'[\s\S]{0,240}addEventListener\('open'/, 'channel must listen for invocations before sending its handshake');
assert.doesNotMatch(connection, /reconnectTimer[\s\S]{0,160}connecting\s*=\s*null/, 'reconnect callback must not clear an in-flight connection');
assert.match(connection, /channel_heartbeat/, 'MV3 installation channel must send typed heartbeats');
assert.match(connection, /setInterval[\s\S]{0,240}20_000/, 'channel heartbeat must keep the MV3 worker alive on a bounded interval');
assert.match(connection, /stopHeartbeat\(\)/, 'channel heartbeat timer must be cleaned up');
assert.match(connection, /SessionBindingId: invocation\.SessionBindingId, InvocationId: invocation\.InvocationId/, 'completion must preserve composite correlation');
assert.match(connection, /await this\.deliverCompletion\(pendingCompletion\)/, 'live completions must use acknowledged delivery');
assert.match(connection, /await this\.deliverCompletion\(\{ StorageKey: key, Completion: item\.Completion \}\)/, 'recovered completions must use the same acknowledged delivery');
assert.match(connection, /if \(!result\.Matched\) throw new Error/, 'completion outbox entries must require server correlation before deletion');
assert.doesNotMatch(connection, /socket\.send\(JSON\.stringify\(pendingCompletion\.Completion\)\)/, 'live completion delivery must not delete after an unacknowledged WebSocket send');
assert.doesNotMatch(connection, /this\.socket\.send\(JSON\.stringify\(item\.Completion\)\)/, 'recovered completion delivery must not delete after an unacknowledged WebSocket send');
assert.match(background, /new InstallationChannel\(connection, invokeBoundTool\)/, 'service worker must own the installation channel while delegating execution to the persistent side panel');
assert.match(background, /port\.name !== 'bound-tool-executor'/, 'service worker must accept only the dedicated side-panel executor port');
assert.match(background, /boundToolPort!\.postMessage\(\{ type: 'execute_bound_tool'/, 'service worker must dispatch bound tools through the dedicated port');
assert.match(panel, /chrome\.runtime\.connect\(\{ name: 'bound-tool-executor' \}\)/, 'side panel must own the persistent executor port');
assert.match(panel, /port\.onDisconnect\.addListener[\s\S]{0,360}connectBoundToolPort\(\)/, 'side panel must restore its executor port after MV3 worker replacement');
assert.match(panel, /msg\.type !== 'execute_bound_tool'/, 'side panel must execute bound tools without receiving channel credentials');
assert.match(background, /sender\.id !== chrome\.runtime\.id \|\| !sender\.url/, 'trusted extension messages must require this extension identity and URL');
assert.doesNotMatch(background, /sender\.tab === undefined/, 'side-panel trust must not assume the sender has no associated tab');
assert.doesNotMatch(background, /sender\.tab !== undefined/, 'privileged side-panel paths must not reject a legitimate tab-associated sender');
for (const messageType of ['tool_call', 'buffaly_connection_changed', 'grant_debugger_consent', 'revoke_debugger_consent', 'get_tool_log']) {
  assert.match(background, new RegExp(`request\\.type === '${messageType}'[\\s\\S]{0,180}!isTrustedExtensionPage\\(sender\\)`), `${messageType} must use exact extension-origin trust`);
}
assert.match(background, /createConversation\(connection, 'CreateNew', crypto\.randomUUID\(\)/, 'service worker must create each new conversation slot');
assert.match(connection, /PROMPT_POLICY_REVISION/, 'extension must version its bound-conversation prompt policy');
assert.match(background, /binding\.PromptPolicyRevision[\s\S]{0,180}< PROMPT_POLICY_REVISION[\s\S]{0,260}createConversation\(connection, 'CreateNew'/, 'service worker must replace a stored conversation created under an obsolete prompt policy');
assert.match(background, /ACTIVE_CONVERSATION_STORAGE_KEY/, 'service worker must own the opaque active binding pointer');
assert.match(background, /issueNavigationToken\(connection, binding\.SessionBindingId\)/, 'service worker must mint a fresh token when restoring a conversation');
assert.match(panel, /web-modules\/ExtensionBrowser\/conversation/, 'iframe must use the package-owned token bootstrap route');
assert.match(panel, /NavigationToken/, 'iframe navigation must carry the one-time token');
assert.doesNotMatch(panel, /buffaly-connection/, 'panel must not import the credential-bearing connection module');
assert.doesNotMatch(panel, /loadConnection|authorizeInstallation|createConversation|issueNavigationToken|redeemNavigation/, 'panel must not call credentialed connection APIs');
assert.doesNotMatch(panel, /InstallationCredential|ExtensionConnection|SessionKey|sessionKey/, 'panel state and navigation must contain no credential or durable session key');
assert.match(panel, /service worker did not answer/, 'panel must report a missing worker response explicitly');
assert.doesNotMatch(panel, /Session key<input/, 'manual session-key targeting must be removed');
console.log('Extension-bound conversation lifecycle contract passed.');
