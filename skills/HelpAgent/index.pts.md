# HelpAgent skill

Defines the narrow read-only action root used by the Buffaly Help Agent.

## Purpose
Expose documentation-oriented tools to the Help Agent without granting the full default Buffaly action surface.

## Design notes
- Defines concrete descendants under `HelpAgentActionRoot` for wiki search/list/read, official Buffaly docs search/read, and LLM-backed web search.
- Design Decision: inheriting from `WikiSkillAction`/`LlmSkillAction` did not expose those sibling tools because agent root registration walks descendants of the configured root; the Help Agent needs its callable wrappers under `HelpAgentActionRoot`.
- Does not define setup/edit/install tools directly.

## Add Prompt Skill Email Walkthrough (2026-06-02)
- Expanded `HelpAgentActionRoot` description from read-only documentation assistance to documentation plus approved guided walkthroughs.
- Added `ToCreatePromptSkillInBuffalyWalkthrough` as the first approved PromptAction-backed Help Agent walkthrough.
- Design Decision: Help Agent owns walkthroughs directly, but only through explicitly registered prompt actions under its narrow action root.
- Added Help Agent wrappers for the existing Help page guided actions: initial ontology setup, teaching Buffaly something useful, first task creation, and first tool connection.
- Design Decision: Help page guided links now route to Help Agent, so every routed phrase needs an explicitly approved HelpAgentActionRoot prompt wrapper instead of relying on the broader Onboarding action root.

## Bind Email Walkthrough To Prompt File (2026-06-02)
- Replaced the inline `Execute()` body on `ToCreatePromptSkillInBuffalyWalkthrough` with PromptAction metadata (`IsPromptAction`, `SkillKind`, `SkillVersion`, and `PromptPath`) so the action loads the maintained walkthrough prompt file.
- Design Decision: walkthrough behavior should live in the prompt markdown file, not stale inline ProtoScript text, so future walkthrough refinements deploy by updating the prompt artifact.

## Add Morning System Health Dashboard Walkthrough (2026-06-02)
- Added `ToCreateMorningSystemHealthDashboardWalkthrough` as an approved PromptAction under `HelpAgentActionRoot` so the Help Agent can bind the Help page dashboard topic to its maintained prompt file.
- Updated the dashboard walkthrough prompt with a teaching-first response contract that starts with concept teaching, asks one focused confirmation question, and prevents dumping or completing the whole walkthrough in the first response.
- Design Decision: the dashboard walkthrough teaches orchestration and preview-first safety through a narrow Help Agent prompt action instead of broadening the Help Agent tool surface or restoring the reverted shared TooledAgent guard.

## Add Full Guided Walkthrough Progression (2026-06-02)
- Added six additional approved PromptAction-backed Help Agent walkthroughs: `ToCreateMorningSystemReportWalkthrough`, `ToCreateBasicCsvDownloadExportWalkthrough`, `ToCreateInMemoryDataFilteringWalkthrough`, `ToCreateInMemoryDatabasePipelineWalkthrough`, `ToCreateNativeCSharpDataTableAnalyzerWalkthrough`, and `ToImportCodexCoworkConversationWalkthrough`.
- Each new action points to a maintained prompt markdown file under `Skills/HelpAgent/Prompts` and uses semantic infinitive phrases that match the consolidated eight-item walkthrough progression.
- Design Decision: the Help Agent should own guided walkthroughs through explicit, narrow PromptAction registrations instead of receiving the full Buffaly action surface; implementation-heavy steps remain preview/confirmation based until the corresponding safe authoring tools are intentionally exposed.

## Add Write Professional Emails Save Action (2026-06-02)
- Added `ToSaveWriteProfessionalEmailsPromptSkillFromWalkthrough` as a narrow Help Agent action that creates or updates only the approved tutorial `WriteProfessionalEmails` Prompt Skill under `Nodes/Personal/PromptSkills`.
- The action wraps the existing `CoreOntologyTools.UpsertPromptActionArtifactsInCurrentProject` typed authoring path instead of giving Help Agent the broad prompt-action authoring surface.
- Design Decision: the first walkthrough should produce a real reusable Prompt Skill after confirmation, while custom edited variants still require a separate reviewed authoring path.

## Pin Help Agent Web Search Model Internally (2026-06-18)
- Changed `ToSearchWebWithLlmForHelp` to accept only a narrow public `question` instead of `modelName` plus `question`.
- Design Decision: Help Agent web research should not let the model choose or advertise the OpenAI model; `LLMs.ExecuteWebSearch(question)` owns the fixed service-side model policy.

## Align Walkthrough Prompt Actions with Prompt Root Pattern (2026-06-03)
- Added `HelpAgentPromptAction : PromptAction, HelpAgentActionRoot` as the dedicated base type for approved Help Agent guided walkthrough prompt workflows.
- Moved Help Agent walkthrough prompt actions and Help-facing onboarding prompt actions to inherit from `HelpAgentPromptAction` instead of directly mixing `PromptAction, HelpAgentActionRoot` on every concrete prototype.
- Design Decision: match the working Onboarding prompt-action root pattern so prompt skill execution can identify Help Agent walkthroughs as prompt actions while keeping them inside the Help Agent action surface; no C# changes were required.

## Mark Walkthrough Prompt Results As Non-Display Guidance (2026-06-03)
- Updated `HelpAgentPromptAction` with an explicit description that its `Execute()` result is private walkthrough guidance for the Help Agent to follow interactively, not a user-visible answer.
- Set `ResponseResultType = "status"` on the prompt-action root so generated tool schema no longer advertises inherited prompt-action output as a default display message.
- Design Decision: fix Help Agent smoke-test prompt leakage through ProtoScript action metadata and prompt-action surface guidance, without changing shared C# runtime behavior.

## Return User-Facing Walkthrough First Steps (2026-06-03)
- Added a Help Agent-specific `Execute()` override on `HelpAgentPromptAction` so approved Help Agent walkthrough prompt actions return polished first-step walkthrough markdown instead of the inherited raw `## Prompt Skill Instructions` payload.
- The override covers the approved walkthrough prompt paths with readable titles, progress indicators, early "What we're building" sections, and suggestion-chip fences for first-step choices.
- Design Decision: address the current smoke-test prompt-leak failure without changing shared C# runtime behavior or the global `PromptAction` contract; this keeps the fix scoped to Help Agent walkthrough actions.

## Basic CSV Download + Export Existing Demo Walkthrough (2026-06-04)
- Updated walkthrough #4 to ToRunBasicCsvDownloadExportWalkthroughSkill with phrases matching the Help page topic.
- Added MedicalCsvInMemoryDemo as a thin ProtoScript wrapper over deterministic C# helper methods for CSV download status, preview grids, filtering, clinic summaries, and CSV export fallback.

## Renderer-Bindable Medical CSV Methods (2026-06-04)
- Adjusted MedicalCsvInMemoryDemo preview/export methods to expose direct JSON object parameters for RunProtoScriptMethod binding while delegating to the C# helper JSON-string methods internally.

## No-Argument Renderer Methods (2026-06-04)
- Simplified MedicalCsvInMemoryDemo renderer-facing methods to no-argument methods because the staging RunProtoScriptMethod binder rejected JSON-bound primitive parameters; fixed views still delegate to deterministic C# helper filters/export.

## Fix Help Agent PromptAction Runtime Routing (2026-06-04)
- Removed fragile base HelpAgentPromptAction.Execute() branching on inherited PromptPath, which staging worker best-effort definition could not resolve.
- Added a specific Execute() to ToRunBasicCsvDownloadExportWalkthroughSkill so the Basic CSV walkthrough starts with useful human guidance and suggestion chips through the actual Help Agent route.

## Basic CSV Walkthrough Runtime Actions (2026-06-04)
- Added narrow Help Agent actions for loading the synthetic CSV, returning ProtoScriptPreviewGrid metadata for raw/Ready/clinic-summary views, and exporting the confirmed Ready view.

## Basic CSV Filtering Extension (2026-06-04)
- Added Help Agent ProtoScript grid actions for high-priority, Cardiology balance-due, next-30-days excluding cancelled, Medicare over $250, and Ready summary views.
- Added no-argument `MedicalCsvInMemoryDemo` wrapper methods so the `ProtoScriptPreviewGrid` renderer can call deterministic filtered views without relying on string argument binding.

## Basic CSV TableHandle Wiring (2026-06-04)
- Updated the sample-data load action to call `DownloadSampleCsvForScope(_opsAgent.GetSessionKeyOrEmpty())` so walkthrough downloads create session-scoped opaque table handles.

## Basic CSV Native DataTable Correction (2026-06-04)
- Updated `MedicalCsvInMemoryDemo` to expose native `DataTable` return/parameter methods for download, preview, filtering, summaries, and export.
- This supersedes the custom string handle registry and matches the documented In-Memory Data Filtering walkthrough pattern where ProtoScript passes object references between native tools.

## Native C# DataTable Analyzer First Page (2026-06-04)
- Added a specific first-step `Execute()` response for `ToCreateNativeCSharpDataTableAnalyzerWalkthrough` with progress, path, runtime C# emphasis, and suggestion chips.
- Replaced the walkthrough prompt guidance with the requested first-version flow for reviewing, confirming, compiling/loading, ProtoScript importing, running, and recapping the native analyzer.

## Basic CSV Opaque DataTable Walkthrough UX (2026-06-04)
- Replaced the visible Basic CSV launcher copy with an introduction-first walkthrough that emphasizes private in-memory DataTable operations, token savings, and model data isolation instead of database avoidance.
- Added renderer-safe walkthrough preview methods that construct the synthetic `DataTable` inside the live ProtoScript runtime call and pass it natively into deterministic C# preview/filter helpers, because `ProtoScriptPreviewGrid` metadata only carries JSON args.
- Updated the confirmed export action to write the Ready view into `artifacts/exports/basic-csv` under the active session directory so the Buffaly Files drawer can discover it.

## PromptAction Field Cleanup (2026-06-04)
- Removed redundant `IsPromptAction = true;` assignments from Help Agent prompt-action prototypes because the local ProtoScript contract does not expose that field on the inherited prototype shape.
- Kept `SkillKind`, `SkillVersion`, and `PromptPath` metadata on prompt actions while allowing the project compiler to resolve the inherited `PromptAction` base cleanly.

## Result Action Field Cleanup (2026-06-04)
- Removed redundant `IsPromptAction = false;` assignments from Basic CSV result-producing Help Agent actions because the local ProtoScript contract does not expose that field either.
- Preserved `ResponseResultType = "ProtoScriptPreviewGrid"` on grid actions so the UI still receives renderer metadata.

## ProtoScriptPreviewGrid Structured Args Payload (2026-06-06)
- Updated HelpAgent preview-grid result producers to emit `Args` as a `JsonObject` instead of `ArgsJson` string payloads.
- Design decision: `ProtoScriptPreviewGrid` has one authoritative result payload contract (`SessionKey`, `PrototypeName`, `MethodName`, `Args`, optional `Title`), and the grid-specific JavaScript serializes `Args` only at the generic `RunProtoScriptMethodAsync` service boundary.
## Install Capabilities Help Walkthrough (2026-06-07)
- Added `ToShowInstallCapabilitiesWalkthrough` as an approved Help Agent prompt action for the Help / Get Started link labeled "Show this install's capabilities".
- Design decision: the Help page uses `help-agent`, so the capabilities onboarding prompt must be reachable through `HelpAgentPromptAction` routing even though its prompt content lives with OnboardingSkill prompts.
## Install Capabilities First-Step Execute (2026-06-07)
- Added a narrow `Execute()` override on `ToShowInstallCapabilitiesWalkthrough` that returns the first user-facing capability-tour step.
- Reason: runtime smoke showed the route resolved but inherited the generic `HelpAgentPromptAction.Execute()` text; this action needs to launch the user-facing Navigation popup tour immediately.
## Install Capabilities Concrete Help Action (2026-06-07)
- Changed `ToShowInstallCapabilitiesWalkthrough` to inherit `HelpAgentActionRoot` directly while retaining prompt-style user-facing behavior.
- Reason: staging smoke showed semantic routing invoked the base `HelpAgentPromptAction` tool, returning generic status text; the install-capabilities Help page route needs a concrete callable action that returns the first guided step directly.

## Remove Duplicate Install Capabilities Workaround Route (2026-06-07)
- Removed the temporary `ToShowInstallCapabilitiesWalkthrough` HelpAgent route so the capabilities phrase is again owned by the normal Onboarding `PromptAction`.
- Reason: the prompt-instruction leak was caused by semantic preflight phase-2 short-circuiting PromptActions, not by the PromptAction route itself; keeping a duplicate concrete HelpAgent route bypassed the real architecture.



## Remove Host-Level Medical CSV Demo Helper (2026-06-09)
- Removed HelpAgent runtime action dependencies on Buffaly.Agent.Host.MedicalCsvInMemoryDemoFunctions.
- Replaced MedicalCsvInMemoryDemo with BasicCsvWalkthroughGrid, which composes CsvDataSourceFunctions and TabularDataFunctions for loading, filtering, sorting, grouping, previewing, and confirmed CSV export.
- Design decision: walkthrough-specific composition belongs in ProtoScript over shared tools, not in Buffaly.Agent.Host.

## Basic CSV Native DataTable Thin Wrappers (2026-06-13)
- Reworked the Basic CSV walkthrough action surface so HelpAgent convenience actions return native DataTable prototype references instead of ProtoScriptPreviewGrid metadata or preview JSON row payloads.
- Added a sample source helper for the local committed CSV path and made the URL helper report that no verified public GitHub raw CSV URL is configured yet.
- Kept named beginner filter/summary shortcuts as thin wrappers over shared CsvDataSourceFunctions and TabularDataFunctions, while the walkthrough prompt now directs broader filtering/sorting/selecting/describing work to the common TabularData actions.
- Design decision: HelpAgent may provide discoverable tutorial entry points, but tabular data operations and rendering should stay on the common DataTable/tooling path rather than duplicating preview or filtering behavior in the walkthrough layer.

## Configure Wiki Runtime Before Local Wiki Actions (2026-06-09)
- Added `WikiModule` and `RuntimeInstallRootFeature` imports to the Help Agent skill wrapper.
- Updated local Wiki list/read/search actions to call `WikiModule.Configure(RuntimeInstallRootFeature.GetRequiredAgentWebWikiRootPath())` before invoking `WikiServiceApi`.
- Design Decision: the web host configures WikiRuntime during web-module startup, but worker-side Help Agent actions can run in a separate runtime and must configure the installed Wiki root themselves before using direct Wiki service calls.


## Add Explicit TabularData Reference For Installed Compile (2026-06-15)

- Added an explicit `Buffaly.Agent.Tools.TabularData` assembly reference before importing `TabularDataFunctions` and `CsvDataSourceFunctions` so fresh installs compile without relying on preloaded tool assemblies.

## Use Project-Wide Shared Imports (2026-06-15)
- Removed local `Buffaly.Agent.Tools.TabularData` reference and local `RuntimeInstallRootFeature` import from the Help Agent skill wrapper.
- Design Decision: shared DLL references and install-root helper bindings belong in `OpsAgent/Imports.pts`; skill files should import the shared types without creating skill-local assembly resolution probes.
