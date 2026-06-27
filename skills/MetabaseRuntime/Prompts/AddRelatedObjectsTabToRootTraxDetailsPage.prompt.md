# To add a Related Objects tab to a RootTrax details page

Use this guide when a SimpleObjectDetails page should include child objects (for example Session -> Messages).

## Canonical pattern
1. In `<Object>.Details.ks.html`, redefine `SimpleObjectDetailsPage.DetailsTabs`.
2. Add a tab object with:
   - `Title` (user-facing tab title)
   - `ControlID` (for example `tab-Messages`)
   - `Content` from `GetRelatedObjectTab`.
3. In `SimpleObjectDetailsPage.AdditionalScripts`, call `GetRelatedObjectTabInitializer`.

## Minimal kScript shape
- Tab declaration:
  - `(declare tabMessages {Title : "Related Objects", ControlID : "tab-Messages", Content : "" })`
  - `(tabMessages.Content (GetRelatedObjectTab Messages "Messages" true))`
  - `(tabs.push (tabMessages))`
- Initializer:
  - `(GetRelatedObjectTabInitializer Messages {AllowSearch: true, MetaFile:'Messages/Messages.Meta.json', JsonWsGridMethod:'GetGridBySessionIDHtml', JsonWsCountMethod:'GetGridBySessionIDCount', ObjectIDName:'SessionID' })`

## Required backend methods
The related object admin JsonWs type must provide methods matching initializer names:
- `GetGridBy<ParentObject>IDHtml`
- `GetGridBy<ParentObject>IDCount`

Example for Session -> Messages:
- `MessagesAdmin.GetGridBySessionIDHtml(...)`
- `MessagesAdmin.GetGridBySessionIDCount(...)`

## Reference projects to inspect
- FairPath Device details examples using `GetRelatedObjectTab(...)` and `GetRelatedObjectTabInitializer(...)`
- Any RootTrax details page that defines multiple bottom tabs via `GetTabs(tabs)`.

## Verification checklist
1. Open object details page and confirm the `Related Objects` tab renders.
2. Confirm tab grid calls the intended JsonWs endpoint/method names.
3. Confirm non-empty data loads and row click behavior works.
4. Confirm there are no JS console errors and no 404 on JsonWs scripts.