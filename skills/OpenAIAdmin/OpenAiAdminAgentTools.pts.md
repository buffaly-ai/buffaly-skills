# OpenAiAdminAgentTools.pts

Six thin ProtoScript wrappers over the public static `OpenAiAdminAgentTools` C# facade. Each action preserves the facade's string JSON return value and performs no ProtoScript-side validation, authentication, HTTP calls, or output reshaping.

Date-based actions pass inclusive `yyyy-MM-dd` values directly to C#. Governance and project actions require no parameters. All methods are read-only and use the server-side `OpenAI.AdminApiKey` boundary.
