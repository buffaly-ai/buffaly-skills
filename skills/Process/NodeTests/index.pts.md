# NodeTests/index.pts history

## 2026-10-18 — global discovery without startup exposure
- Added ToRunNodeTestFile as a thin ProcessSkillAction forwarding to typed NodeTestTools. Authored via ProtoScriptPrototypeUpsertTools parse/upsert against source project; do not edit installed output.
- NodeTests/index.pts.lazy.json advertises its canonical name/phrase; Process index declares it lazy. No CoreAction or CodingContext parent and no profile/default-tool changes.
- Validation: 26/26 Utility.Tests, including actual parser, published sidecar discovery with action absent before activation, explicit load, Node execution through actual wrapper, native success/failure/timeout/cancellation. Production semantic DB indexing/installed activation not performed.
