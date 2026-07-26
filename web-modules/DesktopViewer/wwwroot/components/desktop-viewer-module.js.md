# desktop-viewer-module.js

Registered Web Component for the exact `window` screen. It receives validated process/title/frame settings before start, reuses the existing Desktop Viewer frame endpoint, renders frames into a bounded canvas, emits the shared ready/error events, and stops polling on disposal.
