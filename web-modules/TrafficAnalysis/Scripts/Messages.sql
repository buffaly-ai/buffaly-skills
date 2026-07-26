

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE TABLE [dbo].[Messages](

	[MessageID] int  IDENTITY(1,1)   NOT NULL
	,

	[SessionID] int    NOT NULL
	,

	[SequenceNumber] int    NOT NULL
	,

	[Role] nvarchar(255)    NOT NULL
	,

	[Content] nvarchar(max)    NOT NULL
	,

	[ToolName] nvarchar(255)    NULL
	,

	[ToolArguments] nvarchar(max)    NULL
	,

	[CallID] nvarchar(255)    NULL
	,

	[DateCreated] datetime    NOT NULL
	,

	[LastUpdated] datetime    NOT NULL
	,

	[Data] nvarchar(max)    NULL
	,

	[IsCompacted] bit    NOT NULL
	,

	[CompactionEpoch] int    NULL
	,

	[MessageKey] nvarchar(255)    NOT NULL
	,

	[TurnID] nvarchar(255)    NULL
	,

	[ThreadKey] nvarchar(255)    NOT NULL
	,

	[CompactionEpochKey] nvarchar(255)    NULL
	,
	


CONSTRAINT [PK_Messages] PRIMARY KEY CLUSTERED 
(
	[MessageID] ASC
)
	WITH (PAD_INDEX  = OFF, 
	STATISTICS_NORECOMPUTE  = OFF, 
	IGNORE_DUP_KEY = OFF, 
	ALLOW_ROW_LOCKS  = ON, 
	ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]

GO




	

	

	
ALTER TABLE [dbo].[Messages] ADD  CONSTRAINT [DF_Messages_SequenceNumber]  DEFAULT (0) FOR [SequenceNumber]
GO	
	

	

	

	

	

	

	

	

	

	
ALTER TABLE [dbo].[Messages] ADD  CONSTRAINT [DF_Messages_IsCompacted]  DEFAULT (0) FOR [IsCompacted]
GO	
	

	

	

	

	



	

CREATE UNIQUE NONCLUSTERED INDEX [IX_Messages_MessageID] ON [dbo].[Messages] 
(
	[MessageID] ASC
)

WITH (STATISTICS_NORECOMPUTE  = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
GO

CREATE NONCLUSTERED INDEX [IX_Messages_MessageKey] ON [dbo].[Messages]
(
	[MessageKey] ASC
)
INCLUDE ([MessageID], [SessionID])
WITH (STATISTICS_NORECOMPUTE  = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
GO

CREATE NONCLUSTERED INDEX [IX_Messages_SessionID_MessageID] ON [dbo].[Messages]
(
	[SessionID] ASC,
	[MessageID] ASC
)
WITH (STATISTICS_NORECOMPUTE  = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
GO

CREATE NONCLUSTERED INDEX [IX_Messages_SessionID_TurnID] ON [dbo].[Messages]
(
	[SessionID] ASC,
	[TurnID] ASC
)
INCLUDE ([Role])
WITH (STATISTICS_NORECOMPUTE  = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
GO

CREATE NONCLUSTERED INDEX [IX_Messages_SessionID_MessageKey] ON [dbo].[Messages]
(
	[SessionID] ASC,
	[MessageKey] ASC
)
INCLUDE ([MessageID])
WITH (STATISTICS_NORECOMPUTE  = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
GO
