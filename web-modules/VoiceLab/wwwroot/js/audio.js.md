# audio.js history

## 2026-10-19 — Implement existing VoiceLab outbound first checkpoint
- Explicit mono PCM16 conversion/resampling, PCMU decoding, bounded browser base64 and WAV evidence; generated provider WAV never labeled received phone recording.
- Verification actually run: LabCSharp16/16, LabUI/audio19/19, nativeUI8/8, native182/182, providers68/68 and actualHostloader6/6 PASS. Actual native operator page made calls with OpenAI2.1/alloy andcoral; coral1184/1185 received testphrase/goodbyes in nativeASR, private actual carrier stereoWAV and browserplayerprogress verified. Human listening not claimed.
- Deployment boundary: source/package tests do not prove active extension. Exact single-module normal ReleaseOps install attempted but admission mutex blocked; current activation/publication receipts are kept in session artifacts. No protected Matt-local restart, direct installed-file edit, shared-provider fallback, IAM/global setting or livebothleg monitor added.
