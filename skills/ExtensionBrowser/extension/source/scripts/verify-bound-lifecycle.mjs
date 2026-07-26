import assert from 'node:assert/strict';
import fs from 'node:fs';

const connection = fs.readFileSync(new URL('../lib/buffaly-connection.ts', import.meta.url), 'utf8');
const background = fs.readFileSync(new URL('../entrypoints/background.ts', import.meta.url), 'utf8');
const panel = fs.readFileSync(new URL('../entrypoints/sidepanel/App.tsx', import.meta.url), 'utf8');

assert.match(connection, /chrome\.identity\.launchWebAuthFlow/, 'installation authorization must be extension-owned');
assert.match(connection, /InstallationCredential/, 'credential must be retained by the connection owner');
assert.match(connection, /if \(this\.connecting\) return this\.connecting/, 'channel connection attempts must be single-flight');
assert.doesNotMatch(connection, /reconnectTimer[\s\S]{0,160}connecting\s*=\s*null/, 'reconnect callback must not clear an in-flight connection');
assert.match(connection, /SessionBindingId: invocation\.SessionBindingId, InvocationId: invocation\.InvocationId/, 'completion must preserve composite correlation');
assert.match(background, /new InstallationChannel\(connection, handleToolCall\)/, 'service worker must own the installation channel and tool dispatch');
assert.match(panel, /createConversation\(connection, 'CreateNew', crypto\.randomUUID\(\)/, 'New must create a distinct conversation slot');
assert.match(panel, /presentation', 'sidepanel'/, 'iframe must request compact shared presentation');
assert.doesNotMatch(panel, /InstallationCredential/, 'iframe component must not receive or render reusable channel authority');
assert.doesNotMatch(panel, /Session key<input/, 'manual session-key targeting must be removed');
console.log('Extension-bound conversation lifecycle contract passed.');
