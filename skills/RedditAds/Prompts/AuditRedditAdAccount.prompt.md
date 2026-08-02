# Audit Reddit Ad Account

## Safety Rules
- Use read-only actions freely for inventory and reporting.
- Create actions create PAUSED objects only; do not use them during this audit unless the user explicitly changes the task.
- Do not activate campaigns, ad groups, or ads.
- Do not delete, archive, update status, or increase budget.
- Do not expose token values. If an error includes a diagnostic, summarize it without revealing credentials.

## Available RedditAds Primitives
- Access and account: `ToTestRedditAdsApiAccess`, `ToListRedditAdAccounts`, `ToGetRedditAdAccount`
- Inventory: `ToListRedditCampaigns`, `ToListRedditAdGroups`, `ToListRedditAds`, `ToListRedditAdCreatives`, `ToListRedditCustomAudiences`, `ToListRedditPixels`
- Reporting: `ToGenerateRedditAdsReport`
- Paused-only creation, not used unless the user explicitly requests setup: `ToCreatePausedRedditCampaign`, `ToCreatePausedRedditAdGroup`, `ToCreatePausedRedditAd`

## Workflow
1. Confirm the requested `adAccountId`. If it is missing, run `ToListRedditAdAccounts` and ask the user to choose one.
2. Run `ToTestRedditAdsApiAccess` to confirm the token works. Do not print the token or ask for it directly.
3. Run `ToGetRedditAdAccount(adAccountId)` and summarize account status, currency, and timezone.
4. Run inventory reads: `ToListRedditCampaigns`, `ToListRedditAdGroups`, `ToListRedditAds`, `ToListRedditAdCreatives`, `ToListRedditCustomAudiences`, and `ToListRedditPixels`.
5. Run `ToGenerateRedditAdsReport(adAccountId, "campaign", "last_7d")` and, when useful, repeat for `ad_group` and `ad`.
6. Identify readiness gaps: missing pixel activity, no audiences, no campaigns, paused-only inventory, or weak recent data.
7. Separate facts returned by tools from recommendations inferred from those facts.

## Output Shape
- `Account`: id, name, status, currency, timezone.
- `Readiness`: ready, partially ready, or blocked, with reasons.
- `Inventory`: counts and notable campaigns, ad groups, ads, creatives, audiences, pixels.
- `Performance`: last 7 days spend, impressions, clicks, CTR, CPC, CPM, and notable actions when available.
- `Risks`: tracking, audience, delivery, policy, data quality, or credential issues.
- `Next Steps`: prioritized safe recommendations. Do not include activation or budget-increase instructions.
