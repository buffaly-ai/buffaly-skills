# User.IFAccountingAdministrator.pts

## Entry contract
Restricted package-owned User graph for the existing IF accounting administrator profile. Root continues to use IFAccountingAdministrator.pts unchanged. Reuse the administrator's User CRM graph, private Nodes/Personal mount and existing profile prompt/context; add only the opted-in FeedingFrenzyUserAccounting facade and generated IF accounting definitions. Other role entries and shared User.Imports remain unchanged.

## 2026-11-21 — Supply the missing IF User entry
The installed IF profile had no UserProjectFilePath, so new accounting launches could not select genuine User composition. This entry adds a file-local FeedingFrenzy.Agent.Tools reference/import for the native accounting facade, then the existing shared administrator graph and the three generated accounting files. An import in this entry requires its own reference; an included file's reference is insufficient. Generated wrappers preserve twelve action names/signatures/descriptions while moving credential-bearing work to native per-session state.

Actual verification: full module tests 108/108 with explicit Build 1564 SDK; generator currency for twelve actions; retained Build 1564 strict composition compile 334 statements/zero diagnostics/no DB calls. The first copied fixture entry was stale and lacked the explicit reference, causing fourteen diagnostics; after syncing only this source entry, final strict compile passes. Isolated CreateForProject creates all 185 symbols but reports two service Initialize-not-declared skip notices (general admin baseline has one), so its strict no-notice harness returns 6. This is not live startup/binding/tool proof. No installed project or production profile was changed by this source batch.

## 2026-11-24 — Unified User workspace v1 design proposal

Include the same User.Workspace.Shared.pts before the existing private mount while preserving all existing CRM role imports/actions and profile ownership. Change IDs: C4,C5. Required acceptance: T1,T10,T12,T15.

Validation: proposed code only. Nonmutating patch and syntax checks are recorded in the design package; application compilation, runtime/provider/security tests, publication and deployment are not run. Preserve this design entry and append actual results before implementation delivery.

## 2026-11-24 — Implement shared User workspace composition

Includes the same portable shared User workspace before the private mount, retaining the existing administrator and twelve accounting actions, native imports, authenticated role profile and Root composition. No accounting-specific private filesystem owner is added.

Actual validation: BuildOnly publication against isolated current core SDK succeeded. Administrator, SalesRepresentative and this IFAccountingAdministrator packaged entry each strictly compile using actual UserSourceComposition with zero diagnostics and committed Recall/image facades in artifact-only module paths. Thirteen exported common files are pinned to core 586bbfabc94b95521981a1a03f8ad702aa316ac6. No live accounting action, provider call or installed User acceptance is claimed by this batch.
