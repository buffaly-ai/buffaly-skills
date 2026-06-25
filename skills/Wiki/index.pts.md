# Wiki skill

Defines the `WikiService` singleton service plus the `WikiSkill` prompt-workflow skill entity for Buffaly wiki workflows.

## Purpose
Provide a clean ProtoScript surface for:
- creating wiki articles,
- refreshing wiki articles,
- auditing wiki coverage,
- repairing wiki cross-links,
- returning the wiki root path,
- resolving a wiki article file path,
- listing wiki article file paths.

## Design notes
- Prompt-based workflows remain in `PromptActions.pts`.
- The `WikiSkill` entity now points at prompt workflows only so the operational wiki tools no longer pollute the global tool namespace as standalone action prototypes.
- ProtoScript should stay as a thin wrapper over wiki-owned contracts.

## Move Wiki Skill To Direct Buffaly.Agent.Wiki DLL Calls (2026-04-17)
- Removed the host bridge import from the skill and switched the singleton service methods to direct `Buffaly.Agent.Wiki.WikiModule` and `Buffaly.Agent.Wiki.WikiService` calls.
- Updated `Initialize()` to configure `WikiModule` from `JsonWsHelper.ResolveWorkerContentRootPath()` so startup uses the shared worker/web settings path instead of host-owned facade resolution.
- Kept action surface compatibility (`ToGetWikiRootPath`, `ToGetWikiArticlePath`, `ToListWikiArticlePaths`, `ToSearchWiki`) while preserving typed request-contract usage end-to-end.
- Design decision: wiki ownership stays module-local with thin ProtoScript wrappers and no host bridging layer.

## Simplify Wiki ProtoScript Wrappers Further (2026-04-17)
- Removed ProtoScript-side validation and path/list transformation logic from `WikiService` so wrappers delegate directly to module-owned methods.
- Returned structured wiki results as native typed contracts instead of serializing them inside ProtoScript.
- Design decision: ProtoScript should not perform business logic or defensive checks for wiki operations; it should only bridge inputs and outputs.


## Convert Wiki Direct Wrappers To Nested Action Prototypes (2026-04-17)
- Replaced the direct `WikiService` helper functions with nested `WikiSkillAction` prototypes that expose `Execute(...)` methods, infinitive phrases, descriptions, and native typed returns.
- Kept `WikiModule.Configure(...)` as the only service initialization behavior while moving tool-callable wiki operations onto the normal prototype/action surface.
- Design decision: direct wiki tools should follow the standard OpsAgent prototype pattern so they load and execute like other tools instead of hiding behind non-projectable service functions.

## Use Agent-Web Wiki Root In Worker Context (2026-05-25)
- Updated `Initialize()` to derive `<install-root>\app\agent-web\wwwroot\Wiki` from `RuntimeInstallRootFeature.GetRequiredInstallRootPath()` instead of `JsonWsHelper.ResolveWorkerContentRootPath()`.
- Design Decision: Wiki ProtoScript tools must use the existing Runtime Feature install-root contract and must not put web-module-specific path logic in generic JsonWs helpers or recreate a duplicate worker-config Wiki root.

## Use Typed Agent-Web Wiki Root Resolver (2026-05-30)
- Updated `Initialize()` to call `RuntimeInstallRootFeature.GetRequiredAgentWebWikiRootPath()` instead of concatenating installed path segments in ProtoScript.
- Design Decision: the installed wiki path is a typed runtime contract with directory validation; ProtoScript remains a thin wrapper over wiki-owned services.

## Add Help Agent Read Tools (2026-05-31)
- Added ToReadWikiArticle, ToSearchBuffalyDocs, and ToReadBuffalyDoc as thin typed wrappers over WikiService.
- Design Decision: Help Agent should read sources before answering and should search official Buffaly docs as a first-class documentation source.

## Decouple Wiki Skill Root From Prompt Action Include Order (2026-06-15)

- Changed `WikiSkill.ActionRoot` to `WikiSkillAction` so the service skill entity no longer depends on `WikiPromptAction` include order during installed project compile. Prompt actions remain included by `Skills/index.pts`.

## Use Project-Wide Runtime Install Root Import (2026-06-15)
- Removed the local `RuntimeInstallRootFeature` import from the Wiki skill wrapper.
- Design Decision: the install-root helper is now imported once from `OpsAgent/Imports.pts`, avoiding duplicate skill-local assembly diagnostics.
