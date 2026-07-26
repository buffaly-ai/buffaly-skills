IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetSessionSubscriptionsSp_CountSp')
BEGIN
	DROP PROCEDURE GetSessionSubscriptionsSp_CountSp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetSessionSubscriptionsSp_CountSp]
	@Search [nvarchar](255)
AS


	SET NOCOUNT ON

	
	SELECT		COUNT(*) as Total
	FROM		(
				-- Automatically generated on 4/14/2026 3:20:59 AM.
    
    SELECT *
    FROM SessionSubscriptions WITH (NOLOCK) 
				) sub
	where		
					[SessionSubscriptionID] like '%' + @Search + '%' or
					[SubscriptionIdentity] like '%' + @Search + '%' or
					[SubscriberSessionKey] like '%' + @Search + '%' or
					[EventType] like '%' + @Search + '%' or
					[DeliveryMode] like '%' + @Search + '%' or
					[CallbackUrl] like '%' + @Search + '%' 
		
GO
