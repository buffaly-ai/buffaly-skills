# User.IFAccountingAdministrator.pts

## Entry contract
Restricted package-owned User graph for the existing IF accounting administrator profile. Root continues to use IFAccountingAdministrator.pts unchanged. Reuse the administrator's User CRM graph, private Nodes/Personal mount and existing profile prompt/context; add only the opted-in FeedingFrenzyUserAccounting facade and generated IF accounting definitions. Other role entries and shared User.Imports remain unchanged.

## 2026-11-21 — Supply the missing IF User entry
The installed IF profile had no UserProjectFilePath, so new accounting launches could not select genuine User composition. This entry adds a file-local FeedingFrenzy.Agent.Tools reference/import for the native accounting facade, then the existing shared administrator graph and the three generated accounting files. An import in this entry requires its own reference; an included file's reference is insufficient. Generated wrappers preserve twelve action names/signatures/descriptions while moving credential-bearing work to native per-session state.

Actual verification: full module tests 108/108 with explicit Build 1564 SDK; generator currency for twelve actions; retained Build 1564 strict composition compile 334 statements/zero diagnostics/no DB calls. The first copied fixture entry was stale and lacked the explicit reference, causing fourteen diagnostics; after syncing only this source entry, final strict compile passes. Isolated CreateForProject creates all 185 symbols but reports two service Initialize-not-declared skip notices (general admin baseline has one), so its strict no-notice harness returns 6. This is not live startup/binding/tool proof. No installed project or production profile was changed by this source batch.
