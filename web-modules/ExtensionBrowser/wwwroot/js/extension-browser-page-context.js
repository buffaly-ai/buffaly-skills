(function () {
  'use strict';

  const presentation = new URLSearchParams(window.location.search).get('presentation');
  if (presentation !== 'sidepanel' || window.parent === window) return;

  const RESPONSE_TYPE = 'extension_browser_current_page_response';
  const REQUEST_TYPE = 'extension_browser_current_page_request';
  const USER_STATE_KEY = 'ExtensionBrowser.CurrentPage';
  const pending = new Map();
  const pendingMicrophones = new Map();
  const freshlyEnrichedInputs = new WeakSet();
  let evaluateWrapper = null;
  let steerWrapper = null;
  let composerFactoryWrapper = null;
  let composerAssignmentTrapInstalled = false;
  let replayingComposerDispatch = false;

  function publishFreshUserState(page) {
    window.BuffalyAgentNativeUserState = {
      getFreshUserState() {
        return { [USER_STATE_KEY]: page };
      }
    };
  }

  function installMicrophoneDiagnostics() {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') return;
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = async function (constraints) {
      if (constraints && constraints.audio && !constraints.video) {
        return requestExtensionMicrophone(constraints);
      }
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

  function waitForIceGathering(peer) {
    if (peer.iceGatheringState === 'complete') return Promise.resolve();
    return new Promise(resolve => peer.addEventListener('icegatheringstatechange', function changed() {
      if (peer.iceGatheringState !== 'complete') return;
      peer.removeEventListener('icegatheringstatechange', changed);
      resolve();
    }));
  }

  function requestExtensionMicrophone(constraints) {
    return new Promise((resolve, reject) => {
      const requestId = crypto.randomUUID();
      const peer = new RTCPeerConnection();
      const stream = new MediaStream();
      const timer = window.setTimeout(() => finishMicrophone(requestId, new Error('Extension microphone capture did not respond within 10 seconds.')), 10000);
      pendingMicrophones.set(requestId, { resolve, reject, peer, stream, timer });
      peer.ontrack = event => {
        const track = event.track;
        const stop = track.stop.bind(track);
        track.stop = () => {
          stop();
          releaseMicrophone(requestId);
        };
        stream.addTrack(track);
        track.addEventListener('ended', () => releaseMicrophone(requestId), { once: true });
        finishMicrophone(requestId, null);
      };
      window.parent.postMessage({ type: 'extension_browser_microphone_request', requestId, constraints }, '*');
    });
  }

  function releaseMicrophone(requestId) {
    const request = pendingMicrophones.get(requestId);
    if (!request) return;
    pendingMicrophones.delete(requestId);
    window.clearTimeout(request.timer);
    request.peer.close();
    window.parent.postMessage({ type: 'extension_browser_microphone_release', requestId }, '*');
  }

  function finishMicrophone(requestId, error) {
    const request = pendingMicrophones.get(requestId);
    if (!request) return;
    if (error) {
      releaseMicrophone(requestId);
      request.reject(error);
      window.parent.postMessage({ type: 'extension_browser_microphone_error', name: error.name || 'MicrophoneError', message: error.message || String(error) }, '*');
      return;
    }
    window.clearTimeout(request.timer);
    request.resolve(request.stream);
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
    if (event.source !== window.parent || !event.data) return;
    if (event.data.type === 'extension_browser_microphone_offer') {
      const request = pendingMicrophones.get(event.data.requestId);
      if (!request) return;
      request.peer.setRemoteDescription(event.data.offer)
        .then(() => request.peer.createAnswer())
        .then(answer => request.peer.setLocalDescription(answer))
        .then(() => waitForIceGathering(request.peer))
        .then(() => {
          window.parent.postMessage({ type: 'extension_browser_microphone_answer', requestId: event.data.requestId, answer: request.peer.localDescription }, '*');
        })
        .catch(error => finishMicrophone(event.data.requestId, error));
      return;
    }
    if (event.data.type === 'extension_browser_microphone_failure') {
      const error = new Error(String(event.data.message || 'Chrome did not grant extension microphone access.'));
      error.name = String(event.data.name || 'MicrophoneError');
      finishMicrophone(event.data.requestId, error);
      return;
    }
    if (event.data.type !== RESPONSE_TYPE) return;
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
    if (window.JsonMethod.callWithInitializer === evaluateWrapper) return true;
    const original = window.JsonMethod.callWithInitializer.bind(window.JsonMethod);
    evaluateWrapper = function (initializer) {
      const isEvaluate = initializer && initializer.Method === 'EvaluateWithInput'
        && initializer.Params && initializer.Params.Input;
      if (!isEvaluate) return original(initializer);
      if (freshlyEnrichedInputs.delete(initializer.Params.Input)) return original(initializer);
      requestCurrentPage().then((page) => {
        injectPage(initializer.Params.Input, page);
        original(initializer);
      }).catch((error) => reportFailure(initializer, error));
    };
    window.JsonMethod.callWithInitializer = evaluateWrapper;
    return true;
  }

  function installSteerInterceptor() {
    if (!window.BuffalyAgentService || typeof window.BuffalyAgentService.SteerInputObjectAsync !== 'function') return false;
    if (window.BuffalyAgentService.SteerInputObjectAsync === steerWrapper) return true;
    const original = window.BuffalyAgentService.SteerInputObjectAsync.bind(window.BuffalyAgentService);
    steerWrapper = async function (request) {
      if (request && request.input && freshlyEnrichedInputs.delete(request.input)) return original(request);
      const page = await requestCurrentPage();
      injectPage(request.input, page);
      return original(request);
    };
    window.BuffalyAgentService.SteerInputObjectAsync = steerWrapper;
    return true;
  }

  function wrapComposerFactory(composer) {
    if (!composer || typeof composer.createComposerController !== 'function') return false;
    if (composer.createComposerController === composerFactoryWrapper) return true;
    const originalFactory = composer.createComposerController.bind(composer);
    composerFactoryWrapper = function (config) {
      if (!config || typeof config.invokeOpsService !== 'function') return originalFactory(config);
      const originalInvoke = config.invokeOpsService;
      const enrichedConfig = Object.assign({}, config, {
        invokeOpsService(methodKebabName, methodName, params, callback, onError) {
          const input = methodName === 'EvaluateWithInput' && params ? params.Input
            : methodName === 'SteerInput' && params ? params.input
              : null;
          if (!input) return originalInvoke(methodKebabName, methodName, params, callback, onError);
          requestCurrentPage().then((page) => {
            injectPage(input, page);
            freshlyEnrichedInputs.add(input);
            originalInvoke(methodKebabName, methodName, params, callback, onError);
          }).catch((error) => {
            if (typeof onError === 'function') onError({ Error: error.message });
            else window.dispatchEvent(new CustomEvent('buffaly:extension-browser-context-error', { detail: { message: error.message } }));
          });
        }
      });
      return originalFactory(enrichedConfig);
    };
    composer.createComposerController = composerFactoryWrapper;
    return true;
  }

  function installComposerInterceptor() {
    if (wrapComposerFactory(window.BuffalyAgentComposer)) return true;
    if (composerAssignmentTrapInstalled) return false;
    const descriptor = Object.getOwnPropertyDescriptor(window, 'BuffalyAgentComposer');
    if (descriptor && descriptor.configurable === false) return false;
    let composerValue = descriptor && descriptor.get ? descriptor.get.call(window) : descriptor ? descriptor.value : undefined;
    Object.defineProperty(window, 'BuffalyAgentComposer', {
      configurable: true,
      enumerable: descriptor ? descriptor.enumerable : true,
      get() { return composerValue; },
      set(value) {
        composerValue = value;
        wrapComposerFactory(value);
      }
    });
    composerAssignmentTrapInstalled = true;
    if (composerValue) wrapComposerFactory(composerValue);
    return false;
  }

  const installStatus = window.ExtensionBrowserPageContext = {
    evaluateInstalled: false,
    steerInstalled: false,
    composerInstalled: false
  };
  let evaluateInstalled = false;
  let steerInstalled = false;
  function installAvailableInterceptors() {
    installStatus.composerInstalled = installComposerInterceptor();
    evaluateInstalled = installEvaluateInterceptor();
    steerInstalled = installSteerInterceptor();
    installStatus.evaluateInstalled = evaluateInstalled;
    installStatus.steerInstalled = steerInstalled;
    return installStatus.composerInstalled && evaluateInstalled && steerInstalled;
  }

  // Gate the actual user gesture so an already-mounted composer reads the new page through its
  // generic synchronous UserState provider. Replaying the button preserves Send versus Steer.
  function installBeforeComposerDispatch(event) {
    if (replayingComposerDispatch) return;
    const target = event && event.target;
    const sendButton = target && typeof target.closest === 'function'
      ? target.closest('#btnOpsV2Send')
      : null;
    const isSendClick = event.type === 'click' && sendButton;
    const isEnterSubmit = event.type === 'keydown' && event.key === 'Enter' && !event.shiftKey
      && target && target.id === 'txtOpsV2Prompt';
    if (!isSendClick && !isEnterSubmit) return;

    const replayButton = sendButton || document.getElementById('btnOpsV2Send');
    if (!replayButton || replayButton.disabled) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    installAvailableInterceptors();
    requestCurrentPage().then((page) => {
      publishFreshUserState(page);
      replayingComposerDispatch = true;
      try {
        replayButton.click();
      } finally {
        replayingComposerDispatch = false;
      }
    }).catch((error) => {
      window.dispatchEvent(new CustomEvent('buffaly:extension-browser-context-error', { detail: { message: error.message } }));
    });
  }

  installMicrophoneDiagnostics();
  installAvailableInterceptors();
  document.addEventListener('click', installBeforeComposerDispatch, true);
  document.addEventListener('keydown', installBeforeComposerDispatch, true);
  window.addEventListener('load', installAvailableInterceptors, { once: true });
  const timer = window.setInterval(() => {
    installAvailableInterceptors();
  }, 100);
  window.setTimeout(() => window.clearInterval(timer), 5000);
}());
