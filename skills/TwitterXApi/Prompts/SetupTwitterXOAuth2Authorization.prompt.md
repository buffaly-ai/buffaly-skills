# Setup Twitter/X OAuth2 Authorization

Use this prompt workflow when the TwitterXApi skill needs OAuth 2.0 user-context authorization for actions such as `ToGetXMe`, `ToGetXHomeTimeline`, `ToGetXMyTweets`, `ToGetXMentions`, `ToPostXTweet`, or `ToPostXTweetWithMedia`.

This runbook intentionally uses only the final successful setup path: generate OAuth 2.0 access/refresh tokens from the X Developer Portal and save those token values into the database-backed `Twitter/X OAuth2 Feature` row. Do not use the manual PKCE callback-code exchange path unless the portal-generated token path is unavailable.

## Safety Rules

- Do not post to X unless the user explicitly asks for a live post.
- Do not echo access tokens, refresh tokens, client secrets, API secrets, or bearer tokens in final responses.
- Do not regenerate or revoke existing keys unless the user explicitly asks or the X portal requires it.
- Do not store tokens in source code.
- Store tokens only in the database feature row.
- Use staging first when validating changes.

## What The User Needs To Do In X

1. Open the X Developer Portal.
2. Select the existing app used by Buffaly/TwitterXApi. Do not create a new app unless the existing one cannot be edited.
3. Open the app settings. In the portal this is usually the gear icon or the `Settings` tab for the app.
4. Find `User authentication settings`.
5. Ensure these settings are saved:
   - App permissions: `Read and write`.
   - Type of App: `Web App, Automated App or Bot`.
   - Website URL: a valid website URL such as `https://buffaly.com`.
   - Callback URI / Redirect URL: keep the portal's existing callback if it already works. The successful portal-token flow does not require the agent callback listener.
   - Organization name: `Buffaly` or the user's preferred organization name.
6. Save the settings.
7. Go to `Keys and tokens` for the same app.
8. Locate the `OAuth 2.0` section. Do not use the OAuth 1.0a key section and do not use the app-only bearer token section.
9. Use the portal control labeled like `Generate an access token and refresh token for your own account`.
10. Copy the generated OAuth 2.0 `Access Token` and `Refresh Token` immediately. X displays these only once.
11. Provide the copied OAuth 2.0 access token and refresh token back to the agent for database storage, or ask for a local command if they do not want to paste tokens into chat.

## What The Agent Must Save

Update the staging/current database feature named exactly:

`Twitter/X OAuth2 Feature`

The feature settings JSON should include OAuth2-oriented fields only:

- `DisplayName`
- `ClientId`
- `ClientSecret`
- `BearerToken`
- `AccessToken`
- `RefreshToken`
- `ExpiresAtUtc`
- `Scopes`

Set:

- `AccessToken` to the portal-generated OAuth 2.0 access token.
- `RefreshToken` to the portal-generated OAuth 2.0 refresh token.
- `ExpiresAtUtc` to approximately two hours from the token generation time unless the portal/API provides a more exact expiry.
- `Scopes` to the returned scopes if known, otherwise keep the requested scope set: `tweet.read tweet.write users.read media.write offline.access`.

Do not overwrite `ClientId`, `ClientSecret`, or `BearerToken` unless the user explicitly provides updated OAuth2 values.

## Validation

After updating the database feature row:

1. Create a fresh staging runtime session so the deployed runtime naturally loads the updated feature settings.
2. Run `ToGetXMe.Execute()`.
3. Confirm it returns real X user JSON with fields like:
   - `data.id`
   - `data.username`
   - `data.name`
4. Report the returned public account fields only. Do not report token values.
5. Optionally run read-only actions such as `ToSearchXRecentPosts`, `ToGetXMyTweets`, or `ToGetXMentions`.
6. Do not run `ToPostXTweet` or `ToPostXTweetWithMedia` unless the user explicitly confirms a live post.

## Successful Evidence Pattern

A successful `ToGetXMe` validation looks like a JSON response containing the user's X account. For example, a validation can return user id `123456789`, username `exampleuser`, and name `Example User`.

## Common Mistakes

- Using OAuth 1.0a access token/secret instead of OAuth 2.0 access/refresh token.
- Using the app-only bearer token for `/2/users/me`; X rejects that with unsupported application-only authentication.
- Creating a new X app unnecessarily instead of editing the existing app's user authentication settings.
- Regenerating API keys accidentally.
- Failing to copy the portal-generated refresh token before closing the one-time display dialog.
- Pasting token values into source files instead of the database feature row.
