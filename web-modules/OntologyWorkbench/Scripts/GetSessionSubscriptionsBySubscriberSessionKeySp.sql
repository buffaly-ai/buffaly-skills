IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetSessionSubscriptionsBySubscriberSessionKeySp')
BEGIN
	DROP PROCEDURE GetSessionSubscriptionsBySubscriberSessionKeySp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetSessionSubscriptionsBySubscriberSessionKeySp]
	@SubscriberSessionKey [nvarchar](255)
AS
    
    -- Added manually on 4/14/2026 to support targeted subscriber-session subscription reads.
    
    SELECT *
    FROM SessionSubscriptions WITH (NOLOCK) 
    WHERE [SubscriberSessionKey] = @SubscriberSessionKey
GO
