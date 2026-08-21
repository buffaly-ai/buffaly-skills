All development needs to be put into the source repository, the source of truth for the buffaly agent (the core agent, but not each skill, unless it is part of the solution already). 

`C:\dev\buffaly-ai\buffaly-development`

Skills are generally maintained in separate repo's outside of that parent. 

You may check the ontology for other repositories or look under that buffaly-ai folder. 

Staging validation target:
`C:\inetpub\wwwroot\staging.buffaly.local3`

Unless specifically requested do not work in:
`C:\inetpub\wwwroot\matt.buffaly.local`

Do not use matt-local compile/runtime output as validation. After dev-branch edits, deploy to staging and use a new staging session so staging reloads naturally.

Staging logs are in `c:/logs/Buffaly.Staging`

When asked to create a design document use the skill: ToCreateDesignDocument