# desktop-viewer-module.js

Registered Web Component for the exact `window` screen. It receives validated process/title/frame settings before start, reuses the existing Desktop Viewer frame endpoint, renders frames into a full-size aspect-preserving canvas, emits the shared ready/error events, and stops polling on disposal. The Agent popup owns the visible title and close control, so this component deliberately renders no duplicate header chrome; only a compact streaming-status footer remains below the viewport.
