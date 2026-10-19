// Explicit transport conversion and browser-local WAV evidence; not a provider protocol adapter.
export function pcm16(samples, fromRate, toRate) {
	const count = Math.floor(samples.length * toRate / fromRate), result = new Uint8Array(count * 2), view = new DataView(result.buffer);
	for (let i = 0; i < count; i++) {
		const position = i * fromRate / toRate, left = Math.floor(position), fraction = position - left;
		const sample = samples[left] * (1 - fraction) + samples[Math.min(left + 1, samples.length - 1)] * fraction;
		view.setInt16(i * 2, Math.round(Math.max(-1, Math.min(1, sample)) * 32767), true);
	}
	return result;
}
export function decodeAudio(bytes, codec) {
	if (codec === 'Pcm16') {
		const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength), output = new Float32Array(bytes.length / 2);
		for (let i = 0; i < output.length; i++) output[i] = view.getInt16(i * 2, true) / 32768;
		return output;
	}
	if (codec !== 'Pcmu') throw new Error('Unsupported codec');
	return Float32Array.from(bytes, value => { const v = ~value & 255, sign = v & 128, exponent = v >> 4 & 7, mantissa = v & 15; const magnitude = ((mantissa << 3) + 132) * (1 << exponent) - 132; return (sign ? -magnitude : magnitude) / 32768; });
}
export function wav(chunks, format) {
	const decoded = chunks.map(bytes => decodeAudio(bytes, format.Codec));
	const length = decoded.reduce((sum, chunk) => sum + chunk.length, 0), buffer = new ArrayBuffer(44 + length * 2), view = new DataView(buffer);
	const text = (at, value) => [...value].forEach((c, i) => view.setUint8(at + i, c.charCodeAt(0)));
	text(0, 'RIFF'); view.setUint32(4, 36 + length * 2, true); text(8, 'WAVE'); text(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true); view.setUint32(24, format.SampleRate, true); view.setUint32(28, format.SampleRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true); text(36, 'data'); view.setUint32(40, length * 2, true);
	let offset = 44; for (const chunk of decoded) for (const value of chunk) { view.setInt16(offset, Math.round(Math.max(-1, Math.min(1, value)) * 32767), true); offset += 2; }
	return new Blob([buffer], { type: 'audio/wav' });
}
export const base64 = bytes => btoa(Array.from(bytes, value => String.fromCharCode(value)).join(''));
export const fromBase64 = value => Uint8Array.from(atob(value), c => c.charCodeAt(0));
