# Recaptcha Skill

Provides Ops actions for managing Google reCAPTCHA Enterprise keys and allowed domains through the canonical Feeding Frenzy route-based Google operations service.

## Binding

- Callers pass `FeedingFrenzyWebPropertiesJsonWsService service`; use `FeedingFrenzyWebPropertiesJsonWsService#Remote` for production.
- Canonical remote binding: `BaseUrl = https://ff.intelligencefactory.ai`, `TokenKey = FeedingFrenzy.ApiKey`.
- Routes are generated method routes under `api/feedingfrenzy.admin.business/google-operations/*`.
- The tool caller does not provide Google secrets, activate `gcloud`, call Google APIs directly, or set process-global credentials.

## Actions

- `ToProvisionRecaptchaKey(service, projectId, displayName, domainsCsv, integrationType, proofDirectoryPath)` -> `provision-recaptcha-key` with `ProjectID`, `DisplayName`, `DomainsCsv`, `IntegrationType`
- `ToListRecaptchaKeys(service, projectId)` -> `list-recaptcha-keys` with `ProjectID`
- `ToGetRecaptchaKey(service, keyId, projectId)` -> `get-recaptcha-key` with `ProjectID`, `KeyID`
- `ToAddRecaptchaDomain(service, keyId, domain, projectId)` -> `add-recaptcha-domain` with `ProjectID`, `KeyID`, `Domain`
- `ToRemoveRecaptchaDomain(service, keyId, domain, projectId)` -> `remove-recaptcha-domain` with `ProjectID`, `KeyID`, `Domain`
- `ToSetRecaptchaDomains(service, keyId, domains, projectId)` -> `set-recaptcha-domains` with `ProjectID`, `KeyID`, `DomainsCsv`
- `ToCreateRecaptchaKey(service, displayName, domains, integrationType, projectId)` -> `create-recaptcha-key` with `ProjectID`, `DisplayName`, `DomainsCsv`, `IntegrationType`

`proofDirectoryPath` is validated by the native `GoogleOperationsLocalProofHelper`, which writes a unique probe and persists sanitized preflight evidence before provisioning, then persists sanitized result evidence after the successful Feeding Frenzy response and returns the original JSON object augmented with `LocalProofEvidencePath`. The local path is not sent to Feeding Frenzy; FF creates server-owned proof artifacts.



