# Recaptcha Skill - index.pts

## Purpose
Manages Google reCAPTCHA Enterprise keys and allowed domains via gcloud CLI.

## Skill Entity
- `RecaptchaSkill` — SkillEntity with ActionRoot `RecaptchaSkillAction`

## Action Root
- `RecaptchaSkillAction` — Base OpsAction for all reCAPTCHA management tools

## Shared Helpers
- `ToRecaptchaDefaultProjectId()` — Resolves current gcloud project from config
- `ToRecaptchaCleanOutput(result)` — Strips "Exit code: N" suffix from RunPowerShellStreamingToRuntimeUi output
- `ToRecaptchaEscapeSingleQuoted(value)` — Escapes single quotes for PowerShell strings
- `ToRecaptchaRunGcloud(args, timeout, label)` — Executes gcloud via ProcessStartInfo (same pattern as ClaudeCode skill)
- `ToRecaptchaGetDomains(keyId, projectId)` — Gets allowed domains via gcloud --format=value() (semicolon-separated, normalized to commas)

## Actions
- `ToListRecaptchaKeys(projectId)` — Lists all reCAPTCHA Enterprise keys via `gcloud recaptcha keys list --format=json`
- `ToGetRecaptchaKey(keyId, projectId)` — Gets key details via `gcloud recaptcha keys describe --format=json`
- `ToAddRecaptchaDomain(keyId, domain, projectId)` — Read-modify-write in PowerShell: describe key, append domain, update
- `ToRemoveRecaptchaDomain(keyId, domain, projectId)` — Read-modify-write in PowerShell: describe key, filter out domain, update
- `ToSetRecaptchaDomains(keyId, domains, projectId)` — Replaces full domain list via `gcloud recaptcha keys update --web --domains=`

## Pattern
- Uses `SystemOperations.RunPowerShellStreamingToRuntimeUi` with `ProcessStartInfo` for gcloud CLI execution
- No DLL facade — gcloud CLI is the integration boundary
- Stateless — each action calls gcloud independently
- Authentication inherited from gcloud CLI's active account configuration
- Add/Remove domain operations use inline PowerShell for read-modify-write (avoids ProtoScript array/loop limitations)
- Domain listing uses `--format=value()` to avoid JSON parsing in ProtoScript
- 2026-07-15: Replaced interactive gcloud user auth with service-account auth. Added ToRecaptchaEnsureServiceAccount() helper that activates recaptcha-enterprise@intelligence-fac-1731098258626.iam.gserviceaccount.com from C:\drop\recaptcha-enterprise-sa.json. Granted roles/recaptchaenterprise.admin to the service account. Default project changed to intelligence-fac-1731098258626. All actions now call ToRecaptchaEnsureServiceAccount() before gcloud commands.
