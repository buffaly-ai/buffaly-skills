# CareCascade skill

Defines the CareCascade MedOnt ICD-10 JsonWS skill and published service binding.

## Actions

- `ToSearchCareCascadeIcd10Codes` calls `GetICDCodesBySearch` for text-to-ICD-10 candidate lookup.
- `ToSearchCareCascadeIcd10CodesWithHierarchy` calls `GetICDCodesBySearchWithHierarchy` for hierarchical ICD-10 search results.
- `ToGetCareCascadeIcd10CodeDetails` calls `GetICDCodeByCodeDetails` for one ICD-10 code.
- `ToGetCareCascadeIcd10SpecialtyCapability` calls `GetSpecialtyCapability` to map one ICD-10 code to APCM/RTM/CCM/RPM flags.

## Service contract

Use `CareCascadeIcd10JsonWsService#Published` for the public API at `https://api.carecascade.com`.
The service reads `CareCascade.ApiKey` from UserSecrets via `TokenKey`. The API was observed open, but the tools intentionally keep the secret-backed auth path ready for future enforcement.

## JsonWS shape

The live API requires route-based POST calls where the JSON body includes `Method` plus method parameters. `JsonWsHelper.CallJsonRouteSecure` supplies the HTTP transport, including the secret-backed bearer token path.

## Provider-neutral discovery phrases

Added generic ICD-10 and medical-workflow infinitives so callers can discover the tools without naming CareCascade. Examples include finding ICD-10 codes for diagnosis text, resolving diagnosis code details, and checking RPM/CCM/RTM/APCM eligibility from ICD-10 codes.

## Workflow-oriented discovery phrases

Added patient-import enrichment and care-program routing infinitives. Free-text workflows route to ICD-10 candidate search first; already-coded patient workflows route to specialty capability classification.
