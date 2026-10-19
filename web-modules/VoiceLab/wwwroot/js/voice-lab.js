import { pcm16, decodeAudio, wav, base64, fromBase64 } from './audio.js';
const $ = id => document.getElementById(id), api = '/web-modules/VoiceLab/api';
let catalog, socket, profile, caps, context, micStream, micNode, micSource, micSink, micPending = false, nextPlay = 0, lastResponse = '', evidence = [], chunks = [], sources = new Set(), audioUrl, ttsUrl, audioBytes = 0, sequence = 0;
function record(kind, data = {}) { evidence.push({ sequence: ++sequence, utc: new Date().toISOString(), kind, ...data }); if (evidence.length > 2000) evidence.shift(); $('events').textContent = evidence.slice(-100).map(e => JSON.stringify(e)).join('\n'); }
function status(text) { $('status').textContent = text; }
function fill(select, rows) { select.replaceChildren(...rows.map(row => { const o = document.createElement('option'); o.value = typeof row === 'string' ? row : row.value; o.textContent = typeof row === 'string' ? row : row.label; return o; })); }
function formatValue(format) { return JSON.stringify(format); }
function refreshProvider() {
	const selected = catalog.Realtime.find(p => p.Provider === $('provider').value); caps = selected.Capabilities;
	fill($('purpose'), caps.Purposes); fill($('turn'), caps.TurnModes);
	const formats = caps.Formats.map(f => ({ value: formatValue(f), label: `${f.Codec} / ${f.SampleRate} Hz / ${f.Channels} ch` }));
	fill($('inputFormat'), formats); fill($('outputFormat'), formats);
	$('inputFormat').value = formatValue(caps.Formats.find(f => f.Codec === 'Pcm16'));
	if (selected.Provider === 'openai') { $('model').value = 'gpt-realtime-2.1'; $('voice').value = 'alloy'; $('transcriptionModel').value = 'gpt-4o-transcribe'; }
	else if (selected.Provider === 'xai') { $('model').value = 'grok-voice-3.0'; $('voice').value = 'Ara'; $('transcriptionModel').value = ''; }
	else { $('model').value = ''; $('model').placeholder = 'Exact enabled Gemini Live model ID'; $('voice').value = 'Kore'; $('transcriptionModel').value = ''; $('outputFormat').value = formatValue(caps.Formats.find(f => f.SampleRate === 24000)); }
	$('experimental').checked = false; $('interrupt').checked = false;
	$('capabilities').textContent = JSON.stringify(caps, null, 2);
	refreshTurn();
}
function refreshTurn() { if (!caps.CanControlInterrupt) $('interrupt').checked = $('turn').value === 'ServerVadAutomaticResponse'; $('interrupt').disabled = !caps.CanControlInterrupt; }
function controls(active) {
	for (const id of ['provider','model','voice','purpose','turn','inputFormat','outputFormat','transcriptionModel','experimental','interrupt','instructions','connect']) $(id).disabled = active;
	for (const id of ['send','disconnect']) $(id).disabled = !active;
	$('mic').disabled = !active || profile?.Input.Codec !== 'Pcm16';
	$('respond').disabled = !active || !caps.CanCreateResponse || profile?.Purpose !== 'Conversation';
	$('commit').disabled = !active || profile?.TurnMode !== 'Manual';
	$('cancel').disabled = !active || !caps.CanCancelResponse;
	if (!active) refreshTurn();
}
function send(type, data = {}) { if (socket?.readyState !== WebSocket.OPEN) throw new Error('No connected session'); if (socket.bufferedAmount > 128 * 1024) { close(); throw new Error('Audio backpressure: session closed, no retry.'); } socket.send(JSON.stringify({ Type: type, ...data })); record('browserCommand', { type }); }
function clearPlayback(reason) { for (const source of sources) { source.onended = null; try { source.stop(); } catch {} } sources.clear(); nextPlay = context?.currentTime ?? 0; record('localPlaybackCleared', { reason }); }
async function stopMic() { const wasActive = !!micNode; if (micNode) { micNode.onaudioprocess = null; micNode.disconnect(); micNode = null; } micSource?.disconnect(); micSink?.disconnect(); micStream?.getTracks().forEach(t => t.stop()); micSource = micSink = micStream = null; if (wasActive) { if (socket?.readyState === WebSocket.OPEN && profile.TurnMode === 'ClientActivityAutomaticResponse') send('activityEnd'); record('microphoneStopped'); } $('stopMic').disabled = true; $('mic').disabled = micPending || socket?.readyState !== WebSocket.OPEN || profile?.Input.Codec !== 'Pcm16'; }
function publishAudio() { if (!chunks.length || !profile.Output) return; if (audioUrl) URL.revokeObjectURL(audioUrl); audioUrl = URL.createObjectURL(wav(chunks, profile.Output)); $('recordedOutput').src = audioUrl; $('downloadAudio').href = audioUrl; $('downloadAudio').hidden = false; }
function close() { stopMic(); clearPlayback('sessionClose'); if (socket?.readyState === WebSocket.OPEN) { socket.send(JSON.stringify({ Type: 'close' })); socket.close(); } publishAudio(); controls(false); }
async function onEvent(message) {
	const event = JSON.parse(message.data);
	if (event.Kind === 'ready') { record('providerReady', event); status(`Connected ${profile.Provider}. Configuration evidence: ${event.Actual.Evidence}.`); controls(true); return; }
	if (event.Kind === 'RealtimeOutputAudio') {
		const bytes = fromBase64(event.Data.Audio); audioBytes += bytes.length;
		if (audioBytes > 24 * 1024 * 1024) { close(); status('Browser audio evidence limit reached.'); return; }
		chunks.push(bytes);
		const samples = decodeAudio(bytes, profile.Output.Codec), buffer = context.createBuffer(1, samples.length, profile.Output.SampleRate); buffer.copyToChannel(samples, 0);
		const source = context.createBufferSource(); source.buffer = buffer; source.connect(context.destination); const at = Math.max(context.currentTime + 0.02, nextPlay); nextPlay = at + buffer.duration; sources.add(source);
		source.onended = () => { sources.delete(source); if (!sources.size) record('localPlaybackDrained', { evidence: 'AudioContext playback ended; not human hearing or carrier delivery.' }); }; source.start(at);
		record('providerAudioReceived', { bytes: bytes.length, elapsedMs: event.ElapsedMs, ResponseId: event.Data.ResponseId, itemId: event.Data.ItemId });
		$('metrics').textContent = `${audioBytes} generated bytes received; ${chunks.length} chunks; queued local playback ${Math.max(0, nextPlay-context.currentTime).toFixed(2)}s. Not heard proof.`; return;
	}
	record(event.Kind, event);
	if (event.Data?.ResponseId) lastResponse = event.Data.ResponseId;
	if (event.Kind === 'RealtimeInputTranscript' || event.Kind === 'RealtimeOutputTranscript') $('transcript').textContent += `${event.Kind === 'RealtimeInputTranscript' ? 'Input' : 'Output'} (${event.Data.Update}): ${event.Data.Text}\n`;
	if (event.Kind === 'RealtimeSpeechStarted' && profile.ProviderInterrupts || event.Kind === 'RealtimeResponseEnded' && event.Data.Status === 'Cancelled') clearPlayback('providerInterruption');
	if (event.Kind === 'error' || event.Kind === 'RealtimeProviderError') status('Provider session rejected/failed. Inspect evidence; no retry performed.');
}
$('connect').onclick = async () => {
	try {
		if (socket && socket.readyState < WebSocket.CLOSING) return;
		profile = { Provider: $('provider').value, Model: $('model').value, Voice: $('purpose').value === 'Transcription' ? '' : $('voice').value, Purpose: $('purpose').value, Input: JSON.parse($('inputFormat').value), Output: $('purpose').value === 'Transcription' ? null : JSON.parse($('outputFormat').value), TurnMode: $('turn').value, ProviderInterrupts: $('interrupt').checked, AllowExperimental: $('experimental').checked };
		if (!profile.Model) throw new Error('Exact model required.');
		context ??= new AudioContext(); await context.resume(); chunks = []; audioBytes = 0; lastResponse = ''; $('transcript').textContent = ''; controls(true); status('Opening exact provider profile…');
		socket = new WebSocket(`${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}${api}/session`);
		socket.onopen = () => socket.send(JSON.stringify({ Profile: profile, Instructions: $('instructions').value, TranscriptionModel: $('transcriptionModel').value }));
		socket.onmessage = message => onEvent(message).catch(() => { status('Invalid provider evidence; session closed.'); close(); });
		socket.onclose = () => { stopMic(); clearPlayback('socketClosed'); publishAudio(); controls(false); record('sessionClosed'); status('Session closed. Saved browser-local evidence remains available.'); };
		socket.onerror = () => { record('transportError'); status('Session transport failed; no automatic retry.'); };
	} catch (error) { status(error.message); controls(false); }
};
$('disconnect').onclick = close;
$('mic').onclick = async () => { if (micPending || micNode) return; micPending = true; $('mic').disabled = true; const currentSocket = socket; try {
	micStream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true }, video: false });
	if (socket !== currentSocket || socket.readyState !== WebSocket.OPEN) { await stopMic(); return; }
	micSource = context.createMediaStreamSource(micStream); micNode = context.createScriptProcessor(4096, 1, 1); micSink = context.createGain(); micSink.gain.value = 0;
	if (profile.TurnMode === 'ClientActivityAutomaticResponse') send('activityStart');
	micNode.onaudioprocess = e => { try { send('audio', { Audio: base64(pcm16(e.inputBuffer.getChannelData(0), context.sampleRate, profile.Input.SampleRate)) }); } catch (error) { status(error.message); stopMic(); } };
	micSource.connect(micNode); micNode.connect(micSink); micSink.connect(context.destination); $('mic').disabled = true; $('stopMic').disabled = false; record('microphoneStarted', { inputRate: context.sampleRate, providerRate: profile.Input.SampleRate, conversion: 'explicit mono PCM16 linear resampling' });
	} catch (error) { status(`Microphone not started: ${error.message}`); await stopMic(); }
	finally { micPending = false; $('mic').disabled = !!micNode || socket?.readyState !== WebSocket.OPEN || profile?.Input.Codec !== 'Pcm16'; }
};
$('stopMic').onclick = stopMic;
$('send').onclick = () => send('text', { Text: $('text').value });
$('respond').onclick = () => send('respond'); $('commit').onclick = () => send('commit');
$('cancel').onclick = () => { clearPlayback('operatorCancel'); send('cancel', { ResponseId: lastResponse }); };
$('clearPlayback').onclick = () => clearPlayback('operatorLocalOnly');
function ttsModels() { const provider = catalog.TextToSpeech.Providers.find(p => p.Provider === $('ttsProvider').value); fill($('ttsModel'), (provider?.Models ?? []).map(m => ({ value: m.ModelName, label: m.DisplayName || m.ModelName }))); ttsVoices(); }
function ttsVoices() { const model = catalog.TextToSpeech.Providers.find(p => p.Provider === $('ttsProvider').value)?.Models.find(m => m.ModelName === $('ttsModel').value); fill($('ttsVoice'), (model?.Voices ?? []).map(v => ({ value: v.VoiceName, label: v.DisplayName || v.VoiceName }))); fill($('ttsFormat'), model?.SupportedOutputFormats ?? []); }
$('ttsProvider').onchange = ttsModels; $('ttsModel').onchange = ttsVoices;
$('speak').onclick = async () => { $('speak').disabled = true; $('ttsStatus').textContent = 'Generating…'; try {
	const response = await fetch(`${api}/tts`, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-Voice-Lab': '1' }, body: JSON.stringify({ Provider: $('ttsProvider').value, Model: $('ttsModel').value, Voice: $('ttsVoice').value, OutputFormat: $('ttsFormat').value, Text: $('ttsText').value, Instructions: $('ttsInstructions').value }) });
	if (!response.ok) throw new Error(`Speech request failed (${response.status}); no fallback.`); const data = await response.json(); if (ttsUrl) URL.revokeObjectURL(ttsUrl); ttsUrl = URL.createObjectURL(new Blob([fromBase64(data.Audio)], { type: data.MimeType })); $('ttsAudio').src = ttsUrl; $('ttsStatus').textContent = data.Evidence; record('ttsProviderAudioReceived', { mimeType: data.MimeType, format: data.OutputFormat });
	} catch (error) { $('ttsStatus').textContent = error.message; } finally { $('speak').disabled = false; }
};
$('ttsAudio').onended = () => record('ttsLocalPlaybackEnded', { evidence: 'Browser audio ended, not heard proof.' });
$('provider').onchange = refreshProvider;
$('turn').onchange = refreshTurn;
// Browser navigation only: the native application remains the authenticated call/recording owner.
// Never accept tokens, a route, a query string or userinfo in this origin-only binding.
$('nativeOpen').onclick = () => {
	try {
		const origin = new URL($('nativeOrigin').value);
		if (!['http:', 'https:'].includes(origin.protocol) || origin.username || origin.password || origin.search || origin.hash || origin.pathname !== '/') throw new Error('Enter only an HTTP(S) application origin, without credentials, path or query.');
		if (location.protocol === 'https:' && origin.protocol !== 'https:') throw new Error('An HTTPS Lab requires an HTTPS native application.');
		const target = `${origin.origin}/agents/voiceproviderlab`;
		$('nativeFrame').src = target; $('nativeFrame').hidden = false; $('nativePopout').href = target; $('nativePopout').hidden = false;
		$('nativeStatus').textContent = 'Native controls loaded. Sign in using the new-tab link if needed. No call is placed until its deliberate Start. End remains available in the native panel.';
		record('nativeCallPanelOpened', { origin: origin.origin, evidence: 'Navigation only; not a dial or authentication receipt.' });
	} catch (error) { $('nativeStatus').textContent = error.message; }
};
for (const button of document.querySelectorAll('[data-tab]')) button.onclick = () => { for (const tab of document.querySelectorAll('[data-tab]')) tab.setAttribute('aria-pressed', String(tab === button)); for (const panel of document.querySelectorAll('.panel')) panel.hidden = panel.id !== button.dataset.tab; };
$('export').onclick = () => { const url = URL.createObjectURL(new Blob([JSON.stringify({ createdUtc: new Date().toISOString(), profile, evidence, audioEvidence: 'Downloaded WAV is concatenated provider-generated audio, not synchronized received-channel recording.' }, null, 2)], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = 'voice-lab-evidence.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); };
$('reset').onclick = () => { if (socket?.readyState === WebSocket.OPEN) return; evidence = []; sequence = 0; $('events').textContent = ''; $('transcript').textContent = ''; };
window.addEventListener('beforeunload', close);
try { const response = await fetch(`${api}/catalog`, { credentials: 'same-origin' }); if (!response.ok) throw new Error(`Sign in or load compatible host (${response.status}).`); catalog = await response.json(); fill($('provider'), catalog.Realtime.map(p => p.Provider)); refreshProvider(); fill($('ttsProvider'), catalog.TextToSpeech.Providers.map(p => ({ value: p.Provider, label: `${p.DisplayName || p.Provider}${p.IsConfigured ? '' : ' (not configured)'}` }))); ttsModels(); controls(false); status('Ready. Select an exact profile; Connect incurs provider usage.'); } catch (error) { status(error.message); $('connect').disabled = true; $('speak').disabled = true; }
