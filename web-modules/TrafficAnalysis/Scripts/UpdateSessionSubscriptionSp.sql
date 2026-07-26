IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'UpdateSessionSubscriptionSp')
BEGIN
	DROP PROCEDURE UpdateSessionSubscriptionSp
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[UpdateSessionSubscriptionSp]
	@SessionSubscriptionID [int],
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
    
    UPDATE SessionSubscriptions SET 
            [SubscriptionIdentity] = @SubscriptionIdentity, 
            [SessionID] = @SessionID, 
            [SubscriberSessionKey] = @SubscriberSessionKey, 
            [EventType] = @EventType, 
            [DeliveryMode] = @DeliveryMode, 
            [CallbackUrl] = @CallbackUrl, 
            [IsEnabled] = @IsEnabled, 
            [ExpirationUtc] = @ExpirationUtc, 
            [LastUpdated] = getdate(), 
            [Data] = @Data
    WHERE SessionSubscriptionID = @SessionSubscriptionID

GO
