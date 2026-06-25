# LLM/index.pts Change History

## Move OpenAI image generation out of LLM (2026-04-26)
- Removed the OpenAI image generation DLL reference and ImageGeneration include from the LLM skill.
- The replacement service now lives under `Skills/OpenAIImageGeneration`.

## Remove Legacy Grok/Gemini Provider DLL References (2026-06-06)
- Removed direct Grok/Gemini action/model assembly references from the LLM skill index.
- Design Decision: route provider text calls through the Buffaly runtime host instead of compile-time provider action DLLs.
