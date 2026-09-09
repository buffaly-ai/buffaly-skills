

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE TABLE [dbo].[SessionSubscriptions](

	[SessionSubscriptionID] int  IDENTITY(1,1)   NOT NULL
	,

	[SubscriptionIdentity] nvarchar(255)    NOT NULL
	,

	[SessionID] int    NOT NULL
	,

	[SubscriberSessionKey] nvarchar(255)    NOT NULL
	,

	[EventType] nvarchar(255)    NOT NULL
	,

	[DeliveryMode] nvarchar(255)    NOT NULL
	,

	[CallbackUrl] nvarchar(512)    NULL
	,

	[IsEnabled] bit    NOT NULL
	,

	[ExpirationUtc] datetime    NULL
	,

	[DateCreated] datetime    NOT NULL
	,

	[LastUpdated] datetime    NOT NULL
	,

	[Data] nvarchar(max)    NULL
	,
	


CONSTRAINT [PK_SessionSubscriptions] PRIMARY KEY CLUSTERED 
(
	[SessionSubscriptionID] ASC
)
	WITH (PAD_INDEX  = OFF, 
	STATISTICS_NORECOMPUTE  = OFF, 
	IGNORE_DUP_KEY = OFF, 
	ALLOW_ROW_LOCKS  = ON, 
	ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]

GO




	

	

	

	

	

	

	

	
ALTER TABLE [dbo].[SessionSubscriptions] ADD  CONSTRAINT [DF_SessionSubscriptions_IsEnabled]  DEFAULT ((0)) FOR [IsEnabled]
GO	
	

	

	

	

	



	

CREATE UNIQUE NONCLUSTERED INDEX [IX_SessionSubscriptions_SessionSubscriptionID] ON [dbo].[SessionSubscriptions] 
(
	[SessionSubscriptionID] ASC
)

WITH (STATISTICS_NORECOMPUTE  = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
GO
	

	

CREATE UNIQUE NONCLUSTERED INDEX [IX_SessionSubscriptions_SubscriptionIdentity] ON [dbo].[SessionSubscriptions] 
(
	[SubscriptionIdentity] ASC
)

WITH (STATISTICS_NORECOMPUTE  = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
GO
	

	

	

	

	

	

	

	

	

	

	


		
		

-- Narrow lookup index; do not add a duplicate when an equivalent leading-key index already exists.
IF OBJECT_ID(N'dbo.SessionSubscriptions', N'U') IS NULL
	THROW 51001, 'SessionSubscriptions table is required.', 1;

IF NOT EXISTS (
	SELECT 1 FROM sys.indexes i
	JOIN sys.index_columns ic ON ic.object_id=i.object_id AND ic.index_id=i.index_id
	JOIN sys.columns c ON c.object_id=ic.object_id AND c.column_id=ic.column_id
	WHERE i.object_id=OBJECT_ID(N'dbo.SessionSubscriptions')
		AND i.type IN (1,2) AND i.is_disabled=0 AND i.is_hypothetical=0 AND i.has_filter=0
		AND ic.key_ordinal=1 AND c.name=N'SessionID'
)
BEGIN
	IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.SessionSubscriptions') AND name=N'IX_SessionSubscriptions_SessionID')
		THROW 51002, 'IX_SessionSubscriptions_SessionID exists but is not an enabled unfiltered SessionID-leading index.', 1;
	CREATE NONCLUSTERED INDEX IX_SessionSubscriptions_SessionID
		ON dbo.SessionSubscriptions(SessionID);
END;
GO
