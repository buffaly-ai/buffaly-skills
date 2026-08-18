> VALIDATED PROMPT ACTION ONLY
>
> Do not run this markdown file directly as ordinary prompt guidance.
> This prompt must be executed through the corresponding ProtoScript `ValidatedPromptAction` so the validation prompt runs after the work turn.
> If you are an agent, call the action/tool instead of loading this file directly.

# Create Website Analysis Sales Packet

## Purpose
Create a complete sales-rep-ready packet from an evidence-based website analysis. The packet combines the completed website audit, competitor analysis, client-facing report, proposal deck, screenshots, optional demo website assets, and a simple handoff manifest into one organized artifact folder and ZIP file.

This is a master workflow. It calls the required component functions, verifies their validated results, and then packages the sales materials.

## Standard artifact order and one-artifact mode

Default artifact order:
1. Evidence-backed website report.
2. Competitor analysis for the local and surrounding market.
3. Demo website direction.
4. Annotated improvements screenshot or handoff.
5. Proposal deck using demo screenshots, annotated improvements, and competitor positioning.
6. Sales packet landing page, manifest, README, and ZIP.
7. Deployment to the demo host when requested.
8. Outreach email when requested.

If the user requests one artifact at a time, honor that mode. Do not generate later artifacts until the current artifact is complete or the user advances, but preserve prerequisite evidence and intermediate assets needed for the next artifact.

Before creating a demo or proposal deck, decide and document the visual direction: preserve existing site style/template, inspired by existing site but polished, or full redesign/new concept. If the user asks to reuse existing styles/images or keep the look and feel, default to preserving the existing style unless they later request a separate inspired/polished branch.

## Required per-step validation evidence

The packet must not rely only on one final summary validation. Each packet component must produce explicit validation evidence before the packet can pass.

When a component is generated, repaired, reused, or explicitly deferred, create a component validation record under:

- `component-validations/`

Required records for a full packet are:

- `component-validations/website-analysis-validation.json`
- `component-validations/client-facing-report-validation.json`
- `component-validations/competitor-analysis-validation.json`
- `component-validations/demo-website-validation.json`
- `component-validations/annotated-improvements-validation.json`
- `component-validations/proposal-deck-validation.json`
- `component-validations/staging-deployment-validation.json` when publishing/deployment is requested

Each component validation record must include:

- component name;
- exact callable function name required for the component;
- whether that exact function was called;
- child session key or correlation ID returned by the call;
- work-turn and validation-turn IDs when available;
- validated-action status and attempt count;
- whether the artifact was reused, repaired, regenerated, deferred, or blocked;
- status: `passed`, `failed`, `deferred`, or `blocked`;
- artifact paths validated;
- artifact hashes when practical;
- objective checks performed;
- subjective/customer-visible quality checks performed when applicable;
- screenshot or public URL evidence when applicable;
- validation timestamp;
- retry/blocker feedback when not passed.

When a required callable function is listed for a component, you MUST call that exact function. Mentioning the function, reading its prompt file, manually performing an equivalent workflow, or writing a component validation record does not satisfy this requirement.

Do not describe a manual workflow as an `equivalent` execution of the required function.

If the required function cannot be resolved, loaded, or called:
1. Record the discovery and loading attempts.
2. Mark the component `blocked`.
3. Explain the exact runtime failure.
4. Do not mark the component or packet `passed`.

An existing artifact may be supplied to the required function as source material when supported, but the required function must still run and validate the artifact. Reuse alone does not waive the function-call requirement.

The final packet validation must include or reference these component validation records. If a component is intentionally deferred because the user requested one-artifact mode or skipped publishing, the record must say so explicitly and explain why deferral is acceptable.

## Prerequisite function
Before generating packet components, you MUST call:

- `ToAnalyzeExistingWebsiteForImprovementsSkill`

Do not substitute a manually performed audit or an "equivalent workflow" for this call. If prior audit evidence exists, provide it to the function as source material when supported. The function must still execute and return a passing validation result for the current packet run.

Do not proceed to packet generation unless the function has passed and the audit evidence exists.

## Required component function calls
This is the master workflow. When a user asks for a sales packet, website review sales packet, sales packet for SEO, SEO proposal packet, Website Growth Demo packet, or to analyze a website and create the sales packet, route here first.

This workflow is responsible for calling every required component function. Do not make the user request these functions separately. For a full packet, you MUST call each required function below as an actual tool/function call:

0. Website analysis / audit prerequisite
   - MUST call `ToAnalyzeExistingWebsiteForImprovementsSkill`.
   - This function must pass before downstream generation starts.

1. Client-facing report generation
   - MUST call `ToCreateClientFacingWebsiteReportSkill`.
   - This function must return a passing validated result.

2. Website growth proposal deck generation
   - MUST call `ToCreateWebsiteGrowthProposalDeckSkill`.
   - Do not call it until the report, competitor analysis, demo, and annotated-improvements inputs are ready.
   - This function must return a passing validated result.

3. Demo website generation
   - MUST call `ToBuildDemoWebsiteFromAnalysisSkill`.
   - This function must return a passing validated result.

3a. Annotated improvements handoff
   - Create an annotated screenshot or annotated handoff page after the demo direction is selected.
   - Map visible demo improvements to the analysis, such as brand continuity, stronger local hero/message, service clarity, CTA improvements, appointment/contact path, retained original assets/content, helpful answers/FAQ, local trust/contact clarity, and mobile action path.
   - Include this asset in the proposal deck, packet landing page, and sales-rep README when available.

3b. Competitor analysis artifact
   - Create `competitor-analysis/competitor-analysis.md` and, when practical, `competitor-analysis/competitor-analysis.html` from public evidence.
   - Identify the top actual competitors, not only generic SEO/lead-generation pages. If search competitors and actual business competitors differ, separate them clearly.
   - Cover the prospect's local market first, then surrounding regional/state markets when relevant.
   - Compare each competitor against the prospect on service overlap, local relevance, SEO/page structure, proof/trust signals, calls to action, content depth, and visible weaknesses.
   - Include a ranked summary of where the prospect stands today and what must improve to outrank or out-position the competitors.
   - Include this artifact in the client-facing report when safe, the proposal deck, packet landing page, sales-rep README, audit evidence, and manifest.

4. Staging deployment, only when publishing is requested
   - MUST call `ToDeployGeneratedDemoWebsiteToFeedingFrenzyStagingSkill` after local packet generation when the user asks for publication.

5. Client outreach email, only when requested
   - MUST call `ToDraftClientDemoEmailSkill` when the user requests an outreach email.

The following do not count as calling a required function:

- reading or referencing its markdown prompt;
- copying an artifact from a previous run;
- manually reproducing some of its instructions;
- writing `equivalent` in the component record;
- creating a record that names the function without invoking it;
- claiming the component was independently validated without runtime call evidence.

If any required function does not execute successfully, the full packet must not be reported as passed.
   - Use after packet/demo generation when the user asks for a client email.

## Feeding Frenzy staging deployment
When the user asks for the packet or demo site to be published for review, deploy the complete packet to the Feeding Frenzy staging website rather than leaving it only in the agent session artifacts.

Authoritative prompt/guidance:
- `C:\inetpub\wwwroot\matt.buffaly.local\content\projects\OpsAgent\Nodes\Personal\Marketing\Prompts\DeployGeneratedDemoWebsiteToFeedingFrenzyStaging.prompt.md`

Follow that prompt first. The summary below is only a compact reminder of the current known deployment pattern.

Known demo staging target:
- Site name: `demos.feedingfrenzy.ai`
- Public URL pattern: `https://demos.feedingfrenzy.ai/<client-slug>/`
- Remote physical root on the public Windows EC2 server: `C:\inetpub\wwwroot\ff\demos.feedingfrenzy.ai\wwwroot`
- AWS region: `us-west-2`
- Current known AWS SSM instance id: `i-050e51c92f600cf65`
- Expected remote host from probe: `EC2AMAZ-HL17G4A`

Preferred staging packet location:
- Publish to the remote EC2 server so the packet or generated demo lives under the top-level slug folder: `<remote-demo-root>\<client-slug>\`.
- Do not satisfy this workflow by copying to a local agent-machine path that happens to look like `C:\inetpub\wwwroot\ff\demos.feedingfrenzy.ai\wwwroot`.
- Existing working examples use top-level folders such as `/insurance-associates/` and `/lead-funnel-poc/`. Do not assume nested `/sales-packets/<client-slug>/` routes are served.

Do not overwrite other client packets. Always use a client-specific slug folder.

Repeatable publish process:
- Build a package root containing `index.html` and `<client-slug>/...`.
- Zip the package root contents, not the parent folder.
- Upload the zip to a transfer location reachable by the public server, normally S3 with a presigned URL.
- Use AWS SSM in `us-west-2` to run PowerShell on the public server. Verify the remote root exists before expanding the zip.
- Expand the zip into `C:\inetpub\wwwroot\ff\demos.feedingfrenzy.ai\wwwroot` on the remote EC2 server.
- Validate `https://demos.feedingfrenzy.ai/<client-slug>/`.

Recommended staging index:
- Ensure the packet folder contains an `index.html` that acts as a sales packet landing page.
- The landing page should link to the client-facing report PDF, proposal deck PDF, demo site `index.html` if present, `README-sales-rep.md`, evidence folder, manifest, and ZIP.

Staging validation:
- Confirm the files exist under the physical path.
- Fetch the staging packet URL and verify HTTP 200.
- Fetch key linked files such as the client report PDF, proposal deck PDF, and demo site index.
- Record staging URLs in `manifest.json` and `README-sales-rep.md`.

## Output package goal
Create one folder and one ZIP archive that a sales rep can use to approach the lead.

Recommended folder:
- `artifacts/<client-slug>-website-analysis-sales-packet/`

Recommended ZIP:
- `artifacts/<client-slug>-website-analysis-sales-packet.zip`

## Package contents
The final packet should include:

1. `README-sales-rep.md`
   - Plain-English handoff for the sales rep.
   - Who the lead is.
   - What was reviewed.
   - Strongest opening angle.
   - Top website problems to mention.
   - Top rebuild fixes included.
   - Proposed ongoing monthly add-on, if applicable.
   - Links/paths to the client report and proposal deck.
   - Compliance/accuracy reminders.

2. `client-report/`
   - Client-facing HTML report.
   - Client-facing PDF report.
   - Must not contain internal sales language.

3. `proposal-deck/`
   - Proposal deck HTML.
   - Proposal deck PDF.
   - `screenshots/` folder used in the deck.
   - May include proposal scope and monthly package details.

4. `competitor-analysis/`
   - Competitor analysis markdown.
   - Competitor analysis HTML or PDF when practical.
   - Source/search notes and inspected competitor page summaries.
   - Ranking of top actual competitors and separate notes for SEO-only/lead-generation search competitors when relevant.

5. `audit-evidence/`
   - Original audit markdown.
   - Extracted evidence JSON/text files.
   - robots/sitemap evidence.
   - image URL/source lists, if any.

6. `demo-site/` (optional but recommended when available)
   - Static demo website HTML/CSS/assets.
   - Image map/source map if images were downloaded.

7. `manifest.json`
   - Machine-readable index of files, client, URL, date, source audit path, outputs, and validation status.

8. `index.html`
   - Sales packet landing page for staging review.
   - Link to the client report PDF and client report HTML when both are available.
   - Link to the proposal deck PDF and proposal deck HTML when both are available.
   - Link to the competitor analysis, demo site, sales-rep README HTML/TXT, evidence, manifest, and ZIP.
   - This landing page is the sales rep's entry point and should make the PDF, HTML, and ZIP versions obvious.
   - Include a short opening angle, suggested review order, and plain-language explanation of each artifact.

9. `sales-assets/` or equivalent
   - Annotated improvements image/handoff.
   - Current/demo screenshots used by the proposal deck.

## Required inputs
- Client/business name
- Client slug
- Website URL/domain
- Business category
- Source audit markdown path
- Evidence artifact paths
- Competitor analysis path and competitor evidence/source notes
- Optional demo site path
- Optional current/demo screenshot paths
- Base program name, if a monthly add-on is being proposed, e.g. `FairPath`
- Monthly add-on price, e.g. `$500`
- Top rebuild fixes selected from the audit
- Sales-rep handoff notes

## Workflow

### Step 1: Resolve packet identity and required inputs

#### Inputs

- Client or business name, website URL or lead identifier, and any user-requested artifact mode from this Workbench run.
- Prior Buffaly session artifacts when a session is already bound.

#### Instructions

- Resolve `companyName`, `websiteUrl`, optional `leadId`, optional `sessionKey`, client slug, business category, and whether the user requested one-artifact mode, publishing, or outreach email.
- Do not invent a website, location, or business category. Record unresolved identity facts instead of guessing.
- Decide the packet scope: full packet, one-artifact mode, or an explicitly deferred later component.
- Confirm that Workbench prerequisite nodes for audit, client-facing report, and growth proposal deck are the source of those artifacts. Do not silently substitute a manually rewritten equivalent.

#### Outputs

- `packetIdentity`: Canonical client name, slug, website URL, category, and requested scope.
- `unresolvedInputs`: Missing facts that block packaging, with the evidence needed to resolve each item.
- `requestedMode`: Full packet, one-artifact, publish-requested, or email-requested.

#### Acceptance Criteria

- The official website or lead identity is confirmed or the run is explicitly limited because it cannot be confirmed.
- Missing facts are listed rather than invented.
- The requested packet mode is recorded before any packaging starts.

### Step 2: Confirm prerequisite audit, report, and deck artifacts

#### Inputs

- Step 1 packet identity and requested mode.
- Completed Workbench prerequisite artifacts for `ToAnalyzeExistingWebsiteForImprovementsSkill`, `ToCreateClientFacingWebsiteReportSkill`, and `ToCreateWebsiteGrowthProposalDeckSkill`.

#### Instructions

- Confirm the website audit, client-facing report, and proposal deck already exist from the bound prerequisite nodes or a prior validated run for the same identity.
- Do not create the final audit, report, or deck inside this packaging skill. Those owned functions must have already passed.
- Collect source audit markdown, evidence files, client-report HTML/PDF, and proposal-deck HTML/PDF paths.
- If a required prerequisite artifact is missing, mark that component `blocked` and stop packaging rather than writing a fake validation record.

#### Outputs

- `prerequisiteArtifactIndex`: Paths and hashes for the audit, client report, and proposal deck.
- `component-validations/website-analysis-validation.json`
- `component-validations/client-facing-report-validation.json`
- `component-validations/proposal-deck-validation.json`

#### Acceptance Criteria

- The audit, client report, and proposal deck paths exist and belong to the current identity.
- Each required component validation record names the exact function and whether it already passed in this graph.
- A missing required artifact blocks the packet instead of being marked passed.

### Step 3: Document visual direction and brand palette

#### Inputs

- Step 1 packet identity.
- Step 2 current-site audit evidence and any existing demo artifacts.

#### Instructions

- Document whether the work preserves the existing site style, is inspired-but-polished, or is a full redesign.
- Inspect the current website and any approved demo for CSS variables, logo colors, header/button/hero colors, and repeated hex values.
- Record a reusable palette: `Primary`, `Secondary`, `Accent`, `LightBackground`, `Ink`, `Muted`, and `White`.
- Apply the same palette later to the packet landing page and any packaging chrome. Do not invent a second unrelated brand unless the user asked for separate branding.

#### Outputs

- `visualDirection`: Preserve, inspired-polished, or redesign, with rationale.
- `colorScheme`: The selected palette and source evidence.
- `component-validations/demo-website-validation.json` when a demo already exists, or an explicit deferred/blocked record when `ToBuildDemoWebsiteFromAnalysisSkill` is unavailable in this Workbench catalog.

#### Acceptance Criteria

- Visual direction is written before packaging later sales assets.
- Palette choices cite inspected colors rather than default template colors.
- Missing demo generation is deferred or blocked with the exact unavailable-function reason instead of being marked passed.

### Step 4: Create competitor analysis and normalize packet facts

#### Inputs

- Step 1 packet identity.
- Step 2 audit evidence and inspected pages.

#### Instructions

- Create `competitor-analysis/competitor-analysis.md` and, when practical, `competitor-analysis/competitor-analysis.html` from public evidence.
- Identify the top actual competitors first. If search competitors and actual business competitors differ, separate them.
- Cover the prospect's local market first, then surrounding regional markets when relevant.
- Compare service overlap, local relevance, SEO/page structure, proof/trust, CTAs, content depth, and visible weaknesses.
- Normalize key facts: client name, URL, category, desired actions, market, current strengths, top improvements, competitors, AI-search readiness, rebuild fixes, and optional monthly package.

#### Outputs

- `competitor-analysis/competitor-analysis.md`
- `normalizedFacts`: The reusable fact sheet for README, landing page, and manifest.
- `component-validations/competitor-analysis-validation.json`

#### Acceptance Criteria

- The competitor analysis names inspected competitor URLs and distinguishes actual businesses from SEO-only/lead-generation pages when both appear.
- Normalized facts stay inside inspected evidence and do not promise rankings, revenue, ratings, or outcomes.
- The competitor validation record includes artifact paths and objective checks.

### Step 5: Create annotated improvements and collect supporting assets

#### Inputs

- Steps 2-4 audit, report, deck, competitor analysis, visual direction, and any existing demo.

#### Instructions

- If a demo artifact exists, create an annotated screenshot or handoff page that maps visible improvements to the analysis.
- Copy supporting assets into the packet rather than moving originals: audit markdown, competitor analysis, evidence, crawl files, screenshots, and demo files when present.
- If no demo exists, write an explicit deferred annotated-improvements record instead of inventing screenshots.

#### Outputs

- `annotatedImprovements`: Annotated screenshot or handoff page when a demo exists.
- `packetAssetIndex`: Copied supporting files and their source paths.
- `component-validations/annotated-improvements-validation.json`

#### Acceptance Criteria

- Copied files remain intact and are not treated as newly authored substitutes for prerequisite functions.
- Annotated improvements are included only when a real demo or current-site screenshot exists.
- The annotated-improvements validation record is `passed`, `deferred`, or `blocked` with a concrete reason.

### Step 6: Write the sales-rep README, landing page, and manifest

#### Inputs

- Steps 1-5 identity, facts, palette, prerequisite artifacts, competitor analysis, and asset index.

#### Instructions

- Create `README-sales-rep.md`, `README-sales-rep.html`, and optionally `README-sales-rep.txt`.
- Create packet `index.html` as the sales-rep entry point with obvious links to the report, competitor analysis, proposal deck, demo when present, README, manifest, and ZIP.
- Create `manifest.json` and `validation/function-execution-ledger.json`.
- The ledger may record prerequisite-node execution evidence for audit, report, and deck. Do not mark `ToBuildDemoWebsiteFromAnalysisSkill`, `ToDeployGeneratedDemoWebsiteToFeedingFrenzyStagingSkill`, or `ToDraftClientDemoEmailSkill` as called unless those exact functions actually ran.
- Keep client-facing report language free of internal sales terms. Proposal deck and README may include package language but must not overclaim.

#### Outputs

- `README-sales-rep.md`
- `README-sales-rep.html`
- `index.html`
- `manifest.json`
- `validation/function-execution-ledger.json`

#### Acceptance Criteria

- The landing page links to the client report PDF and HTML, competitor analysis, proposal deck PDF and HTML, README HTML, and manifest when those files exist.
- The README includes lead snapshot, opening angle, top issues, rebuild fixes, competitive positioning, files to use, and rep notes.
- The ledger does not claim an uncalled function passed.

### Step 7: Zip the packet

#### Inputs

- Step 6 packet folder containing landing page, README, manifest, and collected artifacts.

#### Instructions

- Ensure packet `index.html` exists before zipping.
- Zip the packet folder contents into a non-trivial archive.
- Record the ZIP path in the manifest and landing page.

#### Outputs

- `packetZip`: The complete sales-packet ZIP.
- `packetFolder`: The assembled packet folder path.

#### Acceptance Criteria

- The ZIP exists, is non-empty, and contains the landing page plus the included artifacts.
- The landing page links to the ZIP when the archive exists.
- Source files outside the packet folder were copied, not moved.

### Step 8: Publish to staging only when requested

#### Inputs

- Step 7 packet folder and ZIP.
- User request for publishing, staging, or a public sales-rep URL.

#### Instructions

- If publishing was not requested, write `component-validations/staging-deployment-validation.json` as `deferred` and stop.
- If publishing was requested and `ToDeployGeneratedDemoWebsiteToFeedingFrenzyStagingSkill` is available, call that exact function. Do not substitute a manual deploy.
- If the deploy function is unavailable in this Workbench catalog, mark staging `blocked` and do not claim a public URL.
- When a public staging URL is actually produced, add it to `manifest.json` and the sales-rep README.

#### Outputs

- `component-validations/staging-deployment-validation.json`
- `stagingUrls`: Public packet, report, deck, and demo URLs when deployment actually succeeded.

#### Acceptance Criteria

- Unrequested publishing is deferred, not marked passed.
- A passed staging record includes a public HTTP-verified URL.
- Unavailable deploy tooling is blocked with the exact missing-function reason.

## Validation

Run `CreateWebsiteAnalysisSalesPacket.validation.prompt.md` against the produced packet folder, ZIP, component validation records, and function-execution ledger before reporting success.
