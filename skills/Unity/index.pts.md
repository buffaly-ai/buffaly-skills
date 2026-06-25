# UnityInteractionSkill ProtoScript Glue

## 2026-06-24 - Create UnityInteractionSkill as first-class Buffaly skill

Created `index.pts` with:
- `UnitySkillAction` base action type (extends `OpsAction`)
- `UnityInteractionSkill` skill entity (extends `SkillEntity, CoreEntity`)
- 14 callable actions across 4 phases (primitives, mid-level, high-level, advanced)
- TCP JSON protocol helpers (`ToUnitySendCommand`, `ToUnitySendCommandBatch`)
- `ToRunUnityDemo` end-to-end test action

Protocol: TCP newline-delimited JSON on port 7777 (WebSocket failed in Unity Mono runtime).
Unity host: `C:\dev\Buffaly.Unity\Build\UnityHost.exe` (batch mode, no graphics).