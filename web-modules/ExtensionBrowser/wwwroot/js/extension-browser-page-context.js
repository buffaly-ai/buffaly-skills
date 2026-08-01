(function () {
  'use strict';

  const presentation = new URLSearchParams(window.location.search).get('presentation');
  if (presentation !== 'sidepanel' || window.parent === window) return;

	const RESPONSE_TYPE = 'extension_browser_send_user_state_response';
	const REQUEST_TYPE = 'extension_browser_send_user_state_request';
	const pendingSendUserState = new Map();
  const pendingMicrophones = new Map();

	// The shared side-panel presentation hides all native session actions. ExtensionBrowser
	// must keep the iframe's existing rename action available without duplicating its contract.
	function exposeNativeRenameAction() {
		const style = document.createElement('style');
		style.id = 'extension-browser-native-session-rename';
		style.textContent = [
			'.ops-v2-header-session-actions { display: inline-flex !important; }',
			'#btnOpsV2HeaderPinSession, #btnOpsV2HeaderArchiveSession { display: none !important; }'
		].join('\n');
		(document.head || document.documentElement).appendChild(style);
	}

	// Request one authoritative extension identity and current-page snapshot for ordinary Send.
	function requestSendUserState() {
		return new Promise((resolve, reject) => {
			const requestId = crypto.randomUUID();
			const timer = window.setTimeout(() => {
				pendingSendUserState.delete(requestId);
				reject(new Error('Extension browser context could not be captured before sending.'));
			}, 5000);
			pendingSendUserState.set(requestId, { resolve, reject, timer });
			window.parent.postMessage({ type: REQUEST_TYPE, requestId }, '*');
		});
	}

  function installMicrophoneDiagnostics() {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') return;
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = async function (constraints) {
      if (constraints && constraints.audio && !constraints.video) return requestBrokeredMicrophone();
      const isMicrophoneRequest = Boolean(constraints && constraints.audio);
      const diagnostic = isMicrophoneRequest ? {
        origin: window.location.origin,
        policyAllowsMicrophone: document.permissionsPolicy
          ? document.permissionsPolicy.allowsFeature('microphone')
          : null,
        permissionState: 'unsupported'
      } : null;
      if (diagnostic && navigator.permissions && typeof navigator.permissions.query === 'function') {
        try {
          diagnostic.permissionState = (await navigator.permissions.query({ name: 'microphone' })).state;
        } catch (error) {
          diagnostic.permissionState = 'query-error';
        }
      }
      try {
        const stream = await original(constraints);
        if (diagnostic) {
          window.parent.postMessage({ type: 'extension_browser_microphone_diagnostic', ...diagnostic, result: 'granted' }, '*');
        }
        return stream;
      } catch (error) {
        if (diagnostic) {
          const name = error && error.name ? String(error.name) : 'MicrophoneError';
          const message = error && error.message ? String(error.message) : 'Chrome did not grant microphone access.';
          window.parent.postMessage({ type: 'extension_browser_microphone_diagnostic', ...diagnostic, result: 'rejected', name, message }, '*');
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

  function serializableSessionDescription(description) {
    return { type: description.type, sdp: description.sdp };
  }

  function requestBrokeredMicrophone() {
    return new Promise((resolve, reject) => {
      const requestId = crypto.randomUUID();
      const peer = new RTCPeerConnection();
      const stream = new MediaStream();
      const brokerUrl = `/web-modules/ExtensionBrowser/microphone?requestId=${encodeURIComponent(requestId)}`;
      const broker = window.open(brokerUrl, `buffaly-microphone-${requestId}`, 'popup,width=520,height=560');
      if (!broker) {
        reject(new DOMException('Chrome blocked the Buffaly microphone window.', 'NotAllowedError'));
        return;
      }
      const timer = window.setTimeout(() => finishBrokeredMicrophone(requestId, new Error('Buffaly microphone capture did not respond within 30 seconds.')), 30000);
      pendingMicrophones.set(requestId, { resolve, reject, peer, stream, broker, timer });
      peer.ontrack = event => {
        const track = event.track;
        const stop = track.stop.bind(track);
        track.stop = () => { stop(); releaseBrokeredMicrophone(requestId); };
        stream.addTrack(track);
        track.addEventListener('ended', () => releaseBrokeredMicrophone(requestId), { once: true });
        finishBrokeredMicrophone(requestId, null);
      };
    });
  }

  function releaseBrokeredMicrophone(requestId) {
    const request = pendingMicrophones.get(requestId);
    if (!request) return;
    pendingMicrophones.delete(requestId);
    window.clearTimeout(request.timer);
    request.peer.close();
    if (!request.broker.closed) request.broker.postMessage({ type: 'extension_browser_microphone_release', requestId }, window.location.origin);
  }

  function finishBrokeredMicrophone(requestId, error) {
    const request = pendingMicrophones.get(requestId);
    if (!request) return;
    if (error) {
      releaseBrokeredMicrophone(requestId);
      request.reject(error);
      window.parent.postMessage({ type: 'extension_browser_microphone_diagnostic', origin: window.location.origin, policyAllowsMicrophone: null, permissionState: 'broker', result: 'rejected', name: error.name || 'MicrophoneError', message: error.message || String(error) }, '*');
      return;
    }
    window.clearTimeout(request.timer);
    request.resolve(request.stream);
  }

  window.addEventListener('message', (event) => {
    if (!event.data) return;
    const microphone = pendingMicrophones.get(event.data.requestId);
    if (microphone && event.source === microphone.broker && event.origin === window.location.origin) {
      if (event.data.type === 'extension_browser_microphone_offer') {
        microphone.peer.setRemoteDescription(event.data.offer)
          .then(() => microphone.peer.createAnswer())
          .then(answer => microphone.peer.setLocalDescription(answer))
          .then(() => waitForIceGathering(microphone.peer))
          .then(() => microphone.broker.postMessage({ type: 'extension_browser_microphone_answer', requestId: event.data.requestId, answer: serializableSessionDescription(microphone.peer.localDescription) }, window.location.origin))
          .catch(error => finishBrokeredMicrophone(event.data.requestId, error));
      } else if (event.data.type === 'extension_browser_microphone_failure') {
        const error = new Error(String(event.data.message || 'Chrome did not grant microphone access.'));
        error.name = String(event.data.name || 'MicrophoneError');
        finishBrokeredMicrophone(event.data.requestId, error);
		}
		return;
	}
	if (event.source !== window.parent || event.data.type !== RESPONSE_TYPE) return;
	const request = pendingSendUserState.get(event.data.requestId);
	if (!request) return;
	pendingSendUserState.delete(event.data.requestId);
	window.clearTimeout(request.timer);
	if (event.data.error) request.reject(new Error(String(event.data.error)));
	else request.resolve(event.data.userState);
  });

	exposeNativeRenameAction();
  installMicrophoneDiagnostics();
	window.BuffalyAgentNextExtensions.registerSendUserStateProvider({
		id: 'extension-browser.send-user-state',
		provide: requestSendUserState
	});
}());
