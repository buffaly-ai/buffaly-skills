IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetSessionSubscriptionBySubscriptionIdentitySp')
BEGIN
	DROP PROCEDURE GetSessionSubscriptionBySubscriptionIdentitySp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetSessionSubscriptionBySubscriptionIdentitySp]
	@SubscriptionIdentity [nvarchar](255)
AS
    
    -- Automatically generated on 4/14/2026 3:20:59 AM.
    
    SELECT *
    FROM SessionSubscriptions WITH (NOLOCK) 
    WHERE [SubscriptionIdentity] = @SubscriptionIdentity
GO
