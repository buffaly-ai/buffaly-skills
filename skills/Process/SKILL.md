# Process skill

## Finite commands and local browser QA

On Windows, ordinary command and PowerShell calls own their entire child process tree. All descendants end when the finite root returns, fails, times out, is stopped or loses its owning worker. `Start-Process`, `dotnet run` and another port are not persistent-preview contracts. Do not launch a server through a generic command and expect it to survive that command's return.

Use the existing `ToLaunchLocalDotNetWebAppForQa(projectDirectory, port, configuration)` for a built single-project app with Development environment and root GET 200 readiness. It returns a native `QaWebAppLease` (URL, PID, exact input fingerprint, deadline and unique log paths). It snapshots the runnable output and executes its DLL directly, without a `dotnet run` wrapper or workspace binary lock. Build explicitly before launch. The project content root remains the project directory.

Use `ToAcquireLocalDotNetWebAppForQa` with the typed `QaWebAppRequest` when an explicit launch profile, environment, tenant/isolation key, non-mutating readiness path/status or deadline is needed. Environment and content identity participate in reuse. Identical inputs reuse one healthy instance across workers; a different build/configuration cannot claim its port, and a matching app cannot silently multiply onto another port. Existing unmanaged listeners are never adopted or killed. Preserve deliberate tenant/build distinctions.

Release with `ToReleaseLocalDotNetWebAppForQa(LeaseId)` after checks. The actual runtime-finally boundary and session Stop also release validation leases, and the maximum validation deadline handles interruption (legacy entry point: 900 seconds; explicit request: 1..3600). Only the last lease stops the instance. For a requested human handoff, call `ToRetainLocalDotNetWebAppPreview(LeaseId, lifetimeSeconds)` before completing the turn; retention is explicit, at most 86400 seconds, and not based on HTTP idleness. Owner-worker exit still ends the job. Long-lived installed services and IIS sites remain separate existing workflows.

The canonical core action supersedes the old learned detached launcher; do not borrow an older session-local implementation with shared `qa-app.pid`/logs. Saved legacy definitions are not bulk rewritten. Once the finite runner is delivered, such raw detached launches cannot evade ownership, but callers must use the canonical QA action to obtain a usable cross-call preview. This source change is not an installed-runtime update.

## Remote SSM routing

Before any SSM execution, discover existing typed/domain-native tools and supported APIs with `ToSearchCandidateActions`. Inspect signatures/contracts, load appropriate tools with `ToLoadProtoScriptActionTool`, and prefer a suitable tool/API. Match the actual operation, target, required data and authorized scope; local filesystem tools do not read remote files.

SSM is a fallback only after establishing why alternatives cannot meet the need. Briefly state alternatives checked, their concrete limitations and why SSM is needed in the request/approval context—not in a new mandatory parameter or script comment. Weak search results, stale tool registration, a missing local file or a denied request do not establish that alternatives are unavailable.

Use the existing protected SSM sender when fallback is permitted. The rule also applies to interactive SSM, the fixed temp-directory initializer, legacy wrappers and SSM embedded in generic CLI/PowerShell/SDK execution. Do not bypass denial or API-only/no-SSM instructions through another route. Preserve exact-request approval, redaction, authorization and explicitly enabled auto-approval safeguards. This instruction grants no execution permission and does not change tool parameters or execution policy.

## Source and delivery
`index.pts` descriptions are canonical bundled tool help. `ToolRegistrar.BuildToolSchema` adds concise preflight guidance to SSM-labelled wrappers at registration, including lazy loading, without duplicating it on tools that already carry the exact instruction. The SSM-specific rule is not in the core master prompt or added to unrelated generic launch tools. This name/help classification selects advisory guidance only, never authorization. Publish from the registered owning Process package source and deliver the corresponding Host build through normal Provisioning. Existing cached tool schemas need re-registration/new runtime after delivery; this does not authorize an installed package edit or production restart.
