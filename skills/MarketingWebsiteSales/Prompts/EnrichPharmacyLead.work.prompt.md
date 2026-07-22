# Enrich Pharmacy Lead

## Purpose

Produce a concise, evidence-qualified one-page enrichment card for a Feeding Frenzy pharmacy lead. The card gives a sales rep exactly what they need before a first call: who to contact, what tech they run, what services they offer, and how good their website is — all in 30 seconds or less.

## Input

A Feeding Frenzy LeadID (required).

## Output

A single markdown file saved to the session `artifacts/` folder named `{company-slug}-enrichment.md`, plus a summary posted to the lead as a CRM note.

---

## Design Principles

1. **Concise over comprehensive.** One page. If a sales rep has to scroll, it's too long.
2. **Validated over guessed.** Every claim has a source. If it can't be verified, say "Not found" — don't guess.
3. **Scannable.** Tables and short bullets. No paragraphs. No deep analysis.
4. **Actionable.** The rep should know who to call, what to say, and what to offer after reading it.

---

## Enrichment Card Format

```markdown
# Lead Enrichment: {Company Name}
**LeadID:** {ID} | **Date:** {YYYY-MM-DD} | **Sales Rep:** {Name}
**Website:** {URL} | **Phone:** {main phone} | **Locations:** {count}

## Decision Makers
| Name | Title | Email | Phone | Source | Confidence |
|------|-------|-------|-------|--------|------------|
| ... | ... | ... | ... | CRM/WHOIS/Website/NPI | Verified/Observed/Predicted |

## Tech Stack
| Item | Value | Source | Confidence |
|------|-------|--------|------------|
| PMS/EMR | {name or "Not found"} | {source} | ... |
| Website framework | {React/Vue/WordPress/Static/etc.} | {source} | ... |
| Online scheduling | {Yes/No/Unknown} | {source} | ... |
| Patient portal | {Yes/No/Unknown} | {source} | ... |
| Mobile app | {Yes/No/Unknown} | {source} | ... |

## Service Programs
| Program | Mentioned? | Source | Notes |
|---------|-----------|--------|-------|
| RPM (99453/99454/99457) | Yes/No | Website/CRM | ... |
| CCM (99490) | Yes/No | Website/CRM | ... |
| AWV (G0438/G0439) | Yes/No | Website/CRM | ... |
| RTM | Yes/No | Website/CRM | ... |
| APCM | Yes/No | Website/CRM | ... |
| Immunizations | Yes/No | Website/CRM | ... |
| MTM / Med Sync | Yes/No | Website/CRM | ... |
| Delivery | Yes/No | Website/CRM | ... |
| Compounding | Yes/No | Website/CRM | ... |
| Testing (COVID/strep/flu) | Yes/No | Website/CRM | ... |

## Website Capabilities
| Capability | Available? | Source | Notes |
|-----------|------------|--------|-------|
| Online refills | Yes/No | Website | ... |
| Prescription transfers | Yes/No | Website | ... |
| Immunization scheduling | Yes/No | Website | ... |
| Appointment booking | Yes/No | Website | ... |
| Contact form | Yes/No | Website | ... |

## Website Technical Quality (Quick Check)
| Check | Result | Source |
|-------|--------|--------|
| Rendering | SSR / SPA / Static / Hybrid | Raw HTML fetch |
| Page content in raw HTML | Yes/No/Partial | Raw HTML fetch |
| Meta description | Present/Missing | Raw HTML fetch |
| Title tag | Present/Missing | Raw HTML fetch |
| Schema markup (JSON-LD) | Present/Missing | Raw HTML fetch |
| Mobile viewport tag | Present/Missing | Raw HTML fetch |
| Overall | {X}/10 | Quick assessment |

## Readiness Assessment
- **Service readiness:** {Services Builder / Clinical Ready / Basic Pharmacy}
- **Digital readiness:** {Low / Medium / High}
- **Best contact for outreach:** {Name, Title, Email/Phone, Confidence}
- **Recommended pitch angle:** {1-2 sentences}

## Evidence Key
- **Verified** — Confirmed through direct observation (CRM record, WHOIS, raw HTML, NPI registry)
- **Observed** — Found in a single source but not cross-confirmed
- **Predicted** — Inferred from pattern or indirect evidence
- **Not found** — Could not be determined with available tools
```

---

## Workflow

### Step 1: CRM Lead Pull

1. Call `LeadAutomation_GetLeadAndNotesAsMarkdown` with `FeedingFrenzyJsonWsService#Remote` and the LeadID
2. Call `LeadContacts_GetLeadContactsByLeadID` with `FeedingFrenzyJsonWsService#Remote` and the LeadID
3. Extract from CRM:
   - Company name, all phone numbers, website URL (if present)
   - All contacts: names, titles, emails, phones
   - Tags (CPESN, Operator, Whale, etc.)
   - Sales rep name and ID
   - NPI numbers from lead data
   - Executive summaries and notes that mention services, tech, or readiness
4. Call `LeadAutomation_GetLeadsBySearch` to find related leads (alternate location names, NPIs)

### Step 2: Website Content & Contact Research

1. Fetch the website's raw HTML (not rendered) — use PowerShell `Invoke-WebRequest` to get the raw response
2. Check if the raw HTML contains page-specific content or is a JS shell (SPA detection)
3. Search the raw HTML for:
   - Email addresses (`mailto:` links, `href` attributes, visible text)
   - Phone numbers (tel: links, visible text patterns)
   - Leadership/team names and titles
   - Service program mentions (RPM, CCM, AWV, RTM, APCM, immunizations, MTM, med sync, delivery, compounding, testing)
   - Capability signals (refill forms, transfer forms, scheduling widgets, appointment booking)
   - Meta tags (title, description, viewport)
   - Schema markup (JSON-LD `application/ld+json` blocks)
4. If the site is a SPA (empty raw HTML), fetch the JavaScript bundle and search for:
   - Email addresses
   - Phone numbers
   - Service mentions
   - Component names that indicate capabilities (RefillForm, TransferForm, ScheduleAppointment, etc.)
   - Technology vendor names (see Step 3)
5. Check for a mobile app: search for "App Store", "Google Play", "Download our app" links

### Step 3: Technology Stack Fingerprinting

Search the website raw HTML and JS bundles for these vendor signatures:

**PMS / Pharmacy Management Systems:**
- PioneerRx (search: "pioneerrx", "PioneerRx")
- QS/1 (search: "qs1", "QS/1")
- Computer-Rx (search: "computerrx", "Computer-Rx")
- BestRx (search: "bestrx", "BestRx")
- Liberty Software (search: "libertysoftware")
- EnterpriseRx (search: "enterpriserx")
- Rx30 / Transaction Data Systems (search: "rx30", "transactiondata")
- ScriptPro (search: "scriptpro")
- Digital Pharmacist (search: "digitalpharmacist")
- RMS (search: "rmspharmacy")

**Website frameworks:**
- React (search: "react", "react-dom", "__NEXT_DATA__", "_next")
- Vue (search: "vue", "nuxt", "__nuxt")
- Angular (search: "angular", "ng-")
- WordPress (search: "wp-content", "wp-includes")
- Static HTML (no framework detected, content in raw HTML)

**Scheduling / Appointment vendors:**
- Calendly (search: "calendly")
- Setmore (search: "setmore")
- Acuity Scheduling (search: "acuityscheduling")
- Booked (search: "booked")
- Custom/inline form

**Patient engagement / portal:**
- RxSafe (search: "rxsafe")
- Digital Pharmacist (search: "digitalpharmacist")
- PocketPills (search: "pocketpills")
- Custom portal (search for "portal", "patient login", "patient portal")

If a vendor is not found, report "Not found" — do not guess.

### Step 4: WHOIS & Domain Research

1. Fetch WHOIS records for the website domain (use `who.is` or similar)
2. Extract registrant email, name, organization
3. Extract registrar, creation date, name servers
4. Check for additional domains owned by the same organization
5. **Evidence label: "Observed"** — WHOIS data is a single-source observation, not SMTP-verified

### Step 5: NPI Registry Lookup

1. Use the NPI number(s) from the CRM lead data
2. Search for additional practice locations, authorized officials, and taxonomy codes
3. Cross-reference authorized official names with website leadership
4. **Evidence label: "Verified"** for NPI-registered names and addresses (government registry)

### Step 6: Email Resolution & Verification

1. Collect all observed emails from: CRM contacts, website HTML, JS bundles, WHOIS
2. Identify the email pattern (e.g., `firstinitial.lastname@domain.com`, `firstname@domain.com`)
3. If a pattern is detected from 2+ observed examples, label it "Observed pattern"
4. Generate predicted emails for known leadership names using the pattern
5. **Evidence labels:**
   - **Verified** — Email appears in CRM contact record or WHOIS (directly observed in a trusted source)
   - **Observed** — Email found in website HTML, JS bundle, or other public source
   - **Predicted** — Email generated from an inferred pattern (not directly observed)
6. **Do NOT claim any email is SMTP-verified unless SMTP verification was actually performed**
7. **Do NOT claim a pattern is "confirmed" — it is "observed" or "tentative" at best**

### Step 7: Phone Number Resolution

1. Collect all phone numbers from: CRM contacts, website HTML, JS bundles, NPI registry
2. Deduplicate and format consistently
3. Label each with source: CRM, Website, NPI, WHOIS
4. Identify the main/store phone vs. leadership direct lines
5. **Evidence label: "Verified"** if the phone appears in CRM or NPI; "Observed" if from website only

### Step 8: Service Gap Scan

Cross-reference website content and CRM notes against the service program checklist:

| Program | Search Terms |
|---------|-------------|
| RPM | "remote patient monitoring", "RPM", "99453", "99454", "99457", "blood pressure monitor", "bluetooth device" |
| CCM | "chronic care management", "CCM", "99490", "care coordination" |
| AWV | "annual wellness visit", "AWV", "G0438", "G0439", "wellness visit", "health risk assessment" |
| RTM | "remote therapeutic monitoring", "RTM" |
| APCM | "advance primary care management", "APCM" |
| Immunizations | "immunization", "vaccine", "flu shot", "COVID vaccine", "shingles", "pneumonia", "Tdap" |
| MTM | "medication therapy management", "MTM", "med sync", "medication synchronization" |
| Delivery | "delivery", "mail order", "free delivery", "prescription delivery" |
| Compounding | "compounding", "custom medication", "compounded" |
| Testing | "COVID testing", "rapid test", "PCR", "strep test", "flu test", "lab test" |

For each program:
- **Yes** — Term found on website or in CRM notes
- **No** — Term not found (label as "Not mentioned on website — may be offered offline")
- **Source** — Where the mention was found (Website, CRM notes, NPI)

**Critical rule:** Absence from the website does not prove the service is not offered. Always note "Not mentioned on website" rather than "Does not offer."

### Step 9: Quick Website Technical Check

This is NOT the full audit — just a 60-second check:

1. Fetch raw HTML of the homepage
2. Check:
   - Is there page-specific content in the raw HTML? (SSR vs SPA)
   - Is there a `<title>` tag with content?
   - Is there a `<meta name="description">` tag?
   - Is there a `<meta name="viewport">` tag (mobile)?
   - Is there any `<script type="application/ld+json">` (schema)?
   - Are there `tel:` links (clickable phone numbers)?
3. Score 0-10 based on:
   - Content in raw HTML: 0 (empty shell) to 3 (full content)
   - Meta tags: 0-2 (title + description)
   - Schema: 0-1
   - Mobile: 0-1
   - Clickable phone: 0-1
   - Overall structure: 0-2
4. **Evidence label: "Verified"** — this is a direct observation from raw HTML

### Step 10: Readiness Assessment

Based on all findings, assess:

- **Service readiness:**
  - "Services Builder" — offers 3+ clinical services (immunizations, testing, med sync, delivery, compounding)
  - "Clinical Ready" — offers 1-2 clinical services
  - "Basic Pharmacy" — dispensing only, no clinical services mentioned

- **Digital readiness:**
  - "Low" — SPA with no SSR, no meta tags, no schema, no online capabilities
  - "Medium" — Some meta tags, some online capabilities, basic SEO
  - "High" — SSR, full meta tags, schema, online scheduling, mobile app

- **Best outreach target:** The highest-ranking decision maker with the most verified contact info
- **Recommended pitch angle:** 1-2 sentences based on the gap between what they offer and what FairPath provides

### Step 11: Output

1. Save the enrichment card to `artifacts/{company-slug}-enrichment.md`
2. Post a concise summary as a CRM note on the lead using `LeadNotes_InsertLeadNote`:
   - Use `FeedingFrenzyJsonWsService#Remote`
   - SalesRepresentativeID from the lead data
   - LeadNoteTypeID: 4 (Automated — this is the correct type for research/enrichment notes; ID 1 is "Recorded Call" and must not be used)
   - FollowUpDate: empty string
   - Data: `{"IsLeadResearch": true, "IsMarkdown": true}` (required — the IsMarkdown flag tells the CRM to render the note as formatted markdown instead of flat text)
   - Notes: a condensed markdown-formatted version of the enrichment card (not the full card — just the key findings). Must use proper markdown: `##` headers, `**bold**` labels, `| table |` rows, and `-` bullet lists. Do NOT post flat unformatted text.
3. Report the artifact path and note ID to the user

---

## Component Actions (Reuse, Do Not Reimplement)

- `LeadAutomation_GetLeadAndNotesAsMarkdown` — CRM lead details + notes
- `LeadAutomation_GetLeadsBySearch` — CRM lead search (for related leads)
- `LeadContacts_GetLeadContactsByLeadID` — CRM contacts
- `ToSearchFeedingFrenzyLeadsByEmail` — CRM email search (cross-reference)
- `LeadNotes_InsertLeadNote` — Post enrichment summary to CRM
- `ToExecuteFastPowerShellOperationInWorkingDirectoryWithTimeout` — Website HTML/JS fetching, WHOIS lookups

---

## Evidence-State Labels (Required on Every Claim)

- **Verified** — Confirmed through direct observation in a trusted source (CRM record, NPI registry, raw HTML fetch, WHOIS record)
- **Observed** — Found in a single public source but not cross-confirmed
- **Predicted** — Inferred from a pattern or indirect evidence (e.g., email pattern inference)
- **Not found** — Could not be determined with available tools

## Critical Rules

1. **Never label an email as "verified" unless it appears in a CRM contact record, WHOIS, or was SMTP-tested.** WHOIS and CRM are "observed" — they are single-source observations, not SMTP confirmations.
2. **Never label an email pattern as "confirmed."** It is "observed" or "tentative" at best.
3. **Never claim a service is "not offered" based on website absence.** Say "Not mentioned on website."
4. **Never guess a tech stack.** If the vendor can't be detected from the website, say "Not found."
5. **Keep the output to one page.** If it's longer, cut detail, not evidence labels.
6. **Every phone number, email, and name must have a source column.**

## Acceptance Criteria

- [ ] Enrichment card saved to `artifacts/{company-slug}-enrichment.md`
- [ ] Card fits on one page (no more than ~60 lines of markdown)
- [ ] Every claim has a source and evidence-state label
- [ ] Decision makers table includes all known contacts with emails and phones
- [ ] Tech stack section reports PMS/EMR, framework, scheduling, portal, app
- [ ] Service programs table covers all 10 programs
- [ ] Website capabilities table covers all 5 capabilities
- [ ] Website technical quality includes the 6 quick checks and a score
- [ ] Readiness assessment includes service readiness, digital readiness, best contact, and pitch angle
- [ ] CRM note posted to the lead with a condensed summary
- [ ] No email is labeled "verified" unless it meets the criteria in Critical Rule 1
- [ ] No service is labeled "not offered" — only "not mentioned on website"
- [ ] No tech stack vendor is guessed — only detected or "Not found"
