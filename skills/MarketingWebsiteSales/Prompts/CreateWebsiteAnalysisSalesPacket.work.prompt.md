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

Do not substitute a manually performed audit or an “equivalent workflow” for this call. If prior audit evidence exists, provide it to the function as source material when supported. The function must still execute and return a passing validation result for the current packet run.

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

### Step 1: Run and verify the prerequisite audit
You MUST call `ToAnalyzeExistingWebsiteForImprovementsSkill`. Do not directly create or merely reuse the final audit in this master workflow. Provide existing evidence to the function as source material when supported, and do not continue until its validated result passes.

Confirm the resulting source audit and evidence files exist. Minimum accepted evidence:
- source audit markdown
- page evidence or notes
- sitemap/robots findings
- representative page findings
- competitor discovery notes and inspected competitor page summaries
- scorecard or equivalent findings

If the function cannot be called or the required evidence is missing, mark the component blocked and do not report the packet as passed.

### Step 1aa: Generate or validate the demo website

You MUST call:

- `ToBuildDemoWebsiteFromAnalysisSkill`

Do not build, repair, or approve the final demo directly in this master workflow. If an existing demo is being reused, provide it to the function for current-run inspection and validation. Do not continue until the function returns a passing validated result.

### Step 1a: Resolve visual direction and artifact branching

Before demo or deck generation, document whether the work is:
- Preserve existing site style/template.
- Inspired by existing site, but polished.
- Full redesign/new concept.

If the user changes direction, preserve the prior useful version and create a new branch instead of overwriting it. Return both links when both directions should be compared.

### Step 1b: Create annotated improvements asset when a demo exists

After a demo artifact is created and visually validated, create an annotated screenshot or handoff page that explains the visible improvements. This asset should be included in the proposal deck and sales packet.

### Step 2: Choose and document the client color scheme
Before generating the client-facing report, proposal deck, screenshots, or demo references, inspect the prospect's current website and any approved demo site for visual cues.

Pick a small, reusable palette that reflects the prospect's existing brand rather than defaulting to the template colors. At minimum define:
- `Primary` — main brand/nav/hero color.
- `Secondary` — supporting heading or section color.
- `Accent` — CTA/button/highlight color.
- `LightBackground` — soft panel/background color.
- `Ink` — primary text color.
- `Muted` — secondary text color.
- `White` — card and contrast color.

Use direct evidence when possible:
- CSS variables or repeated hex colors from the current website.
- Logo colors.
- Button, header, link, and hero colors.
- Approved demo-site palette when it is more coherent than raw template CSS.

Record the selected palette and rationale in the audit evidence or manifest. Then apply this same palette consistently to:
- client-facing report HTML/PDF,
- proposal deck HTML/PDF,
- demo screenshots used in the deck,
- packet landing page when practical.

Do not leave the report in one unrelated template palette and the sales/proposal deck in another unrelated palette unless the user asks for separate branding.

### Step 3: Normalize key facts
Extract or define:
- client name
- website URL and display domain
- business category
- primary desired actions
- local market/location
- strongest current website assets
- top improvement opportunities
- top actual competitors and competitor gaps/opportunities
- LLM information quality / AI-search readiness score and recommended improvements
- top rebuild fixes
- package price and base program, if applicable

### Step 3a: Generate the competitor analysis artifact
Create a competitor analysis before the client-facing report and proposal deck so both artifacts can use the same positioning.

Minimum competitor analysis contents:
- Local market definition and search/source methods used.
- Ranked top actual competitors with websites and evidence notes.
- Separate list of SEO-only/lead-generation competitors when they appear in search but are not clearly actual local businesses.
- Comparison table covering service overlap, local relevance, SEO structure, trust/proof, CTAs, content depth, and visible weaknesses.
- What competitors do better than the prospect.
- What the prospect already does better or can credibly claim if supported by evidence.
- Priority recommendations to close the competitive gap.

Save the analysis under `competitor-analysis/` and copy source notes into `audit-evidence/`.

### Step 3: Generate the client-facing report
You MUST call:

- `ToCreateClientFacingWebsiteReportSkill`

Do not create the final report directly in this master workflow. Provide the normalized facts, current audit, competitor evidence, palette, and required output location to the function. Do not continue until its validated result passes.

Important:
- Client report must be safe to send directly to the business.
- Do not include sales-rep language.
- Validate with internal-language scan.
- Export both HTML and PDF.

### Step 4: Generate or update the proposal deck
You MUST call:

- `ToCreateWebsiteGrowthProposalDeckSkill`

Do not create the final proposal deck directly in this master workflow. Provide the passed report, competitor analysis, demo screenshots, annotated improvements, normalized facts, and palette to the function. Do not continue until its validated result passes.

Include:
- current strengths
- current screenshot(s)
- current issue framing
- competitor positioning and the most important competitive gap(s)
- demo solution screenshot(s), if available
- top rebuild fixes
- monthly add-on slide, if requested
- next steps

Important CSS requirements:
- Inline CSS.
- Card text on dark slides must be dark on white cards:
  - `.card{background:white;color:var(--ink);...}`
  - `.card p{font-size:18px;color:var(--ink)}`

### Step 5: Collect supporting assets
Copy into the packet:
- audit markdown
- competitor analysis and competitor source notes
- evidence JSON/text
- crawl files
- screenshots
- demo-site files and assets, if available
- image source maps, if available

Preserve original source files elsewhere; copy into the packet rather than moving them.

### Step 6: Write the sales-rep README
Create `README-sales-rep.md` with this structure:

```markdown
# {{CLIENT_NAME}} Website Analysis Sales Packet

## Lead snapshot
- Website: {{WEBSITE_URL}}
- Business type: {{BUSINESS_TYPE}}
- Location/market: {{LOCATION}}
- Primary opportunity: {{PRIMARY_OPPORTUNITY}}

## Recommended opening angle
{{OPENING_ANGLE}}

## Top current website issues to mention
1. {{ISSUE_1}}
2. {{ISSUE_2}}
3. {{ISSUE_3}}

## Top rebuild fixes included
1. {{FIX_1}}
2. {{FIX_2}}
3. {{FIX_3}}
4. {{FIX_4}}
5. {{FIX_5}}
6. {{FIX_6}}

## Competitive positioning
- Top actual competitors reviewed: {{TOP_COMPETITORS}}
- Where the lead is behind online: {{COMPETITIVE_GAPS}}
- Where the lead can credibly win: {{COMPETITIVE_ADVANTAGES}}

## Proposed monthly website layer
- Base program: {{BASE_PROGRAM_NAME}}
- Website layer: {{MONTHLY_PRICE}}/month
- What it includes: {{MONTHLY_SUMMARY}}

## Files to use
- Client report PDF: {{CLIENT_REPORT_PDF_PATH}}
- Proposal deck PDF: {{PROPOSAL_DECK_PDF_PATH}}
- Competitor analysis: {{COMPETITOR_ANALYSIS_PATH}}
- Demo site: {{DEMO_SITE_PATH}}

## Notes for the rep
- Lead with what is already working.
- Do not overclaim rankings, traffic, revenue, reviews, or business performance.
- Use the proposal deck for the sales conversation.
- Use the client report as the polished leave-behind.
- Confirm service-area details and healthcare compliance before publishing any final website copy.
```

### Step 7: Write the function execution ledger and manifest

Before assembling the final packet, create `validation/function-execution-ledger.json` with one entry for every conditionally or unconditionally required component function. Each entry must contain:

```json
{
  "FunctionName": "ToCreateClientFacingWebsiteReportSkill",
  "Required": true,
  "Called": true,
  "ChildSessionKey": "...",
  "CorrelationId": "...",
  "WorkTurnId": "...",
  "ValidationTurnId": "...",
  "Attempts": 1,
  "ValidatedStatus": "passed",
  "Artifacts": ["..."],
  "ArtifactHashes": { "...": "..." },
  "Disposition": "regenerated"
}
```

Rules:

- `FunctionName` must be the exact callable tool/function name.
- `Called` may be `true` only when an actual function call was made.
- `ValidatedStatus` may be `passed` only when that function's validation passed.
- `equivalent`, `manual`, `self-validated`, and `reused without call` are not passing dispositions.
- A required entry with `Called: false` blocks final packet success.
- A required entry without child-session, correlation, or turn evidence blocks final packet success unless the runtime genuinely returns none; in that case preserve the raw call result that proves execution.

Create a JSON manifest with:
- `ClientName`
- `WebsiteUrl`
- `BusinessType`
- `GeneratedAtUtc`
- `ColorScheme`
- `SourceAuditPath`
- `CompetitorAnalysisPath`
- `CompetitorEvidenceFiles`
- `ClientReportHtml`
- `ClientReportPdf`
- `ProposalDeckHtml`
- `ProposalDeckPdf`
- `DemoSitePath`
- `EvidenceFiles`
- `Screenshots`
- `MonthlyPackage`
- `FunctionExecutionLedger`
- `Validation`

### Step 8: Zip the packet
Use PowerShell:

```powershell
Compress-Archive -Path "$packetFolder\*" -DestinationPath "$zipPath" -Force
```

Before zipping, ensure the packet landing page exists at `$packetFolder\index.html` and follows this pattern:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{{CLIENT_NAME}} Website Analysis Sales Packet</title>
</head>
<body>
  <main>
    <h1>{{CLIENT_NAME}} Website Analysis Sales Packet</h1>
    <p>Prepared by Intelligence Factory × Feeding Frenzy by Buffaly.</p>
    <ul>
      <li><a href="client-report/{{CLIENT_REPORT_PDF_FILENAME}}">Client report PDF</a></li>
      <li><a href="client-report/{{CLIENT_REPORT_HTML_FILENAME}}">Client report HTML</a></li>
      <li><a href="competitor-analysis/{{COMPETITOR_ANALYSIS_FILENAME}}">Competitor analysis</a></li>
      <li><a href="proposal-deck/{{PROPOSAL_DECK_PDF_FILENAME}}">Proposal deck PDF</a></li>
      <li><a href="proposal-deck/{{PROPOSAL_DECK_HTML_FILENAME}}">Proposal deck HTML</a></li>
      <li><a href="demo-site/index.html">Demo site</a></li>
      <li><a href="README-sales-rep.html">Sales rep README</a></li>
      <li><a href="manifest.json">Manifest</a></li>
      <li><a href="{{PACKET_ZIP_FILENAME}}">Download complete ZIP packet</a></li>
    </ul>
  </main>
</body>
</html>
```

The visual styling can be upgraded, but these links are mandatory when those artifacts exist. Do not link to `README-sales-rep.md` as the only README link because IIS may not serve `.md`; generate and link `README-sales-rep.html` and optionally `README-sales-rep.txt`.

### Step 9: Publish packet to Feeding Frenzy staging when requested
If the user asks to publish, deploy, stage, or make the packet available to sales reps through Feeding Frenzy staging:

1. You MUST call `ToDeployGeneratedDemoWebsiteToFeedingFrenzyStagingSkill`. Do not read or execute its markdown prompt directly and do not substitute a manual deployment workflow.

2. Build the package root with this shape:

```text
<package-root>/index.html
<package-root>/<client-slug>/index.html
<package-root>/<client-slug>/client-report/...
<package-root>/<client-slug>/competitor-analysis/...
<package-root>/<client-slug>/proposal-deck/...
<package-root>/<client-slug>/demo-site/...
<package-root>/<client-slug>/audit-evidence/...
```

3. Zip the package root contents, not the parent folder.

4. Upload the zip to a transfer location reachable by the public server, normally S3 with a presigned URL.

5. Use AWS SSM in `us-west-2` to verify the remote target before deploying. Current known target:
   - Instance id: `i-050e51c92f600cf65`
   - Expected host: `EC2AMAZ-HL17G4A`
   - Remote root: `C:\inetpub\wwwroot\ff\demos.feedingfrenzy.ai\wwwroot`

```powershell
[pscustomobject]@{
    Host = $env:COMPUTERNAME
    RootExists = (Test-Path 'C:\inetpub\wwwroot\ff\demos.feedingfrenzy.ai\wwwroot')
} | ConvertTo-Json
```

Only deploy to the instance where `RootExists` is `true`.

6. Run a remote PowerShell command through SSM that downloads the presigned zip, checks size, expands into the remote root, and verifies `<client-slug>\index.html` exists. Follow the command shape in `DeployGeneratedDemoWebsiteToFeedingFrenzyStaging.prompt.md`.

7. Validate the public URL:

```text
https://demos.feedingfrenzy.ai/<client-slug>/
```

8. Add public staging URLs to `manifest.json` and `README-sales-rep.md`:
   - `StagingPacketUrl`
   - `StagingClientReportUrl`
   - `StagingProposalDeckUrl`
   - `StagingDemoSiteUrl`, when present

## Validation checklist
Before final response, verify:
- Source audit exists.
- Client report HTML and PDF exist.
- Competitor analysis exists and is linked from the packet landing page.
- Competitor analysis distinguishes actual business competitors from SEO-only/lead-generation search competitors when both appear.
- Client report contains inline CSS.
- Client report passes internal/sales-language scan.
- Proposal deck HTML and PDF exist.
- Proposal deck contains inline CSS.
- Proposal deck has expected slide count.
- Proposal deck contains selected top rebuild fixes.
- Proposal deck contains monthly package slide when requested.
- Screenshot files referenced in the deck exist.
- Demo-site files exist when included.
- README-sales-rep.md exists.
- README-sales-rep.html exists and is linked from `index.html`.
- manifest.json exists.
- Packet `index.html` links to the client report PDF and HTML, competitor analysis, proposal deck PDF and HTML, demo site, README HTML, manifest, and ZIP when those files exist.
- ZIP archive exists and has non-trivial size.
- If staging deployment was requested: SSM probe verified the remote root exists on the target EC2 instance.
- If staging deployment was requested: `https://demos.feedingfrenzy.ai/<client-slug>/` returns HTTP 200.
- If staging deployment was requested: report/deck/demo links in the staging packet landing page work.

## Internal/sales language rules by artifact

### Client-facing report
Must not include internal sales terms:
- lead quality
- sales note
- sales positioning
- salesman
- prospect
- demo offer
- buyer pain
- Website Growth Demo conversation

### Proposal deck and sales-rep README
May include proposal/package language, but should still avoid unsupported claims and aggressive negative wording.

## Final response
Return:
- Packet folder path
- Packet ZIP path
- Client report PDF path
- Proposal deck PDF path
- README path
- Brief summary of what is included
- Any validation warnings

