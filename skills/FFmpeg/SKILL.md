# FFmpegSkill

FFmpegSkill exposes local FFmpeg and ffprobe workflows as Buffaly agent actions.

The skill is intentionally FFmpeg-specific so a future OBS-backed skill can provide parallel recording/composition actions without changing this contract.

## Artifact contract

Actions that create media write to a caller-provided temporary/output location, validate with ffprobe where applicable, copy the final file into the caller-provided session artifact directory, and return a renderer-friendly semantic file reference.

Use semantic file refs in final assistant responses:

```text
[[file:C:/inetpub/wwwroot/matt.buffaly.local/data/sessions/<SessionKey>/<filename>|<filename>]]
```

The renderer can detect `.mp4`, `.png`, `.jpg`, `.gif`, `.webp`, `.m4a`, `.mp3`, or `.wav` and add inline previews.

## FFmpeg defaults

- Video codec: H.264/libx264
- Pixel format: yuv420p
- MP4 dimensions are forced even with `scale=trunc(iw/2)*2:trunc(ih/2)*2`
- Browser-safe outputs should be validated with ffprobe before returning success.
- Extracted audio defaults to `.m4a` / `audio/mp4` using AAC and is staged separately under `artifacts/audio/` without mutating the source video.
- Desktop/browser recording actions record to MKV first, then finalize MP4 previews. MKV is kept as the recoverable source artifact for manually stopped or interrupted captures.

## High-value actions

1. `ToGetFFmpegVersion`
2. `ToProbeFFmpegMediaFile`
3. `ToRecordFFmpegDesktopVideoArtifact`
4. `ToRecordFFmpegBrowserDemoArtifact`
5. `ToFinalizeFFmpegMkvRecordingArtifact`
6. `ToNormalizeFFmpegVideoForWebArtifact`
7. `ToExtractFFmpegVideoThumbnailArtifact`
8. `ToTrimFFmpegVideoArtifact`
9. `ToCompressFFmpegVideoArtifact`
10. `ToCreateFFmpegContactSheetArtifact`
11. `ToAddFFmpegTextOverlayArtifact`
