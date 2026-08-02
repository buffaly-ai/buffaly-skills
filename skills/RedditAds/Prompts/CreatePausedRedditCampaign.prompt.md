# Create Paused Reddit Campaign

## Safety Rules
- All creation actions must set status to PAUSED. Never activate campaigns, ad groups, or ads.
- Do not delete, archive, update status, or increase budget.
- Do not expose token values. If an error includes a diagnostic, summarize it without revealing credentials.
- Stop after creating the paused structure. Do not plan or execute activation.

## Available RedditAds Primitives
- Access and account: `ToTestRedditAdsApiAccess`, `ToListRedditAdAccounts`, `ToGetRedditAdAccount`
- Inventory: `ToListRedditCampaigns`, `ToListRedditAdGroups`, `ToListRedditAds`, `ToListRedditAdCreatives`, `ToListRedditCustomAudiences`, `ToListRedditPixels`
- Paused-only creation: `ToCreatePausedRedditCampaign`, `ToCreatePausedRedditAdGroup`, `ToCreatePausedRedditAd`

## Workflow
1. Confirm the approved campaign plan with the user, including:
   - adAccountId
   - Campaign name, objective, and daily budget (in microcents)
   - Ad group name, campaign id, daily budget, and targeting JSON
   - Ad name, ad group id, and creative id
2. Run `ToTestRedditAdsApiAccess` to confirm the token works.
3. Create the paused campaign:
   - Call `ToCreatePausedRedditCampaign(adAccountId, name, objective, budgetInMicrocents)`
   - Extract the campaign id from the response.
4. Create the paused ad group:
   - Call `ToCreatePausedRedditAdGroup(adAccountId, name, campaignId, dailyBudgetInMicrocents, targetingJson)`
   - Extract the ad group id from the response.
5. If a creative needs to be created, note that creative creation is not yet supported in v1. Use an existing creative id if available.
6. Create the paused ad:
   - Call `ToCreatePausedRedditAd(adAccountId, name, adGroupId, creativeId)`
   - Extract the ad id from the response.
7. Verify the created objects by reading them back:
   - `ToGetRedditCampaign(campaignId)`
   - `ToGetRedditAdGroup(adGroupId)`
   - `ToGetRedditAd(adId)`
8. Confirm all objects have status PAUSED.

## Output Shape
- `Campaign`: id, name, objective, status (must be PAUSED).
- `Ad Group`: id, name, campaign id, status (must be PAUSED).
- `Ad`: id, name, ad group id, creative id, status (must be PAUSED).
- `Verification`: read-back confirmation of all created objects.
- `Next Steps`: safe recommendations. Do not include activation or budget-increase instructions.
