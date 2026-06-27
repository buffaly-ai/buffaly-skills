# Skills/FFmpeg/index.pts History

This companion file records significant changes to the FFmpegSkill ProtoScript glue.

## 2026-05-31 - Add FFmpegSkill media artifact actions
- Added an FFmpeg-specific OpsAgent skill with actions for version checks, ffprobe validation, desktop/browser recording, normalization, thumbnails, trimming, compression, contact sheets, and text overlays.
- Kept action outputs aligned to the session artifact contract by copying generated files into the session directory and returning `[[file:...|...]]` semantic refs.
- Refactored `ToRecordFFmpegDesktopVideoArtifact` after runtime validation to avoid stale nested `cmd /c` quoting and bind numeric command fragments through explicit string variables before constructing FFmpeg arguments.
- Verified the runtime copy by recording `ffmpeg-skill-demo-overlay.mp4` with a text overlay and generating `ffmpeg-skill-demo-contact-sheet.jpg` from the result.

## 2026-06-01 - Fix image artifact false-success behavior
- Fixed thumbnail extraction to invoke FFmpeg directly with `-update 1`, copy the generated image into the session directory, and include explicit verification output.
- Fixed contact sheet generation to require explicit tile rows instead of using invalid `x0`, invoke FFmpeg directly with `-update 1`, copy the generated image into the session directory, and include explicit verification output.
- This prevents the image actions from returning previewable semantic file refs when the session artifact file was not actually created.

## 2026-06-01 - Fix image artifact false-success behavior
- Updated thumbnail extraction to write a single image with `-update 1` and to verify the copied session artifact before returning the semantic file ref.
- Updated contact sheet creation to use explicit `columns x rows` tile layouts instead of the invalid `columns x 0` form, write with `-update 1`, and verify the copied artifact.
- Runtime source was mirrored and the fixed FFmpeg command shapes were validated by creating `ffmpeg-skill-fixed-thumb.png` and `ffmpeg-skill-fixed-contact-sheet.png` in the `Video.Recording` session directory.
- Observed loader/index cache issue: the in-session callable metadata still advertised the previous contact-sheet signature without `rows` after reset, so runtime action schema refresh needs a separate cache/index refresh before the new action signature is callable in this session.

## 2026-06-04 - Make recording artifacts interruption-tolerant
- Changed `ToRecordFFmpegDesktopVideoArtifact` to record the live capture into an MKV working file first, then finalize a browser-previewable MP4 with `-movflags +faststart`.
- The action now copies both the finalized MP4 and the MKV source into the session directory, then verifies the MP4 exists and probes it before returning semantic file refs.
- Added `ToFinalizeFFmpegMkvRecordingArtifact` so manually stopped/live MKV recordings can be converted into validated MP4 preview artifacts without recording directly to fragile MP4 containers.
## 2026-06-05 - Add separate audio extraction artifact action
- Added `ToExtractFFmpegAudioArtifact` to extract the first audio stream from source media into a separate `.m4a` AAC artifact under `artifacts/audio/` without mutating the source media.
- The action probes the source before extraction, stages output through a temp directory, copies the audio artifact into the session artifact tree, then verifies/probes the staged audio output.
- Replaced the desktop-recording timeout arithmetic expression with a constant timeout so the FFmpeg skill file indexes cleanly in the current ProtoScript binder.`r`n- Removed nested whole-command quoting from FFmpeg `cmd /c` prepare/copy calls so quoted file paths copy correctly through the runtime command wrapper.
