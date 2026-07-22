# Check Pharmacy Reputation

Use this prompt skill when the user wants to audit, check, or assess a pharmacy's online reputation and directory/profile presence across all major platforms.

This skill is a research and reporting workflow. It does not modify any listings directly. It produces a completed checklist report showing what is claimed, what is missing, what is inaccurate, and what actions are recommended.

## Core Goal

Systematically check a pharmacy's presence across all relevant online directory, review, and profile platforms. For each platform, determine:

- Does a listing exist?
- Is it claimed/verified by the pharmacy?
- Is the information accurate (NAP, hours, services, photos)?
- Are there reviews? Is the pharmacy responding?
- What actions are needed?

## Reference Checklist

The full platform checklist is at:
`Skills/MarketingWebsiteSales/References/pharmacy-reputation-directory-checklist.md`

Read that file at the start of every run to get the current platform list, URLs, and action items.

## Input

Accept one of the following from the user:

- Pharmacy name (search the web to find website, address, phone, NPI)
- Pharmacy website URL (derive name, address, phone from the site)
- Pharmacy NPI number (look up in NPPES/NPI Profile)

If the pharmacy name is ambiguous (multiple locations with the same name), search the web to identify all locations and ask the user which one to check if needed.

## Research Process

For each tier in the checklist, search the web for the pharmacy's presence on each platform. Use the pharmacy's name, address, phone, and NPI to find listings.

### Tier 1: Primary Local SEO & Review Platforms

For each platform, check:

1. **Google Business Profile** — Search Google Maps for the pharmacy name + address. Is there a listing? Is it claimed? Photos? Reviews? Rating? Hours accurate? Services listed? Website link?
2. **Yelp** — Search Yelp for the pharmacy name + city. Listing exists? Claimed? Reviews? Photos? Accurate info?
3. **Apple Business Connect** — Search Apple Maps. Listing exists? Accurate?
4. **Bing Places** — Search Bing Maps. Listing exists? Accurate?
5. **Facebook** — Search Facebook for the pharmacy. Business page exists? Active? Photos? Reviews? Website linked?
6. **Nextdoor** — Search Nextdoor for the pharmacy. Business page exists?
7. **Foursquare** — Search Foursquare for the pharmacy. Listing exists? Accurate?

### Tier 2: Pharmacy-Specific Directories & Locators

8. **RxLocal Pharmacy Finder** — Search pharmacyfinder.rxlocal.com for the pharmacy. Listing exists? Claimed? Services/hours accurate?
9. **NCPDP** — Check if the pharmacy has an NCPDP profile. This requires login; note as "verify with pharmacy" if not accessible.
10. **NPPES / NPI Registry** — Search npiregistry.cms.hhs.gov for the pharmacy's NPI. Is the record accurate? Correct taxonomy? Correct address/phone?
11. **NPI Profile** — Search npiprofile.com for the pharmacy. Listing exists? Accurate?
12. **PECOS** — Check Medicare enrollment status if applicable.
13. **NABP Safe.Pharmacy** — Check safe.pharmacy for the pharmacy's website domain. Verified? Not recommended? Not listed?
14. **NABP VPP** — Check if the pharmacy has VPP verification.
15. **CPESN** — Check if the pharmacy is in the CPESN locator.

### Tier 3: Conditional / Niche Directories

16-21. Check ACA, compounding directories, Peptide Association, NDPAP, CartoChrome, and OurHealthNetwork based on the pharmacy's services.

### Tier 4: Consumer Price/Coupon Platforms

22. **GoodRx** — Search goodrx.com for the pharmacy. Listed? Accurate?
23. **SingleCare** — Search singlecare.com for the pharmacy. Listed? Accurate?

### Tier 5: Doctor Platforms with Partial Pharmacy Presence

24. **Healthgrades** — Search healthgrades.com for the pharmacy. Listing exists? Claimed? Reviews?
25. **HealthCare4PPL** — Search healthcare4ppl.com for the pharmacy. Listing exists? Accurate?
26. **WebMD, U.S. News, Vitals** — Check for pharmacist profiles if applicable.

## Additional Checks

- **BBB** — Search bbb.org for the pharmacy. Listing exists? Accredited? Rating? Reviews?
- **Pharmacy-specific local directories** — Check local chamber of commerce, state pharmacy association directories.
- **Google search for pharmacy name** — What shows up in the first 2 pages? Any negative articles, reviews, or competitor listings?

## Report Format

Produce a report with the following sections:

### Evidence Qualification Rules

Every platform finding must use one of these status labels:

- **Confirmed listing** - the listing was directly verified via web search or browser access with a URL
- **Unknown / requires live browser verification** - web search could not confirm or rule out the listing; a live browser check is needed before any action
- **Not found in web search (likely absent but not confirmed)** - web search returned no results, but absence cannot be definitively claimed without a direct platform check

Never state that a listing does not exist based on web search alone. Never recommend creating a listing without first verifying whether one already exists. Never claim a platform supports pharmacy-business claiming without verifying the claim process.

The executive summary must report counts separately for confirmed, unverified, and not-found platforms. Do not mix them.

### Executive Summary
- Pharmacy name, address, phone, website, NPI
- Overall reputation score using only confirmed findings (e.g., "7 confirmed listings, 8 unverified, 3 not found")
- Top 5 priority actions

### Platform-by-Platform Findings
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

### NAP Consistency Check
Compare name, address, and phone across all platforms where listings were found. Flag any inconsistencies.

### Priority Action List
Rank all needed actions by priority:
1. Critical (claim Google Business Profile, fix wrong address, etc.)
2. High (claim Yelp, create Facebook page, etc.)
3. Medium (verify NCPDP/NPPES data, check NABP status, etc.)
4. Low (niche directories, doctor platforms, etc.)

### HIPAA Reminder
Include a note that any review responses must follow HIPAA-safe rules:
- Never confirm patient status
- Never disclose PHI
- Use generic responses and redirect to private channel
- Train staff before responding

## Output

Save the completed report as a Markdown file in the session artifacts folder:
`artifacts/pharmacy-reputation-report-[pharmacy-name-slug].md`
