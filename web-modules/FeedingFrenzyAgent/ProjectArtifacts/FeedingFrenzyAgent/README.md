# FeedingFrenzyAgent ProtoScript Project

This directory is the durable source of truth for the Feeding Frenzy Buffaly/ProtoScript agent project.

Runtime deployments copy this project into Buffaly instances as needed, for example:

- `C:\inetpub\wwwroot\matt.buffaly.local\content\projects\FeedingFrenzyAgent`
- `C:\inetpub\wwwroot\staging.buffaly.local3\content\projects\FeedingFrenzyAgent`

Do not edit the runtime copies as the durable source. Runtime copies may contain environment-owned `lib` folders and configuration/secrets that are not stored here.
