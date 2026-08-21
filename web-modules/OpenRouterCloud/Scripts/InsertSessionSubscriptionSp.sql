IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'InsertSessionSubscriptionSp')
BEGIN
	DROP PROCEDURE InsertSessionSubscriptionSp
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[InsertSessionSubscriptionSp]
	@SubscriptionIdentity [nvarchar](255),
	@SessionID [int],
	@SubscriberSessionKey [nvarchar](255),
	@EventType [nvarchar](255),
	@DeliveryMode [nvarchar](255),
	@CallbackUrl [nvarchar](512),
	@IsEnabled [bit],
	@ExpirationUtc [datetime],
	@Data [nvarchar](max)
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
    VALUES
    (
            @SubscriptionIdentity, 
            @SessionID, 
            @SubscriberSessionKey, 
            @EventType, 
            @DeliveryMode, 
            @CallbackUrl, 
            @IsEnabled, 
            @ExpirationUtc, 
            getdate(), 
            getdate(), 
            @Data
    )
    SELECT scope_identity() as SessionSubscriptionID

GO
