# Recaptcha Skill - index.pts

Owner-source reCAPTCHA ProtoScript skill.

- Uses `FeedingFrenzyWebPropertiesJsonWsService` binding and actual generated GoogleOperations routes/parameters from `C:\dev\FeedingFrenzy\FeedingFrenzy.Admin.Business\GoogleOperations.cs`.
- Preserves user-facing action names while adding the required service binding parameter.
- Validates type/domain/project values locally where previous actions did.
- Validates caller-local `proofDirectoryPath` before provisioning and does not send that path to Feeding Frenzy.
- Does not call gcloud, local Google secrets, or Google provider APIs directly.



