# voice-lab.js history

## 2026-10-19 — Implement existing VoiceLab outbound first checkpoint
- Wires actual typed session/TTS endpoints, browser audio/mic lifecycle/backpressure/evidence and native origin-only navigation. Rejects userinfo/path/query/hash/unsafe/mixed HTTPS origins; no dial/credential proxy. Outgoing controls remain available independently of speech catalog failure. Supports private carrier recording review through native panel.
- Verification actually run: LabCSharp16/16, LabUI/audio19/19, nativeUI8/8, native182/182, providers68/68 and actualHostloader6/6 PASS. Actual native operator page made calls with OpenAI2.1/alloy andcoral; coral1184/1185 received testphrase/goodbyes in nativeASR, private actual carrier stereoWAV and browserplayerprogress verified. Human listening not claimed.
- Deployment boundary: source/package tests do not prove active extension. Exact single-module normal ReleaseOps install attempted but admission mutex blocked; current activation/publication receipts are kept in session artifacts. No protected Matt-local restart, direct installed-file edit, shared-provider fallback, IAM/global setting or livebothleg monitor added.
