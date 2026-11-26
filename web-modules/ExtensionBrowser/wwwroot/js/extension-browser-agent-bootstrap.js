// Keep the sidepanel bridge out of ordinary Agent pages; preserve parser-time provider readiness.
(function () {
  'use strict';
  const presentation = new URLSearchParams(window.location.search).get('presentation');
  if (presentation !== 'sidepanel' || window.parent === window) return;

  if (document.readyState !== 'loading') throw new Error('ExtensionBrowser bootstrap must run during Agent startup.');
  const contextVersion = new URL(document.currentScript.src).searchParams.get('contextVersion');
  if (!/^[0-9a-f]{16}$/.test(contextVersion)) throw new Error('ExtensionBrowser context version is required.');
  document.write('<script src="/web-modules/ExtensionBrowser/js/extension-browser-page-context.js?v=' + contextVersion + '"></scr' + 'ipt>');
}());
