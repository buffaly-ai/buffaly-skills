# Enrich Pharmacy Lead — Validation

## Purpose

Validate that the enrichment card produced by the work prompt meets all acceptance criteria before reporting success.

## Validation Checks

1. **Artifact saved**: Verify that rtifacts/{company-slug}-enrichment.md exists in the session directory.
2. **One-page limit**: The enrichment card must be no more than ~60 lines of markdown.
3. **Evidence labels**: Every claim in the card must have a source and evidence-state label (Verified, Observed, Predicted, Not found).
4. **Decision makers table**: Must include all known contacts with names, titles, emails (or "Not found"), and phones with source column.
5. **Tech stack section**: Must report PMS/EMR, website framework, online scheduling, patient portal, and mobile app — each with value or "Not found".
6. **Service programs table**: Must cover all 10 programs (RPM, CCM, AWV, RTM, APCM, Immunizations, MTM/Med Sync, Delivery, Compounding, Testing).
7. **Website capabilities table**: Must cover all 5 capabilities (online refills, prescription transfers, immunization scheduling, appointment booking, contact form).
8. **Website technical quality**: Must include the 6 quick checks (rendering, content in raw HTML, meta description, title tag, schema markup, mobile viewport) and an overall score.
9. **Readiness assessment**: Must include service readiness classification, digital readiness rating, best outreach target, and recommended pitch angle.
10. **CRM note posted**: Verify that a CRM note was posted to the lead using LeadNotes_InsertLeadNote.
10a. **CRM note type correct**: The LeadNoteTypeID must be 4 (Automated), NOT 1 (Recorded Call). ID 1 will display the note as a "Recorded Call" in the CRM UI, which is wrong for enrichment notes.
10b. **CRM note markdown flag**: The Data parameter must contain `{"IsLeadResearch": true, "IsMarkdown": true}` so the CRM renders the note as formatted markdown.
10c. **CRM note markdown formatting**: The note text must use proper markdown formatting (## headers, **bold** labels, | table | rows, - bullet lists). Flat unformatted text is a validation failure.
11. **No false "verified" emails**: No email is labeled "verified" unless it appears in a CRM contact record, WHOIS, or was SMTP-tested.
12. **No "not offered" labels**: No service is labeled "not offered" — only "not mentioned on website".
13. **No guessed tech stack**: No tech stack vendor is guessed — only detected or "Not found".

## Pass Criteria

All 16 checks must pass. If any check fails, report the specific failure and what needs to be fixed.
