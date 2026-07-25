# LinkedIn Agent Actions

The LinkedIn skill exposes text/JSON inventory and exact-record tools plus shared registered-component display actions. Agents must list records, select an exact `postUrn` or `draftId`, validate that exact record, and only then call the corresponding display action. Launch state is built by `LinkedInInteractiveSiteConfiguration` and passed to `LaunchWebModuleComponent`; no dynamic value is concatenated into JavaScript.
