# ProviderModelActions.pts Change History

## Remove deprecated image generation stubs (2026-06-18)
- Removed the obsolete Gemini and Grok image-generation stub actions so action discovery no longer surfaces unavailable provider-specific image-generation tools.
- Kept the LLM provider skill focused on text, multimodal understanding, and provider-backed text-to-speech actions; live image generation remains owned by `OpenAIImageGenerationSkill`.

## Runtime Provider Migration (2026-06-06)
- Added `ToAskModelViaBuffalyRuntime` with the six-argument v1 surface and a thin `_opsAgent.AskModelViaRuntime(...)` call.
- Reworked legacy Grok/xAI and Gemini text wrappers to delegate to the runtime host with provider overrides.
- Replaced legacy heavy and image-generation provider actions with clear unavailable JSON stubs.
- Design Decision: remove compile-time dependency on legacy Grok/Gemini DLL actions and keep ProtoScript as a thin provider-runtime bridge.

## 2026-06-11 Provider-backed text-to-speech actions

### Actions Taken
- Added `ToListTextToSpeechVoices`, `ToGenerateTextToSpeechAudio`, and `ToGenerateTextToSpeechVoiceSamples` as thin wrappers over `_opsAgent` C# facade methods.

### Design Decisions
- Kept ProtoScript wrappers pass-through only; provider validation, artifact pathing, MP3 verification, and file refs are owned by C#.
