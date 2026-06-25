# PromptActions.pts Change Notes

## 2026-04-11
- Moved solution-specific and environment-specific prompt workflows out of `Skills/VisualStudio` into personal solution slices and development-environment nodes.
- Left only the reusable `ToPublishDllsToDeployOnBuildSkill` prompt in the Visual Studio skill.

## 2026-04-06
- Added prompt action ToLaunchTailscaleBuffalySessionsWebDevelopmentSiteSkill with prompt asset LaunchTailscaleBuffalySessionsWebDevelopmentSite.prompt.md.
- Both actions are scoped to Visual Studio source-run development websites and explicitly return the working Tailscale HTTPS URLs rather than IIS aliases or intermediate HTTP redirect ports.
## 2026-04-07
- Removed the misleading infinitive phrase `to deploy buffaly to buffaly web server` from `ToDeployBuffalyAgentToBuffalyWebServerSkill`.
- Added prompt action `ToDeployBuffalyWebsiteToProductionBuffalyServerSkill` with prompt asset `DeployBuffalyWebsiteToProductionBuffalyServer.prompt.md`.
- The new prompt action is specific to Buffaly.Web deployment to `buffa.ly` and excludes Creator deployment sequencing.

