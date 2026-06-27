# Visual Story Reconstruction From Raw Video

Use this workflow when the user has raw screen recordings, phone recordings, demos, or reference videos and wants to turn them into a concise narrative video, GIF, storyboard, or edit plan.

This is not ordinary video editing. The goal is to reconstruct a story from messy visual evidence.

## Concept Name

Preferred name: **Visual Story Reconstruction**

Action/prompt name: `ToReconstructVisualStoryFromRawVideo`

Friendly aliases:
- Story Stitching
- Demo Distillation
- Frame-Informed Storyboarding
- Contact-Sheet-Driven Editing
- Evidence-Based Video Editing
- Source-to-Story Editing
- Narrative Compression

## Goal

Transform raw footage into a clear before -> action -> result narrative by:

1. understanding what happens visually,
2. mapping timestamped events,
3. identifying what should be cut,
4. choosing proof frames and clips,
5. aligning captions to what is actually visible,
6. stitching the strongest moments into a concise final story.

## Core Principle

Do not start by editing. Start by understanding.

Workflow:

Raw footage -> contact sheets -> visual event map -> narrative beats -> inspectable edit map -> caption/transition plan -> final MP4/GIF.

Treat source videos as evidence. Do not assume what is happening. Do not write captions before mapping frames. Do not give a generic storyboard before inspecting visuals.

First answer: **What is actually visible, at which timestamp?**

Only then decide: **What should the viewer understand from this?**

## Best Use Cases

Use this workflow for:
- turning long screen recordings into short product demos,
- making a GIF/MP4 from multiple rough videos,
- explaining an agent workflow visually,
- showing "I saw a thing -> asked Buffaly -> Buffaly built it -> result works",
- creating a Twitter/X-ready product clip,
- converting messy evidence footage into a clean narrative,
- selecting the best frames from contact sheets,
- making a storyboard before editing.

## Recommended Tool Flow

### 1. Resolve or download source videos

If the user provides local files, validate paths.

If the user provides remote video links:
- extract stable file IDs or URLs,
- use the configured authorized account or download workflow for that environment,
- download videos into the current session `artifacts` folder,
- never expose base64 media payloads,
- validate local files with ffprobe.

Record validation facts: file path, duration, codec, resolution, size, and whether audio exists.

### 2. Generate timestamped contact sheets

Create one or more contact sheets for each source video.

For initial mapping:
- sample at 1 fps,
- include visible timestamp labels when possible,
- use enough rows/columns to cover the full duration,
- make text large enough for image understanding.

Preferred tools:
- `ToCreateFFmpegContactSheetArtifact` when simple sheets are enough,
- `ffmpeg` directly when timestamp labels are needed.

Useful FFmpeg filter pattern:

```text
fps=1,scale=360:-1,drawtext=fontfile='C\:/Windows/Fonts/arial.ttf':text='%{pts\:hms}':x=8:y=8:fontsize=28:fontcolor=white:box=1:boxcolor=black@0.65,tile=6x13
```

If timestamp burn-in is unavailable, extract 1fps frames into timestamp-named files such as `sec_000.jpg`, `sec_001.jpg`, and use the filename as the timestamp source of truth.

### 3. Use image understanding to map events

Use the best available multimodal/image-understanding path to inspect contact sheets or sampled frames.

Ask for:
- timestamp-by-timestamp event map,
- what is visibly happening,
- editorial value,
- what to keep,
- what to cut,
- best proof frames,
- uncertainties if text is too small.

Important instruction:

> Do not give a generic edit plan first. Map the images to events first.

### 4. Build a visual event map

For each video, produce a map:

| Timestamp | What is happening | Editorial value | Keep/Cut |
|---|---|---|---|

Example labels: source inspiration visible, wrong menu opened, app opened, session setup, prompt being typed, final prompt with link visible, task submitted, agent timeline begins, implementation summary, verification/commit, demo requested, final result visible.

### 5. Identify non-story footage

Mark footage to remove. Common cuts:
- wrong menus,
- accidental UI,
- repeated frames,
- long typing,
- keyboard/dictation dead time,
- loading delays,
- session setup details,
- repeated status messages,
- duplicate implementation summaries,
- control center/recording overlays,
- private or distracting details,
- anything that does not advance the narrative.

This is narrative compression.

## Story and Splice Planning

### 6. Define the story arc

Summarize the viewer takeaway in one sentence.

Examples:
- "Found a feature on X, gave the link to Buffaly, Buffaly built it, and the feature works."
- "Raw reference video becomes a working product feature."
- "Buffaly turns visual inspiration into implemented software."

Then define the beats:
1. Inspiration/source
2. Handoff/request
3. Agent work
4. Implementation proof
5. Verification/proof
6. Final working result

### 7. Choose proof beats

Every retained clip should prove something. Do not keep a clip just because it happened.

Ask:
- What does this frame prove?
- Is this the clearest visual proof?
- Can a later frame prove this better?
- Is the caption aligned with what is visible?

Example proof beats:
- X feature visible proves the inspiration.
- Prompt with URL proves the link/spec entered Buffaly.
- Submitted chat message proves handoff.
- Implementation summary proves Buffaly built it.
- Verification/commit proves work was validated.
- Rendered output proves final feature works.

### 8. Rebalance pacing toward the payoff

Spend less time on setup, typing, menus, configuration, and waiting.

Spend more time on agent timeline, implementation summary, verification, and final result.

A common pacing rule for a 20-30 second story:
- 10-20% source/inspiration,
- 20-30% request/handoff,
- 20-30% implementation/verification,
- 30-40% final result/payoff.

### 9. Create the splice plan

Before editing, produce a concrete splice plan with these fields:

| Final time | Source | Source timestamp | Speed | What happens | Caption |
|---|---|---|---|---|---|

### 10. Create an inspectable edit-map intermediate

Before rendering, write an edit-map artifact under the current session `artifacts` folder. The edit map is the durable contract between story planning and FFmpeg/media assembly. Do not jump directly from prose storyboard to a render command.

Create both:
- a machine-readable JSON file, for example `artifacts/<slug>-edit-map.json`, and
- a human-readable Markdown companion, for example `artifacts/<slug>-edit-map.md`.

The JSON edit map should include:

```json
{
  "Version": "1.0",
  "Title": "Short descriptive title",
  "StoryGoal": "One-sentence viewer takeaway",
  "Output": {
    "TargetKind": "mp4",
    "TargetDurationSeconds": 28,
    "Canvas": { "Width": 1080, "Height": 1120, "Background": "black" },
    "FrameRate": 30,
    "Audio": "none|source|music|voiceover"
  },
  "Sources": [
    { "Id": "video1", "Path": "artifacts/source-1.mp4", "DurationSeconds": 0, "Validation": "ffprobe summary" }
  ],
  "CropPresets": [
    { "Id": "full_vertical", "Scale": "fit", "Pad": true, "Notes": "Keep full screen visible" },
    { "Id": "focus_center", "Scale": "crop", "X": "center", "Y": "center", "Width": "source", "Height": "source", "Notes": "Use only after sheet review" }
  ],
  "Clips": [
    {
      "Id": "clip01",
      "SourceId": "video1",
      "SourceStart": "00:00:00.000",
      "SourceEnd": "00:00:03.000",
      "Speed": 1.0,
      "CropPresetId": "full_vertical",
      "Caption": { "Text": "Caption aligned to visible evidence", "StartOffset": 0, "EndOffset": null, "Position": "bottom" },
      "TransitionIn": { "Type": "cut", "DurationSeconds": 0 },
      "TransitionOut": { "Type": "cut", "DurationSeconds": 0 },
      "Hold": { "Enabled": false, "DurationSeconds": 0 },
      "Zoom": { "Enabled": false, "StartScale": 1.0, "EndScale": 1.0, "Anchor": "center" },
      "Evidence": { "ContactSheet": "artifacts/sheet.jpg", "FrameRefs": ["artifacts/frames/sec_000.jpg"], "ObservedVisibleEvent": "What is visibly happening" },
      "KnownFixes": ["crop avoids browser chrome", "caption does not cover important UI"]
    }
  ],
  "GlobalTransitions": { "DefaultType": "cut", "DefaultDurationSeconds": 0 },
  "ValidationPlan": ["ffprobe output duration/size/codec", "review caption readability", "confirm each caption matches visible evidence"],
  "OpenQuestions": []
}
```

Required edit-map rules:
- Every rendered clip must have a source id, source timestamp range, speed, crop preset, caption decision, and evidence reference.
- Captions must be attached to clips, not kept as separate free-text notes.
- Transitions, holds, and zooms must be explicit, even when the value is `cut`, disabled, or zero seconds.
- Crop presets must be named and reusable so a later render can change framing without rewriting the story.
- Known fixes must capture discoveries from review, such as "caption too low", "zoom final result", "hold final frame", or "remove dead typing".
- The Markdown companion should summarize the same map as a reviewable table with final time, source time, speed, crop, caption, transition, and evidence.
- Rendering commands should be generated from the edit map, not from an unstructured paragraph.
- After rendering, compare the ffprobe duration and output properties against the edit map target.
### 10. Align captions to evidence

Captions must describe what is visible at that moment. Do not put captions ahead of evidence.

Good captions are short and visual:
- "Saw the reference"
- "Pasted the link into Buffaly"
- "Asked the agent to build it"
- "Implementation completed"
- "Feature working"

Avoid vague or unsupported captions:
- "AI magic"
- "Instantly done" unless timing proves it
- "Production-ready" unless validation is visible or documented

## Rendering Guidance

### 11. Render MP4 first

Prefer MP4 as the first draft because it is sharper, smaller, and easier to review than GIF.

Typical render targets:
- 1080px wide or vertical frame for social posts,
- H.264 video,
- yuv420p pixel format,
- `+faststart`,
- no audio unless source audio is intentionally part of the story.

### 12. Generate GIF only after the MP4 draft is approved

If GIF is requested:
- derive it from the final MP4 draft,
- use palettegen/paletteuse,
- lower fps and dimensions if needed for file-size limits,
- validate duration, size, and frame count.

### 13. Validate every output

Run ffprobe or equivalent validation on final media artifacts.

Report:
- path/ref,
- duration,
- dimensions,
- codec,
- file size,
- whether audio exists,
- any tradeoffs.

## Output Pattern

For the first planning response, provide:
1. visual event map,
2. story sentence,
3. splice plan table,
4. caption plan,
5. edit-map JSON and Markdown artifact paths when ready,
6. explicit uncertainties,
7. ask for approval only if rendering would be expensive or ambiguous.

For the render response, provide:
1. artifact refs,
2. ffprobe validation facts,
3. the edit-map artifact refs used for rendering,
4. segment-to-story mapping,
5. any deviations from the edit map,
6. suggested next refinement actions.

## Safety and Privacy

- Do not expose private media bytes, OAuth tokens, client secrets, connection strings, or base64 payloads.
- Keep media artifacts as files and refer to them with file refs.
- If source footage contains private information, avoid repeating it in captions or final prose.
- Do not invent visible details. If visual inspection is limited, say so and identify which frames/contact sheets need review.

