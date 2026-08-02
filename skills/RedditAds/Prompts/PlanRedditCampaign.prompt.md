# Plan Reddit Ads Campaign

## Safety Rules
- Use read-only actions freely for inventory and reporting.
- Do not activate campaigns, ad groups, or ads.
- Do not delete, archive, update status, or increase budget.
- Do not expose token values. If an error includes a diagnostic, summarize it without revealing credentials.
- All creation actions must set status to PAUSED. Do not plan activation or budget increases.

## Available RedditAds Primitives
- Access and account: `ToTestRedditAdsApiAccess`, `ToListRedditAdAccounts`, `ToGetRedditAdAccount`
- Inventory: `ToListRedditCampaigns`, `ToListRedditAdGroups`, `ToListRedditAds`, `ToListRedditAdCreatives`, `ToListRedditCustomAudiences`, `ToListRedditPixels`
- Reporting: `ToGenerateRedditAdsReport`
- Paused-only creation: `ToCreatePausedRedditCampaign`, `ToCreatePausedRedditAdGroup`, `ToCreatePausedRedditAd`

## Workflow
1. Confirm the requested `adAccountId` and campaign goal (e.g., traffic, awareness, conversions, lead generation).
2. Run `ToTestRedditAdsApiAccess` to confirm the token works.
3. Run `ToGetRedditAdAccount(adAccountId)` to confirm account status and currency.
4. Run inventory reads to understand existing campaigns, ad groups, ads, creatives, audiences, and pixels.
5. Run `ToGenerateRedditAdsReport(adAccountId, "campaign", "last_30d")` to understand recent performance.
6. Research Reddit targeting options relevant to the campaign goal:
   - Community (subreddit) targeting
   - Interest targeting
   - Keyword targeting in feed and conversation
   - Location targeting (country, region, metro)
   - Device targeting (desktop, mobile)
7. Draft a campaign plan with:
   - Campaign name, objective, and daily budget
   - Ad group structure with targeting strategy
   - Creative concepts (headline, body, CTA, destination URL)
   - Pixel/tracking setup if applicable
8. Present the plan for user approval before any creation actions.

## Output Shape
- `Account`: id, name, status, currency, timezone.
- `Goal`: campaign objective and target audience summary.
- `Existing Inventory`: relevant campaigns, ad groups, ads, creatives, audiences, pixels.
- `Recent Performance`: last 30 days summary if available.
- `Proposed Plan`: campaign, ad group, creative, and ad structure with PAUSED status.
- `Targeting Strategy`: communities, interests, keywords, locations, devices.
- `Budget`: daily budget per ad group (PAUSED only, no activation).
- `Risks`: policy, targeting, creative, tracking, or delivery concerns.
- `Next Steps`: safe creation actions to execute after user approval.
