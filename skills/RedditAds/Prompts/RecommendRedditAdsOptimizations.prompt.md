# Recommend Reddit Ads Optimizations

## Safety Rules
- Use read-only actions freely for inventory and reporting.
- Do not activate campaigns, ad groups, or ads.
- Do not delete, archive, update status, or increase budget.
- Do not expose token values. If an error includes a diagnostic, summarize it without revealing credentials.
- Recommendations must not include activation, budget increases, or status changes.

## Available RedditAds Primitives
- Access and account: `ToTestRedditAdsApiAccess`, `ToListRedditAdAccounts`, `ToGetRedditAdAccount`
- Inventory: `ToListRedditCampaigns`, `ToListRedditAdGroups`, `ToListRedditAds`, `ToListRedditAdCreatives`, `ToListRedditCustomAudiences`, `ToListRedditPixels`
- Reporting: `ToGenerateRedditAdsReport`
- Object detail: `ToGetRedditCampaign`, `ToGetRedditAdGroup`, `ToGetRedditAd`

## Workflow
1. Confirm the requested `adAccountId`. If it is missing, run `ToListRedditAdAccounts` and ask the user to choose one.
2. Run `ToTestRedditAdsApiAccess` to confirm the token works.
3. Run inventory reads: `ToListRedditCampaigns`, `ToListRedditAdGroups`, `ToListRedditAds`, `ToListRedditAdCreatives`.
4. Run performance reports for the last 30 days:
   - `ToGenerateRedditAdsReport(adAccountId, "campaign", "last_30d")`
   - `ToGenerateRedditAdsReport(adAccountId, "ad_group", "last_30d")`
   - `ToGenerateRedditAdsReport(adAccountId, "ad", "last_30d")`
5. Compare performance across campaigns, ad groups, and ads:
   - Identify top and bottom performers by CTR, CPC, CPM, spend, and conversions.
   - Look for underperforming ad groups with high spend and low CTR.
   - Look for high-performing creatives that could be replicated.
   - Check for paused campaigns that may have historical performance data.
6. Analyze targeting effectiveness:
   - Compare ad groups with different community/interest/keyword targeting.
   - Identify targeting segments with high CTR or low CPC.
7. Generate safe optimization recommendations:
   - Creative refresh suggestions for underperforming ads.
   - Targeting adjustments (add/remove communities, interests, keywords).
   - Budget reallocation suggestions (move budget from underperforming to performing ad groups, without increasing total).
   - New ad group or creative test ideas (PAUSED only).

## Output Shape
- `Account`: id, name, status.
- `Performance Summary`: last 30 days spend, impressions, clicks, CTR, CPC, CPM.
- `Top Performers`: best campaigns, ad groups, and ads by key metrics.
- `Underperformers`: worst campaigns, ad groups, and ads with reasons.
- `Targeting Insights`: community, interest, keyword, and device performance patterns.
- `Recommendations`: prioritized safe optimization steps. Do not include activation or budget-increase instructions.
- `Risks`: policy, delivery, tracking, or data quality concerns.
