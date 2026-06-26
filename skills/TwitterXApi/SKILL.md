# TwitterXApi Skill

This skill exposes X (Twitter) API access through `XApiClient.Core.dll` from `Buffaly.XAPI`.

## Purpose
- Run focused X API queries from OpsAgent ProtoScript actions.
- Keep integration logic in a skill-local DLL bundle under `Skills/TwitterXApi/lib`.

## Exposed Action
- `ToSearchXRecentPosts.Execute(query, maxResults, paginationToken)`
- `ToGetXMe.Execute()`
- `ToGetXHomeTimeline.Execute(maxResults, paginationToken)`
- `ToGetXMyTweets.Execute(maxResults, paginationToken)`
- `ToGetXMentions.Execute(maxResults, paginationToken)`
- `ToPostXTweet.Execute(text)`
- `ToPostXTweetWithMedia.Execute(text, mediaFilePath)`

## Inputs
- `query`: X recent search query string.
- `maxResults`: number of rows to request (1-100, normalized in action).
- `paginationToken`: optional token for paged follow-up calls.
- `text`: tweet body for posting.
- `mediaFilePath`: local image/video path for media tweet posting.
- Timeline/mentions actions automatically resolve current user id from `ToGetXMe` internally.

## Auth Behavior
- All actions use OAuth 2.0 user-context bearer authorization from the database-backed `Twitter/X OAuth2 Feature` row.
- `AccessToken` is preferred when present; `BearerToken` remains a compatibility bearer access-token field for the XApiClient credential model.
- OAuth 1.0a consumer secret and access-token secret fields are not used.

## Output
- Raw X API JSON response (`XResponse<T>.RawJson`).
