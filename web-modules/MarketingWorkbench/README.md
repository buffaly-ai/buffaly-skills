# Marketing Workbench

Package-managed Buffaly **connector** WebModule. The existing GeneralSkillWorkbench service must already be running; this package does not bundle, start, proxy, or migrate its execution engine or data.

## Configure before installation/use
Set `MarketingWorkbench:WorkspaceUrl` in the target web host configuration (environment equivalent `MarketingWorkbench__WorkspaceUrl`). Example for this development deployment: `https://win.tailf78e41.ts.net:5310/workspaces/marketing`. No machine address is defaulted in code. Use HTTPS when Buffaly is HTTPS, with a certificate trusted by the user's browser. Ensure the workbench permits embedding from the Buffaly origin. If its frame policy blocks embedding, use Open in new tab. Authentication stays with the workbench; no credentials are stored in this package.

Install via the canonical Extension Publishing/Skill Management WebModule flow, identity `MarketingWorkbench`. Manifest registers `/web-modules/MarketingWorkbench/index.html` and `marketing-workbench-module`. No session sidebar code is modified. The module requires the host's compatible `Buffaly.Agent.Web.Common` assembly; that shared DLL is intentionally not packaged.

## Ownership and prerequisites
GeneralSkillWorkbench retains its configured DataRoot, connection settings, immutable run bindings, deck references and artifact delivery security. Marketing skill packages must be installed separately; module visibility does not prove those prototypes are installed. No ProjectArtifacts are supplied and no installed skills are overwritten.

Build package: `scripts/build_marketing_workbench_web_module.ps1`. Install preparation does not authorize restarting Matt-local. First installation/runtime validation must use normal package management and an explicitly approved host lifecycle window if needed.
