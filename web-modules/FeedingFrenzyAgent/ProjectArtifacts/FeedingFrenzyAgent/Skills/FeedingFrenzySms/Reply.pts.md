# Feeding Frenzy SMS Reply Action

- Adds the sealed current-turn SMS reply action to the normal role-composed Feeding Frenzy agent graph.
- The action accepts only message text; destination, source line, installation, sequence, and idempotency remain owned by the C# SMS turn binding.
- Normal final responses remain the single-message fallback. The agent uses this action only when the SMS context requires multiple ordered messages.
