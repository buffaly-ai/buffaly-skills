# Skills/AudioTranscription/index.pts

Adds `AudioTranscriptionSkill` and `ToTranscribeAudioArtifact`.

Design notes:
- The ProtoScript action is intentionally a thin wrapper over `AudioArtifactTranscriptionTool.TranscribeAudioArtifact(sourceAudio, instruction)`.
- The C# facade owns source resolution, audio validation, multipart POST, and normalized JSON output.
- The default path is transcription-only through `/api/transcribe`; it does not invoke `/api/voice/agent-interact` or evaluate-with-input.
- Provider/model/API-key settings are intentionally not part of the public action contract.
