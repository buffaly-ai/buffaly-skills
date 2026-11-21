# Session.Edit.ks.html history

## 2026-11-21 — Shared parent candidate picker

Use existing edit-template hooks to link the same key to Session Details instead of adding a third picker. Inspected SimpleObjectEdit hook and generated object name; installed route and Admin-save readback were not exercised.

## 2026-11-21 — Bind Save to the Sessions Admin edit operation

- Use the shared `SimpleObjectEditPage.UpdateMethodName` hook to call generated `Sessions.UpdateSessionFromAdminObject`. Retain the shared form, validation, Data-document merge, success redirect, and the link to the corresponding session Details. The projected edit request cannot submit session name or parent.
- The live original editor returned HTTP 400 (`Missing argument 'SessionName'`). The nonparallel Release build, compiled JsonWs generation and actual generated-client Node contract test passed. The latter proves the exact payload (including Data and archive false) and rejects an invalid record ID. Successful installed Save and persisted readback still require the successor deployment. The preexisting handoff itself was verified on Sessions module 0.1.340 in Root.
