# Check Pharmacy Reputation

## Purpose and Overview

Use this prompt skill when the user wants to audit, check, or assess a pharmacy's online reputation and directory/profile presence across all major platforms.

This skill is a research and reporting workflow. It does not modify any listings directly. It produces a completed checklist report showing what is confirmed, what remains unverified, what appears inaccurate, and what actions are recommended. The workflow must stand on its own without relying on a separate validation prompt to define missing research, evidence, output, or quality requirements.

### Overview

Systematically resolve the pharmacy's canonical identity, load the current packaged directory checklist, research its presence across relevant online directory/review/profile platforms, qualify every finding by evidence state, compare confirmed NAP and profile facts, prioritize safe corrective actions, and save a durable reputation report with evidence and manifest data.

For each applicable platform, determine:

- Does a listing exist?
- Is it claimed/verified by the pharmacy?
- Is the information accurate (NAP, hours, services, photos)?
- Are there reviews? Is the pharmacy responding?
- What actions are needed?

The workflow is read-only. Do not claim, create, edit, respond through, or otherwise mutate a listing. Do not send, publish, attach, or communicate the report without explicit approval.

## Inputs

Accept at least one of the following from the user:

- Pharmacy name (search the web to find website, address, phone, NPI)
- Pharmacy website URL (derive name, address, phone from the site)
- Pharmacy NPI number (look up in NPPES/NPI Profile)

Resolve these canonical inputs before final findings are assembled:

- Pharmacy name.
- Specific location/address when the business has multiple locations.
- Phone number.
- Official website URL when one can be confirmed.
- NPI when applicable and available.
- Audit date.
- Any service facts needed to determine which conditional/niche directories apply.

If the pharmacy name is ambiguous, research all plausible identities and locations. Ask the user to choose only when safe public evidence cannot resolve the correct target. Do not merge findings from different locations.

### Reference Checklist

The full platform checklist is at:
`Skills/MarketingWebsiteSales/References/pharmacy-reputation-directory-checklist.md`

Read that file at the start of every run to get the current platform list, URLs, and action items.

## Outputs

- Canonical pharmacy identity and identity-evidence record.
- Completed platform-by-platform findings for every applicable checklist entry.
- Evidence/source notes with URLs, search methods, checked dates, and limitations.
- NAP consistency analysis based only on confirmed listing data.
- Prioritized action list with evidence state and verification prerequisites.
- Client-readable Markdown reputation report.
- Artifact manifest or final handoff naming all saved paths.

### Required Report Format

Produce a report with the following sections:

#### Evidence Qualification Rules

Every platform finding must use one of these status labels:

- **Confirmed listing** - the listing was directly verified via web search or browser access with a URL
- **Unknown / requires live browser verification** - web search could not confirm or rule out the listing; a live browser check is needed before any action
- **Not found in web search (likely absent but not confirmed)** - web search returned no results, but absence cannot be definitively claimed without a direct platform check

Never state that a listing does not exist based on web search alone. Never recommend creating a listing without first verifying whether one already exists. Never claim a platform supports pharmacy-business claiming without verifying the claim process.

The executive summary must report counts separately for confirmed, unverified, and not-found platforms. Do not mix them.

#### Executive Summary
- Pharmacy name, address, phone, website, NPI
- Overall reputation score using only confirmed findings (e.g., "7 confirmed listings, 8 unverified, 3 not found")
- Top 5 priority actions

#### Platform-by-Platform Findings
For each platform, report:
- **Platform name**
- **Listing found:** Yes/No
- **URL:** (if found)
- **Claimed/verified:** Yes/No/Unknown
- **Information accurate:** Yes/No/Partial (with details)
- **Reviews:** Number, rating, recent activity
- **Photos:** Yes/No, count
- **Website link:** Yes/No
- **Actions needed:** Specific checklist items to complete

#### NAP Consistency Check
Compare name, address, and phone across all platforms where listings were found. Flag any inconsistencies.

#### Priority Action List
Rank all needed actions by priority:
1. Critical (claim Google Business Profile, fix wrong address, etc.)
2. High (claim Yelp, create Facebook page, etc.)
3. Medium (verify NCPDP/NPPES data, check NABP status, etc.)
4. Low (niche directories, doctor platforms, etc.)

#### HIPAA Reminder
Include a note that any review responses must follow HIPAA-safe rules:
- Never confirm patient status
- Never disclose PHI
- Use generic responses and redirect to private channel
- Train staff before responding

### Artifact Contract

Save the completed report as a Markdown file in the session artifacts folder:
`artifacts/pharmacy-reputation-report-[pharmacy-name-slug].md`

Also save evidence/source notes that identify the URLs and search methods used, checked dates, access limitations, and anything requiring live-browser or pharmacy verification. The final response may summarize the findings, but it must name the saved report and evidence paths. Do not consider the workflow complete if the report exists only in chat.

## Acceptance Criteria

The workflow is complete only when all of the following are true:

- The exact pharmacy/location is resolved and kept separate from similarly named businesses or sibling locations.
- The current packaged checklist was read at run time and every applicable platform was checked or marked `Not applicable` with a reason.
- Every platform result uses an allowed evidence status and records a direct URL/source, checked date, and limitation when verification is incomplete.
- The report never converts an unsuccessful search into a definitive claim that a listing does not exist.
- Claim status, accuracy, reviews, ratings, photos, hours, services, website links, accreditation, verification, and enrollment facts are reported only when directly observed.
- Executive counts for confirmed, unverified, not-found-in-search, and not-applicable platforms reconcile exactly with the platform table.
- NAP inconsistencies are based only on confirmed records and identify the conflicting sources and values.
- Every recommended listing creation, claim, correction, or response action states the evidence supporting it and any live verification required first.
- HIPAA-safe review-response guidance is included without drafting or sending patient-specific responses.
- The report and evidence artifacts are saved under the session `artifacts` folder and the final handoff names the paths.

## Workflow

### Platform Research Requirements

For each tier in the checklist, search the web for the pharmacy's presence on each platform. Use the pharmacy's name, address, phone, and NPI to find listings.

#### Tier 1: Primary Local SEO & Review Platforms

For each platform, check:

1. **Google Business Profile** - Search Google Maps for the pharmacy name + address. Is there a listing? Is it claimed? Photos? Reviews? Rating? Hours accurate? Services listed? Website link?
2. **Yelp** - Search Yelp for the pharmacy name + city. Listing exists? Claimed? Reviews? Photos? Accurate info?
3. **Apple Business Connect** - Search Apple Maps. Listing exists? Accurate?
4. **Bing Places** - Search Bing Maps. Listing exists? Accurate?
5. **Facebook** - Search Facebook for the pharmacy. Business page exists? Active? Photos? Reviews? Website linked?
6. **Nextdoor** - Search Nextdoor for the pharmacy. Business page exists?
7. **Foursquare** - Search Foursquare for the pharmacy. Listing exists? Accurate?

#### Tier 2: Pharmacy-Specific Directories & Locators

8. **RxLocal Pharmacy Finder** - Search pharmacyfinder.rxlocal.com for the pharmacy. Listing exists? Claimed? Services/hours accurate?
9. **NCPDP** - Check if the pharmacy has an NCPDP profile. This requires login; note as "verify with pharmacy" if not accessible.
10. **NPPES / NPI Registry** - Search npiregistry.cms.hhs.gov for the pharmacy's NPI. Is the record accurate? Correct taxonomy? Correct address/phone?
11. **NPI Profile** - Search npiprofile.com for the pharmacy. Listing exists? Accurate?
12. **PECOS** - Check Medicare enrollment status if applicable.
13. **NABP Safe.Pharmacy** - Check safe.pharmacy for the pharmacy's website domain. Verified? Not recommended? Not listed?
14. **NABP VPP** - Check if the pharmacy has VPP verification.
15. **CPESN** - Check if the pharmacy is in the CPESN locator.

#### Tier 3: Conditional / Niche Directories

16-21. Check ACA, compounding directories, Peptide Association, NDPAP, CartoChrome, and OurHealthNetwork based on the pharmacy's services.

#### Tier 4: Consumer Price/Coupon Platforms

22. **GoodRx** - Search goodrx.com for the pharmacy. Listed? Accurate?
23. **SingleCare** - Search singlecare.com for the pharmacy. Listed? Accurate?

#### Tier 5: Doctor Platforms with Partial Pharmacy Presence

24. **Healthgrades** - Search healthgrades.com for the pharmacy. Listing exists? Claimed? Reviews?
25. **HealthCare4PPL** - Search healthcare4ppl.com for the pharmacy. Listing exists? Accurate?
26. **WebMD, U.S. News, Vitals** - Check for pharmacist profiles if applicable.

### Additional Checks

- **BBB** - Search bbb.org for the pharmacy. Listing exists? Accredited? Rating? Reviews?
- **Pharmacy-specific local directories** - Check local chamber of commerce, state pharmacy association directories.
- **Google search for pharmacy name** - What shows up in the first 2 pages? Any negative articles, reviews, or competitor listings?

### Step 1: Resolve the Pharmacy and Location Identity

#### Inputs

- Required workflow inputs and confirmed identity candidates.

#### Instructions

Use the supplied pharmacy name, website, or NPI to resolve the canonical business name, exact location, address, phone, official website, NPI, and relevant service facts. Compare website content, NPPES/NPI records, public profiles, and other safe public evidence. Keep each location distinct.

#### Outputs

- Canonical pharmacy identity record.
- Accepted, rejected, and ambiguous identity candidates with evidence.
- Exact location scope and unresolved-field list.
- Identity source URLs and checked date.

#### Acceptance Criteria

- Name, location, address, phone, website, and NPI are supported by named evidence or explicitly unresolved.
- Findings from different pharmacy locations are not combined.
- An ambiguous target is resolved before platform findings are attributed, or the run is returned as blocked with the candidate choices.
- Unsupported business, ownership, service, accreditation, or licensing claims are not introduced.

### Step 2: Load and Scope the Current Directory Checklist

#### Inputs

- Step 1 canonical identity; Reference Checklist from Inputs.

#### Instructions

Read `Skills/MarketingWebsiteSales/References/pharmacy-reputation-directory-checklist.md` at the start of the run. Use it as the current platform inventory, URL/source guide, tier definition, and action checklist. Determine which conditional/niche platforms apply from confirmed service evidence.

#### Outputs

- Checklist version/path and checked date.
- Run-specific platform inventory grouped by tier.
- Applicable, conditionally applicable, not applicable, and access-restricted platform classifications.
- Service evidence used to include or exclude niche directories.

#### Acceptance Criteria

- The packaged checklist is actually read; no stale remembered platform list substitutes for it.
- Every checklist platform has an applicability state.
- Conditional directories are included only when confirmed service facts make them relevant.
- Login-restricted or inaccessible sources are marked for pharmacy/live verification rather than guessed.

### Step 3: Research Primary Local and Consumer Platforms

#### Inputs

- Steps 1-2 identity and run-specific platform inventory.

#### Instructions

Research Tier 1 platforms and the additional broad public-presence checks. Use the pharmacy's canonical name, address, phone, website, and NPI as applicable. Inspect direct listings or public platform evidence whenever accessible; preserve search evidence when direct access is unavailable.

#### Outputs

- Findings for Google Business Profile, Yelp, Apple Business Connect/Maps, Bing Places/Maps, Facebook, Nextdoor, and Foursquare.
- BBB, chamber/state-association, and first-two-pages general search observations when available.
- Listing/profile URLs, evidence status, checked date, observed facts, and access limitations.
- Review, photo, hours, service, and website-link observations only when directly visible.

#### Acceptance Criteria

- Every applicable primary platform has a finding or an explicit verification limitation.
- A search miss is labeled `Not found in web search (likely absent but not confirmed)`, never definitive absence.
- Claimed/verified state is `Unknown` unless direct evidence supports another value.
- Counts, ratings, activity, hours, photos, and links are not copied across platforms or inferred from snippets without qualification.

### Step 4: Research Pharmacy-Specific, Conditional, and Secondary Platforms

#### Inputs

- Steps 1-2 identity and Tier 2-5 applicability inventory.

#### Instructions

Research the applicable Tier 2 through Tier 5 platforms from the checklist, including pharmacy locators/registries, conditional service directories, price/coupon platforms, and partial doctor/profile platforms. Respect login, enrollment, and verification boundaries.

#### Outputs

- Findings for each applicable pharmacy-specific registry, directory, locator, coupon platform, and partial profile source.
- NPI/NPPES identity observations and directly observed taxonomy/address/phone details.
- Conditional-directory inclusion rationale.
- Access-restricted and pharmacy-verification follow-up list.

#### Acceptance Criteria

- Every applicable Tier 2-5 checklist entry has a qualified result.
- NCPDP, PECOS, NABP, VPP, CPESN, accreditation, verification, or enrollment claims are made only from directly accessible authoritative evidence.
- Login-restricted checks are marked `Unknown / requires live browser verification` or `verify with pharmacy` as appropriate.
- The report does not claim that a platform supports pharmacy claiming or recommend creation until the existing-listing and claim process are verified.

### Step 5: Normalize Evidence and Analyze Consistency

#### Inputs

- Steps 3-4 saved platform evidence.

#### Instructions

Apply the evidence qualification rules below to every platform row. Compare confirmed names, addresses, phone numbers, websites, hours, and service facts. Separate confirmed conflicts from unverified differences and preserve provenance for each value.

#### Outputs

- Normalized platform findings table.
- Reconciled evidence-status counts.
- NAP, website, hours, and service consistency findings.
- Conflicting-value ledger with source URLs and checked dates.
- Evidence/source notes artifact.

#### Acceptance Criteria

- Every row uses exactly one permitted evidence-status label.
- Executive counts reconcile with the normalized platform table.
- NAP conflicts name both the differing values and their confirmed sources.
- Unknown or snippet-only values are not used to declare inconsistency.
- Absence, accuracy, and claimed status remain distinct concepts.

### Step 6: Prioritize Safe Actions

#### Inputs

- Step 5 normalized findings and verification limitations.

#### Instructions

Derive critical, high, medium, and low actions from confirmed findings and qualified gaps. State any live-browser, pharmacy-owner, login, or platform verification prerequisite before recommending creation, claiming, correction, or response activity.

#### Outputs

- Ranked action list with platform, evidence, rationale, prerequisite, and expected outcome.
- Immediate verification queue for unknown or search-only findings.
- HIPAA-safe review-response guidance.
- Deferred or not-applicable action list.

#### Acceptance Criteria

- Every action is traceable to a platform finding.
- Creating or claiming a listing is not recommended until an existing listing and platform process are verified.
- Priority reflects customer trust, findability, identity accuracy, and practical risk rather than platform count alone.
- No listing is modified and no review response is sent.
- HIPAA guidance never confirms patient status or includes PHI.

### Step 7: Assemble and Verify the Durable Reputation Report

#### Inputs

- Saved outputs from Steps 1-6; report specifications in Outputs.

#### Instructions

Assemble the report using the required format below. Save the report and evidence notes under the current session `artifacts` folder, and include a manifest or final handoff naming the artifact paths. Before completion, reconcile summary counts, platform rows, consistency findings, priorities, and limitations.

Write `artifact-manifest.json` with `schemaVersion` `workflow-artifact-manifest/v1`, `workflowKey` `CheckPharmacyReputation`, and an `artifacts` array containing every delivered artifact. Set both `primaryArtifactKey` and `canonicalSourceArtifactKey` to `primary-report-markdown`, and include an artifact whose `artifactKey` is exactly `primary-report-markdown` and whose path names the saved Markdown reputation report. Every primary or canonical source key must reference an `artifactKey` present in the same manifest.

#### Outputs

- `artifacts/pharmacy-reputation-report-[pharmacy-name-slug].md`.
- Evidence/source notes artifact containing URLs, methods, dates, and limitations.
- `artifact-manifest.json` with canonical pharmacy identity, saved paths, `primaryArtifactKey` `primary-report-markdown`, and `canonicalSourceArtifactKey` `primary-report-markdown`.
- Completeness and count-reconciliation result.

#### Acceptance Criteria

- Every applicable checklist platform appears in the report or is explicitly marked not applicable with a reason.
- Required report sections are present and substantive.
- Summary counts match the platform table exactly.
- Every material claim and action is traceable to evidence.
- The saved artifact paths exist and are reported.
- Both manifest primary/canonical source keys reference the listed `primary-report-markdown` artifact.
- Unverified findings remain visibly unverified rather than being omitted or promoted to facts.

## Validation

The final numbered step is the deterministic validation gate. Reconcile platform counts, evidence states, NAP findings, priorities, limitations, and saved paths against the workflow Acceptance Criteria and every step Acceptance Criteria.
