IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetSessionSubscriptionsBySessionIDSp')
BEGIN
	DROP PROCEDURE GetSessionSubscriptionsBySessionIDSp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetSessionSubscriptionsBySessionIDSp]
	@SessionID [int]
AS
    
    -- Automatically generated on 4/14/2026 3:20:59 AM.
    
    SELECT *
    FROM SessionSubscriptions WITH (NOLOCK) 
    WHERE [SessionID] = @SessionID
GO
