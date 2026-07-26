IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'CopySessionSubscriptionSp')
BEGIN
	DROP PROCEDURE CopySessionSubscriptionSp
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[CopySessionSubscriptionSp]
	@SessionSubscriptionID [int]
AS
    
    -- Automatically generated on 4/14/2026 3:20:59 AM.
    
    INSERT INTO SessionSubscriptions
    (
            [SubscriptionIdentity], 
            [SessionID], 
            [SubscriberSessionKey], 
            [EventType], 
            [DeliveryMode], 
            [CallbackUrl], 
            [IsEnabled], 
            [ExpirationUtc], 
            [DateCreated], 
            [LastUpdated], 
            [Data]
    )
    SELECT
            [SubscriptionIdentity] + ' - Copy', 
            [SessionID], 
            [SubscriberSessionKey], 
            [EventType], 
            [DeliveryMode], 
            [CallbackUrl], 
            [IsEnabled], 
            [ExpirationUtc], 
            getdate(), 
            getdate(), 
            [Data]
    FROM [SessionSubscriptions]
    WHERE SessionSubscriptionID = @SessionSubscriptionID
    SELECT scope_identity() as SessionSubscriptionID

GO
