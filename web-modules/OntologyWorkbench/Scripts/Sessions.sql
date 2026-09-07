

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE TABLE [dbo].[Sessions](

	[SessionID] int  IDENTITY(1,1)   NOT NULL
	,

	[SessionKey] nvarchar(255)    NOT NULL
	,

	[AgentName] nvarchar(255)    NOT NULL
	,

	[ProjectName] nvarchar(255)    NULL
	,

	[ProjectFilePath] nvarchar(255)    NULL
	,

	[Provider] nvarchar(255)    NOT NULL
	,

	[ModelName] nvarchar(255)    NOT NULL
	,

	[ReasoningLevel] nvarchar(255)    NULL
	,

	[PromptContext] nvarchar(max)    NULL
	,

	[DateCreated] datetime    NOT NULL
	,

	[LastUpdated] datetime    NOT NULL
	,

	[Data] nvarchar(max)    NULL
	,

	[SessionName] nvarchar(255)    NULL
	,

	[ParentSessionID] int    NULL
	,

	[IsArchived] bit    NOT NULL
	,
	


CONSTRAINT [PK_Sessions] PRIMARY KEY CLUSTERED 
(
	[SessionID] ASC
)
	WITH (PAD_INDEX  = OFF, 
	STATISTICS_NORECOMPUTE  = OFF, 
	IGNORE_DUP_KEY = OFF, 
	ALLOW_ROW_LOCKS  = ON, 
	ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]

GO




	

	

	

	

	

	

	

	

	

	

	

	

	

	

	
ALTER TABLE [dbo].[Sessions] ADD  CONSTRAINT [DF_Sessions_IsArchived]  DEFAULT (0) FOR [IsArchived]
GO	
	



	

CREATE UNIQUE NONCLUSTERED INDEX [IX_Sessions_SessionID] ON [dbo].[Sessions] 
(
	[SessionID] ASC
)

WITH (STATISTICS_NORECOMPUTE  = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
GO
	

	

CREATE UNIQUE NONCLUSTERED INDEX [IX_Sessions_SessionKey] ON [dbo].[Sessions] 
(
	[SessionKey] ASC
)

WITH (STATISTICS_NORECOMPUTE  = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
GO
	

	

	

	

	

	

	

	

	

	

	

	

	

	


		
		