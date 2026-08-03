# RedditAds Skill

OpsAgent skill for Reddit Ads API v3 access checks, inventory reads, reporting, and paused-only creation backed by the stored Reddit Ads OAuth connection managed by the Reddit Ads web module.

## Scope
- Uses the stored Reddit Ads OAuth connection, not the obsolete `RedditAds.Token` UserSecrets key.
- Tests the current OAuth connection against the Reddit Ads API.
- Lists ad accounts visible to the OAuth connection.
- Gets one ad account by id.
- Lists campaigns, ad groups, ads, ad creatives, custom audiences, and pixels for one ad account.
- Gets one campaign, ad group, or ad by id.
- Generates performance reports with date range presets.
- Creates campaigns, ad groups, and ads only with PAUSED status so spend is not activated.
- Returns raw Reddit JSON responses for inspection.
- Provides trusted prompt workflows for audits, campaign planning, paused campaign creation, and optimization recommendations.

## Backend
- ProtoScript actions call `Buffaly.RedditAds.Web.RedditAdsWebService`, which resolves the stored OAuth token and delegates API calls to `RedditAdsApiFacade`.
- `Buffaly.RedditAds.Web` owns stored OAuth connection lookup, and `Buffaly.RedditAds` owns request URI building, HTTP execution, pagination handling, and redacted error diagnostics.
- Base URL: https://ads-api.reddit.com/api/v3
- Errors returned by the backend must never include the token value.

## Secret Handling
- The token value is resolved from the Reddit Ads web module's stored OAuth connection.
- Actions must never return or log the token value.
- Failures should report clear status without echoing request URLs that contain credentials.

## Read-Only Boundary
- This version is limited to access checks, ad account reads, campaign listing, inventory listing, object detail reads, reporting, and paused-only object creation.
- Do not add activation, delete, archive, budget increase, status update, or non-PAUSED mutation actions without explicit approval.

## Prompt Workflows
- `ToAuditRedditAdAccountSkill` loads `Skills/RedditAds/Prompts/AuditRedditAdAccount.prompt.md`.
- `ToPlanRedditCampaignSkill` loads `Skills/RedditAds/Prompts/PlanRedditCampaign.prompt.md`.
- `ToCreatePausedRedditCampaignWorkflowSkill` loads `Skills/RedditAds/Prompts/CreatePausedRedditCampaign.prompt.md`.
- `ToRecommendRedditAdsOptimizationsSkill` loads `Skills/RedditAds/Prompts/RecommendRedditAdsOptimizations.prompt.md`.
- Workflow prompts must keep token values hidden, use read-only actions freely, and stop before activation or budget increases.
