# Skills/FFmpeg/index.pts History

This companion file records significant changes to the FFmpegSkill ProtoScript glue.

## 2026-05-31 - Add FFmpegSkill media artifact actions
- Added an FFmpeg-specific OpsAgent skill with actions for version checks, ffprobe validation, desktop/browser recording, normalization, thumbnails, trimming, compression, contact sheets, and text overlays.
- Kept action outputs aligned to the session artifact contract by copying generated files into the session directory and returning `[[file:...|...]]` semantic refs.
- Refactored `ToRecordFFmpegDesktopVideoArtifact` after runtime validation to avoid stale nested `cmd /c` quoting and bind numeric command fragments through explicit string variables before constructing FFmpeg arguments.
- Verified the runtime copy by recording `ffmpeg-skill-demo-overlay.mp4` with a text overlay and generating `ffmpeg-skill-demo-contact-sheet.jpg` from the result.
