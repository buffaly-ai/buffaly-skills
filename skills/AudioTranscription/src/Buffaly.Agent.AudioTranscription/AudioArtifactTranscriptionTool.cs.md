# AudioArtifactTranscriptionTool.cs

## Purpose

Provides the C# facade behind the OpsAgent `ToTranscribeAudioArtifact` action.

## History

### Restore complete AudioTranscription skill source

- Restored the source implementation for the AudioTranscription skill after the ProtoScript and C# source files were lost while only the compiled DLL remained.
- The facade resolves audio sources from semantic file references, local/session paths, or approved URLs; validates the audio candidate; and posts multipart audio to the existing Buffaly transcription-only `/api/transcribe` endpoint.
- The public ProtoScript-visible boundary remains `AudioArtifactTranscriptionTool.TranscribeAudioArtifact(string sourceAudio, string instruction) : string`.
- Provider/model/API-key selection remains internal to the existing voice service; the action does not call `/api/voice/agent-interact` or evaluate-with-input.
