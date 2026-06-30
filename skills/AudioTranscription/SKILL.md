# Audio Transcription Skill

OpsAgent-owned transcription-only skill for `ToTranscribeAudioArtifact`.

Scope:
- Resolves an audio source from a semantic file reference, local/session path, or approved URL.
- Validates the input as an audio candidate by extension/content type/header readability.
- Posts multipart audio to the existing Buffaly transcription-only endpoint (`/api/transcribe`).
- Returns deterministic JSON with transcript or normalized error details.

Out of scope:
- Video-to-audio extraction.
- FFmpeg/ffprobe/media transformation.
- Public provider/model/API-key selection.
- Calling `/api/voice/agent-interact` or evaluate-with-input from the default action.
