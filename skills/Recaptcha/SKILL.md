# Recaptcha Skill

Provides Ops actions for managing Google reCAPTCHA Enterprise keys and allowed domains via the gcloud CLI.

## Prerequisites
- gcloud CLI installed and authenticated
- reCAPTCHA Enterprise API enabled on the target Google Cloud project
- Service account with `recaptchaenterprise.keys.get`, `.list`, `.update` IAM permissions

## Structure
- `index.pts` — All actions and helpers in a single file

## Actions

### Key Management
- `ToListRecaptchaKeys(projectId)` — List all reCAPTCHA Enterprise keys in a project
- `ToGetRecaptchaKey(keyId, projectId)` — Get full details of a key including allowed domains

### Domain Management
- `ToAddRecaptchaDomain(keyId, domain, projectId)` — Add a domain to a key's allowed list
- `ToRemoveRecaptchaDomain(keyId, domain, projectId)` — Remove a domain from a key's allowed list
- `ToSetRecaptchaDomains(keyId, domains, projectId)` — Replace the full domain list for a key

## Notes
- `projectId` defaults to the current gcloud project when empty
- Domains must be hostnames only (no scheme, path, port, query, or fragment)
- Subdomains of an allowed domain are automatically allowed by Google
- Max 250 domains per key
- Add/Remove operations use a read-modify-write pattern (GET key, modify domain array, PATCH back)
- All operations use `SystemOperations.RunPowerShellStreamingToRuntimeUi` with `ProcessStartInfo` for reliable gcloud execution
- Uses the same process execution pattern as the ClaudeCode skill
