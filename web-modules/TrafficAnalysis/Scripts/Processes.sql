

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE TABLE [dbo].[Processes](

	[ProcessID] int  IDENTITY(1,1)   NOT NULL
	,

	[ProcessName] nvarchar(255)    NOT NULL
	,

	[Url] nvarchar(512)    NULL
	,

	[Action] nvarchar(255)    NULL
	,

	[RunData] nvarchar(max)    NULL
	,

	[IsRunning] bit    NOT NULL
	,

	[RunStarted] datetime    NULL
	,

	[RunEnded] datetime    NULL
	,

	[RunEvery] decimal(18,4)    NULL
	,

	[IsEnabled] bit    NOT NULL
	,

	[DateCreated] datetime    NOT NULL
	,

	[LastUpdated] datetime    NOT NULL
	,

	[MaximumRunTime] int    NULL
	,

	[IsTimedOut] bit    NOT NULL
	,
	


CONSTRAINT [PK_Processes] PRIMARY KEY CLUSTERED 
(
	[ProcessID] ASC
)
	WITH (PAD_INDEX  = OFF, 
	STATISTICS_NORECOMPUTE  = OFF, 
	IGNORE_DUP_KEY = OFF, 
	ALLOW_ROW_LOCKS  = ON, 
	ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]

GO




	

	

	

	

	

	
ALTER TABLE [dbo].[Processes] ADD  CONSTRAINT [DF_Processes_IsRunning]  DEFAULT (0) FOR [IsRunning]
GO	
	

	

	

	

	
ALTER TABLE [dbo].[Processes] ADD  CONSTRAINT [DF_Processes_IsEnabled]  DEFAULT (1) FOR [IsEnabled]
GO	
	

	

	

	

	
ALTER TABLE [dbo].[Processes] ADD  CONSTRAINT [DF_Processes_IsTimedOut]  DEFAULT (0) FOR [IsTimedOut]
GO	
	



	

	

CREATE UNIQUE NONCLUSTERED INDEX [IX_Processes_ProcessName] ON [dbo].[Processes] 
(
	[ProcessName] ASC
)

WITH (STATISTICS_NORECOMPUTE  = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
GO
	

	

	

	

	

	

	

	

	

	

	

	

	


		
		