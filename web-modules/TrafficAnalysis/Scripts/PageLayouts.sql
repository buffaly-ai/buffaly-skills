

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE TABLE [dbo].[PageLayouts](

	[PageLayoutID] int  IDENTITY(1,1)   NOT NULL
	,

	[Url] nvarchar(512)    NOT NULL
	,

	[Handler] nvarchar(512)    NOT NULL
	,

	[IsEnabled] bit    NOT NULL
	,

	[DateCreated] datetime    NOT NULL
	,

	[LastUpdated] datetime    NOT NULL
	,

	[PageTitle] nvarchar(255)    NULL
	,

	[SiteID] int    NULL
	,
	


CONSTRAINT [PK_PageLayouts] PRIMARY KEY CLUSTERED 
(
	[PageLayoutID] ASC
)
	WITH (PAD_INDEX  = OFF, 
	STATISTICS_NORECOMPUTE  = OFF, 
	IGNORE_DUP_KEY = OFF, 
	ALLOW_ROW_LOCKS  = ON, 
	ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]

GO




	

	

	

	

	

	

	

	



	

	

CREATE UNIQUE NONCLUSTERED INDEX [IX_PageLayouts_Url] ON [dbo].[PageLayouts] 
(
	[Url] ASC
)

WITH (STATISTICS_NORECOMPUTE  = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
GO
	

	

	

	

	

	

	


		
		