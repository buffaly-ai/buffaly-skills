# History

## 2026-04-21
- Removed the direct token-file read / PowerShell REST send path from Google Workspace chat send operations.
- Routed chat message sending through ChatFacade.SendMessageAsync(...) so ProtoScript no longer depends on local token-file storage.
- Design Decision: keep chat token handling inside the Google Workspace facade/service layer once token persistence moved behind the feature-backed DataStore.