(function () {
  'use strict';

  const presentation = new URLSearchParams(window.location.search).get('presentation');
  if (presentation !== 'sidepanel' || window.parent === window) return;

	const RESPONSE_TYPE = 'extension_browser_send_user_state_response';
	const REQUEST_TYPE = 'extension_browser_send_user_state_request';
	const pendingSendUserState = new Map();
  const pendingMicrophones = new Map();
  const MICROPHONE_RECORDER_FINALIZATION_GRACE_MS = 1000;

	// The shared side-panel presentation hides all native session actions. ExtensionBrowser
	// must keep the iframe's existing rename action available without duplicating its contract.
	function exposeNativeRenameAction() {
		const style = document.createElement('style');
		style.id = 'extension-browser-native-session-rename';
		style.textContent = [
			'html[data-buffaly-presentation="sidepanel"] .ops-v2-header-session-actions { display: inline-flex !important; }',
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

  async function reportMicrophoneSignal(stream, stage) {
    const track = stream && stream.getAudioTracks()[0];
    if (!track) return;
    let audioContext = null;
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === 'suspended') await audioContext.resume();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      audioContext.createMediaStreamSource(stream).connect(analyser);
      const samples = new Float32Array(analyser.fftSize);
      let squaredSum = 0, sampleCount = 0, peak = 0;
      const deadline = performance.now() + 1000;
      while (performance.now() < deadline) {
        analyser.getFloatTimeDomainData(samples);
        for (const value of samples) { const magnitude = Math.abs(value); squaredSum += value * value; sampleCount += 1; if (magnitude > peak) peak = magnitude; }
        await new Promise(resolve => window.setTimeout(resolve, 50));
      }
      window.parent.postMessage({ type: 'extension_browser_microphone_diagnostic', origin: window.location.origin, permissionState: 'broker', result: 'signal', stage, rms: sampleCount ? Math.sqrt(squaredSum / sampleCount) : 0, peak, trackMuted: track.muted, trackEnabled: track.enabled, trackReadyState: track.readyState, capturedUtc: new Date().toISOString() }, '*');
    } catch (error) {
      window.parent.postMessage({ type: 'extension_browser_microphone_diagnostic', origin: window.location.origin, permissionState: 'broker', result: 'signal-error', stage, name: error && error.name || 'SignalProbeError', message: error && error.message || String(error), capturedUtc: new Date().toISOString() }, '*');
    } finally { try { audioContext && await audioContext.close(); } catch (_) { } }
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
      const timer = window.setTimeout(() => {
        const pending = pendingMicrophones.get(requestId);
        const message = pending && pending.brokerReady
          ? 'The Buffaly microphone window loaded but Enable and test microphone was not clicked within 30 seconds.'
          : 'The Buffaly microphone window did not load or respond within 30 seconds.';
        finishBrokeredMicrophone(requestId, new Error(message));
      }, 30000);
      pendingMicrophones.set(requestId, { resolve, reject, peer, stream, broker, timer, brokerReady: false });
      peer.ontrack = event => {
        const track = event.track;
        const stop = track.stop.bind(track);
        track.stop = () => { scheduleBrokeredMicrophoneRelease(requestId); stop(); };
        stream.addTrack(track);
        track.addEventListener('ended', () => scheduleBrokeredMicrophoneRelease(requestId), { once: true });
        void reportMicrophoneSignal(stream, 'iframe-receiver');
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

  function scheduleBrokeredMicrophoneRelease(requestId) {
    const request = pendingMicrophones.get(requestId);
    if (!request || request.releaseTimer) return;
    request.releaseTimer = window.setTimeout(() => releaseBrokeredMicrophone(requestId), MICROPHONE_RECORDER_FINALIZATION_GRACE_MS);
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
      if (event.data.type === 'extension_browser_microphone_ready') {
        microphone.brokerReady = true;
        window.parent.postMessage({ type: 'extension_browser_microphone_diagnostic', origin: window.location.origin, policyAllowsMicrophone: null, permissionState: 'awaiting-user-gesture', result: 'waiting', message: 'Click Enable and test microphone in the opened Buffaly microphone window.' }, '*');
        try { microphone.broker.focus(); } catch (_) { }
      } else if (event.data.type === 'extension_browser_microphone_offer') {
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
		} else if (event.data.type === 'extension_browser_microphone_signal') {
			window.parent.postMessage({ type: 'extension_browser_microphone_diagnostic', origin: window.location.origin, permissionState: 'broker', result: 'signal', stage: 'broker-source', rms: Number(event.data.rms) || 0, peak: Number(event.data.peak) || 0, trackMuted: event.data.trackMuted === true, trackEnabled: event.data.trackEnabled !== false, trackReadyState: String(event.data.trackReadyState || 'unknown'), capturedUtc: String(event.data.capturedUtc || new Date().toISOString()) }, '*');
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
