import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: '.',
  manifest: {
    name: 'Buffaly Browser Agent',
    description: 'Control your current browser through Buffaly with explicit debugger consent.',
    version: '0.2.0',
    permissions: [
      'sidePanel',
      'tabs',
      'scripting',
      'activeTab',
      'debugger',
    ],
    host_permissions: ['<all_urls>'],
    side_panel: {
      default_path: 'sidepanel.html',
    },
    action: {
      default_title: 'Open Browser Agent',
    },
  },
});
