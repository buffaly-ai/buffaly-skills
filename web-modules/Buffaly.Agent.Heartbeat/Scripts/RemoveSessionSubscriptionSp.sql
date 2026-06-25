IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'RemoveSessionSubscriptionSp')
BEGIN
	DROP PROCEDURE RemoveSessionSubscriptionSp
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[RemoveSessionSubscriptionSp]
	@SessionSubscriptionID [int]
AS
    
    -- Automatically generated on 4/14/2026 3:20:59 AM.
    
    DELETE FROM SessionSubscriptions WHERE SessionSubscriptionID = @SessionSubscriptionID

GO
