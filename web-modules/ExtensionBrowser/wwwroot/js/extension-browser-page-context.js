(function () {
  'use strict';

  const presentation = new URLSearchParams(window.location.search).get('presentation');
  if (presentation !== 'sidepanel' || window.parent === window) return;

  const RESPONSE_TYPE = 'extension_browser_current_page_response';
  const REQUEST_TYPE = 'extension_browser_current_page_request';
  const USER_STATE_KEY = 'ExtensionBrowser.CurrentPage';
  const pending = new Map();

  function installMicrophoneDiagnostics() {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') return;
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = async function (constraints) {
      try {
        return await original(constraints);
      } catch (error) {
        if (constraints && constraints.audio) {
          const name = error && error.name ? String(error.name) : 'MicrophoneError';
          const message = error && error.message ? String(error.message) : 'Chrome did not grant microphone access.';
          window.parent.postMessage({ type: 'extension_browser_microphone_error', name, message }, '*');
        }
        throw error;
      }
    };
  }

  function requestCurrentPage() {
    return new Promise((resolve, reject) => {
      const requestId = crypto.randomUUID();
      const timer = window.setTimeout(() => {
        pending.delete(requestId);
        reject(new Error('Current Chrome page could not be captured before sending.'));
      }, 5000);
      pending.set(requestId, { resolve, reject, timer });
      window.parent.postMessage({ type: REQUEST_TYPE, requestId }, '*');
    });
  }

  window.addEventListener('message', (event) => {
    if (event.source !== window.parent || !event.data || event.data.type !== RESPONSE_TYPE) return;
    const request = pending.get(event.data.requestId);
    if (!request) return;
    pending.delete(event.data.requestId);
    window.clearTimeout(request.timer);
    if (event.data.error) request.reject(new Error(String(event.data.error)));
    else request.resolve(event.data.page);
  });

  function injectPage(input, page) {
    if (!input || typeof input !== 'object') throw new Error('Buffaly input is required for page context.');
    input.UserState = Object.assign({}, input.UserState || {}, { [USER_STATE_KEY]: page });
  }

  function reportFailure(initializer, error) {
    if (initializer && typeof initializer.onErrorReceived === 'function') {
      initializer.onErrorReceived({ Error: error.message });
      return;
    }
    window.dispatchEvent(new CustomEvent('buffaly:extension-browser-context-error', { detail: { message: error.message } }));
  }

  function installEvaluateInterceptor() {
    if (!window.JsonMethod || typeof window.JsonMethod.callWithInitializer !== 'function') return false;
    const original = window.JsonMethod.callWithInitializer.bind(window.JsonMethod);
    window.JsonMethod.callWithInitializer = function (initializer) {
      const isEvaluate = initializer && initializer.Method === 'EvaluateWithInput'
        && initializer.Params && initializer.Params.Input;
      if (!isEvaluate) return original(initializer);
      requestCurrentPage().then((page) => {
        injectPage(initializer.Params.Input, page);
        original(initializer);
      }).catch((error) => reportFailure(initializer, error));
    };
    return true;
  }

  function installSteerInterceptor() {
    if (!window.BuffalyAgentService || typeof window.BuffalyAgentService.SteerInputObjectAsync !== 'function') return false;
    const original = window.BuffalyAgentService.SteerInputObjectAsync.bind(window.BuffalyAgentService);
    window.BuffalyAgentService.SteerInputObjectAsync = async function (request) {
      const page = await requestCurrentPage();
      injectPage(request.input, page);
      return original(request);
    };
    return true;
  }

  const installStatus = window.ExtensionBrowserPageContext = {
    evaluateInstalled: false,
    steerInstalled: false
  };
  let evaluateInstalled = false;
  let steerInstalled = false;
  function installAvailableInterceptors() {
    if (!evaluateInstalled) evaluateInstalled = installEvaluateInterceptor();
    if (!steerInstalled) steerInstalled = installSteerInterceptor();
    installStatus.evaluateInstalled = evaluateInstalled;
    installStatus.steerInstalled = steerInstalled;
    return evaluateInstalled && steerInstalled;
  }

  installMicrophoneDiagnostics();
  installAvailableInterceptors();
  window.addEventListener('load', installAvailableInterceptors, { once: true });
  const timer = window.setInterval(() => {
    if (installAvailableInterceptors()) window.clearInterval(timer);
  }, 25);
  window.setTimeout(() => window.clearInterval(timer), 10000);
}());
