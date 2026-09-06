# RedditAds ProtoScript Actions

Thin ProtoScript wrappers over the owning `Buffaly.RedditAds.Web.RedditAdsWebService` and `Buffaly.RedditAds.RedditAdsApiFacade` contracts.

The skill exposes OAuth access checks, Reddit Ads inventory reads, report generation, and paused-only campaign/ad-group/ad creation. It never returns stored OAuth credentials and has no activation, deletion, archival, or budget-increase action.

`ToPublishRedditNativeTextDraftPaused` is the guarded publication boundary for reviewed local creative drafts. It requires an explicit `confirmPaused` value, an account-owned profile, and an already-PAUSED ad group. The C# service preserves the draft's exact title and `PostCopy` in a Reddit structured `TEXT` post and requires the article URL inside that body because Reddit free-form ads reject ad-level `click_url`. It creates the ad without `click_url`, asserts its configured status is `PAUSED`, and writes progress/final receipts that prevent duplicate posts and ads across retries. Validation, polling, payload construction, ownership checks, and duplicate handling remain in C#; the ProtoScript action is intentionally a thin pass-through.
