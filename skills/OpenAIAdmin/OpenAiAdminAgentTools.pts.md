# OpenAiAdminAgentTools.pts

Six thin ProtoScript wrappers over the public static `OpenAiAdminAgentTools` C# facade plus two read-only interactive-site launch actions. Each inventory action preserves the facade's string JSON return value and performs no ProtoScript-side validation, authentication, HTTP calls, or output reshaping.

Date-based actions pass inclusive `yyyy-MM-dd` values directly to C#. Governance and project actions require no parameters. All methods are read-only and use the server-side `OpenAI.AdminApiKey` boundary.

`ToViewOpenAIUsageInteractiveSite` and `ToViewOpenAIProjectUsageInteractiveSite` use the common registered Web Module component launcher. Their JSON state is validated and serialized by `OpenAiAdminInteractiveSiteConfiguration`; project scope requires an exact ID returned by `ToListOpenAIProjects`. The component uses only existing read endpoints and never exposes mutation controls or secrets.
