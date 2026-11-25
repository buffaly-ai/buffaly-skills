# WebProperty Editor Timeline Context Extension

## 2026-07-15

- Suppresses only the save-message-to-artifact action through the neutral timeline action-policy API.
- Leaves generic card-author rendering unchanged; the renderer header carries the authoritative `Web Property Editor` specialized identity.
- Added a module-owned timeline content renderer for the exact visible WebProperty editor initialization state.
- Replaces raw initialization JSON with a compact accessible status card showing the bound editor, preview availability, and publishing availability.
- Applies only to `web-property-editor-agent` and uses exact typed fields without casing fallbacks or coercion.

## 2026-11-25 — Retire the obsolete globally loaded renderer

Removed the owning JavaScript and stylesheet at Matt's direction. The specialized readiness card and save-artifact policy are no longer injected by this extension; ordinary Buffaly no longer advertises its download in newly prepared packages. Both publisher manifests now have empty AgentScripts. Bound editor APIs, role/profile/skill contracts and generic timeline behavior remain unchanged. This history is retained as the removal record; Git retains the source. Validation is recorded in the publisher companion and retirement regression; no installed rollout or phone-latency cure is claimed.
