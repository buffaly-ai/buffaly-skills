# wwwroot/app.js

Generalized adaptation of the proven WorkflowWorkbench browser UI for bound run deep links. It preserves the prior shell and interaction model: skill tabs, sticky step navigation, live batch progress, collapsible exact-step detail, bound-output cards, artifact browsing, graph/raw views, and revision polling without pharmacy-specific workflow assumptions.

The blank route is a three-stage setup experience rather than a raw JSON prototype. Users search and select a package-owned prompt skill, receive input controls generated from that skill's JSON Schema, resolve and review the concrete prerequisite graph, then choose a unique run key and bind the exact Buffaly session before materialization. The proposal skill therefore exposes Lead ID/company fallback, website URL, and presenter mode as labeled controls; complex internal binding properties remain graph-owned rather than shown as raw JSON.

Setup fields prefer the descriptor `inputs` list parsed from the owner `index.pts`. When that list is empty, as with Analyze Existing Website for Improvements, the UI falls back to `inputSchema.properties` and hides graph-owned keys such as `sessionKey`, `sourceEvidencePaths`, `websiteAudit`, and `websiteAuditArtifacts`. The required-input banner and pre-resolve validation follow schema `anyOf` / `required` groups instead of assuming every skill is lead-only.

Workflow tabs map to package-owned graph nodes. Each node's persisted `stepDefinitions` and `stepResults` drive status and navigation. A step counts as complete when it has persisted `finalMarkdown` or a non-empty summary; typed receipt flags no longer control progress. Every step body and final markdown result is passed through the same sanitized Markdown viewer. Guidance remains scoped to that exact step, and discovered controlled files remain directly reviewable.

The batch primary action is always Run remaining steps or Batch running—it never changes into Stop because of stale paperwork. Paused batches can resume, and active-turn controls remain separate from sequencing.

When an overall result binds a `text/html` deliverable, the output card embeds it in a sandboxed responsive presentation iframe and retains an `Open full screen` action. Artifact URLs are served inline, so accepted step PNGs display in their cards instead of downloading or breaking, while users can still open any artifact in a separate tab.

The Workflow view loads a current package-owned prompt for the selected node and renders the complete prompt skill, not only executable steps. All owner work-prompt H2 sections appear in source order. The Workflow section keeps its verbatim preamble while replacing only the `### Step N:` bodies with live status-aware cards. Sections after Workflow remain visible, and the separate owner validation prompt is appended as a clearly labeled Validator Contract. The UI reads the current package prompt rather than persisted prompt text.

Each live step card uses its summary as the single visible step title. The Markdown viewer removes only the leading `### Step N:` heading from the card body before formatting it, while the compiled Markdown, prompt hash, execution instruction, persisted run data, and all `####` contract sections remain unchanged.

Prompt and artifact Markdown uses the same vendored `marked` v15.0.3 formatter as Buffaly timeline cards. The renderer escapes raw HTML tokens, then allowlist-sanitizes the generated DOM before insertion. GitHub-style pipe tables therefore render as semantic `table`/`thead`/`tbody` markup while scripts, event attributes, unsafe URLs, and unsupported elements are discarded. Table presentation uses the existing `.markdown table`, `th`, and `td` styles.

Batch commands display the server-returned status and current node in the activity banner. `Run remaining steps` is an explicit retry as well as a normal start: the server reopens eligible incomplete blocked nodes, while a true no-work condition is returned as a visible error rather than appearing to do nothing.

JSON commands now go through generated Feeding Frenzy-style stubs (`SkillCatalogService`, `SkillGraphsService`, `RunsService`, `ConnectionsService`, `PromptSkillsService`) loaded from `/JsonWs/*.ashx.js`. Artifact iframe and download URLs remain confined GET routes. Error banners prefer the documented `{ Error, Code }` envelope, then leftover camelCase or Problem Details `detail`/`title`.

Settings is a first-class view. Workflow/Artifacts/Graph/Raw must not re-enter Settings. An unsaved process-default Buffaly connection can still open the new-run setup page; Settings remains available to test and persist.

Every prompt action discovered in the configured Buffaly catalog can enter create-run. Selecting a card first loads the exact prototype into the already connected session. Exact Workbench descriptors are optional overlays: overlay-backed actions retain their structured fields, schemas, prerequisite graph, and compiled steps; descriptorless actions show one free-form **Instructions and inputs** textarea and resolve to a generic single-step `protoscript-action/v1` node. The free-form text is persisted as the run's `instructions` input and therefore appears in Prime, execution, export, and audit history. Empty remote titles fall back to a readable prototype name.

## 2026-08-14 - Raw prompt skill source

The run view now includes a Raw Prompts tab for the selected graph node. It reuses the existing hash-checked `GetNodePrompt` path rather than performing another catalog or runtime lookup, renders the work and validation prompt text verbatim through escaped `<pre>` panels, and displays each package-owned source path with its SHA-256 value so reviewers can verify exactly which prompt skill source is bound to the run.

## 2026-08-14 - Add another skill to a bound run

Settled bound runs reuse the original searchable remote Buffaly skill catalog instead of a separate local-descriptor dropdown. Selecting an item passes its ProtoScript prototype directly to the run's already-bound session and loads it there. Workbench-described actions retain their specialized compiled steps; any other loadable action gets one generic execution step. Adding a skill keeps the same session and all prior node results/artifacts, makes the selected action the current independent root, and requires Prime again because the run's action set changed. This deliberately relies on prior artifacts and context already present in session history rather than introducing continuation or artifact-input mapping contracts.

All picker chrome uses encoding-stable ASCII: `+` / `-` status markers and `>` navigation markers. This covers both the original new-run picker and Add Skill, preventing their visible controls from becoming mojibake across source, build, and browser encoding boundaries.

## 2026-08-15 - Reload current skill workflows

New-run setup exposes **Reload skills** after the Buffaly session connects. It refreshes both the runtime prompt-action catalog and package-owned Workbench descriptor catalog, then clears stale `descriptor`, `resolution`, and selected-skill state. The user must reselect the skill so setup and graph review are built from one current contract.

Existing bound runs expose **Reload skill workflow** for the selected node. After explicit confirmation, it rematerializes that node from the latest package descriptor and prompt, clears only that skill's incompatible step results and overall output, retains other skills and their artifacts, invalidates Prime/final-validation state, and requires Prime again before execution.

## 2026-08-15 - Distinguish stalled batches from active work

The run UI treats the server-owned `activeOperation.health` value as the liveness authority. Healthy operations continue to show **Batch running** and retain the non-destructive **Pause after current step** control. When worker recovery records the operation as `stale`, the progress banner shows **Batch stalled** and the existing primary button becomes **Stop batch**. Stop performs one atomic server transition; it never couples Pause to failure. After stop, the blocked node suppresses ordinary Resume and **Run remaining steps** remains the explicit retry path that reopens the blocked step.

## 2026-08-15 - Open the bound Buffaly session

 The run details bar still shows the bound session key. When the run has both a session key and a usable UI origin, that value becomes a link to `{uiOrigin}/buffaly-agent-next.html?sessionKey=...` instead of a read-only input. The origin comes from frozen or current Settings `publicUiOrigin`, then optional local `workbench-config.local.json`, then a non-loopback `baseUrl`. The shared client never hard-codes a hostname or Buffaly UI port. Spaces in the session key use `+`. Missing either value keeps the original input so an unbound or loopback-only page does not invent a URL.
