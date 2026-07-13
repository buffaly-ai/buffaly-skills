

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
	

	

	

	

	

	

	

	

	

	

	


		
		
