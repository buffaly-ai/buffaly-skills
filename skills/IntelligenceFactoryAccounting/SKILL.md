# Intelligence Factory accounting

Ordinary package-managed ProtoScript skill. Version 0.1.0. Requires the existing FeedingFrenzyJsonWs foundation/action root and normal OpsAgent service/JsonObject/JsonWsHelper support. No core changes or bespoke HTTP tools.

## Entrypoints
- Directory/OpsAgent: `index.pts` includes `OpsAgent.pts`, which includes the fixed local binding and resolves logical UserSecrets key `IntelligenceFactory.Accounting.Local.ApiToken` inside CallJsonRouteSecure. Provision only an authorized existing IF user's API authorization; this design does not create a user/token/secret. No login-as-user helper.
- Embedded IF administrator: include `Embedded.pts`, NEVER `index.pts` or `OpsAgent.pts`. The trusted host calls Current.ConfigureAuthorization with the actual logged-in user's API token. Without it, requests fail closed.
- Feed the existing FeedingFrenzyJsonWs foundation before this package. Do not change its API prefix or Current binding.

## Tool use policy
Confirm context first. Use report/cohort totals, not page arithmetic. Read transaction/category evidence before review; preserve economics and original source. Review is a full replacement of category, treatment, notes and reviewed state, only for an exact user-authorized change; unknown fields require clarification rather than accidental clearing. Category 0 and empty notes explicitly clear; optional filter 0/empty maps to JSON null, not coercion. Negative IDs are passed through for server rejection, never changed to null. Dates are YYYY-MM-DD; no float conversion or local amount calculations.

Chase check is read-only and uses exact base64 bytes. Import commit remains in the current UI, preserving one explicit Import/Skip decision per source row and fingerprint validation. No automatic classification or duplicate skipping. CSV check is not publication or payment. Reads/exports return the service's existing JSON contract; this skill does not create an output file or a second response envelope.

No silent retries of writes. On uncertain outcome read back and explain uncertainty. The guarded-write action type and descriptions guide agent operation; server authorization and existing Save guards are the security boundary, not a magical approval gate in this package.

Books are not tax positions. Original amounts/provenance and unresolved tax assumptions remain distinct. No filing, elections, payment, third-party delivery, workbook changes, sharing changes or customer receivables functionality.

## Installation and tests
Publish package files and their actual SHA256 entries through the existing skills catalog workflow. Load FeedingFrenzyJsonWs first, then this package's catalog EntryPoint. Copy/install the same package payload under the embedded project's `Skills/IntelligenceFactoryAccounting` without the OpsAgent binding include. Validate compiled tool schemas, semantic discovery, fixed routes, actor attribution and cross-tenant denials before enabling.

Implemented source and actual validation are recorded in the companion histories and local deployment receipt. Publication, installation and active runtime state must be verified separately.
