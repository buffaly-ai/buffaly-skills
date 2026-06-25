

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE TABLE [dbo].[SessionArtifacts](

	[SessionArtifactID] int  IDENTITY(1,1)   NOT NULL
	,

	[SessionID] int    NOT NULL
	,

	[SourceMessageID] int    NULL
	,

	[ArtifactType] nvarchar(255)    NOT NULL
	,

	[ArtifactName] nvarchar(255)    NOT NULL
	,

	[FilePath] nvarchar(255)    NULL
	,

	[Summary] nvarchar(max)    NULL
	,

	[ContentData] nvarchar(max)    NULL
	,

	[MimeType] nvarchar(255)    NULL
	,

	[DateCreated] datetime    NOT NULL
	,

	[LastUpdated] datetime    NOT NULL
	,

	[Data] nvarchar(max)    NULL
	,
	


CONSTRAINT [PK_SessionArtifacts] PRIMARY KEY CLUSTERED 
(
	[SessionArtifactID] ASC
)
	WITH (PAD_INDEX  = OFF, 
	STATISTICS_NORECOMPUTE  = OFF, 
	IGNORE_DUP_KEY = OFF, 
	ALLOW_ROW_LOCKS  = ON, 
	ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]

GO




	

	

	

	

	

	

	

	

	

	

	

	



	

CREATE UNIQUE NONCLUSTERED INDEX [IX_SessionArtifacts_SessionArtifactID] ON [dbo].[SessionArtifacts] 
(
	[SessionArtifactID] ASC
)

WITH (STATISTICS_NORECOMPUTE  = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
GO
	

	

	

	

	

	

	

	

	

	

	

	


		
		