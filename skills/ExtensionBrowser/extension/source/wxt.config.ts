import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: '.',
  manifest: {
    name: 'Buffaly Browser Agent',
    description: 'Control your current browser through Buffaly with explicit debugger consent.',
    version: '0.2.58',
    permissions: [
      'sidePanel',
      'storage',
	  'identity',
      'tabs',
      'scripting',
      'activeTab',
      'debugger',
    ],
    host_permissions: ['<all_urls>'],
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'self'; frame-src http://127.0.0.1:* http://localhost:* http://*.local:* https:;",
    },
    side_panel: {
      default_path: 'sidepanel.html',
    },
    action: {
      default_title: 'Open Browser Agent',
    },
  },
});
