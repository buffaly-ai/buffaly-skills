

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE TABLE [dbo].[Features](

	[FeatureID] int  IDENTITY(1,1)   NOT NULL
	,

	[FeatureName] nvarchar(255)    NOT NULL
	,

	[Version] nvarchar(255)    NULL
	,

	[IsEnabled] bit    NOT NULL
	,

	[SettingsAssembly] nvarchar(255)    NULL
	,

	[SettingsClass] nvarchar(255)    NOT NULL
	,

	[Settings] nvarchar(max)    NULL
	,

	[DateCreated] datetime    NOT NULL
	,

	[LastUpdated] datetime    NOT NULL
	,

	[Data] nvarchar(max)    NULL
	,
	


CONSTRAINT [PK_Features] PRIMARY KEY CLUSTERED 
(
	[FeatureID] ASC
)
	WITH (PAD_INDEX  = OFF, 
	STATISTICS_NORECOMPUTE  = OFF, 
	IGNORE_DUP_KEY = OFF, 
	ALLOW_ROW_LOCKS  = ON, 
	ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]

GO




	

	

	

	
ALTER TABLE [dbo].[Features] ADD  CONSTRAINT [DF_Features_IsEnabled]  DEFAULT (1) FOR [IsEnabled]
GO	
	

	

	

	

	

	

	



	

	

CREATE UNIQUE NONCLUSTERED INDEX [IX_Features_FeatureName] ON [dbo].[Features] 
(
	[FeatureName] ASC
)

WITH (STATISTICS_NORECOMPUTE  = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
GO
	

	

	

	

	

	

	

	

	


		
		