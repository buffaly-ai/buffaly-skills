# Calendar.pts

## 2026-09-08 — N01 request-construction repair
- Creation delegates JSON construction to GoogleWorkspaceServiceHost.BuildCalendarEventJson, passing every scalar and attendeesJson. No raw text concatenation remains.
- Native constructor accepts empty optional attendeesJson or a JSON array of nonblank email strings. Other shapes fail explicitly; supported values, order and duplicates are preserved.
- Account/scope/calendar routing, existing facade response and nested date shapes are unchanged. No sendUpdates/notification policy change.
- Requires the matching native GoogleWorkspace library containing BuildCalendarEventJson; publish the paired native and skill changes together. Installed/published payloads were not edited or deployed by this change.
- Validated native constructor/parser with 17 offline regression cases and source wrapper argument/wiring checks; deployed ProtoScript execution was not tested.
