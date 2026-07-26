import assert from 'node:assert/strict';
import fs from 'node:fs';

const connection = fs.readFileSync(new URL('../lib/buffaly-connection.ts', import.meta.url), 'utf8');
const background = fs.readFileSync(new URL('../entrypoints/background.ts', import.meta.url), 'utf8');
const panel = fs.readFileSync(new URL('../entrypoints/sidepanel/App.tsx', import.meta.url), 'utf8');

assert.match(connection, /chrome\.identity\.launchWebAuthFlow/, 'installation authorization must be extension-owned');
assert.match(connection, /InstallationCredential/, 'credential must be retained by the connection owner');
assert.match(connection, /if \(this\.connecting\) return this\.connecting/, 'channel connection attempts must be single-flight');
assert.doesNotMatch(connection, /reconnectTimer[\s\S]{0,160}connecting\s*=\s*null/, 'reconnect callback must not clear an in-flight connection');
assert.match(connection, /channel_heartbeat/, 'MV3 installation channel must send typed heartbeats');
assert.match(connection, /setInterval[\s\S]{0,240}20_000/, 'channel heartbeat must keep the MV3 worker alive on a bounded interval');
assert.match(connection, /stopHeartbeat\(\)/, 'channel heartbeat timer must be cleaned up');
assert.match(connection, /SessionBindingId: invocation\.SessionBindingId, InvocationId: invocation\.InvocationId/, 'completion must preserve composite correlation');
assert.match(background, /new InstallationChannel\(connection, handleToolCall\)/, 'service worker must own the installation channel and tool dispatch');
assert.match(background, /sender\.id !== chrome\.runtime\.id \|\| !sender\.url/, 'trusted extension messages must require this extension identity and URL');
assert.doesNotMatch(background, /sender\.tab === undefined/, 'side-panel trust must not assume the sender has no associated tab');
assert.doesNotMatch(background, /sender\.tab !== undefined/, 'privileged side-panel paths must not reject a legitimate tab-associated sender');
for (const messageType of ['tool_call', 'buffaly_connection_changed', 'grant_debugger_consent', 'revoke_debugger_consent', 'get_tool_log']) {
  assert.match(background, new RegExp(`request\\.type === '${messageType}'[\\s\\S]{0,180}!isTrustedExtensionPage\\(sender\\)`), `${messageType} must use exact extension-origin trust`);
}
assert.match(background, /createConversation\(connection, 'CreateNew', crypto\.randomUUID\(\)/, 'service worker must create each new conversation slot');
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
