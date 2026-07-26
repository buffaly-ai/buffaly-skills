IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetSessionSubscriptionsSp')
BEGIN
	DROP PROCEDURE GetSessionSubscriptionsSp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetSessionSubscriptionsSp]
AS
    
    -- Automatically generated on 4/14/2026 3:20:59 AM.
    
    SELECT *
    FROM SessionSubscriptions WITH (NOLOCK) 
GO
